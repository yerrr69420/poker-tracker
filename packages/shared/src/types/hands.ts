import type {
  HandPostRow,
  HandCommentRow,
  GameTypeEnum,
  SessionFormat,
  PostVisibility,
  StreetEnum,
} from './database';

export interface HandPostWithAuthor extends HandPostRow {
  author_email?: string; // only if not anonymous
}

export interface HandCommentWithAuthor extends HandCommentRow {
  author_email: string;
  replies?: HandCommentWithAuthor[];
}

export interface HandPostDetail extends HandPostWithAuthor {
  comments: HandCommentWithAuthor[];
}

export type HandFeedTab = 'latest' | 'unanswered' | 'my_posts';

export interface HandFeedFilters {
  tab: HandFeedTab;
  game_type?: GameTypeEnum;
  format?: SessionFormat;
  tags?: string[];
  is_live?: boolean;
}

export interface HandPostFormData {
  title: string;
  hh_raw_text: string;
  hero_hand: string;
  board: string;
  stakes_text: string;
  game_type: GameTypeEnum | null;
  format: SessionFormat | null;
  is_live: boolean | null;
  site_name: string;
  tags: string[];
  visibility: PostVisibility;
  post_anonymous: boolean;
}

export interface CommentFormData {
  body: string;
  parent_comment_id: string | null;
  street_anchor: StreetEnum;
}
