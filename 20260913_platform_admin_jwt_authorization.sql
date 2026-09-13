-- Use immutable Auth app_metadata for platform authorization in RLS.
-- raw_app_meta_data is not user-editable and is suitable for authorization claims.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('platform_user',true,'platform_admin',true)
where id='c41c3316-fc47-401f-a46f-f1bc5fe1249a';

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'platform_admin')::boolean,false)
      or coalesce((select is_platform_admin from public.user_profiles where id=auth.uid()),false);
$$;
create or replace function public.is_platform_super_admin()
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$ select public.is_platform_admin(); $$;
create or replace function public.has_platform_permission(p_code text)
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$
  select public.is_platform_super_admin() or exists (
    select 1 from public.platform_user_roles ur
    join public.platform_role_permissions rp on rp.role_id=ur.role_id
    where ur.user_id=auth.uid() and rp.permission_code=p_code
  );
$$;
create or replace function public.platform_admin_can(p_code text)
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$ select public.has_platform_permission(p_code); $$;

revoke execute on function public.is_platform_admin() from anon;
revoke execute on function public.is_platform_super_admin() from anon;
revoke execute on function public.has_platform_permission(text) from anon;
revoke execute on function public.platform_admin_can(text) from anon;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_platform_super_admin() to authenticated;
grant execute on function public.has_platform_permission(text) to authenticated;
grant execute on function public.platform_admin_can(text) to authenticated;
