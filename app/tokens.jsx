// tokens.jsx — DSU ORIC PMS design tokens
// Exported to window as DSU (colors, fonts, spacing, shadows, helpers)

const C = {
  // brand
  maroon:      '#6B1A1A',
  maroonDark:  '#4A1010',
  maroonTint:  '#FDF8F8',
  yellow:      '#F5C518',
  yellowSoft:  '#FFF8E1',
  // surfaces
  white:       '#FFFFFF',
  surface:     '#F7F7F7',
  border:      '#E8E8E8',
  // text
  ink:         '#1A1A1A',
  ink2:        '#6B6B6B',
  ink3:        '#9E9E9E',
  inverse:     '#FFFFFF',
  brown:       '#5D4037',
  // semantic
  error:       '#D32F2F',
  success:     '#2E7D32',
  warning:     '#E65100',
  info:        '#1565C0',
  // section accents
  secA:        '#6B1A1A',
  secB:        '#1565C0',
  secC:        '#2E7D32',
  secD:        '#E65100',
};

const F = {
  display: "'Poppins', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
};

const SHADOW = {
  card:  '0 2px 8px rgba(26,26,26,0.05)',
  modal: '0 8px 24px rgba(26,26,26,0.12)',
  fab:   '0 4px 12px rgba(107,26,26,0.30)',
  header:'0 2px 10px rgba(107,26,26,0.18)',
};

// Status chip color map
const STATUS = {
  DRAFT:        { bg:'#F5F5F5', fg:'#757575', dot:'#BDBDBD', label:'Draft' },
  SUBMITTED:    { bg:'#E3F2FD', fg:'#1565C0', dot:'#1565C0', label:'Submitted' },
  UNDER_REVIEW: { bg:'#FFF3E0', fg:'#E65100', dot:'#E65100', label:'Under Review' },
  APPROVED:     { bg:'#E8F5E9', fg:'#2E7D32', dot:'#2E7D32', label:'Approved' },
  REJECTED:     { bg:'#FFEBEE', fg:'#D32F2F', dot:'#D32F2F', label:'Rejected' },
  RETURNED:     { bg:'#FFF8E1', fg:'#F57F17', dot:'#F57F17', label:'Returned' },
};

// Review rating → status + meta (the faculty/admin feedback loop)
const RATING = {
  perfect: { label:'Perfect',        status:'APPROVED', color:'#2E7D32', icon:'check',   blurb:'Meets all requirements. Approved.' },
  minor:   { label:'Minor mistakes', status:'RETURNED', color:'#F57F17', icon:'return',  blurb:'Returned for small corrections.' },
  bad:     { label:'Bad',            status:'REJECTED', color:'#D32F2F', icon:'x',        blurb:'Does not meet requirements. Rejected.' },
};

window.DSU = { C, F, SHADOW, STATUS, RATING };
