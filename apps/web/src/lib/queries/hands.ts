import { createClient } from '../supabase';
import type {
  HandPostRow, HandPostInsert, HandPostWithAuthor,
  HandFeedFilters,
} from '@poker-tracker/shared';

export async function fetchHandFeed(
  filters: HandFeedFilters,
  limit = 30
): Promise<HandPostWithAuthor[]> {
  const supabase = createClient();
  let query = supabase
    .from('hand_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.tab === 'unanswered') {
    query = query.eq('comment_count', 0);
  } else if (filters.tab === 'my_posts') {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) query = query.eq('user_id', user.id);
  }

  if (filters.game_type) query = query.eq('game_type', filters.game_type);
  if (filters.format) query = query.eq('format', filters.format);
  if (filters.is_live !== undefined) query = query.eq('is_live', filters.is_live);
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query;
  if (error) throw error;

  const posts = data as HandPostRow[];
  const userIds = [...new Set(posts.filter((p) => !p.post_anonymous).map((p) => p.user_id))];
  const emailMap: Record<string, string> = Object.fromEntries(
    userIds.map((id) => [id, `user_${id.slice(0, 6)}`])
  );

  return posts.map((post) => ({
    ...post,
    author_email: post.post_anonymous ? undefined : emailMap[post.user_id],
  }));
}

export async function fetchHandPost(id: string): Promise<HandPostWithAuthor> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hand_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;

  const post = data as HandPostRow;
  return {
    ...post,
    author_email: post.post_anonymous ? undefined : `user_${post.user_id.slice(0, 6)}`,
  };
}

export async function createHandPost(post: HandPostInsert): Promise<HandPostRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hand_posts')
    .insert(post)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHandPost(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('hand_posts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
