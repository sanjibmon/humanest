# HumaNest — Final Test Build

**Your People. Your Process.**

This package contains the final browser-test build for the HumaNest public landing page, Customer Login, 7-Day Trial signup, Platform Login with Authenticator/TOTP MFA enrollment + verification, and the current Platform Admin / Customer HRMS shells.

## Routes

- `/` — Public HumaNest landing page
- `/login` — Customer Login + TOTP verification
- `/trial` — Create a 7-Day Trial
- `/platform-admin` — Separate Platform Login + first-time TOTP QR setup + Platform Admin dashboard
- `/hrms` — Customer HRMS shell

## Supabase

The frontend uses only the Supabase publishable key. Never put a service-role/secret key in this project.

Create `.env.local` from `.env.example` and set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key.

The existing HumaNest Supabase database and trial-provisioning function are expected to already be present.

## Browser-only GitHub upload

Upload the contents of this folder to the `main` branch of the HumaNest GitHub repository. Do not upload the `.next` folder or any secret key.

Vercel should then build automatically from GitHub.

## Important MFA behavior

Platform Login is intentionally separate from Customer Login. After password authentication:

1. If the Platform Admin has no verified TOTP factor, the page enrolls one and displays a QR code.
2. Scan the QR code with an authenticator app.
3. Enter the 6-digit code to activate MFA.
4. Future Platform Logins request the 6-digit TOTP code after the password.

The code uses `challenge.data.id` for Supabase MFA challenge verification.
