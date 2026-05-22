'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Language } from '@/lib/i18n/dictionary';

export interface LanguageDropdownProps {
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
}

interface LanguageOption {
  code: Language;
  label: string;
  flagSrc: string;
  flagAlt: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'vi',
    label: 'VN',
    flagSrc: '/login/flags/vn.svg',
    flagAlt: 'Vietnamese flag',
  },
  {
    code: 'en',
    label: 'EN',
    flagSrc: '/login/flags/en.svg',
    flagAlt: 'English flag',
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
    onClose();
  }

  return (
    <div
      ref={panelRef}
      role="listbox"
      aria-label="Select language"
      style={{ width: '110px' }}
      className="flex flex-col overflow-hidden rounded-sm shadow-lg border border-white/10"
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isSelected = option.code === currentLanguage;

        return (
          <button
            key={option.code}
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(option.code)}
            style={{ height: '56px' }}
            className={[
              'flex items-center gap-3 px-4 w-full cursor-pointer transition-colors duration-150',
              isSelected
                ? 'bg-[#3a3a3a]'
                : 'bg-black hover:bg-[#1a1a1a]',
            ].join(' ')}
          >
            <Image
              src={option.flagSrc}
              alt={option.flagAlt}
              width={30}
              height={20}
              className="shrink-0 rounded-[2px]"
            />
            <span className="text-white text-sm font-medium leading-none">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
