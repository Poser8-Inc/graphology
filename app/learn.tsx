import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'

interface HistorianEntry {
  name: string
  years: string
  contribution: string
}

interface IndicatorEntry {
  name: string
  icon: string
  color: string
  description: string
  examples: string[]
}

interface FamousEntry {
  name: string
  trait: string
  handwritingNote: string
}

const HISTORIANS: HistorianEntry[] = [
  {
    name: 'Camillo Baldi',
    years: '1547–1634',
    contribution:
      'Italian physician who published the first known graphology treatise in 1622. "Trattato come da una lettera missiva si conoscano la natura e qualità dello scrittore." He argued that handwriting reveals character as naturally as speech.',
  },
  {
    name: 'Jean-Charles Gille-Maisani',
    years: '1920–2008',
    contribution:
      'French psychologist and graphologist who systematized the discipline. His "Psychologie de l\'écriture" (1951) became foundational, establishing rigorous methods for psychological profiling from script.',
  },
  {
    name: 'Ludwig Klages',
    years: '1872–1956',
    contribution:
      'German philosopher and the most influential theorist of graphology. Founded the German school of graphology (Ausdruckskunde), which viewed writing as an expressive movement of the whole organism — not just the hand.',
  },
  {
    name: 'Alfred Binet',
    years: '1857–1911',
    contribution:
      'Creator of the IQ test who also studied graphology. He found experienced graphologists could correctly identify high vs. low intelligence from handwriting at above-chance rates, lending early empirical weight to the field.',
  },
]

const INDICATORS: IndicatorEntry[] = [
  {
    name: 'Baseline',
    icon: '—',
    color: '#7A5C3A',
    description: 'The imaginary line on which writing rests. Reveals emotional stability and mood.',
    examples: [
      'Rising: optimism, ambition, enthusiasm',
      'Falling: fatigue, pessimism, depression',
      'Straight: self-control, discipline, reliability',
      'Variable: emotional instability, adaptability',
    ],
  },
  {
    name: 'Slant',
    icon: '/',
    color: '#8B6F47',
    description: 'The angle of letters relative to the baseline. Shows social and emotional orientation.',
    examples: [
      'Right slant: extrovert, warm, emotionally expressive',
      'Left slant: private, self-contained, reserved',
      'Vertical: logical, controlled, independent',
      'Variable slant: emotional inconsistency, versatility',
    ],
  },
  {
    name: 'Letter Size',
    icon: 'Aa',
    color: '#C4973A',
    description: 'The height and width of the middle zone letters (a, e, m, n, o, etc.).',
    examples: [
      'Large: need for recognition, confidence, extroversion',
      'Small: analytical, detail-oriented, academic focus',
      'Medium: realistic self-assessment, adaptability',
      'Variable: adaptability or emotional inconsistency',
    ],
  },
  {
    name: 'Pressure',
    icon: '●',
    color: '#7A2020',
    description: 'How hard the pen presses on the page. Correlates with emotional intensity and vitality.',
    examples: [
      'Heavy: strong emotions, vitality, determination',
      'Light: sensitivity, spiritual nature, empathy',
      'Medium: balanced emotional expression',
      'Variable: emotional ups and downs, creative energy',
    ],
  },
  {
    name: 'Spacing',
    icon: '⟷',
    color: '#5A6A4A',
    description: 'Space between letters, words, and lines. Reveals relationship to others and clarity of mind.',
    examples: [
      'Wide word spacing: need for distance and independence',
      'Narrow word spacing: desire for closeness, intolerance of loneliness',
      'Wide line spacing: clear thinking, organizational ability',
      'Cramped lines: unclear thinking, poor judgment of social distance',
    ],
  },
  {
    name: 'Three Zones',
    icon: '≡',
    color: '#4A5A7A',
    description: 'Upper zone (b, d, f, h, k, l, t), middle zone, lower zone (g, j, p, q, y). Each maps to a life domain.',
    examples: [
      'Upper zone: intellect, spirituality, idealism',
      'Middle zone: daily life, social adaptation, ego',
      'Lower zone: material concerns, sexuality, instincts',
      'Dominant zone reveals life focus',
    ],
  },
  {
    name: 'Specific Letters',
    icon: 'ℓg',
    color: '#6A4A7A',
    description: 'Individual letter forms carry specific meanings. Some are particularly diagnostic.',
    examples: [
      't-bar high: ambition and idealism',
      't-bar low: lack of confidence or caution',
      'i-dot above letter: imagination, precision',
      'g/y loops: sexual drive, material focus, past ties',
    ],
  },
  {
    name: 'Connections',
    icon: '∿',
    color: '#3A5A5A',
    description: 'How letters connect within words. Shows thinking style and social behavior.',
    examples: [
      'Garlands (cup-shaped): friendly, adaptable, conventional',
      'Arcades (arch-shaped): privacy, formality, artistry',
      'Angles: determination, willpower, inflexibility',
      'Threads: speed, intelligence, sometimes evasion',
    ],
  },
]

