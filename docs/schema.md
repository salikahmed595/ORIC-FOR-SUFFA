# Database Schema

## Core Tables

| Table                  | Purpose |
|------------------------|---------|
| `users`                | All users + role + entity linkage |
| `universities`         | University master record |
| `faculties_colleges`   | Faculties within a university |
| `departments`          | Departments within faculties |
| `faculty_members`      | Individual researchers |
| `assessment_periods`   | Academic year periods with lifecycle status |
| `kpi_categories`       | A, B, C, D — top-level KPI groups |
| `kpi_indicators`       | Individual KPI sub-items (A1–A6, B1–B11, etc.) |
| `score_entries`        | University's score per KPI per period |
| `faculty_contributions`| Individual faculty contribution per KPI |
| `evidence_documents`   | Uploaded file metadata |
| `review_feedback`      | Reviewer ratings + comments |
| `audit_logs`           | Immutable append-only change log |

## Key Prisma Model — ScoreEntry

```prisma
model ScoreEntry {
  id             String      @id @default(uuid())
  universityId   String
  periodId       String
  kpiId          String
  selfScore      Decimal     @db.Decimal(5, 2)
  hecScore       Decimal?    @db.Decimal(5, 2)
  reportedNumber Decimal?    @db.Decimal(10, 2)
  remarks        String?
  status         ScoreStatus @default(DRAFT)
  submittedBy    String?
  submittedAt    DateTime?
  approvedBy     String?
  approvedAt     DateTime?
  evidence       EvidenceDocument[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@unique([universityId, periodId, kpiId])
  @@index([universityId, periodId])
}

enum ScoreStatus {
  DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED
  REJECTED | RETURNED | SUBMITTED_TO_HEC | CLOSED
}
```

## Score Precision Rule

Always use `Decimal` (Prisma) / `DECIMAL(5,2)` (Postgres) for scores.
Never use JavaScript `number` for arithmetic — use `decimal.js`.

## Migration Commands

```bash
cd server
npx prisma migrate dev --name <name>   # dev
npx prisma migrate deploy              # prod
npx prisma studio                      # visual browser
npx prisma db seed                     # seed KPI master data
```

## Seed Requirement

`kpi_categories` and `kpi_indicators` must be seeded before any other data.
Seed file: `server/prisma/seed.ts` (Prisma) or `supabase/migrations/002_seed.sql` (Supabase).

## Supabase Schema

Full Supabase-specific SQL lives in `supabase/migrations/`.
Run via Dashboard SQL Editor or `supabase db push`.
See [docs/supabase.md](supabase.md) for connection details.
