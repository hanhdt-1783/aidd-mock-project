import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import SiteHeader from "@/app/_components/shared/site-header";
import SiteFooter from "@/app/_components/shared/site-footer";
import LoginHero from "./_components/login-hero";

export const metadata: Metadata = {
  title: "Đăng nhập — Sun* Annual Awards 2025",
  description: "Đăng nhập để khám phá Sun* Annual Awards 2025",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Auth guard (test case f62b0c97): authed user on /login → redirect to home
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(process.env.NEXT_PUBLIC_AUTH_REDIRECT ?? "/");
  }

  const lang = await getLang();
  const { error } = await searchParams;
  const errorMessage = error ? t(lang, "login.error.oauth") : null;

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-[#00101A]">
      {/* Layer 1 — mms_C_Keyvisual decorative root pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login/mm-media-keyvisual-bg.png')" }}
      />
      {/* Layer 2 — left→right gradient for left content legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0.00) 100%)",
        }}
      />
      {/* Layer 3 — bottom-up dark fade (Figma "Cover" 662:14390).
          The design rect is offset (top 138px) and taller than the frame
          (1093px vs 1024px), so its 22.48%/51.74% stops map to ~4%/35% of the
          viewport — a compact fade at the footer, not a half-screen darkening. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(0deg, #00101A 0%, #00101A 4%, rgba(0,19,32,0.00) 35%)",
        }}
      />

      <SiteHeader lang={lang} variant="minimal" />

      {/* Main offsets pt-20 to clear the fixed header (h-20),
          then items-center vertically centers the hero block between header bottom and footer top. */}
      <main className="relative z-10 flex flex-1 items-center px-page pt-20">
        <LoginHero lang={lang} errorMessage={errorMessage} />
      </main>

      <div className="relative z-10 mt-auto">
        <SiteFooter lang={lang} variant="minimal" />
      </div>
    </div>
  );
}
