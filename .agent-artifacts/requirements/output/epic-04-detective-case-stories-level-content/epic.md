---
type: Requirement Epic
status: draft
description: "Release 1 case content for the optional Level 0 tutorial and Husband Thịnh Level 1, with separately approved narrative and clue designs."
tags: [requirement, epic, case-stories, level-content, narrative-integration, declarative-cases]
timestamp: "2026-10-15T09:48:00+07:00"
---

# Epic 04: Level 0 Tutorial & Husband Thịnh Level 1 Case Content (Release 1)

## Summary

This epic governs **Release 1 (MVP)** declarative content for the optional Level 0 practice case and Husband Thịnh Level 1. Existing Level 1 scope still translates `requirements/stories/husband-hoang/level-01.md` into `src/data/cases/hoang/level_01.json`, with its existing suspect cast, evidence chain and comedic endings. Level 0 is a separate dataset; its exact narrative and clues require a separate level-design review before implementation.

## Business Value

- Bridges creative game design (`level-designer`) and frontend implementation (`frontend-game-developer`) through standardized declarative case contracts.
- Enables modular delivery of detective cases without modifying core UI loops or smartphone engine components.
- Delivers culturally authentic Vietnamese comedic drama (*Tâm sự Eva*, *Vén khéo*, tech office tropes) to engage the target 13+ audience.
- Provides optional introductory practice alongside the Level 1 MVP playable case; existing later-level release boundaries are unchanged.

## High-Level Requirements

- Implementation of Husband Thịnh Level 1 ("Cơn ghen lúc nửa đêm") JSON dataset matching `src/data/cases/hoang/level_01.json` specifications: 4 active apps (`internet-messaging`, `banking`, `ecommerce`, `comms`), 5 suspects, 3 core smoking-gun evidence cards, and 5-strike limit.
- Configuration of 5 distinct suspect profiles (`suspect_huong`, `suspect_lan_anh`, `suspect_thao`, `suspect_ngoc`, `suspect_mai`) with disguised contact cards and avatar assets.
- Packaging of forensic clue metadata across active apps adhering to the Subtle Clues Invariant (Zero Obvious Spoilers).
- Integration of tiered confrontation excuse dialogues ("Chối bay chối biến") and comedic roast narratives for victory, over-jealous fail states, and caught-snooping restarts.
- Separate Level 0 content supporting guided evidence capture, a first notebook connection, Sixth Sense practice, an independent final connection and successful confrontation. Reuse existing app views and case mechanisms; do not infer a fixed cast, app count or clue count before content approval.

## Business Outcome

Players can immediately immerse themselves in a fully realized, culturally resonant Vietnamese detective case with authentic clues, witty excuses, and viral roast punchlines, while engineering scales new cases purely through declarative configuration.

## Business Rules

- **Single Source of Truth**: Case data must strictly reflect approved level story specs under [requirements/stories/husband-hoang/level-01.md](../../stories/husband-hoang/level-01.md).
- **Subtle Clues Invariant**: Clues must rely on indirect cross-app contradictions rather than overt confessions or explicit dialogue.
- **Zero Code Duplication**: Level content must be delivered 100% via declarative schemas (`CaseConfig`) with zero hardcoded case logic in app views.
- **Level 0 Content Approval**: US-034 consumes a separately approved level-design specification. Tutorial mechanism requirements and placeholder wireframes do not constitute approval of case facts or dialogue.

## Dependencies

- **Upstream**: Epic 01 Virtual Phone Shell ([`epic-01-virtual-phone-app-ecosystem`](../epic-01-virtual-phone-app-ecosystem/epic.md)), Epic 02 Clue Engine ([`epic-02-investigation-suspicion-mechanics`](../epic-02-investigation-suspicion-mechanics/epic.md)), Epic 03 Confrontation Hub ([`epic-03-wife-notebook-verdict-social-sharing`](../epic-03-wife-notebook-verdict-social-sharing/epic.md)), Level Story SSOT ([`level-01.md`](../../stories/husband-hoang/level-01.md)), Functional Decomposition ([`functional-decomposition.md`](../functional-decomposition.md)).
- **Downstream**: Game Runtime Engine (`src/data/cases/`).

## User Stories

* [US-027 - Husband Thịnh Level 1 Case Implementation ("Cơn ghen lúc nửa đêm")](us-027-husband-hoang-level-1-case-implementation.md) - *Status: planned*
* [US-034 - Level 0 Practice Case Content](us-034-level-0-practice-case-content.md) - *Status: draft; shared revision-2 ASCII approved; implementation depends on separate level-design approval*.

## GUI Specifications

* None recorded yet. Standalone GUI specifications are bypassed in favor of canonical ASCII wireframes.

## Wireframes

* Content uses existing micro-app views. Level 0 behavior maps to the approved revision-2 [entry](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-level-0-entry.md), [evidence coaching](../epic-02-investigation-suspicion-mechanics/wireframes/wireframe-level-0-evidence-coaching.md), [notebook/completion coaching](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-level-0-deduction-completion.md), and [Sixth Sense](../epic-02-investigation-suspicion-mechanics/wireframes/wireframe-sixth-sense.md) wireframes. These do not invent case data.

## Diagrams

* None currently required.

## Open Questions

* Level 0 exact narrative and clues are deferred to a separate level-design review before implementation, as explicitly accepted in the discovery sign-off. Level 1 content is not changed by this addition.

## Citations

* [Husband Thịnh Level 1 Design Spec](../../stories/husband-hoang/level-01.md)
* [Clue Ideas Inventory](../../stories/clues/clue-ideas-inventory.md)
* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
* [Level 0 Tutorial & Sixth Sense Discovery](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md)

