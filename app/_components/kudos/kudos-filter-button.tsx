'use client';

import { useState, useRef, useEffect } from 'react';
import { t, type Language } from '@/lib/i18n/dictionary';

type KudosFilterButtonProps = {
  lang: Language;
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  /** Display-only prefix for each option/selected value (e.g. "#" for hashtags).
      The stored/selected value stays unprefixed. */
  prefix?: string;
};

export default function KudosFilterButton({
  lang,
  label,
  options,
  selected,
  onSelect,
  prefix = '',
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
          // Figma trigger text (B.1.1 node I2940:13459;186:2760): 16/700 white,
          // ls 0.15. Gold kept only for the active (filter-applied) state.
          color: isActive ? '#FFEA9E' : '#FFFFFF',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: '24px',
          letterSpacing: '0.15px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition:
            'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }}
      >
        <span>{selected ? `${prefix}${selected}` : label}</span>
        {/* Down caret — exact Figma asset MM_MEDIA_Down (filled triangle) */}
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
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="kudos-dropdown-scroll"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: 160,
            maxHeight: 320,
            overflowY: 'auto',
            margin: 0,
            padding: 6,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            // Dropdown-List (Figma 563:8026): #00070C, 1px #998C5F, radius 8, pad 6
            borderRadius: 8,
            border: '1px solid #998C5F',
            backgroundColor: '#00070C',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
                padding: 16,
                textAlign: 'left',
                borderRadius: 4,
                background: selected === null ? 'rgba(255,234,158,0.10)' : 'none',
                border: 'none',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                lineHeight: '24px',
                letterSpacing: '0.5px',
                textShadow:
                  selected === null
                    ? '0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287'
                    : 'none',
                cursor: 'pointer',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (selected !== null) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== null) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }
              }}
            >
              {t(lang, 'kudos.filter.clear')}
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
                  padding: 16,
                  textAlign: 'left',
                  borderRadius: 4,
                  background:
                    selected === opt ? 'rgba(255,234,158,0.10)' : 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  textShadow:
                    selected === opt
                      ? '0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287'
                      : 'none',
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
                {prefix}{opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
