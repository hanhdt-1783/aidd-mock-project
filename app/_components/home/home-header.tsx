"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/app/_components/shared/language-switcher";
import { signOut } from "@/app/login/actions";

type NavItem = {
  key: "about" | "awards" | "kudos";
  href: string;
  translationKey:
    | "home.nav.about"
    | "home.nav.awards"
    | "home.nav.kudos";
};

const NAV_ITEMS: NavItem[] = [
  { key: "about", href: "/#about-saa-2025", translationKey: "home.nav.about" },
  { key: "awards", href: "/awards", translationKey: "home.nav.awards" },
  { key: "kudos", href: "/kudos", translationKey: "home.nav.kudos" },
];

function BellIcon() {
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
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
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
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HomeHeaderProps = {
  lang: Language;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  activeNav?: "about" | "awards" | "kudos";
};

export default function HomeHeader({
  lang,
  isAuthenticated,
  isAdmin = false,
  activeNav,
}: HomeHeaderProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: 80,
        padding: "12px 144px",
        backgroundColor: "rgba(16, 20, 23, 0.80)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left — Logo + Nav */}
      <div className="flex items-center" style={{ gap: 238 }}>
        {/* Logo */}
        <Link href="/" aria-label={t(lang, "home.meta.title")}>
          <Image
            src="/home/logo-header.png"
            alt={t(lang, "home.meta.title")}
            width={52}
            height={48}
            priority
            className="object-contain"
          />
        </Link>

        {/* Nav links */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center" style={{ gap: 0, listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="relative flex items-center transition-colors duration-200"
                    style={{
                      padding: "16px 24px",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: "24px",
                      letterSpacing: "0.5px",
                      color: isActive ? "#FFEA9E" : "rgba(255,255,255,0.87)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        borderBottom: isActive
                          ? "2px solid #FFEA9E"
                          : "2px solid transparent",
                        paddingBottom: 2,
                        transition: "border-color 0.2s ease, color 0.2s ease",
                      }}
                    >
                      {t(lang, item.translationKey)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center" style={{ gap: 8 }}>
        {/* Notification bell — only when authenticated */}
        {isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setNotifOpen((p) => !p); setAccountMenuOpen(false); }}
              aria-label={t(lang, "home.header.notification.label")}
              aria-expanded={notifOpen}
              className="relative flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ width: 40, height: 40 }}
            >
              <BellIcon />
              {/* Badge dot */}
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 rounded-full"
                style={{ width: 8, height: 8, backgroundColor: "#FF4444" }}
              />
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 rounded-lg shadow-xl z-50"
                style={{
                  minWidth: 320,
                  backgroundColor: "#1A2430",
                  border: "1px solid #2E3940",
                  padding: "16px",
                }}
              >
                <p
                  className="text-white text-sm"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {t(lang, "home.header.notification.empty")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Language switcher */}
        <LanguageSwitcher currentLanguage={lang} />

        {/* User avatar / sign-in button */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setAccountMenuOpen((p) => !p); setNotifOpen(false); }}
              aria-label={t(lang, "home.header.account.label")}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              className="flex items-center justify-center rounded-full overflow-hidden transition-colors duration-200 hover:ring-2 hover:ring-[#FFEA9E]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ width: 40, height: 40, backgroundColor: "#2E3940" }}
            >
              <UserIcon />
            </button>

            {accountMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 rounded-lg shadow-xl z-50"
                style={{
                  minWidth: 200,
                  backgroundColor: "#1A2430",
                  border: "1px solid #2E3940",
                  padding: "8px 0",
                }}
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  className="flex items-center w-full px-4 py-3 text-white transition-colors duration-150 hover:bg-white/10"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  onClick={() => setAccountMenuOpen(false)}
                >
                  {t(lang, "home.header.account.profile")}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    role="menuitem"
                    className="flex items-center w-full px-4 py-3 text-white transition-colors duration-150 hover:bg-white/10"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    {t(lang, "home.header.account.dashboard")}
                  </Link>
                )}
                <form action={signOut}>
                  <button
                    role="menuitem"
                    type="submit"
                    className="flex items-center w-full px-4 py-3 text-white transition-colors duration-150 hover:bg-white/10"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {t(lang, "home.header.account.signout")}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
