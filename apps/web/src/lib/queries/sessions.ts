import { createClient } from '../supabase';
import type { SessionRow, SessionInsert, SessionWithSite, SiteRow } from '@poker-tracker/shared';

export async function fetchSessions(limit = 50): Promise<SessionWithSite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, site:sites(*)')
    .order('start_time', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row: any) => ({ ...row, site: row.site as SiteRow }));
}

export async function fetchSession(id: string): Promise<SessionWithSite> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, site:sites(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return { ...data, site: (data as any).site as SiteRow };
}

export async function createSession(session: SessionInsert): Promise<SessionRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSession(
  id: string,
  updates: { buy_in_total?: number; cash_out_total?: number; end_time?: string | null }
): Promise<SessionRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
