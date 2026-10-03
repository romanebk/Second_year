-- Admin area support: read access to every profile (incl. email via a
-- security-definer RPC) and product write access, restricted to admins.

-- is_admin(): single source of truth for admin checks across policies and RPCs.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- admins can read every profile (the user list powers the admin dashboard).
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- admins can manage the product catalogue.
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- admin_users(): profiles joined with the auth email, admin-only.
-- Anon/authenticated keys cannot read auth.users, so this runs as definer.
create or replace function public.admin_users()
returns table (
  id uuid,
  email text,
  nom text,
  prenoms text,
  telephone text,
  pays text,
  niveau text,
  plateforme text,
  role text,
  onboarded boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  return query
    select
      p.id,
      u.email::text,
      p.nom,
      p.prenoms,
      p.telephone,
      p.pays,
      p.niveau,
      p.plateforme,
      p.role,
      p.onboarded,
      p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function public.admin_users() to authenticated;
