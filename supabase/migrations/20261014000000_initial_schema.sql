create type public.app_role as enum ('citizen', 'officer', 'developer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'citizen',
  created_at timestamptz not null default now()
);

create or replace function public.create_citizen_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'citizen');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_citizen_profile();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create table public.community_records (
  id text primary key,
  kind text not null check (kind in ('complaint', 'notice', 'activity', 'poll')),
  data jsonb not null,
  owner_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.activity_participations (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null references public.community_records (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  action_type text not null check (action_type in ('rsvp', 'volunteer', 'chat')),
  action_key text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index one_rsvp_per_user_per_activity
  on public.activity_participations (activity_id, user_id)
  where action_type = 'rsvp';

create unique index one_signup_per_role_per_user
  on public.activity_participations (activity_id, user_id, action_key)
  where action_type = 'volunteer';

alter table public.profiles enable row level security;
alter table public.community_records enable row level security;
alter table public.activity_participations enable row level security;

revoke all on public.profiles, public.community_records, public.activity_participations from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.community_records to authenticated;
grant insert, update, delete on public.community_records to authenticated;
grant select, insert, delete on public.activity_participations to authenticated;

create policy "Signed-in users can read activity participation"
  on public.activity_participations for select to authenticated
  using (true);

create policy "Citizens can participate in activities"
  on public.activity_participations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_app_role()) in ('citizen', 'developer')
    and exists (
      select 1 from public.community_records
      where id = activity_id and kind = 'activity'
    )
  );

create policy "Users can withdraw their own activity participation"
  on public.activity_participations for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Developers can read all profiles"
  on public.profiles for select to authenticated
  using ((select public.current_app_role()) = 'developer');

create policy "Signed-in users can read community records"
  on public.community_records for select to authenticated
  using (true);

create table public.complaint_contacts (
  complaint_id text primary key references public.community_records (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  phone text not null
);

alter table public.complaint_contacts enable row level security;
revoke all on public.complaint_contacts from anon, authenticated;
grant select on public.complaint_contacts to authenticated;

create policy "Complaint contacts are visible only to their owner and staff"
  on public.complaint_contacts for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (select public.current_app_role()) in ('officer', 'developer')
  );

create or replace function public.file_complaint(
  p_record_id text,
  p_data jsonb,
  p_contact_phone text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.current_app_role()) <> 'citizen' then
    raise exception 'Only citizens can file complaints';
  end if;

  insert into public.community_records (id, kind, data, owner_id)
  values (
    p_record_id,
    'complaint',
    (p_data - 'filedPhone' - 'userUpvoted' - 'comments')
      || jsonb_build_object(
        'id',
        p_record_id,
        'filedBy',
        coalesce(nullif(trim(p_data->>'filedBy'), ''), 'Resident')
      ),
    (select auth.uid())
  );

  if nullif(trim(p_contact_phone), '') is not null then
    insert into public.complaint_contacts (complaint_id, owner_id, phone)
    values (p_record_id, (select auth.uid()), trim(p_contact_phone));
  end if;
end;
$$;

grant execute on function public.file_complaint(text, jsonb, text) to authenticated;

create policy "Citizens can file complaints and propose activities"
  on public.community_records for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (
      (kind = 'activity' and (select public.current_app_role()) in ('citizen', 'developer'))
      or (kind in ('notice', 'poll') and (select public.current_app_role()) = 'developer')
    )
  );

create policy "Owners and authorized staff can update records"
  on public.community_records for update to authenticated
  using (
    (kind = 'activity' and (select public.current_app_role()) = 'developer')
    or (kind = 'complaint' and (select public.current_app_role()) in ('officer', 'developer'))
    or (kind in ('notice', 'poll') and (select public.current_app_role()) = 'developer')
  )
  with check (
    (kind = 'activity' and (select public.current_app_role()) = 'developer')
    or (kind = 'complaint' and (select public.current_app_role()) in ('officer', 'developer'))
    or (kind in ('notice', 'poll') and (select public.current_app_role()) = 'developer')
  );

create policy "Owners and developers can delete records"
  on public.community_records for delete to authenticated
  using (
    (kind = 'activity' and owner_id = (select auth.uid()))
    or (select public.current_app_role()) = 'developer'
  );

