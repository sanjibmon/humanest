# HumaNest Final Web Build

This package is the final visual build for the HumaNest public landing page and the separate Customer Login, Platform Login, Trial, and HRMS routes.

## Landing page
The public landing page follows the approved visual reference: HumaNest branding on the left, “A BRIGHTER TOMORROW TOGETHER” at the upper-right of the left section with underline, People / Process / Progress, action cards, trust row, waves, and glass-style Customer Login and Platform Login preview cards on the right.

The preview cards are navigation-only. They do not authenticate on the landing page:
- Customer Login -> `/login`
- Platform Login -> `/platform-admin`
- Start Free Trial -> `/trial`

## Separate pages
- `/login` — Customer Login + TOTP MFA
- `/platform-admin` — Platform Login + first-time TOTP QR enrollment + MFA verification
- `/trial` — 7-day trial registration
- `/hrms` — customer HRMS shell

## Deployment
Upload the extracted contents to the GitHub repository `sanjibmon/humanest` and let Vercel deploy from `main`.

Do not commit `.env.local` or any Supabase service-role/secret key.


## Landing page behavior
The HumaNest home page is intentionally the full-width left/hero section only. It does NOT show Customer Login or Platform Login forms/previews on the home page. The three action cards are navigation-only: Customer Login -> `/login`, Platform Login -> `/platform-admin`, Start Free Trial -> `/trial`.
