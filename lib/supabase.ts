import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  // Next prerenders client entrypoints during builds. The placeholder prevents
  // a build-time crash when local verification has no production env file;
  // Vercel always supplies the real values at build/runtime.
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-time-placeholder.invalid',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'build-time-placeholder'
)
