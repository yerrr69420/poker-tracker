import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fontWeights, formatCurrency } from '@poker-tracker/shared';
import type { BankrollChartPoint } from '@poker-tracker/shared';

interface Props {
  data: BankrollChartPoint[];
  height?: number;
}

/**
 * Simple bar-style bankroll chart using native views.
 * A proper charting library can replace this later.
 */
export default function BankrollChart({ data, height = 120 }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>No data yet</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.bars}>
        {data.map((point, i) => {
          const barHeight = Math.max(2, (point.total / maxVal) * (height - 30));
          return (
            <View key={point.date + i} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: point.total >= 0 ? colors.profit : colors.loss,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{data[0]?.date?.slice(5)}</Text>
        <Text style={styles.label}>{data[data.length - 1]?.date?.slice(5)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});
