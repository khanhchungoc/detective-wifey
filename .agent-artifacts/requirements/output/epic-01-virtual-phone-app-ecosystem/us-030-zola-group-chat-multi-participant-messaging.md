---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Zola group chat conversation thread module supporting multi-participant dialogue inspection, color-coded contact name styling (avatars omitted from feed), mascot stickers, reactions, and universal clue and suspect pinning."
tags: [requirement, user-story, zola, messaging, group-chat, forensic-clues]
timestamp: "2026-10-21T09:34:00+07:00"
---

# US-030 - Zola Group Chat & Multi-Participant Thread Module

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to open and inspect group chat threads in Zola to examine multi-participant conversations displaying contact names without avatars, detect suspicious interactions or alibi contradictions, and pin incriminating messages or suspects into my Detective Notebook.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [`wireframe-us-030-zola-group-chat.md`](./wireframes/wireframe-us-030-zola-group-chat.md)
- **Parent Application Design**: [Zola App Design & UI/UX Specification](../../../project-knowledge-base/solution-context/apps/internet-messaging/app-design.md)

---

### Acceptance Criteria

#### AC01: Entry Route & Group Thread Header
1. Tapping any group chat item in the Zola inbox (e.g., *"Alpha Team BA & Dev"*, *"Hội Bỉm Sữa Cầu Giấy"*) transitions the viewport to the group chat thread view within 100ms without full screen reload.
2. The group header displays an Electric Blue background (`#0088FF`), back navigation button (`<`), group composite avatar, group title in 16px bold white text, member count subtitle (*"Bấm để xem thông tin (8 thành viên)"*), and action shortcuts (`[+User]`, `[Search]`, `[Menu]`).
3. Tapping the back button returns the player to the Zola inbox, preserving the previous scroll offset.
4. Tapping the group subtitle, `[+User]`, `[Search]`, or `[Menu]` displays a brief, non-blocking toast (*"Tính năng đang hoàn thiện"*) without causing errors or navigating away.

#### AC02: Multi-Participant Message Feed & Visual Styling
1. The conversation canvas renders with a subtle gray-blue background (`#E5EBF0`), alternating incoming participant bubbles and outgoing husband bubbles.
2. Incoming participant message bubbles render with white background (`#FFFFFF`), rounded borders, sender display name displayed at the top of the bubble styled with their assigned unique identity color token (e.g. Amber `#B45309`, Emerald `#007A5A`, Orange `#D97706`), message text, and timestamp. Individual participant profile avatars are omitted from the conversation feed.
3. Outgoing messages from husband Nguyễn Huy Thịnh render aligned to the right with light blue background (`#D2F4FF`), message text, timestamp, and read receipt indicator (`[Read]`).
4. Chronological date divider capsules render centered with background `#B4B9BF` and 11px white text (e.g. `[ 10:56 ]`, `[ 13:14 13/10/2026 ]`).
5. Parody mascot stickers (Ami Fat Cat) render centered within the conversation timeline as configured by the level case schema.
6. Message bubbles support floating reaction badges attached to the bottom-right corner displaying reaction glyphs and counters (e.g., `[Like: 1]`, `[Laugh: 1]`, `[Surp: 2]`).

#### AC03: Universal Clue Pinning from Group Messages
1. Long-pressing for at least 450ms on any incoming or outgoing message bubble triggers a 15ms haptic pulse and opens the `UniversalEvidenceModal` without visual spoiler hints.
2. The evidence modal displays the captured message snippet, sender name, and group context label.
3. Confirming the evidence action pins the text statement as a clue card into the Wife's Detective Notebook and increments the session clue counter.

#### AC04: Universal Suspect Pinning from Participant Contact Names
1. Long-pressing for at least 450ms on any participant's contact name banner at the top of an incoming message bubble triggers a 15ms haptic pulse and opens the `UniversalEvidenceModal` in Suspect mode.
2. The suspect modal displays the participant's display name and inferred group role.
3. Confirming the suspect action pins the contact into the Suspects roster in the Wife's Detective Notebook.

#### AC05: Read-Only Input Simulation
1. The bottom bar renders a static mock input field with placeholder *"Nhập tin nhắn..."* along with mock action icons for stickers, voice recording, photo attachments, and send.
2. Tapping the mock input field or action icons does not open the virtual keyboard or send messages, maintaining read-only detective inspection integrity.

---

### Out of Scope

| OOS ID | Description |
|---|---|
| OOS01 | Interactive Group Info / Member List settings screen (deferred to future enhancement). |
| OOS02 | Player-authored chat messages, editing, or deleting messages. |
| OOS03 | Voice note audio playback. |
| OOS04 | Adding or removing group members. |
| OOS05 | Individual participant avatars in the conversation thread feed (contact names shown only). |

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Latency SLA | Thread opening and back navigation transitions complete in under 100ms on the client. |
| Memory & Lifecycle | Thread unmounts cleanly on navigate-back with zero leaked event listeners or DOM retention. |
| Touch Ergonomics | Minimum touch target size $\ge 44 \times 44\text{px}$ for header back button and action triggers. |
| Color Contrast | Sender names maintain accessible contrast ratio $\ge 4.5:1$ against bubble background. |

---

### Open Questions

| Question ID | Question | Impact |
|---|---|---|
| - | None. Scope, layout, and forensic interaction parameters verified against canonical project knowledge. | N/A |

