# HumaNest Platform Admin release

This release fixes the source-control gap that left the Platform Admin frontend and its Supabase Edge Function out of sync.

## Included

- `app/platform-admin/page.tsx` loads a single secured platform snapshot instead of a fragile chain of browser-side RLS queries.
- Every tenant action now displays the exact success or error returned by the backend and refreshes the selected tenant.
- Customer administrators, enabled modules, employee/user usage and quotas are returned with each tenant.
- `supabase/functions/trial-provision/` is the missing source-controlled Edge Function. It implements the platform snapshot, tenant lifecycle, module/license changes, customer administrators and platform-user administration.
- Only a Super Admin can make destructive or identity/lifecycle changes. Other platform users can load the read-only dashboard.
- The client is safe to prerender during a Vercel build without a local `.env.local`; production still requires the real Vercel environment variables.

## Deploy in this order

1. Commit and push this repository to `main`.
2. In Supabase, deploy the function from this repository:

   ```powershell
   supabase functions deploy trial-provision
   ```

   The Supabase-managed `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` secrets are used by the function. Do not add a service-role key to Vercel or to the repository.
3. Confirm the Vercel production environment has these values:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://iyylioukanbhqvkekqks.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
   NEXT_PUBLIC_SITE_URL=https://app.humanest.co.in
   ```
4. Let Vercel deploy the `main` commit, then sign out and sign in again as the Super Admin.

## Acceptance test

1. Open `/platform-admin` and confirm **Sanjib / SUPER_ADMIN** appears in Platform Users.
2. Open Shieldwell under Customers and confirm name, email and phone of its customer administrator are visible.
3. Test: Extend Trial → Suspend → Enable → Save quota → Save modules → Convert to Active Customer.
4. Create and then delete a disposable customer administrator. The final active customer administrator cannot be deleted.
5. Create a disposable Platform User, set its role, disable it and re-enable it.
6. Delete only a disposable tenant. Tenant deletion calls the existing `platform_delete_tenant` database procedure, so it remains atomic at the database layer.

If an action fails, the UI now renders the returned backend message. Capture that message exactly before making another change.
