'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  HandPostWithAuthor, HandFeedFilters, HandFeedTab,
  HandCommentWithAuthor, CommentFormData,
} from '@poker-tracker/shared';
import { fetchHandFeed, fetchHandPost } from '@/lib/queries/hands';
import { fetchComments, createComment } from '@/lib/queries/comments';
import { createClient } from '@/lib/supabase';

export function useHandFeed() {
  const [posts, setPosts] = useState<HandPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HandFeedFilters>({ tab: 'latest' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHandFeed(filters);
      setPosts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setTab = useCallback((tab: HandFeedTab) => {
    setFilters((prev) => ({ ...prev, tab }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => {
      const current = prev.tags || [];
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...prev, tags: next.length > 0 ? next : undefined };
    });
  }, []);

  return { posts, loading, error, filters, setTab, toggleTag, setFilters, reload: load };
}

export function useHandPostDetail(postId: string) {
  const [post, setPost] = useState<HandPostWithAuthor | null>(null);
  const [comments, setComments] = useState<HandCommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [postData, commentsData] = await Promise.all([
        fetchHandPost(postId),
        fetchComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback(async (form: CommentFormData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await createComment({
      post_id: postId,
      user_id: user.id,
      parent_comment_id: form.parent_comment_id,
      street_anchor: form.street_anchor,
      body: form.body,
    });
    const fresh = await fetchComments(postId);
    setComments(fresh);
  }, [postId]);

  return { post, comments, loading, error, addComment, reload: load };
}
