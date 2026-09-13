# HumaNest trial activation flow — final auth setup

## Application changes in this package

1. Browser Supabase client now uses `@supabase/ssr`, so the authenticated session created by the server confirmation route is available to the browser.
2. Trial signup now sends the confirmation link to:
   `NEXT_PUBLIC_SITE_URL/auth/confirm?next=/hrms`
3. Added server-side `app/auth/confirm/route.ts`.
4. The confirmation route verifies the Supabase token, provisions the 7-day HumaNest tenant through `provision_my_trial`, establishes the session cookie, and redirects to `/hrms`.
5. The old client-side callback is retained only as a compatibility redirect.

## Vercel environment variable

Set this in Vercel for the Production environment:

`NEXT_PUBLIC_SITE_URL=https://<YOUR-PUBLIC-HUMANEST-DOMAIN>`

Do not use a Vercel preview/deployment URL here.

## Supabase URL configuration

In Authentication → URL Configuration:

- Site URL: the same public HumaNest URL.
- Redirect URL: `<PUBLIC-HUMANEST-URL>/auth/confirm`
- If you also support www, add the www confirmation URL explicitly.

## Confirm signup email template

In Authentication → Email Templates → Confirm signup, the activation link should be based on:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/hrms`

Do not use the old `{{ .ConfirmationURL }}` link for this flow.

## SMTP

Custom SMTP is already configured by the owner. Confirm that the SMTP sender/admin email is `trial@humanest.co.in` and the sender name is `HumaNest`.

## Expected flow

Trial form → Thank You screen → email from `trial@humanest.co.in` → Activate Account → `/auth/confirm` → tenant provisioning → `/hrms`.
