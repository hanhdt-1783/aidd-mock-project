"use client";

import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import { setLanguage } from "@/lib/i18n/actions";
import type { Language } from "@/lib/i18n/dictionary";
import LanguageDropdown from "./language-dropdown";

function ChevronDownIcon() {
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
        d="M6 9L12 15L18 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
}: {
  currentLanguage: Language;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  function handleSelect(lang: Language) {
    if (lang === currentLanguage) {
      setIsOpen(false);
      return;
    }
    startTransition(async () => {
      await setLanguage(lang);
      setIsOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        // stopPropagation prevents the dropdown's outside-click handler from firing
        // before onClick toggles isOpen — which would otherwise re-open immediately.
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Language switcher"
        disabled={isPending}
        className="flex items-center justify-between gap-0.5 rounded-[4px] transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
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
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <ChevronDownIcon />
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
