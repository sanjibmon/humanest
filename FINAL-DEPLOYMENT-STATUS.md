# HumaNest Final Deployment Status

## Included
- Customer HRMS workspace
- Platform Administration workspace
- Platform RBAC and role permissions
- Platform user creation/role management workflow
- Tenant lifecycle management
- Trial extension/conversion/suspend/enable/delete
- Module licensing
- Employee quota and user quota
- Mandatory TOTP MFA
- Customer tenant isolation/RLS hardening
- Customer portal organization context hardening
- Trial provisioning and SaaS lifecycle Edge Function

## Supabase production
The production Supabase project has already received the customer portal RLS/context hardening migration. The migration is included here for source-control parity.

## GitHub deployment
Upload/replace the repository contents from this package into `main` and allow Vercel to build the production deployment.

Do not put Supabase service-role/secret keys in the repository or browser environment.

## Current product scope
The HRMS foundation and core workspaces are implemented. India statutory payroll calculations (PF/ESI/PT/TDS), biometric vendor adapters, Razorpay billing, and production-grade exports still require dedicated validation before commercial go-live.
