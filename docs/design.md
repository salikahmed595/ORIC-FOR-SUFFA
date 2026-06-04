# Design System

## Color Tokens — import from `mobile/theme/colors.ts`, never hardcode hex

```ts
export const colors = {
  primary:       '#6B1A1A',  // Maroon   — headers, buttons, active states
  accent:        '#F5C518',  // Yellow   — FABs, badges, progress, highlights
  background:    '#FFFFFF',  // White    — ALL screen backgrounds
  surface:       '#F5F5F5',  // Lt Gray  — cards, inputs, list items
  border:        '#E0E0E0',  // Md Gray  — dividers, outlines
  textPrimary:   '#1A1A1A',  // Black    — body text, labels
  textSecondary: '#666666',  // Dk Gray  — subtitles, hints, metadata
  textInverse:   '#FFFFFF',  // White    — text on Maroon backgrounds
  error:         '#C62828',  // Deep Red — validation errors
  success:       '#2E7D32',  // Dk Green — approved states
};
```

## Typography — `mobile/theme/typography.ts`

| Role            | Font               | Weight   | Size |
|-----------------|--------------------|----------|------|
| Screen Title    | Poppins            | Bold     | 22sp |
| Section Heading | Poppins            | SemiBold | 18sp |
| Card Title      | Poppins            | Medium   | 15sp |
| Body Primary    | Inter              | Regular  | 14sp |
| Body Secondary  | Inter              | Regular  | 12sp |
| Caption         | Inter              | Light    | 11sp |
| Button Label    | Poppins            | SemiBold | 14sp |
| Score / Badge   | JetBrains Mono     | Bold     | 16sp |

## Spacing — `mobile/theme/spacing.ts`

```ts
export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32 };
export const radius  = { sm:6, md:12, lg:20, full:9999 };
```

## Section Accent Colors (web prototype `app/tokens.jsx`)

| Section | Color     |
|---------|-----------|
| A       | `#6B1A1A` |
| B       | `#1565C0` |
| C       | `#2E7D32` |
| D       | `#E65100` |

## Status Chip Colors

| Status       | Background | Foreground |
|--------------|------------|------------|
| DRAFT        | `#F5F5F5`  | `#757575`  |
| SUBMITTED    | `#E3F2FD`  | `#1565C0`  |
| UNDER_REVIEW | `#FFF3E0`  | `#E65100`  |
| APPROVED     | `#E8F5E9`  | `#2E7D32`  |
| REJECTED     | `#FFEBEE`  | `#D32F2F`  |
| RETURNED     | `#FFF8E1`  | `#F57F17`  |
