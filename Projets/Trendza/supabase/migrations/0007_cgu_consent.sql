-- Trace du consentement aux conditions d'utilisation.
--
-- La case à cocher à l'inscription est bloquante côté interface, mais une
-- acceptation doit aussi être prouvable : on horodate le moment où
-- l'utilisateur a coché la case. `null` = consentement non enregistré
-- (comptes créés avant cette migration).

alter table public.profiles
  add column if not exists cgu_accepted_at timestamptz;

comment on column public.profiles.cgu_accepted_at is
  'Date et heure d''acceptation des CGU et de la politique de confidentialité.';
