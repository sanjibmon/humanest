# HumaNest Trial Email + Activation Setup

The trial flow now uses Supabase Auth email confirmation. The organization is provisioned only after the requester clicks the activation link.

## Required Supabase Auth settings

1. Authentication -> Providers -> Email:
   - Email provider: ON
   - Confirm email: ON
2. Authentication -> URL Configuration:
   - Site URL: your production HumaNest URL
   - Redirect URL: `https://app.humanest.co.in/auth/confirm`
3. Authentication -> SMTP:
   - Enable custom SMTP.
   - Sender name: `HumaNest`
   - Sender email: `trial@humanest.co.in`

## Zoho SMTP

For a paid Zoho Mail organization account using a domain address, Zoho documents:
- SMTP host: `smtppro.zoho.com`
- Port 465 with SSL, or 587 with TLS
- Authentication: required
- Username: `trial@humanest.co.in`
- Password: the Zoho mailbox password or an application-specific password if required by the account's security settings.

Do not commit the SMTP password to GitHub. Enter it only in the Supabase SMTP settings.

## Confirmation email template

Use the Supabase **Confirm signup** email template. Suggested subject:

`Welcome to HumaNest — Activate Your 7-Day Trial`

Suggested body:

`<p>Dear {{ .Data.full_name }},</p>
<p>Thank you for choosing HumaNest.</p>
<p>Your 7-day HumaNest trial request for <strong>{{ .Data.company_name }}</strong> has been submitted successfully.</p>
<p>Please click the button below to activate your account and access your HumaNest HRMS portal.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/hrms" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#087fd9;color:#fff;text-decoration:none;font-weight:700">Activate My HumaNest Account</a></p>
<p>Your trial starts when your account is activated and remains available for 7 days.</p>
<p>Regards,<br>HumaNest Team<br>Your People. Your Process.</p>`

The server-side confirmation route at `/auth/confirm` verifies the token, provisions the tenant after email confirmation, establishes the session, and redirects the user to `/hrms`.


## Production environment variable

Set this in Vercel Production:

`NEXT_PUBLIC_SITE_URL=https://app.humanest.co.in`

Do not use a `vercel.app` deployment URL for customer-facing activation links.
