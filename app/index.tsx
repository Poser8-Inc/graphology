import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme'

const { width } = Dimensions.get('window')

// Sample handwriting lines for decorative parchment card
const SAMPLE_LINES = [
  'The quick brown fox jumps over the lazy dog.',
  'I love my work and enjoy challenges.',
  'The future is bright.',
]

// Fake annotation markers for the sample card
const ANNOTATIONS = [
  { top: '18%', left: '8%', label: 'Baseline', color: Colors.primary },
  { top: '42%', left: '55%', label: 'Slant', color: Colors.accent },
  { top: '68%', left: '20%', label: 'Pressure', color: Colors.red },
]

export default function HomeScreen() {
  const router = useRouter()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.quillIcon}>✒</Text>
        <Text style={styles.title}>Graphology</Text>
        <Text style={styles.subtitle}>What your handwriting reveals about you</Text>
      </View>

      {/* Parchment sample card */}
      <View style={styles.sampleCard}>
        {/* Parchment background */}
        <View style={styles.parchment}>
          {/* Ruled lines behind text */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.ruledLine, { top: 32 + i * 34 }]} />
          ))}

          {/* Sample handwriting text */}
          <View style={styles.handwritingArea}>
            {SAMPLE_LINES.map((line, i) => (
              <Text key={i} style={[styles.handwritingText, i === 0 && { marginTop: 4 }]}>
                {line}
              </Text>
            ))}
          </View>

          {/* Annotation callouts */}
          {ANNOTATIONS.map((ann, i) => (
            <View key={i} style={[styles.annotation, { top: ann.top as any, left: ann.left as any }]}>
              <View style={[styles.annotationDot, { backgroundColor: ann.color }]} />
              <View style={[styles.annotationLine, { backgroundColor: ann.color }]} />
              <View style={[styles.annotationBadge, { borderColor: ann.color }]}>
                <Text style={[styles.annotationLabel, { color: ann.color }]}>{ann.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Card label */}
        <View style={styles.cardLabel}>
          <Text style={styles.cardLabelText}>SPECIMEN ANALYSIS — EXHIBIT A</Text>
        </View>
      </View>

      {/* Hook copy */}
      <View style={styles.hookSection}>
        <Text style={styles.hookText}>
          Used by forensic investigators, psychologists, and HR departments worldwide since 1622.
        </Text>
        <Text style={styles.hookDetail}>
          Every pen stroke carries a psychological signature. Pressure reveals emotional intensity.
          Slant exposes your social nature. Baseline shows your ambition. Your handwriting doesn't lie.
        </Text>
      </View>

      {/* Trait preview chips */}
      <View style={styles.chipRow}>
        {['Introvert / Extrovert', 'Emotional Range', 'Ambition', 'Creativity', 'Detail Orientation'].map((trait) => (
          <View key={trait} style={styles.chip}>
            <Text style={styles.chipText}>{trait}</Text>
          </View>
        ))}
      </View>

      {/* Tier info */}
      <View style={styles.tierRow}>
        <View style={styles.tierBadge}>
          <Text style={styles.tierFree}>Free:</Text>
          <Text style={styles.tierDesc}> 2 analyses / month</Text>
        </View>
        <View style={styles.tierDivider} />
        <View style={styles.tierBadge}>
          <Text style={styles.tierPremium}>Premium:</Text>
          <Text style={styles.tierDesc}> Unlimited</Text>
        </View>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/instructions')}
        accessibilityRole="link"
        accessibilityLabel="Analyze my handwriting"
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Analyze My Handwriting</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </TouchableOpacity>

      {/* Secondary CTA */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/learn')}
        accessibilityRole="link"
        accessibilityLabel="Learn about graphology"
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>Learn About Graphology</Text>
      </TouchableOpacity>

      {/* Footer links */}
      <View style={styles.footerLinks}>
        <TouchableOpacity
          onPress={() => router.push('/history')}
          accessibilityRole="link"
          accessibilityLabel="Past analyses"
        >
          <Text style={styles.footerLink}>Past Analyses</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://templari.app/privacy')}>
          <Text style={styles.footerLink}>Privacy</Text>
        </TouchableOpacity>
      </View>

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
    paddingHorizontal: Spacing.lg,
    paddingTop: 64,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  quillIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
    color: Colors.accent,
  },
  title: {
    ...Typography.display,
    color: Colors.text,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontWeight: '300',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  // Parchment sample card
  sampleCard: {
    marginBottom: Spacing.xl,
    ...Shadows.soft,
  },
  parchment: {
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.md,
    height: 220,
    overflow: 'hidden',
    position: 'relative',
    padding: Spacing.md,
  },
  ruledLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: '#D4C8A8',
    opacity: 0.6,
  },
  handwritingArea: {
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  handwritingText: {
    fontSize: 20,
    color: Colors.ink,
    lineHeight: 34,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  // Annotation overlays
  annotation: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  annotationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  annotationLine: {
    width: 20,
    height: 1,
    opacity: 0.7,
  },
  annotationBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(242,235,217,0.9)',
  },
  annotationLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardLabel: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cardLabelText: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 2,
  },

  // Hook section
  hookSection: {
    marginBottom: Spacing.xl,
  },
  hookText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  hookDetail: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  chipText: {
    ...Typography.label,
    color: Colors.textMuted,
  },

  // Tier row
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierFree: {
    ...Typography.label,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tierPremium: {
    ...Typography.label,
    color: Colors.accent,
    fontWeight: '600',
  },
  tierDesc: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  tierDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },

  // Buttons
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.gold,
  },
  primaryButtonText: {
    ...Typography.h3,
    color: Colors.paper,
    fontWeight: '600',
  },
  primaryButtonArrow: {
    fontSize: 18,
    color: Colors.paper,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Footer
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  footerLink: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  footerDivider: {
    color: Colors.textMuted,
  },

  bottomPad: {
    height: 40,
  },
})
