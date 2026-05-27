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
    <div className="flex flex-col w-full gap-10 sm:gap-16 lg:gap-20">
      {/* B.1 Key Visual — ROOT FURTHER (reuses home's RGBA logo for consistent style across screens) */}
      <div className="w-full max-w-[451px]">
        <Image
          src="/home/root-further-logo.png"
          alt="ROOT FURTHER"
          width={451}
          height={200}
          priority
          className="w-full h-auto object-contain"
        />
      </div>

      {/* B.2 Welcome copy + B.3 Login button */}
      <div className="flex flex-col gap-6 w-full max-w-[496px] sm:pl-4">
        <p
          className="whitespace-pre-line font-bold text-white w-full lg:w-[480px]"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 20,
            lineHeight: "40px",
            letterSpacing: "0.5px",
          }}
        >
          {`${line1}\n${line2}`}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 w-full max-w-[305px]"
          >
            {errorMessage}
          </div>
        )}

        <LoginActions lang={lang} />
      </div>
    </div>
  );
}
