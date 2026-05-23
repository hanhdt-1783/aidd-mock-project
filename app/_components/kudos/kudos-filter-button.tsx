'use client';

import { useState, useRef, useEffect } from 'react';

type KudosFilterButtonProps = {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

export default function KudosFilterButton({
  label,
  options,
  selected,
  onSelect,
}: KudosFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = selected !== null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          border: `1px solid ${isActive ? '#FFEA9E' : '#998C5F'}`,
          borderRadius: 4,
          background: isActive
            ? 'rgba(255, 234, 158, 0.20)'
            : 'rgba(255, 234, 158, 0.10)',
          color: isActive ? '#FFEA9E' : 'rgba(255,255,255,0.87)',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s ease, border-color 0.15s ease',
        }}
      >
        <span>{selected ?? label}</span>
        {/* Down chevron */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'inherit',
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: 180,
            maxHeight: 280,
            overflowY: 'auto',
            margin: 0,
            padding: '4px 0',
            listStyle: 'none',
            borderRadius: 8,
            border: '1px solid #998C5F',
            backgroundColor: '#00181F',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Clear option */}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={selected === null}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: selected === null ? 'rgba(255,234,158,0.12)' : 'none',
                border: 'none',
                color: selected === null ? '#FFEA9E' : 'rgba(255,255,255,0.7)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tất cả
            </button>
          </li>

          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={selected === opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  background:
                    selected === opt ? 'rgba(255,234,158,0.12)' : 'none',
                  border: 'none',
                  color:
                    selected === opt ? '#FFEA9E' : 'rgba(255,255,255,0.87)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 13,
                  fontWeight: selected === opt ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (selected !== opt) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== opt) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'none';
                  }
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
