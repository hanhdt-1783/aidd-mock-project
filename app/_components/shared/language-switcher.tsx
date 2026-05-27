"use client";

import { useCallback, useTransition } from "react";
import Image from "next/image";
import { setLanguage } from "@/lib/i18n/actions";
import { t, type Language } from "@/lib/i18n/dictionary";
import LanguageDropdown from "./language-dropdown";

function TriangleDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M7 10L12 15L17 10Z" />
    </svg>
  );
}

const FLAG_SRC: Record<Language, string> = {
  vi: "/login/flags/vn.svg",
  en: "/login/flags/en.svg",
};

const LABEL: Record<Language, string> = { vi: "VN", en: "EN" };

export default function LanguageSwitcher({
  currentLanguage,
  isOpen,
  onToggle,
  onClose,
}: {
  currentLanguage: Language;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const closeDropdown = useCallback(() => onClose(), [onClose]);

  function handleSelect(lang: Language) {
    if (lang === currentLanguage) {
      onClose();
      return;
    }
    startTransition(async () => {
      await setLanguage(lang);
      onClose();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        // stopPropagation prevents the dropdown's outside-click handler from firing
        // before onClick toggles isOpen — which would otherwise re-open immediately.
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t(currentLanguage, "aria.language.switcher")}
        disabled={isPending}
        className="flex items-center justify-between gap-0.5 rounded-[4px] transition-colors duration-200 hover:bg-[rgba(255,234,158,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
        style={{ width: 110, height: 56, padding: "16px" }}
      >
        <span className="flex items-center gap-1">
          <Image
            src={FLAG_SRC[currentLanguage]}
            alt={LABEL[currentLanguage]}
            width={24}
            height={24}
          />
          <span
            className="font-bold text-white"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0.15px",
            }}
          >
            {LABEL[currentLanguage]}
          </span>
        </span>
        <span
          className={`text-white transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <TriangleDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50">
          <LanguageDropdown
            currentLanguage={currentLanguage}
            onSelect={handleSelect}
            onClose={closeDropdown}
          />
        </div>
      )}
    </div>
  );
}
