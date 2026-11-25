---
type: Requirement Story
epic: "Epic 03: Wife's Detective Notebook, Anytime Confrontation & Social Sharing"
status: draft
description: "Anytime confrontation trigger, dynamic excuse ladder evaluation, suspicion penalty on failure, and tiered star conviction."
tags: [requirement, user-story, confrontation, excuse-engine, verdict, epic-03]
timestamp: "2026-10-20"
---

# US-016 - Anytime Confrontation Hub & Dynamic Excuse Engine ("Đối chất & Chối bay chối biến")

### Epic: [Epic 03](./epic.md)

As a Player (Wife), I want to initiate confrontation ("Đối chất") with the husband at any time to interrogate him beat-by-beat with my pinned evidence, listen to comedic excuses, and convict him for a 1-3 star victory.

### Canonical Wireframe Reference

- [ASCII Wireframe - Screen SSOT](./wireframes/wireframe-us-016-confrontation-hub.md)
- [Corkboard Canvas Wireframe Reference](./wireframes/wireframe-us-015-corkboard-node-canvas.md)
- Interactive HTML: pending ASCII signoff; not generated.

### Acceptance Criteria

1. Tapping the "Đối chất" action button from the Wife's Detective Notebook top bar opens the Anytime Confrontation stage as a full-screen modal overlay (`z-index: 80`).
2. Opening confrontation automatically evaluates the player's active corkboard Knowledge Graph state (verified edges between clues, bridge identifiers, and unmasked suspects) against `caseConfig.groundTruth` without requiring manual card slotting or drag-and-drop submission.
3. **Suspect Selection & Dynamic Disguise Unmasking (Giai đoạn chọn nghi phạm & Lột trần vỏ bọc)**:
   - When launching confrontation, Step 1 presents the suspect selection tray (`"Chọn nghi phạm"`) displaying Polaroid cards for candidates present on the active corkboard.
   - **Initial Disguise State (Trước khi lột mặt nạ)**: If the player has pinned an alias contact (e.g., "Anh Tuấn Thợ Điện") but has not yet connected the bridging identity edge (e.g. matching phone number or legal transaction name), the Polaroid card displays the alias name, the disguise avatar (electrician toolbag), and the default stamp `"NGHI PHẠM"`.
   - **Unmasked Disguise State (Đã lột mặt nạ)**: When the active corkboard contains verified identity-bridging edges (e.g., connecting the late-night electrician call and the Shopee silk dress order via matching phone number `0988886677`), the candidate card dynamically evolves:
     - The primary header displays the suspect's true identity (e.g., `"Nguyễn Thị Thu Hương"`).
     - The card visibly links the two identities with a subtitle: `Vỏ bọc: "Anh Tuấn Thợ Điện"` (paired with `IoGlassesOutline`).
     - The card displays the smoking-gun bridge anchor: `Trùng SĐT: 0988886677` (paired with `IoCallOutline`).
     - The photo switches to the suspect's real persona portrait.
     - The stamp updates to `"ĐÃ LỘT MẶT NẠ"`.
   - In Step 2 ("Xác nhận đối chất"):
     - The modal uses a **Darkroom Casefile Dossier** visual style consistent with the Cold War evidence board: dark vignette backdrop, sealed darkroom folder sheet (`#141A22`) with `#E11D48` left spine, `FILE 01` tab and crimson case stamp (`#01`), `font-sans` uppercase metadata headers, and tilted cool-gray Polaroid portraits (`#EEF2F6`) of the husband and suspect pinned with red pushpins and linked by a horizontal red string.
     - The conviction probability bar (`Tỉ lệ thành công`) renders as a 5-segment progress indicator (`role="progressbar"`).
     - The evidence summary displays **Deductive Linkage Bridges** (`verifiedStringsList`) pairing connected clues (source clue <-> relationship bridge badge <-> target clue) to highlight causal connections (e.g. matching phone number, money trail, alibi contradiction) without redundant raw text clutter, falling back to concise verified clues if no active bridge pairs exist.
     - The primary confrontation CTA renders as a red embossed dossier stamp button (`MÀY DÁM LỪA BÀ!` / dynamic label) with a secondary `Điều tra thêm` return action.
