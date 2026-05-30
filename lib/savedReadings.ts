// Local persistence for graphology analyses.
//
// Storage: AsyncStorage under `graphology.savedReadings.v1`.
// This complements the existing Supabase save path (lib/supabase.ts
// saveReading) by giving signed-out users a usable history. When cloud
// sync runs, it can read this key and merge upstream.

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GraphologyReport } from './graphologyAnalyzer'
import { log } from './log'

const STORAGE_KEY = 'graphology.savedReadings.v1'

export interface LocalSavedReading {
  id: string
  savedAt: string
  // We keep the small thumbnail rather than the full base64 to bound storage.
  thumbnail: string | null
  report: GraphologyReport
}

function makeId(): string {
  return `r_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}

export async function listSavedReadings(): Promise<LocalSavedReading[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalSavedReading[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
  } catch (err) {
    log.warn('[graphology][saved] list failed:', err)
    return []
  }
}

export async function saveReading(
  report: GraphologyReport,
  thumbnail: string | null,
): Promise<LocalSavedReading> {
  const existing = await listSavedReadings()
  const id = makeId()
  // Trim thumbnail to keep AsyncStorage payload reasonable. The full base64
  // can be megabytes; we keep a small prefix so history shows _something_.
  const trimmedThumb = thumbnail ? thumbnail.slice(0, 10000) : null
  const saved: LocalSavedReading = {
    id,
    savedAt: new Date().toISOString(),
    thumbnail: trimmedThumb,
    report,
  }
  const next = [saved, ...existing]
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  log.debug('[graphology][saved] saved', id)
  return saved
}

export async function deleteReading(id: string): Promise<void> {
  const existing = await listSavedReadings()
  const next = existing.filter((r) => r.id !== id)
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  log.debug('[graphology][saved] deleted', id)
}
