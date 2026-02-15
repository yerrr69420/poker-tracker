import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, formatCurrency } from '@poker-tracker/shared';
import type { BankrollSiteEntry } from '@poker-tracker/shared';
import ChipStack from '../ui/ChipStack';

interface Props {
  entry: BankrollSiteEntry;
}

function BankrollSiteRow({ entry }: Props) {
  return (
    <View style={styles.row}>
      <ChipStack amount={entry.amount} maxChips={5} />
      <View style={styles.info}>
        <Text style={styles.name}>{entry.site.name}</Text>
        {entry.isManualOverride && (
          <Text style={styles.badge}>manual</Text>
        )}
      </View>
      <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  badge: {
    color: colors.warning,
    fontSize: fontSizes.xs,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  amount: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
});

export default React.memo(BankrollSiteRow);
