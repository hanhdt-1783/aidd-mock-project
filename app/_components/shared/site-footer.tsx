import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";

type FooterNavItem = {
  labelKey:
    | "home.footer.nav.about"
    | "home.footer.nav.awards"
    | "home.footer.nav.kudos"
    | "home.footer.nav.standards";
  href: string;
  highlighted?: boolean;
};

const FOOTER_NAV: FooterNavItem[] = [
  { labelKey: "home.footer.nav.about", href: "/#about-saa-2025" },
  { labelKey: "home.footer.nav.awards", href: "/awards", highlighted: true },
  { labelKey: "home.footer.nav.kudos", href: "/kudos" },
  { labelKey: "home.footer.nav.standards", href: "/standards" },
];

export type SiteFooterProps = {
  lang: Language;
  /** 'full' (default): logo + nav + copyright. 'minimal': just centered copyright (auth/landing pages). */
  variant?: "full" | "minimal";
  /** Translation key for copyright. Default: 'home.footer.copyright'. Use 'login.footer.copyright' for minimal/login. */
  copyrightKey?: "home.footer.copyright" | "login.footer.copyright";
};

export default function SiteFooter({
  lang,
  variant = "full",
  copyrightKey,
}: SiteFooterProps) {
  const isMinimal = variant === "minimal";
  const effectiveCopyrightKey =
    copyrightKey ?? (isMinimal ? "login.footer.copyright" : "home.footer.copyright");

  if (isMinimal) {
    return (
      <footer
        className="flex items-center justify-center w-full px-6 py-6 sm:px-12 sm:py-8 lg:px-[90px] lg:py-10"
        style={{ borderTop: "1px solid #2E3940" }}
      >
        <p
          className="font-bold text-white text-center"
          style={{
            fontFamily: "'Montserrat Alternates', Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
          }}
        >
          {t(lang, effectiveCopyrightKey)}
        </p>
      </footer>
    );
  }

  return (
    <footer
      className="w-full flex items-center justify-between"
      style={{
        padding: "40px 90px",
        borderTop: "1px solid #2E3940",
        backgroundColor: "#00101A",
      }}
    >
      <div className="flex items-center" style={{ gap: 80 }}>
        <Link href="/" aria-label={t(lang, "home.meta.title")}>
          <Image
            src="/home/logo-footer.png"
            alt={t(lang, "home.meta.title")}
            width={69}
            height={64}
            className="object-contain"
          />
        </Link>

        <nav aria-label="Footer navigation">
          <ul
            className="flex items-center"
            style={{ gap: 48, listStyle: "none", margin: 0, padding: 0 }}
          >
            {FOOTER_NAV.map((item) => (
              <li key={item.labelKey}>
                <Link
                  href={item.href}
                  className="transition-colors duration-200 hover:text-[#FFEA9E]"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: "24px",
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.87)",
                    textDecoration: "none",
                    padding: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: item.highlighted ? "rgba(255,234,158,0.10)" : "transparent",
                    borderRadius: item.highlighted ? 4 : 0,
                  }}
                >
                  {t(lang, item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p
        className="font-bold text-white"
        style={{
          fontFamily: "Montserrat Alternates, Montserrat, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "24px",
          margin: 0,
          color: "#FFFFFF",
        }}
      >
        {t(lang, effectiveCopyrightKey)}
      </p>
    </footer>
  );
}
