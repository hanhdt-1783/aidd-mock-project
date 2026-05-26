// RecipientOption is canonical in lib/kudos/types.ts — re-export to keep
// imports from this module stable but avoid duplicating the type definition.
export type { RecipientOption } from '@/lib/kudos/types';

// KudoCreatePayload is form-layer only — it carries raw File handles which the
// integration layer turns into uploaded URLs before calling the server action.
export type KudoCreatePayload = {
  recipientId: string;
  title: string;
  contentMarkdown: string;
  hashtags: string[];
  imageFiles: File[];
  isAnonymous: boolean;
  anonymousAlias: string | null;
};
