---
type: Project Summary
title: Project Summary - Jealous Wife Detective Game
description: Overview of the game's domain, gameplay, architecture, personas, and MVP scope.
tags: [project, scope, system]
---

# Project Summary - Jealous Wife Detective Game (*Bắt được Tiểu tam*)

## Domain Overview

- **Product Name**: *Bắt được Tiểu tam* (Jealous Wife Detective Game).
- **Domain**: Casual detective deduction web game satirizing viral Vietnamese marital confession tropes.
- **Core Gameplay Loop**: The player assumes the persona of a jealous wife inspecting her husband's virtual smartphone across a 12-app launcher where level-scoped parody apps are enabled and out-of-scope apps are disabled (Level 0 & Level 1: 3-4 enabled apps; Level 2: 5-6 enabled apps; Level 3: 8-12 enabled apps). The player long-presses (`380ms`) to pin evidence cards across all interactive narrative items, links clues on the Detective Corkboard in the Wife's Notebook, triggers the "Giác Quan Thứ 6" app-badging hint when stuck, and can initiate "Đối chất" (Confrontation) at any time. Confronting with weak proof triggers hilarious husband excuses ("chối bay chối biến"); connecting verified smoking-gun evidence delivers conviction victory, 1-3 stars, custom Wife Titles, and vertical social share cards (TikTok, Zalo, Facebook).

---

## System Architecture & Tech Stack

- **Architecture**: 100% static, client-side web application.
- **Engine Design**:
  - Declarative level configuration schemas (JSON/TypeScript) defining cases, suspects, and clues independently of UI logic.
  - Pluggable Virtual App Registry (`AppDefinition`) allowing new apps to register icons and views without modifying the home screen shell.
  - Polymorphic Clue Engine supporting varied puzzle types (PINs, security questions, timestamp matches, hidden media).
- **Runtime Dependencies**: Zero backend APIs, zero server databases, zero third-party telemetry/cookies, zero network requests during active gameplay after initial page load.
- **State Persistence**: Browser `localStorage` for level unlocks, star ratings, and earned titles.
- **Platform & Viewport**: Mobile-first portrait viewport (375px–430px base width, touch targets >= 44x44px). Evergreen mobile browsers (iOS Safari 15+, Android Chrome 10+). Desktop displays a centered mobile frame. Performance target: < 100ms app switching, < 5MB initial bundle.
- **Design Standards SSOT**: [design system](solution-context/design-system/design.md) (Universal atomic design hierarchy, WCAG AA/AAA accessibility, gutters, touch targets >= 44x44px, dialed-down iOS frosted glass tokens, motion physics, and parody app style isolation).
- **Brand Safety**: Distinct parody brands/colors (mitigating trademark risks); comedic satire with zero profanity or explicit sexual depiction.

---

## Actors & Personas

- **Primary Persona**: Vietnamese Gen Z & Gen Alpha Player (ages 13+).
  - *Commercial Model*: B2C, 100% Free (zero ad-wall in MVP).
  - *JTBD*: Comedic deduction thrill, unlock roast endings, share results with peer networks.
  - *Pain Points Addressed*: Generic Western puzzles, intrusive pay-to-win ads, privacy friction for minors, excessive text reading.
- **Product Lead / Delivery Sponsor**: Commercial accountability and baseline sign-off authority.

---

## Commercial Scope & SOW Baseline

- **In-Scope (MVP Baseline)**:
  - Level-based virtual smartphone shell displaying up to 12 apps on the home screen (Zola, Techcornbank, Shopoo, Grap, NetSurf, Photos, Phone, Messages, Notes, GeeMail, InkedLin, Tim), where only the level-scoped apps are enabled (Level 0/1: 3-4 enabled; Level 2: 5-6 enabled; Level 3: 8-12 enabled) and remaining apps are disabled.
  - Launch content: Optional Level 0 practice case plus 1-2 husbands across 3 progressive levels (Level 1: 3-4 enabled apps, 0 locks; Level 2: 5-6 enabled apps, 1 lock; Level 3: 8-12 enabled apps, 2 locks).
  - Universal `380ms` long-press evidence pinning ("Ghim Bằng Chứng") across all interactive narrative items with zero static pin buttons to prevent giveaway tells.
  - Active smoking-gun objective counter in the Wife's Detective Notebook.
  - Anytime confrontation ("Đối chất") & dynamic excuse engine (*"chối bay chối biến"* gaslighting dialogue on premature accusation).
  - "Giác Quan Thứ 6" (Sixth Sense) app-badging hint engine (free/cooldown in MVP; paywall deferred to Phase 2).
  - Unlock mechanics (4-digit PINs, security questions, cross-app clues).
  - Suspicion & lockout engine (L1: 5 strikes, L2: 4, L3: 3; skippable ~60s lockout; caught-snooping fail screen).
  - Scaled deduction evaluation (attached evidence cards determine 1–3 stars, Wife Title, and viral roast narrative).
  - Client-rendered vertical share card (HTML/Canvas).
  - Progression & retry loop with local storage persistence.
---
