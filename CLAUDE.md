# CLAUDE.md — DSU ORIC PMS Index

> **Read this file first, then follow the links below. Each sub-doc covers one concern.**
> Do not re-read a sub-doc unless the task directly involves that area.

---

## Project Identity

| Field        | Value |
|--------------|-------|
| App Name     | DSU ORIC PMS |
| Client       | DHA Suffa University — ORIC |
| Platform     | Android APK (React Native + Expo SDK 51) + Web Prototype |
| Backend      | Node.js 20 + Express + TypeScript + PostgreSQL 16 (Supabase) |
| Policy Ref   | HEC ORIC Policy 2021 |
| Repo         | Monorepo: `/mobile` + `/server`; web prototype at root |

## Monorepo Layout

```
dsu-oric-pms/
├── mobile/          # React Native APK (Expo SDK 51)
├── server/          # Node.js + Express + TypeScript API
├── docs/            # Sub-docs (read as needed)
├── supabase/        # DB migrations & seed SQL
├── app/             # Web prototype source (JSX + CDN React)
├── index.html       # Web prototype entry (GitHub Pages)
├── docker-compose.yml
└── CLAUDE.md        ← you are here
```

## Sub-Documents — Read only what the task requires

| Doc | When to read |
|-----|-------------|
| [docs/design.md](docs/design.md) | Touching any UI color, font, spacing, or component |
| [docs/stack.md](docs/stack.md) | Choosing libraries, adding dependencies, directory structure |
| [docs/schema.md](docs/schema.md) | Any DB model, migration, or Prisma/Supabase change |
| [docs/kpi.md](docs/kpi.md) | KPI scoring logic, indicator codes, section maxes |
| [docs/rules.md](docs/rules.md) | Security, RBAC, audit logging — non-negotiable |
| [docs/local.md](docs/local.md) | Running the project locally, env vars, Docker |
| [docs/workflow.md](docs/workflow.md) | Approval flow, file uploads, Excel parsing, offline mode |
| [docs/supabase.md](docs/supabase.md) | Supabase project config, migrations, RLS |

---

*Last updated: June 2026 — DSU ORIC PMS v1.0*
