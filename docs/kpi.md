# KPI Reference

## Section Maxes (total = 100)

| Section | Name                              | Max | Indicators |
|---------|-----------------------------------|-----|------------|
| A       | Human Resource & Operations       | 10  | A1–A6      |
| B       | Research Excellence               | 45  | B1–B11     |
| C       | Innovation & Commercialization    | 30  | C1–C8      |
| D       | Sustainability & Capacity Building| 15  | D1–D6      |

## University Category by Total Score

| Score   | Category      | Research Overhead |
|---------|---------------|-------------------|
| ≥ 80    | W             | 15%               |
| 60–79   | X             | 10%               |
| 40–59   | Y             | 5%                |
| < 40    | Non-Complying | —                 |

## Indicator Max Scores

### Section A (10 pts)
| Code | Name                            | Max |
|------|---------------------------------|-----|
| A1   | ORIC Staffing Compliance        | 2   |
| A2   | Annual ORIC Operating Budget    | 2   |
| A3   | Research Policies & SOPs        | 2   |
| A4   | Capacity-Building Trainings     | 2   |
| A5   | Faculty Research Incentive Policy| 1  |
| A6   | ORIC Annual Report Published    | 1   |

### Section B (45 pts)
| Code | Name                              | Max |
|------|-----------------------------------|-----|
| B1   | HEC Research Proposals Submitted  | 4   |
| B2   | Research Grants Secured           | 6   |
| B3   | Impact-Factor Publications        | 9   |
| B4   | PhD Graduates Produced            | 6   |
| B5   | Citations Index (3-year)          | 4   |
| B6   | Post-doctoral Fellows             | 3   |
| B7   | Research Centers & Institutes     | 4   |
| B8   | Conference Papers & Presentations | 4   |
| B9   | Books & Book Chapters             | 3   |
| B10  | HEC-Recognized Research Journals  | 2   |
| B11  | Research Management System (RMIS) | 6   |

### Section C (30 pts)
| Code | Name                               | Max |
|------|------------------------------------|-----|
| C1   | Patents Filed                      | 5   |
| C2   | Patents Granted                    | 5   |
| C3   | Startups & Spin-offs               | 5   |
| C4   | Technology Licensing Agreements    | 4   |
| C5   | Industry-Sponsored Research Projects| 4  |
| C6   | Business Incubation Center         | 4   |
| C7   | Innovation Awards & Recognitions   | 2   |
| C8   | Technology Demonstrations          | 1   |

### Section D (15 pts)
| Code | Name                                  | Max |
|------|---------------------------------------|-----|
| D1   | Industry Collaborations (MoUs)        | 4   |
| D2   | Community Outreach Programs           | 3   |
| D3   | Conferences & Seminars Hosted         | 3   |
| D4   | International Linkages                | 2   |
| D5   | Green & Sustainable Research          | 2   |
| D6   | Media & Knowledge Dissemination       | 1   |

## Validation Rules (enforce client + server)

- `selfScore` ≤ `kpiIndicator.maxScore` — hard block, not a warning
- `reportedNumber` must be ≥ 0
- Ratio-based KPIs (B1, B3) require `department.phdFacultyCount > 0`
- Evidence upload required before DRAFT → SUBMITTED when `evidenceRequired = true`
- `assessmentPeriod.status` must be `ACTIVE` to accept submissions

## Score Arithmetic

Always use `decimal.js` — never native JS `number`. Floating-point errors break HEC totals.
Server-side score validation: `server/src/utils/scoreCalc.utils.ts`.
Client-side: `mobile/utils/scoreCalc.ts`.
