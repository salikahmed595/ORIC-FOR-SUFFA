# Local Development

## Quick Start

```bash
# Full stack (recommended)
docker compose up -d        # starts app + db + redis + minio + nginx + clamav

# Or run individually:
cd server && npm run dev     # API on :3000
cd mobile && npx expo start  # Expo dev server
```

## Mobile Commands

```bash
cd mobile
npm install
npx expo start                              # Expo Go
npx expo run:android                        # Android emulator
eas build --platform android --profile preview    # Preview APK
eas build --platform android --profile production # Production APK
npx tsc --noEmit                            # Type check
npx eslint . --ext .ts,.tsx                 # Lint
```

## Server Commands

```bash
cd server
npm install
npm run dev                      # ts-node-dev hot reload
npm run start                    # PM2 production
npm test                         # Jest
npm run test:coverage            # Jest (must stay ≥ 80%)
npx prisma migrate dev --name <n>
npx prisma migrate deploy
npx prisma studio
npx prisma db seed
npx tsc --noEmit
npm run lint
```

## Docker Commands

```bash
docker compose up -d                    # start all
docker compose logs -f app              # app logs
docker compose logs -f db               # db logs
docker compose down                     # stop
docker compose up -d --build app        # rebuild app
docker compose exec app npx prisma migrate deploy
```

## Environment Variables

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_API_URL=https://oric-api.dsu.edu.pk/api/v1
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SENTRY_DSN=
```

### Server (`server/.env`)
```
NODE_ENV=
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dsu_oric
REDIS_URL=redis://:password@localhost:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d
BCRYPT_SALT_ROUNDS=12
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=dsu-oric-evidence
AWS_S3_SIGNED_URL_EXPIRY=900
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=ORIC PMS <noreply@dsu.edu.pk>
SENTRY_DSN=
MAX_UPLOAD_SIZE_MB=25
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

### Web Prototype (root `.env`)
```
SUPABASE_URL=https://tjrpffnbeqkhciwmlypb.supabase.co
SUPABASE_PUBLISHABLE_KEY=<see docs/supabase.md>
```

**Never commit `.env` files. Never hardcode secrets in source.**

## Known Gotchas

- **Merged cells in Excel**: Always check `.isMerged` before reading; use top-left cell of merge range.
- **Score precision**: Use `decimal.js` — never native JS floats for score arithmetic.
- **PDF/React Native**: Download to `expo-file-system` cache first, then display.
- **Push notifications Android**: Requires `google-services.json` (get from DSU IT — not committed).
- **SecureStore limit**: Max ~2KB. Store only JWT tokens; larger objects go in AsyncStorage.
- **EAS keystore**: Stored in EAS Credentials Manager. Do NOT regenerate. Losing it = can't update APK.
- **ClamAV cold start**: Takes ~30s on first start. Docker health check needs 60s start period.
- **Puppeteer in Docker**: Set `PUPPETEER_EXECUTABLE_PATH` to system Chrome path. Add `--no-sandbox`.

## Testing Requirements

- Server: ≥ 80% code coverage (Jest). PRs below threshold fail CI.
- Every new API endpoint needs ≥1 integration test in `server/tests/`.
- RBAC tests: each protected route must return 403 for every unauthorized role.
- Mobile: snapshot tests for all components in `components/ui/`.
