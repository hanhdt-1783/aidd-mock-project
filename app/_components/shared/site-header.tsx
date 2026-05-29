"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/app/_components/shared/language-switcher";
import { signOut } from "@/app/login/actions";

type NavItem = {
  key: "about" | "awards" | "kudos";
  href: string;
  translationKey: "home.nav.about" | "home.nav.awards" | "home.nav.kudos";
};

const NAV_ITEMS: NavItem[] = [
  { key: "about", href: "/", translationKey: "home.nav.about" },
  { key: "awards", href: "/awards", translationKey: "home.nav.awards" },
  { key: "kudos", href: "/kudos", translationKey: "home.nav.kudos" },
];

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountMenuItem({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center justify-between w-full text-white transition-colors duration-150 hover:bg-[rgba(255,234,158,0.10)]"
      style={{
        height: 56,
        padding: 16,
        gap: 4,
        borderRadius: 4,
        fontFamily: "Montserrat, sans-serif",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.15px",
        textDecoration: "none",
      }}
    >
      <span>{label}</span>
      {icon}
    </Link>
  );
}

export type SiteHeaderProps = {
  lang: Language;
  /** 'full' (default): logo + nav + notifications + lang + account. 'minimal': logo + lang only (auth/landing pages). */
  variant?: "full" | "minimal";
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  activeNav?: "about" | "awards" | "kudos";
};

export default function SiteHeader({
  lang,
  variant = "full",
  isAuthenticated = false,
  isAdmin = false,
  activeNav,
}: SiteHeaderProps) {
  type OpenMenu = "language" | "notif" | "account" | null;
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const accountMenuOpen = openMenu === "account";
  const notifOpen = openMenu === "notif";
  const langOpen = openMenu === "language";

  const toggleMenu = (m: Exclude<OpenMenu, null>) =>
    setOpenMenu((prev) => (prev === m ? null : m));
  const closeAllMenus = () => setOpenMenu(null);

  const isMinimal = variant === "minimal";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-page"
      style={{
        backgroundColor: isMinimal ? "rgba(11, 15, 18, 0.80)" : "rgba(16, 20, 23, 0.80)",
        backdropFilter: isMinimal ? undefined : "blur(8px)",
      }}
    >
      {/* Left — Logo (+ Nav for full variant). Gap=64 per Figma Frame 488. */}
      <div className="flex items-center" style={{ gap: isMinimal ? 0 : 64 }}>
        <Link href="/" aria-label={t(lang, "home.meta.title")}>
          <Image
            src="/shared/logo-header.png"
            alt={t(lang, "home.meta.title")}
            width={52}
            height={48}
            priority
            className="object-contain"
          />
        </Link>

        {!isMinimal && (
          <nav aria-label={t(lang, "aria.nav.main")}>
            <ul className="flex items-center" style={{ gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center rounded transition-all duration-200 hover:bg-[rgba(255,234,158,0.10)] ${
                        isActive ? "text-[#FFEA9E]" : "text-white"
                      }`}
                      style={{
                        padding: 16,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: "20px",
                        letterSpacing: "0.1px",
                        textDecoration: "none",
                        // Active = 1px gold underline at the button's bottom edge (Figma mms_A1.2).
                        borderBottom: isActive ? "1px solid #FFEA9E" : "1px solid transparent",
                      }}
                    >
                      {t(lang, item.translationKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* Right — Controls. Gap=16 per Figma Frame 482. */}
      <div className="flex items-center" style={{ gap: 16 }}>
        {!isMinimal && isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("notif")}
              aria-label={t(lang, "home.header.notification.label")}
              aria-expanded={notifOpen}
              className="relative flex items-center justify-center rounded bg-transparent text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ width: 40, height: 40 }}
            >
              <BellIcon />
              <span aria-hidden="true" className="absolute top-1.5 right-1.5 rounded-full" style={{ width: 8, height: 8, backgroundColor: "#FF4444" }} />
            </button>

            {notifOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 flex flex-col shadow-xl z-50"
                style={{
                  minWidth: 320,
                  backgroundColor: "#00070C",
                  border: "1px solid #998C5F",
                  borderRadius: 8,
                  padding: 6,
                  gap: 2,
                }}
              >
                <p
                  className="flex items-center w-full text-white"
                  style={{
                    minHeight: 56,
                    padding: 16,
                    borderRadius: 4,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: "24px",
                    letterSpacing: "0.15px",
                    margin: 0,
                  }}
                >
                  {t(lang, "home.header.notification.empty")}
                </p>
              </div>
            )}
          </div>
        )}

        <LanguageSwitcher
          currentLanguage={lang}
          isOpen={langOpen}
          onToggle={() => toggleMenu("language")}
          onClose={closeAllMenus}
        />

        {!isMinimal && isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("account")}
              aria-label={t(lang, "home.header.account.label")}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              className="flex items-center justify-center rounded bg-transparent text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ width: 40, height: 40, border: "1px solid #998C5F" }}
            >
              <UserIcon />
            </button>

            {accountMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 flex flex-col shadow-xl z-50"
                style={{
                  minWidth: 133,
                  backgroundColor: "#00070C",
                  border: "1px solid #998C5F",
                  borderRadius: 8,
                  padding: 6,
                  gap: 2,
                }}
              >
                <AccountMenuItem
                  href="/profile"
                  label={t(lang, "home.header.account.profile")}
                  icon={<UserIcon />}
                  onNavigate={() => closeAllMenus()}
                />
                {isAdmin && (
                  <AccountMenuItem
                    href="/admin"
                    label={t(lang, "home.header.account.dashboard")}
                    icon={<ChevronRightIcon />}
                    onNavigate={() => closeAllMenus()}
                  />
                )}
                <form action={signOut}>
                  <button
                    role="menuitem"
                    type="submit"
                    className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-left text-white transition-colors duration-150 hover:bg-[rgba(255,234,158,0.10)]"
                    style={{
                      height: 56,
                      padding: 16,
                      gap: 4,
                      borderRadius: 4,
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: "24px",
                      letterSpacing: "0.15px",
                    }}
                  >
                    <span>{t(lang, "home.header.account.signout")}</span>
                    <ChevronRightIcon />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
