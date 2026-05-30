import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { listHashtags, listRecipients } from "@/lib/kudos/queries";
import KudoComposeProvider from "@/app/_components/kudos/kudo-compose-provider";
import HomeWidgetButton from "@/app/_components/home/home-widget-button";

/**
 * Root wiring for the shared "Viết Kudo" modal.
 *
 * Self-contained server component: resolves the current user, fetches the
 * recipients + hashtags the modal needs ONCE, then wraps the app in the
 * provider that owns the single modal instance. Also mounts the floating
 * action button (the modal's primary trigger). Returns children untouched for
 * anonymous visitors — the modal is a logged-in-only affordance — so it can
 * wrap every route safely.
 */
export default async function KudoComposeRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-out: no compose modal, no FAB — just pass the page through.
  if (!user) return <>{children}</>;

  const lang = await getLang();
  const [recipients, hashtags] = await Promise.all([
    listRecipients(user.id),
    listHashtags(),
  ]);

  return (
    <KudoComposeProvider
      lang={lang}
      recipients={Array.isArray(recipients) ? recipients : []}
      existingHashtags={Array.isArray(hashtags) ? hashtags : []}
      currentUserId={user.id}
    >
      {children}
      <HomeWidgetButton lang={lang} />
    </KudoComposeProvider>
  );
}
