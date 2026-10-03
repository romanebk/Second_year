-- Fonction RPC pour changer le rôle d'un utilisateur (admin only).
-- La RLS interdit UPDATE sur la colonne role (revoke dans 0005),
-- donc on passe par une fonction security definer.

create or replace function public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'Rôle invalide : %', new_role;
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Vous ne pouvez pas modifier votre propre rôle';
  end if;

  update public.profiles
    set role = new_role
    where id = target_user_id;

  if not found then
    raise exception 'Utilisateur introuvable';
  end if;
end;
$$;

grant execute on function public.admin_update_user_role(uuid, text) to authenticated;
