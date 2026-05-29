import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { listHashtags, listRecipients } from "@/lib/kudos/queries";
import HomeWidgetButton from "@/app/_components/home/home-widget-button";

/**
 * Shared floating action button (FAB) for post-login screens.
 *
 * Self-contained server component: resolves the current user, fetches the
 * "Viết Kudo" modal data, and renders the floating widget. Returns `null` for
 * anonymous visitors, so it can be dropped onto any page and only appears once
 * the user is logged in. Drop `<KudoFab />` near the end of a page's tree
 * (it positions itself fixed bottom-right).
 */
export default async function KudoFab() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // FAB is a logged-in-only affordance (it writes Kudos as the current user).
  if (!user) return null;

  const lang = await getLang();
  const [recipients, hashtags] = await Promise.all([
    listRecipients(user.id),
    listHashtags(),
  ]);

  return (
    <HomeWidgetButton
      lang={lang}
      recipients={Array.isArray(recipients) ? recipients : []}
      existingHashtags={Array.isArray(hashtags) ? hashtags : []}
      currentUserId={user.id}
    />
  );
}
