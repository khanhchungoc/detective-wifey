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

### 2.1. Omnipresent Floating Button (FAB)
* Prominent spiral-notebook icon with a dynamic badge displaying total items logged (suspects + unlinked evidence count). Tapping opens the slide-up dossier sheet.

### 2.2. Zero-Spoiler Universal Long-Press Pinning & Pinned Marker Sync
* **No UI Visual Cues Before Pinning**: Parody apps contain zero spoiler giveaways on unpinned items (no glowing borders, no clue icons, no warning boxes, no static "+ Ghim" buttons).
* **Long-Press Gesture ($\ge 380\text{ms}$) & Keyboard Fallback**: Pressing and holding for $380\text{ms}$ (or pressing `Enter`/`Space` on keyboard focus) on any interactive story narrative element (`StoryEvidenceTarget`) triggers a subtle haptic pulse (`navigator.vibrate(50)`), highlights the selected item over a blurred scrim, and opens the dark contextual `UniversalEvidenceModal` with a single Vietnamese action row (`"Ghim vào Sổ tay"`).
* **Player-Pinned Red Bookmark Marker**: Once an item (message, call log, transaction, order, photo, note, etc.) is pinned by the player, `StoryEvidenceTarget` renders a non-interactive red circular bookmark badge (`IoBookmark`) synchronized with `PlaySession.taggedSuspects`. Removing the item in the notebook removes the badge automatically.
* **Quick Unpin at Source**: Long-pressing an already-pinned item opens the same contextual menu with the action row switched to `"Bỏ ghim khỏi Sổ tay"`, allowing immediate unpinning from the source app and removing the red badge.
* **Universal Pinning & Decoys**: Any narrative element (true clue or innocent decoy) can be pinned into the Notebook's unplaced clue drawer. The system never warns or rejects decoys during investigation to preserve mystery.

### 2.3. Detective Corkboard Node Canvas (`BangNoiDay`) & "Giác Quan Thứ 6" Hint Engine
* **2D Tap-to-Connect Corkboard (`US-015`)**:
  - Players place pinned cards from the bottom drawer (`Khay Manh Mối Thu Thập`) onto the 2D corkboard and tap Node A then Node B to connect red-string edges (unmasking disguised identities and exposing alibi contradictions).
  - Each card includes a `[Loc]` (`IoNavigateOutline`) deep-link button to jump back to the source app and highlight the original record while minimizing the notebook into a top `[Quay lại Sổ tay]` pill.
  - Displays the active smoking-gun objective counter (*Bằng chứng cốt lõi: X/3*).
* **"Giác Quan Thứ 6" (Sixth Sense) Hint Engine (`US-022`)**:
  - Header button (`IoSparklesOutline`) inside the Wife's Notebook, free with a **30-second real-time cooldown** across all levels (including Level 0), persisted across notebook toggles and page reloads.
  - When an uncollected required clue remains, displays `[AppIcon] Xem [Tên ứng dụng]. [Về màn hình chính]` and highlights the target app icon on the SpringBoard (max 2 pulses then static indicator; static indicator under `prefers-reduced-motion`). Clearing/pinning the target clue clears the highlight.
  - When all required clues are already collected but the graph remains unsolved, displays a general reminder (`Xem lại các mối liên hệ.`) without revealing the answer pair, and starts the 30s cooldown.

### 2.4. Anytime Confrontation & Dynamic Excuse Engine (`[ Đối chất ]` - `US-016`, `US-017`, `US-033`)
* **Automatic Graph Evaluation**: Tapping `[Đối chất]` at any moment automatically evaluates connected clusters and contradiction edges on the corkboard against `caseConfig.groundTruth` without manual dropdowns.
* **Scaled Outcome Tiers**:
  1. **0 Core Clues (0 Stars - Premature Accusation)**: Husband delivers confident gaslighting excuses (*"chối bay chối biến"*). Increments suspicion by **+1 strike** in normal levels (or triggers a safe, zero-penalty instructional retry in Level 0) and lets the player continue investigating.
  2. **1-2 Core Clues (1-2 Stars - Partial Conviction)**: Husband stammers defensive excuses. Player can choose `[Tha thứ & Qua màn]` or `[Điều tra tiếp để đạt 3 sao]`.
  3. **3 Core Clues (3 Stars - Full Conviction)**: Husband confesses completely. Awards 3 stars, custom Wife Title, comedic roast summary, `[Tạo thẻ Roast khoe MXH]` (vertical `9:16` social card), and `[Tha thứ & Qua màn]`.

---

## 3. Declarative State Contract

```typescript
export interface PinnedEvidenceItem {
  evidenceId: string;
  sourceAppId: string;
  title: string;
  snippetPreview: string;
  fullDetails?: string;
  timestamp: string;
  linkedSuspectId?: string; // ID of linked suspect, or undefined if unlinked
  isSmokingGun: boolean;    // Evaluated only by game engine, never shown to user
}

export interface TaggedSuspectItem {
  suspectId: string;
  displayName: string;
  avatarUrl?: string;
  sourceAppId: string;
  notesText?: string;
  linkedEvidenceIds: string[]; // List of evidence IDs attached to this suspect
  addedTimestamp: string;
}

export interface WifeNotebookState {
  isOpen: boolean;
  activeTab: 'dossier' | 'verdict';
  suspects: TaggedSuspectItem[];
  evidence: PinnedEvidenceItem[];
  selectedVerdict?: 'innocent' | 'cheating' | 'sugar_relationship';
  accusedSuspectId?: string;
}
```
