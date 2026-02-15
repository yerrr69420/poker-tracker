import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import {
  colors, spacing, fontSizes, fontWeights, borderRadius,
  dollarsToCents, GAME_TYPES,
} from '@poker-tracker/shared';
import type { GameTypeEnum, SessionFormat, SiteRow, SessionInsert } from '@poker-tracker/shared';
import { fetchSites } from '../../lib/queries/sites';
import { supabase } from '../../lib/supabase';

interface Props {
  onSaved: () => void;
  onCancel: () => void;
}

export default function AddSessionScreen({ onSaved, onCancel }: Props) {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [gameType, setGameType] = useState<GameTypeEnum>('NLH');
  const [format, setFormat] = useState<SessionFormat>('cash');
  const [stakesText, setStakesText] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [notes, setNotes] = useState('');
  // Tournament fields
  const [tournamentName, setTournamentName] = useState('');
  const [finishPosition, setFinishPosition] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [itm, setItm] = useState(false);
  const [rebuysCount, setRebuysCount] = useState('0');
  const [rebuyCost, setRebuyCost] = useState('');
  const [addonsCount, setAddonsCount] = useState('0');
  const [addonCost, setAddonCost] = useState('');

  useEffect(() => {
    fetchSites().then(setSites).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!siteId) { Alert.alert('Error', 'Please select a site.'); return; }
    if (!buyIn) { Alert.alert('Error', 'Please enter a buy-in amount.'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const session: SessionInsert = {
        user_id: user.id,
        site_id: siteId,
        is_live: isLive,
        game_type: gameType,
        format,
        stakes_text: stakesText,
        start_time: now,
        end_time: now,
        buy_in_total: dollarsToCents(parseFloat(buyIn) || 0),
        cash_out_total: dollarsToCents(parseFloat(cashOut) || 0),
        notes: notes || null,
        tournament_name: format === 'tournament' ? (tournamentName || null) : null,
        finish_position: format === 'tournament' ? (parseInt(finishPosition) || null) : null,
        field_size: format === 'tournament' ? (parseInt(fieldSize) || null) : null,
        itm: format === 'tournament' ? itm : null,
        rebuys_count: parseInt(rebuysCount) || 0,
        rebuy_cost: dollarsToCents(parseFloat(rebuyCost) || 0),
        addons_count: parseInt(addonsCount) || 0,
        addon_cost: dollarsToCents(parseFloat(addonCost) || 0),
        prize_pool: null,
      };

      const { error } = await supabase.from('sessions').insert(session);
      if (error) throw error;
      onSaved();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Add Session</Text>

      {/* Site Picker */}
      <Text style={styles.label}>Site / Room</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {sites.map((site) => (
          <TouchableOpacity
            key={site.id}
            onPress={() => { setSiteId(site.id); setIsLive(site.type === 'live'); }}
            style={[styles.chip, siteId === site.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, siteId === site.id && styles.chipTextActive]}>
              {site.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Game Type */}
      <Text style={styles.label}>Game Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {GAME_TYPES.map((gt) => (
          <TouchableOpacity
            key={gt.value}
            onPress={() => setGameType(gt.value)}
            style={[styles.chip, gameType === gt.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, gameType === gt.value && styles.chipTextActive]}>
              {gt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Format Toggle */}
      <Text style={styles.label}>Format</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setFormat('cash')}
          style={[styles.toggleBtn, format === 'cash' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, format === 'cash' && styles.toggleTextActive]}>Cash</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFormat('tournament')}
          style={[styles.toggleBtn, format === 'tournament' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, format === 'tournament' && styles.toggleTextActive]}>Tournament</Text>
        </TouchableOpacity>
      </View>

      {/* Stakes */}
      <Text style={styles.label}>Stakes</Text>
      <TextInput
        style={styles.input}
        placeholder={format === 'cash' ? '1/2' : '$55 MTT'}
        placeholderTextColor={colors.textMuted}
        value={stakesText}
        onChangeText={setStakesText}
      />

      {/* Buy-in & Cash-out */}
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Buy-in ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={buyIn}
            onChangeText={setBuyIn}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Cash-out ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={cashOut}
            onChangeText={setCashOut}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Profit preview */}
      {buyIn && cashOut && (
        <Text style={[styles.profitPreview, {
          color: (parseFloat(cashOut) || 0) >= (parseFloat(buyIn) || 0) ? colors.profit : colors.loss,
        }]}>
          Profit: {((parseFloat(cashOut) || 0) - (parseFloat(buyIn) || 0) >= 0 ? '+' : '')}
          ${((parseFloat(cashOut) || 0) - (parseFloat(buyIn) || 0)).toFixed(2)}
        </Text>
      )}

      {/* Tournament-specific fields */}
      {format === 'tournament' && (
        <View style={styles.tournamentSection}>
          <Text style={styles.sectionTitle}>Tournament Details</Text>

          <Text style={styles.label}>Tournament Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Sunday Million"
            placeholderTextColor={colors.textMuted}
            value={tournamentName}
            onChangeText={setTournamentName}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Finish Position</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                value={finishPosition}
                onChangeText={setFinishPosition}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Field Size</Text>
              <TextInput
                style={styles.input}
                placeholder="1000"
                placeholderTextColor={colors.textMuted}
                value={fieldSize}
                onChangeText={setFieldSize}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>In the money?</Text>
            <Switch
              value={itm}
              onValueChange={setItm}
              trackColor={{ false: colors.border, true: colors.profitDim }}
              thumbColor={itm ? colors.profit : colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Rebuys</Text>
              <TextInput
                style={styles.input}
                value={rebuysCount}
                onChangeText={setRebuysCount}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Rebuy Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={rebuyCost}
                onChangeText={setRebuyCost}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Add-ons</Text>
              <TextInput
                style={styles.input}
                value={addonsCount}
                onChangeText={setAddonsCount}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Add-on Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={addonCost}
                onChangeText={setAddonCost}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      )}

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Session notes..."
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, loading && { opacity: 0.5 }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.saveText}>Save Session</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  heading: {
    fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold,
    color: colors.textPrimary, marginBottom: spacing.xl,
  },
  label: {
    color: colors.textSecondary, fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium, marginBottom: spacing.xs, marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md,
    color: colors.textPrimary, fontSize: fontSizes.md,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.md },
  halfCol: { flex: 1 },
  chipRow: { flexDirection: 'row', marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard, marginRight: spacing.sm,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  chipText: { color: colors.textSecondary, fontSize: fontSizes.sm },
  chipTextActive: { color: colors.primary },
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
  toggleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  toggleText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  toggleTextActive: { color: colors.primary },
  profitPreview: {
    fontSize: fontSizes.lg, fontWeight: fontWeights.bold,
    textAlign: 'center', marginTop: spacing.sm,
  },
  tournamentSection: {
    marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.primary, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold,
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing['2xl'],
  },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  saveBtn: {
    flex: 2, paddingVertical: spacing.lg, borderRadius: borderRadius.md,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  saveText: { color: colors.textInverse, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
});
