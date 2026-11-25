# Global Workspace Instructions (Antigravity & Agentic Workspaces)

## Global Principles

- **No Em Dashes**: Never use em dashes in responses, code, documentation, or UI text. Use a hyphen (`-`) instead.
- **Operational Terseness**: Eliminate conversational filler, pleasantries, apologies, hedging, and verbose tool-call narration. Present findings, risks, and questions with concise, high-signal language.
- **Harness & Code Changes Agent**: Operate under `ultimate-harness` global rules (`Ponytail` Full level) and `ultimate-harness/projects/detective-wifey/` (`frontend-game-developer`) before and during any code modification.

---

## Project Context Reference

- **Runtime Code Ownership**: [runtime-code-ownership.md](.agent-artifacts/project-knowledge-base/solution-context/architecture/runtime-code-ownership.md) (Implemented module boundaries and public entry points)
- **Product**: *Bắt được Tiểu tam* (Jealous Wife Detective Game)
- **Project Summary**: [project-summary.md](.agent-artifacts/project-knowledge-base/project-summary.md) (Domain, Architecture, Personas, SOW Baseline)
- **Requirements SSOT**: [.agent-artifacts/requirements/output/vision-scope.md](.agent-artifacts/requirements/output/vision-scope.md)
- **Software Architecture SSOT**: [.agent-artifacts/project-knowledge-base/solution-context/architecture/apps-features-architecture.md](.agent-artifacts/project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
- **Universal Design System SSOT**: [.agent-artifacts/project-knowledge-base/solution-context/design-system/design.md](.agent-artifacts/project-knowledge-base/solution-context/design-system/design.md) (Universal design standards, accessibility min/max typography, gutters, atomic design, common behaviors, and motion physics)
- **Micro-App Design SSOT**: [.agent-artifacts/project-knowledge-base/solution-context/apps/](.agent-artifacts/project-knowledge-base/solution-context/apps/) (Canonical `app-design.md` UI/UX and branding for each virtual app)
- **Story & Level Design SSOT**: [.agent-artifacts/requirements/stories/](.agent-artifacts/requirements/stories/) (Level story design specs and canonical clue catalogs under `clues/`)

<!-- CODEGRAPH_START -->
## CodeGraph

Always use CodeGraph as the primary tool for code inspection and code changes:

- **Mandatory for Code Inspection**: Reach for CodeGraph before grep/find or manual file reading whenever you need to understand, trace, or locate code. Trace symbol definitions, callers, callees, dynamic dispatch, and dependencies.
- **Mandatory for Code Changes**: Before modifying, refactoring, or deleting any function, type, interface, or file, trace all callers, references, and downstream call sites via CodeGraph to prevent regressions.
- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call - the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.
- **Missing Index or Installation**: If `.codegraph/` does not exist or CodeGraph is not installed, do not skip CodeGraph or proceed with blind edits. Halt and prompt the user with instructions to install and initialize:
  1. Install CLI: `npm install -g @colbymchenry/codegraph`
  2. Configure MCP (if not configured): `codegraph install`
  3. Initialize index: `codegraph init`
<!-- CODEGRAPH_END -->
