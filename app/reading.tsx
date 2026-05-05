import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme'
import { useStore } from '@/lib/store'
import { analyzeHandwriting } from '@/lib/graphologyAnalyzer'
import type { SectionKey } from '@/lib/graphologyAnalyzer'
import { saveReading } from '@/lib/supabase'
import { HandwritingAnnotator } from '@/components/HandwritingAnnotator'
import { log } from '@/lib/log'

const { width } = Dimensions.get('window')

// Section display config — order matters, matches Claude's output
const SECTION_CONFIG: Array<{
  key: SectionKey
  label: string
  icon: string
  color: string
  description: string
}> = [
  {
    key: 'baseline',
    label: 'Baseline Analysis',
    icon: '—',
    color: '#7A5C3A',
    description: 'Optimism · Mood · Emotional State',
  },
  {
    key: 'slant',
    label: 'Slant Analysis',
    icon: '/',
    color: '#8B6F47',
    description: 'Social Nature · Emotional Expression',
  },
  {
    key: 'letterSize',
    label: 'Letter Size',
    icon: 'Aa',
    color: '#C4973A',
    description: 'Confidence · Self-Awareness · Drive',
  },
  {
    key: 'pressure',
    label: 'Pressure',
    icon: '●',
    color: '#7A2020',
    description: 'Vitality · Emotional Intensity · Energy',
  },
  {
    key: 'spacing',
    label: 'Spacing',
    icon: '⟷',
    color: '#5A6A4A',
    description: 'Boundaries · Clarity of Thought',
  },
  {
    key: 'specificLetters',
    label: 'Specific Letter Forms',
    icon: 'ℓg',
    color: '#4A5A7A',
    description: 'Loops · Crossings · Dots — deep personality markers',
  },
  {
    key: 'signature',
    label: 'Signature vs Body',
    icon: '✍',
    color: '#6A4A7A',
    description: 'Public Self vs Private Self',
  },
  {
    key: 'overallProfile',
    label: 'Overall Personality Profile',
    icon: '◈',
    color: '#C4973A',
    description: 'Full psychological synthesis',
  },
  {
    key: 'topTraits',
    label: 'Notable Traits',
    icon: '★',
    color: '#8B6F47',
    description: 'Your five most observable characteristics',
  },
  {
    key: 'forensicNote',
    label: 'Forensic Note',
    icon: '⚖',
    color: '#5A5050',
    description: '',
  },
]

