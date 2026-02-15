import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, formatProfit } from '@poker-tracker/shared';
import type { SiteProfit } from '@poker-tracker/shared';

interface Props {
  sites: SiteProfit[];
}

export default function SiteBreakdown({ sites }: Props) {
  if (sites.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>By Site</Text>
      {sites.map((entry) => {
        const isProfit = entry.profit >= 0;
        return (
          <View key={entry.site.id} style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.name}>{entry.site.name}</Text>
              <Text style={styles.count}>{entry.sessionCount} session{entry.sessionCount !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={[styles.profit, { color: isProfit ? colors.profit : colors.loss }]}>
              {formatProfit(entry.profit)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  heading: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  count: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  profit: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
