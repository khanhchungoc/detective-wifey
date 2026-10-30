---
name: research-project-knowledge
description: Read-only project knowledge and requirements research. Use scripts to search .agent-artifacts/project-knowledge-base and .agent-artifacts/requirements/output when inspecting features, business rules, system behaviors, architecture, or user stories without a static index.
---

# Project Knowledge & Requirements Research

## Core Policy: Script-Driven Research (No Static Index)

Neither `.agent-artifacts/project-knowledge-base/` nor `.agent-artifacts/requirements/output/` contains a static index (`index.md`, `README.md`). Agents **must not** hunt for index files, grep the workspace, or read files blindly.

**Mandatory Workflow**:
1. Run `scripts/search_kb.ps1` to query in-memory indexed entities and content snippets in milliseconds.
2. Inspect only the specific line ranges returned by the script using `view_file` (`StartLine`, `EndLine`).
3. Stop at the earliest sufficient tier. Never scan `src/` (Tier 3) without explicit user confirmation.

---

## Tooling Commands (`scripts/search_kb.ps1`)

| Task | Command |
|---|---|
| **Catalog Entities** | `powershell -NoProfile -File .agents/skills/research-project-knowledge/scripts/search_kb.ps1 --list-entities [--tier 1\|2\|all] [--entity TYPE] [--json]` |
| **Search Content** | `powershell -NoProfile -File .agents/skills/research-project-knowledge/scripts/search_kb.ps1 "<query>" [--tier 1\|2\|all] [--mode hybrid\|exact\|wildcard\|semantic] [--json]` |
| **Parallel Search** | `powershell -NoProfile -File .agents/skills/research-project-knowledge/scripts/search_kb.ps1 "<q1>" "<q2>" ... --parallel [--tier 1\|2\|all] [--json]` |
| **Target Subfolder** | `powershell -NoProfile -File .agents/skills/research-project-knowledge/scripts/search_kb.ps1 "<query>" --path "<folder-path>" [--json]` |

**Options**:
- `--tier 1|2|all`: `1` = `.agent-artifacts/project-knowledge-base/`; `2` = `.agent-artifacts/requirements/output/`; `all` = both (default).
- `--mode`: `hybrid` (default; exact + BM25 + synonyms), `exact`, `wildcard` (`US-*`, `*lock*`), `semantic`.
- `--entity`: Filter by `story`, `epic`, `decomposition`, `vision-scope`, `elicitation`, `wireframe`, `solution-context`, `glossary`, `all`.
- `--max-results N`: Maximum entities/excerpts returned (default: 10).
- `--json`: Output machine-readable JSON.

---

## 4-Tier Fallback Progression

1. **Tier 1 — Knowledge Base**: `.agent-artifacts/project-knowledge-base/` (`solution-context/apps/`, `solution-context/architecture/`, `glossary/`).
2. **Tier 2 - Requirements & Stories**: `.agent-artifacts/requirements/output/` (`vision-scope.md`, `functional-decomposition.md`, `elicitation/`, `<epic-slug>/`) and `.agent-artifacts/requirements/stories/` (`clues/clue-ideas-inventory.md`, `husband-<name>/level-XX.md`). Only `status: signed-off` is confirmed baseline (`draft` is in-flight).
3. **Tier 3 — Codebase Evidence (Confirmation Required)**: Application code in `src/`. **Must ask user confirmation before searching.**
4. **Tier 4 — External Standards**: Web research via `search_web` / `read_url_content` for third-party APIs/standards.

---

## Output Packet Format

Return findings using this concise format:

```markdown
## Knowledge Research Packet
- **Question:** Bounded inquiry answered.
- **Tiers Checked:** Tier 1 / 2 / 3 (Confirmed) / 4.
- **Evidence & Citations:**
  - `path/to/file.md#Lxx-Lyy` — Verified behavior, rule, schema, or AC condition.
- **Confirmed Behaviors & Rules:** Key state transitions, constraints, or schemas found.
- **Gaps & Open Questions:** Unverified assumptions, missing details, or required user decisions.
```
