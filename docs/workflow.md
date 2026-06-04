# Workflows

## Approval State Machine

```
DRAFT
  └─[submit]──► SUBMITTED
                  ├─[HOD approve]──► UNDER_REVIEW
                  │                    ├─[ORIC Head approve]──► APPROVED
                  │                    │                          └──► SUBMITTED_TO_HEC ──► CLOSED
                  │                    └─[return]──► RETURNED
                  │                                   └──► (faculty corrects → re-submit → SUBMITTED)
                  └─[HOD reject]──► REJECTED
                                      └──► (faculty edits → re-submit → SUBMITTED)
```

- Backward transitions (REJECTED, RETURNED) require non-empty `reason`.
- Enforce in controller, not just UI.

## File Upload Rules

**Accepted MIME types:**
```ts
const ALLOWED = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
```

**Size limit:** 25 MB — enforced in Multer AND validated on mobile before upload.

**Naming convention (server-generated):**
```
[UniversityCode]_[KPI-Code]_[Year]_[DocType]_[Seq].[ext]
Example: DSU_B2_2025_AwardLetter_001.pdf
```

**S3 storage path:**
```
/uploads/{university_id}/{assessment_year}/{kpi_section}/{evidence_type}/
```

**Antivirus flow:**
1. Multer writes to temp
2. ClamAV scans
3. If clean → upload to S3
4. If threat → delete temp + HTTP 422 + audit log `UPLOAD_REJECTED_AV`

## Excel Parsing (HEC Score Card)

**Sheets to parse:**
- `Cover Page` — university name, category, period, summary scores
- `Score Card` — all KPI rows: Sr.No., description, max, self-score, HEC score, reported number
- `Index-A` through `Index-D` — section-specific detail tables

**Rules:**
1. Use ExcelJS — never `xlsx` or `csv-parser`
2. Check `.isMerged` before reading; use top-left cell of merge range
3. Section headers detected by background color OR merged cell text containing 'Section A', etc.
4. Column mapping in `constants/excelColumnMap.ts`
5. On re-upload: UPSERT where `status = DRAFT`, SKIP where `status = SUBMITTED` or higher
6. Log every parse error to `audit_logs` with row number and column reference
7. Return preview payload to client before committing — user must confirm

## Report Generation (PDF via Puppeteer)

- Generated server-side from HTML templates in `server/src/templates/reports/`
- Templates: `faculty-member.html`, `department.html`, `college.html`, `university.html`
- `university.html` must replicate HEC ORIC Score Card format exactly
- Output: temporary S3 object → signed URL (15-min expiry) → sent to client

**Date range params accepted by all report endpoints:**
```ts
interface DateRangeParams {
  presetRange?: 'THIS_YEAR'|'LAST_YEAR'|'LAST_2_YEARS'|'LAST_3_YEARS'|'LAST_5_YEARS';
  periodId?:     string;
  fromDate?:     string;   // ISO date
  toDate?:       string;
  quarter?:      'Q1'|'Q2'|'Q3'|'Q4';  // Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun
  comparePeriodId?: string;
}
```

## Offline Mode (Mobile)

**Works offline:**
- View previously loaded KPI entries and drafts (Zustand persist)
- Create new draft KPI entries (expo-file-system)
- Queue file uploads (uploadQueueStore)

**Requires connection:**
- Submit for review
- Approval actions
- Generate reports
- Fetch other users' data

**Upload queue contract:**
```ts
interface QueueItem {
  id:         string;   // local UUID
  filePath:   string;   // expo-file-system path
  endpoint:   string;
  metadata:   object;
  retryCount: number;   // max 3 before marking FAILED
  status:     'PENDING'|'IN_PROGRESS'|'FAILED';
  createdAt:  number;
}
```
Process FIFO on reconnect. Show failed items in Evidence Hub with "Retry" button.
