# HumaNest Full Test Suite

This package contains one Next.js app with:
- `/platform-admin` — Platform Admin with TOTP MFA challenge and clickable sections
- `/login` — customer/employee login with TOTP challenge
- `/trial` — public 7-day trial signup
- `/hrms` — customer-facing HRMS shell reading the logged-in tenant, enabled modules, and employees
- `/` — test launcher

Supabase project is configured through NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.

Important:
1. Add these two environment variables in Vercel.
2. The database function `public.provision_my_trial(...)` must exist. It has been applied to the current HumaNest project.
3. Platform Admin login uses the existing Auth user and Super Admin database role.
4. Never put a Supabase secret/service-role key in this app.
5. First Platform Admin login enrolls a TOTP authenticator and then requires the 6-digit code.

Browser-only deployment:
Upload/replace the app, lib, public, package.json and README files in GitHub. Vercel will redeploy automatically.


Build fix: Supabase MFA challenge returns data.id; the app uses c.data.id for verification.
