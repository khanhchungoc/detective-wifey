---
type: App Features Specification
app_id: phone_os
app_name: Virtual Phone OS & Shell
status: approved
description: "Functional specifications for the App Launcher, universal 8-app grid, shared polymorphic screen lockpad, and dynamic notification engine."
tags: [app-features, phone-os, launcher, lock-engine, notifications, schema, functional-spec]
timestamp: "2026-10-13T14:40:00+07:00"
---

# Virtual Phone OS & Shell - Functional Features Specification

---

## 1. Functional Overview

The **Virtual Phone OS & Shell** serves as the central operating system container emulating the husband's smartphone. It manages the physical bezel shell, the system status bar, the universal 11-app launcher grid, the shared security lockpad subsystem (used across multiple apps), and dynamic in-game notification toasts.

---

## 2. In-App Features & Operational Rules

### 2.1. System Status Bar & Narrative Synchronization
* **Strict Zero-Carrier Invariant**: Carrier text (e.g. `"VinaPhone 5G"`, `"Viettel"`) is never rendered in the status bar to prevent collision with the Dynamic Island (governed by [status-bar.md](../status-bar.md)).
* **Narrative Synchronized Clock**: Displays the case timeline time *(e.g. 23:45)*, dynamically matching the timestamp of incriminating late-night events.
* **Battery & State Icons**: Displays battery level *(e.g. 42%)* inside/beside the iOS capsule, Wi-Fi signal, and 4-bar cellular strength.

### 2.2. App Launcher & 12-App Level-Scoped Enablement
* **12-App Grid with Level-Scoped Enablement**: Up to 12 apps (*Shopoo, Grap, NetSurf, Photos, GeeMail, InkedLin, Tim, Husband's Notes, Zola, Techcornbank, Phone, Messages*) are mounted on the launcher grid across all levels (L0, L1, L2, L3). Only the apps scoped for the active level are enabled (L0/L1: 3-4 enabled; L2: 5-6 enabled; L3: 8-12 enabled); out-of-scope apps render in a visibly disabled state (`isEnabled: false`, dimmed/grayscale, `aria-disabled="true"`).
* **Notification Badges & Sixth Sense Highlight**: Dynamic red notification count badges on enabled app icons (e.g. Zola: `3`, Messages: `4`, Techcornbank: `1`). When the player activates "Giác Quan Thứ 6" in the Wife's Notebook targeting an uncollected clue, the target app icon displays a highlight pulse (max 2 pulses then static ring; static ring only under `prefers-reduced-motion`).
* **Sub-100ms Switching**: Tapping an enabled icon switches the active view to that app component with zero server latency.
* **In-App Home Indicator**: Every app view includes a standardized `< Trang chủ` header button and bottom home bar to return to the launcher.

### 2.3. Shared Polymorphic Screen Lock Subsystem
A unified security challenge component shared across all applications that require authentication:
* **Target Applications**:
  * **Techcornbank**: Full-app launch gate (Level 2/3).
  * **Photos**: *"Mục bị ẩn"* hidden album gate (Level 2/3).
  * **Zola**: *"Tin nhắn bị ẩn"* secret chat thread (Level 2/3).
* **Challenge Modes**:
  * `NumericPinLock`: 4-digit PIN pad ($0\text{--}9$, delete button, 4 visual dot indicators).
  * `SecurityQuestionLock`: Prompt question with text input or multiple-choice verification.
* **Suspicion Meter & Strike Escalation Hook**:
  * Entering an incorrect PIN/answer triggers a shake animation and increments the husband's suspicion strike counter (+1 strike).
  * Triggers a skippable $\sim 60\text{s}$ lockout animation timer.
  * Reaching the strike limit (L1: 5, L2: 4, L3: 3) triggers the *"Bị giật lại máy"* (Caught snooping) fail state modal with instant retry.
* **Session Unlock Cache**: Once successfully unlocked during an active playthrough, the target remains unlocked until case reset.

### 2.4. Notification System (Current & Dynamic Roadmap)
* **App Icon Badges (Active)**: Visual badge indicators reflecting unread messages and uninspected transactions.
* **Dynamic In-Game Toast Banners (Active)**:
  * Slide-down top banner toasts simulating real-time notifications received while the player is snooping in another app.
  * *Example Scenario*: While the player is browsing orders in Shopoo, an incoming Zola chat banner slides down: *"Anh Tuấn Thợ Điện: Tối mai anh đón em chỗ cũ nhé"*, creating panic and urgent clue discovery.
* **Timed Notification Trigger Pipeline (Roadmap)**:
  * Declarative triggers tied to player discovery events (e.g., viewing a Grap hotel trip triggers an incoming SMS from `HOTEL_SAOMAI`).

---

## 3. Declarative Schema Contract

```typescript
export interface PhoneOSState {
  activeScreen: 'launcher' | 'zola' | 'techcornbank' | 'poshee' | 'grap' | 'netsurf' | 'photos' | 'phone' | 'messages' | 'husband_notes' | 'email' | 'linkedin' | 'teams';
  systemClock: string; // e.g. "23:45"
  carrierName: string; // e.g. "VinaPhone 5G"
  batteryLevel: number; // e.g. 42
  notificationBadges: Record<string, number>; // { zola: 3, messages: 4, techcornbank: 1 }
  unlockedChallenges: string[]; // List of challengeIds unlocked in current session
  suspicionStrikes: number; // 0 to maxStrikes
  maxStrikes: number; // 5 (L1), 4 (L2), 3 (L3)
  isLockoutActive: boolean;
  lockoutRemainingSeconds: number;
}

export interface LockChallengeConfig {
  challengeId: string;
  targetAppId: string;
  targetSubItemId?: string; // e.g. 'hidden_album' or 'thread_02'
  challengeType: 'numeric_pin' | 'security_question';
  expectedAnswer: string; // e.g. "1204"
  promptQuestion?: string;
  clueHintSourceApp: string; // e.g. "husband_notes"
}

export interface NotificationToast {
  toastId: string;
  sourceAppId: string;
  senderTitle: string;
  snippetBody: string;
  triggerDelaySeconds?: number;
  triggerEventCondition?: string;
  clueRefId?: string;
}
```
