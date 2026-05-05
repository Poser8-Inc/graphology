import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { useRouter } from 'expo-router'
import Purchases from 'react-native-purchases'
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme'
import { useStore } from '@/lib/store'
import { log } from '@/lib/log'

const { width, height } = Dimensions.get('window')

// Capture region dimensions — centered rectangle for the handwriting area
const CAPTURE_WIDTH = width - 48
const CAPTURE_HEIGHT = CAPTURE_WIDTH * 0.65

type ScreenState = 'camera' | 'preview' | 'processing'

export default function CaptureScreen() {
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [screenState, setScreenState] = useState<ScreenState>('camera')
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [previewBase64, setPreviewBase64] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const setCapturedImageUri = useStore((s) => s.setCapturedImageUri)
  const setCapturedImageBase64 = useStore((s) => s.setCapturedImageBase64)
  const analysesRemaining = useStore((s) => s.analysesRemaining)

  // Check free tier before allowing capture — uses RevenueCat for premium check
  const checkFreeTier = useCallback(async (): Promise<boolean> => {
    let isPremium = false
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      isPremium = !!customerInfo.entitlements.active['premium']
    } catch (err) {
      log.warn('[rc][graphology][capture] getCustomerInfo failed:', err)
      // isPremium stays false (defensive). Don't reroute to paywall on transient RC errors —
      // free-tier counter-based gate below already enforces correct UX.
    }

    if (!isPremium && analysesRemaining <= 0) {
      router.push('/paywall')
      return false
    }
    return true
  }, [analysesRemaining, router])

  const handleCapture = useCallback(async () => {
    if (!await checkFreeTier()) return
    if (!cameraRef.current || isCapturing) return

    setIsCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        skipProcessing: false,
      })

      if (!photo?.uri) throw new Error('No photo URI returned')

      // Crop to the capture overlay region
      // Camera fills screen; crop to our centered rectangle
      const cropX = 24
      const cropY = (height - CAPTURE_HEIGHT) / 2 - 20
      const cropWidth = CAPTURE_WIDTH
      const cropHeight = CAPTURE_HEIGHT

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: cropX,
              originY: Math.max(0, cropY),
              width: cropWidth,
              height: cropHeight,
            },
          },
          { resize: { width: 1200 } },
        ],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )

      setPreviewUri(manipulated.uri)
      setPreviewBase64(manipulated.base64 ?? null)
      setScreenState('preview')
    } catch (err) {
      log.error('[capture] Error taking photo:', err)
      Alert.alert('Capture Error', 'Failed to take photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }, [cameraRef, isCapturing, checkFreeTier])

  const handleUploadFromPhotos = useCallback(async () => {
    if (!await checkFreeTier()) return

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Grant photo library access to upload a sample.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: false,
      allowsEditing: true,
      aspect: [3, 2],
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setScreenState('processing')

    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )
      setPreviewUri(manipulated.uri)
      setPreviewBase64(manipulated.base64 ?? null)
      setScreenState('preview')
    } catch (err) {
      log.error('[capture] Image processing error:', err)
      setScreenState('camera')
      Alert.alert('Processing Error', 'Could not process the selected image.')
    }
  }, [checkFreeTier])

  const handleUseThisSample = useCallback(() => {
    if (!previewUri || !previewBase64) return
    setCapturedImageUri(previewUri)
    setCapturedImageBase64(previewBase64)
    router.push('/reading')
  }, [previewUri, previewBase64, setCapturedImageUri, setCapturedImageBase64, router])

  const handleRetake = useCallback(() => {
    setPreviewUri(null)
    setPreviewBase64(null)
    setScreenState('camera')
  }, [])

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    )
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access is required to capture handwriting.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadFromPhotos}>
          <Text style={styles.uploadBtnText}>Upload from Photos Instead</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Preview state ──────────────────────────────────────────────────────────
  if (screenState === 'preview' && previewUri) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Review Sample</Text>
          <Text style={styles.previewSubtitle}>Is the handwriting clear and fully visible?</Text>
        </View>

        <View style={styles.previewImageContainer}>
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewBorder} />
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.useBtn} onPress={handleUseThisSample}>
            <Text style={styles.useBtnText}>Use This Sample</Text>
            <Text style={styles.useBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── Camera state ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Dark overlay with cutout */}
        <View style={styles.overlay}>
          {/* Top dark bar */}
          <View style={styles.overlayTop} />

          {/* Middle row: dark sides + transparent capture area */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.captureWindow}>
              {/* Corner marks */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom dark bar with controls */}
          <View style={styles.overlayBottom}>
            {/* Instructions */}
            <Text style={styles.cameraInstruction}>
              Hold phone directly above paper. Align writing within the frame.
            </Text>

            {/* Shutter + upload row */}
            <View style={styles.shutterRow}>
              <TouchableOpacity style={styles.uploadPhotoBtn} onPress={handleUploadFromPhotos}>
                <Text style={styles.uploadPhotoIcon}>⬆</Text>
                <Text style={styles.uploadPhotoLabel}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shutterBtn, isCapturing && styles.shutterBtnDisabled]}
                onPress={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color={Colors.ink} size="small" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </TouchableOpacity>

              {/* Spacer for symmetry */}
              <View style={styles.shutterSpacer} />
            </View>

            <Text style={styles.tapInstruction}>Tap to capture</Text>

            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },

  // Camera
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(10,9,8,0.75)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: CAPTURE_HEIGHT,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(10,9,8,0.75)',
    width: 24,
  },
  captureWindow: {
    width: CAPTURE_WIDTH,
    height: CAPTURE_HEIGHT,
    // Transparent — shows camera feed
  },
  overlayBottom: {
    flex: 1.2,
    backgroundColor: 'rgba(10,9,8,0.85)',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  // Corner marks
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  cameraInstruction: {
    ...Typography.bodySmall,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  uploadPhotoBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  uploadPhotoIcon: {
    fontSize: 22,
    color: Colors.textMuted,
  },
  uploadPhotoLabel: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterBtnDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.paper,
  },
  shutterSpacer: {
    flex: 1,
  },
  tapInstruction: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  backBtn: {
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Permission screen
  permText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  permBtnText: {
    ...Typography.body,
    color: Colors.paper,
    fontWeight: '600',
  },
  uploadBtn: {
    paddingVertical: Spacing.md,
  },
  uploadBtnText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Preview
  previewHeader: {
    paddingTop: 64,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  previewSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  previewImageContainer: {
    flex: 1,
    margin: Spacing.lg,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.paper,
  },
  previewBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewActions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  retakeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  retakeBtnText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  useBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.gold,
  },
  useBtnText: {
    ...Typography.body,
    color: Colors.paper,
    fontWeight: '600',
  },
  useBtnArrow: {
    fontSize: 16,
    color: Colors.paper,
  },
})
