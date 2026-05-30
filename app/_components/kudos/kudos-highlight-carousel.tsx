'use client';

import { useState, useCallback, type CSSProperties } from 'react';
import type { KudosCard } from './types';
import KudosCardHighlight from './kudos-card-highlight';
import KudosEmptyState from './kudos-empty-state';
import { t, type Language } from '@/lib/i18n/dictionary';

type KudosHighlightCarouselProps = {
  lang: Language;
  cards: KudosCard[];
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

// Nav button (Figma B.2.1/B.2.2 side = 80/60, B.5.1/B.5.3 bottom = 48/28).
// Transparent square (radius 4); the icon is a filled white chevron.
const CHEVRON = {
  prev: 'M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z',
  next: 'M8.57959 16.4777L13.1596 11.8977L8.57959 7.3077L9.98959 5.89771L15.9896 11.8977L9.98959 17.8977L8.57959 16.4777Z',
};

function NavButton({
  lang,
  direction,
  onClick,
  size,
  iconSize,
  style,
}: {
  lang: Language;
  direction: 'prev' | 'next';
  onClick: () => void;
  size: number;
  iconSize: number;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? t(lang, 'kudos.carousel.prev') : t(lang, 'kudos.carousel.next')}
      style={{
        width: size,
        height: size,
        padding: 10,
        borderRadius: 4,
        border: 'none',
        background: 'transparent',
        color: '#FFFFFF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s ease, opacity 0.15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          'rgba(255,234,158,0.10)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d={CHEVRON[direction]} fill="currentColor" />
      </svg>
    </button>
  );
}

export default function KudosHighlightCarousel({
  lang,
  cards,
  onLike,
  onCopyLink,
}: KudosHighlightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = cards.length;

  // Circular navigation — wraps around so the carousel loops through all kudos.
  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % total);
  }, [total]);

  if (total === 0) {
    return (
      <div className="px-page">
        <KudosEmptyState lang={lang} />
      </div>
    );
  }

  // Always render 3 cards (prev · current · next), wrapping around the ends so
  // the focused kudo stays centered with a dimmed peek on each side.
  const visibleIndices =
    total >= 3
      ? [
          (currentIndex - 1 + total) % total,
          currentIndex,
          (currentIndex + 1) % total,
        ]
      : Array.from({ length: total }, (_, i) => i);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        width: '100%',
      }}
    >
      {/* Cards viewport — px-page gutters on the OUTER box (no clipping), the
          INNER box (= content width 1152) does the clipping so the side cards
          are cut exactly at the page gutter line, aligned with every other
          section's edges. */}
      <div className="px-page" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            width: '100%',
            overflow: 'hidden',
            paddingTop: 16,
            paddingBottom: 16,
            boxSizing: 'border-box',
          }}
          aria-label={t(lang, 'kudos.highlight.title')}
        >
          {visibleIndices.map((cardIdx, pos) => (
            <KudosCardHighlight
              key={`${cards[cardIdx].id}-${pos}`}
              lang={lang}
              card={cards[cardIdx]}
              onLike={onLike}
              onCopyLink={onCopyLink}
            />
          ))}

          {/* Edge fades (Figma Frame 527/528): the side cards dissolve into the
              #00101A background from each gutter inward. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: 'min(260px, 18%)',
              background:
                'linear-gradient(90deg, #00101A 30%, rgba(0, 16, 26, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 'min(260px, 18%)',
              background:
                'linear-gradient(270deg, #00101A 30%, rgba(0, 16, 26, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Side nav buttons (Figma B.2.1/B.2.2) — overlaid on the edge fades,
              vertically centered on the cards. */}
          <NavButton
            lang={lang}
            direction="prev"
            onClick={prev}
            size={80}
            iconSize={60}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
            }}
          />
          <NavButton
            lang={lang}
            direction="next"
            onClick={next}
            size={80}
            iconSize={60}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
            }}
          />
        </div>
      </div>

      {/* Bottom slide control (Figma B.5): ← 48px · "i/total" 28/700 #999 · → 48px */}
      <div
        className="px-page"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <NavButton lang={lang} direction="prev" onClick={prev} size={48} iconSize={28} />
        {/* Page indicator (Figma B.5.2): active page is larger + white, the
            "/total" is smaller + muted grey. */}
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            display: 'inline-flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            minWidth: 56,
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: '44px',
              color: '#FFEA9E',
            }}
          >
            {currentIndex + 1}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: '44px',
              color: '#999999',
            }}
          >
            /{total}
          </span>
        </span>
        <NavButton lang={lang} direction="next" onClick={next} size={48} iconSize={28} />
      </div>
    </div>
  );
}
