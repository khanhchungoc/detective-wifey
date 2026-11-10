---
type: Requirement Epic
status: draft
description: "Universal zero-spoiler long-press evidence & suspect pinning, polymorphic PIN pad & security question unlocks, suspicion meter escalation, caught-snooping fail state, and Giác Quan Thứ 6 hint engine."
tags: [requirement, epic, suspicion-engine, clue-pinning, puzzle-locks, hint-system]
timestamp: "2026-10-15T09:33:00+07:00"
---

# Epic 02: Clue Inspection, Puzzle Unlocks, Hints & Suspicion Engine

## Summary

The Clue Inspection, Puzzle Unlocks, Hints & Suspicion Engine establishes the interactive detective mechanics for *Bắt được Tiểu tam* (Jealous Wife Detective Game). It empowers players to inspect and collect evidence without giveaway UI tells, solve polymorphic security challenges (4-digit PIN pads and security questions on Levels 2 and 3), navigate husband suspicion escalation and lockout delays, recover from caught-snooping fail states, and trigger the "Giác Quan Thứ 6" (Sixth Sense) app-badging hint engine when stuck.

## Business Value

- Delivers the core tactile detective mechanics (zero-spoiler long-press pinning) that empower players to actively curate evidence rather than passively read text.
- Introduces progressive puzzle friction (PIN pads and security questions) on Levels 2 and 3 to reward cross-app clue deduction.
- Implements dynamic tension through escalating suspicion strikes and skippable lockout delays, culminating in a comedic "Bị giật lại máy" fail state.
- Provides a frictionless hint mechanism ("Giác Quan Thứ 6") to prevent player drop-off without giving away immediate answers.

## High-Level Requirements

- Universal 380ms hold on story narrative opens the dark contextual `UniversalEvidenceModal` with one Vietnamese pin/unpin action (`"Ghim vào Sổ tay"` / `"Bỏ ghim khỏi Sổ tay"`), syncing a red circular bookmark badge (`IoBookmark`) exclusively on player-pinned items across all apps. Structural chrome is excluded. This follows the signed-off 2026-10-20 / 2026-11-10 pinning rules rather than the older dual-action sheet.
- Decoy/Noise Tolerance: Pinning action available on all items (including benign clutter) with zero visual highlights or UI spoiler tells prior to interaction.
- Polymorphic App Lock Decorator Component supporting 4-digit numeric PIN pads and text/select security questions for locked apps/folders on Levels 2 and 3.
- Suspicion Strike Engine tracking failed unlock attempts against level-specific limits (Level 1: 5 strikes, Level 2: 4 strikes, Level 3: 3 strikes) with skippable ~60s lockout timer animation.
- "Bị giật lại máy" Caught-Snooping Fail Screen triggered upon exceeding strike thresholds, featuring comedic roast dialogue and immediate level retry routing.
- "Giác Quan Thứ 6" (Sixth Sense) trigger inside the notebook resolves the next uncollected clue and badges/pulses its home screen app icon. When all required clues are collected, provide a general notebook reminder without revealing the correct connection.
- Level 0 coaching guides the first inspection, long-press and pin actions using existing app surfaces. It does not distinguish true clues from decoys or create permanent pin buttons.
- Dynamic Island status toast notifications confirming evidence/suspect pinning events without obstructing gameplay.

## Business Outcome

Players experience engaging, high-stakes snooping gameplay with zero giveaway spoilers. The difficulty naturally scales across levels through lock challenges and tightening suspicion thresholds, while hint mechanics guarantee casual players never get permanently stuck.

## Business Rules

