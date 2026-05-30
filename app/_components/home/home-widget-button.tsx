"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Language } from "@/lib/i18n/dictionary";
import KudosCreateModal from "@/app/_components/kudos/kudos-create-modal";
import { KudosToast, useKudosToast } from "@/app/_components/kudos/kudos-toast";
import type {
  KudoCreatePayload,
  RecipientOption,
} from "@/app/_components/kudos/kudos-create-form-types";
import { createKudo } from "@/lib/kudos/actions";
import { deleteKudoImages, uploadKudoImage } from "@/lib/kudos/upload-kudo-image";

// Pen icon — inlined from public/home/icon-pen.svg (Figma MM_MEDIA_Pen).
// fill set to currentColor so the parent's `color` controls it.
function PenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Close (X) icon — inlined from public/home/icon-close.svg (Figma MM_MEDIA_Close).
function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.4759 12.0972L19.0159 17.6372V19.0972H17.5559L12.0159 13.5572L6.47587 19.0972H5.01587V17.6372L10.5559 12.0972L5.01587 6.55717V5.09717H6.47587L12.0159 10.6372L17.5559 5.09717H19.0159V6.55717L13.4759 12.0972Z"
        fill="currentColor"
      />
    </svg>
  );
}

// SAA logo — multi-color brand asset, rendered as <Image>.
function SaaIcon() {
  return (
    <Image
      src="/shared/icon-saa.svg"
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  );
}

type HomeWidgetButtonProps = {
  lang: Language;
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
};

/**
 * Floating Action Button (FAB).
 * Closed (Figma screenId _hphd32jN2): pill 106x64 with pen + "/" + SAA icons.
 * Open  (Figma screenId Sv7DFwBw1h): 3 stacked buttons — Thể lệ, Viết KUDOS, Hủy.
 */
export default function HomeWidgetButton({
  lang,
  recipients,
  existingHashtags,
  currentUserId,
}: HomeWidgetButtonProps) {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useKudosToast();
  // Panel expand/collapse state.
  const [open, setOpen] = useState(false);
  // Viết Kudo modal state.
  const [modalOpen, setModalOpen] = useState(false);

  // Submit handler — same pipeline as KudosHeroBanner: upload images, create kudo,
  // roll back uploads on failure, refresh on success.
  const handleSubmit = useCallback(
    async (payload: KudoCreatePayload) => {
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
        await deleteKudoImages(uploadedPaths);
        showToast(created.error);
        throw new Error(created.error);
      }

      setModalOpen(false);
      showToast("Đã gửi Kudo của bạn — cảm ơn bạn đã ghi nhận đồng đội!");
      router.refresh();
    },
    [currentUserId, router, showToast],
  );

  const openKudoModal = () => {
    setOpen(false);
    setModalOpen(true);
  };

  return (
    // Offsets scale with viewport: 16px on phones, 24px on tablets, 32px on
    // desktop (matches the Figma ~19–32px placement without crowding small screens).
    <div className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8">
      {open ? (
        <div className="flex flex-col items-end" style={{ gap: 20 }}>
          {/* A_Button thể lệ */}
          <Link
            href="/standards"
            className="flex items-center justify-start transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              gap: 8,
              padding: 16,
              borderRadius: 4,
              backgroundColor: "#FFEA9E",
              color: "#00101A",
              textDecoration: "none",
              height: 64,
            }}
          >
            <SaaIcon />
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: "32px",
                color: "#00101A",
              }}
            >
              {t(lang, "home.widget.standards")}
            </span>
          </Link>

          {/* B_Button viết kudos — opens the Viết Kudo modal. */}
          <button
            type="button"
            onClick={openKudoModal}
            className="flex items-center justify-start transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]/60"
            style={{
              gap: 8,
              padding: 16,
              borderRadius: 4,
              backgroundColor: "#FFEA9E",
              color: "#00101A",
              border: "none",
              cursor: "pointer",
              height: 64,
            }}
          >
            <PenIcon />
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                lineHeight: "32px",
                color: "#00101A",
              }}
            >
              {t(lang, "home.widget.write-kudos")}
            </span>
          </button>

          {/* C_Button huỷ */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t(lang, "home.widget.cancel")}
            className="flex items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{
              width: 56,
              height: 56,
              padding: 16,
              borderRadius: 100,
              backgroundColor: "#D4271D",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
            }}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t(lang, "home.widget.label")}
          aria-expanded={open}
          className="flex items-center transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]/60"
          style={{
            gap: 8,
            width: 106,
            height: 64,
            padding: 16,
            borderRadius: 100,
            backgroundColor: "#FFEA9E",
            color: "#00101A",
            border: "none",
            cursor: "pointer",
          }}
        >
          <PenIcon />
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: "32px",
              color: "#00101A",
              userSelect: "none",
            }}
          >
            /
          </span>
          <SaaIcon />
        </button>
      )}

      <KudosCreateModal
        lang={lang}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        recipients={recipients}
        existingHashtags={existingHashtags}
        currentUserId={currentUserId}
      />

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}
