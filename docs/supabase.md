# Supabase Configuration

## Project Details

| Field              | Value |
|--------------------|-------|
| Project URL        | `https://tjrpffnbeqkhciwmlypb.supabase.co` |
| Project Ref        | `tjrpffnbeqkhciwmlypb` |
| Region             | (auto-assigned) |
| Dashboard          | https://supabase.com/dashboard/project/tjrpffnbeqkhciwmlypb |

**Publishable key** (safe for browser/client code):
```
sb_publishable_MJDG46Fa8O3gJvVf3KGJdw_WBZrkPgV
```

**DB password**: stored in `.env` only — never commit. See `.env.example`.

## Running Migrations

### Option A — Supabase Dashboard (easiest)
1. Open https://supabase.com/dashboard/project/tjrpffnbeqkhciwmlypb/sql/new
2. Paste and run each migration file in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_seed.sql`
   - `supabase/migrations/003_rls.sql`

### Option B — Supabase CLI
```bash
# Install CLI (once)
npm install -g supabase

# Authenticate
supabase login

# Init (once, in project root)
supabase init

# Link to this project
supabase link --project-ref tjrpffnbeqkhciwmlypb

# Push all migrations
supabase db push
```

## Schema Overview

Tables (see `supabase/migrations/001_schema.sql` for full DDL):

| Table                | Purpose |
|----------------------|---------|
| `kpi_categories`     | A, B, C, D sections |
| `kpi_indicators`     | All 31 indicators |
| `assessment_periods` | Academic year cycles |
| `score_entries`      | One row per indicator per period |
| `evidence_documents` | Uploaded file metadata |
| `review_feedback`    | HEC reviewer ratings + comments |
| `audit_logs`         | Immutable action log |

## Row Level Security

All tables have RLS enabled. Current policies (prototype) allow full access to `anon` and `authenticated` roles.

**Before production:** Tighten to scope by `university_id` and role. See `supabase/migrations/003_rls.sql`.

## Web App Connection (`app/db.jsx`)

The web prototype connects using the Supabase JS client loaded via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```

Client initialization:
```js
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

## Connection String (server/Prisma only — never in browser)

```
postgresql://postgres:[PASSWORD]@db.tjrpffnbeqkhciwmlypb.supabase.co:5432/postgres
```

Store in `server/.env` as `DATABASE_URL`. Password in `.env` only.

## Contacts

- Supabase docs: https://supabase.com/docs
- SQL editor: https://supabase.com/dashboard/project/tjrpffnbeqkhciwmlypb/sql
- Table editor: https://supabase.com/dashboard/project/tjrpffnbeqkhciwmlypb/editor
