'use client';

// Toolbar button IDs match the design: C.1 Bold, C.2 Italic, C.3 Strike, C.4 NumberList, C.5 Link, C.6 Quote
// All icons are inline SVG to allow CSS color control (fills match design #00101A / currentColor)

type ToolbarAction = 'bold' | 'italic' | 'strike' | 'list' | 'link' | 'quote';

type Props = {
  onAction: (action: ToolbarAction) => void;
};

const TOOLBAR_ITEMS: { id: ToolbarAction; label: string; icon: React.ReactNode }[] = [
  {
    id: 'bold',
    label: 'Đậm',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4h8a4 4 0 0 1 0 8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12h9a4 4 0 0 1 0 8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'italic',
    label: 'Nghiêng',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'strike',
    label: 'Gạch ngang',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'Danh sách',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="3" y="7" fontSize="7" fill="currentColor" fontFamily="sans-serif">1.</text>
        <text x="3" y="13" fontSize="7" fill="currentColor" fontFamily="sans-serif">2.</text>
        <text x="3" y="19" fontSize="7" fill="currentColor" fontFamily="sans-serif">3.</text>
      </svg>
    ),
  },
  {
    id: 'link',
    label: 'Liên kết',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'quote',
    label: 'Trích dẫn',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

// Border radius per position: leftmost = top-left rounded, rightmost = top-right rounded, middle = square
function getRadius(index: number, total: number): string {
  if (index === 0) return '8px 0 0 0';
  if (index === total - 1) return '0 8px 0 0';
  return '0';
}

export default function KudosCreateRichToolbar({ onAction }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
              width: 40,
              height: 40,
              padding: '10px 8px',
              background: 'transparent',
              border: '1px solid #998C5F',
              // Collapse adjacent left borders to avoid double-pixel gap
              marginLeft: idx === 0 ? 0 : -1,
              borderRadius: getRadius(idx, TOOLBAR_ITEMS.length),
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

      {/* Right: Community standards link */}
      <a
        href="/standards"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: '#CF1322',
          textDecoration: 'underline',
          flexShrink: 0,
          marginLeft: 8,
        }}
      >
        Tiêu chuẩn cộng đồng
      </a>
    </div>
  );
}
