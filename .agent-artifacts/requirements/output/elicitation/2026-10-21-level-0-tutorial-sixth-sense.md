---
status: signed-off
artifact_type: elicitation_session
elicitation_status: COMPLETE
created_at: "2026-10-21"
updated_at: "2026-10-21"
topic: "level-0-tutorial-sixth-sense"
---

# Level 0 Tutorial and Sixth Sense - Elicitation Session

## Purpose & Scope

### Objective

Help a new player complete their first investigation in Bắt được Tiểu tam through a dedicated Level 0 practice case, including learning to request help through Giác quan thứ 6 (Sixth Sense).

### Boundary

| Area | Current Position | Status |
|---|---|---|
| Level 0 | Separate practice case offered on first play, with Skip and Replay. Skipping permits entry to Level 1. | Confirmed |
| Teaching coverage | Explore the phone, inspect information, long-press, pin findings, connect findings in the notebook, use Sixth Sense, and confront the husband. | Confirmed |
| Hint mechanism | A separate user story using the existing planned US-022 hint capability, available inside the notebook and introduced within Level 0. | Confirmed |
| Advanced mechanics | Puzzle locks and other advanced mechanics are outside this introductory teaching scope. | Confirmed |
| Case content | Exact narrative and clues receive a separate level-design review before implementation. | Confirmed |

## PACT Baseline

### People

| Persona / Role | Commercial Model | Demographics & Literacy | Devices & Hardware | Ergonomics & Preferences | Accessibility & Constraints | Jobs To Be Done (JTBD) & Pain Points | Status |
|---|---|---|---|---|---|---|---|
| Player investigating the husband's virtual phone | Existing consumer game | Existing player audience; new players may be unfamiliar with investigation gestures and deduction | Existing browser-based virtual phone; no new platform | Short instructions, practical guidance, optional introduction, replay access | Retain existing accessibility requirements; no new persona-specific constraint requested | Learn the complete investigation loop without losing a practice case because of mistakes | Confirmed |

### Activities

- Enter, skip, or replay the dedicated introductory case.
- Practice each newly introduced mechanic with guidance.
- Request a hint, investigate the indicated app, and continue collecting findings.
- Make the final connection independently and confront successfully.

### Context

- Vietnamese casual detective game with humorous relationship investigations.
- Level 0 precedes normal cases and teaches mechanics without normal case-loss consequences.

### Technologies

- Existing client-side browser game and virtual phone shell.
- Existing notebook, evidence capture, confrontation, and local-state capabilities; no new server or external integration requested.

## Rules & Data

### Rules

| Status | Rule |
|---|---|
| Confirmed | Offer Level 0 on first play. Provide Skip and Replay. Skipping does not prevent entry to Level 1. |
| Confirmed | Guide the first use of each taught mechanic, then leave the final connection for the player to find independently, with optional hints available. |
| Confirmed | Teach with icons, illustrations and animations, using short prompts rather than long explanations. Gesture demonstrations teach the action without identifying the correct clue or final connection; provide static alternatives for reduced motion. |
| Confirmed | Explain mistakes and allow retries without losing the Level 0 case. Explain normal-case penalties before entry to Level 1. |
| Confirmed | Mark Level 0 complete only after the player practices every taught mechanic, including at least one hint use, solves the final deduction, and confronts successfully. A skip is distinct from completion. |
| Confirmed | Place the Sixth Sense trigger inside the notebook. |
| Confirmed | Hints are free and have a 30-second cooldown in every level, including Level 0. |
| Confirmed | When a required clue remains uncollected, the hint highlights the app containing the next uncollected clue. It does not reveal the exact clue or correct notebook connection. |
| Confirmed | When all required clues have been collected but the case remains unsolved, provide a general notebook reminder without revealing the correct connection. |
| Confirmed | Teach normal investigation interactions. The existing signed-off evidence interaction uses a 380ms hold on narrative elements, with identical interactions for genuine clues and decoys and no permanent pin buttons. |
| Confirmed | Use the existing confrontation behavior that evaluates notebook connections automatically; do not introduce manual evidence slotting for the tutorial. Level 0's safe-retry rule is an explicit exception to normal case-loss consequences. |

### Data

| Area | Detail | Status |
|---|---|---|
| Inputs / Outputs | Inputs include tutorial entry/skip/replay, investigation actions, hint requests, notebook connections, and confrontation. Outputs include instructional feedback, an app-level hint or general notebook reminder, cooldown feedback, and tutorial completion. | Confirmed |
| Source of Truth | This signed-off discovery governs the tutorial and hint behavior. Exact case narrative and clue mappings will come from separately reviewed level design. Existing signed-off pinning and confrontation discovery governs shared mechanics. | Confirmed |
| Lifecycle / Audit | Use the existing client-local game context. No account, server persistence, or analytics capability is requested. Replay isolation, restarting rather than resuming practice, and persisted hint expiry were approved through revision-2 ASCII sign-off. | Confirmed |

