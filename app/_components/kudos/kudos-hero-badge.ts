// Hero rank badge artwork (Figma MM_MEDIA_*Hero, 110×20, text baked in).
// Keyed by profiles.title (see supabase/seed.sql). Shared by the card user-info
// block and the avatar hover preview so the badge mapping stays in one place.
export const HERO_BADGE: Record<string, string> = {
  'New Hero': '/kudos/badge-new-hero.png',
  'Rising Hero': '/kudos/badge-rising-hero.png',
  'Legend Hero': '/kudos/badge-legend-hero.png',
  'Super Hero': '/kudos/badge-super-hero.png',
};
