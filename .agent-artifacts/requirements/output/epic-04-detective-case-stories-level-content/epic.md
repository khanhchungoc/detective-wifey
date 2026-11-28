---
type: Requirement Epic
status: draft
description: "Release 1 case content for the optional Level 0 tutorial and Husband Thịnh Level 1, with separately approved narrative and clue designs."
tags: [requirement, epic, case-stories, level-content, narrative-integration, declarative-cases]
timestamp: "2026-10-15T09:48:00+07:00"
---

# Epic 04: Level 0 Tutorial & Husband Thịnh Level 1 Case Content (Release 1)

## Summary

This epic governs **Release 1 (MVP)** declarative content for the optional Level 0 practice case and Husband Thịnh Level 1. Existing Level 1 scope still translates `requirements/stories/husband-01/level-01.md` into `src/data/cases/husband_01/level_01.json`, with its existing suspect cast, evidence chain and comedic endings. Level 0 is a separate dataset; its exact narrative and clues require a separate level-design review before implementation.

## Business Value

- Bridges creative game design (`level-designer`) and frontend implementation (`frontend-game-developer`) through standardized declarative case contracts.
- Enables modular delivery of detective cases without modifying core UI loops or smartphone engine components.
- Delivers culturally authentic Vietnamese comedic drama (*Tâm sự Eva*, *Vén khéo*, tech office tropes) to engage the target 13+ audience.
- Provides optional introductory practice alongside the Level 1 MVP playable case; existing later-level release boundaries are unchanged.

## High-Level Requirements

- Implementation of Husband Thịnh Level 1 ("Cơn ghen lúc nửa đêm") JSON dataset matching `src/data/cases/husband_01/level_01.json` specifications: 4 active apps (`internet-messaging`, `banking`, `ecommerce`, `comms`), 5 suspects, 3 core smoking-gun evidence cards, and 5-strike limit.
- Configuration of 5 distinct suspect profiles (`suspect_01`, `suspect_04`, `suspect_05`, `suspect_03`, `suspect_06`) with disguised contact cards and avatar assets.
- Packaging of forensic clue metadata across active apps adhering to the Subtle Clues Invariant (Zero Obvious Spoilers).
- Integration of tiered confrontation excuse dialogues ("Chối bay chối biến") and comedic roast narratives for victory, over-jealous fail states, and caught-snooping restarts.
- Separate Level 0 content supporting guided evidence capture, a first notebook connection, Sixth Sense practice, an independent final connection and successful confrontation. Reuse existing app views and case mechanisms; do not infer a fixed cast, app count or clue count before content approval.

## Business Outcome

Players can immediately immerse themselves in a fully realized, culturally resonant Vietnamese detective case with authentic clues, witty excuses, and viral roast punchlines, while engineering scales new cases purely through declarative configuration.

## Business Rules

- **Single Source of Truth**: Case data must strictly reflect approved level story specs under [requirements/stories/husband-01/level-01.md](../../stories/husband-01/level-01.md).
- **Subtle Clues Invariant**: Clues must rely on indirect cross-app contradictions rather than overt confessions or explicit dialogue.
- **Zero Code Duplication**: Level content must be delivered 100% via declarative schemas (`CaseConfig`) with zero hardcoded case logic in app views.
- **Level 0 Content Approval**: US-034 consumes a separately approved level-design specification. Tutorial mechanism requirements and placeholder wireframes do not constitute approval of case facts or dialogue.

## Dependencies

- **Upstream**: Epic 01 Virtual Phone Shell ([`epic-01-virtual-phone-app-ecosystem`](../epic-01-virtual-phone-app-ecosystem/epic.md)), Epic 02 Clue Engine ([`epic-02-investigation-suspicion-mechanics`](../epic-02-investigation-suspicion-mechanics/epic.md)), Epic 03 Confrontation Hub ([`epic-03-wife-notebook-verdict-social-sharing`](../epic-03-wife-notebook-verdict-social-sharing/epic.md)), Level Story SSOT ([`level-01.md`](../../stories/husband-01/level-01.md)), Functional Decomposition ([`functional-decomposition.md`](../functional-decomposition.md)).
- **Downstream**: Game Runtime Engine (`src/data/cases/`).

## User Stories

* [US-027 - Husband Thịnh Level 1 Case Implementation ("Cơn ghen lúc nửa đêm")](us-027-husband-01-level-1-case-implementation.md) - *Status: planned*
* [US-034 - Level 0 Tutorial: Bữa cà phê tăng ca (Popup Guide)](us-034-level-0-tutorial.md) - *Status: draft; consolidates former US-031..US-034 using 3 existing apps (`internet-messaging`, `phone`, `photos`) and step-by-step popup guide*.

## GUI Specifications

* None recorded yet. Standalone GUI specifications are bypassed in favor of canonical ASCII wireframes.

## Wireframes

* [Level 0 Tutorial Popup Guide ASCII Wireframe](wireframes/wireframe-level-0-tutorial-popup-guide.md) - *Status: draft (Phase 1 - awaiting user signoff)*.

## Diagrams

* None currently required.

## Open Questions

* Level 0 story package (`level-00-storyboard.md`, `level-00.md`, `level-00-phone-data.md`) and Phase 1 ASCII wireframe (`wireframe-level-0-tutorial-popup-guide.md`) await user signoff before generating `photo_l0_001` artwork and implementing `src/data/cases/husband_01/level_00/`.

## Citations

* [Husband Thịnh Level 0 Tutorial Design Spec](../../stories/husband-01/level-00.md)
* [Husband Thịnh Level 1 Design Spec](../../stories/husband-01/level-01.md)
* [Clue Ideas Inventory](../../stories/clues/clue-ideas-inventory.md)
* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
* [Level 0 Tutorial & Sixth Sense Discovery](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md)

