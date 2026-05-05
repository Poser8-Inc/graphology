import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme'

const SAMPLE_PROMPT = `The quick brown fox jumps over the lazy dog.
I love my work and enjoy challenges.
The future is bright.`

const TIPS = [
  { icon: '✦', text: 'Write naturally — do not try to change your style' },
  { icon: '✦', text: 'Good lighting, white paper preferred' },
  { icon: '✦', text: 'Hold phone steady directly above the paper' },
  { icon: '✦', text: 'Fill at least half the page — more is better' },
  { icon: '✦', text: 'Use your normal handwriting speed' },
]

export default function InstructionsScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, styles.progressStepActive]}>
          <Text style={styles.progressStepText}>1</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <Text style={[styles.progressStepText, { color: Colors.textMuted }]}>2</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <Text style={[styles.progressStepText, { color: Colors.textMuted }]}>3</Text>
        </View>
      </View>

      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, styles.progressLabelActive]}>Instructions</Text>
        <Text style={styles.progressLabel}>Capture</Text>
        <Text style={styles.progressLabel}>Reading</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="link"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Heading */}
        <Text style={styles.heading}>For Best Results</Text>
        <Text style={styles.subheading}>
          Accurate graphology requires a clear, natural handwriting sample.
        </Text>

        {/* Sample text parchment card */}
        <View style={styles.sampleSection}>
          <Text style={styles.sampleLabel}>WRITE THIS TEXT ON PAPER</Text>
          <View style={styles.parchmentCard}>
            {/* Ruled lines */}
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.ruledLine, { top: 28 + i * 40 }]} />
            ))}
            <Text style={styles.sampleText}>{SAMPLE_PROMPT}</Text>
          </View>
          <Text style={styles.sampleNote}>
            This sentence uses all 26 letters — optimal for full handwriting analysis.
          </Text>
        </View>

        {/* Tips list */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsHeader}>Tips</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        {/* What we analyze */}
        <View style={styles.analyzeSection}>
          <Text style={styles.analyzeHeader}>What We Analyze</Text>
          <View style={styles.analyzeGrid}>
            {[
              'Baseline slope',
              'Letter slant',
              'Letter size',
              'Pen pressure',
              'Word spacing',
              'Loop forms',
              't-bar & i-dot',
              'Signature',
            ].map((item) => (
              <View key={item} style={styles.analyzeChip}>
                <Text style={styles.analyzeChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/capture')}
          accessibilityRole="link"
          accessibilityLabel="Ready to write — open capture"
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Ready to Write</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Progress
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    gap: 0,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressStepText: {
    ...Typography.label,
    color: Colors.paper,
    fontWeight: '700',
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  progressLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: Colors.accent,
    fontWeight: '600',
  },

  // Scroll content
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  backBtn: {
    marginBottom: Spacing.lg,
  },
  backText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  heading: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.body,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },

  // Sample parchment
  sampleSection: {
    marginBottom: Spacing.xl,
  },
  sampleLabel: {
    ...Typography.label,
    color: Colors.accent,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  parchmentCard: {
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
    ...Shadows.parchment,
  },
  ruledLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: '#D4C8A8',
    opacity: 0.5,
  },
  sampleText: {
    fontSize: 20,
    color: Colors.ink,
    lineHeight: 40,
    fontStyle: 'italic',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  sampleNote: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Tips
  tipsSection: {
    marginBottom: Spacing.xl,
  },
  tipsHeader: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tipIcon: {
    fontSize: 10,
    color: Colors.accent,
    marginTop: 6,
  },
  tipText: {
    ...Typography.body,
    color: Colors.textMuted,
    flex: 1,
  },

  // What we analyze
  analyzeSection: {
    marginBottom: Spacing.lg,
  },
  analyzeHeader: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  analyzeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  analyzeChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  analyzeChipText: {
    ...Typography.label,
    color: Colors.textMuted,
  },

  bottomPad: { height: 20 },

  // CTA
  ctaContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.gold,
  },
  ctaText: {
    ...Typography.h3,
    color: Colors.paper,
    fontWeight: '600',
  },
  ctaArrow: {
    fontSize: 18,
    color: Colors.paper,
  },
})
