'use client';

import { useCallback, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  GiftRecipient,
  KudosCard as KudosCardType,
  SidebarStats,
  SpotlightName,
} from './types';
import KudosHeroBanner from './kudos-hero-banner';
import KudosHighlightSection from './kudos-highlight-section';
import KudosSpotlightBoard from './kudos-spotlight-board';
import KudosSidebar from './kudos-sidebar';
import KudosCardItem from './kudos-card';
import KudosEmptyState from './kudos-empty-state';
import { KudosToast, useKudosToast } from './kudos-toast';
import { toggleKudosLike } from '@/lib/kudos/actions';

type KudosPageProps = {
  highlightCards: KudosCardType[];
  allCards: KudosCardType[];
  hashtags: string[];
  departments: string[];
  selectedHashtag: string | null;
  selectedDepartment: string | null;
  sidebarStats: SidebarStats;
  giftRecipients: GiftRecipient[];
  spotlightNames: SpotlightName[];
  totalKudos: number;
};

type LikePatch = { id: string; liked: boolean; likeCount: number };

function applyPatch(cards: KudosCardType[], patch: LikePatch): KudosCardType[] {
  return cards.map((c) =>
    c.id === patch.id
      ? { ...c, likedByMe: patch.liked, likeCount: patch.likeCount }
      : c,
  );
}

export default function KudosPage({
  highlightCards,
  allCards,
  hashtags,
  departments,
  selectedHashtag,
  selectedDepartment,
  sidebarStats,
  giftRecipients,
  spotlightNames,
  totalKudos,
}: KudosPageProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { toast, showToast, dismissToast } = useKudosToast();

  // Two independent optimistic states so a like in the highlight carousel
  // does not have to wait for the All Kudos list to re-render and vice versa.
  const [optimisticHighlight, setOptimisticHighlight] = useOptimistic<
    KudosCardType[],
    LikePatch
  >(highlightCards, applyPatch);
  const [optimisticAll, setOptimisticAll] = useOptimistic<
    KudosCardType[],
    LikePatch
  >(allCards, applyPatch);

  const handleLike = useCallback(
    (id: string) => {
      const target =
        optimisticAll.find((c) => c.id === id) ??
        optimisticHighlight.find((c) => c.id === id);
      if (!target || !target.canLike) return;

      const nextLiked = !target.likedByMe;
      const nextCount = target.likeCount + (nextLiked ? 1 : -1);

      startTransition(async () => {
        // Optimistic write — same patch applied to both lists.
        const patch: LikePatch = { id, liked: nextLiked, likeCount: nextCount };
        setOptimisticHighlight(patch);
        setOptimisticAll(patch);

        const result = await toggleKudosLike(id);
        if (!result.ok) {
          showToast(result.error ?? 'Không thể cập nhật lượt thích');
          router.refresh(); // reconcile from server
          return;
        }
        // Reconcile in case server count drifted (e.g. weight=2 on special day).
        const reconciled: LikePatch = {
          id,
          liked: result.liked,
          likeCount: result.likeCount,
        };
        setOptimisticHighlight(reconciled);
        setOptimisticAll(reconciled);
        router.refresh();
      });
    },
    [
      optimisticAll,
      optimisticHighlight,
      router,
      setOptimisticAll,
      setOptimisticHighlight,
      showToast,
    ],
  );

  const handleCopyLink = useCallback(
    (id: string) => {
      if (typeof window !== 'undefined') {
        const url = `${window.location.origin}/kudos#kudos/${id}`;
        navigator.clipboard.writeText(url).catch(() => {});
      }
      showToast('Link đã được sao chép — sẵn sàng chia sẻ!');
    },
    [showToast],
  );

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#00101A',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 80,
      }}
    >
      <KudosHeroBanner />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 120,
          paddingBottom: 120,
        }}
      >
        <div style={{ paddingTop: 64 }}>
          <KudosHighlightSection
            cards={optimisticHighlight}
            hashtags={hashtags}
            departments={departments}
            selectedHashtag={selectedHashtag}
            selectedDepartment={selectedDepartment}
            onLike={handleLike}
            onCopyLink={handleCopyLink}
          />
        </div>

        <KudosSpotlightBoard names={spotlightNames} totalKudos={totalKudos} />

        <section
          aria-labelledby="all-kudos-heading"
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 40 }}
        >
          <div
            style={{
              padding: '0 144px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Sun* Annual Awards 2025
            </p>

            <h2
              id="all-kudos-heading"
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 57,
                fontWeight: 700,
                lineHeight: '64px',
                letterSpacing: '-0.25px',
                color: '#FFEA9E',
              }}
            >
              TẤT CẢ KUDOS
            </h2>
          </div>

          <div
            style={{
              padding: '0 144px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 80,
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                minWidth: 0,
              }}
            >
              {optimisticAll.length === 0 ? (
                <KudosEmptyState />
              ) : (
                optimisticAll.map((card) => (
                  <KudosCardItem
                    key={card.id}
                    card={card}
                    onLike={handleLike}
                    onCopyLink={handleCopyLink}
                  />
                ))
              )}
            </div>

            <KudosSidebar stats={sidebarStats} giftRecipients={giftRecipients} />
          </div>
        </section>
      </div>

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}
