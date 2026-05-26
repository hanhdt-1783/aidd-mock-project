'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import KudosEntryInput from './kudos-entry-input';
import KudosCreateModal from './kudos-create-modal';
import type { KudoCreatePayload } from './kudos-create-form-types';
import type { RecipientOption } from './types';
import { useKudosToast, KudosToast } from './kudos-toast';
import { createKudo } from '@/lib/kudos/actions';
import { deleteKudoImages, uploadKudoImage } from '@/lib/kudos/upload-kudo-image';

type KudosHeroBannerProps = {
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
};

export default function KudosHeroBanner({
  recipients,
  existingHashtags,
  currentUserId,
}: KudosHeroBannerProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useKudosToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = useCallback(
    async (payload: KudoCreatePayload) => {
      // 1. Upload images first — track paths so we can roll back on later failure.
      const uploadedPaths: string[] = [];
      const imageUrls: string[] = [];
      for (const file of payload.imageFiles) {
        const result = await uploadKudoImage(file, currentUserId);
        if (!result.ok) {
          await deleteKudoImages(uploadedPaths);
          showToast(result.error);
          throw new Error(result.error);
        }
        imageUrls.push(result.url);
        uploadedPaths.push(result.path);
      }

      // 2. Create the kudo via server action.
      const created = await createKudo({
        recipientId: payload.recipientId,
        title: payload.title,
        contentMarkdown: payload.contentMarkdown,
        hashtags: payload.hashtags,
        imageUrls,
        isAnonymous: payload.isAnonymous,
        anonymousAlias: payload.anonymousAlias,
      });

      if (!created.ok) {
        // Roll back any uploaded images so they don't orphan in storage.
        await deleteKudoImages(uploadedPaths);
        showToast(created.error);
        throw new Error(created.error);
      }

      setModalOpen(false);
      showToast('Đã gửi Kudo của bạn — cảm ơn bạn đã ghi nhận đồng đội!');
      router.refresh();
    },
    [currentUserId, router, showToast],
  );

  return (
    <>
      {/* Full-bleed hero with background image */}
      <section
        aria-label="Kudos hero banner"
        style={{
          position: 'relative',
          width: '100%',
          height: 512,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Image
          src="/kudos/hero-bg.png"
          alt=""
          aria-hidden="true"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,16,26,0.3) 0%, rgba(0,16,26,0.7) 100%)',
          }}
        />
      </section>

      {/* Section A — KV Kudos title + entry input */}
      <div
        style={{
          width: '100%',
          padding: '0 144px',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          marginTop: -80,
          position: 'relative',
          zIndex: 2,
        }}
        className="kudos-hero-content"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Sun* Annual Awards 2025
          </p>

          <div style={{ height: 104, display: 'flex', alignItems: 'center' }}>
            <Image
              src="/kudos-live-board/MM_MEDIA_Kudos logo.svg"
              alt="Sun* Kudos"
              width={593}
              height={104}
              style={{ objectFit: 'contain', objectPosition: 'left' }}
            />
          </div>
        </div>

        <KudosEntryInput onAction={() => setModalOpen(true)} />
      </div>

      <KudosCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        recipients={recipients}
        existingHashtags={existingHashtags}
        currentUserId={currentUserId}
      />

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
