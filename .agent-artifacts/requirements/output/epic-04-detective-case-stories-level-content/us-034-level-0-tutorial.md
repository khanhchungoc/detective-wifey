---
type: Requirement Story
epic: "Epic 04: Level 0 Tutorial & Husband Thịnh Level 1 Case Content (Release 1)"
status: draft
description: "Streamlined Level 0 tutorial case for Husband Thịnh using 3 existing apps (Phone, Zola, Photos) and a step-by-step popup guide."
tags: [requirement, user-story, tutorial, level-0, popup-guide]
timestamp: "2026-11-28"
---

# US-034 - Level 0 Tutorial: Bữa cà phê tăng ca (Popup Guide)

### Epic: [Level 0 Tutorial & Level 1 Case Content](./epic.md)

As a Player, I want a short, easy introductory tutorial level with step-by-step popup guidance using only existing phone apps.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [wireframe-level-0-tutorial-popup-guide.md](./wireframes/wireframe-level-0-tutorial-popup-guide.md) (Phase 1 - awaiting user signoff)
- **Level Design Story SSOT**: [husband-profile.md](../../stories/husband-01/husband-profile.md), [level-00-storyboard.md](../../stories/husband-01/level-00-storyboard.md), [level-00.md](../../stories/husband-01/level-00.md), [level-00-phone-data.md](../../stories/husband-01/level-00-phone-data.md)

---

### Acceptance Criteria

