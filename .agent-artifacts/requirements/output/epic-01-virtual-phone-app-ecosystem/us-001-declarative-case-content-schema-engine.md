---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & Modular Parody App Suite"
status: draft
description: "Establishes declarative TypeScript data models and client-side loaders for cases, suspects, clues, and apps."
tags: [requirement, user-story, schema-engine, architecture]
timestamp: "2026-10-13T18:00:00+07:00"
---

# US-001 - Declarative Case & Content Schema Engine

### Epic: [Epic 01: Virtual Phone Shell & Modular Parody App Suite](./epic.md)

As a **Player**, I want to load cases and clues from declarative configuration schemas so that I can experience structured detective gameplay across levels.

---

### Risk, Assumption, Issue, Dependency (RAID) Log

| RAID ID | Type | Description | Impact | Owner | Status |
|---|---|---|---|---|---|
| R01 | Risk | Content schema drift between scenario authors and micro-app consumers may cause missing data fields. | Medium | Lead BA | Mitigated |
| A01 | Assumption | All case configs for launch MVP are statically bundled TypeScript/JSON modules with zero network round-trips. | Low | Dev Lead | Validated |
| I01 | Issue | None currently identified. | Low | Lead BA | Resolved |
| D01 | Dependency | Architecture schema contract defined in [`apps-features-architecture.md`](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md). | High | Solution Architect | Ready |

---

### Pre-conditions

| Pre-condition ID | Description |
|------------------|-------------|
| PR01             | The web application bundle is loaded in the browser runtime. |
| PR02             | Static case configuration dataset for active level (Level 1, 2, or 3) is imported in client bundle. |

---

### Workflow/Activity Diagram

- N/A (Client data loading and interface binding engine).

---

### Screen / GUI Specification References

| Reference ID | Screen / Artifact | Reference | Story-Relevant Behavior |
|---|---|---|---|
| UI01 | Phone OS Shell & Launcher | [`wireframe-phone-shell-launcher.md`](./wireframes/wireframe-phone-shell-launcher.md) | Supplies initial `activeScreen`, `systemClock`, and `notificationBadges` state to shell. |

---

### Definitions & Business Rules

- **Valid CaseConfig Definition**: A case configuration dataset is considered valid only when it contains a non-empty `caseId`, `husbandId`, a `levelNumber` between 1 and 3, a non-empty `suspectPool` array, a strictly classified `groundTruth` object, configured `appsData` for all 8 standard applications, and `deviceMetadata` specifying `narrativeTime`, `batteryPercent`, `carrierTag`, and `pwaThemeColor`.
- **Level Catalog Manifest Rule**: The schema engine must export a static manifest array (`LevelMetadata[]`) defining all available cases and levels for the Level Selector. Each entry specifies `caseId`, `husbandId`, `husbandName`, `levelNumber` (1, 2, or 3), `levelTitle`, `storySnippet`, `thumbnailAsset`, `allowedStrikes`, and `unlockRequirementLevel`.
- **Allowed Strikes Boundary Rule**: The maximum suspicion strikes allowed before triggering a fail state must match the level number:
  - Level 1: exactly 5 strikes.
  - Level 2: exactly 4 strikes.
  - Level 3: exactly 3 strikes.
- **Ground Truth Classification Rule**: `groundTruth.verdict` must strictly equal one of three values: `'innocent'`, `'cheating'`, or `'sugar_relationship'`.

---

### Fallback & Routing Decision Table

| Input state | Observable condition | Selected path | Expected outcome |
|---|---|---|---|
| Level config bundle present | `caseConfig` object contains non-empty `caseId`, valid `deviceMetadata`, and required properties | Standard load path | Initializes session state, syncs status bar telemetry, and mounts 8-app home screen |
| Level config bundle missing | `caseConfig` is null, undefined, or empty | Fallback error path | Displays modal dialog: "Không thể tải dữ liệu vụ án. Vui lòng thử lại!" |
| Level config property malformed | `levelNumber` outside 1 to 3 or missing `groundTruth` | Fallback error path | Blocks gameplay start and displays error: "Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!" |
| Level catalog query | Schema engine queried for available levels by Level Selector | Catalog response path | Returns ordered list of 3 level metadata records for the active husband |
| Unknown level query | Requested levelNumber not in catalog range 1 to 3 | Catalog error path | Blocks level load and displays error: "Không tìm thấy màn chơi yêu cầu." |

---

### Business Acceptance Criteria

**AC 1**: Successful Level 1 Case Schema Ingestion and Initialization

```gherkin
Given a static CaseConfig dataset with caseId "case_01", husbandId "husband_01", levelNumber 1, and deviceMetadata
When the game runtime initializes the active investigation session
Then the schema engine populates the suspect pool with at least 1 initial suspect
And the system initializes the suspicion strike limit to exactly 5 strikes
And the system binds narrative clock "23:45", battery "42%", carrier "5G", and theme color "#0f172a" to the shell
And the system sets the initial active view to the home screen launcher
```

**AC 2**: Suspicion Strike Boundary Enforcement Across Difficulty Levels

```gherkin
Given a CaseConfig dataset for levelNumber 2
When the schema engine parses the allowedStrikes parameter
Then the system enforces an allowed strike boundary of exactly 4 strikes

Given a CaseConfig dataset for levelNumber 3
When the schema engine parses the allowedStrikes parameter
Then the system enforces an allowed strike boundary of exactly 3 strikes
```

**AC 3**: Ground Truth Integrity and Suspect Culprit Mapping

```gherkin
Given a CaseConfig dataset with groundTruth containing verdict "cheating" and culpritSuspectId "suspect_01"
When the schema engine evaluates the groundTruth object
Then the system verifies culpritSuspectId matches an existing entry in the suspectPool
And the system stores the narrative roast string for end-of-case evaluation
```

**AC 4**: Exception Handling for Corrupt or Missing Case Configuration

```gherkin
Given the game runtime attempts to load a caseId that does not exist in the bundled dataset
When the schema loader executes the case lookup
Then the system blocks shell initialization and displays modal dialog: "Không thể tải dữ liệu vụ án. Vui lòng thử lại!"
```

**AC 5**: Level Catalog Manifest Exposure for Level Selector

```gherkin
Given the application runtime requests the case catalog for husbandId "husband_01"
When the schema engine executes the getAvailableLevels query
Then the schema engine returns an ordered list containing 3 level metadata objects
And each entry specifies the levelNumber, levelTitle, allowedStrikes, and unlockRequirementLevel
```

---

### Out of Scope

| OOS ID | Description |
|--------|-------------|
| OOS01  | Remote REST/GraphQL API dynamic case fetching (static client bundles only for MVP). |
| OOS02  | Dynamic runtime JSON schema compilation via heavy third-party libraries (Zod runtime parsing deferred). |

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Latency | Case configuration loading and state initialization must complete in < 50ms in-memory. |
| Memory Overhead | In-memory `CaseConfig` and session state payload must not exceed 2MB per level. |

---

### Open Questions

* None. Configuration structure verified against Software Architecture Document.

---

### Citations

* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
* [Vision & Scope](../vision-scope.md)
