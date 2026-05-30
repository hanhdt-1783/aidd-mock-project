'use client';

import { useState, useRef, useCallback } from 'react';
import type { RecipientOption, KudoCreatePayload } from './kudos-create-form-types';
import KudosCreateRecipientInput from './kudos-create-recipient-input';
import KudosCreateRichToolbar from './kudos-create-rich-toolbar';
import KudosCreateHashtagInput from './kudos-create-hashtag-input';
import { t, type Language } from '@/lib/i18n/dictionary';

// ── Design tokens (from MCP) ──────────────────────────────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 22,
  fontWeight: 700,
  lineHeight: '28px',
  color: '#00101A',
  whiteSpace: 'nowrap',
};
const REQUIRED_STAR: React.CSSProperties = {
  fontFamily: 'Noto Sans JP, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  color: '#CF1322',
  marginLeft: 2,
};
const HINT_STYLE: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  color: '#999',
  lineHeight: '24px',
};
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '16px 24px',
  border: '1px solid #998C5F',
  borderRadius: 8,
  background: '#FFF',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 14,
  fontWeight: 500,
  color: '#00101A',
  outline: 'none',
};

// Label column width — measured from design: "Người nhận" label ~146px, "Danh hiệu" ~139px.
// Use a fixed column so all inputs align to the same left edge.
const LABEL_COL = '160px';
const SECTION_GAP = 24;

const MAX_CONTENT = 1000;
const MAX_TITLE = 200;
const MAX_IMAGES = 5;
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png';

type Props = {
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
  onSubmit: (payload: KudoCreatePayload) => Promise<void>;
  onCancel: () => void;
  lang: Language;
};

// Reusable label cell that matches the fixed LABEL_COL width
function LabelCell({
  children,
  required,
  alignTop,
  requiredLabel,
}: {
  children: React.ReactNode;
  required?: boolean;
  alignTop?: boolean;
  requiredLabel?: string;
}) {
  return (
    <div
      style={{
        width: LABEL_COL,
        minWidth: LABEL_COL,
        display: 'flex',
        alignItems: alignTop ? 'flex-start' : 'center',
        paddingTop: alignTop ? 6 : 0,
        flexShrink: 0,
      }}
    >
      <span style={LABEL_STYLE}>{children}</span>
      {required && (
        <span style={REQUIRED_STAR} aria-label={requiredLabel}>
          *
        </span>
      )}
    </div>
  );
}