1. **Entry, Skip & Replay**: On first play, the Level Selector Hub ([US-036](../epic-01-virtual-phone-app-ecosystem/us-036-husband-carousel-level-selector-hub.md)) displays Level 0 ("Màn 0: Bữa cà phê tăng ca") with a `"Đề xuất"` badge alongside unlocked Level 1. Players can start Level 0, skip directly to Level 1 without marking Level 0 complete, or replay Level 0 anytime as a fresh run without affecting normal-case progress.
2. **Mid-Case Replay Guard**: Starting a Level 0 replay while another case is active prompts `"Tập lại từ đầu?"` with `"Tiến độ màn chính được giữ."`, offering `"Chơi lại"` (starts fresh Level 0) and `"Ở lại"` (keeps current case).
3. **Existing Apps Only & Zero Locks**: Level 0 runs as a declarative case dataset (`src/data/cases/husband_01/level_00/`) with zero puzzle locks (`lockChallenges: []`). Only 3 existing implemented apps are active: `internet-messaging` (Zola), `phone` (Điện thoại), and `photos` (Thư viện ảnh). The remaining 9 apps are listed in `grayedOutAppIds` and cannot be opened.
4. **Opening Goal Popup & Notification Hook**: Immediately upon entering Level 0 (`22:15`, `54%`, `5G`), an opening popup explains the game's core objective (inspect the husband's phone, pin evidence, connect clues in the notebook, and confront him to expose the truth). After dismissing it (`"Bắt đầu"`), two seconds later a single zero-spoiler notification toast (`toast_001`) appears from `internet-messaging`: `"Tùng Gara: Áo khoác anh để quên em cất rồi, mai rảnh em gửi lại nhé."`
5. **Step-by-Step Popup Guide (7 Steps)**: Level 0 displays a compact popup guide modal/card with short Vietnamese instructions, a primary `"Đã hiểu"` (or `"Bắt đầu"` on Step 1) button, and a secondary `"Bỏ qua hướng dẫn"` button (all controls >= 44x44px, using Ionicons SVGs with zero emojis):
   - **Step 1 (Start of Level 0 - Game Goal)**: Explains the overall goal of the game: inspect phone apps, pin suspicious details, connect related evidence in the notebook, and confront the husband to catch his lie.
   - **Step 2 (Home Screen after `toast_001`)**: Prompts opening **Tin nhắn (Zola)** to inspect the message from `"Tùng Gara"`.
   - **Step 3 (Inside Zola thread)**: Explains long-pressing a message bubble (~380ms) to open the shared evidence modal and tapping **Ghim** to save it to the notebook.
   - **Step 4 (After first pin)**: Prompts opening **Điện thoại** to inspect the `"Tùng Gara"` contact card (`0933112244`, note `"Lê Ngọc Vy - 45 Nguyễn Khang"`) and pinning it.
   - **Step 5 (Inside Notebook - Guided Link then Independent Final Link)**:
     - **5a**: Explains selecting two related cards and drawing a connection line to unmask `"Tùng Gara"` (`edge_l0_alias_identity`).
     - **5b**: Congratulates the player and prompts finding and connecting the final contradiction independently (checking the 20:10 alibi message to **Vợ** and the 20:25 photo in **Thư viện ảnh** -> `edge_l0_alibi_photo`), then tapping **Đối chất**.
   - **Step 6 (On Entering Confrontation - How to Win & Star Rating)**: Explains how to win confrontation (pick the argument backed by your connected evidence to break the husband's excuses) and how stars (1 to 3 stars) are earned from Level 1 onward (1 star: partial proof / weak win, 2 stars: convincing proof, 3 stars: all required smoking-gun connections verified; wrong or unsupported accusations cost a suspicion strike in normal levels, while Level 0 allows safe retries).
6. **Real Action Progression & Skip Behavior**: Dismissing a popup lets the player perform the action freely; the next popup triggers only after the corresponding real action succeeds (never auto-pinning or auto-connecting). Tapping `"Bỏ qua hướng dẫn"` hides remaining coaching popups for the current run while letting the player finish Level 0 normally.
7. **Safe Tutorial Confrontation**: Confrontation uses the existing scripted beat-by-beat evaluation (`confrontation.json`) with 2 required edges (`edge_l0_alias_identity`, `edge_l0_alibi_photo`). Premature confrontation or accusing the innocent red herring (`"Chị Hằng In Ấn"`) displays contextual feedback (`"Chứng cứ chưa đủ."` or the roast line) and returns the player to investigate without causing case loss or deleting pinned cards/connections.
8. **Completion Popup (Step 7)**: Completing the confrontation with both required edges marks Level 0 complete locally and opens the completion popup `"XONG MÀN 0!"`, summarizing normal-level rules (`"Màn 1 trở đi: cáo buộc sai sẽ bị trừ lượt nghi ngờ; nối đủ bằng chứng chốt để đạt 3 sao."`) with two actions: `"Vào Màn 1"` and `"Chơi lại Màn 0"`.
9. **Error Handling**: If Level 0 case data fails to load, display `"Chưa mở được."` with `"Thử lại"` and `"Vào Màn 1"`, preserving all normal-case progress and completion flags.

---

### Out of Scope

| OOS ID | Description |
|--------|-------------|
| OOS01 | Sixth Sense hint engine (`US-022`), which is not yet implemented on `stg`. |
| OOS02 | Puzzle locks (`lockChallenges`), banking/ecommerce/SMS apps, and mid-tutorial session resume. |
| OOS03 | Generating new photo artwork (`photo_l0_001`) before story approval (handled in level-designer Step 7). |

---

### Non-functional Requirements

| Requirement | Description |
|-------------|-------------|
| Touch & Accessibility | Popup guide buttons meet >= 44x44px touch targets, use Ionicons SVGs (Zero-Emoji Policy), support keyboard/screen-reader focus, and respect `prefers-reduced-motion`. |
| Progress Isolation | Level 0 practice cards, connections, and completion status are stored separately from normal-case dossiers and never overwrite Level 1 progress. |
| Zero Hardcoded App Logic | Level 0 case data uses existing app views (`internet-messaging`, `phone`, `photos`) purely via declarative case JSON. |

---

### Open Questions

| Question ID | Question | Impact |
|-------------|----------|--------|
| Q01 | Approve the Level 0 story (`level-00-storyboard.md`, `level-00.md`, `level-00-phone-data.md`) and Phase 1 ASCII wireframe (`wireframe-level-0-tutorial-popup-guide.md`) before generating `photo_l0_001` artwork and implementing `level_00/` JSON? | Approved on 2026-11-28; cleared for implementation. |
