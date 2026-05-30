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

  const suggestions = existingHashtags
    .map(sanitizeTag)
    .filter((t) => t && !value.includes(t) && t.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  // Allow creating a new tag if typed value isn't already in list
  const newTag = sanitizeTag(query);
  const canCreate = newTag.length > 0 && !value.includes(newTag) && !existingHashtags.map(sanitizeTag).includes(newTag);

  function addTag(raw: string) {
    const tag = sanitizeTag(raw);
    if (!tag || value.includes(tag) || value.length >= maxTags) return;
    onChange([...value, tag]);
    setQuery('');
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && query.trim()) {
      e.preventDefault();
      addTag(query);
    }
    if (e.key === 'Escape') setOpen(false);
  }

  // Close popover on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
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
              gap: 4,
              padding: '4px 10px 4px 12px',
              borderRadius: 20,
              background: 'rgba(153,140,95,0.15)',
              border: '1px solid #998C5F',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: 600,
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
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px dashed #998C5F',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#998C5F',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(153,140,95,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Hashtag
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  background: '#FFF',
                  border: '1px solid #998C5F',
                  borderRadius: 8,
                  padding: 8,
                  minWidth: 220,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t(lang, 'kudos.create.hashtag.search')}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    border: '1px solid #998C5F',
                    borderRadius: 6,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#00101A',
                    outline: 'none',
                    marginBottom: 6,
                  }}
                />
                <ul
                  role="listbox"
                  style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 180, overflowY: 'auto' }}
                >
                  {suggestions.map((tag) => (
                    <li
                      key={tag}
                      role="option"
                      aria-selected={false}
                      onMouseDown={() => addTag(tag)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#00101A',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLLIElement).style.background = 'rgba(153,140,95,0.10)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLLIElement).style.background = 'transparent';
                      }}
                    >
                      #{tag}
                    </li>
                  ))}
                  {canCreate && (
                    <li
                      role="option"
                      aria-selected={false}
                      onMouseDown={() => addTag(query)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#998C5F',
                        borderTop: suggestions.length > 0 ? '1px solid rgba(153,140,95,0.2)' : 'none',
                        marginTop: suggestions.length > 0 ? 4 : 0,
                        paddingTop: suggestions.length > 0 ? 8 : 7,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLLIElement).style.background = 'rgba(153,140,95,0.10)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLLIElement).style.background = 'transparent';
                      }}
                    >
                      + {t(lang, 'kudos.create.hashtag.create')} &ldquo;#{newTag}&rdquo;
                    </li>
                  )}
                  {suggestions.length === 0 && !canCreate && (
                    <li
                      style={{
                        padding: '7px 12px',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 13,
                        color: '#999',
                      }}
                    >
                      {t(lang, 'kudos.create.notFound')}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
