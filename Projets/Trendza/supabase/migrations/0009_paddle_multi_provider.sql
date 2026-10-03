-- Passage à deux fournisseurs de paiement pour un même abonnement (25 €/mois).
--
-- Contexte : Trendza vise l'Europe et l'Afrique de l'Ouest, deux marchés dont
-- les moyens de paiement n'ont rien à voir.
--
--   • Paddle  — Europe : carte bancaire en EUR, abonnement réellement
--     récurrent (Paddle reprélève seul), TVA européenne gérée par Paddle en
--     tant que Merchant of Record.
--   • FedaPay — Afrique de l'Ouest : Mobile Money en XOF, sans récurrence.
--     Chaque paiement rouvre 30 jours, comme avant.
--
-- `subscriptions.current_period_end` reste la SEULE source de vérité de
-- l'accès, quel que soit le fournisseur : côté Paddle on y recopie la fin de
-- période de facturation, côté FedaPay on y ajoute 30 jours. Le reste de
-- l'application n'a donc pas à savoir qui a encaissé.

-- ---------------------------------------------------------------------------
-- payments : généralisation de l'identifiant de transaction
-- ---------------------------------------------------------------------------

-- Le renommage n'est pas idempotent : on ne le tente que s'il reste à faire,
-- pour que la migration puisse être rejouée sans erreur.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'fedapay_transaction_id'
  ) then
    alter table public.payments
      rename column fedapay_transaction_id to provider_transaction_id;
  end if;
end $$;

alter table public.payments
  add column if not exists provider text not null default 'fedapay';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_provider_check'
  ) then
    alter table public.payments
      add constraint payments_provider_check
      check (provider in ('fedapay', 'paddle'));
  end if;
end $$;

-- L'unicité doit désormais porter sur le couple : deux fournisseurs
-- pourraient théoriquement émettre le même identifiant.
alter table public.payments
  drop constraint if exists payments_fedapay_transaction_id_key;

create unique index if not exists payments_provider_transaction_idx
  on public.payments (provider, provider_transaction_id);

comment on column public.payments.montant is
  'Montant dans l''unité mineure de la devise : centimes pour EUR (2500 = 25 €), francs pour XOF (le franc CFA n''a pas de subdivision).';

-- ---------------------------------------------------------------------------
-- subscriptions : rattachement au fournisseur
-- ---------------------------------------------------------------------------

alter table public.subscriptions
  add column if not exists provider text,
  -- Identifiant de l'abonnement chez Paddle (sub_...). Null côté FedaPay,
  -- qui n'a pas d'objet abonnement.
  add column if not exists provider_subscription_id text,
  -- Identifiant client chez Paddle (ctm_...), conservé pour reprendre le même
  -- client lors d'un réabonnement et pour la résiliation.
  add column if not exists provider_customer_id text,
  -- Vrai quand l'utilisateur a résilié : l'accès court jusqu'à la fin de la
  -- période payée, puis s'éteint sans nouveau prélèvement.
  add column if not exists annule_a_la_fin boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_provider_check'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_provider_check
      check (provider is null or provider in ('fedapay', 'paddle'));
  end if;
end $$;

-- Permet au webhook Paddle de retrouver l'abonnement à partir du seul
-- identifiant Paddle, lors des renouvellements et des résiliations.
create unique index if not exists subscriptions_provider_subscription_idx
  on public.subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;

-- Les lignes créées avant cette migration venaient toutes de FedaPay.
update public.subscriptions set provider = 'fedapay' where provider is null;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- Aucune policy à ajouter : les colonnes s'ajoutent aux tables existantes,
-- qui restent en lecture seule pour l'utilisateur. Les écritures continuent
-- de passer exclusivement par les webhooks, avec la clé service_role.