export default function KudosCreateForm({
  recipients,
  existingHashtags,
  currentUserId,
  onSubmit,
  onCancel,
  lang,
}: Props) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [recipient, setRecipient] = useState<RecipientOption | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousAlias, setAnonymousAlias] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // @mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionAnchor, setMentionAnchor] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid =
    recipient !== null &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    hashtags.length >= 1;

  // ── Toolbar actions (wrap-selection) ─────────────────────────────────────
  const handleToolbarAction = useCallback(
    (action: 'bold' | 'italic' | 'strike' | 'list' | 'link' | 'quote') => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = content.slice(start, end);

      let replacement = '';

      switch (action) {
        case 'bold':
          replacement = `**${selected || t(lang, 'kudos.create.editor.placeholder.text')}**`;
          break;
        case 'italic':
          replacement = `*${selected || t(lang, 'kudos.create.editor.placeholder.text')}*`;
          break;
        case 'strike':
          replacement = `~~${selected || t(lang, 'kudos.create.editor.placeholder.text')}~~`;
          break;
        case 'list': {
          const lineStart = content.lastIndexOf('\n', start - 1) + 1;
          const prefix = '1. ';
          setContent(content.slice(0, lineStart) + prefix + content.slice(lineStart));
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + prefix.length;
            el.focus();
          });
          return;
        }
        case 'link': {
          const url = selected.startsWith('http') ? selected : 'https://';
          replacement = `[${selected || t(lang, 'kudos.create.editor.placeholder.title')}](${url})`;
          break;
        }
        case 'quote': {
          const lineStart = content.lastIndexOf('\n', start - 1) + 1;
          const prefix = '> ';
          setContent(content.slice(0, lineStart) + prefix + content.slice(lineStart));
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + prefix.length;
            el.focus();
          });
          return;
        }
      }

      const next = content.slice(0, start) + replacement + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        const newPos = start + replacement.length;
        el.selectionStart = el.selectionEnd = newPos;
        el.focus();
      });
    },
    [content, lang]
  );

  // ── @mention handling ─────────────────────────────────────────────────────
  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (val.length > MAX_CONTENT) return;
    setContent(val);
    const caret = e.target.selectionStart;
    const textUpToCaret = val.slice(0, caret);
    const match = textUpToCaret.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionAnchor(caret - match[0].length);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  }

  function insertMention(displayName: string) {
    const el = textareaRef.current;
    if (!el) return;
    const caret = el.selectionStart;
    const textUpToCaret = content.slice(0, caret);
    const match = textUpToCaret.match(/@(\w*)$/);
    if (!match) return;
    const insertion = `@${displayName} `;
    const next = content.slice(0, mentionAnchor) + insertion + content.slice(caret);
    setContent(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      const pos = mentionAnchor + insertion.length;
      el.selectionStart = el.selectionEnd = pos;
      el.focus();
    });
  }

  const mentionSuggestions = recipients
    .filter(
      (r) =>
        r.id !== currentUserId &&
        r.displayName.toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .slice(0, 6);

  // ── Image handling ─────────────────────────────────────────────────────────
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const invalid = files.filter((f) => !['image/jpeg', 'image/png'].includes(f.type));
    if (invalid.length) {
      setImageError(t(lang, 'kudos.create.image.typeError'));
      e.target.value = '';
      return;
    }
    const remaining = MAX_IMAGES - imageFiles.length;
    const accepted = files.slice(0, remaining);
    const newPreviews = accepted.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...accepted]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting || !recipient) return;
    setSubmitting(true);
    try {
      await onSubmit({
        recipientId: recipient.id,
        title: title.trim(),
        contentMarkdown: content.trim(),
        hashtags,
        imageFiles,
        isAnonymous,
        anonymousAlias: isAnonymous && anonymousAlias.trim() ? anonymousAlias.trim() : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── A: Heading ───────────────────────────────────────────────────── */}
      <h2
        style={{
          margin: '0 0 24px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 28,
          fontWeight: 700,
          lineHeight: '36px',
          color: '#00101A',
          textAlign: 'center',
          letterSpacing: '0.15px',
        }}
      >
        {t(lang, 'kudos.create.title')}
      </h2>

      {/* ── B: Người nhận ────────────────────────────────────────────────── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: SECTION_GAP }}
      >
        <LabelCell required requiredLabel={t(lang, 'kudos.create.required')}>{t(lang, 'kudos.create.recipient.label')}</LabelCell>
        <KudosCreateRecipientInput
          value={recipient}
          onChange={setRecipient}
          recipients={recipients}
          lang={lang}
        />
      </div>

      {/* ── Frame 552: Danh hiệu ─────────────────────────────────────────── */}
      {/*
        Use CSS grid so the hint text below naturally aligns under the input,
        not under the label — no static pixel offsets needed.
        Grid: [label col] [input/hint col]
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${LABEL_COL} 1fr`,
          columnGap: 16,
          rowGap: 6,
          marginBottom: SECTION_GAP,
          alignItems: 'center',
        }}
      >
        <LabelCell required requiredLabel={t(lang, 'kudos.create.required')}>{t(lang, 'kudos.create.title.label')}</LabelCell>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= MAX_TITLE) setTitle(e.target.value);
          }}
          placeholder={t(lang, 'kudos.create.title.placeholder')}
          maxLength={MAX_TITLE}
          required
          aria-label={t(lang, 'kudos.create.title.label')}
          style={{ ...INPUT_STYLE, height: 56 }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = '#00101A';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = '#998C5F';
          }}
        />
        {/* Empty cell to push hint to input column */}
        <div aria-hidden="true" />
        <p style={{ ...HINT_STYLE, margin: 0, fontSize: 16 }}>
          {t(lang, 'kudos.create.title.hint1')}
          <br />
          {t(lang, 'kudos.create.title.hint2')}
        </p>
      </div>

      {/* ── C + D: Rich text editor ──────────────────────────────────────── */}
      <div style={{ marginBottom: SECTION_GAP, position: 'relative' }}>
        <KudosCreateRichToolbar onAction={handleToolbarAction} lang={lang} />

        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMentionOpen(false);
            }}
            placeholder={t(lang, 'kudos.create.content.placeholder')}
            required
            aria-label={t(lang, 'kudos.create.content.aria')}
            rows={8}
            style={{
              ...INPUT_STYLE,
              borderRadius: '0 0 8px 8px',
              borderTop: 'none',
              resize: 'vertical',
              minHeight: 200,
              verticalAlign: 'top',
              lineHeight: '24px',
              paddingTop: 16,
            }}
            onFocus={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = '#00101A';
            }}
            onBlur={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = '#998C5F';
            }}
          />

          {/* @mention popover */}
          {mentionOpen && mentionSuggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label={t(lang, 'kudos.create.content.mention.aria')}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 4px)',
                left: 24,
                zIndex: 300,
                background: '#FFF',
                border: '1px solid #998C5F',
                borderRadius: 8,
                padding: '4px 0',
                listStyle: 'none',
                margin: 0,
                minWidth: 200,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              {mentionSuggestions.map((r) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={false}
                  onMouseDown={() => insertMention(r.displayName)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#00101A',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background =
                      'rgba(153,140,95,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background = 'transparent';
                  }}
                >
                  {r.displayName}
                  {r.department && (
                    <span style={{ fontWeight: 400, color: '#999', marginLeft: 6 }}>
                      {r.department}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* D.1: hint + char count */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <span style={{ ...HINT_STYLE, fontSize: 16, color: '#00101A' }}>
            {t(lang, 'kudos.create.content.mentionHint')}
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 12,
              color: content.length > MAX_CONTENT * 0.9 ? '#CF1322' : '#999',
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {content.length}/{MAX_CONTENT}
          </span>
        </div>
      </div>

      {/* ── E: Hashtag ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: SECTION_GAP,
        }}
      >
        <LabelCell required alignTop requiredLabel={t(lang, 'kudos.create.required')}>
          Hashtag
        </LabelCell>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <KudosCreateHashtagInput
            value={hashtags}
            onChange={setHashtags}
            existingHashtags={existingHashtags}
            maxTags={5}
            lang={lang}
          />
          <span style={{ ...HINT_STYLE, fontSize: 13 }}>{t(lang, 'kudos.create.max5')}</span>
        </div>
      </div>

      {/* ── F: Image ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: SECTION_GAP,
        }}
      >
        <LabelCell alignTop>{t(lang, 'kudos.create.image.label')}</LabelCell>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}
          >
            {/* Thumbnails */}
            {imagePreviews.map((src, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: 18,
                  border: '1px solid #998C5F',
                  overflow: 'hidden',
                  background: '#FFF',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${t(lang, 'kudos.create.image.alt')} ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  aria-label={`${t(lang, 'kudos.create.image.remove')} ${idx + 1}`}
                  onClick={() => removeImage(idx)}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(207,19,34,0.85)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 1l8 8M9 1L1 9"
                      stroke="#FFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add image button — hidden once limit reached */}
            {imageFiles.length < MAX_IMAGES && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setImageError(null);
                    fileInputRef.current?.click();
                  }}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    width: 100,
                    height: 38,
                    border: '1px solid #998C5F',
                    borderRadius: 8,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#998C5F',
                    transition: 'background 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(153,140,95,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 1v14M1 8h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t(lang, 'kudos.create.image.label')}
                </button>
                <span style={{ ...HINT_STYLE, fontSize: 13 }}>{t(lang, 'kudos.create.max5')}</span>
              </>
            )}
          </div>

          {imageError && (
            <p
              role="alert"
              style={{
                margin: '6px 0 0',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 13,
                color: '#CF1322',
              }}
            >
              {imageError}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            aria-hidden="true"
            tabIndex={-1}
            style={{ display: 'none' }}
            onChange={handleImagePick}
          />
        </div>
      </div>

      {/* ── G: Anonymous ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: SECTION_GAP }}>
        <label
          style={{ display: 'inline-flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        >
          {/* Custom checkbox — 24x24, border #999, border-radius 4px (from MCP) */}
          <span
            role="checkbox"
            aria-checked={isAnonymous}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsAnonymous((prev) => !prev);
              }
            }}
            onClick={() => setIsAnonymous((prev) => !prev)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: `1px solid ${isAnonymous ? '#998C5F' : '#999'}`,
              background: isAnonymous ? '#998C5F' : '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
          >
            {isAnonymous && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7l4 4 6-7"
                  stroke="#FFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#00101A',
              lineHeight: '24px',
              userSelect: 'none',
            }}
          >
            {t(lang, 'kudos.create.anonymous.label')}
          </span>
        </label>

        {isAnonymous && (
          <div style={{ marginTop: 12, paddingLeft: 40 }}>
            <input
              type="text"
              value={anonymousAlias}
              onChange={(e) => setAnonymousAlias(e.target.value)}
              placeholder={t(lang, 'kudos.create.anonymous.alias.placeholder')}
              aria-label={t(lang, 'kudos.create.anonymous.alias.aria')}
              style={{ ...INPUT_STYLE, maxWidth: 400 }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#00101A';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#998C5F';
              }}
            />
          </div>
        )}
      </div>

      {/* ── H: Footer buttons ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {/* H.1: Hủy — outline secondary */}
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px 40px',
            border: '1px solid #998C5F',
            borderRadius: 4,
            background: 'rgba(255,234,158,0.10)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#00101A',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.5 : 1,
            transition: 'background 0.15s ease',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!submitting)
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(255,234,158,0.20)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,234,158,0.10)';
          }}
        >
          {t(lang, 'kudos.create.cancel')}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* H.2: Gửi — filled primary */}
        <button
          type="submit"
          disabled={!isValid || submitting}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px',
            height: 60,
            border: 'none',
            borderRadius: 8,
            background:
              !isValid || submitting
                ? 'rgba(255,234,158,0.40)'
                : 'rgba(255,234,158,1)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: !isValid || submitting ? 'rgba(0,16,26,0.4)' : '#00101A',
            cursor: !isValid || submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={(e) => {
            if (isValid && !submitting)
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,225,80,1)';
          }}
          onMouseLeave={(e) => {
            if (isValid && !submitting)
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,234,158,1)';
          }}
        >
          {submitting ? t(lang, 'kudos.create.submitting') : t(lang, 'kudos.create.submit')}
          {!submitting && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22l-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
