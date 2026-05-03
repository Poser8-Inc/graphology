// Dark academia color system
export const Colors = {
  // Backgrounds
  bg: '#0A0908',          // near black, warm
  surface: '#141210',     // slightly lighter warm dark
  paper: '#F2EBD9',       // aged parchment — handwriting display areas
  ink: '#1A1510',         // near black ink

  // Brand
  primary: '#8B6F47',     // warm brown — old leather, aged book
  primaryDim: '#6A5436',  // darker leather
  accent: '#C4973A',      // antique gold
  accentDim: '#8A6820',   // dimmer gold

  // Text
  text: '#EDE8DF',        // warm off-white
  textMuted: '#9A8F82',   // warm grey
  textOnPaper: '#2A1F14', // dark ink on parchment

  // UI
  red: '#7A2020',         // wax seal red
  redBright: '#9A2828',
  border: '#2A2520',      // warm dark border
  borderLight: '#3A3028', // slightly lighter border

  white: '#FFFFFF',
  black: '#000000',
  error: '#9A2828',
  success: '#3A6B3A',
} as const

export const Typography = {
  display: { fontSize: 42, fontWeight: '700' as const, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.8 },
  // Scholarly / forensic report style
  serif: { fontSize: 16, fontWeight: '400' as const, fontStyle: 'italic' as const, lineHeight: 26 },
  mono: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0.3, lineHeight: 20 },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const Shadows = {
  gold: {
    shadowColor: '#C4973A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  parchment: {
    shadowColor: '#8B6F47',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
} as const

// Graphology analysis section color coding
export const AnalysisSections = {
  baseline: { color: '#7A5C3A', label: 'Baseline Analysis', icon: '—' },
  slant: { color: '#8B6F47', label: 'Slant Analysis', icon: '/' },
  letterSize: { color: '#C4973A', label: 'Letter Size', icon: 'Aa' },
  pressure: { color: '#7A2020', label: 'Pressure', icon: '●' },
  spacing: { color: '#5A6A4A', label: 'Spacing', icon: '⟷' },
  specificLetters: { color: '#4A5A7A', label: 'Specific Letters', icon: 'fg' },
  signature: { color: '#6A4A7A', label: 'Signature vs Body', icon: '✍' },
  overallProfile: { color: '#C4973A', label: 'Overall Personality Profile', icon: '◈' },
  topTraits: { color: '#8B6F47', label: 'Notable Traits', icon: '★' },
  forensicNote: { color: '#5A5050', label: 'Forensic Note', icon: '⚖' },
} as const

export type AnalysisSectionKey = keyof typeof AnalysisSections