const FAMOUS: FamousEntry[] = [
  {
    name: 'Adolf Hitler',
    trait: 'Narcissism, paranoia, brutal control',
    handwritingNote:
      'Extreme right slant indicating intense emotionality. Very heavy pressure revealing powerful drives. Angular connections showing aggression and inflexibility. Oversized capital "I" confirming pathological ego.',
  },
  {
    name: 'Albert Einstein',
    trait: 'Visionary intellect, unconventional mind',
    handwritingNote:
      'Highly irregular letter spacing suggesting non-linear thinking. Light pressure indicating a spiritual, non-materialistic orientation. Thread connections common in fast, intuitive thinkers who skip logical steps.',
  },
  {
    name: 'Abraham Lincoln',
    trait: 'Steady leadership, melancholy, profound depth',
    handwritingNote:
      'Distinctive falling baseline in later years — consistent with the depression he documented. Yet strong upstrokes in capital letters show maintained idealism. Controlled pressure revealing contained emotional depth.',
  },
  {
    name: 'Marilyn Monroe',
    trait: 'Vulnerability, desire for love, intelligence masked',
    handwritingNote:
      'Heavy pressure indicating strong passions and emotional intensity. Large, rightward-leaning letters showing need for connection and approval. Unstable baseline reflecting her documented emotional volatility.',
  },
]

