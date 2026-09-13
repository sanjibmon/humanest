# HumaNest Landing Page — Responsive Reference Build

This build uses the supplied HumaNest landing-page artwork as individual, fixed-ratio assets rather than placing the entire screenshot as the page background.

## Key fixes
- Restores the People / Process / Progress graphics together with their taglines.
- Uses transparent versions of the Customer Login, Platform Login and Start Free Trial icons.
- Keeps icon dimensions controlled so assets are not stretched or distorted.
- Bottom statement is rendered as live HTML text for maximum clarity instead of being part of a stretched image.
- Responsive CSS continuously adjusts the composition for desktop resolutions at 100% browser zoom, including 1920×1080, 1600×900, 1360×768 and 1280×1024.
- Only the main “People Empower Progress.” headline is intentionally reduced/tightened to preserve the requested fit.

## Routes
- `/` — landing page
- `/login` — customer login
- `/platform-admin` — platform login
- `/trial` — trial route placeholder/link

## Deployment
Upload the project files to the existing HumaNest GitHub repository and let Vercel build the `main` branch.
