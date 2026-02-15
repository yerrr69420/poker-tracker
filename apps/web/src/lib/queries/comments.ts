import { createClient } from '../supabase';
import type {
  HandCommentRow, HandCommentInsert, HandCommentWithAuthor,
} from '@poker-tracker/shared';

export async function fetchComments(postId: string): Promise<HandCommentWithAuthor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hand_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const comments = data as HandCommentRow[];
  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const emailMap: Record<string, string> = Object.fromEntries(
    userIds.map((id) => [id, `user_${id.slice(0, 6)}`])
  );

  const withAuthor: HandCommentWithAuthor[] = comments.map((c) => ({
    ...c,
    author_email: emailMap[c.user_id] || 'Unknown',
    replies: [],
  }));

  const map = new Map<string, HandCommentWithAuthor>();
  for (const c of withAuthor) map.set(c.id, c);

  const roots: HandCommentWithAuthor[] = [];
  for (const c of withAuthor) {
    if (c.parent_comment_id && map.has(c.parent_comment_id)) {
      map.get(c.parent_comment_id)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  }

  return roots;
}

export async function createComment(comment: HandCommentInsert): Promise<HandCommentRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hand_comments')
    .insert(comment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('hand_comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
