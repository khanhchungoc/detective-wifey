---
type: Requirement Story
epic: "Epic 04: Level 0 Tutorial & Husband Thịnh Level 1 Case Content (Release 1)"
status: draft
description: "A dedicated introductory case dataset, dependent on separately approved narrative and clue design."
tags: [requirement, user-story, tutorial, level-0, case-content]
timestamp: "2026-10-21"
---

# US-034 - Level 0 Practice Case Content

### Epic: [Level 0 Tutorial & Level 1 Case Content](./epic.md)

As a Player, I want a dedicated practice investigation that supports the introductory lessons and an independent final deduction.

### Canonical Wireframe Reference

Use the approved shared revision-2 flows: [entry](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-level-0-entry.md), [collection](../epic-02-investigation-suspicion-mechanics/wireframes/wireframe-level-0-evidence-coaching.md), [notebook and completion](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-level-0-deduction-completion.md), and [Sixth Sense](../epic-02-investigation-suspicion-mechanics/wireframes/wireframe-sixth-sense.md). These specify teaching behavior, not case facts. HTML previews are not included.

### Acceptance Criteria

1. Level 0 uses a separate declarative case dataset derived from an explicitly approved level-design specification. It does not overwrite Level 1 content or require case-specific logic inside app views.
2. The authored case contains inspectable narrative information for the first hold-and-pin lesson, a guided first notebook connection, and a distinct final connection the player can deduce independently.
3. The intended lesson route leaves a required clue uncollected when Sixth Sense is introduced, allowing a real app-level hint. Early independent collection remains valid; use the approved notebook-reminder fallback without removing findings or inventing another clue.
4. App provisioning, displayed information, entity references, clue order and ground truth agree with the approved case design. All required clues are reachable through the case's configured apps and existing investigation interactions; puzzle locks are not required by this introductory scope.
5. The case's confrontation feedback supports unsuccessful attempts and a successful final deduction. Feedback never exposes the final connection before the player solves it, and the dataset supports Level 0's safe-retry rules.
6. Narrative text, clue mappings and case dialogue come only from the separately approved design. Neutral SVG teaching illustrations are instructional assets, not evidence or additional case facts. Do not assign a cast, app count or clue count through this story.
7. Missing or invalid required case data must not open a misleadingly playable or automatically completed tutorial. Use US-031's “Chưa mở được.” with “Thử lại” or “Vào Màn 1”; preserve normal-case progress.

### Out of Scope

Authoring or approving the narrative in this delivery, generating avatars or case artwork, and implementing tutorial or hint mechanisms.

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Consistency and privacy | Validate required references against the approved case design; bundle data locally under existing platform constraints without accounts or runtime external services. |
| Content clarity | Keep player-facing content Vietnamese and suitable for the existing audience. Instructional visuals must not act as spoiler markers on live evidence. |

### Dependencies

[Case schema](../epic-01-virtual-phone-app-ecosystem/us-001-declarative-case-content-schema-engine.md) and a separately approved Level 0 narrative/clue specification from the level-design review.

### Open Questions

| ID | Question | Impact |
|---|---|---|
| Q001 | What approved narrative, cast, apps, clue set and ground truth will populate Level 0? | Accepted deferral. Case implementation, concrete content verification and delivery sizing await the separate level-design review. |

### Citations

[Signed-off discovery and accepted content deferral](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md).
