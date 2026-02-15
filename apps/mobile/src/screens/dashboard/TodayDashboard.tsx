import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights,
  formatProfit, formatDuration, formatCurrency,
} from '@poker-tracker/shared';
import type { SessionWithSite } from '@poker-tracker/shared';
import { useSessions, useDashboardStats } from '../../hooks/useSessions';
import NeonCard from '../../components/ui/NeonCard';
import MascotHeader from '../../components/mascot/MascotHeader';
import SessionCard from '../../components/sessions/SessionCard';
import SiteBreakdown from '../../components/sessions/SiteBreakdown';

interface Props {
  onAddSession: () => void;
  onSessionPress: (id: string) => void;
}

export default function TodayDashboard({ onAddSession, onSessionPress }: Props) {
  const { sessions, loading, reload } = useSessions();
  const stats = useDashboardStats(sessions);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const mood = stats.todayProfit > 0 ? 'profit' : stats.todayProfit < 0 ? 'loss' : 'neutral';

  const recentSessions = sessions.slice(0, 10);

  const ListHeader = () => (
    <View>
      <MascotHeader
        title="Today's Session"
        subtitle={`${stats.todaySessions} session${stats.todaySessions !== 1 ? 's' : ''} today`}
        mood={mood}
      />

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        <NeonCard
          glowColor={stats.todayProfit >= 0 ? colors.profit : colors.loss}
          pulse={stats.todayProfit !== 0}
          style={styles.statCard}
        >
          <Text style={styles.statLabel}>Today's P&L</Text>
          <Text style={[styles.statValue, { color: stats.todayProfit >= 0 ? colors.profit : colors.loss }]}>
            {formatProfit(stats.todayProfit)}
          </Text>
        </NeonCard>

        <NeonCard style={styles.statCard}>
          <Text style={styles.statLabel}>Hours</Text>
          <Text style={styles.statValue}>
            {formatDuration(stats.todayHours * 60)}
          </Text>
        </NeonCard>
      </View>

      <View style={styles.statsRow}>
        <NeonCard style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={[styles.statValue, { color: stats.weekProfit >= 0 ? colors.profit : colors.loss }]}>
            {formatProfit(stats.weekProfit)}
          </Text>
        </NeonCard>

        <NeonCard style={styles.statCard}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={[styles.statValue, { color: stats.monthProfit >= 0 ? colors.profit : colors.loss }]}>
            {formatProfit(stats.monthProfit)}
          </Text>
        </NeonCard>
      </View>

      <SiteBreakdown sites={stats.siteBreakdown} />

      {/* Add Session Button */}
      <TouchableOpacity style={styles.addBtn} onPress={onAddSession}>
        <Text style={styles.addBtnText}>+ Add Session</Text>
      </TouchableOpacity>

      {recentSessions.length > 0 && (
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recentSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard session={item} onPress={() => onSessionPress(item.id)} />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No sessions yet. Add your first one!</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  listContent: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statCard: { flex: 1 },
  statLabel: { color: colors.textSecondary, fontSize: fontSizes.sm, marginBottom: spacing.xs },
  statValue: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: fontWeights.bold },
  addBtn: {
    marginTop: spacing.xl, backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: spacing.lg, alignItems: 'center',
  },
  addBtnText: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  sectionTitle: {
    color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center', marginTop: spacing.xl },
});
