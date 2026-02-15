import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights, borderRadius,
  formatProfit, formatCurrency, formatDate, formatTime, formatDuration, durationMinutes,
} from '@poker-tracker/shared';
import type { SessionWithSite } from '@poker-tracker/shared';
import { fetchSession, deleteSession } from '../../lib/queries/sessions';
import NeonCard from '../../components/ui/NeonCard';
import ChipButton from '../../components/ui/ChipButton';

interface Props {
  sessionId: string;
  onBack: () => void;
}

export default function SessionDetailScreen({ sessionId, onBack }: Props) {
  const [session, setSession] = useState<SessionWithSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession(sessionId)
      .then(setSession)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleDelete = () => {
    Alert.alert('Delete Session', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(sessionId);
          onBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const isProfit = session.profit >= 0;
  const minutes = session.end_time ? durationMinutes(session.start_time, session.end_time) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <NeonCard glowColor={isProfit ? colors.profit : colors.loss} pulse>
        <Text style={[styles.profitLarge, { color: isProfit ? colors.profit : colors.loss }]}>
          {formatProfit(session.profit)}
        </Text>
        <Text style={styles.siteName}>{session.site.name}</Text>
        <Text style={styles.meta}>
          {session.stakes_text} {session.game_type} &middot; {session.format}
        </Text>
      </NeonCard>

      <View style={styles.detailGrid}>
        <DetailRow label="Date" value={formatDate(session.start_time)} />
        <DetailRow label="Start" value={formatTime(session.start_time)} />
        {session.end_time && <DetailRow label="End" value={formatTime(session.end_time)} />}
        {minutes > 0 && <DetailRow label="Duration" value={formatDuration(minutes)} />}
        <DetailRow label="Buy-in" value={formatCurrency(session.buy_in_total)} />
        <DetailRow label="Cash-out" value={formatCurrency(session.cash_out_total)} />
        <DetailRow label="Type" value={session.is_live ? 'Live' : 'Online'} />
      </View>

      {session.format === 'tournament' && (
        <View style={styles.tournamentSection}>
          <Text style={styles.sectionTitle}>Tournament</Text>
          {session.tournament_name && <DetailRow label="Name" value={session.tournament_name} />}
          {session.finish_position && <DetailRow label="Finish" value={`#${session.finish_position}`} />}
          {session.field_size && <DetailRow label="Field" value={`${session.field_size} entries`} />}
          {session.itm !== null && <DetailRow label="ITM" value={session.itm ? 'Yes' : 'No'} />}
          {session.rebuys_count > 0 && (
            <DetailRow label="Rebuys" value={`${session.rebuys_count} (${formatCurrency(session.rebuy_cost)} ea)`} />
          )}
          {session.addons_count > 0 && (
            <DetailRow label="Add-ons" value={`${session.addons_count} (${formatCurrency(session.addon_cost)} ea)`} />
          )}
        </View>
      )}

      {session.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{session.notes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <ChipButton label="Back" onPress={onBack} variant="outline" />
        <ChipButton label="Delete" onPress={handleDelete} variant="loss" />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgDeep },
  errorText: { color: colors.loss, fontSize: fontSizes.lg },
  profitLarge: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.extrabold, textAlign: 'center' },
  siteName: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, textAlign: 'center', marginTop: spacing.sm },
  meta: { color: colors.textSecondary, fontSize: fontSizes.md, textAlign: 'center', marginTop: spacing.xs },
  detailGrid: { marginTop: spacing.xl },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textSecondary, fontSize: fontSizes.md },
  detailValue: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  tournamentSection: { marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  sectionTitle: { color: colors.primary, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, marginBottom: spacing.sm },
  notesSection: { marginTop: spacing.xl },
  notesText: { color: colors.textPrimary, fontSize: fontSizes.md, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing['2xl'], justifyContent: 'center' },
});
