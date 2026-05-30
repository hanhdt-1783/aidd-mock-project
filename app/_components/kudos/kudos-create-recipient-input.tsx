'use client';

import { useState, useRef, useEffect } from 'react';
import type { RecipientOption } from './kudos-create-form-types';
import { t, type Language } from '@/lib/i18n/dictionary';

type Props = {
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
  recipients: RecipientOption[];
  lang: Language;
};

export default function KudosCreateRecipientInput({ value, onChange, recipients, lang }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);

  const filtered = recipients
    .filter((r) =>
      r.displayName.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10);

  function select(recipient: RecipientOption) {
    onChange(recipient);
    setQuery('');
    setOpen(false);
  }

  // Close the dropdown and discard any abandoned search text, so reopening
  // starts fresh (full list / selected value) instead of a stale query.
  function close() {
    setOpen(false);
    setQuery('');
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // On open, bring the currently-selected recipient into view in the list.
  useEffect(() => {
    if (open) selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
      {/* Trigger / selected display */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="recipient-listbox"
        onClick={() => {
          if (open) {
            close();
          } else {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          border: '1px solid #998C5F',
          borderRadius: 8,
          background: '#FFF',
          cursor: 'pointer',
          minHeight: 56,
          boxSizing: 'border-box',
          gap: 8,
        }}
      >
        {open ? (
          /* Search input — type to filter / change recipient */
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
            placeholder={t(lang, 'kudos.create.recipient.search')}
            aria-label={t(lang, 'kudos.create.recipient.search.aria')}
            className="kudos-field"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#00101A',
              background: 'transparent',
            }}
          />
        ) : value ? (
          /* Selected recipient — plain name text per Figma "Gửi lời chúc Kudos"
             (node I662:9637;520:9873;186:2760): Montserrat 16/700, #00101A,
             0.15px tracking. A select, NOT a chip — no avatar/department/clear. */
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#00101A',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value.displayName}
          </span>
        ) : (
          /* Placeholder — Montserrat 16/700 #999 (matches the design's
             input placeholder style: node I662:9637;1688:10437;186:2760). */
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#999',
              flex: 1,
            }}
          >
            {t(lang, 'kudos.create.recipient.search')}
          </span>
        )}

        {/* Dropdown indicator — filled down-triangle (Material arrow_drop_down),
            dark #00101A, per Figma "Gửi lời chúc Kudos" node I662:9637;520:9873;186:2761.
            Always shown (this is a select); rotates when open. */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#00101A',
          }}
        >
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id="recipient-listbox"
          role="listbox"
          aria-label={t(lang, 'kudos.create.recipient.listbox.aria')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            // Dark panel matching the hashtag dropdown (Figma p9zO-c4a4x node
            // 1002:13102): #00070C, 1px #998C5F border, radius 8, 6px padding.
            background: '#00070C',
            border: '1px solid #998C5F',
            borderRadius: 8,
            padding: 6,
            listStyle: 'none',
            margin: 0,
            maxHeight: 320,
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                // Empty-state notice, muted grey on the dark panel.
                padding: '10px 16px',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: '#999',
              }}
            >
              {t(lang, 'kudos.create.notFound')}
            </li>
          ) : (
            filtered.map((r) => {
              // Mark the currently-selected recipient so reopening shows who's
              // chosen (gold tint + check + aria-selected); ref scrolls it in.
              const isSelected = value?.id === r.id;
              const baseBg = isSelected ? 'rgba(255, 234, 158, 0.20)' : 'transparent';
              return (
                <li
                  key={r.id}
                  ref={isSelected ? selectedItemRef : undefined}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={() => select(r)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    borderRadius: isSelected ? 2 : 0,
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                    background: baseBg,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLLIElement).style.background = 'rgba(255,234,158,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background = baseBg;
                  }}
                >
                  <AvatarCircle avatarUrl={r.avatarUrl} displayName={r.displayName} size={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {/* Dark theme (like hashtag dropdown): name white 16/700,
                        department muted grey. */}
                    <div
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: '24px',
                        letterSpacing: '0.15px',
                        color: '#FFFFFF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.displayName}
                    </div>
                    {r.department && (
                      <div
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: 13,
                          fontWeight: 500,
                          lineHeight: '18px',
                          color: '#999',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {r.department}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="#FFEA9E" />
                      <path d="M8.5 12.5l2.4 2.4 4.6-5.1" stroke="#00101A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

// Inline avatar — no external Image import needed for small UI elements
function AvatarCircle({
  avatarUrl,
  displayName,
  size,
}: {
  avatarUrl: string | null;
  displayName: string;
  size: number;
}) {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid rgba(153,140,95,0.3)',
          background: '#E8E0CB',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(153,140,95,0.2)',
        border: '1px solid #998C5F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Montserrat, sans-serif',
        fontSize: size * 0.35,
        fontWeight: 700,
        color: '#998C5F',
      }}
    >
      {initials}
    </div>
  );
}
