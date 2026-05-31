'use client';

import { useEffect, useRef, useState } from 'react';
import type { SpotlightName, SpotlightActivity } from './types';
import { t, type Language } from '@/lib/i18n/dictionary';

type KudosSpotlightBoardProps = {
  lang: Language;
  names: SpotlightName[];
  totalKudos: number;
  activity?: SpotlightActivity[];
};

// Small, dense cloud to match Figma (name nodes ~7–11px tall)
const SIZE_STYLES: Record<SpotlightName['size'], { fontSize: number; fontWeight: number; opacity: number }> = {
  lg: { fontSize: 13, fontWeight: 700, opacity: 1 },
  md: { fontSize: 11, fontWeight: 600, opacity: 0.85 },
  sm: { fontSize: 9, fontWeight: 500, opacity: 0.6 },
};

// Deterministic pseudo-random placement using name hash
function pseudoRandom(seed: string, offset: number): number {
  let h = offset * 2654435761;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export default function KudosSpotlightBoard({
  lang,
  names,
  totalKudos,
  activity = [],
}: KudosSpotlightBoardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state with the browser's fullscreen status so ESC / system exit
  // updates the toggle button label too (Fullscreen API).
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === canvasRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void canvasRef.current?.requestFullscreen();
    }
  };

  return (
    <section
      className="px-page"
      aria-labelledby="spotlight-board-heading"
      style={{ width: '100%', boxSizing: 'border-box' }}
    >
      {/* B.6 Header — Figma node 2940:13476 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {/* Eyebrow — Figma node 2940:13477: 24px/700, white, no uppercase */}
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

        {/* Divider — Figma node 2940:13478 (Rectangle 26): 1px #2E3940 */}
        <div
          aria-hidden="true"
          style={{ width: '100%', height: 1, backgroundColor: '#2E3940' }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <h2
            id="spotlight-board-heading"
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
            {t(lang, 'kudos.spotlight.title')}
          </h2>
        </div>
      </div>

      {/* B.7 Spotlight canvas */}
      <div
        ref={canvasRef}
        className="kudos-spotlight-canvas"
        style={{
          position: 'relative',
          width: '100%',
          // In fullscreen the UA sizes the element to the viewport; drop the
          // fixed frame so the canvas fills the whole screen edge-to-edge.
          maxWidth: isFullscreen ? 'none' : 1157,
          height: isFullscreen ? '100vh' : 548,
          borderRadius: isFullscreen ? 0 : 47,
          border: isFullscreen ? 'none' : '1px solid #998C5F',
          // Decorative background — Figma "Root further mo rong 1" aurora ribbon (spotlight-bg.png)
          // with the constellation network (spotlight-bg.svg) layered on top.
          backgroundColor: '#00101A',
          backgroundImage:
            'url(/kudos/spotlight-bg.svg), url(/kudos/spotlight-bg.png)',
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
          overflow: 'hidden',
        }}
      >
        {/* B.7.3 Search field — Figma node 2940:14833: 219×39, left-aligned */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            zIndex: 10,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            width: 219,
            height: 39,
            padding: '0 11px',
            borderRadius: 46,
            border: '1px solid #998C5F',
            background: 'rgba(255,234,158,0.10)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, color: '#FFFFFF' }}
          >
            <path
              d="M9.5 3C11.2239 3 12.8772 3.68482 14.0962 4.90381C15.3152 6.12279 16 7.77609 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C7.77609 16 6.12279 15.3152 4.90381 14.0962C3.68482 12.8772 3 11.2239 3 9.5C3 7.77609 3.68482 6.12279 4.90381 4.90381C6.12279 3.68482 7.77609 3 9.5 3ZM9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"
              fill="currentColor"
            />
          </svg>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              lineHeight: '16px',
              letterSpacing: '0.1px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {t(lang, 'kudos.spotlight.search.placeholder')}
          </span>
        </div>

        {/* B.7.1 Total kudos count — Figma node 3007:17482 (centered top) */}
        <p
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            margin: 0,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 36,
            fontWeight: 700,
            lineHeight: '44px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
          }}
        >
          {totalKudos.toLocaleString('vi-VN')} {t(lang, 'kudos.spotlight.count.suffix')}
        </p>

        {/* Name cloud — absolute positioned spans */}
        <div
          style={{ position: 'absolute', inset: 0 }}
          aria-label={t(lang, 'kudos.spotlight.names.aria')}
        >
          {(() => {
            // Deterministic GRID placement so names never overlap each other, AND
            // never land on the four overlays (search input, total-kudos count,
            // recent-kudos ticker, fullscreen icon). Cells whose centre falls inside a
            // reserved overlay zone are dropped; names fill only the free cells. Each
            // name owns one cell + small jitter for the organic cloud feel. The
            // highlighted name is pinned centre (always outside the reserved zones).
            const cloud = names.filter((n) => !n.highlighted);

            // Reserved overlay rectangles in % of the canvas [x0, x1, y0, y1],
            // padded so a name's whole text box stays clear of each overlay.
            const RESERVED: [number, number, number, number][] = [
              [0, 28, 0, 16], // search input — top-left
              [30, 70, 0, 16], // total kudos count — top-centre
              [0, 46, 66, 100], // recent-kudos ticker — bottom-left
              [84, 100, 78, 100], // fullscreen icon — bottom-right
            ];

            // Keep names off the canvas edges; the cloud lives inside this padded box.
            const PAD_X = 4;
            const PAD_Y = 7;
            const INNER_W = 100 - 2 * PAD_X;
            const INNER_H = 100 - 2 * PAD_Y;
            const NAME_H = 3.6; // ≈ name line-height as % of canvas height
            const GAP = 0.8; // min breathing gap between two names (%)

            // Estimated rendered width of a name (% of canvas width). 0.62 ≈ average
            // Montserrat glyph width relative to font size.
            const nameWidthPct = (n: SpotlightName) =>
              Math.min(INNER_W, ((n.name.length * SIZE_STYLES[n.size].fontSize * 0.62) / 1157) * 100);

            type Box = { l: number; r: number; t: number; b: number };
            const hitsReserved = (box: Box) =>
              RESERVED.some(([x0, x1, y0, y1]) => box.l < x1 && x0 < box.r && box.t < y1 && y0 < box.b);
            // Intersection area of two boxes inflated by the breathing gap (0 = clear).
            const overlap = (a: Box, b: Box) => {
              const ox = Math.min(a.r, b.r + GAP) - Math.max(a.l, b.l - GAP);
              const oy = Math.min(a.b, b.b + GAP) - Math.max(a.t, b.t - GAP);
              return ox > 0 && oy > 0 ? ox * oy : 0;
            };

            // Organic (non-grid) placement via deterministic dart-throwing: try up to
            // ATTEMPTS pseudo-random spots per name, take the first that clears the
            // overlays and every name already placed; if none is perfectly clear, keep
            // the least-overlapping one. Result is scattered (not row-aligned) with
            // overlap minimised. Deterministic (hash of id) → SSR and client agree.
            const ATTEMPTS = 60;
            const pos = ((): Map<string, { x: number; y: number }> => {
              const placed: Box[] = [];
              const hl = names.find((n) => n.highlighted);
              if (hl) {
                const w = nameWidthPct(hl);
                placed.push({ l: 50 - w / 2, r: 50 + w / 2, t: 32 - NAME_H / 2, b: 32 + NAME_H / 2 });
              }
              const out = new Map<string, { x: number; y: number }>();
              for (const n of cloud) {
                const w = nameWidthPct(n);
                let best: { x: number; y: number; box: Box } | null = null;
                let bestScore = Infinity;
                for (let k = 0; k < ATTEMPTS; k += 1) {
                  const x = PAD_X + w / 2 + pseudoRandom(n.id, k * 2 + 1) * (INNER_W - w);
                  const y = PAD_Y + NAME_H / 2 + pseudoRandom(n.id, k * 2 + 2) * (INNER_H - NAME_H);
                  const box: Box = { l: x - w / 2, r: x + w / 2, t: y - NAME_H / 2, b: y + NAME_H / 2 };
                  if (hitsReserved(box)) continue;
                  const score = placed.reduce((s, p) => s + overlap(box, p), 0);
                  if (score === 0) {
                    best = { x, y, box };
                    break;
                  }
                  if (score < bestScore) {
                    bestScore = score;
                    best = { x, y, box };
                  }
                }
                const chosen = best ?? { x: 50, y: 50, box: { l: 50, r: 50, t: 50, b: 50 } };
                placed.push(chosen.box);
                out.set(n.id, { x: chosen.x, y: chosen.y });
              }
              return out;
            })();

            return names.map((item) => {
              const p = item.highlighted ? { x: 50, y: 32 } : pos.get(item.id) ?? { x: 50, y: 50 };
              const x = p.x;
              const y = p.y;
              const { fontSize, fontWeight, opacity } = SIZE_STYLES[item.size];

              return (
                <span
                  key={item.id}
                  title={item.name}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    zIndex: item.highlighted ? 5 : 1,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize,
                    fontWeight,
                    // Single most-prominent name in red (Figma node 2940:14198: #F17676)
                    color: item.highlighted ? '#F17676' : 'rgba(255,255,255,0.8)',
                    opacity,
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                    textShadow: item.highlighted
                      ? '0 0 16px rgba(241,118,118,0.45)'
                      : 'none',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {item.name}
                </span>
              );
            });
          })()}
        </div>

        {/* B.7.2 Fullscreen toggle — Figma node 3007:17479 (bottom-right, 30×30 expand icon).
            Toggles native fullscreen on the spotlight canvas. */}
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={t(
            lang,
            isFullscreen ? 'kudos.spotlight.fullscreen.exit' : 'kudos.spotlight.fullscreen.enter',
          )}
          style={{
            position: 'absolute',
            right: 36,
            bottom: 44,
            zIndex: 10,
            width: 30,
            height: 30,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFEA9E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isFullscreen ? (
              <>
                {/* Two diagonal arrows pointing inward (↙ / ↗) — collapse */}
                <polyline points="4 10 10 10 10 4" />
                <line x1="10" y1="10" x2="4" y2="4" />
                <polyline points="20 14 14 14 14 20" />
                <line x1="14" y1="14" x2="20" y2="20" />
              </>
            ) : (
              <>
                {/* Two detached diagonal arrows pointing outward (↗ / ↙) with a centre gap */}
                <polyline points="14 4 20 4 20 10" />
                <line x1="20" y1="4" x2="14.5" y2="9.5" />
                <polyline points="10 20 4 20 4 14" />
                <line x1="4" y1="20" x2="9.5" y2="14.5" />
              </>
            )}
          </svg>
        </button>

        {/* Activity ticker — Figma nodes 3004:15995–2940:14230 (bottom-left, fading) */}
        {activity.length > 0 && (
          <div
            aria-label={t(lang, 'kudos.spotlight.activity.aria')}
            style={{
              position: 'absolute',
              left: 32,
              bottom: 20,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Oldest on top → newest at the bottom, fading upward like the design */}
            {[...activity].slice(0, 5).reverse().map((a, i, arr) => {
              const recency = arr.length - 1 - i; // 0 = newest (bottom)
              return (
                <p
                  key={a.id}
                  style={{
                    margin: 0,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: '23px',
                    letterSpacing: '0.1px',
                    color: '#FFFFFF',
                    opacity: Math.max(0.15, 1 - recency * 0.22),
                    whiteSpace: 'nowrap',
                  }}
                >
                  {/* Time is faded relative to the bright white name (Figma) */}
                  <span style={{ opacity: 0.5 }}>{a.time}</span>{' '}
                  {t(lang, 'kudos.spotlight.activity.item').replace('{name}', a.name)}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
