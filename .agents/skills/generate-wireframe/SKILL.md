---
name: generate-wireframe
description: Use when creating or revising HTML wireframes, text wireframes, screen flows, page layouts, form mockups, or screen visualization artifacts grounded in canonical app-design.md specifications.
---

# Wireframe Generation Skill

Create stakeholder-readable wireframes as static HTML/CSS files or structured text-only wireframe descriptions.

## Output Modes & User Selection Gate

Before generating any wireframe, the agent **MUST ask the user** (via interactive question or prompt) whether they prefer an **Interactive HTML Wireframe** or a **Structured Text-Based Wireframe**, unless the format was already explicitly specified in the user request or agreed upon in the upstream Artifact Plan.

- **Format Selection Prompt (`ask_question`)**:
  - **Interactive HTML Wireframe (`.html`) (Recommended)**: Self-contained HTML with embedded CSS tokens, responsive layout, browser previewability, and automated screenshot visual inspection gate (`view_file`).
  - **Structured Text-Based Wireframe (`.md`)**: PRD-ready structural hierarchy, ASCII/markdown layout blocks, component inventories, and UX state descriptions for lightweight documentation and pre-visual handoffs.

### Mode Details:
- When **HTML** is chosen: generate a self-contained `.html` file with embedded CSS under `<epic-slug>/wireframes/wireframe-<slug>.html` and run the Automated Multimodal Visual Review Gate.
- When **Text-based** is chosen: generate a structured markdown wireframe file under `<epic-slug>/wireframes/wireframe-<slug>.md` following [references/text-wireframe-guide.md](references/text-wireframe-guide.md).
- Use Mid-Fi fidelity by default unless the user asks for Lo-Fi or Hi-Fi.
- Target both mobile and desktop when the request implies a responsive product; otherwise use the most relevant viewport.
- Avoid JavaScript unless the user asks for click-through behavior or dynamic states.
- Use realistic labels, placeholder data, and component states without final branding unless provided.

## Before Generating

### Micro-App `app-design.md` Resolution Gate (Primary SSOT)

Before authoring any wireframe for virtual apps or OS shell features in the *Jealous Wife Detective Game*, the agent **MUST resolve and inspect** the target app's canonical `app-design.md`:

