---
type: Software Architecture Document (SAD)
status: approved
description: "Canonical Software Architecture Document (SAD) defining the emulated mobile OS shell, pluggable app engine, systemic detective platform, state persistence, and declarative schema models."
tags: [architecture, sad, technical-specification, pluggable-engine, mobile-shell]
timestamp: "2026-10-13T14:35:00+07:00"
---

# Software Architecture Document (SAD) - Jealous Wife Detective Game

> **Document Classification**: Canonical Technical Software Architecture Document (SAD).
> 
> Detailed app-specific UI/UX branding and screen features are modularized in the [`apps/`](../apps/) directory. Narrative clue ideas and cross-app puzzle chains are cataloged in [clue-ideas-inventory.md](../../requirements/stories/clues/clue-ideas-inventory.md).

---

## 1. Architectural Style & Design Principles

The application is architected as an **Event-Driven, Client-Side Modular Single-Page Application (SPA)** executing inside an emulated smartphone container.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VIRTUAL SMARTPHONE SHELL CONTAINER                   │
│   [Status Bar: VinaPhone 5G | 23:45 | 42%]      [Wife's Notebook FAB]  │
├────────────────────────────────────────────────────────────────────────┤
│                       11-APP HOME SCREEN GRID                          │
│  [Upper Grid Row 1]                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  Shopoo  │  │   Grap   │  │ NetSurf  │  │  Photos  │                │
│  │ (E-Comm) │  │  (Rides) │  │ (Browser)│  │ (Gallery)│                │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
│  [Upper Grid Row 2]                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ GeeMail  │  │ InkedLin │  │   Tim    │  │Husband's │                │
│  │ (E-mail) │  │(LinkedIn)│  │ (Teams)  │  │  Notes   │                │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
│  [Frosted Dock Tray]                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                              │
│  │   Zola   │  │ Techcornbank  │  │  Comms   │                              │
│  │ (Chat)   │  │ (Bank)   │  │ (Phone)  │                              │
│  └──────────┘  └──────────┘  └──────────┘                              │
├────────────────────────────────────────────────────────────────────────┤
│                     CORE SYSTEMIC ENGINE PLATFORM                      │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ Suspicion & Strike   │ │ Polymorphic Lock &   │ │ Wife's Notebook  │ │
│ │ Engine (3-5 Strikes) │ │ Puzzle Engine (PIN)  │ │ & Decision Hub   │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ Declarative Content  │ │ Verdict Evaluation & │ │ Shareable Roast  │ │
│ │ Schema Repository    │ │ Wife Title Engine    │ │ Card Canvas Gen  │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Principles
1. **Decoupled Shell & App Modules**: The virtual OS shell is completely agnostic of in-app business logic. Apps register via a pluggable `AppDefinition` contract.
2. **Universal 11-App Grid Invariant**: All 11 registered app icons are permanently mounted on the home screen across all levels (L1, L2, L3) to eliminate process-of-elimination spoilers. Inactive apps display benign filler content.
3. **Data-Driven Declarative Content**: Zero narrative text or clue mappings are hardcoded in UI components. All cases, suspects, chats, receipts, and ground truths are statically bundled declarative schemas.
4. **100% Client-Side Privacy-First Runtime**: Zero server-side APIs, zero analytics telemetry, and zero cookie persistence. Conforms to minor privacy compliance (13+).
5. **Ultra-Low Latency (< 100ms)**: In-memory state-driven view transitions ensure native mobile responsiveness.

---

## 2. Pluggable Micro-App Registry & Contracts

Every virtual app implements the standard `AppDefinition` interface:

```typescript
export interface AppDefinition {
  appId: 
    | 'zola' 
    | 'techcornbank' 
    | 'poshee' 
    | 'grap' 
    | 'netsurf' 
    | 'photos' 
    | 'comms' 
    | 'husband_notes'
    | 'email'
    | 'linkedin'
    | 'teams';
  displayName: string;
  iconAsset: string;
  notificationBadgeCount?: number;
  isLocked: boolean;
  lockChallengeId?: string;
  component: React.ComponentType<{ 
    caseData: any; 
    onTagSuspect: (name: string, sourceApp: string) => void;
    onReturnHome: () => void;
  }>;
}
```

### Registered Virtual Applications
Individual visual identity, view hierarchies, and clue integrations are documented in canonical generic folders under [`apps/`](../apps/):
* **[Virtual Phone OS & Native Suite](../apps/phone-os/app-design.md)**:
  * **Master OS Design System**: [Phone OS Master Design](../apps/phone-os/app-design.md) *(Applies to all OS apps, shell bezel, status bar & lockpad)*
  * **OS Shell & Launcher**: [Features](../apps/phone-os/shell/features.md) \| [App Design](../apps/phone-os/shell/app-design.md)
  * **Native Phone (Dialer & Contacts)**: [Features](../apps/phone-os/phone/features.md) \| [App Design](../apps/phone-os/phone/app-design.md)
  * **Native Messages (SMS Threads)**: [Features](../apps/phone-os/messages/features.md) \| [App Design](../apps/phone-os/messages/app-design.md)
  * **Native Photos (Gallery Forensics)**: [Features](../apps/phone-os/photos/features.md) \| [App Design](../apps/phone-os/photos/app-design.md)
* **Zola (Zalo Parody)**: [Features](../apps/internet-messaging/features.md) \| [App Design](../apps/internet-messaging/app-design.md)
* **Techcornbank (Techcombank Mobile / VietQR Parody)**: [Features](../apps/banking/features.md) \| [App Design](../apps/banking/app-design.md)
* **Shopoo (Shopee Parody)**: [Features](../apps/ecommerce/features.md) \| [App Design](../apps/ecommerce/app-design.md)
* **Grap (Grab/Be Parody)**: [Features](../apps/ride-hailing/features.md) \| [App Design](../apps/ride-hailing/app-design.md)
* **NetSurf (Browser Parody)**: [Features](../apps/web-browser/features.md) \| [App Design](../apps/web-browser/app-design.md)
* **Husband's Notes & Calendar**: [Features](../apps/personal-notes/features.md) \| [App Design](../apps/personal-notes/app-design.md)
* **GeeMail (Email Parody)**: [Features](../apps/email/features.md) \| [App Design](../apps/email/app-design.md)
* **InkedLin (LinkedIn Parody)**: [Features](../apps/professional-network/features.md) \| [App Design](../apps/professional-network/app-design.md)
* **Tim (Teams Parody)**: [Features](../apps/team-collaboration/features.md) \| [App Design](../apps/team-collaboration/app-design.md)
* **Sổ Tay Bắt Ghen Của Vợ (Wife's Notebook)**: [Features](../apps/phone-os/wife-notebook/features.md) \| [App Design](../apps/phone-os/wife-notebook/app-design.md)

---

## 3. Core Systemic Platform Engines

### 3.1. Wife's Investigation Notebook & Verdict Hub Engine
* **Architectural Role**: Omnipresent floating overlay component on the virtual phone shell.
* **Responsibilities**:
  * Manages reactive suspect collection state across all 11 apps.
  * Provides manual and tap-to-add suspect tagging.
  * Houses the **Final Accusation & Verdict Submission Hub** where the player designates the culprit and verdict category to conclude the level.

### 3.2. Polymorphic Puzzle & Unlock Engine
* **Architectural Role**: Dynamic interception gate guarding locked applications or in-app sub-folders.
* **Supported Lock Decouplings**:
  * `NumericPinLock`: 4-digit PIN pad overlay (e.g. Techcornbank launch gate, Photos hidden album, Zola hidden chat).
  * `SecurityQuestionLock`: Text input or choice challenge verified against declarative answers.
* **Suspicion Hook**: Dispatches failed verification events to the Suspicion Engine.

### 3.3. Suspicion & Lockout Engine
* **Architectural Role**: Global tension manager enforcing game stakes.
* **Escalating Strike Thresholds**:
  $$\text{Max Strikes} = \begin{cases} 5, & \text{Level 1} \\ 4, & \text{Level 2} \\ 3, & \text{Level 3} \end{cases}$$
* **Failure Penalty Loop**:
  * Each failed PIN/answer triggers a skippable $\sim 60\text{s}$ lockout animation timer.
  * Reaching the strike limit triggers the "Bị giật lại máy" (Caught snooping) fail screen with instant case reset routing.

### 3.4. Verdict Evaluation & Scoring Engine
* **Architectural Role**: Pure functional rules evaluator executed upon submitting the verdict from the Wife's Notebook.
* **Evaluation Pipeline**:
  1. Compares `submittedVerdict` and `accusedSuspectId` against `caseConfig.groundTruth`.
  2. Computes Star Rating ($1\text{ to }3\text{ stars}$) based on speed and strikes incurred.
  3. Formulates the comedic roast narrative (including "Vợ Sư Tử Hà Đông" over-jealous roast for innocent cases).
  4. Generates a custom "Wife Title" (*e.g. Thám Tử Sư Tử, Vợ Đa Nghi, Nữ Hoàng Bắt Ghen*).

### 3.5. Shareable Social Card Canvas Generator
* **Architectural Role**: Client-side DOM/Canvas capture utility rendering a vertical ($9:16$) graphic card containing verdict, stars, title, and roast punchlines for TikTok, Zalo, and Facebook stories.

---

## 4. Declarative Content Schemas

### Case Configuration Model (`CaseConfig`)
```typescript
export interface CaseConfig {
  caseId: string;
  husbandId: string;
  levelNumber: 1 | 2 | 3;
  allowedStrikes: number; // L1: 5, L2: 4, L3: 3
  groundTruth: {
    verdict: 'innocent' | 'cheating' | 'sugar_relationship';
    culpritSuspectId: string; // Human or non-human entity
    narrativeRoast: string;
    overJealousRoast?: string;
  };
  suspectPool: Array<{
    suspectId: string;
    displayName: string;
    avatarUrl?: string;
    initialDiscoveredApp: string;
  }>;
  lockChallenges: Array<{
    challengeId: string;
    targetType: 'app' | 'album' | 'chat';
    targetId: string;
    lockType: 'numeric_pin' | 'security_question';
    expectedAnswer: string;
    clueSourceApp: string;
  }>;
  appsData: Record<string, any>;
}
```

---

## 5. State Management & Persistence Architecture

The application adopts a **Pluggable Repository & Adapter Pattern** for state management, decoupling UI shell and game engine logic from the storage implementation.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GAME ENGINES & SHELL CONTAINER                        │
│               (Consumes abstract GameStateRepository interface)                 │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ async (Promise-based)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                 PLUGGABLE PERSISTENCE REPOSITORY INTERFACE                      │
│                           (GameStateRepository)                                 │
├────────────────────────────────────────┬────────────────────────────────────────┤
│ PHASE 1: ACTIVE MVP ADAPTER            │ PHASE 2: FUTURE EXPANSION ADAPTER      │
│ (LocalStorageAdapter)                  │ (CloudBaaSAdapter / RemoteApiAdapter)  │
│ • 100% Client-Side, Zero OpEx          │ • Cloudflare KV / Supabase / Firebase  │
│ • Instant auto-save & zero latency     │ • Cross-device sync, player accounts   │
│ • GitHub Pages compatible              │ • Scalable to multiple games & servers │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

### 5.1. Pluggable Repository Contract (`GameStateRepository`)
All state persistence operations are asynchronous (`Promise`-based) to ensure zero architectural friction when migrating from browser storage to a remote backend in the future:

```typescript
export interface ActiveSessionState {
  schemaVersion: number;
  gameId: string; // Enables multi-game scalability
  caseId: string;
  levelNumber: 1 | 2 | 3;
  activeApp: string; // 'home' | 'zola' | 'techcornbank' | ...
  suspicionStrikes: number;
  taggedSuspects: Array<{
    suspectId: string;
    displayName: string;
    sourceApp: string;
    timestamp: number;
  }>;
  unlockedChallenges: string[]; // Solved PINs and puzzle IDs
  elapsedSeconds: number;
  lastSavedAt: number;
}

export interface PlayerProgress {
  schemaVersion: number;
  unlockedHusbandId: string;
  unlockedLevel: 1 | 2 | 3;
  bestStarRatings: Record<string, 1 | 2 | 3>;
  earnedWifeTitles: string[];
  audioMutePreference: boolean;
}

export interface GameStateRepository {
  // Active Investigation Session (Auto-saved for long sessions)
  getActiveSession(gameId: string): Promise<ActiveSessionState | null>;
  saveActiveSession(session: ActiveSessionState): Promise<void>;
  clearActiveSession(gameId: string): Promise<void>;

  // Persistent Player Progression (Career milestones)
  getPlayerProgress(): Promise<PlayerProgress>;
  savePlayerProgress(progress: Partial<PlayerProgress>): Promise<void>;

  // Optional Zero-Backend Portability (Save Code)
  exportSaveCode?(gameId: string): Promise<string>;
  importSaveCode?(saveCode: string): Promise<boolean>;
}
```

### 5.2. Active Session Auto-Save & Resumption Workflow
To support long play sessions and prevent progress loss across page refreshes or mobile tab terminations:
1. **Continuous Auto-Save**: Any state-mutating action (tagging a suspect, solving a lock, incurring a strike, or switching apps) calls `repository.saveActiveSession()`.
2. **Mount & Resume Hook**: On initial shell load, the container checks `repository.getActiveSession(gameId)`:
   - If a valid session is found: The shell displays a modal offering **"Tiếp tục điều tra"** (Resume Investigation) or **"Bắt đầu lại màn này"** (Restart Level).
   - Resuming instantly restores strikes, suspect tags, unlocked locks, and mounts the player's last active app.
3. **Session Cleardown**: The active session is purged (`clearActiveSession`) only upon verdict submission or level failure (caught snooping).

### 5.3. Multi-Game Namespacing & Migration Invariants
* **Key Namespacing**: All storage keys are prefixed and namespaced: `detective:v{schemaVersion}:{gameId}:{entity}` (e.g. `detective:v1:jealous_wife:session`).
* **Evolution to Cloud Backend**: Upgrading to a remote database (Option B) requires only supplying a new implementation of `GameStateRepository` (e.g. `SupabaseStateRepository`) via dependency injection at the application root (`App.tsx`), with zero code changes required in micro-apps or game engines.


---

## 6. Non-Functional Requirements & Performance SLAs

| Metric / NFR | Engineering Specification | Architecture Enforcement |
|---|---|---|
| **Bundle Size** | Initial JavaScript/CSS bundle $< 5\text{ MB}$ | Tree-shaken build; SVGs for icons; compressed WebP images and mono MP3s |
| **Screen Switching** | View switching latency $< 100\text{ms}$ | In-memory component mounting within virtual phone container |
| **Network SLA** | Zero runtime HTTP network requests post-load | Statically compiled declarative JSON bundles |
| **Ergonomics** | Portrait mobile viewport ($375\text{px}$–$430\text{px}$) | CSS Flexbox/Grid responsive container with centered desktop frame |
| **Touch Targets** | Touch target dimensions $\ge 44 \times 44\text{px}$ | Design system tokens for all buttons, tabs, and list rows |

---

## 7. Hosting & Deployment Architecture (GitHub Pages)

* **Distribution Model**: Static web bundle published to GitHub Pages (`https://<username>.github.io/<repo-name>/`).
* **CI/CD Pipeline**: Automated GitHub Actions workflow (`.github/workflows/deploy.yml`) on push to `main`.
* **Bundler Configuration**: Relative base path (`base: './'`) in `vite.config.ts`.
* **Complete Specification**: See [hosting-deployment.md](hosting-deployment.md).

---

## 8. Architectural Cross-Reference Index

| Artifact | Location | Purpose |
|---|---|---|
| **Clue Ideas Inventory** | [clue-ideas-inventory.md](../../requirements/stories/clues/clue-ideas-inventory.md) | Canonical narrative catalog of viral Vietnamese marital tropes |
| **Hosting & Deployment** | [hosting-deployment.md](hosting-deployment.md) | GitHub Pages static hosting, GitHub Actions CI/CD, and bundler rules |
| **Virtual Phone OS & Native Suite** | [apps/phone-os/](../apps/phone-os/app-design.md) | [Shell](../apps/phone-os/shell/features.md), [Phone](../apps/phone-os/phone/features.md), [Messages](../apps/phone-os/messages/features.md), [Photos](../apps/phone-os/photos/features.md) |
| **Zola (Internet Messaging)** | [apps/internet-messaging/](../apps/internet-messaging/) | [Features](../apps/internet-messaging/features.md) & [Design](../apps/internet-messaging/app-design.md) |
| **Techcornbank (Banking & E-Wallet)** | [apps/banking/](../apps/banking/) | [Features](../apps/banking/features.md) & [Design](../apps/banking/app-design.md) |
| **Shopoo (E-Commerce)** | [apps/ecommerce/](../apps/ecommerce/) | [Features](../apps/ecommerce/features.md) & [Design](../apps/ecommerce/app-design.md) |
| **Grap (Ride Hailing)** | [apps/ride-hailing/](../apps/ride-hailing/) | [Features](../apps/ride-hailing/features.md) & [Design](../apps/ride-hailing/app-design.md) |
| **NetSurf (Web Browser)** | [apps/web-browser/](../apps/web-browser/) | [Features](../apps/web-browser/features.md) & [Design](../apps/web-browser/app-design.md) |
| **Husband's Notes (Personal Notes)**| [apps/personal-notes/](../apps/personal-notes/) | [Features](../apps/personal-notes/features.md) & [Design](../apps/personal-notes/app-design.md) |
| **GeeMail (Email)** | [apps/email/](../apps/email/) | [Features](../apps/email/features.md) & [Design](../apps/email/app-design.md) |
| **InkedLin (Professional Network)** | [apps/professional-network/](../apps/professional-network/) | [Features](../apps/professional-network/features.md) & [Design](../apps/professional-network/app-design.md) |
| **Tim (Team Collaboration)** | [apps/team-collaboration/](../apps/team-collaboration/) | [Features](../apps/team-collaboration/features.md) & [Design](../apps/team-collaboration/app-design.md) |
| **Wife's Notebook Spec** | [apps/phone-os/wife-notebook/](../apps/phone-os/wife-notebook/) | [Features](../apps/phone-os/wife-notebook/features.md) & [Design](../apps/phone-os/wife-notebook/app-design.md) |
