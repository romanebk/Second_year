-- Corrige l'erreur "structure of query does not match function result type"
-- dans admin_users().
--
-- Cause : auth.users.email est de type character varying, mais la clause
-- RETURNS TABLE déclare email text. PostgreSQL refuse la correspondance
-- sans cast explicite depuis la migration 0006.
--
-- Solution : recréer la fonction en castant u.email::text.

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