1. **Locate Target App SSOT** under `.agent-artifacts/project-knowledge-base/solution-context/apps/`:
   - **`zola` / `internet-messaging`** (Chat): `apps/internet-messaging/app-design.md`
   - **`vietpay` / `banking`** (Bank & E-Wallet): `apps/banking/app-design.md`
   - **`poshee` / `ecommerce`** (E-Commerce): `apps/ecommerce/app-design.md`
   - **`grap` / `ride-hailing`** (Ride-Hailing & Food): `apps/ride-hailing/app-design.md`
   - **`netsurf` / `web-browser`** (Mobile Browser): `apps/web-browser/app-design.md`
   - **`geemail` / `email`** (Email): `apps/email/app-design.md`
   - **`inkedlin` / `professional-network`** (Professional Network): `apps/professional-network/app-design.md`
   - **`tim` / `team-collaboration`** (Team Collaboration): `apps/team-collaboration/app-design.md`
   - **`phone-os`** (Master Phone OS Shell & Launcher): `apps/phone-os/app-design.md`
   - **`comms`** (Phone Dialer & SMS): `apps/phone-os/comms/app-design.md`
   - **`photos`** (Media Gallery & Forensics): `apps/phone-os/photos/app-design.md`
   - **`husband-notes` / `personal-notes`** (Husband's Notes & Calendar): `apps/personal-notes/app-design.md`
   - **`wife-notebook`** (Sổ Tay Bắt Ghen & Hub): `apps/phone-os/wife-notebook/app-design.md`
2. **Extract Authoritative Tokens & Layout Models** via `view_file`:
   - *Branding & Parody Persona* (Section 1): App title, trademark defense theme, visual persona.
   - *Design Tokens & Ergonomics* (Section 2): Exact brand color palette hex codes, surface background, card colors, text primary, and touch target minimums ($\ge 44 \times 44\text{px}$ for buttons/tabs; $\ge 48\text{px}$ for search bars/inputs).
   - *Canonical Icon Pack & Zero-Emoji Policy* (`phone-os/app-design.md` Section 2.4): Extract the canonical Ionicons vector SVG icons styled to match iOS SF Symbols. Strictly prohibit raw Unicode emojis.
   - *UI Wireframes & Layout Architecture* (Section 3): Exact ASCII screen hierarchy, header formats, drawer modals, and tag clouds.
3. **UX & Accessibility Intelligence (`ui-ux-pro-max`)**:
   - Query mobile UX, form ergonomics, and accessibility guidelines via `python .agents/skills/ui-ux-pro-max/scripts/search.py "<component>" --domain ux` to establish proper `inputmode`, touch target constraints ($\ge 44 \times 44\text{px}$), and clear contrast before finalizing wireframe structure or authoring `app-design.md`.
4. **Fallback for Non-App Screens**: If the wireframe is an abstract system architecture diagram or non-app administrative screen with no matching `app-design.md`, verify if a global `design.md` exists or fall back to neutral wireframe defaults.

- Infer a practical user flow and layout from the request.
- State assumptions briefly when they affect the screen count, entry point, responsive target, or primary action.
- Ask only when missing context would materially change the wireframe.
- For broad flows, create one focused screen first or split into a small screen sequence.
- Identify whether the wireframe is related to one or more user stories, one epic, or multiple epics before writing a file.


## Requirement Output Placement

Follow the deliverable folder placement rules owned by `manage-requirement-artifacts`:
- Put user-story or epic-related wireframes in `.agent-artifacts/requirements/output/<epic-slug>/wireframes/`.
- Put project-wide wireframes in `.agent-artifacts/requirements/output/wireframes/`.

Placement rules:

- Put user-story-related wireframes in the `wireframes/` folder under the same epic as the related user story.
- Put project-wide wireframes in `.agent-artifacts/requirements/output/wireframes/`, not under a single epic.
- If a wireframe relates to multiple user stories in the same epic, keep one shared wireframe file in that epic's `wireframes/` folder and link each story to it.
- Use stable lowercase filenames: `wireframe-<screen-or-flow-slug>.html` or `wireframe-<screen-or-flow-slug>.md`.
- After creating or updating a user-story-related wireframe, update the related user story to include a relative link such as `./wireframes/wireframe-order-detail.html`.
- Update the nearest epic file: `epic.md` for epic-level wireframes.

## HTML Wireframe Rules

- **Strict Zero-Emoji Invariant**: Wireframes MUST NOT use raw Unicode emojis (e.g. 🔋, 📶, 📱, 🔍, 💬, 🛍️, 🚗, 🌐, 🖼️, 💳, 📞, 📝, 🏠, 🎀, 🗂️, 🔄, 🔒, ⚠️, 🔴) for UI chrome, buttons, badges, launcher tiles, or status bar indicators.
- **Canonical Icon Pack Rendering**: Use clean vector SVG icons from the canonical icon pack specified in `phone-os/app-design.md` Section 2.4 (**Ionicons** styled to match Apple iOS SF Symbols: 24px viewbox, 2px stroke weight, rounded joints).
- Use semantic HTML (`header`, `nav`, `main`, `section`, `form`, `table`, `aside`) and accessible labels.
- For virtual smartphone apps, render inside the emulated mobile container (`.wf-phone-container` with $375\text{px}$–$430\text{px}$ portrait ratio) and simulated status bar with SVG signal bars, wifi arc, and capsule battery pill (aligned with `phone-os/app-design.md`).
- Embed the target app's brand tokens (from `app-design.md` Section 2) into CSS `:root` (`--wf-primary`, `--wf-gray-50`, `--wf-gray-800`, `--wf-card-bg`, `--wf-accent`).
- Strictly enforce touch target ergonomics: $\ge 44 \times 44\text{px}$ for buttons, navigation tabs, back button (`< Trang chủ`); $\ge 48\text{px}$ for search bars/inputs.
- Use visible wireframe styling: simple borders, muted fills, placeholder blocks, and clear section labels.
- Use responsive CSS with stable breakpoints; ensure text and controls fit at mobile widths with zero horizontal clipping.
- Include expected UI states where useful: empty, loading, disabled, error, success.
- For forms, include labels, placeholders, required indicators, hints/errors, and native selects for dropdowns.
- Keep all interaction notes visible in the page only when they are part of the wireframe handoff.

## Text-Based Wireframe Rules

- Follow [references/text-wireframe-guide.md](references/text-wireframe-guide.md).
- **Strict Zero-Emoji Invariant**: Never use raw Unicode emojis. Use structured bracketed semantic tokens (e.g. `[Signal 5G]`, `[Battery 42%]`, `[Search]`, `[Zola] (3)`, `[Lock]`, `[Back]`, `[Close]`).
- Align layout hierarchy and component inventory directly with the ASCII wireframes documented in Section 3 of the target app's canonical `app-design.md`.
- Do not invent platform, target user, goals, screen scope, flows, key actions, or components.
- Ask targeted clarifying questions when required details are missing.
- Use headings, indentation, and bullets to show layout hierarchy.
- Do not include visual styling, design system references, pixel values, icons, or imagery unless explicitly required.
- In text mode, do not add meta-commentary; output questions only or the wireframe only.

## Fidelity

- Lo-Fi: grayscale blocks, minimal copy, layout and hierarchy only.
- Mid-Fi: realistic structure, labels, sample data, form states, navigation, and annotations.
- Hi-Fi: polished spacing and typography, closer-to-final content, still clearly a wireframe unless the user asks for visual design.

## Reference

- HTML: follow [references/html-wireframe-guide.md](references/html-wireframe-guide.md) for structure, components, file naming, and validation.
- Text-based: follow [references/text-wireframe-guide.md](references/text-wireframe-guide.md) for required sections, clarification rules, and output format.
- Templates: read `assets/text-wireframe-template.md` when producing text-based wireframes from a reusable structure. HTML wireframes should follow `references/html-wireframe-guide.md` directly and do not use a separate HTML template.
- Design tokens & CSS stylesheet: `assets/wireframe-tokens.css` contains accessible 8px-grid styles, emulated phone frame, and UI components.

## Core Tooling (in `scripts/`)

Directly invoke these utilities using the exact CLI syntax below; do not inspect script source code unless diagnosing an execution error:

| Utility | Script Command | Description |
|---|---|---|
| **Wireframe Scaffolder** | `powershell -NoProfile -File .agents/skills/generate-wireframe/scripts/scaffold_wireframe.ps1 --title "<Screen Title>" --output "<path.html>" [--app <app-id>]` | Scaffolds responsive HTML shell with embedded CSS tokens. When `--app <app-id>` is provided (e.g. `poshee`, `zola`, `vietpay`), automatically parses the target app's `app-design.md`, injects brand tokens, and wraps the view in an emulated smartphone container. |
| **Screenshot Renderer** | `powershell -NoProfile -File .agents/skills/generate-wireframe/scripts/render_screenshot.ps1 --input "<path.html>" [--viewport desktop\|mobile]` | Uses headless Chromium/Edge to render HTML wireframes to crisp PNG images for multimodal visual review (use `--viewport mobile` for virtual apps). |

## Automated Multimodal Visual Review Gate (`view_file`)

Never evaluate wireframe quality based on raw HTML/CSS syntax or ASCII art alone. After scaffolding, authoring, or modifying an HTML wireframe, the agent must render the wireframe to an image and perform a visual inspection.

### Visual Review Protocol:
1. **Render Screenshot**: Execute `powershell -NoProfile -File .agents/skills/generate-wireframe/scripts/render_screenshot.ps1 --input "<path.html>" --viewport mobile`.
2. **Visual Inspection**: Call `view_file` on the generated `<path.png>`.
3. **Audit Against Standards**:
   - **Micro-App `app-design.md` Grounding (Primary SSOT)**: Locate the target app's canonical `app-design.md` under `.agent-artifacts/project-knowledge-base/solution-context/apps/<app-id>/app-design.md` (or `phone-os/...`). Audit the rendered layout strictly against:
     - *Brand Colors*: The primary brand hex color and surface tokens from `app-design.md` are accurately rendered.
     - *Layout Conformance*: The screen elements correspond to the view schemas and ASCII wireframes defined in Section 3 of `app-design.md`.
     - *Touch Target Compliance*: Interactive buttons, list rows, back navigation, and tabs satisfy the $\ge 44 \times 44\text{px}$ minimum hit target rule.
     - *Mobile Viewport*: Layout renders seamlessly in mobile viewport ($375\text{px}$–$430\text{px}$) without horizontal clipping or awkward wrapping.
     - *Zero-Emoji & Icon Pack Compliance*: Confirm zero raw Unicode emojis appear in the rendered wireframe. All icons (status bar, launcher icons, buttons, search, back navigation) must render as crisp vector SVGs from the canonical icon pack (Ionicons per `phone-os/app-design.md` Section 2.4).
   - **Core UI/UX Heuristics (When `app-design.md` is absent)**:
     - *Visual Hierarchy & Scanning*: Does the primary call-to-action (CTA) or focal workflow immediately draw the user's eye (F/Z reading patterns)?
     - *Gestalt & Spatial Rhythm*: Are padding, margins, and alignments consistent using an 8px grid rhythm?
     - *Legibility & Contrast*: Does text meet WCAG 2.1 AA contrast requirements against background or translucent overlays? Are all labels fully visible with zero awkward clipping or line wrapping?
     - *Interactive Affordance*: Are interactable buttons, drag handles, inputs, and toggles visually distinct from static labels and decorative cards?
     - *State Completeness*: Are realistic empty, loading, or fallback states presented cleanly?

### Strict Anti-Loop Circuit Breaker:
To prevent costly LLM loops and token drain:
- **Maximum 1 Self-Correction Pass**:
  - If critical visual defects (broken layout, illegible contrast, clipping, severe misalignment with `app-design.md`) are identified during visual inspection, execute **exactly one** targeted HTML/CSS refactoring edit and re-render the screenshot.
  - Re-inspect the updated image once.
- **Halt Condition (No Looping)**:
  - **Never enter a second correction loop.**
  - If minor visual discrepancies or subjective polish items remain after the single refactoring pass, **stop immediately**. Present the deliverable to the user, display the screenshot path, and report the remaining items as "Visual Review Observations & Trade-Offs" for the user to steer.

## Validation

Before presenting:
- For HTML, execute the **Automated Multimodal Visual Review Gate** (render PNG + `view_file` inspection).
- For text-based wireframes, check required sections, screen hierarchy, states, actions, assumptions, and constraints.
- Check alignment, overflow, contrast, placeholder text, and responsive behavior when HTML is generated.
- Confirm the wireframe matches the stated assumptions and requested screen flow.
- Provide the file path and note any viewer/browser instructions for HTML artifacts only.

