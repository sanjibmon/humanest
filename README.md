# HumaNest

HumaNest — Your People. Your Process.

## Trial activation flow

1. User submits the 7-day trial form.
2. HumaNest displays the thank-you confirmation.
3. Supabase Auth sends the confirmation email through the configured Zoho SMTP account `trial@humanest.co.in`.
4. The email activation link opens `/auth/confirm` on the HumaNest production domain.
5. The server verifies the token, provisions the trial organization, creates the authenticated session, and redirects to `/hrms`.

## Required Vercel environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=https://iyylioukanbhqvkekqks.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your Supabase publishable key>
NEXT_PUBLIC_SITE_URL=https://app.humanest.co.in
```

Never commit SMTP passwords, Supabase secret/service-role keys, or other secrets.

## Supabase Auth

- Email provider: enabled
- Confirm email: enabled
- Site URL: `https://app.humanest.co.in`
- Redirect URL: `https://app.humanest.co.in/auth/confirm`
- Confirm signup template should link to `/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/hrms`

See `ZOHO-TRIAL-EMAIL-SETUP.md` for the complete SMTP/template checklist.
