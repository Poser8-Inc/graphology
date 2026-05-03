import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'
import { supabase, getUserProfile, getAnalysesCount } from '@/lib/supabase'
import { useStore } from '@/lib/store'

export default function RootLayout() {
  const setUserId = useStore((s) => s.setUserId)
  const setProfile = useStore((s) => s.setProfile)
  const setAnalysesRemaining = useStore((s) => s.setAnalysesRemaining)

  useEffect(() => {
    // Bootstrap auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        bootstrapUser(session.user.id)
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
