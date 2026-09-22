-- Stolen Bikes TLV — database setup
--
-- GitHub Pages can only serve files; it cannot store anything. This is the
-- database the published site talks to. Paste the whole file into the
-- Supabase SQL editor and run it once.
--
-- Everything the server used to enforce is enforced here instead, in the
-- database, so it holds no matter what a client sends.

create table if not exists public.thefts (
  id           bigint generated always as identity primary key,
  lat          double precision not null,
  lng          double precision not null,
  occurred_on  date        not null,
  time_of_day  text        not null,
  bike_type    text        not null,
  lock_type    text        not null,
  parked_at    text        not null,
  failure_mode text        not null default 'unknown',   -- what actually gave way
  notes        text        not null default '',
  source       text        not null default 'user',
  status       text        not null default 'published',
  reporter     text        not null default '',
  hp           text        not null default '',       -- honeypot, cleared on insert
  created_at   timestamptz not null default now(),

  -- Greater Tel Aviv only.
  constraint thefts_bbox check (
    lat between 31.95 and 32.25 and lng between 34.68 and 34.95
  ),
  -- Sanity only. "Not in the future, not ancient" is time-dependent, so it is
  -- enforced in the insert trigger instead — a CHECK using current_date would
  -- make the table impossible to restore from a dump later on.
  constraint thefts_date check (occurred_on > date '2000-01-01'),
  constraint thefts_time   check (time_of_day in ('morning','afternoon','evening','night','unknown')),
  constraint thefts_bike   check (bike_type   in ('city','electric','road','mountain','scooter','other','unknown')),
  constraint thefts_lock   check (lock_type   in ('none','cable','chain','ulock','folding','unknown')),
  constraint thefts_parked check (parked_at   in ('street','rack','building','courtyard','other','unknown')),
  constraint thefts_failure check (failure_mode in
    ('lock_cut','lock_opened','anchor_cut','anchor_removed','not_locked','unknown')),
  constraint thefts_status check (status      in ('published','hidden')),
  constraint thefts_notes  check (char_length(notes) <= 280)
);

-- Already ran an earlier version of this file? Add the column on its own:
--   alter table public.thefts add column if not exists failure_mode text not null default 'unknown';
-- then re-run everything from the constraint block down.

create index if not exists thefts_status_idx   on public.thefts (status);
create index if not exists thefts_occurred_idx on public.thefts (occurred_on desc);
create index if not exists thefts_reporter_idx on public.thefts (reporter, created_at desc);

-- ---------------------------------------------------------------------------
-- On insert: blur the location, catch bots, throttle, and ignore any client
-- attempt to set fields it has no business setting.
-- ---------------------------------------------------------------------------

create or replace function public.thefts_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  -- Snap to a ~100 m grid so a pin can never point at one building.
  new.lat := round(new.lat::numeric / 0.001) * 0.001;
  new.lng := round(new.lng::numeric / 0.001) * 0.001;

  new.source     := 'user';
  new.created_at := now();
  new.notes      := left(btrim(regexp_replace(coalesce(new.notes, ''), '\s+', ' ', 'g')), 280);

  -- The form carries a field no human can see. Anything that fills it gets
  -- saved out of sight rather than rejected, so the script never learns.
  if coalesce(new.hp, '') <> '' then
    new.status := 'hidden';
  else
    new.status := 'published';
  end if;
  new.hp := '';

  if new.occurred_on > current_date + 1
     or new.occurred_on < current_date - interval '5 years' then
    raise exception 'invalid date';
  end if;

  -- Same reporter, same cell, same day: already on the map.
  if exists (
    select 1 from public.thefts t
    where t.reporter = new.reporter
      and t.reporter <> ''
      and t.occurred_on = new.occurred_on
      and abs(t.lat - new.lat) < 0.0005
      and abs(t.lng - new.lng) < 0.0005
  ) then
    raise exception 'duplicate report';
  end if;

  -- Five accepted reports an hour is plenty for one person.
  select count(*) into recent_count
  from public.thefts t
  where t.reporter = new.reporter
    and t.reporter <> ''
    and t.created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'rate limit reached';
  end if;

  return new;
end;
$$;

drop trigger if exists thefts_before_insert on public.thefts;
create trigger thefts_before_insert
  before insert on public.thefts
  for each row execute function public.thefts_on_insert();

-- ---------------------------------------------------------------------------
-- Access: the public may read published pins and add new ones. Nothing else.
-- ---------------------------------------------------------------------------

alter table public.thefts enable row level security;

drop policy if exists thefts_read_published on public.thefts;
create policy thefts_read_published on public.thefts
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists thefts_insert_public on public.thefts;
create policy thefts_insert_public on public.thefts
  for insert to anon, authenticated
  with check (true);

-- Column-level grants, so `reporter` and `hp` can never be read back out even
-- though the rows themselves are public.
revoke all on public.thefts from anon, authenticated;

grant select (id, lat, lng, occurred_on, time_of_day, bike_type, lock_type,
              parked_at, failure_mode, notes, source, status, created_at)
  on public.thefts to anon, authenticated;

grant insert (lat, lng, occurred_on, time_of_day, bike_type, lock_type,
              parked_at, failure_mode, notes, reporter, hp)
  on public.thefts to anon, authenticated;

-- No updates, no deletes for the public. Moderate from the Supabase dashboard:
--   update public.thefts set status = 'hidden' where id = 123;
