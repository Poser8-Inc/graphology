import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { log } from './log'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export async function getAccessToken(): Promise<string> {
  const existing = await supabase.auth.getSession()
  if (existing.data.session) return existing.data.session.access_token
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.session) {
    throw new Error('Authentication required to call the oracle.')
  }
  return data.session.access_token
}

// Database types
export interface GraphologyReading {
  id: string
  user_id: string
  image_url: string | null
  image_thumbnail: string | null  // base64 thumbnail for local display
  created_at: string
  // Analysis sections
  baseline: string | null
  slant: string | null
  letter_size: string | null
  pressure: string | null
  spacing: string | null
  specific_letters: string | null
  signature_vs_body: string | null
  overall_profile: string | null
  top_traits: string | null        // JSON array of 5 strings
  forensic_note: string | null
  raw_report: string | null
}

export interface UserProfile {
  id: string
  email: string | null
  analyses_used: number
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
}

// Helpers — fully stubbed: neither `profiles` nor `graphology_readings`
// exist in the Suite-shared Supabase project (jpwmfztcprbwkpbkyiqm). The
// previous PR #7 only stubbed getUserProfile on the (wrong) assumption
// that the readings queries worked; web smoke after deploy showed
// graphology_readings 404s on every page load too. Strip all four.
// Re-implement once Templari ID Phase 4 lands the cross-app profile
// schema and we provision per-app reading tables.
export async function getAnalysesCount(_userId: string): Promise<number> {
  return 0
}

export async function getUserProfile(_userId: string): Promise<UserProfile | null> {
  return null
}

export async function getPastReadings(_userId: string, _limit = 20): Promise<GraphologyReading[]> {
  return []
}

export async function saveReading(
  _reading: Omit<GraphologyReading, 'id' | 'created_at'>
): Promise<GraphologyReading | null> {
  return null
}
