# Security Rules — Non-Negotiable

## The 10 Laws

1. **Never skip `verifyJWT` + `requireRole`** on any non-public route.
2. **Always scope Prisma queries to `req.user.entity_id`** — never return cross-university data.
3. **Audit log every state change** — write to DB → write to `audit_logs`. No exceptions.
4. **Antivirus before S3** — every upload scanned by ClamAV before storage, even in dev.
5. **Signed URLs only** — never expose S3 bucket URLs. All downloads via `/uploads/:id/download`.
6. **Validate on both sides** — Zod on server AND React Hook Form + Zod on mobile. Server is authoritative.
7. **2FA is mandatory** for `ORIC_HEAD`, `UNIVERSITY_ADMIN`, `SUPER_ADMIN`. Never bypass.
8. **Audit logs are append-only** — no `UPDATE` or `DELETE` on `audit_logs`, ever.
9. **Passwords are bcrypt only** — never MD5/SHA1/plain. Salt rounds = 12.
10. **Rate limit `/auth/login`** — 10 attempts per 15 minutes per IP via Redis.

## Audit Log Contract

```ts
writeAuditLog({
  userId, action, tableName, recordId,
  oldValue?, newValue?,
  ipAddress, userAgent
})
// action values: 'UPLOAD'|'SUBMIT'|'APPROVE'|'REJECT'|'DELETE'|'EDIT'|'LOGIN'
```

Call `writeAuditLog()` **before** returning the response, never after.

## RBAC Middleware Pattern

```ts
router.get('/reports/university/:id/:periodId',
  verifyJWT,
  requireRole(Role.UNIVERSITY_ADMIN, Role.ORIC_HEAD, Role.SUPER_ADMIN),
  reportController.getUniversityReport
);
```

## File Upload Security

- Accepted MIME: `application/pdf`, `image/jpeg`, `image/png`, `.xlsx`
- Max size: 25 MB (enforced in Multer AND mobile client)
- ClamAV rejection → delete temp file → HTTP 422 `FILE_THREAT_DETECTED` → audit log `UPLOAD_REJECTED_AV`
- File name generated server-side: `[UniCode]_[KPI]_[Year]_[DocType]_[Seq].[ext]`
- Storage path: `/uploads/{university_id}/{year}/{kpi_section}/{evidence_type}/`

## Approval Workflow (state machine)

```
DRAFT
  └─[submit]──► SUBMITTED
                  ├─[HOD approve]──► UNDER_REVIEW
                  │                    ├─[ORIC Head approve]──► APPROVED ──► SUBMITTED_TO_HEC ──► CLOSED
                  │                    └─[return]──► RETURNED ──► (back to SUBMITTED after correction)
                  └─[HOD reject]──► REJECTED ──► (faculty edits → re-submit)
```

Any backward transition (REJECTED, RETURNED) requires a non-empty `reason` string.
Enforce in the controller — not just the UI.

## Sensitive Contact

Security incidents → security@dsu.edu.pk (DSU CISO)
