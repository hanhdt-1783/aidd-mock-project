'use client';

import { useState, useRef, useEffect } from 'react';
import type { RecipientOption } from './kudos-create-form-types';

type Props = {
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
  recipients: RecipientOption[];
};

export default function KudosCreateRecipientInput({ value, onChange, recipients }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function clear() {
    onChange(null);
    setQuery('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
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
          if (value) return; // clicking a selected value shows the clear button instead
          setOpen((prev) => !prev);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          border: '1px solid #998C5F',
          borderRadius: 8,
          background: '#FFF',
          cursor: value ? 'default' : 'pointer',
          minHeight: 56,
          boxSizing: 'border-box',
          gap: 8,
        }}
      >
        {value ? (
          /* Selected recipient chip */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <AvatarCircle avatarUrl={value.avatarUrl} displayName={value.displayName} size={32} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#00101A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value.displayName}
              </div>
              {value.department && (
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 12,
                    color: '#999',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {value.department}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Xóa người nhận"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#998C5F',
                padding: 2,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : open ? (
          /* Search input */
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            placeholder="Tìm kiếm..."
            aria-label="Tìm người nhận"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: '#00101A',
              background: 'transparent',
            }}
          />
        ) : (
          /* Placeholder */
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: '#999',
              flex: 1,
            }}
          >
            Tìm kiếm...
          </span>
        )}

        {/* Dropdown chevron */}
        {!value && (
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
              color: '#998C5F',
            }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id="recipient-listbox"
          role="listbox"
          aria-label="Danh sách người nhận"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#FFF',
            border: '1px solid #998C5F',
            borderRadius: 8,
            padding: '4px 0',
            listStyle: 'none',
            margin: 0,
            maxHeight: 280,
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                padding: '12px 16px',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 13,
                color: '#999',
              }}
            >
              Không tìm thấy
            </li>
          ) : (
            filtered.map((r) => (
              <li
                key={r.id}
                role="option"
                aria-selected={false}
                onMouseDown={() => select(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLIElement).style.background = 'rgba(153,140,95,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLIElement).style.background = 'transparent';
                }}
              >
                <AvatarCircle avatarUrl={r.avatarUrl} displayName={r.displayName} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#00101A',
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
                        fontSize: 12,
                        color: '#999',
                      }}
                    >
                      {r.department}
                    </div>
                  )}
                </div>
              </li>
            ))
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
