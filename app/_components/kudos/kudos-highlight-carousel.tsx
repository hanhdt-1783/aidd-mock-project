'use client';

import { useState, useCallback } from 'react';
import type { KudosCard } from './types';
import KudosCardHighlight from './kudos-card-highlight';
import KudosEmptyState from './kudos-empty-state';

type KudosHighlightCarouselProps = {
  cards: KudosCard[];
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

export default function KudosHighlightCarousel({
  cards,
  onLike,
  onCopyLink,
}: KudosHighlightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = cards.length;

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  if (total === 0) {
    return (
      <div style={{ padding: '0 144px' }}>
        <KudosEmptyState />
      </div>
    );
  }

  // Show at most 3 cards: prev (faded), current (prominent), next (faded)
  const visibleIndices = [currentIndex - 1, currentIndex, currentIndex + 1].filter(
    (i) => i >= 0 && i < total
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        width: '100%',
      }}
    >
      {/* Cards viewport */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          width: '100%',
          overflow: 'hidden',
          padding: '16px 144px',
          boxSizing: 'border-box',
        }}
        aria-label="Highlight kudos carousel"
      >
        {visibleIndices.map((cardIdx) => (
          <KudosCardHighlight
            key={cards[cardIdx].id}
            card={cards[cardIdx]}
            prominent={cardIdx === currentIndex}
            onLike={onLike}
            onCopyLink={onCopyLink}
          />
        ))}
      </div>

      {/* Pagination + navigation controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '0 144px',
        }}
      >
        {/* Prev button */}
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="Kudos trước"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '1px solid #998C5F',
            background:
              currentIndex === 0
                ? 'rgba(255,234,158,0.04)'
                : 'rgba(255,234,158,0.10)',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (currentIndex !== 0) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,234,158,0.20)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentIndex !== 0) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,234,158,0.10)';
            }
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M35 20L25 30l10 10"
              stroke="#FFEA9E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page indicator */}
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#FFEA9E',
            minWidth: 48,
            textAlign: 'center',
          }}
        >
          {currentIndex + 1}/{total}
        </span>

        {/* Next button */}
        <button
          type="button"
          onClick={next}
          disabled={currentIndex === total - 1}
          aria-label="Kudos tiếp theo"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '1px solid #998C5F',
            background:
              currentIndex === total - 1
                ? 'rgba(255,234,158,0.04)'
                : 'rgba(255,234,158,0.10)',
            cursor: currentIndex === total - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === total - 1 ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (currentIndex !== total - 1) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,234,158,0.20)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentIndex !== total - 1) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,234,158,0.10)';
            }
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M25 20l10 10-10 10"
              stroke="#FFEA9E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
