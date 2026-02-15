import { createClient } from '../supabase';
import type { BankrollSnapshotRow, BankrollSnapshotInsert } from '@poker-tracker/shared';

export async function fetchSnapshots(userId: string): Promise<BankrollSnapshotRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bankroll_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertSnapshot(
  snapshot: BankrollSnapshotInsert
): Promise<BankrollSnapshotRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bankroll_snapshots')
    .upsert(snapshot, { onConflict: 'user_id,site_id,date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
