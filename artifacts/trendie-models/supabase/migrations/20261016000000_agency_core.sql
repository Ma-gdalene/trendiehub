-- TRENDIE MODELS: Supabase schema, trusted operations, private storage and RLS.
-- Never assign admin based only on an email claim or auth metadata.
create extension if not exists pgcrypto;
create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'model' check (role in ('model', 'admin')),
  full_name text not null default '',
  phone text,
  date_of_birth date,
  location text,
  height_cm numeric(5,1) check (height_cm is null or height_cm between 0 and 260),
  measurements jsonb not null default '{}'::jsonb,
  experience text,
  interests text[] not null default '{}',
  biography text,
  profile_photo_path text,
  portfolio_paths text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  application_status text not null default 'not_submitted'
    check (application_status in ('not_submitted', 'pending', 'approved', 'rejected')),
  review_reason text,
  points_balance integer not null default 0 check (points_balance >= 0),
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  statement text check (statement is null or char_length(statement) <= 2000),
  review_reason text,
  reviewer_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index applications_status_submitted_idx on public.applications(status, submitted_at desc);
create index applications_user_submitted_idx on public.applications(user_id, submitted_at desc);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  instructions text,
  deadline timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'submitted', 'completed', 'overdue', 'cancelled')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_deadline_idx on public.tasks(deadline) where status not in ('completed', 'cancelled');

create table public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  model_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'in_progress', 'submitted', 'completed', 'cancelled')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (task_id, model_id)
);
create index task_assignments_model_status_idx on public.task_assignments(model_id, status);

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.task_assignments(id) on delete cascade,
  notes text,
  evidence_paths text[] not null default '{}',
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected')),
  review_note text,
  reviewer_id uuid references public.profiles(id) on delete set null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index task_submissions_status_idx on public.task_submissions(status, submitted_at desc);

create table public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  delta integer not null check (delta <> 0),
  reason text not null check (char_length(reason) between 3 and 1000),
  submission_id uuid references public.task_submissions(id) on delete set null,
  created_at timestamptz not null default now()
);
create index points_transactions_model_created_idx on public.points_transactions(model_id, created_at desc);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  body text not null check (char_length(body) between 2 and 8000),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  audience text not null default 'all' check (audience in ('all', 'selected')),
  published_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_status_published_idx on public.announcements(status, published_at desc);
create table public.announcement_recipients (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (announcement_id, user_id)
);
create index announcement_recipients_user_idx on public.announcement_recipients(user_id, announcement_id);
create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index conversation_participants_user_idx on public.conversation_participants(user_id, conversation_id);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index notifications_unread_idx on public.notifications(user_id) where not is_read;

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  checked_in boolean not null default false,
  water_glasses integer not null default 0 check (water_glasses between 0 and 50),
  measurements jsonb not null default '{}'::jsonb,
  wellness text[] not null default '{}',
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);
create index daily_entries_user_date_idx on public.daily_entries(user_id, entry_date desc);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 160),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_requests_status_updated_idx on public.support_requests(status, updated_at desc);
create index support_requests_user_updated_idx on public.support_requests(user_id, updated_at desc);
create table public.support_replies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.support_requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index support_replies_request_created_idx on public.support_replies(request_id, created_at);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_created_idx on public.audit_events(created_at desc);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id);

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.suspended_at is null
  );
$$;

create or replace function private.is_active_model()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'model' and p.suspended_at is null
  );
$$;

create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.suspended_at is null
  );
$$;

create or replace function private.has_conversation_access(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id and cp.user_id = auth.uid()
  ) and private.is_active_user();
$$;

create or replace function private.protect_profile_fields()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if auth.uid() = old.id and not private.is_admin() then
    if new.role is distinct from old.role
      or new.application_status is distinct from old.application_status
      or new.review_reason is distinct from old.review_reason
      or new.points_balance is distinct from old.points_balance
      or new.suspended_at is distinct from old.suspended_at
      or new.email is distinct from old.email then
      raise exception 'Protected profile fields cannot be changed by the account owner'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.create_profile_for_new_auth_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    'model'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function private.sync_auth_email()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = lower(new.email), updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

