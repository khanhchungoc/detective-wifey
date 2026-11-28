---
status: signed-off
artifact_type: elicitation_session
elicitation_status: COMPLETE
created_at: "2026-10-21T09:28:44+07:00"
updated_at: "2026-10-21T09:32:20+07:00"
topic: "us-030-zola-group-chat"
---

# US-030 - Zola Group Chat & Multi-Participant Thread Module - Elicitation Session

## Purpose & Scope

### Objective
Provide players with an authentic, interactive group chat experience within the Zola messaging app to inspect multi-participant dialogues, uncover subtle affair clues and alibi contradictions, and pin suspects or evidence into the Wife's Detective Notebook.

### Boundary
| Area | Current Position | Status |
|---|---|---|
| MVP | Group conversation feed with multi-participant bubbles, contact names in identity colors (avatars omitted from chat feed), reaction badges, and long-press clue/suspect pinning. | Confirmed |
| In Scope | Dual-purpose group threads (benign mundane clutter and clue-bearing threads), alternating bubble colors, floating timestamp pills, mascot sticker rendering, long-press clue pinning on message bubbles, long-press suspect pinning on participant contact names. | Confirmed |
| Out of Scope | Interactive Group Info / Member List drawer (deferred to future enhancement); individual participant avatars in conversation feed (contact names shown only); composing and sending messages (investigation is read-only inspection); audio memo playback; member invitation/removal. | Confirmed |

## PACT Baseline

### People
| Persona / Role | Commercial Model | Demographics & Literacy | Devices & Hardware | Ergonomics & Preferences | Accessibility & Constraints | Jobs To Be Done (JTBD) & Pain Points | Status |
|---|---|---|---|---|---|---|---|
| Player (Jealous Wife) | B2C (Casual Detective Gamer) | Casual smartphone user; reads Vietnamese domestic comedy/drama tropes | Mobile portrait viewport (393px × 852px base) | Single-handed touch navigation; clear visual contrast; tap and long-press gestures | High text readability; tap targets $\ge 44 \times 44\text{px}$; distinct color contrast for sender names | Inspect husband's group chats to verify alibis, find inconsistencies, and identify suspicious collaborators without text fatigue | Confirmed |
| Husband (Nguyễn Huy Thịnh) | Game Character / Target | Tech worker / corporate employee | Simulated iOS smartphone shell | N/A | N/A | Conceal illicit activities amidst everyday work and family group chats | Confirmed |

### Activities
- Navigating from Zola inbox by tapping a group chat row (e.g., *"Alpha Team BA & Dev"*, *"Hội Bỉm Sữa Cầu Giấy"*).
- Reading conversation history across multiple participants with chronological date/time divider pills.
- Long-pressing ($\ge 450\text{ms}$) on an incriminating message to pin it as evidence in the Wife's Detective Notebook.
- Long-pressing ($\ge 450\text{ms}$) on a participant's contact name banner to pin the contact as a suspect.
- Returning to inbox via header back navigation.

### Context
- Domestic espionage game setting (*Bắt được Tiểu tam*).
- Parody representation of Vietnam's leading chat platform (Zalo).
- Balances humorous everyday chatter (clutter) with sharp investigative tension.

### Technologies
- TypeScript / Preact client-side reactive components.
- Statically loaded declarative case schemas (`CaseConfig`, `ChatThread`).
- Mobile portrait viewport container (393px × 852px) inside virtual phone shell.

## Rules & Data

### Rules
| Status | Rule |
|---|---|
| Confirmed | **Multi-Participant Sender Styling**: Each participant's name must render in a distinct identity color (e.g., Participant 1 Amber `#B45309`, Participant 2 Emerald `#007A5A`) above their message bubble. |
| Confirmed | **Universal Clue Pinning**: Long-pressing ($\ge 450\text{ms}$) on any message bubble opens the universal evidence pinning sheet to record text evidence into the Detective Notebook without spoilers. |
| Confirmed | **Suspect Pinning from Avatars**: Long-pressing ($\ge 450\text{ms}$) on a participant's avatar or name opens the suspect action sheet to add the individual to the Suspects roster. |
| Confirmed | **Read-Only Inspection**: In-app input bar serves as an authentic visual mock (`Nhập tin nhắn...`) but does not accept user typing, preserving detective narrative integrity. |

### Data
| Area | Detail | Status |
|---|---|---|
| Inputs / Outputs | Group metadata (ID, title, avatar composite, participant list), message list (senderId, text, timestamp, reactions, isClue, clueId). | Confirmed |
| Source of Truth | Level declarative case schemas (`src/data/cases/` or declarative story JSON). | Confirmed |
| Lifecycle / Audit | Ephemeral in-memory chat state; discovered clues and suspects persist in local game storage via `CaseState`. | Confirmed |

## Decisions & Constraints

| Type | Item | Rationale / Impact | Owner / Status |
|---|---|---|---|
| Decision | Dual-purpose group role | Group chats contain both mundane clutter (family/work banter) and forensic clues to simulate realistic smartphone exploration. | Confirmed by User |
| Decision | Defer Group Info screen | Group conversation feed provides full investigative value; group settings/member list drawer is deferred to reduce scope. | Confirmed by User |
| Decision | Contact names only (avatars omitted) | Individual participant avatars are omitted from conversation bubbles to show contact names only, maximizing message text area and streamlining layout. | Confirmed by User |
| Decision | Dual pinning (message + contact name) | Players can collect statement clues from message bubbles and suspect identities from contact name banners directly within the group conversation. | Confirmed by User |

## Open Questions (Parking Lot)

| ID | Area | Question | Needed From | Status / Notes |
|---|---|---|---|---|
| - | - | None. All material scope questions resolved. | - | Closed |

## Referenced Documents

- [Zola App Design & UI/UX Specification](file:///c:/Users/KhanhChuNgoc/Documents/Personal%20Projects/Detective/.agent-artifacts/project-knowledge-base/solution-context/apps/internet-messaging/app-design.md)
- [Zola Functional Features & Clue Integration](file:///c:/Users/KhanhChuNgoc/Documents/Personal%20Projects/Detective/.agent-artifacts/project-knowledge-base/solution-context/apps/internet-messaging/features.md)
- [Zola Canonical ASCII Wireframe Specification](file:///c:/Users/KhanhChuNgoc/Documents/Personal%20Projects/Detective/.agent-artifacts/project-knowledge-base/solution-context/apps/internet-messaging/wireframe.md)
- [Epic 01: Virtual Phone Shell & MVP Parody App Suite](file:///c:/Users/KhanhChuNgoc/Documents/Personal%20Projects/Detective/.agent-artifacts/requirements/output/epic-01-virtual-phone-app-ecosystem/epic.md)

## Next Step
Proceed to manage-requirement-artifacts and generate-wireframe to update functional decomposition, update Epic 01, author structured ASCII wireframe (`wireframe-us-030-zola-group-chat.md`), obtain user signoff, and author user story US-030.

