---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Optional first-play tutorial entry, skipping and replay without losing normal-case progress."
tags: [requirement, user-story, tutorial, level-0, navigation]
timestamp: "2026-10-21"
---

# US-031 - Level 0 Entry, Skip & Replay

### Epic: [Virtual Phone Shell & MVP Parody App Suite](./epic.md)

As a Player, I want to choose whether to start, skip, or replay the introductory case.

### Canonical Wireframe Reference

- [Approved ASCII wireframe, revision 2](./wireframes/wireframe-level-0-entry.md).
- HTML preview is not included in this delivery.

### Acceptance Criteria

1. On first play, the Level Selector Hub ([US-036](./us-036-husband-carousel-level-selector-hub.md)) highlights Level 0 with a "Đề xuất" badge alongside unlocked Level 1. Starting Level 0 opens the practice case; choosing Level 1 directly skips Level 0 without marking the tutorial complete.
2. When entering Level 0, the intro/briefing uses the illustrated inspect, pin and connect sequence with "Xem. Ghim. Nối." and "Tập điều tra, không lo thua." It runs once without delaying either action.
3. The device remembers the player's choice and removes the first-play "Đề xuất" highlight after starting, skipping, or completing Level 0. The Level Selector Hub ([US-036](./us-036-husband-carousel-level-selector-hub.md)) always provides Level 0 access and distinguishes "Chưa học", "Đã bỏ qua" and "Đã hoàn thành".
4. Replaying starts a fresh practice run. Practice cards, connections and results remain separate from normal cases; replay preserves normal-case progress and any previous tutorial-completion record. Resuming an unfinished practice run is not offered.
5. Starting a replay during another investigation asks “Tập lại từ đầu?” and states “Tiến độ màn chính được giữ.” “Chơi lại” opens a fresh practice run; “Ở lại” preserves the current investigation.
6. Opening shows “Đang mở...” and prevents repeated start requests. Failure shows “Chưa mở được.” with “Thử lại” and “Vào Màn 1”, preserving existing progress and leaving completion unchanged.
7. Skipping from a lesson follows the same route to Level 1. Only the completion outcome defined in US-033 records a newly completed tutorial; entering or watching it does not.

### Out of Scope

New game menus, mid-tutorial resume, case narrative, and changes to normal-level unlock rules.

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Accessible visual teaching | Use the approved SVG icons and neutral illustrations; reduced motion shows three static stages. Controls retain accessible names and existing touch-target standards. |
| Progress protection | Store tutorial choices locally without overwriting normal-case dossiers, scores or unlocks. |

### Dependencies

[Case schema](./us-001-declarative-case-content-schema-engine.md), [phone shell](./us-002-virtual-phone-shell-container-8-app-home-grid.md), and [Level 0 content](../epic-04-detective-case-stories-level-content/us-034-level-0-practice-case-content.md).

### Open Questions

None for this behavior. The separately reviewed Level 0 content remains a delivery dependency.

### Citations

[Signed-off discovery and revision-2 approval](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md).
