alter table public.schools
  add column if not exists short_name text,
  add column if not exists motto text,
  add column if not exists logo_url text,
  add column if not exists favicon_url text,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists subdomain text,
  add column if not exists custom_domain text,
  add column if not exists login_branding_enabled boolean not null default false;

-- Create storage bucket for branding
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- RLS policies for branding bucket
create policy "branding_public_read"
  on storage.objects for select
  using ( bucket_id = 'branding' );

create policy "branding_principal_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'branding' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.school_members 
      where user_id = auth.uid() 
        and role = 'principal'
        and school_id::text = (string_to_array(name, '/'))[1]
    )
  );

create policy "branding_principal_update"
  on storage.objects for update
  using (
    bucket_id = 'branding' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.school_members 
      where user_id = auth.uid() 
        and role = 'principal'
        and school_id::text = (string_to_array(name, '/'))[1]
    )
  );

create policy "branding_principal_delete"
  on storage.objects for delete
  using (
    bucket_id = 'branding' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.school_members 
      where user_id = auth.uid() 
        and role = 'principal'
        and school_id::text = (string_to_array(name, '/'))[1]
    )
  );

-- Update schools policy so principals can update their schools via RLS
drop policy if exists schools_update_admin on public.schools;
create policy schools_update_admin on public.schools for update using (app.has_school_role(id, array['administrator', 'principal']::public.app_role[]));
