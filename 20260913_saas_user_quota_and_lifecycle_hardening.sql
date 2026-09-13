-- HumaNest SaaS lifecycle hardening: user quota, trial provisioning order, and function exposure.
-- Applied to the production Supabase project before this release package.

alter table public.saas_accounts add column if not exists user_quota integer not null default 25;
alter table public.saas_accounts add constraint saas_accounts_user_quota_positive check (user_quota > 0);

create or replace function public.enforce_user_license_limit() returns trigger
language plpgsql security definer set search_path=public,pg_catalog as $$
declare lim integer; used integer;
begin
  if new.status not in ('ACTIVE','INVITED') then return new; end if;
  select user_quota into lim from public.saas_accounts where organization_id=new.organization_id and status in ('TRIAL','ACTIVE');
  if lim is null then raise exception 'No active SaaS license found for organization'; end if;
  select count(*) into used from public.organization_members where organization_id=new.organization_id and status in ('ACTIVE','INVITED') and id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid);
  if used >= lim then raise exception 'User license quota exceeded for this organization'; end if;
  return new;
end $$;

drop trigger if exists trg_enforce_user_license_limit on public.organization_members;
create trigger trg_enforce_user_license_limit before insert or update of organization_id,status on public.organization_members for each row execute function public.enforce_user_license_limit();

-- Trial provisioning must create the license before the first employee/member because
-- employee/member quota triggers are intentionally enforced.
-- (The full function is maintained in the deployment migration history.)

revoke execute on function public.can_add_employee(uuid) from authenticated;
revoke execute on function public.employee_license_limit(uuid) from authenticated;
revoke execute on function public.has_platform_permission(text) from authenticated;
revoke execute on function public.is_platform_super_admin() from authenticated;
revoke execute on function public.platform_admin_can(text) from authenticated;
revoke execute on function public.provision_my_trial(text,text,text,integer) from anon;
