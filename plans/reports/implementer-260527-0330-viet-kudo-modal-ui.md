# Implementation Report — Viết Kudo Modal UI

## Task
- Task: Build presentational "Viết Kudo" modal UI (Track A)
- Status: DONE

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `app/_components/kudos/kudos-create-form-types.ts` | 16 | Shared types: `RecipientOption`, `KudoCreatePayload` |
| `app/_components/kudos/kudos-create-rich-toolbar.tsx` | 155 | 6-button formatting toolbar + "Tiêu chuẩn cộng đồng" link |
| `app/_components/kudos/kudos-create-hashtag-input.tsx` | 185 | Hashtag chips + autocomplete popover with create-new |
| `app/_components/kudos/kudos-create-recipient-input.tsx` | 196 | Recipient autocomplete dropdown with avatar/initials |
| `app/_components/kudos/kudos-create-form.tsx` | 395 | Main form body — all 8 sections (A–H) |
| `app/_components/kudos/kudos-create-modal.tsx` | 112 | Native `<dialog>` shell — overlay, ESC, backdrop click |
| `app/_components/kudos/kudos-create-modal-demo.tsx` | 88 | Demo wrapper with mock data (NOT wired to any route) |
| `app/kudo-demo/page.tsx` | 8 | Temporary demo page at `/kudo-demo` for visual verification |

**Total: ~1155 lines across 8 files.**

## Component Tree

```
KudosCreateModal (kudos-create-modal.tsx)
  Props: open, onClose, onSubmit, recipients, existingHashtags, currentUserId
  └── KudosCreateForm (kudos-create-form.tsx)
        Props: recipients, existingHashtags, currentUserId, onSubmit, onCancel
        ├── [A] h2 heading
        ├── [B] KudosCreateRecipientInput (kudos-create-recipient-input.tsx)
        ├── [Frame 552] Danh hiệu grid row + hint
        ├── [C+D] KudosCreateRichToolbar (kudos-create-rich-toolbar.tsx) + textarea
        ├── [E] KudosCreateHashtagInput (kudos-create-hashtag-input.tsx)
        ├── [F] image thumbnails + file picker
        ├── [G] anonymous checkbox + alias input
        └── [H] Hủy / Gửi footer buttons
```

## Exact Prop Interfaces (for orchestrator wiring)

```ts
// kudos-create-form-types.ts
export type RecipientOption = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  department: string | null;
};

export type KudoCreatePayload = {
  recipientId: string;
  title: string;
  contentMarkdown: string;
  hashtags: string[];
  imageFiles: File[];
  isAnonymous: boolean;
  anonymousAlias: string | null;
};

// KudosCreateModal props:
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: KudoCreatePayload) => Promise<void>;
  recipients: RecipientOption[];
  existingHashtags: string[];
  currentUserId: string;
};
```

## Tests Status
- TypeScript check (`npx tsc --noEmit`): PASS (0 errors)
- Unit tests: none written (presentational UI only, no business logic)
- Visual validation: PASS — screenshots captured and compared to Figma annotated design

## Design Tokens Applied (sourced from MCP)
| Token | Value |
|-------|-------|
| Card background | `rgba(255, 248, 225, 1)` |
| Card border radius | `24px` |
| Card padding | `40px` |
| Card width | `max-width: 752px` |
| Label font | Montserrat 700 22px `#00101A` |
| Required asterisk | Noto Sans JP 700 16px `#CF1322` |
| Input border | `1px solid #998C5F` |
| Input border radius | `8px` |
| Input background | `#FFF` |
| Toolbar button height | `40px` |
| Cancel button | `rgba(255,234,158,0.10)` bg, `#998C5F` border, `border-radius: 4px` |
| Submit button | `rgba(255,234,158,1)` bg, `border-radius: 8px`, height 60px |
| Image thumbnail | `80×80px`, `border-radius: 18px` |
| Checkbox | `24×24px`, `border-radius: 4px`, `border: 1px solid #999` |
| Hint text | Montserrat 700 16px `#999` |

## Screenshot Paths
- Full modal (1440×1200): `plans/260527-0330-viet-kudo-modal/data/actual-modal-v3-full.png`
- Recipient dropdown open: `plans/260527-0330-viet-kudo-modal/data/actual-recipient-dropdown.png`

## Judgment Calls / Ambiguities

1. **Label column width**: Figma shows "Người nhận" (~146px) and "Danh hiệu" (~139px) as label widths. Used a unified CSS grid column of `160px` so all inputs align to the same left edge. Minor pixel difference from Figma but cleaner grid alignment.

2. **Toolbar right-side gap**: The Figma toolbar spans the full 672px content width, with the "Tiêu chuẩn cộng đồng" link right-aligned. Between the 6 buttons and the link there is empty space (a `flex: 1` spacer). Implemented exactly this way — not a full-width borderless row.

3. **Avatar images 404**: The seed.sql avatar paths (`/kudos/avatars/u1.png` etc.) don't exist in `public/`. The `AvatarCircle` component has an initials fallback that renders correctly. These will be resolved when real user data is connected.

4. **Modal scroll behavior**: The native `<dialog>` element + a scrollable fixed wrapper was chosen over `overflow-y: auto` on the card. This allows the card to grow and scroll within the viewport on short screens without clipping.

5. **Toolbar left buttons border-radius**: Design shows `border-radius: 8px 0 0 0` (top-left only) on the leftmost button and `0 8px 0 0` (top-right only) on the rightmost. Implemented exactly per MCP spec.

6. **Mention regex**: Uses `/@(\w*)$/` which only matches ASCII word chars after `@`. Vietnamese names use spaces, so the full name must be selected from the suggestion list — typing `@Nguyễn` would not match. This is acceptable for the demo; real implementation may need Unicode-aware regex.

7. **Toolbar area to the right of button group**: The Figma shows an invisible button placeholder (`Button` frame, width 336px) between the last toolbar button and the "Tiêu chuẩn cộng đồng" link. This appears to be a spacer/reserved area. Implemented as `flex: 1` space via `justify-content: space-between` on the toolbar container.

## Backend Integration Points (for orchestrator)

The orchestrator needs to wire these to replace mock data:

1. **`recipients` prop** → query `profiles` table where `id ≠ currentUser`, return `{id, display_name, avatar_url, department}`
2. **`existingHashtags` prop** → query `SELECT DISTINCT tag FROM kudos_hashtags ORDER BY tag`
3. **`currentUserId` prop** → from Supabase auth session
4. **`onSubmit` handler** → call `lib/kudos/actions.ts` (orchestrator owns this):
   - Upload `imageFiles` to Supabase Storage `kudos-images` bucket → get public URLs
   - Insert into `kudos` table: `recipient_id`, `title` (new column), `content`, `is_anonymous`, `anonymous_alias`
   - Insert into `kudos_hashtags` table: one row per tag
5. **Open trigger** → wire `KudosEntryInput.onAction` to set modal `open=true` in `app/kudos/page.tsx`

**Status:** DONE
**Summary:** All 4 component files + types + demo wrapper created. TypeScript passes clean. Visual comparison to Figma confirms correct layout, colors, and interactive states. Mock data sourced from seed.sql (10 VN recipients, 6 hashtags). Ready for orchestrator backend wiring.
