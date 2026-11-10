---
type: Requirement Story
epic: "Epic 02: Clue Inspection, Puzzle Unlocks, Hints & Suspicion Engine"
status: draft
description: "Universal 380ms long-press dark context menu, player-pinned red bookmark marker sync across all apps, quick unpin at source, and single-card consolidation in Wife's Notebook."
tags: [requirement, user-story, evidence, long-press, context-menu, bookmark, epic-02]
timestamp: "2026-11-10"
---

# US-011 - Zero-Spoiler Universal Long-Press Clue & Suspect Pinning ("Ghim Bằng Chứng & Nghi Phạm")

### Epic: [Epic 02](./epic.md)

As a Player (Wife), I want to long-press on narrative elements across parody apps to inspect, pin, or unpin clues via a dark contextual menu and see which items I have already pinned via a red bookmark marker without pre-pin visual tells or spoilers.

### Canonical Wireframe Reference

- [Signed-off ASCII Wireframe, revision 2](./wireframes/wireframe-us-011-universal-evidence-modal.md)
- [Clue Card Wireframe Reference](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-clue-card.md)
- Interactive HTML: not generated (ASCII revision 2 signed off on 2026-11-10).

### Acceptance Criteria

1. Pressing and holding any dynamic story narrative element (chat messages, call records, bank transactions, purchase orders, photos, notes, emails, or social posts wrapped in `StoryEvidenceTarget`) for at least 380ms activates the pointer hold state (`scale-[0.98]`) and triggers a 50ms haptic vibration pulse via `navigator.vibrate(50)`. Keyboard users can trigger the same modal from any focused `StoryEvidenceTarget` using `Enter`, `Space`, or `Shift+F10`.
2. Releasing the pointer before reaching 380ms or dragging/scrolling more than 18px cancels the timer immediately without opening any menu or logging evidence. Normal taps execute their default app action.
3. Structural app chrome (navigation headers, back buttons, tab bars, search bars, contact action rows, and settings buttons) strictly ignores long-press gestures and never displays evidence inspection overlays.
4. Completing the 380ms hold (or keyboard trigger) opens `UniversalEvidenceModal` over a blurred, dimmed scrim (`bg-black/60 backdrop-blur-md`) while visually highlighting the selected narrative target above the scrim (`ring-2 ring-white/75`) and anchoring a compact dark context menu (`.glass-elevated` / `--sys-surface-elevated`, `rounded-2xl`, `max-w-[300px]`-`320px`) below it (flipping above or centering safely when near viewport edges or on oversized targets).
5. `UniversalEvidenceModal` renders a dark two-zone contextual card using universal `text-ios-*` typography tokens (zero arbitrary pixel classes and zero `[X]` or secondary cancel buttons):
   - Upper preview block: 1-2 line primary snippet/title (`text-ios-subheadline font-semibold text-white`, `line-clamp-2`) and secondary source/event timestamp subtitle (`text-ios-footnote text-[#94A3B8]`, contrast `>= 4.5:1`).
   - Hairline divider (`border-white/12`).
   - Single full-width interactive action row (`min-h-[44px]`):
     - For unpinned items: Vietnamese label `"Ghim vào Sổ tay"` (`text-ios-body text-white`) with Ionicons `IoBookmarkOutline` on the right.
     - For already-pinned items: Vietnamese label `"Bỏ ghim khỏi Sổ tay"` (`text-ios-body text-[#FCA5A5]`, contrast `>= 4.5:1`) with filled Ionicons `IoBookmark` on the right.
