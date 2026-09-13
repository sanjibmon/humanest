# HumaNest Go-Live Release

This release adds the working customer HRMS workspace and Platform Admin operations.

## Production database already updated
- SaaS tenant user quota (`user_quota`)
- Active/Invited organization member quota enforcement
- Trial provisioning order fixed so license quota exists before first employee/member
- Platform-admin security function exposure hardened
- Customer module visibility RLS fixed
- Platform Admin lifecycle Edge Function upgraded to v4

## Platform Admin
- Overview dashboard
- Customer tenant list
- Trial management
- Extend trial: 7/14/30/90/180/365 days
- Suspend / enable tenant
- Convert trial to active customer
- Delete tenant
- Module enable/disable per customer
- Employee quota
- User quota
- Platform user view
- Audit log
- Module/licensing catalog

## Customer HRMS
- Dashboard with live enabled-module cards
- Core HR employee list + add employee
- Attendance daily records + web check-in/out
- Leave request list + apply + approve/reject
- Payroll run workspace
- Recruitment requisitions
- Onboarding tasks
- Performance cycles
- Expense claims
- Reports
- My Profile
- Organization Settings
- Mandatory TOTP MFA gate

## Deployment
1. Replace the project files in the GitHub `main` branch with this package.
2. Keep the existing production environment variables.
3. Redeploy the Vercel production deployment.
4. Open `https://app.humanest.co.in/platform-admin` and sign in.
5. Open the customer HRMS and verify the 9 modules.

## Important
The database foundation and lifecycle controls are live, but India-specific statutory payroll calculations (PF/ESI/PT/TDS), biometric vendor adapters, Razorpay billing, and production-grade reporting exports still require dedicated validation before a commercial payroll go-live.
