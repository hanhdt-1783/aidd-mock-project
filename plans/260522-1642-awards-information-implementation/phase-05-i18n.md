# Phase 05 — i18n keys + audit

**Track:** B
**Priority:** Low (Track A adds the bulk; this is a safety net)

## Goal

`awards.*` keys are complete in both `vi` and `en` blocks of `lib/i18n/dictionary.ts`.

## Expected keys

- `awards.title` — main heading "Hệ thống giải thưởng SAA 2025"
- `awards.subtitle` — "Sun* annual awards 2025"
- For each slug in [`top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`]:
  - `awards.menu.<slug>.label`
  - `awards.section.<slug>.title`
  - `awards.section.<slug>.description`
  - `awards.section.<slug>.count`
  - `awards.section.<slug>.count_unit` (e.g., "Đơn vị" / "Units", "Cá nhân" / "Individuals", "Tập thể" / "Teams")
  - `awards.section.<slug>.value`
  - `awards.section.<slug>.value_unit` ("cho mỗi giải thưởng" / "per prize")

## Audit command

```bash
grep -rhE 't\(lang, ["'"'"']awards\.[^"'"'"']+["'"'"']' app/ lib/ | sed -E 's/.*t\(lang, ["'"'"']([a-z0-9_.\-]+)["'"'"'].*/\1/' | sort -u
```

Cross-check against the dictionary; add any missing keys (vi + en parity).

## Success criteria

- 0 missing keys
- `npx tsc --noEmit` clean

---

## Final notes

**Status:** ✅ DONE

130+ `awards.*` keys added to dictionary (vi + en parity). Spot-checks verified: titles, labels, menu items, counts, values all present and translated. Unused `awards.section.per.label` removed during polish phase. TypeScript clean. All test cases requiring i18n keys pass validation.
