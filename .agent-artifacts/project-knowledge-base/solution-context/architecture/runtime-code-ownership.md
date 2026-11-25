---
type: Runtime Architecture
title: Runtime Code Ownership
description: Current implementation boundaries, dependencies, and compatibility behavior.
tags: [system, reference]
---

# Runtime code ownership

This is the implementation map for the current code. Product scope and app designs remain in their existing authoritative documents.

| Owner | Responsibility | Entry point |
|---|---|---|
| Bootstrap | Concrete storage, app registration, public app-context projection, React wiring | [GameRoot](../../../../src/bootstrap/GameRoot.tsx), [registry](../../../../src/bootstrap/appRegistry.ts), [app context](../../../../src/bootstrap/appContext.ts) |
| Shell | Phone OS frame, launcher, transient OS overlays, fullscreen, notifications | [shell](../../../../src/shell/index.ts) |
| Apps | Each app's views/components, local types, data normalization, evidence adaptation, styling, accepted payload aliases | `src/apps/<app-id>/index.ts` |
| Play session | Coordinates gameplay actions and case lifecycle; guards delayed initialization and cancelled failure timers | [play-session](../../../../src/features/play-session/index.ts) |
| Case runtime | Bundled cases/catalog, validation, existing default-content merge behavior, level-selector UI | [case-runtime](../../../../src/features/case-runtime/index.ts) |
| Investigation | Shared narrative evidence UI and existing suspect-tag rules | [investigation](../../../../src/features/investigation/index.ts) |
| Wife notebook | Corkboard graph engine, preflight dossier, scripted beat-by-beat confrontation state machine, noir comic husband portrait, and vertical-choice interrogation room UI | [wife-notebook](../../../../src/features/wife-notebook/index.ts) |
| Locks | Challenge lookup and shared PIN UI; nested unlocks retain the owning app | [locks](../../../../src/features/locks/index.ts) |
| Suspicion | Remaining-strike transitions | [suspicion](../../../../src/features/suspicion/index.ts) |
| Session | Repository contract, localStorage adapter, ordered snapshot writes/reset invalidation, resume UI | [session](../../../../src/features/session/index.ts) |
| Shared | Small UI primitives, gestures, JSON readers, cross-owner contracts | `src/shared/` |
| Data | Existing declarative case and default JSON | `src/data/` |

## Component placement

- App-specific components stay in their app. Banking receipts remain in `apps/banking/components`; chat views remain in `apps/internet-messaging/components`.
- Phone OS components belong to `shell/components`; its wallpaper belongs to `shell/assets`.
- Evidence inspection belongs to `features/investigation`, even though multiple apps consume it.
- Generic containers and typography belong to `shared/ui`. Reuse existing primitives before introducing another one.
- Small apps can remain flat. Introduce local feature folders only when there are distinct responsibilities large enough to justify them.

## Dependencies

- Apps import their own internals, shared modules, and investigation's public evidence exports. Sibling apps and other feature internals are forbidden.
- Shell imports its own modules and shared modules. It receives app catalog entries, rendered content, overlay slots, and callbacks from bootstrap.
- Leaf features import their own modules and shared modules. Case runtime also reads declarative data.
- Play session consumes public leaf-feature APIs; bootstrap supplies concrete repositories, case loaders, app lookup, and a clock/scheduler.
- Bootstrap imports public app/feature/shell APIs. It coordinates rendering without implementing tag/strike/unlock rules.
- Shared modules and data never import app, shell, bootstrap, or feature implementations.
- Every app/feature exposes named exports through `index.ts`. Tests may inspect internals intentionally.

ESLint enforces these boundaries. The architecture check also inspects static/dynamic imports and runtime cycles. `npm run lint` includes both checks; `npm run check:architecture` runs the graph check separately. Vitest discovers colocated tests throughout `src`.

## Runtime compatibility

- Bootstrap retains visited app instances and their DOM under the shell so Home and app switching preserve navigation, inputs, and scroll offsets. Unvisited apps remain unmounted; inactive views are hidden and inert. The app visibility context also suppresses portaled evidence overlays. `PlaySession.appSessionId` resets this in-memory workspace on restart or case change; explicit Messages routes override the retained page. This does not extend the persisted session schema.

- `VirtualAppProps.caseData` is an [AppCaseContext](../../../../src/shared/contracts/app-contracts.ts), containing this app's raw payload keys and public narrative context. App-owned adapters normalize unknown payloads. Ground truth and expected answers stay outside app props.
- An app's `dataKeys` registration metadata declares its supported payload keys. Parody display names remain separate from stable IDs and legacy aliases.
- Evidence DTOs live in [shared contracts](../../../../src/shared/contracts/evidence.ts), independent of their modal implementation. Existing name-based tag deduplication remains; available source attribution now reaches the optional persisted evidence field.
- Storage retains `detective:v1:<gameId>:session` and existing progress keys/schema. No guessed evidence is added to old saves. The repository remains asynchronous and local.
- Session writes are ordered. Reset invalidates queued prior-case snapshots; case changes invalidate late initialization and cancel exhausted-strike callbacks. Lockpad timers are cancelled on unmount.
- Existing case-based launcher provisioning is retained. The conflicting 11/12-permanent-app documents have not been selected as a new runtime policy.

## Remaining scope

Sixth Sense hints, Level 2/3 scripted confrontation content, content-version migration, and social Roast Card canvas export remain follow-on delivery work described in the plan. No empty implementation modules or remote SDKs were added for them.

Browser interaction/visual verification could not run because the browser tool failed to load its request-header policy. Unit tests, server rendering, design audits, type checking, lint, and production build are separate evidence and do not establish browser interaction timing or layout correctness.
