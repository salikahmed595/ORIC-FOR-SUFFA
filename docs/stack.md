# Tech Stack

## Mobile (`/mobile`) — React Native + Expo SDK 51

| Layer       | Library |
|-------------|---------|
| Framework   | React Native 0.74 + Expo SDK 51 |
| Navigation  | React Navigation v6 (Stack + Tabs + Drawer) |
| State       | Zustand 4.x (global) + TanStack Query v5 (server) |
| Forms       | React Hook Form v7 + Zod |
| HTTP        | Axios 1.x with JWT interceptor |
| UI          | React Native Paper 5.x |
| Charts      | Victory Native XL (Skia) |
| File Pick   | expo-document-picker |
| Camera      | expo-image-picker |
| Storage     | expo-file-system + Zustand persist |
| Tokens      | expo-secure-store |
| Push Notifs | expo-notifications |
| Biometric   | expo-local-authentication |
| PDF View    | react-native-pdf |
| Icons       | MaterialCommunityIcons |
| Crash       | @sentry/react-native |
| Build       | EAS Build |

### Mobile Key Patterns

**API client** (`mobile/api/client.ts`): Axios + Bearer token + auto-refresh on 401. Never create raw fetch/axios in components.

**Zustand**: Use immer-style updates. Persist sensitive fields to `expo-secure-store`, not AsyncStorage. Max SecureStore value ~2KB — store only JWT tokens.

**TanStack Query**: Use `queryKeys` constants from `mobile/constants/queryKeys.ts`, never inline strings.

**Forms**: Define Zod schema first → infer TypeScript type. Zod on both client AND server.

## Server (`/server`) — Node.js + Express + TypeScript

| Layer     | Library |
|-----------|---------|
| Runtime   | Node.js 20 LTS |
| Framework | Express.js 4.x |
| Language  | TypeScript 5.x |
| ORM       | Prisma 5.x |
| Database  | PostgreSQL 16 (Supabase) |
| Cache     | Redis 7 (ioredis) |
| Auth      | jsonwebtoken + bcrypt + speakeasy (2FA) |
| Upload    | Multer (25MB, PDF/JPG/PNG/XLSX only) |
| Storage   | AWS S3 v3 SDK or MinIO |
| AV Scan   | ClamAV via clamav.js |
| Email     | Nodemailer |
| PDF Gen   | Puppeteer 22.x |
| Excel     | ExcelJS 4.x |
| Validate  | Zod |
| API Docs  | swagger-ui-express |
| Rate Limit| express-rate-limit + rate-limit-redis |
| Logging   | Winston + Morgan |
| Tests     | Jest + Supertest (≥80% coverage) |
| Process   | PM2 |

### Server RBAC Roles

```ts
export enum Role {
  SUPER_ADMIN       = 'SUPER_ADMIN',       // HEC — all universities
  UNIVERSITY_ADMIN  = 'UNIVERSITY_ADMIN',  // Full access to one university
  ORIC_HEAD         = 'ORIC_HEAD',         // Review + final sign-off
  DEAN              = 'DEAN',              // College-level review
  HOD               = 'HOD',               // Department-level review
  FACULTY           = 'FACULTY',           // Own contributions only
  AUDITOR           = 'AUDITOR',           // Read-only
}
```

### API Route Convention

```
GET    /api/v1/{resource}           → list
POST   /api/v1/{resource}           → create
GET    /api/v1/{resource}/:id       → get one
PUT    /api/v1/{resource}/:id       → update
DELETE /api/v1/{resource}/:id       → soft delete
POST   /api/v1/{resource}/:id/submit   → state transition
POST   /api/v1/{resource}/:id/approve  → state transition
```

**Response envelope:**
```ts
{ success: true,  data: T, meta?: { page, total } }
{ success: false, error: { code: string, message: string, details?: unknown } }
```

### Mobile Directory Highlights

```
mobile/app/         # Expo Router file-based screens
mobile/components/  # ui/, forms/, layout/
mobile/store/       # authStore, kpiStore, uploadQueueStore
mobile/api/         # client.ts + per-resource files
mobile/theme/       # colors, typography, spacing
mobile/constants/   # kpiCodes, roles, excelColumnMap, queryKeys
```

### Server Directory Highlights

```
server/src/routes/      # auth, users, kpi, uploads, reports, admin
server/src/controllers/
server/src/services/    # pdf, excel, storage, email, antivirus
server/src/middleware/  # auth (verifyJWT), rbac, upload, validate
server/src/prisma/      # schema.prisma — single source of truth
server/src/utils/       # jwt, fileNaming, auditLog, scoreCalc
```