export default function LearnScreen() {
  const router = useRouter()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>The Science of Graphology</Text>
        <Text style={styles.subtitle}>
          Four centuries of handwriting analysis — from physicians to the FBI
        </Text>
      </View>

      {/* History section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Historical Roots</Text>
        <Text style={styles.sectionIntro}>
          Graphology predates psychology as a formal discipline. The connection between handwriting
          and character was observed by physicians and philosophers centuries before Freud.
        </Text>

        {HISTORIANS.map((h, i) => (
          <View key={i} style={styles.historianCard}>
            <View style={styles.historianHeader}>
              <Text style={styles.historianName}>{h.name}</Text>
              <Text style={styles.historianYears}>{h.years}</Text>
            </View>
            <Text style={styles.historianContribution}>{h.contribution}</Text>
          </View>
        ))}
      </View>

      {/* Forensic vs personality */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Forensic vs Personality Graphology</Text>
        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Forensic Graphology</Text>
            <Text style={styles.comparisonSubtitle}>Used in courts and investigations</Text>
            <Text style={styles.comparisonText}>
              Focuses on identifying whether two documents were written by the same person,
              detecting forgeries, and establishing authenticity. Used by the FBI, Scotland Yard,
              and European judicial systems. Relies on measurable, objective features.
            </Text>
          </View>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Personality Graphology</Text>
            <Text style={styles.comparisonSubtitle}>Used in HR and counseling</Text>
            <Text style={styles.comparisonText}>
              Interprets psychological traits from handwriting features. Widely used in European
              corporate hiring (especially France and Germany), psychotherapy, and self-development.
              More interpretive; best understood as a projective technique.
            </Text>
          </View>
        </View>
      </View>

      {/* The 8 indicators */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>The 8 Key Indicators</Text>
        <Text style={styles.sectionIntro}>
          Every graphological analysis examines these fundamental dimensions.
        </Text>

        {INDICATORS.map((ind, i) => (
          <View key={i} style={styles.indicatorCard}>
            <View style={styles.indicatorHeader}>
              <View style={[styles.indicatorIcon, { backgroundColor: ind.color + '22', borderColor: ind.color + '44' }]}>
                <Text style={[styles.indicatorIconText, { color: ind.color }]}>{ind.icon}</Text>
              </View>
              <View style={styles.indicatorHeaderText}>
                <Text style={styles.indicatorName}>{ind.name}</Text>
                <Text style={styles.indicatorDesc}>{ind.description}</Text>
              </View>
            </View>
            <View style={styles.indicatorExamples}>
              {ind.examples.map((ex, j) => (
                <View key={j} style={styles.exampleRow}>
                  <View style={[styles.exampleDot, { backgroundColor: ind.color }]} />
                  <Text style={styles.exampleText}>{ex}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Famous handwriting */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Famous Handwriting Analyses</Text>
        <Text style={styles.sectionIntro}>
          Historical graphologists and modern researchers have analyzed these subjects.
        </Text>

        {FAMOUS.map((f, i) => (
          <View key={i} style={styles.famousCard}>
            <View style={styles.famousHeader}>
              <Text style={styles.famousName}>{f.name}</Text>
              <Text style={styles.famousTrait}>{f.trait}</Text>
            </View>
            <Text style={styles.famousNote}>{f.handwritingNote}</Text>
          </View>
        ))}
      </View>

      {/* Practice section */}
      <View style={[styles.section, styles.practiceSection]}>
        <Text style={styles.sectionHeader}>How to Practice</Text>
        {[
          'Collect writing samples from multiple occasions — not just one day.',
          'Look for patterns, not isolated features. Any single trait can have multiple interpretations.',
          'Always compare the signature to the body text. Differences reveal the gap between public and private self.',
          'Consider context: illness, age, writing instrument, and surface all affect output.',
          'The baseline reveals current mood; other features reveal deeper character.',
          'The most revealing samples are written quickly, without self-consciousness.',
        ].map((tip, i) => (
          <View key={i} style={styles.practiceTip}>
            <Text style={styles.practiceTipNumber}>{i + 1}</Text>
            <Text style={styles.practiceTipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push('/instructions')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaBtnText}>Analyze My Handwriting</Text>
        <Text style={styles.ctaBtnArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.bottomPad} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: 40,
  },

  header: {
    paddingTop: 64,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 24,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    ...Typography.h2,
    color: Colors.accent,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  sectionIntro: {
    ...Typography.body,
    color: Colors.textMuted,
    lineHeight: 26,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },

  // Historians
  historianCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  historianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  historianName: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
  },
  historianYears: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  historianContribution: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  // Comparison
  comparisonGrid: {
    gap: Spacing.md,
  },
  comparisonCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  comparisonTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  comparisonSubtitle: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  comparisonText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  // Indicators
  indicatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  indicatorHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  indicatorIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indicatorIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  indicatorHeaderText: {
    flex: 1,
  },
  indicatorName: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  indicatorDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  indicatorExamples: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  exampleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    flexShrink: 0,
  },
  exampleText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 20,
  },

  // Famous
  famousCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  famousHeader: {
    marginBottom: Spacing.sm,
  },
  famousName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  famousTrait: {
    ...Typography.label,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  famousNote: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  // Practice
  practiceSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  practiceTip: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  practiceTipNumber: {
    ...Typography.label,
    color: Colors.accent,
    fontWeight: '700',
    width: 20,
    textAlign: 'right',
    flexShrink: 0,
    marginTop: 2,
  },
  practiceTipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 22,
  },

  // CTA
  ctaBtn: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ctaBtnText: {
    ...Typography.h3,
    color: Colors.paper,
    fontWeight: '600',
  },
  ctaBtnArrow: {
    fontSize: 18,
    color: Colors.paper,
  },

  bottomPad: { height: 40 },
})