create or replace function private.audit_row_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  entity_key text;
begin
  entity_key := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
  values (auth.uid(), lower(tg_op), tg_table_name, entity_key);
  return coalesce(new, old);
end;
$$;

create or replace function private.notify_new_message()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  sender_name text;
begin
  select full_name into sender_name from public.profiles where id = new.sender_id;
  update public.conversations set updated_at = new.created_at where id = new.conversation_id;
  insert into public.notifications(user_id, kind, title, body, link)
  select cp.user_id, 'message', 'New message from ' || coalesce(sender_name, 'TRENDIE MODELS'),
    left(new.body, 180), '/messages?conversation=' || new.conversation_id::text
  from public.conversation_participants cp
  where cp.conversation_id = new.conversation_id and cp.user_id <> new.sender_id;
  return new;
end;
$$;

create or replace function private.notify_support_reply()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  request_owner uuid;
begin
  select user_id into request_owner from public.support_requests where id = new.request_id;
  if request_owner <> new.author_id then
    insert into public.notifications(user_id, kind, title, body, link)
    values (request_owner, 'support', 'A reply to your support request', left(new.body, 180),
      '/support?request=' || new.request_id::text);
  end if;
  update public.support_requests set updated_at = new.created_at where id = new.request_id;
  return new;
end;
$$;

create or replace function public.submit_application(p_statement text default null)
returns public.applications
language plpgsql security definer set search_path = public, private, pg_temp as $$
declare
  current_profile public.profiles%rowtype;
  created_application public.applications%rowtype;
begin
  select * into current_profile from public.profiles where id = auth.uid() for update;
  if current_profile.id is null or current_profile.role <> 'model' or current_profile.suspended_at is not null then
    raise exception 'An active model account is required' using errcode = '42501';
  end if;
  if current_profile.application_status in ('pending', 'approved') then
    raise exception 'An application is already active or approved' using errcode = '23505';
  end if;
  insert into public.applications(user_id, statement) values (auth.uid(), p_statement)
    returning * into created_application;
  update public.profiles set application_status = 'pending', review_reason = null where id = auth.uid();
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'submit', 'applications', created_application.id::text);
  return created_application;
end;
$$;

create or replace function public.admin_decide_application(p_id uuid, p_status text, p_reason text)
returns public.applications
language plpgsql security definer set search_path = public, private, pg_temp as $$
declare
  decided public.applications%rowtype;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('approved', 'rejected') or char_length(trim(p_reason)) < 3 then
    raise exception 'A valid decision and reason are required' using errcode = '22023';
  end if;
  update public.applications set status = p_status, review_reason = trim(p_reason),
    reviewer_id = auth.uid(), reviewed_at = now()
  where id = p_id and status = 'pending' returning * into decided;
  if decided.id is null then raise exception 'Pending application not found' using errcode = 'P0002'; end if;
  update public.profiles set application_status = p_status, review_reason = trim(p_reason)
    where id = decided.user_id;
  insert into public.notifications(user_id, kind, title, body, link)
    values (decided.user_id, 'application', 'Application ' || p_status,
      trim(p_reason), '/dashboard');
  insert into public.audit_events(actor_id, action, entity_type, entity_id, details)
    values (auth.uid(), p_status, 'applications', p_id::text, jsonb_build_object('reason', trim(p_reason)));
  return decided;
end;
$$;

