import type { Metadata } from "next";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import { getEventDatetime } from "@/lib/event/get-event-datetime";
import PrelaunchCountdownPage from "@/app/_components/prelaunch/prelaunch-countdown-page";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "prelaunch.meta.title"),
  };
}

export default async function PrelaunchPage() {
  const lang = await getLang();
  const eventDate = await getEventDatetime();
  const targetIso = eventDate ? eventDate.toISOString() : null;

  return <PrelaunchCountdownPage lang={lang} targetIso={targetIso} />;
}