- **Zero-Spoiler Uniformity**: No visual affordances (glowing borders, badges, or custom cursors) may reveal which items are valid clues prior to user interaction.
- **Level-Based Suspicion Limits**: Level 1 permits 5 strikes; Level 2 permits 4 strikes; Level 3 permits 3 strikes.
- **Lockout Timing**: Failed unlock attempts trigger a 60-second lockout timer, which casual players may skip to maintain engagement.
- **Non-Punitive Fail State**: Case fail state ("Bị giật lại máy") permits instant, zero-penalty retry of the active case.
- **Hint Cooldown**: "Giác Quan Thứ 6" is free with a 30-second cooldown in every level, including Level 0.
- **Level 0 Safe Practice**: Explain mistakes and allow retries without losing the tutorial case. Normal-case suspicion rules remain applicable outside Level 0.

## Dependencies

- **Upstream**: Epic 01 Virtual Phone Shell ([`epic-01-virtual-phone-app-ecosystem`](../epic-01-virtual-phone-app-ecosystem/epic.md)), Declarative Case Config Schema ([`us-001`](../epic-01-virtual-phone-app-ecosystem/us-001-declarative-case-content-schema-engine.md)), App Shell Container ([`us-002`](../epic-01-virtual-phone-app-ecosystem/us-002-virtual-phone-shell-container-8-app-home-grid.md)), Signed-off elicitation session ([`2026-10-13-jealous-wife-detective-game.md`](../elicitation/2026-10-13-jealous-wife-detective-game.md)), Vision & Scope ([`vision-scope.md`](../vision-scope.md)), Functional Decomposition ([`functional-decomposition.md`](../functional-decomposition.md)).
- **Downstream**: Wife's Detective Notebook & Confrontation Hub (Epic 03 - [`epic-03-wife-notebook-verdict-social-sharing`](../epic-03-wife-notebook-verdict-social-sharing/epic.md)).

## User Stories

* [US-011 - Zero-Spoiler Universal Long-Press Clue & Suspect Pinning ("Ghim Bằng Chứng & Nghi Phạm")](us-011-zero-spoiler-universal-long-press-clue-suspect-pinning.md) - *Status: drafted*
* [US-012 - Polymorphic PIN Pad & Security Question App Unlocks](us-012-polymorphic-pin-pad-security-question-app-unlocks.md) - *Status: planned*
* [US-013 - Suspicion Meter Escalation & Lockout Animation](us-013-suspicion-meter-escalation-lockout-animation.md) - *Status: planned*
* [US-014 - Caught-Snooping Fail State & Case Retry ("Bị giật lại máy")](us-014-caught-snooping-fail-state-case-retry.md) - *Status: planned*
* [US-022 - "Giác Quan Thứ 6" (Sixth Sense) App-Badging Hint Engine](us-022-giac-quan-thu-6-sixth-sense-app-badging-hint-engine.md) - *Status: draft; revision-2 ASCII approved*.
* [US-032 - Level 0 Guided Evidence Collection](us-032-level-0-guided-evidence-collection.md) - *Status: draft; revision-2 ASCII approved*.

## GUI Specifications

* None recorded yet. Standalone GUI specifications are bypassed in favor of canonical ASCII wireframes.

## Wireframes

* [`wireframe-us-011-universal-evidence-modal.md`](./wireframes/wireframe-us-011-universal-evidence-modal.md) - Universal Evidence Dark Context Menu, Red Pinned Marker & Quick Unpin (*Status: signed-off, revision 2*)
* [Giác quan thứ 6](wireframes/wireframe-sixth-sense.md) - *Status: signed-off, revision 2*.
* [Màn 0: tập xem và ghim thông tin](wireframes/wireframe-level-0-evidence-coaching.md) - *Status: signed-off, revision 2*.

## Diagrams

* None currently required.

## Open Questions

* None. Scope and UX parameters verified against canonical project knowledge.

## Citations

* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
* [Clue Ideas Inventory](../../stories/clues/clue-ideas-inventory.md)
* [Universal Design System](../../../project-knowledge-base/solution-context/design-system/design.md)
* [Level 0 Tutorial & Sixth Sense Discovery](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md)
* [Signed-off 380ms Pinning & Automatic Confrontation](../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md)

