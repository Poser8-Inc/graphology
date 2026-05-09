import { log } from './log'
import { getAccessToken } from './supabase'

function assertGraphologyOracleUrl(): string {
  // Boot-time assertion: if this module is imported, the URL must exist.
  // Surfacing this as an Error here means the failure is visible at the
  // moment the analyzer is paged in (instructions / capture flow), not
  // mid-fetch with a confusing "fetch undefined" symptom.
  const url = process.env.EXPO_PUBLIC_GRAPHOLOGY_ORACLE_URL
  if (!url) {
    throw new Error(
      '[graphology/analyzer] EXPO_PUBLIC_GRAPHOLOGY_ORACLE_URL is not set in .env'
    )
  }
  return url
}
function assertSupabaseAnonKey(): string {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error(
      '[graphology/analyzer] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set in .env'
    )
  }
  return key
}
const GRAPHOLOGY_ORACLE_URL: string = assertGraphologyOracleUrl()
const SUPABASE_ANON_KEY: string = assertSupabaseAnonKey()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BaselineAnalysis {
  direction: 'ascending' | 'descending' | 'straight' | 'variable'
  interpretation: string
  detail: string
}

export interface SlantAnalysis {
  angle: 'right' | 'left' | 'vertical' | 'variable'
  degrees: string
  interpretation: string
  detail: string
}

export interface LetterSizeAnalysis {
  size: 'large' | 'small' | 'medium' | 'variable'
  interpretation: string
  detail: string
}

export interface PressureAnalysis {
  weight: 'heavy' | 'light' | 'medium' | 'variable'
  interpretation: string
  detail: string
}

export interface SpacingAnalysis {
  letterSpacing: string
  wordSpacing: string
  lineSpacing: string
  interpretation: string
  detail: string
}

export interface LetterFormAnalysis {
  letter: string
  feature: string      // e.g. "lower loop on g", "t-bar placement", "i-dot"
  observation: string  // what was actually seen
  interpretation: string
}

export interface PersonalityProfile {
  core: string         // Core personality paragraph
  professional: string // Professional strengths
  emotional: string    // Emotional tendencies
  interpersonal: string // Interpersonal style
  growth: string       // Areas for growth
}

export interface GraphologyReport {
  baseline: BaselineAnalysis
  slant: SlantAnalysis
  letterSize: LetterSizeAnalysis
  pressure: PressureAnalysis
  spacing: SpacingAnalysis
  specificLetters: LetterFormAnalysis[]
  signatureVsBody: string | null
  overallProfile: PersonalityProfile
  topTraits: string[]    // 5 observable traits
  forensicNote: string
  rawText: string        // full streamed text for local storage
}

// ─── Stream handler ───────────────────────────────────────────────────────────

export type SectionKey =
  | 'baseline'
  | 'slant'
  | 'letterSize'
  | 'pressure'
  | 'spacing'
  | 'specificLetters'
  | 'signature'
  | 'overallProfile'
  | 'topTraits'
  | 'forensicNote'

export interface StreamChunk {
  section: SectionKey
  text: string
  done: boolean
}

export type StreamCallback = (chunk: StreamChunk) => void

// Maps section header keywords from Claude's response to our SectionKey enum
const SECTION_HEADERS: Record<string, SectionKey> = {
  'BASELINE': 'baseline',
  'SLANT': 'slant',
  'LETTER SIZE': 'letterSize',
  'PRESSURE': 'pressure',
  'SPACING': 'spacing',
  'SPECIFIC LETTERS': 'specificLetters',
  'LETTER FORMS': 'specificLetters',
  'SIGNATURE': 'signature',
  'OVERALL PROFILE': 'overallProfile',
  'PERSONALITY PROFILE': 'overallProfile',
  'NOTABLE TRAITS': 'topTraits',
  'TOP TRAITS': 'topTraits',
  'FORENSIC NOTE': 'forensicNote',
}

