'use client';

// Toolbar button IDs match the design: C.1 Bold, C.2 Italic, C.3 Strike, C.4 NumberList, C.5 Link, C.6 Quote
// Icons are the standard FILLED format glyphs (Material format_*), matching the
// Figma "Viết Kudo" MM_MEDIA_Bold/Italic/… set (24px, fill currentColor → #00101A)
// — not the outlined/stroked approximations used before.

import { t, type Language } from '@/lib/i18n/dictionary';

type ToolbarAction = 'bold' | 'italic' | 'strike' | 'list' | 'link' | 'quote';

type Props = {
  onAction: (action: ToolbarAction) => void;
  lang: Language;
};

function getToolbarItems(lang: Language): { id: ToolbarAction; label: string; icon: React.ReactNode }[] {
  return [
  {
    id: 'bold',
    label: t(lang, 'kudos.create.toolbar.bold'),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
      </svg>
    ),
  },
  {
    id: 'italic',
    label: t(lang, 'kudos.create.toolbar.italic'),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
      </svg>
    ),
  },
  {
    id: 'strike',
    label: t(lang, 'kudos.create.toolbar.strike'),
    icon: (
      // format_strikethrough_s — a real "S" broken by a horizontal line,
      // matching the design's S̶ glyph (not an abstract bar).
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75-.14-.31-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58.16.45.37.85.65 1.21.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21z" />
      </svg>
    ),
  },
  {
    id: 'list',
    label: t(lang, 'kudos.create.toolbar.list'),
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
      </svg>
    ),
  },
  {
    id: 'link',
    label: t(lang, 'kudos.create.toolbar.link'),
    icon: (
      // Diagonal chain (lucide-style insert-link), stroked — per design.
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'quote',
    label: t(lang, 'kudos.create.toolbar.quote'),
    icon: (
      // Outline (stroked) double quotation marks — per design.
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  ];
}

// Only the first icon rounds its top-left corner. The toolbar's right end is the
// "Tiêu chuẩn cộng đồng" cell (which owns the top-right radius), so every icon
// after the first — including the last (quote) — stays square.
function getRadius(index: number): string {
  return index === 0 ? '8px 0 0 0' : '0';
}

export default function KudosCreateRichToolbar({ onAction, lang }: Props) {
  const TOOLBAR_ITEMS = getToolbarItems(lang);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 40,
      }}
    >
      {/* Left: formatting buttons — collapse borders via negative margin */}
      <div style={{ display: 'flex' }}>
        {TOOLBAR_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => onAction(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 40,
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid #998C5F',
              // Collapse adjacent left borders to avoid double-pixel gap
              marginLeft: idx === 0 ? 0 : -1,
              borderRadius: getRadius(idx),
              cursor: 'pointer',
              color: '#00101A',
              flexShrink: 0,
              transition: 'background 0.15s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(153,140,95,0.12)';
              (e.currentTarget as HTMLButtonElement).style.zIndex = '1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.zIndex = '0';
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Right: Community standards — its own bordered cell completing the
          toolbar bar (Figma node I662:9637;3053:11619): border 1px #998C5F,
          fills remaining width, text centered, top-right corner rounded. */}
      <a
        href="/standards"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 40,
          padding: '10px 16px',
          boxSizing: 'border-box',
          border: '1px solid #998C5F',
          // Collapse with the last icon's right border + round the top-right.
          marginLeft: -1,
          borderRadius: '0 8px 0 0',
          // Text — Figma node I662:9637;3053:11621:
          // Montserrat 16/700, #E46060 (rgba 228,96,96), lh24, 0.15px tracking.
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: '24px',
          letterSpacing: '0.15px',
          color: '#E46060',
          textDecoration: 'underline',
        }}
      >
        {t(lang, 'kudos.create.toolbar.communityStandards')}
      </a>
    </div>
  );
}
