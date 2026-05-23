# Clarifications — Unify Language Dropdown

## Session 2026-05-23
- Q: Which screens to unify? → A: All headered screens + add header w/ language switcher to /kudos, /standards, /profile placeholder pages.
- Q: Where should the shared component live? → A: Move to `app/_components/shared/` (matches existing shared-component pattern).
- Q: How closely match the Figma design? → A: Pixel-match — rounded-md/lg (~8px), no border, keep current 110px × 56px sizing.

## MoMorph refs
- Dropdown-ngôn ngữ: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Frame: 721:4942 (revision 33b849680cdef15298c122effb920fd4)

## Derived plan implications
- Single shared `LanguageSwitcher` + `LanguageDropdown` lives at `app/_components/shared/`.
- Consumers: `LoginHeader` (login), `HomeHeader` (home/awards), and **new** headers on /kudos, /standards, /profile.
- /prelaunch deliberately excluded (countdown is full-bleed, no header).
- Visual updates: `rounded-sm` → `rounded-lg`, drop `border border-white/10`, retain `shadow-lg`.
