import { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme'
import { useStore } from '@/lib/store'
import { getPastReadings } from '@/lib/supabase'
import type { GraphologyReading } from '@/lib/supabase'

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
    // Fallback: use first line of raw top_traits
    return reading.top_traits.split('\n')[0] ?? 'Analysis Complete'
  }
  return 'Analysis Complete'
}

function HistoryCard({ reading, onPress }: { reading: GraphologyReading; onPress: () => void }) {
  const topTrait = extractTopTrait(reading)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {reading.image_thumbnail ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${reading.image_thumbnail}` }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>✒</Text>
          </View>
        )}
      </View>

      {/* Card content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>{formatDate(reading.created_at)}</Text>
        <Text style={styles.cardTopTrait} numberOfLines={2}>{topTrait}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>GRAPHOLOGY REPORT</Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HistoryScreen() {
  const router = useRouter()
  const userId = useStore((s) => s.userId)
  const history = useStore((s) => s.history)
  const setHistory = useStore((s) => s.setHistory)
  const setCapturedImageUri = useStore((s) => s.setCapturedImageUri)

  const isLoading = history.length === 0 && !!userId

  useEffect(() => {
    if (userId) {
      getPastReadings(userId).then(setHistory)
    }
  }, [userId])

  function handleReadingPress(reading: GraphologyReading) {
    // Set thumbnail as preview image for the reading screen
    if (reading.image_thumbnail) {
      setCapturedImageUri(`data:image/jpeg;base64,${reading.image_thumbnail}`)
    }
    // TODO: Could load a read-only view of the stored report
    // For now, navigate to reading which will re-display
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Past Analyses</Text>
        <Text style={styles.subtitle}>Your handwriting history</Text>
      </View>

      {/* List */}
      {!userId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✒</Text>
          <Text style={styles.emptyTitle}>Sign In to See History</Text>
          <Text style={styles.emptyText}>
            Create an account to save and revisit your analyses.
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.accent} />
          <Text style={styles.loadingText}>Loading analyses...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✒</Text>
          <Text style={styles.emptyTitle}>No Analyses Yet</Text>
          <Text style={styles.emptyText}>
            Your past handwriting analyses will appear here.
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/instructions')}>
            <Text style={styles.startBtnText}>Start First Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HistoryCard
              reading={item}
              onPress={() => handleReadingPress(item)}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.listHeader}>{history.length} analysis{history.length !== 1 ? 'es' : ''}</Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  header: {
    paddingTop: 64,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // List
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  listHeader: {
    ...Typography.label,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: Colors.paper,
    flexShrink: 0,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paper,
  },
  thumbnailIcon: {
    fontSize: 28,
    color: Colors.ink,
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  cardDate: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardTopTrait: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
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
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  cardArrow: {
    color: Colors.textMuted,
    fontSize: 16,
  },

  // States
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
    opacity: 0.4,
    color: Colors.text,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  startBtnText: {
    ...Typography.body,
    color: Colors.paper,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
})
