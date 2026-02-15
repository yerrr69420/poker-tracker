import { supabase } from '../supabase';
import type { BankrollSnapshotRow, BankrollSnapshotInsert } from '@poker-tracker/shared';

export async function fetchSnapshots(userId: string): Promise<BankrollSnapshotRow[]> {
  const { data, error } = await supabase
    .from('bankroll_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchSnapshotsForDate(
  userId: string,
  date: string
): Promise<BankrollSnapshotRow[]> {
  const { data, error } = await supabase
    .from('bankroll_snapshots')
    .select('*')
    .eq('user_id', userId)
    .lte('date', date)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertSnapshot(
  snapshot: BankrollSnapshotInsert
): Promise<BankrollSnapshotRow> {
  const { data, error } = await supabase
    .from('bankroll_snapshots')
    .upsert(snapshot, { onConflict: 'user_id,site_id,date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSnapshot(id: string): Promise<void> {
  const { error } = await supabase
    .from('bankroll_snapshots')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
