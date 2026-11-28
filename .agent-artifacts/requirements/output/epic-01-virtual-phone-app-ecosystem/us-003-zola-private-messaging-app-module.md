---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Zola private messaging application module supporting chat inbox, conversations, cloud document backup, disguised contacts, and universal evidence pinning."
tags: [requirement, user-story, zola, messaging, forensic-clues]
timestamp: "2026-10-15T10:30:00+07:00"
---

# US-003 - Zola Private Messaging App Module

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to browse Zola chat threads, inspect disguised contact profiles, view cloud backup documents, and verify location cards.

---

### Screen / UI Specification References

* [Zola Private Messaging ASCII Wireframe](./wireframes/wireframe-zola-messaging.md)
* [Internet Messaging App Design System](../../../project-knowledge-base/solution-context/apps/internet-messaging/app-design.md)

---

### Acceptance Criteria

#### AC01: Zola App Mounting & System Header
1. The app mounts inside the virtual phone shell when the player taps the Zola launcher icon or in-shell notification toast.
2. The top app header renders with Electric Blue background (`#0088FF`), white status bar clock (*9:28*) and battery metrics (*69%*), a search bar placeholder (*"Tìm kiếm"*), and icons for QR scanner and quick-add actions.
3. The bottom navigation bar renders 5 tabs: *Tin nhắn* (Messages - active tab), *Danh bạ* (Contacts), *Khám phá* (Discover), *Nhật ký* (Timeline), and *Cá nhân* (My Profile).

#### AC02: Chat Inbox & Disguised Contact Listing
1. The main chat feed displays conversation rows with contact avatar, contact display name, last message snippet, timestamp, unread badge counter, and pin glyphs.
2. Tapping the segmented sub-header switches between the *"Ưu tiên"* (Priority) and *"Khác"* (Others) conversation filter tabs.
3. Chat rows include disguised affair contacts (e.g., *"Anh Tuấn Thợ Điện"*) alongside benign everyday family and workplace group clutter.
4. Long-pressing ($\ge 450\text{ms}$) on any chat row summons the universal evidence action sheet, allowing the player to pin either the suspect contact or message thread into the Wife's Detective Notebook without visual spoiler giveaways.

#### AC03: Chat Thread & Forensic Clues
1. Tapping an individual chat row opens the conversation thread view (`ZolaChatThreadView`) with header back button, contact name, activity status, and action controls.
2. An in-chat system alert displays the 24-hour auto-delete notice (*"Tin nhắn tự xoá sau 24 giờ đã được bật"*) indicating disappearing messages (`CLUE-ZOLA-03`).
3. The dialogue feed displays alternating message bubbles (incoming white bubbles `#FFFFFF` and outgoing blue bubbles `#D2F4FF`) with timestamps and read receipts. Voice memos are explicitly omitted.
4. Tapping or long-pressing an interactive location pin card displays hotel location metadata (`CLUE-ZOLA-04`) contradicting the husband's stated travel alibi.
5. Long-pressing ($\ge 450\text{ms}$) on any individual message bubble summons the universal evidence action sheet to copy the clue text directly into the Wife's Detective Notebook.

#### AC04: Contacts Directory & Disguised Alias Traceability
1. Tapping the *Danh bạ* tab opens the contacts directory (`ZolaContactsView`) organized alphabetically with search input and friend request counters.
2. Contact cards display contact names, corporate department tags (e.g., *"Phòng Marketing Technosoft"*), and phone numbers (`0988.456.234`), providing cross-app forensic evidence matching bank transfer counterparty accounts.

#### AC05: Lightweight Profile & Cloud Document Vault
1. Tapping the *Cá nhân* tab opens the lightweight user profile view (`ZolaProfileView`) showing the husband's profile name (*"Nguyễn Huy Thịnh"*), user handle, and settings items.
2. Tapping *"Cloud của tôi (My Documents)"* opens the cloud backup document drawer (`ZolaCloudDocDrawer`) listing backed-up lease agreements and rental deposit receipts (`CLUE-ZOLA-07`).
3. The player can pin individual cloud documents directly into the Wife's Detective Notebook via the document item action button.

---

### Open Questions

| Question ID | Topic | Question | Owner | Status |
|---|---|---|---|---|
| Q-US003-01 | Hidden Chat PIN | PIN-protected hidden chat search filter activation across levels | Dev Lead | Closed (Flagged as TBC / deferred to Level 2/3) |

