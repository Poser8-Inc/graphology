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

// Helpers
export async function getAnalysesCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('graphology_readings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    log.error('[supabase] getAnalysesCount error:', error.message)
    return 0
  }
  return count ?? 0
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    log.error('[supabase] getUserProfile error:', error.message)
    return null
  }
  return data
}

export async function getPastReadings(userId: string, limit = 20): Promise<GraphologyReading[]> {
  const { data, error } = await supabase
    .from('graphology_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    log.error('[supabase] getPastReadings error:', error.message)
    return []
  }
  return data ?? []
}

export async function saveReading(
  reading: Omit<GraphologyReading, 'id' | 'created_at'>
): Promise<GraphologyReading | null> {
  const { data, error } = await supabase
    .from('graphology_readings')
    .insert(reading)
    .select()
    .single()

  if (error) {
    log.error('[supabase] saveReading error:', error.message)
    return null
  }
  return data
}
