import { useEffect, useRef } from 'react'
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native'
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg'
import { Colors } from '@/constants/theme'
import type { AnalysisSection } from '@/lib/store'

const { width } = Dimensions.get('window')
const ANNOTATOR_WIDTH = width - 48
const ANNOTATOR_HEIGHT = ANNOTATOR_WIDTH * 0.6

// Static annotation points that become visible as analysis runs
// These point to meaningful regions of a typical handwriting sample
const ANNOTATIONS: Array<{
  id: string
  x: number   // percentage of width (0–100)
  y: number   // percentage of height (0–100)
  label: string
  color: string
  lineToX: number
  lineToY: number
}> = [
  {
    id: 'baseline',
    x: 15,
    y: 80,
    label: 'Baseline',
    color: '#7A5C3A',
    lineToX: 40,
    lineToY: 72,
  },
  {
    id: 'slant',
    x: 80,
    y: 25,
    label: 'Slant',
    color: '#8B6F47',
    lineToX: 60,
    lineToY: 40,
  },
  {
    id: 'pressure',
    x: 10,
    y: 40,
    label: 'Pressure',
    color: '#7A2020',
    lineToX: 28,
    lineToY: 50,
  },
  {
    id: 'letterSize',
    x: 85,
    y: 65,
    label: 'Size',
    color: '#C4973A',
    lineToX: 65,
    lineToY: 58,
  },
  {
    id: 'spacing',
    x: 50,
    y: 15,
    label: 'Spacing',
    color: '#5A6A4A',
    lineToX: 50,
    lineToY: 32,
  },
]

interface Props {
  imageUri: string
  report: AnalysisSection | null
  isAnalyzing: boolean
}

export function HandwritingAnnotator({ imageUri, report, isAnalyzing }: Props) {
  const fadeAnims = useRef<Record<string, Animated.Value>>(
    ANNOTATIONS.reduce((acc, ann) => {
      acc[ann.id] = new Animated.Value(0)
      return acc
    }, {} as Record<string, Animated.Value>)
  )
  const pulseAnim = useRef(new Animated.Value(0)).current

  // Stagger annotation reveals as analysis streams in
  useEffect(() => {
    if (!isAnalyzing && !report) return

    // Pulse animation for the "analyzing" state
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ).start()
    }

    // Stagger annotations to appear one by one
    const staggerDelay = 1200
    ANNOTATIONS.forEach((ann, i) => {
      setTimeout(() => {
        Animated.timing(fadeAnims.current[ann.id], {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start()
      }, i * staggerDelay)
    })
  }, [isAnalyzing, report])

  const toAbsX = (pct: number) => (pct / 100) * ANNOTATOR_WIDTH
  const toAbsY = (pct: number) => (pct / 100) * ANNOTATOR_HEIGHT

  return (
    <View style={styles.container}>
      {/* Handwriting image */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Parchment-tinted overlay for the forensic report feel */}
      <View style={styles.overlay} />

      {/* SVG annotation layer */}
      <View style={styles.svgLayer} pointerEvents="none">
        <Svg width={ANNOTATOR_WIDTH} height={ANNOTATOR_HEIGHT}>
          {ANNOTATIONS.map((ann) => {
            const ax = toAbsX(ann.x)
            const ay = toAbsY(ann.y)
            const lx = toAbsX(ann.lineToX)
            const ly = toAbsY(ann.lineToY)

            return (
              <G key={ann.id}>
                {/* Annotation line from label to specimen point */}
                <Line
                  x1={ax}
                  y1={ay}
                  x2={lx}
                  y2={ly}
                  stroke={ann.color}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
                {/* Dot at specimen point */}
                <Circle
                  cx={lx}
                  cy={ly}
                  r={3}
                  fill={ann.color}
                  opacity={0.8}
                />
                {/* Outer ring at specimen point */}
                <Circle
                  cx={lx}
                  cy={ly}
                  r={6}
                  fill="none"
                  stroke={ann.color}
                  strokeWidth={1}
                  opacity={0.4}
                />
              </G>
            )
          })}
        </Svg>
      </View>

      {/* Animated annotation labels — React Native Animated for opacity */}
      <View style={[StyleSheet.absoluteFill]} pointerEvents="none">
        {ANNOTATIONS.map((ann) => {
          const ax = (ann.x / 100) * ANNOTATOR_WIDTH
          const ay = (ann.y / 100) * ANNOTATOR_HEIGHT

          // Shift label so it doesn't clip at edges
          const labelLeft = ann.x > 70 ? ax - 68 : ax + 4
          const labelTop = ann.y > 75 ? ay - 24 : ay - 8

          return (
            <Animated.View
              key={ann.id}
              style={[
                styles.annotationLabel,
                {
                  left: labelLeft,
                  top: labelTop,
                  borderColor: ann.color + '66',
                  opacity: fadeAnims.current[ann.id],
                },
              ]}
            >
              <Animated.Text style={[styles.annotationLabelText, { color: ann.color }]}>
                {ann.label}
              </Animated.Text>
            </Animated.View>
          )
        })}
      </View>

      {/* Analyzing pulse indicator */}
      {isAnalyzing && (
        <Animated.View
          style={[
            styles.analyzingBadge,
            {
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        >
        </Animated.View>
      )}

      {/* Forensic label */}
      <View style={styles.forensicBadge}>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: ANNOTATOR_WIDTH,
    height: ANNOTATOR_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.paper,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(242,235,217,0.08)',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ANNOTATOR_WIDTH,
    height: ANNOTATOR_HEIGHT,
  },
  annotationLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(20,18,16,0.85)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  annotationLabelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  analyzingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(196,151,58,0.15)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(196,151,58,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  forensicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
})
