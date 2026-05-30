'use client';

import { useEffect, useRef } from 'react';
import type { RecipientOption, KudoCreatePayload } from './kudos-create-form-types';
import KudosCreateForm from './kudos-create-form';
import { t, type Language } from '@/lib/i18n/dictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: KudoCreatePayload) => Promise<void>;
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
  lang: Language;
  /** Pre-select this recipient when the modal opens (e.g. from avatar "Gửi KUDO"). */
  initialRecipient?: RecipientOption | null;
};

export default function KudosCreateModal({
  open,
  onClose,
  onSubmit,
  recipients,
  existingHashtags,
  currentUserId,
  lang,
  initialRecipient = null,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open state with native <dialog>
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // ESC key: native <dialog> already closes on ESC, but we need to sync React state
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent native close so we control state
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // Backdrop click: close when clicking the ::backdrop / dialog background
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    const el = dialogRef.current;
    if (!el) return;
    // The dialog element itself is the backdrop; the card is the first child.
    // If the click target is the <dialog> (not any child), it's a backdrop click.
    if (e.target === el) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      aria-modal="true"
      aria-label={t(lang, 'kudos.create.modal.aria')}
      style={{
        // Reset browser dialog defaults
        padding: 0,
        border: 'none',
        borderRadius: 0,
        background: 'transparent',
        maxWidth: '100vw',
        maxHeight: '100vh',
        // Center via fixed positioning + flex on ::backdrop handled by CSS below
        position: 'fixed',
        inset: 0,
        margin: 'auto',
        // Overflow for the scrollable card
        overflow: 'visible',
      }}
    >
      {/* Overlay backdrop (in addition to native ::backdrop) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 16, 26, 0.72)',
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* Scrollable wrapper so card is reachable on short viewports */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '32px 16px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          // Scroll within the fixed context
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          // Forward pointer events so backdrop click still closes
          pointerEvents: 'none',
        }}
        // Stop propagation so inner card clicks don't bubble to dialog
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card */}
        <div
          role="document"
          style={{
            // From MCP: width 752px, padding 40px, borderRadius 24px, bg rgba(255,248,225,1)
            width: '100%',
            maxWidth: 752,
            padding: 40,
            borderRadius: 24,
            background: 'rgba(255, 248, 225, 1)',
            boxSizing: 'border-box',
            position: 'relative',
            // Allow pointer events on the card
            pointerEvents: 'auto',
            // Subtle shadow for depth
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
          }}
          // Prevent click from reaching the scrollable wrapper / dialog backdrop
          onClick={(e) => e.stopPropagation()}
        >
          <KudosCreateForm
            recipients={recipients}
            existingHashtags={existingHashtags}
            currentUserId={currentUserId}
            onSubmit={onSubmit}
            onCancel={onClose}
            lang={lang}
            initialRecipient={initialRecipient}
          />
        </div>
      </div>

      <style>{`
        dialog::backdrop {
          display: none; /* We use our own overlay div */
        }
      `}</style>
    </dialog>
  );
}
