import type { SpotlightName } from './types';

type KudosSpotlightBoardProps = {
  names: SpotlightName[];
  totalKudos: number;
};

const SIZE_STYLES: Record<SpotlightName['size'], { fontSize: number; fontWeight: number; opacity: number }> = {
  lg: { fontSize: 18, fontWeight: 800, opacity: 1 },
  md: { fontSize: 14, fontWeight: 600, opacity: 0.85 },
  sm: { fontSize: 12, fontWeight: 500, opacity: 0.65 },
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
}: KudosSpotlightBoardProps) {
  return (
    <section
      aria-label="Spotlight — tất cả người đã nhận Kudos"
      style={{ padding: '0 144px', width: '100%', boxSizing: 'border-box' }}
    >
      {/* B.6 Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 40,
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
            BẢNG VINH DANH
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
          backgroundColor: '#00070C',
          overflow: 'hidden',
        }}
      >
        {/* Total kudos badge */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 24,
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
          >
            <circle cx="11" cy="11" r="8" stroke="#FFEA9E" strokeWidth="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="#FFEA9E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#FFEA9E',
            }}
          >
            {totalKudos.toLocaleString('vi-VN')} Kudos
          </span>
        </div>

        {/* Name cloud — absolute positioned spans */}
        <div
          style={{ position: 'absolute', inset: 0 }}
          aria-label="Danh sách Sunner đã nhận Kudos"
        >
          {names.map((item) => {
            const x = pseudoRandom(item.id, 1) * 85 + 2; // 2-87%
            const y = pseudoRandom(item.id, 2) * 80 + 5; // 5-85%
            const { fontSize, fontWeight, opacity } = SIZE_STYLES[item.size];

            return (
              <span
                key={item.id}
                title={item.name}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize,
                  fontWeight,
                  color: item.highlighted ? '#FFEA9E' : 'rgba(255,255,255,0.8)',
                  opacity,
                  whiteSpace: 'nowrap',
                  cursor: 'default',
                  textShadow: item.highlighted
                    ? '0 0 16px rgba(255,234,158,0.4)'
                    : 'none',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {item.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
