import { createClient } from '../supabase';
import type { SiteRow, SiteInsert } from '@poker-tracker/shared';

export async function fetchSites(): Promise<SiteRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('is_preset', { ascending: false })
    .order('name');
  if (error) throw error;
  return data;
}

export async function createSite(site: SiteInsert): Promise<SiteRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sites')
    .insert(site)
    .select()
    .single();
  if (error) throw error;
  return data;
}
