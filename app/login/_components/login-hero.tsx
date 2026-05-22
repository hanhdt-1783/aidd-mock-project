import Image from "next/image";
import { t, type Language } from "@/lib/i18n/dictionary";
import LoginActions from "./login-actions";

type LoginHeroProps = {
  lang: Language;
  errorMessage?: string | null;
};

export default function LoginHero({ lang, errorMessage }: LoginHeroProps) {
  const line1 = t(lang, "login.welcome.line1");
  const line2 = t(lang, "login.welcome.line2");

  return (
    <div className="flex flex-col" style={{ gap: 80, width: "100%" }}>
      {/* B.1 Key Visual — ROOT FURTHER */}
      <div style={{ width: 451, height: 200 }}>
        <Image
          src="/login/mm-media-root-further-logo.png"
          alt="ROOT FURTHER"
          width={451}
          height={200}
          priority
          className="object-contain"
        />
      </div>

      {/* B.2 Welcome copy + B.3 Login button */}
      <div
        className="flex flex-col"
        style={{ gap: 24, paddingLeft: 16, width: 496 }}
      >
        <p
          className="whitespace-pre-line font-bold text-white"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 20,
            lineHeight: "40px",
            letterSpacing: "0.5px",
            width: 480,
          }}
        >
          {`${line1}\n${line2}`}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
            style={{ width: 305 }}
          >
            {errorMessage}
          </div>
        )}

        <LoginActions lang={lang} />
      </div>
    </div>
  );
}
