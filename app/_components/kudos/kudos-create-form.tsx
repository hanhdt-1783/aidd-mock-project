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
// Shared input chrome. Text style matches Figma "Viết Kudo" (screenId
// ihQ26W78P2): every field — recipient, title, content, nickname — is
// Montserrat 16/700, #00101A, 0.15px tracking, lh 24. Placeholder color is
// set via the `.kudos-field::placeholder` rule below (inheriting size/weight).
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '16px 24px',
  border: '1px solid #998C5F',
  borderRadius: 8,
  background: '#FFF',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  letterSpacing: '0.15px',
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

// Dot thousands separator to match the design counter ("1.000"). Manual (not
// toLocaleString) so SSR and client render identically — no hydration mismatch.
function withThousandsDot(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

type Props = {
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
  onSubmit: (payload: KudoCreatePayload) => Promise<void>;
  onCancel: () => void;
  lang: Language;
  /** Recipient to pre-select on mount (the modal remounts the form per open). */
  initialRecipient?: RecipientOption | null;
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
      className="kudos-form-label-col"
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
  initialRecipient = null,
}: Props) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [recipient, setRecipient] = useState<RecipientOption | null>(initialRecipient);
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
    } catch {
      // The submit pipeline already surfaced a toast for the failure; absorb
      // the re-thrown error here so it doesn't escape as an unhandled
      // rejection (which could trip the nearest error boundary).
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
          // Figma node I662:9637;520:9870: Montserrat 32/700, #00101A, lh40, ls0.
          margin: '0 0 24px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 32,
          fontWeight: 700,
          lineHeight: '40px',
          color: '#00101A',
          textAlign: 'center',
          letterSpacing: '0',
        }}
      >
        {t(lang, 'kudos.create.title')}
      </h2>

      {/* ── B: Người nhận ────────────────────────────────────────────────── */}
      <div
        className="kudos-form-row"
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
        className="kudos-form-grid"
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
          className="kudos-field"
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
            className="kudos-field"
            style={{
              ...INPUT_STYLE,
              // Content uses the same 16/700 type as the other fields per Figma
              // "Viết Kudo" node I520:11647;520:9886;186:2760 (placeholder
              // "Hãy gửi gắm…" = Montserrat 16/700, lh 24, #999).
              borderRadius: '0 0 8px 8px',
              borderTop: 'none',
              resize: 'vertical',
              minHeight: 200,
              verticalAlign: 'top',
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
              // Figma node I662:9637;520:9889: Montserrat 16/700, #999, lh24,
              // 0.5px tracking, with a dot thousands separator ("0/1.000").
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.5px',
              color: content.length > MAX_CONTENT * 0.9 ? '#CF1322' : '#999',
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {withThousandsDot(content.length)}/{withThousandsDot(MAX_CONTENT)}
          </span>
        </div>
      </div>

      {/* ── E: Hashtag ───────────────────────────────────────────────────── */}
      <div
        className="kudos-form-row"
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
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* "Tối đa 5" lives as the 2nd line inside the add button (per design). */}
          <KudosCreateHashtagInput
            value={hashtags}
            onChange={setHashtags}
            existingHashtags={existingHashtags}
            maxTags={5}
            lang={lang}
          />
        </div>
      </div>

      {/* ── F: Image ─────────────────────────────────────────────────────── */}
      <div
        className="kudos-form-row"
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
                style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}
              >
                {/* Selected image: 80x80, 1px #998C5F border, radius 18
                    (Figma node 662:9197). */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    border: '1px solid #998C5F',
                    borderRadius: 18,
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
                </div>
                <button
                  type="button"
                  aria-label={`${t(lang, 'kudos.create.image.remove')} ${idx + 1}`}
                  onClick={() => removeImage(idx)}
                  style={{
                    // Solid red badge (#D4271D) overhanging the top-right corner,
                    // per Figma node 662:9197;662:9287 (20x20 circle).
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#D4271D',
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
                  // Same add-button style as Hashtag (Figma node I662:9637;662:9133):
                  // solid 1px #998C5F border, radius 8, white bg, h48, 4px/8px
                  // padding, 24px plus icon + two-line label (Image / Tối đa 5).
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 48,
                    padding: '4px 8px',
                    border: '1px solid #998C5F',
                    borderRadius: 8,
                    background: '#FFF',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(153,140,95,0.08)';
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
                      {t(lang, 'kudos.create.image.label')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, lineHeight: '16px', letterSpacing: '0.5px', color: '#999', whiteSpace: 'nowrap' }}>
                      {t(lang, 'kudos.create.max5')}
                    </span>
                  </span>
                </button>
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
          {/* Custom checkbox — Figma node 520:14087/520:14088: 24x24 white box,
              1px #998C5F border, radius 4; CHECKED = a 16x16 gold (#998C5F)
              rounded (radius 2) inner square — not a checkmark. */}
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
              background: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            {isAnonymous && (
              <span
                aria-hidden="true"
                style={{ width: 16, height: 16, borderRadius: 2, background: '#998C5F' }}
              />
            )}
          </span>
          <span
            style={{
              // Figma node I662:9637;520:14099;520:14089: Montserrat 22/700, lh28.
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#00101A',
              lineHeight: '28px',
              userSelect: 'none',
            }}
          >
            {t(lang, 'kudos.create.anonymous.label')}
          </span>
        </label>

        {isAnonymous && (
          // "Nickname ẩn danh *" label + input row (Figma node 520:14099 →
          // Title 2009:12953 + input). Long label sizes to content, not the
          // fixed 160px column the shorter field labels use.
          <div
            className="kudos-form-row"
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}
          >
            <span style={{ ...LABEL_STYLE, display: 'inline-flex', alignItems: 'center' }}>
              {t(lang, 'kudos.create.anonymous.nickname.label')}
              <span style={REQUIRED_STAR} aria-label={t(lang, 'kudos.create.required')}>
                *
              </span>
            </span>
            <input
              type="text"
              value={anonymousAlias}
              onChange={(e) => setAnonymousAlias(e.target.value)}
              placeholder={t(lang, 'kudos.create.anonymous.alias.placeholder')}
              aria-label={t(lang, 'kudos.create.anonymous.alias.aria')}
              className="kudos-field"
              style={{ ...INPUT_STYLE, flex: 1, maxWidth: 400 }}
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
            // Figma node I662:9637;520:9907;186:1568: Montserrat 22/700, lh28, ls0.
            fontSize: 22,
            fontWeight: 700,
            lineHeight: '28px',
            color: !isValid || submitting ? 'rgba(0,16,26,0.4)' : '#00101A',
            cursor: !isValid || submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
            letterSpacing: '0',
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
            // Right-pointing send arrow (MM_MEDIA_Send, node 520:9907;186:1766) —
            // horizontal, not the diagonal paper-plane.
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Placeholder color per Figma (#999). Size/weight inherit from each
          field's own style, so the larger content field stays 22px. `opacity:1`
          undoes Firefox's default placeholder dimming. */}
      <style>{`
        .kudos-field::placeholder {
          color: #999;
          opacity: 1;
        }
      `}</style>
    </form>
  );
}
