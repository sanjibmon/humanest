import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/hrms'
  return value
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const requestedNext = safeNextPath(searchParams.get('next'))
  // New customer accounts must complete mandatory TOTP MFA before HRMS access.
  // Existing internal/admin flows can still use an explicit internal destination.
  const next = requestedNext === '/hrms' ? '/mfa-setup?next=/hrms' : requestedNext

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/trial?activation=invalid', request.url))
  }

  const supabase = await createClient()
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (verifyError || !verifyData.user) {
    return NextResponse.redirect(new URL('/trial?activation=expired', request.url))
  }

  const user = verifyData.user
  const metadata = user.user_metadata ?? {}
  const company = String(metadata.company_name ?? '').trim()
  const fullName = String(metadata.full_name ?? '').trim()

  if (!company || !fullName) {
    return NextResponse.redirect(new URL('/trial?activation=incomplete', request.url))
  }

  const { error: provisionError } = await supabase.rpc('provision_my_trial', {
    p_company_name: company,
    p_legal_name: company,
    p_full_name: fullName,
    p_trial_days: 7,
  })

  // If a refresh/retry reaches this endpoint after the workspace was already
  // created, continue into HRMS rather than treating it as a failure.
  if (provisionError && !/already belongs to an organization/i.test(provisionError.message ?? '')) {
    return NextResponse.redirect(new URL('/trial?activation=provision-error', request.url))
  }

  const response = NextResponse.redirect(new URL(next, request.url))
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
