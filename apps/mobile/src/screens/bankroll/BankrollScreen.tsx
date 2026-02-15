import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights, borderRadius,
  formatCurrency, formatProfit, dollarsToCents,
} from '@poker-tracker/shared';
import { useBankroll } from '../../hooks/useBankroll';
import NeonCard from '../../components/ui/NeonCard';
import MascotHeader from '../../components/mascot/MascotHeader';
import BankrollSiteRow from '../../components/bankroll/BankrollSiteRow';
import BankrollChart from '../../components/bankroll/BankrollChart';

export default function BankrollScreen() {
  const {
    loading, selectedDate, setSelectedDate,
    getSummary, getChartData, setManualOverride, reload,
  } = useBankroll();

  const [refreshing, setRefreshing] = useState(false);
  const [overrideSiteId, setOverrideSiteId] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState('');

  const summary = getSummary(selectedDate);
  const chartData = getChartData(14);
  const delta = summary.previousTotal !== null ? summary.total - summary.previousTotal : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleDateChange = (direction: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleOverrideSave = async () => {
    if (!overrideSiteId || !overrideValue) return;
    try {
      const cents = dollarsToCents(parseFloat(overrideValue));
      await setManualOverride(overrideSiteId, selectedDate, cents);
      setOverrideSiteId(null);
      setOverrideValue('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const mood = summary.total > 0 ? 'profit' : summary.total < 0 ? 'loss' : 'neutral';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <MascotHeader title="Bankroll" subtitle={selectedDate} mood={mood} />

      {/* Date nav */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>&larr;</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>&rarr;</Text>
        </TouchableOpacity>
      </View>

      {/* Total card */}
      <NeonCard
        glowColor={summary.total >= 0 ? colors.profit : colors.loss}
        pulse={summary.total !== 0}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>Total Bankroll</Text>
        <Text style={[styles.totalValue, { color: summary.total >= 0 ? colors.profit : colors.loss }]}>
          {formatCurrency(summary.total)}
        </Text>
        {delta !== null && delta !== 0 && (
          <Text style={[styles.delta, { color: delta >= 0 ? colors.profit : colors.loss }]}>
            {formatProfit(delta)} from yesterday
          </Text>
        )}
      </NeonCard>

      {/* Chart */}
      <NeonCard style={styles.chartCard}>
        <Text style={styles.sectionTitle}>14-Day Trend</Text>
        <BankrollChart data={chartData} height={100} />
      </NeonCard>

      {/* Per-site breakdown */}
      <Text style={styles.sectionTitle}>By Site</Text>
      {summary.sites.length === 0 && (
        <Text style={styles.emptyText}>No bankroll data for this date.</Text>
      )}
      {summary.sites.map((entry) => (
        <TouchableOpacity
          key={entry.site.id}
          onLongPress={() => {
            setOverrideSiteId(entry.site.id);
            setOverrideValue((entry.amount / 100).toString());
          }}
        >
          <BankrollSiteRow entry={entry} />
        </TouchableOpacity>
      ))}

      {/* Manual override modal inline */}
      {overrideSiteId && (
        <NeonCard glowColor={colors.warning} style={styles.overrideCard}>
          <Text style={styles.overrideTitle}>
            Manual Override — {summary.sites.find((s) => s.site.id === overrideSiteId)?.site.name}
          </Text>
          <TextInput
            style={styles.overrideInput}
            value={overrideValue}
            onChangeText={setOverrideValue}
            keyboardType="decimal-pad"
            placeholder="Amount in dollars"
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.overrideActions}>
            <TouchableOpacity
              onPress={() => { setOverrideSiteId(null); setOverrideValue(''); }}
              style={styles.overrideCancelBtn}
            >
              <Text style={styles.overrideCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOverrideSave} style={styles.overrideSaveBtn}>
              <Text style={styles.overrideSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </NeonCard>
      )}

      <Text style={styles.hint}>Long-press a site to set a manual balance override.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  dateNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xl, marginVertical: spacing.md,
  },
  dateBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  dateBtnText: { color: colors.textPrimary, fontSize: fontSizes.xl },
  dateText: { color: colors.textPrimary, fontSize: fontSizes.lg, fontWeight: fontWeights.medium },
  totalCard: { marginBottom: spacing.lg, alignItems: 'center' },
  totalLabel: { color: colors.textSecondary, fontSize: fontSizes.sm, marginBottom: spacing.xs },
  totalValue: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.extrabold },
  delta: { fontSize: fontSizes.sm, marginTop: spacing.xs },
  chartCard: { marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center', paddingVertical: spacing.lg },
  overrideCard: { marginTop: spacing.lg },
  overrideTitle: { color: colors.warning, fontSize: fontSizes.md, fontWeight: fontWeights.semibold, marginBottom: spacing.md },
  overrideInput: {
    backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, color: colors.textPrimary, fontSize: fontSizes.lg,
  },
  overrideActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  overrideCancelBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  overrideCancelText: { color: colors.textSecondary, fontWeight: fontWeights.medium },
  overrideSaveBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    backgroundColor: colors.warning, alignItems: 'center',
  },
  overrideSaveText: { color: colors.textInverse, fontWeight: fontWeights.bold },
  hint: { color: colors.textMuted, fontSize: fontSizes.xs, textAlign: 'center', marginTop: spacing.xl },
});