create or replace function public.admin_create_task(
  p_title text, p_description text, p_instructions text, p_deadline timestamptz,
  p_priority text, p_assignment_user_ids uuid[]
) returns public.tasks language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  created_task public.tasks%rowtype;
  candidate_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_priority not in ('low', 'normal', 'high', 'urgent') then
    raise exception 'Invalid priority' using errcode = '22023';
  end if;
  foreach candidate_id in array coalesce(p_assignment_user_ids, '{}') loop
    if not exists (select 1 from public.profiles p where p.id = candidate_id
      and p.role = 'model' and p.application_status = 'approved' and p.suspended_at is null) then
      raise exception 'Every assignee must be an active approved model' using errcode = '22023';
    end if;
  end loop;
  insert into public.tasks(title, description, instructions, deadline, priority, created_by)
    values (trim(p_title), p_description, p_instructions, p_deadline, p_priority, auth.uid())
    returning * into created_task;
  insert into public.task_assignments(task_id, model_id)
    select created_task.id, distinct_id from (select distinct unnest(coalesce(p_assignment_user_ids, '{}')) as distinct_id) ids;
  insert into public.notifications(user_id, kind, title, body, link)
    select model_id, 'task', 'New task: ' || created_task.title, left(created_task.description, 180), '/tasks'
    from public.task_assignments where task_id = created_task.id;
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'create', 'tasks', created_task.id::text);
  return created_task;
end;
$$;

create or replace function public.admin_update_task(p_id uuid, p_patch jsonb, p_assignment_user_ids uuid[] default null)
returns public.tasks language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  changed_task public.tasks%rowtype;
  candidate_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_patch ? 'priority' and p_patch->>'priority' not in ('low', 'normal', 'high', 'urgent') then
    raise exception 'Invalid priority' using errcode = '22023';
  end if;
  if p_patch ? 'status' and p_patch->>'status' not in ('open', 'in_progress', 'submitted', 'completed', 'overdue', 'cancelled') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;
  if p_assignment_user_ids is not null then
    foreach candidate_id in array p_assignment_user_ids loop
      if not exists (select 1 from public.profiles p where p.id = candidate_id
        and p.role = 'model' and p.application_status = 'approved' and p.suspended_at is null) then
        raise exception 'Every assignee must be an active approved model' using errcode = '22023';
      end if;
    end loop;
  end if;
  update public.tasks set
    title = case when p_patch ? 'title' then p_patch->>'title' else title end,
    description = case when p_patch ? 'description' then p_patch->>'description' else description end,
    instructions = case when p_patch ? 'instructions' then p_patch->>'instructions' else instructions end,
    deadline = case when p_patch ? 'deadline' then nullif(p_patch->>'deadline', '')::timestamptz else deadline end,
    priority = case when p_patch ? 'priority' then p_patch->>'priority' else priority end,
    status = case when p_patch ? 'status' then p_patch->>'status' else status end,
    updated_at = now()
  where id = p_id returning * into changed_task;
  if changed_task.id is null then raise exception 'Task not found' using errcode = 'P0002'; end if;
  if p_assignment_user_ids is not null then
    update public.task_assignments set status = 'cancelled'
    where task_id = p_id and status not in ('completed', 'cancelled')
      and not (model_id = any(coalesce(p_assignment_user_ids, '{}')));
    update public.task_assignments set status = 'open', completed_at = null
    where task_id = p_id and status = 'cancelled'
      and model_id = any(coalesce(p_assignment_user_ids, '{}'));
    insert into public.task_assignments(task_id, model_id)
      select p_id, distinct_id from (select distinct unnest(p_assignment_user_ids) as distinct_id) ids
      on conflict (task_id, model_id) do nothing;
  end if;
  insert into public.audit_events(actor_id, action, entity_type, entity_id, details)
    values (auth.uid(), 'update', 'tasks', p_id::text, p_patch);
  return changed_task;
end;
$$;

create or replace function public.submit_task(p_task_id uuid, p_notes text, p_evidence_paths text[])
returns public.task_submissions language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  assignment public.task_assignments%rowtype;
  submission public.task_submissions%rowtype;
