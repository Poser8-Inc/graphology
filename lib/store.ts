import { create } from 'zustand'
import type { GraphologyReading, UserProfile } from './supabase'
import type { SectionKey, GraphologyReport } from './graphologyAnalyzer'

export interface AnalysisSection {
  key: SectionKey
  label: string
  icon: string
  color: string
  content: string
  isStreaming: boolean
  isComplete: boolean
}

export interface AppState {
  // Auth
  userId: string | null
  profile: UserProfile | null
  setUserId: (id: string | null) => void
  setProfile: (profile: UserProfile | null) => void

  // Free tier gate
  analysesRemaining: number
  setAnalysesRemaining: (n: number) => void
  decrementAnalyses: () => void

  // Current capture
  capturedImageUri: string | null
  capturedImageBase64: string | null
  setCapturedImageUri: (uri: string | null) => void
  setCapturedImageBase64: (b64: string | null) => void

  // Active analysis
  activeReading: GraphologyReading | null
  fullReport: GraphologyReport | null
  analysisSections: AnalysisSection[]
  analysisStatus: 'idle' | 'loading' | 'streaming' | 'complete' | 'error'
  analysisError: string | null
  setActiveReading: (r: GraphologyReading | null) => void
  setFullReport: (r: GraphologyReport | null) => void
  setAnalysisStatus: (s: AppState['analysisStatus']) => void
  setAnalysisError: (e: string | null) => void
  appendSectionContent: (key: SectionKey, text: string) => void
  markSectionComplete: (key: SectionKey) => void
  resetAnalysis: () => void

  // History
  history: GraphologyReading[]
  setHistory: (readings: GraphologyReading[]) => void
  addToHistory: (reading: GraphologyReading) => void

  // Paywall
  paywallVisible: boolean
  setPaywallVisible: (v: boolean) => void
}

const FREE_ANALYSES_LIMIT = 2

const INITIAL_SECTIONS: AnalysisSection[] = [
  { key: 'baseline', label: 'Baseline Analysis', icon: '—', color: '#7A5C3A', content: '', isStreaming: false, isComplete: false },
  { key: 'slant', label: 'Slant Analysis', icon: '/', color: '#8B6F47', content: '', isStreaming: false, isComplete: false },
  { key: 'letterSize', label: 'Letter Size', icon: 'Aa', color: '#C4973A', content: '', isStreaming: false, isComplete: false },
  { key: 'pressure', label: 'Pressure', icon: '●', color: '#7A2020', content: '', isStreaming: false, isComplete: false },
  { key: 'spacing', label: 'Spacing', icon: '⟷', color: '#5A6A4A', content: '', isStreaming: false, isComplete: false },
  { key: 'specificLetters', label: 'Specific Letters', icon: 'fg', color: '#4A5A7A', content: '', isStreaming: false, isComplete: false },
  { key: 'signature', label: 'Signature vs Body', icon: '✍', color: '#6A4A7A', content: '', isStreaming: false, isComplete: false },
  { key: 'overallProfile', label: 'Overall Personality Profile', icon: '◈', color: '#C4973A', content: '', isStreaming: false, isComplete: false },
  { key: 'topTraits', label: 'Notable Traits', icon: '★', color: '#8B6F47', content: '', isStreaming: false, isComplete: false },
  { key: 'forensicNote', label: 'Forensic Note', icon: '⚖', color: '#5A5050', content: '', isStreaming: false, isComplete: false },
]

export const useStore = create<AppState>((set) => ({
  // Auth
  userId: null,
  profile: null,
  setUserId: (id) => set({ userId: id }),
  setProfile: (profile) => set({ profile }),

  // Free tier
  analysesRemaining: FREE_ANALYSES_LIMIT,
  setAnalysesRemaining: (n) => set({ analysesRemaining: n }),
  decrementAnalyses: () =>
    set((s) => ({ analysesRemaining: Math.max(0, s.analysesRemaining - 1) })),

  // Capture
  capturedImageUri: null,
  capturedImageBase64: null,
  setCapturedImageUri: (uri) => set({ capturedImageUri: uri }),
  setCapturedImageBase64: (b64) => set({ capturedImageBase64: b64 }),

  // Active analysis
  activeReading: null,
  fullReport: null,
  analysisSections: INITIAL_SECTIONS.map((s) => ({ ...s })),
  analysisStatus: 'idle',
  analysisError: null,
  setActiveReading: (r) => set({ activeReading: r }),
  setFullReport: (r) => set({ fullReport: r }),
  setAnalysisStatus: (s) => set({ analysisStatus: s }),
  setAnalysisError: (e) => set({ analysisError: e }),

  appendSectionContent: (key, text) =>
    set((state) => ({
      analysisSections: state.analysisSections.map((s) =>
        s.key === key
          ? { ...s, content: s.content + text, isStreaming: true, isComplete: false }
          : s
      ),
    })),

  markSectionComplete: (key) =>
    set((state) => ({
      analysisSections: state.analysisSections.map((s) =>
        s.key === key ? { ...s, isStreaming: false, isComplete: true } : s
      ),
    })),

  resetAnalysis: () =>
    set({
      activeReading: null,
      fullReport: null,
      analysisSections: INITIAL_SECTIONS.map((s) => ({ ...s })),
      analysisStatus: 'idle',
      analysisError: null,
      capturedImageUri: null,
      capturedImageBase64: null,
    }),

  // History
  history: [],
  setHistory: (readings) => set({ history: readings }),
  addToHistory: (reading) =>
    set((state) => ({ history: [reading, ...state.history] })),

  // Paywall
  paywallVisible: false,
  setPaywallVisible: (v) => set({ paywallVisible: v }),
}))
