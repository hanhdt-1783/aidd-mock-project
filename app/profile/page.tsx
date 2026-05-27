import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/get-lang';
import SiteHeader from '@/app/_components/shared/site-header';

export const metadata: Metadata = {
  title: 'Profile — Sun* Annual Awards 2025',
};

const COMING_SOON = { vi: 'Sắp ra mắt', en: 'Coming Soon' } as const;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = profile?.role === 'admin';

  const lang = await getLang();
  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#00101A' }}
    >
      <SiteHeader lang={lang} isAuthenticated={true} isAdmin={isAdmin} />
      <main
        className="flex flex-1 items-center justify-center text-white"
        style={{ paddingTop: 80 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-semibold">Profile</h1>
          <p className="mt-4 text-lg text-zinc-300">{COMING_SOON[lang]}</p>
        </div>
      </main>
    </div>
  );
}
