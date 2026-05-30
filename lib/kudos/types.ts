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
  title: string | null;
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

// Bottom-left activity ticker row on the Spotlight Board.
export type SpotlightActivity = {
  id: string;
  name: string;
  time: string; // pre-formatted "08:30PM"
};

export type KudosFilters = {
  hashtag: string | null;
  department: string | null;
};

// Used by the recipient autocomplete in the Viết Kudo form.
export type RecipientOption = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  department: string | null;
};

// Payload accepted by the createKudo server action.
// imageUrls are already-uploaded public URLs from Supabase Storage.
export type CreateKudoInput = {
  recipientId: string;
  title: string;
  contentMarkdown: string;
  hashtags: string[];
  imageUrls: string[];
  isAnonymous: boolean;
  anonymousAlias: string | null;
};
