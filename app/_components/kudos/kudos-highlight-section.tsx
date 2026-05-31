'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { KudosCard } from './types';
import KudosFilterButton from './kudos-filter-button';
import KudosHighlightCarousel from './kudos-highlight-carousel';
import { t, type Language } from '@/lib/i18n/dictionary';

type KudosHighlightSectionProps = {
  lang: Language;
  cards: KudosCard[];
  hashtags: string[];
  departments: string[];
  selectedHashtag: string | null;
  selectedDepartment: string | null;
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

export default function KudosHighlightSection({
  lang,
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

  // Filtering is server-side via searchParams: push the URL change so the page
  // re-fetches and HIGHLIGHT KUDOS re-filters. `scroll: false` keeps the viewport
  // in place — without it Next 16 scrolls to the top on every navigation, which
  // made the page "jump" each time a filter was picked.
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
        router.push(qs ? `/kudos?${qs}` : '/kudos', { scroll: false });
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
        className="px-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Eyebrow — Figma node 2940:13454: 24px/700, white, no uppercase */}
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
          {t(lang, 'kudos.subtitle')}
        </p>

        {/* Divider — Figma node 2940:13455 (Rectangle 26): 1px #2E3940 */}
        <div
          aria-hidden="true"
          style={{ width: '100%', height: 1, backgroundColor: '#2E3940' }}
        />

        <div
          className="kudos-highlight-header-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <h2
            id="highlight-kudos-heading"
            className="kudos-section-heading"
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
            {t(lang, 'kudos.highlight.title')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KudosFilterButton
              lang={lang}
              label={t(lang, 'kudos.filter.hashtag')}
              prefix="#"
              options={hashtags}
              selected={selectedHashtag}
              onSelect={(v) => updateFilter('hashtag', v)}
            />
            <KudosFilterButton
              lang={lang}
              label={t(lang, 'kudos.filter.department')}
              options={departments}
              selected={selectedDepartment}
              onSelect={(v) => updateFilter('department', v)}
            />
          </div>
        </div>
      </div>

      <KudosHighlightCarousel
        lang={lang}
        cards={cards}
        onLike={onLike}
        onCopyLink={onCopyLink}
      />
    </section>
  );
}