6. Prior to being pinned by the player, both genuine forensic clues and innocent decoy narrative items exhibit identical zero-spoiler appearance and long-press behavior (zero glowing borders, zero clue badges, and zero permanent pin buttons).
7. Tapping `"Ghim vào Sổ tay"` saves the item to the active session (`PlaySession.taggedSuspects`), closes the menu, displays a 2-second confirmation notification in the Dynamic Island (`Đã ghim "..." vào Sổ tay của vợ!`), and syncs the pinned state across all apps.
8. Every `StoryEvidenceTarget` across all parody apps whose item matches an entry currently stored in `PlaySession.taggedSuspects` displays a non-interactive red circular bookmark badge (`#EF4444` / `--sys-badge-red` with white Ionicons `IoBookmark`, `pointer-events-none`, `aria-hidden="true"`) without distorting parent row or bubble layout. Unpinned items never show this badge.
9. Tapping `"Bỏ ghim khỏi Sổ tay"` on a pinned item removes that message or record from `PlaySession.taggedSuspects` (following `wireframe-clue-card.md` rules: removing a message preserves a title-only conversation card only if the conversation itself was explicitly pinned, otherwise removes the empty card), closes the menu, immediately clears the red bookmark badge from the app view, and shows a 2-second Dynamic Island confirmation (`Đã bỏ ghim "..." khỏi Sổ tay.`). Removing an item or card inside Wife's Notebook (or restoring via Undo) synchronizes the red bookmark badge in real time.
10. Pinned evidence items belonging to the same contact, thread, or conversation consolidate into a single corkboard card bearing the suspect's visible name/alias; subsequent pinned messages from that conversation append as timestamped bullet entries (`• DD/MM · HH:mm: "..."`) rather than creating duplicate cards.
11. Tapping the dimmed backdrop outside the highlighted item and menu, or pressing `Escape`, dismisses `UniversalEvidenceModal` without modifying case state and restores focus to the triggering `StoryEvidenceTarget`.
12. Inspecting, pinning, marking, and unpinning evidence operate entirely client-side without altering source narrative data or making network requests.

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Permanent or visible "+ Ghim" action buttons on parody app screens, feeds, or modals |
| OOS02 | Multi-choice modal action sheets ("Ghim Nghi Phạm" vs "Ghim Bằng Chứng") or secondary "Bỏ qua" / `[X]` close buttons inside the dark context menu |
| OOS03 | Pre-pin clue hints or visual differentiation between genuine clues and innocent decoys |
| OOS04 | Manual message reordering or editing within a pinned corkboard card |
| OOS05 | Cloud synchronization or multi-device progress sharing |

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Platform | Follow existing [global NFRs](../vision-scope.md#4-key-constraints--non-functional-requirements-global); no new backend service or external API. |
| Accessibility & Gestures | Action row height `>= 44px`; focus trap (`role="dialog"`, `aria-modal="true"`) and focus restoration; `18px` movement tolerance for finger jitter; WCAG 2.1 AA contrast (`>= 4.5:1`); Web Vibration API with graceful fallback; `prefers-reduced-motion` compliant. |
| Iconography & Typography | Canonical Ionicons v5 (`IoBookmarkOutline`, `IoBookmark` from `react-icons/io5`) and universal `text-ios-*` scale tokens; raw Unicode emojis, Lucide icons, and arbitrary pixel font classes are strictly prohibited. |
| Source Integrity | Evidence pinning and unpinning update local session state only; source case configuration remains immutable. |

### Open Questions

None. Revision 2 ASCII wireframe signed off on 2026-11-10.

### Citations

- [Signed-off target discovery](../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md)
- [Universal Design System](../../../project-knowledge-base/solution-context/design-system/design.md)
- [Design Tokens](../../../project-knowledge-base/solution-context/design-system/tokens.md)
- [Systemic Behaviors & Motion](../../../project-knowledge-base/solution-context/design-system/behaviors-motion.md)
- [Wife's Notebook Features](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md)
- [Wife's Notebook Design](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md)
- [Canonical Clue Card Wireframe](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-clue-card.md)
- Implemented runtime contracts: `src/features/investigation/components/StoryEvidenceTarget.tsx`, `src/features/investigation/components/UniversalEvidenceModal.tsx`, `src/features/investigation/tagSuspect.ts`, `src/bootstrap/GameRoot.tsx`
