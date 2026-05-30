'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import KudosCreateModal from './kudos-create-modal';
import { KudosToast, useKudosToast } from './kudos-toast';
import type {
  KudoCreatePayload,
  RecipientOption,
} from './kudos-create-form-types';
import { createKudo } from '@/lib/kudos/actions';
import { deleteKudoImages, uploadKudoImage } from '@/lib/kudos/upload-kudo-image';
import { t, type Language } from '@/lib/i18n/dictionary';

type ComposeContextValue = {
  /** Open the shared "Viết Kudo" modal, optionally pre-selecting a recipient. */
  openCompose: (recipientId?: string) => void;
  /** Current viewer's id — null outside the provider. Lets triggers hide
      self-targeted affordances (you can't send a Kudo to yourself). */
  currentUserId: string | null;
};

// Default is a no-op so calling the hook outside the provider (e.g. on a
// logged-out route where the provider isn't mounted) never throws.
const ComposeContext = createContext<ComposeContextValue>({
  openCompose: () => {},
  currentUserId: null,
});

/** Trigger the one shared compose modal from anywhere in the tree. */
export function useKudoCompose(): ComposeContextValue {
  return useContext(ComposeContext);
}

type Props = {
  lang: Language;
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
  children: React.ReactNode;
};

/**
 * The single source of the "Viết Kudo" (Gửi lời cảm ơn và ghi nhận đến đồng
 * đội) modal. Mounted once near the root so every screen and every trigger
 * (FAB, hero entry pill, avatar "Gửi KUDO") shares one modal instance and one
 * submit pipeline — call `useKudoCompose().openCompose()` to open it.
 */
export default function KudoComposeProvider({
  lang,
  recipients,
  existingHashtags,
  currentUserId,
  children,
}: Props) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useKudosToast();
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const openCompose = useCallback((id?: string) => {
    setRecipientId(id ?? null);
    setOpen(true);
  }, []);

  // Close + drop any pre-selection so the next open starts clean.
  const closeCompose = useCallback(() => {
    setOpen(false);
    setRecipientId(null);
  }, []);

  // Single submit pipeline: upload images first (tracking paths so we can roll
  // them back on a later failure), then create the kudo, then toast + refresh.
  const handleSubmit = useCallback(
    async (payload: KudoCreatePayload) => {
      const uploadedPaths: string[] = [];
      const imageUrls: string[] = [];
      for (const file of payload.imageFiles) {
        const result = await uploadKudoImage(file, currentUserId);
        if (!result.ok) {
          await deleteKudoImages(uploadedPaths);
          showToast(result.error);
          throw new Error(result.error);
        }
        imageUrls.push(result.url);
        uploadedPaths.push(result.path);
      }

      const created = await createKudo({
        recipientId: payload.recipientId,
        title: payload.title,
        contentMarkdown: payload.contentMarkdown,
        hashtags: payload.hashtags,
        imageUrls,
        isAnonymous: payload.isAnonymous,
        anonymousAlias: payload.anonymousAlias,
      });

      if (!created.ok) {
        await deleteKudoImages(uploadedPaths);
        showToast(created.error);
        throw new Error(created.error);
      }

      closeCompose();
      showToast(t(lang, 'kudos.hero.toast.sent'));
      router.refresh();
    },
    [currentUserId, router, showToast, lang, closeCompose],
  );

  const value = useMemo(
    () => ({ openCompose, currentUserId }),
    [openCompose, currentUserId],
  );

  // Resolve the requested recipientId to a full option so the form can
  // pre-select it (the modal remounts the form on each open).
  const initialRecipient = recipientId
    ? recipients.find((r) => r.id === recipientId) ?? null
    : null;

  return (
    <ComposeContext.Provider value={value}>
      {children}

      <KudosCreateModal
        lang={lang}
        open={open}
        onClose={closeCompose}
        onSubmit={handleSubmit}
        recipients={recipients}
        existingHashtags={existingHashtags}
        currentUserId={currentUserId}
        initialRecipient={initialRecipient}
      />

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </ComposeContext.Provider>
  );
}