begin
  if not private.is_active_model() then raise exception 'Active model access required' using errcode = '42501'; end if;
  select ta.* into assignment from public.task_assignments ta
  join public.tasks t on t.id = ta.task_id
  where ta.task_id = p_task_id and ta.model_id = auth.uid() and ta.status <> 'cancelled'
    and t.status <> 'cancelled' for update of ta;
  if assignment.id is null then raise exception 'Task assignment not found' using errcode = 'P0002'; end if;
  insert into public.task_submissions(assignment_id, notes, evidence_paths, status)
    values (assignment.id, p_notes, coalesce(p_evidence_paths, '{}'), 'submitted')
    on conflict (assignment_id) do update set notes = excluded.notes,
      evidence_paths = excluded.evidence_paths, status = 'submitted',
      review_note = null, reviewer_id = null, points_awarded = 0,
      submitted_at = now(), reviewed_at = null
    where public.task_submissions.status = 'rejected'
    returning * into submission;
  if submission.id is null then raise exception 'Submission is already awaiting review or complete' using errcode = '23505'; end if;
  update public.task_assignments set status = 'submitted' where id = assignment.id;
  update public.tasks set status = case
    when exists (select 1 from public.task_assignments where task_id = p_task_id and status <> 'completed') then 'submitted'
    else 'completed' end
  where id = p_task_id;
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'submit', 'task_submissions', submission.id::text);
  return submission;
end;
$$;

create or replace function public.admin_review_submission(
  p_id uuid, p_status text, p_review_note text, p_points_awarded integer
) returns public.task_submissions language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  submission public.task_submissions%rowtype;
  assignment public.task_assignments%rowtype;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('approved', 'rejected') or p_points_awarded < 0 then
    raise exception 'Invalid review decision' using errcode = '22023';
  end if;
  select * into submission from public.task_submissions where id = p_id and status = 'submitted' for update;
  if submission.id is null then raise exception 'Submission not awaiting review' using errcode = 'P0002'; end if;
  select * into assignment from public.task_assignments where id = submission.assignment_id;
  update public.task_submissions set status = p_status, review_note = p_review_note,
    reviewer_id = auth.uid(), points_awarded = case when p_status = 'approved' then p_points_awarded else 0 end,
    reviewed_at = now()
  where id = p_id returning * into submission;
  update public.task_assignments set status = case when p_status = 'approved' then 'completed' else 'in_progress' end,
    completed_at = case when p_status = 'approved' then now() else null end
  where id = assignment.id;
  update public.tasks set status = case
    when not exists (select 1 from public.task_assignments where task_id = assignment.task_id and status <> 'completed') then 'completed'
    when exists (select 1 from public.task_assignments where task_id = assignment.task_id and status = 'submitted') then 'submitted'
    else 'in_progress' end
  where id = assignment.task_id;
  if p_status = 'approved' and p_points_awarded > 0 then
    insert into public.points_transactions(model_id, actor_id, delta, reason, submission_id)
      values (assignment.model_id, auth.uid(), p_points_awarded, 'Task completion: ' ||
        (select title from public.tasks where id = assignment.task_id), submission.id);
    update public.profiles set points_balance = points_balance + p_points_awarded where id = assignment.model_id;
  end if;
  insert into public.notifications(user_id, kind, title, body, link)
    values (assignment.model_id, 'task_review', 'Task submission ' || p_status,
      coalesce(nullif(p_review_note, ''), 'Your task submission has been reviewed.'), '/tasks');
  insert into public.audit_events(actor_id, action, entity_type, entity_id, details)
    values (auth.uid(), p_status, 'task_submissions', p_id::text,
      jsonb_build_object('points_awarded', case when p_status = 'approved' then p_points_awarded else 0 end));
  return submission;
end;
$$;

create or replace function public.admin_award_points(p_model_id uuid, p_delta integer, p_reason text)
returns public.points_transactions language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  transaction_row public.points_transactions%rowtype;
  current_balance integer;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_delta = 0 or char_length(trim(p_reason)) < 3 then
    raise exception 'A non-zero adjustment and reason are required' using errcode = '22023';
  end if;
  update public.profiles set points_balance = points_balance + p_delta
    where id = p_model_id and role = 'model' and points_balance + p_delta >= 0
    returning points_balance into current_balance;
  if current_balance is null then raise exception 'Model not found or adjustment would make points negative' using errcode = '22023'; end if;
  insert into public.points_transactions(model_id, actor_id, delta, reason)
    values (p_model_id, auth.uid(), p_delta, trim(p_reason)) returning * into transaction_row;
  insert into public.notifications(user_id, kind, title, body, link)
    values (p_model_id, 'points', 'Points updated', trim(p_reason), '/points');
  insert into public.audit_events(actor_id, action, entity_type, entity_id, details)
    values (auth.uid(), 'adjust', 'points_transactions', transaction_row.id::text,
      jsonb_build_object('model_id', p_model_id, 'delta', p_delta, 'reason', trim(p_reason)));
  return transaction_row;
