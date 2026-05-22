import type { Metadata } from 'next';
import { getLang } from '@/lib/i18n/get-lang';

export const metadata: Metadata = {
  title: 'Sun* Kudos — Sun* Annual Awards 2025',
};

const COMING_SOON = { vi: 'Sắp ra mắt', en: 'Coming Soon' } as const;

export default async function KudosPage() {
  const lang = await getLang();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00101A] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-semibold">Sun* Kudos</h1>
        <p className="mt-4 text-lg text-zinc-300">{COMING_SOON[lang]}</p>
      </div>
    </main>
  );
}
