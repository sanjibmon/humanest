-- Customer administrator contacts, trial phone capture and platform-admin-safe customer administration.
-- Applied to HumaNest production.

alter table public.user_profiles add column if not exists phone text;
alter table public.user_profiles add column if not exists job_title text;

create or replace function public.provision_my_trial(p_company_name text, p_legal_name text default null, p_full_name text default null, p_phone text default null, p_trial_days integer default 7)
returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_uid uuid:=auth.uid(); v_org uuid; v_code text; v_member uuid; v_emp uuid; v_role uuid; v_dept uuid; v_desig uuid; v_end timestamptz;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 if p_company_name is null or length(trim(p_company_name))<2 then raise exception 'Company name is required'; end if;
 if p_trial_days<1 or p_trial_days>7 then raise exception 'Trial period must be between 1 and 7 days'; end if;
 if exists(select 1 from public.organization_members where user_id=v_uid and status in ('ACTIVE','INVITED')) then raise exception 'This user already belongs to an organization'; end if;
 v_code:=upper(regexp_replace(trim(p_company_name),'[^A-Za-z0-9]+','','g')); v_code:=left(coalesce(nullif(v_code,''),'TRIAL'),8)||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)); v_end:=now()+make_interval(days=>p_trial_days);
 insert into public.organizations(name,legal_name,code,status,timezone,currency) values(trim(p_company_name),nullif(trim(coalesce(p_legal_name,'')),''),v_code,'TRIAL','Asia/Kolkata','INR') returning id into v_org;
 insert into public.saas_accounts(organization_id,account_type,status,plan_code,trial_started_at,trial_ends_at,trial_employee_quota,user_quota) values(v_org,'TRIAL','TRIAL','TRIAL',now(),v_end,25,25);
 insert into public.saas_license_quotas(organization_id,purchased_employee_quota,overage_employee_quota,notes) values(v_org,25,0,'Trial quota');
 insert into public.user_profiles(id,full_name,phone,is_platform_admin) values(v_uid,nullif(trim(coalesce(p_full_name,'')),''),nullif(trim(coalesce(p_phone,'')),''),false) on conflict(id) do update set full_name=coalesce(excluded.full_name,user_profiles.full_name),phone=coalesce(excluded.phone,user_profiles.phone);
 insert into public.roles(organization_id,name,code,description,is_system) values(v_org,'Organization Admin','ORG_ADMIN','Default trial organization administrator',true) returning id into v_role;
 insert into public.departments(organization_id,name,code,is_active) values(v_org,'Administration','ADMIN',true) returning id into v_dept;
 insert into public.designations(organization_id,name,code,level,is_active) values(v_org,'Administrator','ADMIN',1,true) returning id into v_desig;
 insert into public.employees(organization_id,employee_code,first_name,last_name,work_email,date_of_joining,employment_status,employment_type,department_id,designation_id,user_id,location) values(v_org,'EMP-001',coalesce(nullif(split_part(trim(coalesce(p_full_name,'')),' ',1),''),'Administrator'),nullif(trim(substr(trim(coalesce(p_full_name,'')),length(split_part(trim(coalesce(p_full_name,'')),' ',1))+1)),''),auth.email(),current_date,'ACTIVE','FULL_TIME',v_dept,v_desig,v_uid,'Head Office') returning id into v_emp;
 insert into public.organization_members(organization_id,user_id,employee_id,status,joined_at) values(v_org,v_uid,v_emp,'ACTIVE',now()) returning id into v_member;
 insert into public.member_roles(member_id,role_id) values(v_member,v_role);
 insert into public.app_settings(organization_id,require_mfa,session_timeout_minutes) values(v_org,true,480);
 insert into public.mfa_policies(organization_id,required,allow_multiple_totp) values(v_org,true,true);
 insert into public.organization_modules(organization_id,module_code,enabled,enabled_at,expires_at) select v_org,module_code,true,now(),v_end from public.saas_modules where is_active=true and is_available_for_trial=true;
 insert into public.saas_trial_events(organization_id,event_type,new_status,metadata) values(v_org,'TRIAL_CREATED','TRIAL',jsonb_build_object('source','public_signup','admin_email',auth.email()));
 return jsonb_build_object('organization_id',v_org,'organization_code',v_code,'trial_ends_at',v_end);
end $$;
revoke execute on function public.provision_my_trial(text,text,text,text,integer) from public,anon,authenticated; grant execute on function public.provision_my_trial(text,text,text,text,integer) to authenticated;

update public.user_profiles p set phone=u.raw_user_meta_data->>'phone', full_name=coalesce(p.full_name,u.raw_user_meta_data->>'full_name'), updated_at=now() from auth.users u where u.id=p.id and coalesce(p.phone,'')='' and coalesce(u.raw_user_meta_data->>'phone','')<>'';
update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('platform_user',true,'platform_admin',true) where email='sanjib@humanest.co.in';
update public.user_profiles p set full_name=coalesce(p.full_name,'Sanjib'), is_platform_admin=true, updated_at=now() from auth.users u where p.id=u.id and u.email='sanjib@humanest.co.in';

create or replace function public.platform_customer_admins(p_org uuid)
returns table(user_id uuid,email text,full_name text,phone text,status text,is_org_admin boolean,employee_id uuid)
language sql stable security definer set search_path=public,pg_catalog set row_security=off as $$
 select m.user_id,u.email,p.full_name,p.phone,m.status,
   exists(select 1 from public.member_roles mr join public.roles r on r.id=mr.role_id where mr.member_id=m.id and r.organization_id=p_org and r.code='ORG_ADMIN'),m.employee_id
 from public.organization_members m
 join auth.users u on u.id=m.user_id
 left join public.user_profiles p on p.id=m.user_id
 where m.organization_id=p_org and public.is_platform_admin()
 order by p.full_name nulls last,u.email;
$$;
revoke execute on function public.platform_customer_admins(uuid) from public,anon,authenticated;
grant execute on function public.platform_customer_admins(uuid) to authenticated;
