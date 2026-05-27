'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { t, type Language, type TranslationKey } from '@/lib/i18n/dictionary';

export interface LanguageDropdownProps {
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
}

interface LanguageOption {
  code: Language;
  label: string;
  flagSrc: string;
  flagAltKey: TranslationKey;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'vi',
    label: 'VN',
    flagSrc: '/login/flags/vn.svg',
    flagAltKey: 'aria.flag.vi',
  },
  {
    code: 'en',
    label: 'EN',
    flagSrc: '/login/flags/en.svg',
    flagAltKey: 'aria.flag.en',
  },
];

export default function LanguageDropdown({
  currentLanguage,
  onSelect,
  onClose,
}: LanguageDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  function handleSelect(lang: Language) {
    onSelect(lang);
  }

  return (
    <div
      ref={panelRef}
      role="listbox"
      aria-label={t(currentLanguage, 'aria.language.select')}
      className="flex flex-col shadow-lg"
      style={{
        backgroundColor: '#00070C',
        border: '1px solid #998C5F',
        borderRadius: 8,
        padding: 6,
        gap: 2,
        minWidth: 110,
      }}
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isSelected = option.code === currentLanguage;

        return (
          <button
            key={option.code}
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(option.code)}
            className={`flex items-center justify-start w-full border-none cursor-pointer transition-colors duration-150 ${
              isSelected
                ? 'bg-[rgba(255,234,158,0.20)]'
                : 'bg-transparent hover:bg-[rgba(255,234,158,0.10)]'
            }`}
            style={{
              height: 56,
              padding: 16,
              gap: 8,
              borderRadius: 4,
            }}
          >
            <Image
              src={option.flagSrc}
              alt={t(currentLanguage, option.flagAltKey)}
              width={24}
              height={24}
              className="shrink-0"
            />
            <span
              className="font-bold text-white"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                lineHeight: '24px',
                letterSpacing: '0.15px',
              }}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
