import Image from "next/image";
import { t, type Language } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/app/_components/shared/language-switcher";

export default function LoginHeader({ lang }: { lang: Language }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-6 sm:px-12 lg:px-36"
      style={{ backgroundColor: "rgba(11, 15, 18, 0.80)" }}
    >
      <div className="flex items-center" style={{ width: 52, height: 48 }}>
        <Image
          src="/login/mm-media-logo.png"
          alt={t(lang, "login.logo.alt")}
          width={52}
          height={48}
          priority
        />
      </div>
      <LanguageSwitcher currentLanguage={lang} />
    </header>
  );
}
