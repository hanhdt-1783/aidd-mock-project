// Canonical Kudos domain types — shared between server queries and UI components.

export type KudosUser = {
  id: string;
  name: string;
  avatarUrl: string;
  department: string;
  rankStars: 0 | 1 | 2 | 3;
  title: string | null;
};

export type KudosCard = {
  id: string;
  sender: KudosUser;
  receiver: KudosUser;
  createdAt: string; // ISO
  content: string;
  hashtags: string[];
  images: string[];
  likeCount: number;
  likedByMe: boolean;
  canLike: boolean; // false when current viewer is the sender
};

export type SidebarStats = {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  secretBoxesOpened: number;
  secretBoxesUnopened: number;
};

export type GiftRecipient = {
  id: string;
  name: string;
  avatarUrl: string;
  prizeDescription: string;
};

export type SpotlightName = {
  id: string;
  name: string;
  size: 'sm' | 'md' | 'lg';
  highlighted: boolean;
};

export type KudosFilters = {
  hashtag: string | null;
  department: string | null;
};
