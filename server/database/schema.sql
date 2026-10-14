-- Askly: Supabase / Postgres schema (simplified, no evaluation tables)
-- Run in the Supabase SQL editor. Embedding size 768 assumes Gemini embeddings
-- reduced to 768 dimensions; change vector(768) if you use another model.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ============ Core: tenants, documents, chunks ============

create table tenants (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  public_key       text not null unique default encode(gen_random_bytes(16), 'hex'), -- used by the embed script
  allowed_domains  text[] not null default '{}',                                     -- origin check for the widget
  default_language text not null default 'en' check (default_language in ('en', 'am')),
  created_at       timestamptz not null default now()
);

create table documents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  source_type  text not null check (source_type in ('url', 'pdf', 'text')),
  source_url   text,
  title        text,
  status       text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'failed')),
  error        text,
  content_hash text,                                   -- skip re-embedding unchanged content
  created_at   timestamptz not null default now(),
  unique (tenant_id, content_hash)
);

create table chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,  -- denormalized for fast filtering + RLS
  chunk_index int not null,
  content     text not null,
  language    text,
  token_count int,
  embedding   vector(768),
  -- 'simple' config: no stemming, works for Amharic as well as English
  fts         tsvector generated always as (to_tsvector('simple', content)) stored,
  unique (document_id, chunk_index)
);

create index chunks_tenant_idx    on chunks (tenant_id);
create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);
create index chunks_fts_idx       on chunks using gin (fts);

-- ============ Conversations and analytics ============

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  visitor_id text not null,                            -- anonymous id stored in the visitor's browser
  language   text,
  started_at timestamptz not null default now()
);

create table messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references conversations(id) on delete cascade,
  tenant_id         uuid not null references tenants(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  answered          boolean,                           -- assistant only: false = "I don't know" fallback
  model             text,
  prompt_tokens     int,
  completion_tokens int,
  latency_ms        int,
  cost_usd          numeric(10, 6),
  created_at        timestamptz not null default now()
);

create index messages_tenant_time_idx on messages (tenant_id, created_at desc);

-- which chunks were used to answer which message (powers citations)
create table message_sources (
  message_id uuid not null references messages(id) on delete cascade,
  chunk_id   uuid not null references chunks(id) on delete cascade,
  rank       int not null,
  score      real,
  primary key (message_id, chunk_id)
);

create table feedback (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references messages(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  rating     smallint not null check (rating in (-1, 1)),
  comment    text,
  created_at timestamptz not null default now()
);

-- ============ Retrieval function (vector search; add hybrid in app/SQL later) ============

create or replace function match_chunks(
  p_tenant_id uuid,
  p_query     vector(768),
  p_top_k     int default 5
)
returns table (id uuid, document_id uuid, content text, score real)
language sql stable as $$
  select c.id, c.document_id, c.content, (1 - (c.embedding <=> p_query))::real as score
  from chunks c
  where c.tenant_id = p_tenant_id
  order by c.embedding <=> p_query
  limit p_top_k;
$$;

-- ============ Row level security ============
-- The widget talks to your API (service role), which checks public_key + allowed_domains.
-- The dashboard uses the logged-in owner, so RLS only needs owner policies.

create or replace function is_tenant_owner(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from tenants t where t.id = p_tenant_id and t.owner_id = auth.uid());
$$;

alter table tenants         enable row level security;
alter table documents       enable row level security;
alter table chunks          enable row level security;
alter table conversations   enable row level security;
alter table messages        enable row level security;
alter table message_sources enable row level security;
alter table feedback        enable row level security;

create policy tenants_owner on tenants for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy documents_owner     on documents      for all using (is_tenant_owner(tenant_id)) with check (is_tenant_owner(tenant_id));
create policy chunks_owner        on chunks         for all using (is_tenant_owner(tenant_id)) with check (is_tenant_owner(tenant_id));
create policy conversations_owner on conversations for select using (is_tenant_owner(tenant_id));
create policy messages_owner      on messages       for select using (is_tenant_owner(tenant_id));
create policy feedback_owner      on feedback       for select using (is_tenant_owner(tenant_id));

create policy message_sources_owner on message_sources for select using (
  exists (select 1 from messages m where m.id = message_id and is_tenant_owner(m.tenant_id))
);