-- Abonnement mensuel Trendza (15 000 XOF) via FedaPay.
--
-- Modèle : FedaPay n'expose aucun objet d'abonnement récurrent (uniquement
-- des transactions ponctuelles). Chaque paiement accepté ouvre donc une
-- période d'accès de 30 jours ; le renouvellement est un nouveau paiement.
-- `current_period_end` est la seule source de vérité de l'accès.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  -- 'active' tant que current_period_end est dans le futur, sinon 'expired'.
  -- 'pending' = paiement initié mais pas encore confirmé par le webhook.
  statut text not null default 'pending'
    check (statut in ('pending', 'active', 'expired', 'canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_period_end_idx on public.subscriptions (current_period_end);

-- Journal des paiements : trace d'audit, et garde-fou contre le rejeu de
-- webhooks (FedaPay peut livrer plusieurs fois le même évènement).
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Identifiant de la transaction chez FedaPay. Unique : un même paiement
  -- ne peut pas créditer deux fois l'abonnement.
  fedapay_transaction_id text not null unique,
  montant integer not null,
  devise text not null default 'XOF',
  statut text not null check (statut in ('pending', 'approved', 'declined', 'canceled')),
  -- Payload brut de l'évènement, pour investigation en cas de litige.
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- ⚠️ Lecture seule pour l'utilisateur. Aucune policy INSERT/UPDATE/DELETE
-- n'est créée volontairement : seul le webhook, qui utilise la clé
-- service_role (laquelle contourne la RLS), peut écrire. Un utilisateur ne
-- peut donc pas s'octroyer un abonnement en appelant l'API depuis son
-- navigateur.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);

-- Les administrateurs voient tout (suivi des paiements dans /admin).
drop policy if exists "subscriptions_select_admin" on public.subscriptions;
create policy "subscriptions_select_admin"
  on public.subscriptions for select
  using (public.is_admin());

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

/**
 * Source de vérité de l'accès premium, utilisable en SQL comme en RPC.
 * `security definer` pour rester lisible même si les policies évoluent.
 * Les administrateurs ont toujours accès, sans abonnement.
 */
create or replace function public.has_active_subscription(uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.profiles
      where id = uid and role = 'admin'
    )
    or exists (
      select 1 from public.subscriptions
      where user_id = uid
        and statut = 'active'
        and current_period_end is not null
        and current_period_end > now()
    );
$$;

grant execute on function public.has_active_subscription(uuid) to authenticated;

-- Tient `updated_at` à jour sans que le code applicatif ait à y penser.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
  before update on public.payments
  for each row execute function public.touch_updated_at();
