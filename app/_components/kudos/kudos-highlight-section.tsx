'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { KudosCard } from './types';
import KudosFilterButton from './kudos-filter-button';
import KudosHighlightCarousel from './kudos-highlight-carousel';

type KudosHighlightSectionProps = {
  cards: KudosCard[];
  hashtags: string[];
  departments: string[];
  selectedHashtag: string | null;
  selectedDepartment: string | null;
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

export default function KudosHighlightSection({
  cards,
  hashtags,
  departments,
  selectedHashtag,
  selectedDepartment,
  onLike,
  onCopyLink,
}: KudosHighlightSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Filtering is server-side via searchParams; the section pushes URL changes
  // and the page re-fetches. This keeps highlight + all kudos in sync.
  const updateFilter = useCallback(
    (key: 'hashtag' | 'department', value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/kudos?${qs}` : '/kudos');
      });
    },
    [router, searchParams],
  );

  return (
    <section
      aria-labelledby="highlight-kudos-heading"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <h2
            id="highlight-kudos-heading"
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
            HIGHLIGHT KUDOS
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KudosFilterButton
              label="Hashtag"
              options={hashtags}
              selected={selectedHashtag}
              onSelect={(v) => updateFilter('hashtag', v)}
            />
            <KudosFilterButton
              label="Phòng ban"
              options={departments}
              selected={selectedDepartment}
              onSelect={(v) => updateFilter('department', v)}
            />
          </div>
        </div>
      </div>

      <KudosHighlightCarousel
        cards={cards}
        onLike={onLike}
        onCopyLink={onCopyLink}
      />
    </section>
  );
}