end;
$$;

create or replace function public.get_leaderboard()
returns table(user_id uuid, full_name text, profile_photo_path text, points integer, rank integer)
language sql stable security definer set search_path = public, private, pg_temp as $$
  select p.id, p.full_name, p.profile_photo_path, p.points_balance,
    row_number() over (order by p.points_balance desc, p.full_name asc)::integer
  from public.profiles p
  where p.role = 'model' and p.application_status = 'approved' and p.suspended_at is null
    and (private.is_admin() or private.is_active_model())
  order by p.points_balance desc, p.full_name asc
  limit 100;
$$;

create or replace function public.admin_save_announcement(
  p_id uuid, p_title text, p_body text, p_status text, p_audience text, p_recipient_ids uuid[]
) returns public.announcements language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  saved public.announcements%rowtype;
  recipient uuid;
  is_new boolean := p_id is null;
  existing_status text;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('draft', 'published', 'archived') or p_audience not in ('all', 'selected') then
    raise exception 'Invalid announcement status or audience' using errcode = '22023';
  end if;
  foreach recipient in array coalesce(p_recipient_ids, '{}') loop
    if not exists (select 1 from public.profiles p where p.id = recipient and p.role = 'model' and p.suspended_at is null) then
      raise exception 'Recipients must be active models' using errcode = '22023';
    end if;
  end loop;
  if is_new then
    insert into public.announcements(title, body, status, audience, published_at, created_by)
      values (trim(p_title), p_body, p_status, p_audience,
        case when p_status = 'published' then now() else null end, auth.uid())
      returning * into saved;
  else
    select status into existing_status from public.announcements where id = p_id for update;
    if existing_status is null then raise exception 'Announcement not found' using errcode = 'P0002'; end if;
    update public.announcements set title = trim(p_title), body = p_body, status = p_status,
      audience = p_audience,
      published_at = case when p_status = 'published' then coalesce(published_at, now()) else null end,
      updated_at = now()
    where id = p_id returning * into saved;
    if saved.id is null then raise exception 'Announcement not found' using errcode = 'P0002'; end if;
    delete from public.announcement_recipients where announcement_id = saved.id;
  end if;
  if p_audience = 'selected' then
    insert into public.announcement_recipients(announcement_id, user_id)
      select saved.id, distinct_id from (select distinct unnest(coalesce(p_recipient_ids, '{}')) as distinct_id) ids;
  end if;
  if p_status = 'published' and (is_new or existing_status is distinct from 'published') then
    insert into public.notifications(user_id, kind, title, body, link)
    select p.id, 'announcement', saved.title, left(saved.body, 180), '/announcements'
    from public.profiles p
    where p.role = 'model' and p.suspended_at is null
      and (p_audience = 'all' or exists (
        select 1 from public.announcement_recipients ar
        where ar.announcement_id = saved.id and ar.user_id = p.id
      ));
  end if;
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), case when is_new then 'create' else 'update' end,
      'announcements', saved.id::text);
  return saved;
end;
$$;

create or replace function public.start_conversation(p_recipient_id uuid, p_title text, p_initial_message text)
returns public.conversations language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  sender public.profiles%rowtype;
  recipient public.profiles%rowtype;
  created public.conversations%rowtype;
