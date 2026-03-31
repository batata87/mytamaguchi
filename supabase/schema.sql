create extension if not exists "pgcrypto";

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Nebby',
  stage text not null default 'egg' check (stage in ('egg', 'baby', 'teen', 'adult')),
  hunger integer not null default 100 check (hunger between 0 and 100),
  energy integer not null default 100 check (energy between 0 and 100),
  joy integer not null default 100 check (joy between 0 and 100),
  hygiene integer not null default 100 check (hygiene between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_user_id_idx on public.pets(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
before update on public.pets
for each row
execute function public.set_updated_at();
