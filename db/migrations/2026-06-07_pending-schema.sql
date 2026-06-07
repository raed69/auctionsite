-- ============================================================================
-- AuctionSite — consolidated pending schema migration (2026-06-07)
--
-- Idempotent: safe to run multiple times against the shared Supabase project.
-- Run in the Supabase SQL editor (or psql) for project wljaxlqebojvbekwlrpy.
-- Covers the columns/tables the auction, payment, and blockchain services
-- expect. Until applied, those features error or degrade.
-- ============================================================================

-- ── auction-service ─────────────────────────────────────────────────────────
-- Reserve price + view counter on auctions, plus an atomic view-count RPC.
alter table auctions add column if not exists reserve_price numeric;
alter table auctions add column if not exists view_count int not null default 0;

create or replace function increment_view_count(auction_id uuid)
returns void language sql as $$
  update auctions set view_count = coalesce(view_count, 0) + 1 where id = auction_id;
$$;

-- ── payment-service ─────────────────────────────────────────────────────────
-- Outbid/settlement refunds. idempotency_key MUST be unique (dedupes retries).
create table if not exists refunds (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  amount          numeric not null,
  auction_id      text,
  reason          text,
  status          text not null default 'pending',
  idempotency_key text unique,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

-- Saved cards — NO PAN/CVV ever; only masked metadata + AES-256-GCM token.
create table if not exists saved_cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  brand            text,
  last4            text not null,
  exp_month        int not null,
  exp_year         int not null,
  label            text,
  token_ciphertext text,
  token_iv         text,
  token_tag        text,
  created_at       timestamptz not null default now()
);

-- ── blockchain-service ──────────────────────────────────────────────────────
-- On-chain transaction audit log (best-effort writes from TransactionLogService).
create table if not exists blockchain_transactions (
  id           uuid primary key default gen_random_uuid(),
  tx_signature text not null,
  tx_type      text not null,            -- create_auction | place_bid | close_auction | relay
  auction_id   text,
  wallet       text,
  amount_sol   numeric,
  status       text not null default 'confirmed',
  created_at   timestamptz not null default now()
);
