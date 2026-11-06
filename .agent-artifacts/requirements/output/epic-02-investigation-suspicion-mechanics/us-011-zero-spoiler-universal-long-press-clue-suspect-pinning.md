---
type: Requirement Story
epic: "Epic 02: Investigation Mechanics, Polymorphic Locks & Suspicion Engine"
status: draft
description: "Universal 380ms long-press clue and suspect inspection, snapshot modal, and single-card consolidation in Wife's Notebook."
tags: [requirement, user-story, evidence, long-press, modal, epic-02]
timestamp: "2026-10-20"
---

# US-011 - Zero-Spoiler Universal Long-Press Clue & Suspect Pinning ("Ghim Bằng Chứng & Nghi Phạm")

### Epic: [Epic 02](./epic.md)

As a Player (Wife), I want to long-press on narrative elements across parody apps to inspect clues and pin them into my detective notebook without visual tells or spoilers.

### Canonical Wireframe Reference

- [ASCII Wireframe - Screen SSOT](./wireframes/wireframe-us-011-universal-evidence-modal.md)
- [Clue Card Wireframe Reference](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-clue-card.md)
- Interactive HTML: pending ASCII signoff; not generated.

### Acceptance Criteria

1. Pressing and holding any dynamic story narrative element (chat messages, call records, transaction notes, purchase orders, photos) for at least 380ms activates the pointer hold state (`scale-98`) and triggers a 50ms haptic vibration pulse via `navigator.vibrate(50)`.
2. Releasing the pointer before reaching 380ms or dragging/scrolling more than 18px cancels the timer immediately without opening any modal or logging evidence. Normal taps execute their default app action.
3. Structural app chrome (navigation headers, back buttons, tab bars, search bars, contact action rows, and settings buttons) strictly ignores long-press gestures and never displays evidence inspection overlays.
4. Completing the 380ms hold opens `UniversalEvidenceModal` centered over a blurred, dimmed backdrop (`bg-black/60 backdrop-blur-md`) formatted as an iOS system popup alert dialog (`rounded-[26px]`, light gray alert surface `bg-[#F2F2F6]`).
5. `UniversalEvidenceModal` displays an iOS popup alert structure:
   - Header with bold prompt title ("Ghim vào Sổ Tay Bắt Ghen?") and source attribution/timestamp subtitle ("Anh Tuấn Thợ Điện · 15/10 20:48").
   - Content block with an italicized quotation preview of the evidence text (`item.snippet`).
   - A horizontal side-by-side 2-button action row at the bottom with pill-shaped buttons (`rounded-full`, min-h-[44px]):
     - Left button: Solid blue pill (`bg-[#007AFF]`, `text-white font-semibold`) labeled "Bỏ qua" (Cancel).
     - Right button: Soft light gray pill (`bg-[#E5E5EA]`, `text-rose-600 font-semibold`) labeled "Ghim" (Action).
6. Both genuine forensic clues and innocent decoy narrative items exhibit identical long-press behavior and modal presentations; parody apps contain zero glowing borders, clue indicators, or visual tells prior to or during inspection.
7. Tapping "Ghim" saves the item to the active session (`PlaySession.taggedSuspects`), closes the modal, and triggers a confirmation notification toast in the Dynamic Island area for 2 seconds.
8. Pinned evidence items belonging to the same contact, thread, or conversation consolidate into a single corkboard card bearing the suspect's name/alias; subsequent pinned messages from that conversation append as timestamped bullet entries (`• DD/MM · HH:mm: "..."`) rather than creating duplicate cards.
9. Tapping "Bỏ qua" (the blue cancel pill button) or tapping the backdrop outside the alert card dismisses the modal without pinning the item or modifying case state. In accordance with native iOS popup alert ergonomics, the top-right close button (`[X]`) is removed.
10. Permanent or visible "Ghim" buttons are strictly absent across all parody application screens, feeds, and dialogs.
11. Inspecting and pinning evidence operates entirely client-side without altering the source narrative data or making network requests.

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Permanent or visible "+ Ghim" buttons on parody app screens, feeds, or modals |
| OOS02 | Multi-choice modal action sheets ("Ghim Nghi Phạm" vs "Ghim Bằng Chứng") |
| OOS03 | Manual message reordering or editing within a pinned corkboard card |
| OOS04 | Cloud synchronization or multi-device progress sharing |

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Platform | Follow existing [global NFRs](../vision-scope.md#4-key-constraints--non-functional-requirements-global); no new backend service or external API. |
| Accessibility & Gestures | Touch targets at least 44px × 44px; 18px movement tolerance for finger jitter; Web Vibration API with graceful fallback on unsupported hardware. |
| Iconography | Canonical Ionicons (`IoPin`, `IoClose`, `IoShieldOutline`) or responsive vector SVGs; raw Unicode emojis and Lucide icons are strictly prohibited. |
| Source Integrity | Evidence pinning updates local state only; source case configuration remains immutable. |

### Open Questions

None for confirmed behavior. ASCII signoff and team sizing remain pending; status stays draft.

### Citations

- [Signed-off target discovery](../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md)
- [Wife's Notebook Features](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md)
- [Wife's Notebook Design](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md)
- [Canonical Clue Card Wireframe](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-clue-card.md)
- Implemented runtime contracts: `src/features/investigation/components/StoryEvidenceTarget.tsx`, `src/features/investigation/components/UniversalEvidenceModal.tsx`, `src/features/wife-notebook/WifeNotebookModal.tsx`

