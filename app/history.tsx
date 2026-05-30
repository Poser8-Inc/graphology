import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useStore } from '@/lib/store'
import { getPastReadings } from '@/lib/supabase'
import type { GraphologyReading } from '@/lib/supabase'
import {
  listSavedReadings,
  deleteReading as deleteLocalReading,
  type LocalSavedReading,
} from '@/lib/savedReadings'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function extractTopTrait(reading: GraphologyReading): string {
  if (!reading.top_traits) return 'Analysis Complete'
  try {
    const traits = JSON.parse(reading.top_traits)
    if (Array.isArray(traits) && traits.length > 0) return traits[0]
  } catch {
    return reading.top_traits.split('\n')[0] ?? 'Analysis Complete'
  }
  return 'Analysis Complete'
}

interface UnifiedRow {
  source: 'cloud' | 'local'
  id: string
  createdAt: string
  thumbnail: string | null
  topTrait: string
  local?: LocalSavedReading
  cloud?: GraphologyReading
}

function unifyCloud(r: GraphologyReading): UnifiedRow {
  return {
    source: 'cloud',
    id: `cloud:${r.id}`,
    createdAt: r.created_at,
    thumbnail: r.image_thumbnail,
    topTrait: extractTopTrait(r),
    cloud: r,
  }
}

function unifyLocal(r: LocalSavedReading): UnifiedRow {
  const topTrait = r.report.topTraits?.[0] ?? 'Analysis Complete'
  return {
    source: 'local',
    id: `local:${r.id}`,
    createdAt: r.savedAt,
    thumbnail: r.thumbnail,
    topTrait,
    local: r,
  }
}

function RowCard({ row, onPress, onDelete }: { row: UnifiedRow; onPress: () => void; onDelete?: () => void }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardBody}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open analysis from ${formatDate(row.createdAt)}: ${row.topTrait}`}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnail}>
          {row.thumbnail ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${row.thumbnail}` }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailIcon}>✒</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardDate}>{formatDate(row.createdAt)}</Text>
          <Text style={styles.cardTopTrait} numberOfLines={2}>{row.topTrait}</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.cardBadge, row.source === 'local' && styles.cardBadgeLocal]}>
              <Text style={styles.cardBadgeText}>
                {row.source === 'cloud' ? 'CLOUD' : 'LOCAL'}
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
      {row.source === 'local' && onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.delBtn}
          accessibilityRole="button"
          accessibilityLabel="Delete saved analysis"
        >
          <Text style={styles.delBtnText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function HistoryScreen() {
  const router = useRouter()
  const userId = useStore((s) => s.userId)
  const history = useStore((s) => s.history)
  const setHistory = useStore((s) => s.setHistory)
  const setCapturedImageUri = useStore((s) => s.setCapturedImageUri)
  const setFullReport = useStore((s) => s.setFullReport)

  const [localItems, setLocalItems] = useState<LocalSavedReading[] | null>(null)

  const refreshLocal = useCallback(async () => {
    setLocalItems(await listSavedReadings())
  }, [])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      ;(async () => {
        const list = await listSavedReadings()
        if (alive) setLocalItems(list)
      })()
      return () => {
        alive = false
      }
    }, []),
  )

  useEffect(() => {
    if (userId) {
      getPastReadings(userId).then(setHistory)
    }
    refreshLocal()
  }, [userId, refreshLocal, setHistory])

  const handleLocalOpen = useCallback(
    (r: LocalSavedReading) => {
      if (r.thumbnail) {
        setCapturedImageUri(`data:image/jpeg;base64,${r.thumbnail}`)
      }
      setFullReport(r.report)
      // Note: the reading screen re-runs analysis on mount when capturedImageBase64
      // is set. For now we navigate but the reader will need to re-analyze; a
      // dedicated read-only viewer is the proper fix.
      router.push('/reading')
    },
    [setCapturedImageUri, setFullReport, router],
  )

  const handleCloudOpen = useCallback(
    (r: GraphologyReading) => {
      if (r.image_thumbnail) {
        setCapturedImageUri(`data:image/jpeg;base64,${r.image_thumbnail}`)
      }
      router.push('/reading')
    },
    [setCapturedImageUri, router],
  )

  const confirmDeleteLocal = useCallback(
    (r: LocalSavedReading) => {
      Alert.alert(
        'Delete reading?',
        'Remove this locally-saved analysis?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteLocalReading(r.id)
              refreshLocal()
            },
          },
        ],
      )
    },
    [refreshLocal],
  )

  const rows: UnifiedRow[] = []
  for (const c of history) rows.push(unifyCloud(c))
  for (const l of localItems ?? []) rows.push(unifyLocal(l))
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const isLoading = localItems === null && (history.length === 0 && !!userId)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="link"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Past Analyses</Text>
        <Text style={styles.subtitle}>
          {userId ? 'Cloud + local history' : 'Local history (sign in to sync to cloud)'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.accent} />
          <Text style={styles.loadingText}>Loading analyses...</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✒</Text>
          <Text style={styles.emptyTitle}>No Analyses Yet</Text>
          <Text style={styles.emptyText}>
            Your handwriting analyses will appear here.
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/instructions')}
            accessibilityRole="link"
            accessibilityLabel="Start first analysis"
          >
            <Text style={styles.startBtnText}>Start First Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RowCard
              row={item}
              onPress={() =>
                item.source === 'local' && item.local
                  ? handleLocalOpen(item.local)
                  : item.cloud
                    ? handleCloudOpen(item.cloud)
                    : undefined
              }
              onDelete={
                item.source === 'local' && item.local
                  ? () => confirmDeleteLocal(item.local!)
                  : undefined
              }
            />
          )}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {rows.length} analysis{rows.length !== 1 ? 'es' : ''}
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: 64,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: Spacing.md },
  backText: { ...Typography.body, color: Colors.textMuted },
  title: { ...Typography.h1, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.textMuted, fontStyle: 'italic' },
  listContent: { padding: Spacing.lg, gap: Spacing.md },
  listHeader: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardBody: { flexDirection: 'row', flex: 1 },
  thumbnail: { width: 90, height: 90, backgroundColor: Colors.paper, flexShrink: 0 },
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paper,
  },
  thumbnailIcon: { fontSize: 28, color: Colors.ink, opacity: 0.4 },
  cardContent: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  cardDate: { ...Typography.label, color: Colors.textMuted, marginBottom: 4 },
  cardTopTrait: { ...Typography.body, color: Colors.text, fontWeight: '500', flex: 1, lineHeight: 22 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  cardBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardBadgeLocal: { backgroundColor: Colors.accent + '22' },
  cardBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  cardArrow: { color: Colors.textMuted, fontSize: 16 },
  delBtn: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  delBtnText: { ...Typography.label, color: Colors.red, textTransform: 'uppercase' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg, opacity: 0.4, color: Colors.text },
  emptyTitle: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  emptyText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  startBtnText: { ...Typography.body, color: Colors.paper, fontWeight: '600' },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { ...Typography.body, color: Colors.textMuted },
})
