import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, borderRadius, formatProfit, formatDuration, durationMinutes, formatDate } from '@poker-tracker/shared';
import type { SessionWithSite } from '@poker-tracker/shared';
import NeonCard from '../ui/NeonCard';

interface Props {
  session: SessionWithSite;
  onPress: () => void;
}

function SessionCard({ session, onPress }: Props) {
  const isProfit = session.profit >= 0;
  const glowColor = isProfit ? colors.profit : colors.loss;
  const minutes = session.end_time ? durationMinutes(session.start_time, session.end_time) : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <NeonCard glowColor={glowColor} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <Text style={styles.siteName}>{session.site.name}</Text>
            <Text style={styles.meta}>
              {session.stakes_text} {session.game_type} · {session.format}
            </Text>
          </View>
          <Text style={[styles.profit, { color: isProfit ? colors.profit : colors.loss }]}>
            {formatProfit(session.profit)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(session.start_time)}</Text>
          {minutes > 0 && <Text style={styles.duration}>{formatDuration(minutes)}</Text>}
        </View>
      </NeonCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  siteName: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  profit: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  date: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  duration: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});

export default React.memo(SessionCard);
