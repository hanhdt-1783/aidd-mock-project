# Phase 07 — i18n dictionary extension for home.* keys

**Track:** B
**Priority:** Low (Track A will add the bulk of these; this phase is a safety net)

## Goal

Reconcile `lib/i18n/dictionary.ts` so all home page strings have both `vi` and `en` translations. Track A is instructed to add `home.*` keys; this phase audits and fills any gaps.

## Expected keys (non-exhaustive, finalized after Track A reports)

- `home.nav.about_saa` / `home.nav.awards` / `home.nav.kudos`
- `home.hero.title` ("ROOT FURTHER") / `home.hero.coming_soon`
- `home.hero.event.time_label` / `home.hero.event.location_label`
- `home.hero.event.time_value` / `home.hero.event.location_value`
- `home.hero.event.broadcast_note`
- `home.hero.cta.about_awards` / `home.hero.cta.about_kudos`
- `home.countdown.days` / `home.countdown.hours` / `home.countdown.minutes`
- `home.root_further.quote`
- `home.awards.caption` / `home.awards.title` / `home.awards.description`
- `home.awards.cards.top_talent.title` (etc., 6 cards × title/description)
- `home.awards.detail_link`
- `home.kudos.label` / `home.kudos.title` / `home.kudos.description`
- `home.kudos.detail_button`
- `home.footer.copyright`
- `home.account.profile` / `home.account.sign_out` / `home.account.admin_dashboard`
- `home.stub.coming_soon`

## Strategy

Track A adds the keys it needs as it builds. After Track A reports done, run a sweep:

```bash
grep -rE "t\(lang, ['\"]home\." app/ lib/ | sed -E "s/.*['\"]([a-z_.]+)['\"].*/\1/" | sort -u
```

Cross-check against `lib/i18n/dictionary.ts`. Add any missing keys.

## Success criteria

- All `home.*` keys referenced in `app/**` exist in both `vi` and `en` blocks
- `npx tsc --noEmit` passes (`TranslationKey` type stays correct)

## Final notes

**Status: ✅ DONE**

30+ `home.*` keys added to `lib/i18n/dictionary.ts` (EN + VI translations). Track A contributed bulk of keys; this phase audited and filled gaps. **Deviations noted:** (1) `home.header.notification.empty` key added (not in original plan list); (2) "Comming" typo fixed to "Coming" across all related keys. TypeScript check passed. No missing translations. All navigation, hero, countdown, awards, kudos, footer, and stub labels properly i18n'd.