4. **Beat-by-Beat Scripted Interrogation (`caseConfig.confrontationScript`)**:
   - When a case defines `confrontationScript`, confirming confrontation opens a 3-tier vertical dark interrogation room (`max-w-[480px] h-[100dvh]`, `bg-darkroom-bg` `#080B0F`) with an overhead spotlight illuminating Comic Husband (`HusbandCharacterImage`: `confident`, `smug`, `nervous`, `broken`), a minimalist `- • -` progress rail (`role="progressbar"`), character-anchored `13px` (`text-ios-footnote`) muted dual-speaker subtitles (`Vợ :` recall in `#78889C` and `Hoàng :` reply in `#94A3B8` with typewriter reveal), and a Vertical Numbered Choice List (`1`-`4` keycaps, `min-h-[48px]` touch targets, `ArrowUp`/`ArrowDown` + `1`-`4` desktop shortcuts).
   - **Beat 1 (`opening`)**: Presents 2 opening questions (`1`, `2`), each returning its own `confident` denial from the husband and advancing to Beat 2.
   - **Beats 2..N (`beat`)**: Types out the husband's reply (`TYPEWRITER_CHAR_MS = 22ms`, capped at `1600ms`, tap/key-to-skip, instant under `prefers-reduced-motion`) before revealing and enabling the vertical choice options (`isDeckReady`), keeping focus on the dialogue without competing screen highlights. Evaluates the chosen option against canonical verified edges on the active corkboard (`requiredEdgeIds`) and suspect alignment (`isBeatChoiceSatisfied`):
     - **False Branch (`failed` / `smug`)**: Selecting a red herring, lacking any required canonical edge, or accusing a wrong suspect switches the husband to `smug` with a mocking rebuttal, locks `canAccuse = false` (hiding all accusation/verdict buttons), displays only `"Quay lại điều tra"` once the reply finishes typing, and deducts **1 strike** upon exiting the room (triggering "Caught Snooping" if strikes reach 0).
     - **True Branch (`nervous` -> `broken`)**: Advances beat progress, shifts mood through `nervous` on intermediate beats to `broken` on the final key evidence beat, and unlocks Step `End` (`phase: 'ending'`, `canAccuse = true`).
   - **Step `End` (`ending` -> `resolved`)**: Unlocks verdict lines from `script.ending` (e.g., divorce vs forgive) in the vertical choice list, stamps the outcome matching `groundTruth.verdict` (`cheating`, `sugar_relationship`, `innocent`), awards 3 stars (`★★★`), custom Wife Title, comedic roast narrative, `"Tạo thẻ Roast khoe MXH"` (US-017), and level progression CTA (US-018).
5. **Fallback Tiered Evaluation (Cases without `confrontationScript`, e.g. Level 2 & Level 3)**:
   - 0 verified smoking-gun links -> 0 stars (`confident`), +1 strike penalty (or Caught Snooping if strikes exhaust), and `"Tiếp tục điều tra"`.
   - 1 verified smoking-gun link -> 1-star win (`★☆☆`, `surprised`), unlocking `"Tha thứ & Qua màn"` and `"Điều tra tiếp để đạt 3 sao"`.
   - 2 verified smoking-gun links -> 2-star win (`★★☆`, `nervous`), unlocking `"Tha thứ & Qua màn"` and `"Điều tra tiếp để đạt 3 sao"`.
   - Complete smoking-gun chain -> 3-star victory (`★★★`, `broken`), awarding custom Wife Title, victory roast, `"Tạo thẻ Roast khoe MXH"`, and `"Tha thứ & Qua màn"`.
6. Accusing an innocent red-herring suspect triggers specific over-jealous roast punchlines tailored to that suspect's alibi (`smug` in scripted mode / `0 stars` in fallback mode) before returning to investigation.
7. All confrontation evaluation, beat state transitions, excuse branching, and star calculation execute 100% client-side without network calls or external server dependencies.

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Manual drag-and-drop evidence slots inside the confrontation view |
| OOS02 | Voice acting, audio clips, or animated video cutscenes for husband reactions |
| OOS03 | Microtransactions or paid hints to bypass failed confrontation strikes |
| OOS04 | Cloud backend synchronization or server-side score validation |

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Platform | Follow existing [global NFRs](../vision-scope.md#4-key-constraints--non-functional-requirements-global); no new backend service. |
| UI & Accessibility | WCAG AA contrast ($\ge 4.5:1$), interrogation subtitle font size $13\text{px}$ (`text-ios-footnote`, subdued contrast `#78889C` / `#94A3B8`) paired with $15\text{px}$ (`text-ios-subheadline`) interactive choice options, minimum $44\text{px} \times 44\text{px}$ touch targets, instant typewriter bypass under `prefers-reduced-motion`, canonical Ionicons/vector SVGs (no raw emojis). |
| Performance | Graph evaluation and dialogue resolution complete in under 50ms upon tapping "Đối chất". |
| Data Consistency | Star rating and completion status persist strictly to local storage (`PlaySession.stars`). |

### Open Questions

None for confirmed behavior. ASCII signoff and team sizing remain pending; status stays draft.

### Citations

- [Signed-off target discovery](../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md)
- [US-015 Detective Corkboard Canvas](../epic-03-wife-notebook-verdict-social-sharing/us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md)
- [Level 1 Case Implementation](../epic-04-detective-case-stories-level-content/us-027-husband-hoang-level-1-case-implementation.md)
- [Wife's Notebook Features](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md)
- [Wife's Notebook Design](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md)
- Implemented runtime contracts: `src/features/wife-notebook/WifeNotebookModal.tsx`, `src/features/wife-notebook/confrontationEngine.ts`, `src/features/wife-notebook/components/ConfrontationModal.tsx`, `src/features/wife-notebook/components/HusbandCharacterImage.tsx`, `src/features/wife-notebook/confrontationMotion.ts`, `src/features/wife-notebook/graphEngine.ts`, `src/features/wife-notebook/level01Fixture.ts`

