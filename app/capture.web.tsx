// app/capture.web.tsx — web platform override for the capture screen.
//
// expo-camera / expo-image-picker are native-only; their modules error at
// import time on web. expo-router resolves *.web.tsx in preference to *.tsx
// when bundling for web, so this stub replaces the real CameraView screen
// on the web build. Native iOS / Android keep the unchanged capture.tsx.

import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme'

const APP_STORE_URL = 'https://apps.apple.com/app/id6767143711'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.templari.graphology'

export default function CaptureWebStub() {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Open in the app to capture</Text>
        <Text style={styles.body}>
          Handwriting capture requires the camera on a phone or tablet. Install
          GRAPHOLOGY+ from the App Store or Google Play to scan handwriting
          and unlock analyses.
        </Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.storeBtn}
            onPress={() => { Linking.openURL(APP_STORE_URL).catch(() => {}) }}
            accessibilityRole="link"
            accessibilityLabel="Open in App Store"
            activeOpacity={0.85}
          >
            <View style={styles.btnCol}>
              <Text style={styles.btnSmall}>Download on the</Text>
              <Text style={styles.btnLarge}>App Store</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.storeBtn}
            onPress={() => { Linking.openURL(PLAY_STORE_URL).catch(() => {}) }}
            accessibilityRole="link"
            accessibilityLabel="Get it on Google Play"
            activeOpacity={0.85}
          >
            <View style={styles.btnCol}>
              <Text style={styles.btnSmall}>Get it on</Text>
              <Text style={styles.btnLarge}>Google Play</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    maxWidth: 520,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.accent,
    textAlign: 'center',
  },
  body: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  storeBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    flex: 1,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCol: { alignItems: 'center' },
  btnSmall: {
    ...Typography.label,
    color: Colors.paper,
    fontSize: 10,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  btnLarge: {
    ...Typography.h3,
    color: Colors.paper,
    fontWeight: '700',
    fontSize: 16,
  },
  backBtn: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  backText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
})