function detectSection(line: string): SectionKey | null {
  const upper = line.toUpperCase().trim()
  // Strip markdown heading markers
  const clean = upper.replace(/^#+\s*/, '').replace(/\*+/g, '').trim()
  for (const [keyword, key] of Object.entries(SECTION_HEADERS)) {
    if (clean.includes(keyword)) return key
  }
  return null
}

// ─── Main analyzer ────────────────────────────────────────────────────────────

export async function analyzeHandwriting(
  imageBase64: string,
  onStream: StreamCallback
): Promise<GraphologyReport> {
  log.info('[graphologyAnalyzer] Starting analysis, image size:', imageBase64.length)

  const accessToken = await getAccessToken()
  const response = await fetch(GRAPHOLOGY_ORACLE_URL, {
    method: 'POST',
    // RN-specific: opt into response.body streaming on Android (off by default)
    // @ts-ignore — reactNative is RN-only fetch option, not in fetch types
    reactNative: { textStreaming: true },
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  })

  if (!response.ok) {
    const errText = await response.text()
    log.error('[graphologyAnalyzer] Oracle error:', response.status, errText)
    throw new Error(`Oracle returned ${response.status}: ${errText}`)
  }

  if (!response.body) {
    throw new Error('[graphologyAnalyzer] No response body for streaming')
  }

  // Stream parse
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let rawText = ''
  let currentSection: SectionKey = 'baseline'
  let sectionBuffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    rawText += chunk

    // Process line by line for section detection
    const lines = chunk.split('\n')
    for (const line of lines) {
      const detected = detectSection(line)
      if (detected) {
        // Flush buffer to current section
        if (sectionBuffer.trim()) {
          onStream({ section: currentSection, text: sectionBuffer, done: false })
        }
        currentSection = detected
        sectionBuffer = ''
      } else {
        sectionBuffer += line + '\n'
        onStream({ section: currentSection, text: line + '\n', done: false })
      }
    }
  }

  // Flush remainder
  if (sectionBuffer.trim()) {
    onStream({ section: currentSection, text: sectionBuffer, done: true })
  }

  // Signal completion
  onStream({ section: currentSection, text: '', done: true })

  log.info('[graphologyAnalyzer] Analysis complete, total chars:', rawText.length)

  // Parse structured report from raw text
  return parseReport(rawText)
}

// ─── Report parser ────────────────────────────────────────────────────────────

function extractSection(text: string, ...keywords: string[]): string {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase()
    const hit = keywords.some((k) => upper.includes(k))
    if (hit) {
      // Collect until next heading
      const result: string[] = []
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j]
        if (/^#{1,3}\s/.test(nextLine) || /^\*\*[A-Z]/.test(nextLine)) break
        result.push(nextLine)
      }
      return result.join('\n').trim()
    }
  }
  return ''
}

function extractTopTraits(text: string): string[] {
  const section = extractSection(text, 'NOTABLE TRAITS', 'TOP TRAITS')
  const lines = section.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
  return lines.slice(0, 5).map((l) => l.replace(/^[-•]\s*/, '').trim())
}

