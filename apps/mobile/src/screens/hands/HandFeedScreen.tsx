import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, HAND_TAGS } from '@poker-tracker/shared';
import type { HandFeedTab } from '@poker-tracker/shared';
import { useHandFeed } from '../../hooks/useHandFeed';
import HandCard from '../../components/hands/HandCard';
import FilterChips from '../../components/hands/FilterChips';
import MascotHeader from '../../components/mascot/MascotHeader';

const TABS: { label: string; value: HandFeedTab }[] = [
  { label: 'Latest', value: 'latest' },
  { label: 'Unanswered', value: 'unanswered' },
  { label: 'My Posts', value: 'my_posts' },
];

const TAG_OPTIONS = HAND_TAGS.slice(0, 12).map((t) => ({ label: t, value: t }));

interface Props {
  onPostPress: (id: string) => void;
  onCreatePost: () => void;
}

export default function HandFeedScreen({ onPostPress, onCreatePost }: Props) {
  const { posts, loading, filters, setTab, toggleTag, reload } = useHandFeed();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const ListHeader = () => (
    <View>
      <MascotHeader title="Hand Reviews" subtitle="Discuss hands with the community" />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setTab(tab.value)}
            style={[styles.tab, filters.tab === tab.value && styles.tabActive]}
          >
            <Text style={[styles.tabText, filters.tab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter chips */}
      <FilterChips
        options={TAG_OPTIONS}
        selected={filters.tags || []}
        onToggle={toggleTag}
      />

      {/* Create button */}
      <TouchableOpacity style={styles.createBtn} onPress={onCreatePost}>
        <Text style={styles.createBtnText}>+ New Hand Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HandCard post={item} onPress={() => onPostPress(item.id)} />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hand posts yet. Be the first!</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  listContent: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  tab: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  tabText: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  tabTextActive: { color: colors.primary },
  createBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: spacing.md, alignItems: 'center', marginVertical: spacing.md,
  },
  createBtnText: { color: colors.textInverse, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center', marginTop: spacing.xl },
});