create table public.poll_votes (
  poll_id text not null references public.community_records (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

alter table public.poll_votes enable row level security;
revoke all on public.poll_votes from anon, authenticated;
grant select on public.poll_votes to authenticated;

create policy "Signed-in users can read votes"
  on public.poll_votes for select to authenticated
  using (true);

create policy "Users can cast one vote per poll"
  on public.poll_votes for insert to authenticated
  with check (user_id = (select auth.uid()));

create or replace function public.cast_poll_vote(p_poll_id text, p_option_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  poll_data jsonb;
  updated_options jsonb;
begin
  if (select public.current_app_role()) not in ('citizen', 'developer') then
    raise exception 'Your role cannot vote';
  end if;

  select data into poll_data
  from public.community_records
  where id = p_poll_id and kind = 'poll' and data->>'status' = 'active'
  for update;

  if poll_data is null then
    raise exception 'Poll not found or closed';
  end if;

  if not exists (
    select 1 from jsonb_array_elements(poll_data->'options') option
    where option->>'id' = p_option_id
  ) then
    raise exception 'Poll option not found';
  end if;

  insert into public.poll_votes (poll_id, user_id, option_id)
  values (p_poll_id, (select auth.uid()), p_option_id);

  select jsonb_agg(
    case when option->>'id' = p_option_id
      then jsonb_set(option, '{votes}', to_jsonb(coalesce((option->>'votes')::integer, 0) + 1))
      else option
    end
  )
  into updated_options
  from jsonb_array_elements(poll_data->'options') option;

  update public.community_records
  set data = jsonb_set(
    jsonb_set(poll_data, '{options}', updated_options),
    '{totalVotes}',
    to_jsonb(coalesce((poll_data->>'totalVotes')::integer, 0) + 1)
  )
  where id = p_poll_id;
end;
$$;

grant execute on function public.cast_poll_vote(text, text) to authenticated;

create table public.complaint_endorsements (
  complaint_id text not null references public.community_records (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (complaint_id, user_id)
);

alter table public.complaint_endorsements enable row level security;
revoke all on public.complaint_endorsements from anon, authenticated;
grant select on public.complaint_endorsements to authenticated;

create policy "Signed-in users can read complaint endorsements"
  on public.complaint_endorsements for select to authenticated
  using (true);

create policy "Users can endorse complaints"
  on public.complaint_endorsements for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.community_records
      where id = complaint_id and kind = 'complaint'
    )
  );

create policy "Users can remove their own endorsements"
  on public.complaint_endorsements for delete to authenticated
  using (user_id = (select auth.uid()));

create table public.complaint_comments (
  id text primary key default gen_random_uuid()::text,
  complaint_id text not null references public.community_records (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.complaint_comments enable row level security;
revoke all on public.complaint_comments from anon, authenticated;
grant select, insert on public.complaint_comments to authenticated;

create policy "Signed-in users can read complaint comments"
  on public.complaint_comments for select to authenticated
  using (true);

create policy "Citizens can add complaint comments"
  on public.complaint_comments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_app_role()) in ('citizen', 'developer')
    and exists (
      select 1 from public.community_records
      where id = complaint_id and kind = 'complaint'
    )
  );

create or replace function public.toggle_complaint_endorsement(p_complaint_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  if (select public.current_app_role()) not in ('citizen', 'developer') then
    raise exception 'Your role cannot endorse complaints';
  end if;

  perform 1 from public.community_records
    where id = p_complaint_id and kind = 'complaint'
    for update;

  if not found then
    raise exception 'Complaint not found';
  end if;

  delete from public.complaint_endorsements
  where complaint_id = p_complaint_id and user_id = (select auth.uid());
  get diagnostics removed = row_count;

  if removed = 0 then
    insert into public.complaint_endorsements (complaint_id, user_id)
    values (p_complaint_id, (select auth.uid()));
  end if;

  update public.community_records
  set data = jsonb_set(
    data,
    '{upvotes}',
    to_jsonb(greatest(0, coalesce((data->>'upvotes')::integer, 0) + case when removed = 0 then 1 else -1 end))
  )
  where id = p_complaint_id and kind = 'complaint';

  return removed = 0;
end;
$$;

grant execute on function public.toggle_complaint_endorsement(text) to authenticated;

create or replace function public.set_user_role(target_user_id uuid, target_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.current_app_role()) <> 'developer' then
    raise exception 'Only developers can assign roles';
  end if;

  update public.profiles set role = target_role where id = target_user_id;
  if not found then
    raise exception 'User profile not found';
  end if;
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

create or replace function public.bootstrap_developer(user_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set role = 'developer'
  where id = (
    select id from auth.users
    where lower(email) = lower(user_email)
    limit 1
  );

  if not found then
    raise exception 'No registered account found for that email';
  end if;
end;
$$;

revoke all on function public.bootstrap_developer(text) from public, anon, authenticated;
