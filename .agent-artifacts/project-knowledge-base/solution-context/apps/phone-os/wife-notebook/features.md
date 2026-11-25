---
type: App Features Specification
app_id: wife_notebook
app_name: Wife's Detective Notebook & Final Decision Hub
vietnamese_name: Sổ Tay Bắt Ghen Của Vợ
status: approved
description: "Comprehensive functional features, zero-spoiler long-press pinning, split-section dossier (suspects & evidence locker), suspect-evidence linkage, and final verdict accusation hub for the Wife's Detective Notebook."
tags: [app-features, wife-notebook, suspect-board, evidence-locker, verdict-hub, schema, functional-spec]
timestamp: "2026-10-14T13:00:00+07:00"
---

# Sổ Tay Bắt Ghen Của Vợ - Functional Features Specification

---

## 1. Functional Overview

*Sổ Tay Bắt Ghen Của Vợ* is the player's personal detective dossier and command center. It floats omnipresently on the phone shell, allowing the wife to track suspicious individuals and pin forensic evidence encountered across all parody apps without any UI spoilers. The notebook provides a split-section dossier where wifey links incriminating evidence directly to suspect profiles, culminating in the final confrontation and verdict accusation hub.

---

## 2. In-App Features & User Interactions

### 2.1. Right-Edge-Docked Investigation Tab (`NotebookTab`)
* Compact `46×52px` single-surface tab docked flush to the right edge of the phone shell (vertically draggable along the right edge), featuring the `IoJournalOutline` notebook icon and a dynamic circular top-left counter badge displaying pinned evidence count (case number exposed via `aria-label`). Tapping opens the detective corkboard overlay.

### 2.2. Zero-Spoiler Universal Long-Press Pinning & Pinned Marker Sync
* **No UI Visual Cues Before Pinning**: Parody apps contain zero spoiler giveaways on unpinned items (no glowing borders, no clue icons, no warning boxes, no static "+ Ghim" buttons).
* **Long-Press Gesture ($\ge 380\text{ms}$) & Keyboard Fallback**: Pressing and holding for $380\text{ms}$ (or pressing `Enter`/`Space` on keyboard focus) on any interactive story narrative element (`StoryEvidenceTarget`) triggers a subtle haptic pulse (`navigator.vibrate(50)`), highlights the selected item over a blurred scrim, and opens the dark contextual `UniversalEvidenceModal` with a single Vietnamese action row (`"Ghim vào Sổ tay"`).
* **Player-Pinned Red Bookmark Marker**: Once an item (message, call log, transaction, order, photo, note, etc.) is pinned by the player, `StoryEvidenceTarget` renders a non-interactive red circular bookmark badge (`IoBookmark`) synchronized with `PlaySession.taggedSuspects`. Removing the item in the notebook removes the badge automatically.
* **Quick Unpin at Source**: Long-pressing an already-pinned item opens the same contextual menu with the action row switched to `"Bỏ ghim khỏi Sổ tay"`, allowing immediate unpinning from the source app and removing the red badge.
* **Universal Pinning & Decoys**: Any narrative element (true clue or innocent decoy) can be pinned into the Notebook's unplaced clue drawer. The system never warns or rejects decoys during investigation to preserve mystery.

### 2.3. Detective Corkboard Node Canvas (`BangNoiDay`) & "Giác Quan Thứ 6" Hint Engine
* **2D Tap-to-Connect Corkboard (`US-015`)**:
  - Players place pinned cards from the bottom drawer (`Khay Manh Mối Thu Thập`) onto the 2D corkboard and tap Node A then Node B to connect yarn string edges (yellow solid `#FBBF24` for neutral links; red solid `#DC2626` for alibi contradictions).
  - Each card includes a `[Loc]` (`IoNavigateOutline`) deep-link button to jump back to the source app and highlight the original record while minimizing the notebook into a top `[Quay lại Sổ tay]` pill.
  - Displays the active smoking-gun objective counter (*Bằng chứng cốt lõi: X/3*).
* **"Giác Quan Thứ 6" (Sixth Sense) Hint Engine (`US-022`)**:
  - Header button (`IoSparklesOutline`) inside the Wife's Notebook, free with a **30-second real-time cooldown** across all levels (including Level 0), persisted across notebook toggles and page reloads.
  - When an uncollected required clue remains, displays `[AppIcon] Xem [Tên ứng dụng]. [Về màn hình chính]` and highlights the target app icon on the SpringBoard (max 2 pulses then static indicator; static indicator under `prefers-reduced-motion`). Clearing/pinning the target clue clears the highlight.
  - When all required clues are already collected but the graph remains unsolved, displays a general reminder (`Xem lại các mối liên hệ.`) without revealing the answer pair, and starts the 30s cooldown.

