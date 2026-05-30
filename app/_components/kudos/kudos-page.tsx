'use client';

import { useCallback, useOptimistic, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  GiftRecipient,
  KudosCard as KudosCardType,
  RecipientOption,
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
  recipients: RecipientOption[];
  currentUserId: string;
};

type LikePatch = { id: string; liked: boolean; likeCount: number };

// All-Kudos feed reveals this many cards at a time; "Xem thêm" loads another page.
const ALL_KUDOS_PAGE_SIZE = 5;

// Fixed timezone → identical SSR/client output (no hydration mismatch). "08:30PM"
const TICKER_TIME_FMT = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Ho_Chi_Minh',
});
function formatTickerTime(iso: string): string {
  return TICKER_TIME_FMT.format(new Date(iso)).replace(/\s/g, '').toUpperCase();
}

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
  recipients,
  currentUserId,
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

  // All-Kudos pagination: show 5, reveal more via "Xem thêm". Reset paging when
  // the active filter changes (render-time adjustment, not on every data refresh
  // — a like triggers router.refresh() and must NOT collapse the list).
  const [visibleCount, setVisibleCount] = useState(ALL_KUDOS_PAGE_SIZE);
  const filterKey = `${selectedHashtag ?? ''}|${selectedDepartment ?? ''}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(ALL_KUDOS_PAGE_SIZE);
  }

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
        const url = `${window.location.origin}/kudos/${id}`;
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
        // No top padding: the keyvisual hero runs to the top, behind the
        // fixed header (the hero content adds its own header clearance).
      }}
    >
      <KudosHeroBanner
        recipients={recipients}
        existingHashtags={hashtags}
        currentUserId={currentUserId}
      />

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

        <KudosSpotlightBoard
          names={spotlightNames}
          totalKudos={totalKudos}
          activity={allCards.slice(0, 5).map((c) => ({
            id: c.id,
            name: c.receiver.name,
            time: formatTickerTime(c.createdAt),
          }))}
        />

        <section
          aria-labelledby="all-kudos-heading"
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 40 }}
        >
          <div
            className="px-page"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Eyebrow — Figma "Header Giải thưởng": 24px/700, white, no uppercase */}
            <p
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                lineHeight: '32px',
                color: '#FFFFFF',
              }}
            >
              Sun* Annual Awards 2025
            </p>

            {/* Divider — 1px #2E3940 (Rectangle 26), matches HIGHLIGHT KUDOS */}
            <div
              aria-hidden="true"
              style={{ width: '100%', height: 1, backgroundColor: '#2E3940' }}
            />

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
              ALL KUDOS
            </h2>
          </div>

          <div
            className="px-page"
            style={{
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
                <>
                  {optimisticAll.slice(0, visibleCount).map((card) => (
                    <KudosCardItem
                      key={card.id}
                      card={card}
                      onLike={handleLike}
                      onCopyLink={handleCopyLink}
                    />
                  ))}
                  {optimisticAll.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((c) => c + ALL_KUDOS_PAGE_SIZE)
                      }
                      style={{
                        alignSelf: 'center',
                        marginTop: 8,
                        padding: '12px 32px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#FFEA9E',
                        color: '#00101A',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          '#FFD54F';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          '#FFEA9E';
                      }}
                    >
                      Xem thêm
                    </button>
                  )}
                </>
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
