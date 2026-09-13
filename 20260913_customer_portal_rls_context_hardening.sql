create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
set row_security = off
as $$
  select public.is_platform_admin()
      or exists (
        select 1
        from public.organization_members m
        where m.organization_id = p_org
          and m.user_id = auth.uid()
          and m.status = 'ACTIVE'
      );
$$;

revoke execute on function public.is_org_member(uuid) from anon;
grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.customer_org_context()
returns table(organization_id uuid, employee_id uuid, membership_status text)
language sql
stable
security definer
set search_path = public, pg_catalog
set row_security = off
as $$
  select m.organization_id, m.employee_id, m.status
  from public.organization_members m
  where m.user_id = auth.uid()
    and m.status = 'ACTIVE'
  order by m.created_at asc
  limit 1;
$$;

revoke execute on function public.customer_org_context() from anon;
grant execute on function public.customer_org_context() to authenticated;
