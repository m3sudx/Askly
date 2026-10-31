alter table messages add column if not exists failed boolean not null default false;

-- Mark the earlier test reply that failed because of the old model name
update messages set failed = true
where answered = false and model is not null and completion_tokens is null;

create or replace function dashboard_overview(p_tenant uuid, p_since timestamptz)
returns table (
  conversations bigint, questions bigint, answered bigint, unanswered bigint, failed bigint,
  avg_latency_ms numeric, prompt_tokens bigint, completion_tokens bigint,
  thumbs_up bigint, thumbs_down bigint
)
language sql stable as $$
  select
    (select count(*) from conversations c where c.tenant_id = p_tenant and c.started_at >= p_since),
    count(*) filter (where m.role = 'assistant'),
    count(*) filter (where m.role = 'assistant' and m.answered),
    count(*) filter (where m.role = 'assistant' and not m.answered and not m.failed),
    count(*) filter (where m.role = 'assistant' and m.failed),
    round(avg(m.latency_ms) filter (where m.role = 'assistant')),
    coalesce(sum(m.prompt_tokens), 0)::bigint,
    coalesce(sum(m.completion_tokens), 0)::bigint,
    (select count(*) from feedback f where f.tenant_id = p_tenant and f.created_at >= p_since and f.rating = 1),
    (select count(*) from feedback f where f.tenant_id = p_tenant and f.created_at >= p_since and f.rating = -1)
  from messages m
  where m.tenant_id = p_tenant and m.created_at >= p_since;
$$;

create or replace function unanswered_questions(p_tenant uuid, p_since timestamptz, p_limit int default 50)
returns table (question text, asked_at timestamptz, conversation_id uuid)
language sql stable as $$
  select q.content, a.created_at, a.conversation_id
  from messages a
  join lateral (
    select u.content from messages u
    where u.conversation_id = a.conversation_id and u.role = 'user' and u.created_at <= a.created_at
    order by u.created_at desc limit 1
  ) q on true
  where a.tenant_id = p_tenant and a.role = 'assistant'
    and not a.answered and not a.failed and a.created_at >= p_since
  order by a.created_at desc
  limit p_limit;
$$;

create or replace function downvoted_answers(p_tenant uuid, p_since timestamptz, p_limit int default 50)
returns table (message_id uuid, question text, answer text, comment text, rated_at timestamptz)
language sql stable as $$
  select a.id, q.content, a.content, f.comment, f.created_at
  from feedback f
  join messages a on a.id = f.message_id
  join lateral (
    select u.content from messages u
    where u.conversation_id = a.conversation_id and u.role = 'user' and u.created_at <= a.created_at
    order by u.created_at desc limit 1
  ) q on true
  where f.tenant_id = p_tenant and f.rating = -1 and f.created_at >= p_since
  order by f.created_at desc
  limit p_limit;
$$;

create or replace function daily_activity(p_tenant uuid, p_since timestamptz)
returns table (day date, questions bigint, unanswered bigint)
language sql stable as $$
  select (m.created_at at time zone 'UTC')::date,
         count(*),
         count(*) filter (where not m.answered and not m.failed)
  from messages m
  where m.tenant_id = p_tenant and m.role = 'assistant' and m.created_at >= p_since
  group by 1
  order by 1;
$$;