begin
  select * into sender from public.profiles where id = auth.uid() and suspended_at is null;
  select * into recipient from public.profiles where id = p_recipient_id and suspended_at is null;
  if sender.id is null or recipient.id is null or sender.id = recipient.id then
    raise exception 'Valid conversation participants are required' using errcode = '22023';
  end if;
  if not ((sender.role = 'model' and recipient.role = 'admin') or
    (sender.role = 'admin' and recipient.role = 'model')) then
    raise exception 'Conversations must be between a model and an authorized admin' using errcode = '42501';
  end if;
  insert into public.conversations(title) values (nullif(trim(p_title), '')) returning * into created;
  insert into public.conversation_participants(conversation_id, user_id)
    values (created.id, sender.id), (created.id, recipient.id);
  insert into public.messages(conversation_id, sender_id, body)
    values (created.id, sender.id, p_initial_message);
  return created;
end;
$$;

create or replace function public.create_support_request(p_subject text, p_message text)
returns public.support_requests language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  created public.support_requests%rowtype;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and suspended_at is null) then
    raise exception 'Active account required' using errcode = '42501';
  end if;
  insert into public.support_requests(user_id, subject) values (auth.uid(), trim(p_subject)) returning * into created;
  insert into public.support_replies(request_id, author_id, body) values (created.id, auth.uid(), p_message);
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'create', 'support_requests', created.id::text);
  return created;
end;
$$;

create or replace function public.admin_set_model_suspension(p_model_id uuid, p_suspended boolean)
returns public.profiles language plpgsql security definer
set search_path = public, private, pg_temp as $$
declare
  changed public.profiles%rowtype;
begin
  if not private.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.profiles set suspended_at = case when p_suspended then now() else null end,
    updated_at = now()
  where id = p_model_id and role = 'model' returning * into changed;
  if changed.id is null then raise exception 'Model not found' using errcode = 'P0002'; end if;
  insert into public.notifications(user_id, kind, title, body, link)
    values (p_model_id, 'account', case when p_suspended then 'Account suspended' else 'Account restored' end,
      case when p_suspended then 'Contact the agency if you need help.' else 'Your account access has been restored.' end,
      '/support');
  insert into public.audit_events(actor_id, action, entity_type, entity_id)
    values (auth.uid(), case when p_suspended then 'suspend' else 'restore' end, 'profiles', p_model_id::text);
  return changed;
end;
$$;

create trigger auth_user_created after insert on auth.users
for each row execute function private.create_profile_for_new_auth_user();
create trigger auth_user_email_changed after update of email on auth.users
for each row execute function private.sync_auth_email();
create trigger profiles_touch_updated before update on public.profiles
for each row execute function private.touch_updated_at();
create trigger profiles_protect_fields before update on public.profiles
for each row execute function private.protect_profile_fields();
create trigger tasks_touch_updated before update on public.tasks
for each row execute function private.touch_updated_at();
create trigger daily_entries_touch_updated before update on public.daily_entries
for each row execute function private.touch_updated_at();
create trigger support_requests_touch_updated before update on public.support_requests
for each row execute function private.touch_updated_at();
create trigger messages_notify after insert on public.messages
for each row execute function private.notify_new_message();
create trigger support_replies_notify after insert on public.support_replies
for each row execute function private.notify_support_reply();

create trigger audit_applications after insert or update or delete on public.applications
for each row execute function private.audit_row_change();
create trigger audit_tasks after insert or update or delete on public.tasks
for each row execute function private.audit_row_change();
create trigger audit_task_submissions after insert or update or delete on public.task_submissions
for each row execute function private.audit_row_change();
create trigger audit_points after insert or update or delete on public.points_transactions
for each row execute function private.audit_row_change();
create trigger audit_announcements after insert or update or delete on public.announcements
for each row execute function private.audit_row_change();
create trigger audit_support_requests after insert or update or delete on public.support_requests
for each row execute function private.audit_row_change();

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_submissions enable row level security;
alter table public.points_transactions enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_recipients enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.daily_entries enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_replies enable row level security;
alter table public.audit_events enable row level security;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_active_model() to authenticated;
grant execute on function private.is_active_user() to authenticated;
grant execute on function private.has_conversation_access(uuid) to authenticated;
grant select on public.profiles, public.applications, public.tasks, public.task_assignments,
  public.task_submissions, public.points_transactions, public.announcements,
  public.announcement_recipients, public.announcement_reads, public.conversations,
  public.conversation_participants, public.messages, public.notifications,
  public.daily_entries, public.support_requests, public.support_replies, public.audit_events
  to authenticated;
