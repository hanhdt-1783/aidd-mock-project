import type { SpotlightName, SpotlightActivity } from './types';

type KudosSpotlightBoardProps = {
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
  names,
  totalKudos,
  activity = [],
}: KudosSpotlightBoardProps) {
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
          Sun* Annual Awards 2025
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
            SPOTLIGHT BOARD
          </h2>
        </div>
      </div>

      {/* B.7 Spotlight canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1157,
          height: 548,
          borderRadius: 47,
          border: '1px solid #998C5F',
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
            Tìm kiếm
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
          {totalKudos.toLocaleString('vi-VN')} KUDOS
        </p>

        {/* Name cloud — absolute positioned spans */}
        <div
          style={{ position: 'absolute', inset: 0 }}
          aria-label="Danh sách Sunner đã nhận Kudos"
        >
          {names.map((item) => {
            // Reserve the top band (y < 16%) for the count + search field so
            // cloud names never overlap them. Cloud fills 16%–90% vertically.
            // The single highlighted name is pinned centre (Figma node 2940:14198).
            let x = item.highlighted ? 50 : pseudoRandom(item.id, 1) * 84 + 8; // 8-92%
            const y = item.highlighted ? 30 : pseudoRandom(item.id, 2) * 74 + 16; // 16-90%
            // Keep cloud names out of the bottom-left activity-ticker zone
            // (x < 56%, y > 70%) by shifting them into the free bottom-right area.
            if (!item.highlighted && y > 70 && x < 56) {
              x = 58 + pseudoRandom(item.id, 3) * 34; // 58-92%
            }
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
          })}
        </div>

        {/* B.7.2 Pan/zoom control — Figma node 3007:17479 (bottom-right, 30×30 expand icon) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 36,
            bottom: 44,
            zIndex: 10,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Two detached diagonal arrows pointing outward (↗ / ↙) with a centre gap */}
            <polyline points="14 4 20 4 20 10" />
            <line x1="20" y1="4" x2="14.5" y2="9.5" />
            <polyline points="10 20 4 20 4 14" />
            <line x1="4" y1="20" x2="9.5" y2="14.5" />
          </svg>
        </div>

        {/* Activity ticker — Figma nodes 3004:15995–2940:14230 (bottom-left, fading) */}
        {activity.length > 0 && (
          <div
            aria-label="Kudos vừa được trao gần đây"
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
                  <span style={{ opacity: 0.5 }}>{a.time}</span> {a.name} đã nhận
                  được một Kudos mới
                </p>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
