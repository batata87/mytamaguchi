create table if not exists public.pets (
  player_id text primary key,
  name text not null,
  egg_type text not null check (egg_type in ('pink', 'blue', 'gold')),
  hunger numeric not null default 100,
  energy numeric not null default 100,
  joy numeric not null default 100,
  hygiene numeric not null default 100,
  bond integer not null default 0,
  stage text not null check (stage in ('egg', 'baby', 'teen', 'adult')),
  last_updated_at timestamptz not null default timezone('utc'::text, now())
);
