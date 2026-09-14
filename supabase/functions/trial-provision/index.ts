import { createClient } from 'npm:@supabase/supabase-js@2'

type Json = Record<string, unknown>
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const url = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

function response(body: Json, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
function text(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function positive(value: unknown, fallback: number) {
  const result = Number(value)
  return Number.isInteger(result) && result > 0 ? result : fallback
}

async function caller(request: Request) {
  const authorization = request.headers.get('Authorization') || ''
  const sessionClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await sessionClient.auth.getUser()
  if (error || !data.user) throw new Error('Authentication required')
  const { data: profile } = await admin.from('user_profiles').select('is_platform_admin').eq('id', data.user.id).maybeSingle()
  const isSuperAdmin = data.user.app_metadata?.platform_admin === true || profile?.is_platform_admin === true
  if (!isSuperAdmin) {
    const { data: assignment } = await admin.from('platform_user_roles').select('user_id').eq('user_id', data.user.id).maybeSingle()
    if (!assignment) throw new Error('Platform administrator access is required')
  }
  return { ...data.user, isSuperAdmin }
}

async function audit(actorId: string, action: string, organizationId?: string, details: Json = {}) {
  await admin.from('saas_admin_audit_logs').insert({ actor_id: actorId, action, organization_id: organizationId || null, details }).then(() => undefined)
}

async function membersFor(organizationId: string) {
  const { data, error } = await admin.from('organization_members').select('id,user_id,employee_id,status').eq('organization_id', organizationId)
  if (error) throw error
  const members = data || []
  const ids = members.map((row: any) => row.user_id)
  const { data: profiles } = ids.length ? await admin.from('user_profiles').select('id,full_name,phone').in('id', ids) : { data: [] }
  const profile = new Map((profiles || []).map((row: any) => [row.id, row]))
  const { data: roleRows } = members.length ? await admin.from('member_roles').select('member_id,roles!inner(code)').in('member_id', members.map((row: any) => row.id)) : { data: [] }
  const orgAdmins = new Set((roleRows || []).filter((row: any) => row.roles?.code === 'ORG_ADMIN').map((row: any) => row.member_id))
  const users = await Promise.all(members.filter((row: any) => orgAdmins.has(row.id)).map(async (row: any) => {
    const found = await admin.auth.admin.getUserById(row.user_id)
    return { user_id: row.user_id, email: found.data.user?.email || '', full_name: profile.get(row.user_id)?.full_name || '', phone: profile.get(row.user_id)?.phone || '', status: row.status, employee_id: row.employee_id }
  }))
  return { members, admins: users }
}

async function snapshot() {
  const { data: accounts, error } = await admin.from('saas_accounts').select('id,organization_id,status,account_type,plan_code,trial_started_at,trial_ends_at,converted_at,disabled_at,notes,trial_employee_quota,user_quota,organizations(id,name,code,status,created_at)').order('created_at', { ascending: false })
  if (error) throw error
  const hydrated = await Promise.all((accounts || []).map(async (account: any) => {
    const [memberInfo, moduleResult, employeeResult] = await Promise.all([
      membersFor(account.organization_id),
      admin.from('organization_modules').select('module_code').eq('organization_id', account.organization_id).eq('enabled', true),
      admin.from('employees').select('id', { count: 'exact', head: true }).eq('organization_id', account.organization_id),
    ])
    return { ...account, enabled_modules: (moduleResult.data || []).map((row: any) => row.module_code), customer_admins: memberInfo.admins, usage: { members: memberInfo.members.filter((row: any) => ['ACTIVE', 'INVITED'].includes(row.status)).length, employees: employeeResult.count || 0 } }
  }))
  const [{ data: modules }, { data: auditRows }, authUsers] = await Promise.all([
    admin.from('saas_modules').select('module_code,module_name,description,is_active,is_available_for_trial').order('sort_order'),
    admin.from('saas_admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  const platformIds = (authUsers.data.users || []).filter((user) => user.app_metadata?.platform_user === true || user.app_metadata?.platform_admin === true).map((user) => user.id)
  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    platformIds.length ? admin.from('user_profiles').select('id,full_name,phone,is_platform_admin').in('id', platformIds) : Promise.resolve({ data: [] }),
    platformIds.length ? admin.from('platform_user_roles').select('user_id,platform_roles(code,name)').in('user_id', platformIds) : Promise.resolve({ data: [] }),
  ])
  const profileMap = new Map((profiles || []).map((row: any) => [row.id, row]))
  const roleMap = new Map((assignments || []).map((row: any) => [row.user_id, row.platform_roles]))
  const users = (authUsers.data.users || []).filter((user) => platformIds.includes(user.id)).map((user) => ({
    id: user.id, email: user.email, full_name: profileMap.get(user.id)?.full_name || user.user_metadata?.full_name || '', phone: profileMap.get(user.id)?.phone || user.user_metadata?.phone || '', status: user.banned_until ? 'DISABLED' : 'ACTIVE', is_platform_admin: profileMap.get(user.id)?.is_platform_admin === true || user.app_metadata?.platform_admin === true, role_code: roleMap.get(user.id)?.code || (user.app_metadata?.platform_admin ? 'SUPER_ADMIN' : 'SAAS_ADMIN'), role_name: roleMap.get(user.id)?.name || (user.app_metadata?.platform_admin ? 'Super Admin' : 'SaaS Admin'),
  }))
  return { accounts: hydrated, modules: modules || [], audit: auditRows || [], users }
}

async function requireOrganization(value: unknown) {
  const id = text(value)
  if (!id) throw new Error('Organization is required')
  const { data, error } = await admin.from('saas_accounts').select('organization_id,status').eq('organization_id', id).maybeSingle()
  if (error || !data) throw new Error('Customer tenant was not found')
  return id
}

async function setModules(organizationId: string, modules: unknown) {
  const codes = Array.isArray(modules) ? modules.filter((code): code is string => typeof code === 'string') : []
  const { data: catalog } = await admin.from('saas_modules').select('module_code').in('module_code', codes)
  if ((catalog || []).length !== codes.length) throw new Error('One or more selected modules are not valid')
  const { error: disableError } = await admin.from('organization_modules').update({ enabled: false }).eq('organization_id', organizationId)
  if (disableError) throw disableError
  if (codes.length) {
    const { error } = await admin.from('organization_modules').upsert(codes.map((module_code) => ({ organization_id: organizationId, module_code, enabled: true, enabled_at: new Date().toISOString() })), { onConflict: 'organization_id,module_code' })
    if (error) throw error
  }
}

async function createCustomerAdmin(organizationId: string, body: Json) {
  const email = text(body.email).toLowerCase(), fullName = text(body.full_name), phone = text(body.phone)
  if (!email || !fullName) throw new Error('Full name and email are required')
  const invite = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName, phone }, redirectTo: `${Deno.env.get('SITE_URL') || 'https://app.humanest.co.in'}/auth/confirm?next=/hrms` })
  if (invite.error || !invite.data.user) throw new Error(invite.error?.message || 'Unable to invite customer administrator')
  const userId = invite.data.user.id
  const { error: profileError } = await admin.from('user_profiles').upsert({ id: userId, full_name: fullName, phone, is_platform_admin: false })
  if (profileError) { await admin.auth.admin.deleteUser(userId); throw profileError }
  const { data: member, error: memberError } = await admin.from('organization_members').insert({ organization_id: organizationId, user_id: userId, status: 'INVITED', joined_at: new Date().toISOString() }).select('id').single()
  if (memberError || !member) { await admin.auth.admin.deleteUser(userId); throw new Error(memberError?.message || 'Unable to add customer membership') }
  const { data: role, error: roleError } = await admin.from('roles').select('id').eq('organization_id', organizationId).eq('code', 'ORG_ADMIN').single()
  if (roleError || !role) throw new Error('The organization administrator role is missing')
  const { error: roleLinkError } = await admin.from('member_roles').insert({ member_id: member.id, role_id: role.id })
  if (roleLinkError) throw roleLinkError
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const actor = await caller(request)
    const body = await request.json() as Json
    const action = text(body.action)
    if (action === 'platform_snapshot' || action === 'list_platform_users') return response(await snapshot())
    // Mutating tenant and identity data is deliberately limited to super admins.
    // Read-only platform users can still load the dashboard and audit information.
    if (!actor.isSuperAdmin) throw new Error('Super Admin access is required for this action')
    const organizationId = action.includes('platform_user') || action === 'set_platform_role' ? '' : await requireOrganization(body.organization_id)
    if (action === 'extend_trial') {
      const { data, error } = await admin.from('saas_accounts').select('trial_ends_at').eq('organization_id', organizationId).single(); if (error) throw error
      const base = Math.max(Date.now(), new Date(data.trial_ends_at || Date.now()).getTime())
      const { error: updateError } = await admin.from('saas_accounts').update({ status: 'TRIAL', trial_ends_at: new Date(base + positive(body.trial_days, 7) * 86400000).toISOString(), disabled_at: null }).eq('organization_id', organizationId); if (updateError) throw updateError
      await admin.from('organizations').update({ status: 'TRIAL' }).eq('id', organizationId); await audit(actor.id, 'TRIAL_EXTENDED', organizationId, { trial_days: positive(body.trial_days, 7) }); return response({ message: 'Trial extended successfully.' })
    }
    if (action === 'disable' || action === 'enable') {
      const status = action === 'disable' ? 'DISABLED' : 'ACTIVE'; const now = new Date().toISOString()
      const { error } = await admin.from('saas_accounts').update({ status, disabled_at: action === 'disable' ? now : null }).eq('organization_id', organizationId); if (error) throw error
      await admin.from('organizations').update({ status }).eq('id', organizationId); await audit(actor.id, action === 'disable' ? 'TENANT_SUSPENDED' : 'TENANT_ENABLED', organizationId); return response({ message: action === 'disable' ? 'Tenant suspended successfully.' : 'Tenant enabled successfully.' })
    }
    if (action === 'set_modules') { await setModules(organizationId, body.modules); await audit(actor.id, 'MODULES_UPDATED', organizationId, { modules: body.modules }); return response({ message: 'Module configuration saved successfully.' }) }
    if (action === 'set_license') {
      const employees = positive(body.employee_quota, 25), users = positive(body.user_quota, employees)
      const { error } = await admin.from('saas_accounts').update({ trial_employee_quota: employees, user_quota: users }).eq('organization_id', organizationId); if (error) throw error
      await admin.from('saas_license_quotas').upsert({ organization_id: organizationId, purchased_employee_quota: employees, overage_employee_quota: Math.max(0, Number(body.overage_quota) || 0) }, { onConflict: 'organization_id' }); await audit(actor.id, 'LICENSE_UPDATED', organizationId, { employees, users }); return response({ message: 'Employee and user limits saved successfully.' })
    }
    if (action === 'convert') { await setModules(organizationId, body.modules); const { error } = await admin.from('saas_accounts').update({ status: 'ACTIVE', account_type: 'CUSTOMER', plan_code: text(body.plan_code) || 'CUSTOM', converted_at: new Date().toISOString() }).eq('organization_id', organizationId); if (error) throw error; await admin.from('organizations').update({ status: 'ACTIVE' }).eq('id', organizationId); await audit(actor.id, 'TRIAL_CONVERTED', organizationId); return response({ message: 'Tenant converted to an active customer.' }) }
    if (action === 'create_customer_admin') { await createCustomerAdmin(organizationId, body); await audit(actor.id, 'CUSTOMER_ADMIN_CREATED', organizationId, { email: body.email }); return response({ message: 'Customer administrator invited successfully.' }) }
    if (action === 'update_customer_admin') { const userId = text(body.user_id); if (!userId) throw new Error('Customer administrator is required'); const { error } = await admin.from('user_profiles').update({ full_name: text(body.full_name), phone: text(body.phone) }).eq('id', userId); if (error) throw error; await admin.auth.admin.updateUserById(userId, { user_metadata: { full_name: text(body.full_name), phone: text(body.phone) } }); await audit(actor.id, 'CUSTOMER_ADMIN_UPDATED', organizationId, { user_id: userId }); return response({ message: 'Customer administrator updated successfully.' }) }
    if (action === 'delete_customer_admin') { const userId = text(body.user_id); const info = await membersFor(organizationId); if (info.admins.filter((row: any) => row.status === 'ACTIVE').length <= 1) throw new Error('At least one active customer administrator must remain'); const membership = info.members.find((row: any) => row.user_id === userId); if (!membership) throw new Error('Customer administrator was not found'); await admin.from('organization_members').delete().eq('id', membership.id); const deleted = await admin.auth.admin.deleteUser(userId); if (deleted.error) throw deleted.error; await audit(actor.id, 'CUSTOMER_ADMIN_DELETED', organizationId, { user_id: userId }); return response({ message: 'Customer administrator deleted successfully.' }) }
    if (action === 'delete') { const { error } = await admin.rpc('platform_delete_tenant', { p_organization_id: organizationId }); if (error) throw new Error(error.message); await audit(actor.id, 'TENANT_DELETED', organizationId); return response({ message: 'Tenant deleted successfully.' }) }
    if (action === 'create_platform_user') {
      const email = text(body.email).toLowerCase(), fullName = text(body.full_name), phone = text(body.phone), roleCode = text(body.role_code) || 'SAAS_ADMIN'
      if (!email || !fullName) throw new Error('Full name and email are required')
      const { data: role, error: roleError } = await admin.from('platform_roles').select('id,code').eq('code', roleCode).single(); if (roleError || !role) throw new Error('The selected platform role is not valid')
      const invite = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName, phone }, redirectTo: `${Deno.env.get('SITE_URL') || 'https://app.humanest.co.in'}/platform-admin` }); if (invite.error || !invite.data.user) throw new Error(invite.error?.message || 'Unable to invite platform user')
      const newUser = invite.data.user
      const { error: profileError } = await admin.from('user_profiles').upsert({ id: newUser.id, full_name: fullName, phone, is_platform_admin: roleCode === 'SUPER_ADMIN' }); if (profileError) { await admin.auth.admin.deleteUser(newUser.id); throw profileError }
      const metadata = await admin.auth.admin.updateUserById(newUser.id, { app_metadata: { ...newUser.app_metadata, platform_user: true, platform_admin: roleCode === 'SUPER_ADMIN' } }); if (metadata.error) { await admin.auth.admin.deleteUser(newUser.id); throw metadata.error }
      const { error: assignmentError } = await admin.from('platform_user_roles').upsert({ user_id: newUser.id, role_id: role.id }, { onConflict: 'user_id' }); if (assignmentError) throw assignmentError
      await audit(actor.id, 'PLATFORM_USER_CREATED', undefined, { email, role: roleCode }); return response({ message: 'Platform user invited successfully.' })
    }
    if (action === 'set_platform_role') {
      const userId = text(body.user_id), roleCode = text(body.role_code); if (!userId || !roleCode) throw new Error('Platform user and role are required')
      const { data: role, error } = await admin.from('platform_roles').select('id').eq('code', roleCode).single(); if (error || !role) throw new Error('The selected platform role is not valid')
      const user = await admin.auth.admin.getUserById(userId); if (user.error || !user.data.user) throw new Error('Platform user was not found')
      const metadata = await admin.auth.admin.updateUserById(userId, { app_metadata: { ...user.data.user.app_metadata, platform_user: true, platform_admin: roleCode === 'SUPER_ADMIN' } }); if (metadata.error) throw metadata.error
      const { error: assignmentError } = await admin.from('platform_user_roles').upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id' }); if (assignmentError) throw assignmentError
      await admin.from('user_profiles').update({ is_platform_admin: roleCode === 'SUPER_ADMIN' }).eq('id', userId); await audit(actor.id, 'PLATFORM_ROLE_UPDATED', undefined, { user_id: userId, role: roleCode }); return response({ message: 'Platform user role updated successfully.' })
    }
    if (action === 'disable_platform_user' || action === 'enable_platform_user') {
      const userId = text(body.user_id); if (!userId) throw new Error('Platform user is required')
      const change = await admin.auth.admin.updateUserById(userId, { ban_duration: action === 'disable_platform_user' ? '876000h' : 'none' }); if (change.error) throw change.error
      await audit(actor.id, action === 'disable_platform_user' ? 'PLATFORM_USER_DISABLED' : 'PLATFORM_USER_ENABLED', undefined, { user_id: userId }); return response({ message: action === 'disable_platform_user' ? 'Platform user disabled successfully.' : 'Platform user enabled successfully.' })
    }
    return response({ error: 'Unsupported platform action' }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected platform service error'
    const status = /Authentication|required|access is required/i.test(message) ? 403 : 400
    return response({ error: message }, status)
  }
})