## Decisions & Constraints

| Type | Item | Rationale / Impact | Owner / Status |
|---|---|---|---|
| Decision | Dedicated practice case rather than guidance embedded in Level 1 | Provides a controlled learning environment | User / Confirmed |
| Decision | Guided first use followed by independent deduction | Combines explicit teaching with an opportunity to apply learning | User / Confirmed |
| Decision | Same 30-second hint cooldown in Level 0 and normal cases | Teaches the actual hint behavior | User / Confirmed |
| Decision | Separate hint user story, introduced by the tutorial | Reuse the existing planned US-022 capability in story planning | User / Confirmed |
| Decision | Scope sign-off and session-save authorization | User explicitly approved the summarized behavior and this session path on 2026-10-21 | User / Confirmed |
| Decision | Five-story plan and baseline/file authorization | User approved extending US-022, adding US-031 through US-034, updating the MVP baseline and affected epic inventories, and drafting four ASCII wireframes. Story authoring follows wireframe sign-off. | User / Confirmed on 2026-10-21 |
| Decision | Revise the first wireframe drafts | User requested changes because the drafts were too wordy and explicitly asked for icons, illustrations and animations. Revision 2 shortens screen copy and design notes and specifies visual teaching. | User / Confirmed |
| Decision | Revision-2 wireframe sign-off and story authorization | User explicitly selected "Approve and write stories" for all four revised ASCII layouts and animation specifications. This approves their replay/isolation, safe-retry, real-time cooldown, valid-reminder, accessibility and visual-coaching details. It does not verify live animations or approve case narrative. | User / Confirmed on 2026-10-21 |
| Dependency | Separate review of exact Level 0 narrative and clues before implementation | Functional tutorial requirements do not constitute approved case content | Level designer / Deferred with user approval |
| Risk | General notebook reminder may not resolve every deduction difficulty | Preserves the final connection for the player; no answer-revealing hint is included | User / Accepted through selected behavior |
| Constraint | ASCII wireframe review precedes user-story authoring | Screen placement and states require explicit review | Existing BA workflow |
| Constraint | Story review and case-content review remain separate | Four revision-2 ASCII wireframes are signed off. The five authorized story files remain draft for review; exact case narrative/clues and live animation verification remain outside this authoring delivery. | Existing BA workflow |

## Open Questions (Parking Lot)

| ID | Area | Question | Needed From | Status / Notes |
|---|---|---|---|---|
| Q001 | Scope | What exact case narrative and clue set will teach the agreed investigation loop? | User and level designer | Deferred: separate level-design review before implementation, explicitly accepted in scope approval |

## Referenced Documents

- Current conversation: tutorial brainstorming, answered question batches, and explicit scope/save approval on 2026-10-21.
- [Existing hint allocation in functional decomposition](../functional-decomposition.md): US-022.
- [Epic 02](../epic-02-investigation-suspicion-mechanics/epic.md): existing planned hint story.
- [Original signed-off game discovery](2026-10-13-jealous-wife-detective-game.md): free app-level hint baseline.
- [Signed-off pinning and confrontation discovery](2026-10-20-us-011-us-016-pinning-confrontation.md): current shared investigation interactions.
- [Notebook feature specification](../../../project-knowledge-base/solution-context/apps/phone-os/evidence-board/features.md): supporting context; the later signed-off pinning/confrontation decisions supersede conflicting older details.

## Next Step

The user signed off all four revision-2 ASCII wireframes and authorized the five story files. Drafts are available for [US-031 entry/replay](../epic-01-virtual-phone-app-ecosystem/us-031-level-0-entry-skip-replay.md), [US-022 hints](../epic-02-investigation-suspicion-mechanics/us-022-giac-quan-thu-6-sixth-sense-app-badging-hint-engine.md), [US-032 collection coaching](../epic-02-investigation-suspicion-mechanics/us-032-level-0-guided-evidence-collection.md), [US-033 deduction/completion](../epic-03-wife-notebook-verdict-social-sharing/us-033-level-0-guided-deduction-completion.md), and [US-034 case content](../epic-04-detective-case-stories-level-content/us-034-level-0-practice-case-content.md). Review the draft stories before promoting their status. Route exact Level 0 narrative and clues to a separate level-design review; US-034 and concrete lesson-content verification depend on that approved design. No HTML, case data, runtime code or live animation preview was created in this authoring delivery.