export default function ReadingScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const fadeAnims = useRef<Record<string, Animated.Value>>({})

  const capturedImageUri = useStore((s) => s.capturedImageUri)
  const capturedImageBase64 = useStore((s) => s.capturedImageBase64)
  const analysisSections = useStore((s) => s.analysisSections)
  const analysisStatus = useStore((s) => s.analysisStatus)
  const analysisError = useStore((s) => s.analysisError)
  const setAnalysisStatus = useStore((s) => s.setAnalysisStatus)
  const setAnalysisError = useStore((s) => s.setAnalysisError)
  const appendSectionContent = useStore((s) => s.appendSectionContent)
  const markSectionComplete = useStore((s) => s.markSectionComplete)
  const setFullReport = useStore((s) => s.setFullReport)
  const decrementAnalyses = useStore((s) => s.decrementAnalyses)
  const userId = useStore((s) => s.userId)
  const resetAnalysis = useStore((s) => s.resetAnalysis)

  // Initialize fade animations for each section
  SECTION_CONFIG.forEach((cfg) => {
    if (!fadeAnims.current[cfg.key]) {
      fadeAnims.current[cfg.key] = new Animated.Value(0)
    }
  })

  const fadeInSection = (key: string) => {
    Animated.timing(fadeAnims.current[key], {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }

  // Start analysis on mount
  useEffect(() => {
    if (!capturedImageBase64) {
      log.warn('[reading] No image base64 in store — redirecting to capture')
      router.replace('/capture')
      return
    }

    startAnalysis()
  }, [])

  async function startAnalysis() {
    setAnalysisStatus('loading')
    setAnalysisError(null)

    let currentSectionKey: SectionKey = 'baseline'
    let lastSectionIndex = 0

    try {
      const report = await analyzeHandwriting(
        capturedImageBase64!,
        (chunk) => {
          // Switch to streaming status on first chunk
          if (analysisStatus !== 'streaming') {
            setAnalysisStatus('streaming')
          }

          // When section changes, update active section and trigger fade-in
          if (chunk.section !== currentSectionKey) {
            const newIndex = SECTION_CONFIG.findIndex((c) => c.key === chunk.section)
            if (newIndex > lastSectionIndex) {
              // Mark previous section complete
              markSectionComplete(currentSectionKey)
              // Fade in new section
              fadeInSection(chunk.section)
              setActiveSectionIndex(newIndex)
              lastSectionIndex = newIndex
              // Haptic feedback on section transition
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            currentSectionKey = chunk.section
          }

          if (chunk.text) {
            appendSectionContent(chunk.section, chunk.text)
          }

          if (chunk.done) {
            markSectionComplete(chunk.section)
          }
        }
      )

      setFullReport(report)
      setAnalysisStatus('complete')
      decrementAnalyses()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Save to Supabase if user is logged in
      if (userId) {
        await saveReading({
          user_id: userId,
          image_url: null,
          image_thumbnail: capturedImageBase64?.slice(0, 10000) ?? null,
          baseline: report.baseline.detail,
          slant: report.slant.detail,
          letter_size: report.letterSize.detail,
          pressure: report.pressure.detail,
          spacing: report.spacing.detail,
          specific_letters: report.specificLetters.map((l) => `${l.letter}: ${l.interpretation}`).join('\n'),
          signature_vs_body: report.signatureVsBody,
          overall_profile: [
            report.overallProfile.core,
            report.overallProfile.professional,
            report.overallProfile.emotional,
            report.overallProfile.interpersonal,
            report.overallProfile.growth,
          ].filter(Boolean).join('\n\n'),
          top_traits: JSON.stringify(report.topTraits),
          forensic_note: report.forensicNote,
          raw_report: report.rawText,
        })
      }
    } catch (err: any) {
      log.error('[reading] Analysis failed:', err)
      setAnalysisError(err?.message ?? 'Analysis failed. Please try again.')
      setAnalysisStatus('error')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const getSectionContent = (key: SectionKey) =>
    analysisSections.find((s) => s.key === key)?.content ?? ''

  const isSectionVisible = (key: SectionKey) => {
    const sec = analysisSections.find((s) => s.key === key)
    return sec ? sec.content.length > 0 : false
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (analysisStatus === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>{analysisError}</Text>
        <TouchableOpacity style={styles.errorRetryBtn} onPress={startAnalysis}>
          <Text style={styles.errorRetryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorBackText}>← Back to Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Report header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportHeaderTop}>
            <Text style={styles.reportLabel}>GRAPHOLOGICAL ANALYSIS</Text>
            <Text style={styles.reportDate}>{new Date().toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</Text>
          </View>
          <View style={styles.reportDivider} />
          <Text style={styles.reportSubLabel}>
            FORENSIC DOCUMENT EXAMINATION · PSYCHOLOGICAL PROFILE
          </Text>
        </View>

        {/* Handwriting specimen with annotation lines */}
        {capturedImageUri && (
          <View style={styles.specimenSection}>
            <Text style={styles.specimenLabel}>EXHIBIT A — HANDWRITING SPECIMEN</Text>
            <HandwritingAnnotator
              imageUri={capturedImageUri}
              report={analysisSections.find((s) => s.key === 'baseline') ?? null}
              isAnalyzing={analysisStatus === 'loading' || analysisStatus === 'streaming'}
            />
          </View>
        )}

        {/* Loading indicator before first content */}
        {analysisStatus === 'loading' && (
          <View style={styles.loadingSection}>
            <ActivityIndicator color={Colors.accent} size="large" />
            <Text style={styles.loadingText}>Examining specimen...</Text>
            <Text style={styles.loadingSubtext}>
              Analyzing baseline, slant, pressure, letter forms...
            </Text>
          </View>
        )}

        {/* Analysis sections — stream in one by one */}
        {SECTION_CONFIG.map((cfg, idx) => {
          const content = getSectionContent(cfg.key)
          const section = analysisSections.find((s) => s.key === cfg.key)
          const isVisible = isSectionVisible(cfg.key)
          const isStreaming = section?.isStreaming ?? false
          const isComplete = section?.isComplete ?? false
          const isActive = activeSectionIndex === idx && isStreaming

          if (!isVisible && analysisStatus !== 'complete') return null

          return (
            <Animated.View
              key={cfg.key}
              style={[
                styles.sectionCard,
                { opacity: isVisible ? 1 : 0 },
                cfg.key === 'overallProfile' && styles.sectionCardFeatured,
                cfg.key === 'forensicNote' && styles.sectionCardMuted,
              ]}
            >
              {/* Section header */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '44' }]}>
                  <Text style={[styles.sectionIcon, { color: cfg.color }]}>{cfg.icon}</Text>
                </View>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>{cfg.label}</Text>
                  {cfg.description ? (
                    <Text style={styles.sectionDescription}>{cfg.description}</Text>
                  ) : null}
                </View>
                {isStreaming && (
                  <View style={styles.streamingDot}>
                    <ActivityIndicator size="small" color={cfg.color} />
                  </View>
                )}
                {isComplete && (
                  <Text style={[styles.completeMark, { color: cfg.color }]}>✓</Text>
                )}
              </View>

              {/* Section divider */}
              <View style={[styles.sectionDivider, { backgroundColor: cfg.color + '33' }]} />

              {/* Content */}
              {cfg.key === 'topTraits' ? (
                <TraitsContent content={content} color={cfg.color} />
              ) : cfg.key === 'overallProfile' ? (
                <ProfileContent content={content} />
              ) : cfg.key === 'forensicNote' ? (
                <ForensicNoteContent content={content} />
              ) : (
                <Text style={styles.sectionContent}>{content}</Text>
              )}

              {/* Active section accent */}
              {isActive && (
                <View style={[styles.activeAccent, { backgroundColor: cfg.color }]} />
              )}
            </Animated.View>
          )
        })}

        {/* Complete state footer */}
        {analysisStatus === 'complete' && (
          <View style={styles.completeFooter}>
            <View style={styles.completeDivider} />
            <Text style={styles.completeLabel}>END OF ANALYSIS</Text>
            <Text style={styles.completeSubLabel}>REPORT SEALED</Text>

            <View style={styles.completeActions}>
              <TouchableOpacity
                style={styles.newAnalysisBtn}
                onPress={() => {
                  resetAnalysis()
                  router.replace('/instructions')
                }}
              >
                <Text style={styles.newAnalysisBtnText}>New Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => router.push('/history')}
              >
                <Text style={styles.historyBtnText}>View History</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Floating back button */}
      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => {
          resetAnalysis()
          router.replace('/')
        }}
      >
        <Text style={styles.floatingBackText}>×</Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TraitsContent({ content, color }: { content: string; color: string }) {
  const lines = content
    .split('\n')
    .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().length > 3)
    .slice(0, 5)

  if (!lines.length) {
    return <Text style={styles.sectionContent}>{content}</Text>
  }

  return (
    <View style={styles.traitsList}>
      {lines.map((line, i) => (
        <View key={i} style={styles.traitRow}>
          <View style={[styles.traitBullet, { backgroundColor: color }]} />
          <Text style={styles.traitText}>{line.replace(/^[-•]\s*/, '').trim()}</Text>
        </View>
      ))}
    </View>
  )
}

function ProfileContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 10)

  if (!paragraphs.length) {
    return <Text style={styles.profileContent}>{content}</Text>
  }

  return (
    <View style={styles.profileParagraphs}>
      {paragraphs.map((para, i) => (
        <Text key={i} style={[styles.profileContent, i > 0 && styles.profileParagraphGap]}>
          {para.trim()}
        </Text>
      ))}
    </View>
  )
}

function ForensicNoteContent({ content }: { content: string }) {
  return (
    <View style={styles.forensicNoteContainer}>
      <Text style={styles.forensicNoteText}>{content}</Text>
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 56,
    paddingBottom: 40,
  },

  // Report header
  reportHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  reportHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  reportLabel: {
    ...Typography.label,
    color: Colors.accent,
    letterSpacing: 3,
    fontWeight: '700',
  },
  reportDate: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  reportDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  reportSubLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontSize: 10,
  },

  // Specimen section
  specimenSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  specimenLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  // Loading
  loadingSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  loadingSubtext: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Section cards
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  sectionCardFeatured: {
    borderColor: Colors.accent + '44',
    backgroundColor: '#1A1710',
  },
  sectionCardMuted: {
    backgroundColor: Colors.bg,
    borderColor: Colors.border,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  sectionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    ...Typography.label,
    color: Colors.textMuted,
    marginTop: 2,
  },
  streamingDot: {
    width: 24,
    alignItems: 'center',
  },
  completeMark: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },
  sectionContent: {
    ...Typography.body,
    color: Colors.text,
    padding: Spacing.md,
    lineHeight: 26,
  },
  activeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  // Traits list
  traitsList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  traitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  traitText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },

  // Profile
  profileParagraphs: {
    padding: Spacing.md,
  },
  profileContent: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 28,
  },
  profileParagraphGap: {
    marginTop: Spacing.md,
  },

  // Forensic note
  forensicNoteContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  forensicNoteText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Complete footer
  completeFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  completeDivider: {
    width: '40%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  completeLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginBottom: 4,
  },
  completeSubLabel: {
    ...Typography.label,
    color: Colors.accent,
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: Spacing.xl,
  },
  completeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  newAnalysisBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.gold,
  },
  newAnalysisBtnText: {
    ...Typography.body,
    color: Colors.paper,
    fontWeight: '600',
  },
  historyBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  historyBtnText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    color: Colors.red,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorRetryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  errorRetryText: {
    ...Typography.body,
    color: Colors.paper,
    fontWeight: '600',
  },
  errorBackText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Floating close
  floatingBack: {
    position: 'absolute',
    top: 52,
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBackText: {
    fontSize: 20,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  bottomPad: {
    height: 48,
  },
})
