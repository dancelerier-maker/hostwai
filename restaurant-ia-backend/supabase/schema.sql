-- Hostwai — schéma Supabase minimal (Sprint 1)
-- 5 tables, un seul restaurant pour l'instant (id fixe ci-dessous).
-- Aucune table users/roles/analytics : volontairement hors scope.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  twilio_number text,
  language text not null default 'fr-FR',
  opening_hours text,
  highlights text,
  staff_phone_number text
);

-- ---------------------------------------------------------------------
-- settings (1 ligne par restaurant)
-- ---------------------------------------------------------------------
create table if not exists settings (
  restaurant_id uuid primary key references restaurants(id) on delete cascade,
  agent_enabled boolean not null default true,
  answer_mode text not null default 'immediate' check (answer_mode in ('immediate', 'delayed')),
  ring_delay_seconds int not null default 15
);

-- ---------------------------------------------------------------------
-- calls
-- transcript stocke l'historique complet de l'appel en JSON
-- (tableau de { role, content }) — pas de table conversations séparée
-- tant qu'on est sur ce volume.
-- ---------------------------------------------------------------------
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  call_sid text not null unique,
  phone_number text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'transferred', 'no_answer')),
  started_at timestamptz not null default now(),
  duration_seconds int,
  transcript jsonb not null default '[]'::jsonb
);

create index if not exists calls_restaurant_id_idx on calls(restaurant_id);

-- ---------------------------------------------------------------------
-- reservations
-- ---------------------------------------------------------------------
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  customer_name text not null,
  phone text,
  party_size int not null,
  reservation_time text not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists reservations_restaurant_id_idx on reservations(restaurant_id);

-- ---------------------------------------------------------------------
-- subscriptions (1 ligne par restaurant)
-- ---------------------------------------------------------------------
create table if not exists subscriptions (
  restaurant_id uuid primary key references restaurants(id) on delete cascade,
  trial_seconds_remaining int not null default 3600,
  seconds_used_this_period int not null default 0,
  plan text check (plan in ('starter', 'pro', 'enterprise')),
  subscription_active boolean not null default false
);

-- ---------------------------------------------------------------------
-- Seed : le restaurant unique du MVP, id fixe pour que le code puisse
-- le référencer sans lookup (mono-tenant assumé pour ce sprint).
-- Remplace les valeurs par les vraies infos avant d'aller en prod.
-- ---------------------------------------------------------------------
insert into restaurants (id, name, phone, twilio_number, language, opening_hours, highlights, staff_phone_number)
values (
  '00000000-0000-0000-0000-000000000001',
  'Le Bistrot Central',
  null,
  null,
  'Français, Anglais, Espagnol',
  'Mardi à dimanche, 12h-14h30 et 19h-22h30. Fermé le lundi.',
  'Cuisine française de saison, terrasse, menu végétarien disponible, un chien est le bienvenu en terrasse.',
  null
)
on conflict (id) do nothing;

insert into settings (restaurant_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (restaurant_id) do nothing;

insert into subscriptions (restaurant_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (restaurant_id) do nothing;
