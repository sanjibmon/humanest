-- Platform admin runtime fix + initial permissions for non-super-admin platform roles.
revoke execute on function public.platform_admin_can(text) from anon;
revoke execute on function public.has_platform_permission(text) from anon;
revoke execute on function public.is_platform_super_admin() from anon;
grant execute on function public.platform_admin_can(text) to authenticated;
grant execute on function public.has_platform_permission(text) to authenticated;
grant execute on function public.is_platform_super_admin() to authenticated;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='SAAS_ADMIN' and p.code in ('TENANT_VIEW','TENANT_EDIT','TENANT_SUSPEND','TRIAL_EXTEND','TRIAL_CONVERT','MODULE_VIEW','MODULE_ASSIGN','MODULE_DISABLE','LICENSE_VIEW','LICENSE_ASSIGN','LICENSE_EDIT','OVERAGE_ASSIGN','OVERAGE_EXTEND','AUDIT_VIEW','PLATFORM_USER_VIEW')
on conflict do nothing;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='CUSTOMER_SUCCESS' and p.code in ('TENANT_VIEW','TENANT_EDIT','TRIAL_EXTEND','TRIAL_CONVERT','MODULE_VIEW','LICENSE_VIEW','AUDIT_VIEW')
on conflict do nothing;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='SALES' and p.code in ('TENANT_VIEW','TRIAL_CREATE','TRIAL_EXTEND','TRIAL_CONVERT','MODULE_VIEW','LICENSE_VIEW')
on conflict do nothing;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='SUPPORT' and p.code in ('TENANT_VIEW','MODULE_VIEW','LICENSE_VIEW','AUDIT_VIEW')
on conflict do nothing;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='FINANCE' and p.code in ('TENANT_VIEW','LICENSE_VIEW','LICENSE_ASSIGN','LICENSE_EDIT','OVERAGE_ASSIGN','OVERAGE_EXTEND','BILLING_VIEW','BILLING_MANAGE')
on conflict do nothing;

insert into public.platform_role_permissions(role_id,permission_code)
select r.id, p.code from public.platform_roles r cross join public.platform_permissions p
where r.code='AUDITOR' and p.code in ('TENANT_VIEW','MODULE_VIEW','LICENSE_VIEW','AUDIT_VIEW','BILLING_VIEW')
on conflict do nothing;