grant update (full_name, phone, date_of_birth, location, height_cm, measurements,
  experience, interests, biography, profile_photo_path, portfolio_paths, social_links)
  on public.profiles to authenticated;
grant update (is_read) on public.notifications to authenticated;
grant update (last_read_at) on public.conversation_participants to authenticated;
grant insert, update on public.daily_entries to authenticated;
grant insert on public.messages, public.support_replies, public.support_requests,
  public.announcement_reads to authenticated;
grant update (status) on public.support_requests to authenticated;

create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (id = auth.uid() or private.is_admin());
create policy profiles_update_owner_or_admin on public.profiles for update to authenticated
  using (id = auth.uid() or private.is_admin())
  with check (id = auth.uid() or private.is_admin());
create policy applications_read_owner_or_admin on public.applications for select to authenticated
  using ((user_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy tasks_read_admin_or_assigned on public.tasks for select to authenticated
  using (private.is_admin() or exists (
    select 1 from public.task_assignments ta where ta.task_id = id and ta.model_id = auth.uid()
  ));
create policy task_assignments_read_owner_or_admin on public.task_assignments for select to authenticated
  using ((model_id = auth.uid() and private.is_active_model()) or private.is_admin());
create policy submissions_read_owner_or_admin on public.task_submissions for select to authenticated
  using (private.is_admin() or (private.is_active_model() and exists (
    select 1 from public.task_assignments ta where ta.id = assignment_id and ta.model_id = auth.uid()
  )));
create policy points_read_owner_or_admin on public.points_transactions for select to authenticated
  using ((model_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy announcements_read_admin_or_recipient on public.announcements for select to authenticated
  using (private.is_admin() or (
    private.is_active_user() and status = 'published' and (audience = 'all' or exists (
      select 1 from public.announcement_recipients ar
      where ar.announcement_id = id and ar.user_id = auth.uid()
    ))
  ));
create policy announcement_recipients_read_admin_or_self on public.announcement_recipients for select to authenticated
  using ((user_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy announcement_reads_self on public.announcement_reads for select to authenticated
  using ((user_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy announcement_reads_insert_self on public.announcement_reads for insert to authenticated
  with check (user_id = auth.uid() and private.is_active_user() and exists (
    select 1 from public.announcements a where a.id = announcement_id
      and a.status = 'published' and (a.audience = 'all' or exists (
        select 1 from public.announcement_recipients ar
        where ar.announcement_id = a.id and ar.user_id = auth.uid()
      ))
  ));
create policy conversations_participant_read on public.conversations for select to authenticated
  using (private.has_conversation_access(id) or private.is_admin());
create policy conversation_participant_read_self on public.conversation_participants for select to authenticated
  using (user_id = auth.uid() or private.is_admin());
create policy conversation_participant_update_self on public.conversation_participants for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_participant_read on public.messages for select to authenticated
  using (private.has_conversation_access(conversation_id) or private.is_admin());
create policy messages_participant_send on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and private.has_conversation_access(conversation_id));
create policy notifications_read_self on public.notifications for select to authenticated
  using ((user_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy notifications_update_self on public.notifications for update to authenticated
  using (user_id = auth.uid() and private.is_active_user())
  with check (user_id = auth.uid() and private.is_active_user());
create policy daily_entries_self on public.daily_entries for all to authenticated
  using (user_id = auth.uid() and private.is_active_model())
  with check (user_id = auth.uid() and private.is_active_model());
create policy support_requests_owner_or_admin_read on public.support_requests for select to authenticated
  using ((user_id = auth.uid() and private.is_active_user()) or private.is_admin());
create policy support_requests_owner_create on public.support_requests for insert to authenticated
  with check (user_id = auth.uid() and private.is_active_user());
create policy support_requests_admin_update on public.support_requests for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy support_replies_owner_or_admin_read on public.support_replies for select to authenticated
  using (private.is_admin() or exists (
    select 1 from public.support_requests sr where sr.id = request_id and sr.user_id = auth.uid()
      and private.is_active_user()
  ));
create policy support_replies_owner_or_admin_create on public.support_replies for insert to authenticated
  with check (author_id = auth.uid() and (
    private.is_admin() or exists (
      select 1 from public.support_requests sr where sr.id = request_id and sr.user_id = auth.uid()
        and private.is_active_user()
    )
  ));
create policy audit_events_admin_read on public.audit_events for select to authenticated
  using (private.is_admin());

revoke all on function public.submit_application(text) from public;
revoke all on function public.admin_decide_application(uuid, text, text) from public;
revoke all on function public.admin_create_task(text, text, text, timestamptz, text, uuid[]) from public;
revoke all on function public.admin_update_task(uuid, jsonb, uuid[]) from public;
revoke all on function public.submit_task(uuid, text, text[]) from public;
revoke all on function public.admin_review_submission(uuid, text, text, integer) from public;
revoke all on function public.admin_award_points(uuid, integer, text) from public;
revoke all on function public.get_leaderboard() from public;
revoke all on function public.admin_save_announcement(uuid, text, text, text, text, uuid[]) from public;
revoke all on function public.start_conversation(uuid, text, text) from public;
revoke all on function public.create_support_request(text, text) from public;
revoke all on function public.admin_set_model_suspension(uuid, boolean) from public;
grant execute on function public.submit_application(text) to authenticated;
grant execute on function public.admin_decide_application(uuid, text, text) to authenticated;
grant execute on function public.admin_create_task(text, text, text, timestamptz, text, uuid[]) to authenticated;
grant execute on function public.admin_update_task(uuid, jsonb, uuid[]) to authenticated;
grant execute on function public.submit_task(uuid, text, text[]) to authenticated;
grant execute on function public.admin_review_submission(uuid, text, text, integer) to authenticated;
grant execute on function public.admin_award_points(uuid, integer, text) to authenticated;
grant execute on function public.get_leaderboard() to authenticated;
grant execute on function public.admin_save_announcement(uuid, text, text, text, text, uuid[]) to authenticated;
grant execute on function public.start_conversation(uuid, text, text) to authenticated;
grant execute on function public.create_support_request(text, text) to authenticated;
grant execute on function public.admin_set_model_suspension(uuid, boolean) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('portfolio', 'portfolio', false, 15728640, array['image/jpeg','image/png','image/webp']),
  ('task-evidence', 'task-evidence', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy private_model_files_read on storage.objects for select to authenticated
  using (bucket_id in ('profile-photos', 'portfolio', 'task-evidence')
    and (private.is_admin() or (private.is_active_model() and (storage.foldername(name))[1] = auth.uid()::text)));
create policy private_model_files_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('profile-photos', 'portfolio', 'task-evidence')
    and private.is_active_model() and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_model_files_update on storage.objects for update to authenticated
  using (bucket_id in ('profile-photos', 'portfolio', 'task-evidence')
    and (private.is_admin() or (private.is_active_model() and (storage.foldername(name))[1] = auth.uid()::text)))
  with check (bucket_id in ('profile-photos', 'portfolio', 'task-evidence')
    and (private.is_admin() or (private.is_active_model() and (storage.foldername(name))[1] = auth.uid()::text)));
create policy private_model_files_delete on storage.objects for delete to authenticated
  using (bucket_id in ('profile-photos', 'portfolio', 'task-evidence')
    and (private.is_admin() or (private.is_active_model() and (storage.foldername(name))[1] = auth.uid()::text)));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
      alter publication supabase_realtime add table public.notifications;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='announcements') then
      alter publication supabase_realtime add table public.announcements;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='task_assignments') then
      alter publication supabase_realtime add table public.task_assignments;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='tasks') then
      alter publication supabase_realtime add table public.tasks;
    end if;
  end if;
end $$;
