import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, View, StyleSheet } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import { Colors } from '@/constants/theme'
import { supabase, getUserProfile, getAnalysesCount } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { log } from '@/lib/log'

export default function RootLayout() {
  const setUserId = useStore((s) => s.setUserId)
  const setProfile = useStore((s) => s.setProfile)
  const setAnalysesRemaining = useStore((s) => s.setAnalysesRemaining)

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => {})
      NavigationBar.setVisibilityAsync('hidden').catch(() => {})
    }
  }, [])

  useEffect(() => {
    // RC public SDK keys are safe to embed client-side per RevenueCat docs.
    // Fallback to hardcoded values so missing EXPO_PUBLIC_* env vars at build
    // time don't silently skip Purchases.configure (bug seen on preview builds).
    const apiKey = Platform.OS === 'ios'
      ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_QqITsjadHaiBaguVMrlwewFhkRV')
      : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_TZvRzDvksKhXYqqDXCjjdPRorLx')
    if (apiKey) {
      if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN)
      try {
        Purchases.configure({ apiKey })
      } catch (err) {
        log.warn('[rc][graphology][configure] Purchases.configure failed:', err)
      }
    }
  }, [])

  useEffect(() => {
    // Bootstrap auth session — sign in anonymously if no session yet
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        bootstrapUser(session.user.id)
      } else {
        supabase.auth.signInAnonymously().catch((err) => {
          log.warn('[graphology][auth] signInAnonymously failed:', err)
        })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        bootstrapUser(session.user.id)
      } else {
        setUserId(null)
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function bootstrapUser(userId: string) {
    setUserId(userId)
    const [profile, count] = await Promise.all([
      getUserProfile(userId),
      getAnalysesCount(userId),
    ])
    setProfile(profile)
    // Free tier: 2/month. Premium: unlimited.
    const isPremium = profile?.is_premium ?? false
    const remaining = isPremium ? 999 : Math.max(0, 2 - count)
    setAnalysesRemaining(remaining)
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="instructions" />
        <Stack.Screen name="capture" />
        <Stack.Screen
          name="reading"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="history" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
})
