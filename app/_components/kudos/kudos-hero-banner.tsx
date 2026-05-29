'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import KudosEntryInput from './kudos-entry-input';
import KudosSearchInput from './kudos-search-input';
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
      {/* Full-bleed hero: keyvisual bg + diagonal cover + overlaid content.
          Mirrors Figma "Bìa" → Frame 532: the title block and the button row
          both sit ON TOP of the keyvisual (design y≈184–480 within the 512px
          hero), not below it. */}
      <section
        aria-label="Kudos hero banner"
        className="px-page"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 512,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Image
          src="/kudos-live-board/keyvisual-bg.png"
          alt=""
          aria-hidden="true"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        {/* Cover (Figma node I2940:13432;1210:12612): diagonal fade so the
            keyvisual blends into the solid #00101A page background — dark at
            the bottom-left, transparent at the top-right. Percentage stops, so
            the fade scales with the box at every screen size. Tune for more/less. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(25deg, #00101A 20%, rgba(0, 19, 32, 0.00) 60%)',
          }}
        />

        {/* Content over the keyvisual — title block (A_KV Kudos) + button row
            (Button chuc nang). 64px gap matches Frame 532 spacing. */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 64,
            // Clears the fixed 80px header and lands the eyebrow at the
            // design offset (≈184px from the top of the keyvisual at 1440).
            paddingTop: 'clamp(112px, 16vw, 184px)',
            paddingBottom: 32,
          }}
        >
          {/* A_KV Kudos: eyebrow + Kudos logo (10px gap, Figma node 2940:13437) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 36,
                fontWeight: 700,
                lineHeight: '44px',
                color: '#FFEA9E',
              }}
            >
              Hệ thống ghi nhận và cảm ơn
            </p>

            <div style={{ height: 104, display: 'flex', alignItems: 'center' }}>
              <Image
                src="/kudos-live-board/MM_MEDIA_Kudos logo.svg"
                alt="Sun* Kudos"
                width={593}
                height={104}
                priority
                style={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  objectPosition: 'left',
                }}
              />
            </div>
          </div>

          {/* Button chuc nang: entry pill (738) + search pill (381), 32px gap.
              Single row (no wrap) per design — both pills shrink to fit when
              the content area is narrower than 738+32+381. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
          >
            <KudosEntryInput onAction={() => setModalOpen(true)} />
            <KudosSearchInput />
          </div>
        </div>
      </section>

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