### 2.4. Beat-by-Beat Interrogation & Dynamic Excuse Engine (`[ Đối chất ]` - `US-016`, `US-017`, `US-033`)
* **Preflight & Automatic Graph Evaluation**: Tapping `[Đối chất]` opens the two-step Darkroom Dossier (`ConfrontationConfirmModal`) to pick a pinned suspect and review verified linkage bridges, then launches `ConfrontationModal` (`z-80`) without manual card slotting.
* **Scripted Beat-by-Beat Interrogation (`caseConfig.confrontationScript`)**:
  1. **Beat 1 (`opening`)**: Presents 2 opening questions (`1`, `2`) in the vertical numbered choice list. Each choice returns a distinct `confident` denial from the husband and advances to Beat 2.
  2. **Beats 2..N (`beat`)**: Types out the husband's reply (`13px` muted subtitle with tap/key-to-skip) before revealing and enabling up to 4 numbered vertical choices (`1`-`4` keys, touch, or `ArrowUp`/`ArrowDown`). `isBeatChoiceSatisfied` checks whether the selected option is a valid lead whose `requiredEdgeIds` are all connected as canonical edges on the corkboard (and the accused suspect matches `groundTruth.culpritSuspectId`):
     - **False Branch (`failed` / `smug`)**: Missing/unverified evidence, red herring choices, or wrong-suspect accusations trigger the husband's `smug` rebuttal, lock `canAccuse = false` (hiding all accusation/verdict actions), show only `[Quay lại điều tra]`, and apply **+1 suspicion strike** upon exiting the interrogation room.
     - **True Branch (`nervous` -> `broken`)**: Advances progress along the `- • -` rail, shifts mood through `nervous` on intermediate beats to `broken` on the final key evidence beat, and unlocks `ending` (`canAccuse = true`).
  3. **Step `End` (`ending` -> `resolved`)**: Unlocks final verdict lines from `script.ending` (e.g., divorce vs forgive) after the breakdown reply finishes typing, stamps the case verdict matching `groundTruth.verdict`, awards 3 stars, Wife Title, comedic roast summary, `[Tạo thẻ Roast khoe MXH]`, and level progression CTA.
* **Legacy Tiered Fallback (Cases without `confrontationScript`)**:
  1. **0 Core Clues (0 Stars - Premature Accusation)**: Husband delivers `confident` gaslighting excuses, increments suspicion by **+1 strike**, and lets the player continue investigating.
  2. **1-2 Core Clues (1-2 Stars - Partial Conviction)**: Husband stammers defensive excuses (`surprised` / `nervous`), offering `[Tha thứ & Qua màn]` or `[Điều tra tiếp để đạt 3 sao]`.
  3. **Complete Smoking-Gun Chain (3 Stars - Full Conviction)**: Husband confesses (`broken`), awarding 3 stars, custom Wife Title, roast summary, `[Tạo thẻ Roast khoe MXH]`, and `[Tha thứ & Qua màn]`.

---

## 3. Declarative State Contract

```typescript
export type ConfrontationMood = 'confident' | 'smug' | 'nervous' | 'broken';
export type ConfrontationSlot = 'up' | 'right' | 'down' | 'left';
export type ConfrontationStepPhase = 'opening' | 'beat' | 'failed' | 'ending' | 'resolved';

export interface ScriptedConfrontationState {
  phase: ConfrontationStepPhase;
  husbandName: string;
  husbandMood: ConfrontationMood;
  husbandLine: string | null;
  lastWifeLine: string | null;
  topic: string | null;
  beatIndex: number;
  totalBeats: number;
  currentStepIndex: number;
  totalSteps: number;
  verifiedBeatCount: number;
  hitSeq: number;
  choices: Array<{ choiceId: string; slot: ConfrontationSlot; wifeLine: string }>;
  canAccuse: boolean;
  selectedEndingChoiceId: string | null;
  verdict: 'innocent' | 'cheating' | 'sugar_relationship';
  stars: 0 | 3;
  wifeTitle?: string;
  narrativeRoast?: string;
  currentStrikes: number;
  newStrikesRemaining: number;
  isMaxStrikesReached: boolean;
  isWrongSuspect: boolean;
}
```