function parseReport(rawText: string): GraphologyReport {
  const baselineText = extractSection(rawText, 'BASELINE')
  const slantText = extractSection(rawText, 'SLANT')
  const sizeText = extractSection(rawText, 'LETTER SIZE')
  const pressureText = extractSection(rawText, 'PRESSURE')
  const spacingText = extractSection(rawText, 'SPACING')
  const lettersText = extractSection(rawText, 'SPECIFIC LETTERS', 'LETTER FORMS')
  const signatureText = extractSection(rawText, 'SIGNATURE')
  const profileText = extractSection(rawText, 'OVERALL PROFILE', 'PERSONALITY PROFILE')
  const forensicText = extractSection(rawText, 'FORENSIC NOTE')

  // Detect direction from baseline text
  const baselineUpper = baselineText.toUpperCase()
  let baselineDir: BaselineAnalysis['direction'] = 'straight'
  if (baselineUpper.includes('ASCEND') || baselineUpper.includes('UPWARD') || baselineUpper.includes('RISING')) {
    baselineDir = 'ascending'
  } else if (baselineUpper.includes('DESCEND') || baselineUpper.includes('DOWNWARD') || baselineUpper.includes('FALLING')) {
    baselineDir = 'descending'
  } else if (baselineUpper.includes('VARIABLE') || baselineUpper.includes('IRREGULAR')) {
    baselineDir = 'variable'
  }

  // Detect slant
  const slantUpper = slantText.toUpperCase()
  let slantAngle: SlantAnalysis['angle'] = 'vertical'
  if (slantUpper.includes('RIGHT') && !slantUpper.includes('LEFT')) slantAngle = 'right'
  else if (slantUpper.includes('LEFT') && !slantUpper.includes('RIGHT')) slantAngle = 'left'
  else if (slantUpper.includes('VARIABLE')) slantAngle = 'variable'

  // Detect letter size
  const sizeUpper = sizeText.toUpperCase()
  let size: LetterSizeAnalysis['size'] = 'medium'
  if (sizeUpper.includes('LARGE') || sizeUpper.includes('BIG') || sizeUpper.includes('OVERSIZED')) size = 'large'
  else if (sizeUpper.includes('SMALL') || sizeUpper.includes('TINY') || sizeUpper.includes('MINUTE')) size = 'small'
  else if (sizeUpper.includes('VARIABLE') || sizeUpper.includes('INCONSISTENT')) size = 'variable'

  // Detect pressure
  const pressureUpper = pressureText.toUpperCase()
  let pressure: PressureAnalysis['weight'] = 'medium'
  if (pressureUpper.includes('HEAVY') || pressureUpper.includes('STRONG') || pressureUpper.includes('DEEP')) pressure = 'heavy'
  else if (pressureUpper.includes('LIGHT') || pressureUpper.includes('DELICATE') || pressureUpper.includes('FAINT')) pressure = 'light'
  else if (pressureUpper.includes('VARIABLE')) pressure = 'variable'

  // Parse profile paragraphs — split on double newline or numbered markers
  const profileParagraphs = profileText.split(/\n\n+/).filter((p) => p.trim().length > 20)

  // Extract bullet-point letter forms
  const letterLines = lettersText.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
  const specificLetters: LetterFormAnalysis[] = letterLines.map((l) => {
    const text = l.replace(/^[-•]\s*/, '')
    const colonIdx = text.indexOf(':')
    if (colonIdx > -1) {
      return {
        letter: text.slice(0, colonIdx).trim(),
        feature: text.slice(0, colonIdx).trim(),
        observation: text.slice(colonIdx + 1).trim(),
        interpretation: text.slice(colonIdx + 1).trim(),
      }
    }
    return { letter: '?', feature: text, observation: text, interpretation: text }
  })

  return {
    baseline: {
      direction: baselineDir,
      interpretation: baselineText.split('\n')[0] ?? '',
      detail: baselineText,
    },
    slant: {
      angle: slantAngle,
      degrees: '',
      interpretation: slantText.split('\n')[0] ?? '',
      detail: slantText,
    },
    letterSize: {
      size,
      interpretation: sizeText.split('\n')[0] ?? '',
      detail: sizeText,
    },
    pressure: {
      weight: pressure,
      interpretation: pressureText.split('\n')[0] ?? '',
      detail: pressureText,
    },
    spacing: {
      letterSpacing: '',
      wordSpacing: '',
      lineSpacing: '',
      interpretation: spacingText.split('\n')[0] ?? '',
      detail: spacingText,
    },
    specificLetters,
    signatureVsBody: signatureText || null,
    overallProfile: {
      core: profileParagraphs[0] ?? '',
      professional: profileParagraphs[1] ?? '',
      emotional: profileParagraphs[2] ?? '',
      interpersonal: profileParagraphs[3] ?? '',
      growth: profileParagraphs[4] ?? '',
    },
    topTraits: extractTopTraits(rawText),
    forensicNote: forensicText,
    rawText,
  }
}
