'use client';

import { useState, useRef, useEffect } from 'react';
import { sanitizeTag } from '@/lib/kudos/sanitize-tag';
import { t, type Language } from '@/lib/i18n/dictionary';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  existingHashtags: string[];
  maxTags?: number;
  lang: Language;
};

const MAX = 5;

export default function KudosCreateHashtagInput({
  value,
  onChange,
  existingHashtags,
  maxTags = MAX,
  lang,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // All selectable tags with the currently-selected ones first (mirrors the
  // design's "đã chọn" group on top, then the rest).
  const otherTags = Array.from(
    new Set(existingHashtags.map(sanitizeTag).filter((tag) => tag && !value.includes(tag))),
  );
  const orderedTags = [...value, ...otherTags];
  // Filter by the search box so a long list stays findable.
  const filteredTags = query.trim()
    ? orderedTags.filter((tag) => tag.toLowerCase().includes(query.trim().toLowerCase()))
    : orderedTags;

  // Multi-select toggle: click adds (until maxTags) or removes a tag.
  function toggleTag(raw: string) {
    const tag = sanitizeTag(raw);
    if (!tag) return;
    if (value.includes(tag)) {
      onChange(value.filter((x) => x !== tag));
    } else if (value.length < maxTags) {
      onChange([...value, tag]);
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  // Close popover on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const canAdd = value.length < maxTags;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      {/* Chips row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              // Figma selected-chip I662:9637;662:8631: white bg, 1px #998C5F,
              // radius 8, padding 8/8/8/16, gap 8 (not a tinted pill).
              gap: 8,
              padding: '8px 8px 8px 16px',
              borderRadius: 8,
              background: '#FFF',
              border: '1px solid #998C5F',
              fontFamily: 'Montserrat, sans-serif',
              // Figma chip text I662:9637;662:8631;186:2760: 16/700, ls0.15.
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#00101A',
            }}
          >
            #{tag}
            <button
              type="button"
              aria-label={`${t(lang, 'kudos.create.hashtag.remove')} ${tag}`}
              onClick={() => removeTag(tag)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                padding: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#998C5F',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}

        {/* Add button + popover */}
        {canAdd && (
          <div style={{ position: 'relative' }} ref={popoverRef}>
            <button
              type="button"
              onClick={() => {
                setOpen((prev) => !prev);
                if (!open) setTimeout(() => inputRef.current?.focus(), 50);
                else setQuery('');
              }}
              // Figma "Gửi lời chúc Kudos" node I662:9637;662:8911: solid 1px
              // #998C5F border, radius 8, white bg, h48, 4px/8px padding, 24px
              // plus icon + two-line label (Hashtag / Tối đa 5) at 11/700/#999.
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '4px 8px',
                borderRadius: 8,
                background: '#FFF',
                border: '1px solid #998C5F',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(153,140,95,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFF';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#998C5F' }}>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {/* Line 1: prominent label (dark). Line 2: muted caption. */}
                <span style={{ fontSize: 14, fontWeight: 700, lineHeight: '20px', color: '#00101A', whiteSpace: 'nowrap' }}>
                  Hashtag
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, lineHeight: '16px', letterSpacing: '0.5px', color: '#999', whiteSpace: 'nowrap' }}>
                  {t(lang, 'kudos.create.max5')}
                </span>
              </span>
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  // Figma "Dropdown list hashtag" (p9zO-c4a4x) node 1002:13102:
                  // dark panel #00070C, 1px #998C5F border, radius 8, 6px padding.
                  width: 318,
                  maxWidth: '80vw',
                  background: '#00070C',
                  border: '1px solid #998C5F',
                  borderRadius: 8,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {/* Search to keep a long list findable (dark-themed). */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setOpen(false);
                      setQuery('');
                    }
                  }}
                  placeholder={t(lang, 'kudos.create.hashtag.search')}
                  className="kudos-field"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    border: '1px solid #998C5F',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    outline: 'none',
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 280, overflowY: 'auto' }}>
                {filteredTags.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 40,
                      padding: '0 16px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#999',
                    }}
                  >
                    {t(lang, 'kudos.create.notFound')}
                  </div>
                ) : (
                  filteredTags.map((tag) => {
                    const selected = value.includes(tag);
                    const disabled = !selected && value.length >= maxTags;
                    return (
                      <div
                        key={tag}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (!disabled) toggleTag(tag);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          height: 40,
                          padding: '0 16px',
                          borderRadius: selected ? 2 : 0,
                          // Selected: gold tint (node 1002:13185). Else transparent.
                          background: selected ? 'rgba(255,234,158,0.20)' : 'transparent',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.4 : 1,
                          flexShrink: 0,
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected && !disabled)
                            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,234,158,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        }}
                      >
                        <span
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
                          #{tag}
                        </span>
                        {selected && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#FFEA9E" />
                            <path d="M8.5 12.5l2.4 2.4 4.6-5.1" stroke="#00101A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
