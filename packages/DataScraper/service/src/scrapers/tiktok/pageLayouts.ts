export interface CommentLayout {
  name: string;
  commentListContainer: string;
  commentObjectWrapper: string;
  commentItemWrapper: string;
  commentAuthor: string;
  commentText: string;
  replyText: string;
  commentLikes: string;
  viewRepliesButton: string;
  replyContainer: string;
}

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
  replyContainer: '[data-e2e="reply-list"]',
};

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

export const commentLayouts: CommentLayout[] = [
  dataE2eLayout,
  dynamicClassLayout,
];


export interface DiscoveryLayout {
  name: string;
  videoCardSelector: string; // Selector for a single video card in the discovery page
}

export const discoveryLayouts: DiscoveryLayout[] = [
  {
    name: 'SearchE2E',
    videoCardSelector: 'div[data-e2e="search-video-list"] div[class*="DivItemContainer"]',
  },
  {
    name: 'ChallengeE2E',
    videoCardSelector: 'div[data-e2e="challenge-item-list"] div[class*="DivItemContainerV2"]',
  },
];