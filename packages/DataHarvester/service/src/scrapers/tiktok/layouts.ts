
export interface CommentLayout {
  /** A unique name for the layout. */
  name: string;
  /** The main container holding the list of comments. This is used to detect the layout. */
  commentListContainer: string;
  /** The wrapper for a single comment thread (comment + its replies). */
  commentObjectWrapper: string;
  /** The wrapper for a single comment item (either a top-level comment or a reply). */
  commentItemWrapper: string;
  /** The element containing the comment author's username. */
  commentAuthor: string;
  /** The element containing the text of a top-level comment. */
  commentText: string;
  /** The element containing the text of a reply. */
  replyText: string;
  /** The element showing the number of likes for a comment. */
  commentLikes: string;
  /** The button/link to expand and view replies for a comment. */
  viewRepliesButton: string;
  /** The container for a list of replies. */
  replyContainer: string;
}

/**
 * This layout relies on `data-e2e` attributes, which are generally more stable than CSS classes.
 * This seems to be the primary/older layout.
 */
export const dataE2eLayout: CommentLayout = {
  name: 'DataE2E',
  commentListContainer: '[data-e2e="comment-list"]',
  commentObjectWrapper: '[data-e2e="comment-item-container"]',
  commentItemWrapper: '[data-e2e="comment-item"]',
  commentAuthor: '[data-e2e="comment-author-name"]',
  commentText: '[data-e2e="comment-level-1"]',
  replyText: '[data-e2e="comment-level-2"]',
  commentLikes: '[data-e2e="like-count"]',
  viewRepliesButton: '[data-e2e="view-more-replies"]',
  replyContainer: '[data-e2e="reply-list"]', // This might be nested inside commentObjectWrapper
};

/**
 * This layout is based on the new structure you provided, which heavily uses
 * dynamically generated CSS classes. We'll target them using partial class name selectors.
 */
export const dynamicClassLayout: CommentLayout = {
  name: 'DynamicCSS',
  commentListContainer: 'div[class*="-DivCommentListContainer"]',
  commentObjectWrapper: 'div[class*="-DivCommentObjectWrapper"]',
  commentItemWrapper: 'div[class*="-DivCommentItemWrapper"]',
  commentAuthor: '[data-e2e*="comment-username"] a', 
  commentText: 'span[data-e2e="comment-level-1"]',
  replyText: 'span[data-e2e="comment-level-2"]',
  commentLikes: 'div[class*="-DivLikeContainer"] > span',
  viewRepliesButton: 'div[class*="-DivViewMoreReplies"]',
  replyContainer: 'div[class*="-DivReplyContainer"]',
};

/**
 * An array of all known layouts. The scraper will try them in order.
 */
export const commentLayouts: CommentLayout[] = [
  dataE2eLayout,
  dynamicClassLayout,
]; 