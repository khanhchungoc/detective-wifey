---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "iOS 27-style virtual phone lockscreen with privacy-masked zero-spoiler notifications, hybrid unlock (playful FaceID/swipe on Level 0-1; optional passcode challenge with strikes on Level 2-3), and top-down Notification Dropdown replacing AssistiveTouch."
tags: [requirement, user-story, phone-os, lockscreen, ios27, faceid, passcode, notification-dropdown]
timestamp: "2026-11-27"
---

# US-038 - iOS 27 Phone Shell Lockscreen & Hybrid Unlock

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to enter each case through an iOS 27-style phone lockscreen with privacy-masked notifications and a level-appropriate unlock interaction, and pull down the Notification Dropdown during gameplay to access case controls.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen Flow (Screens 4 & 5)](./wireframes/wireframe-startup-level-flow-lockscreen.md)
- **Parent Application Design**: [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)
- **Shared Lockpad Design**: [Shared PIN Lockpad Specification](../../../project-knowledge-base/solution-context/apps/phone-os/pin-lockpad.md)

---

### Acceptance Criteria

#### AC01: iOS 27 Lockscreen Presentation & Zero-Spoiler Notifications
1. Proceeding from the Case Briefing screen (`US-037`) mounts the **iOS 27 Phone Shell Lockscreen** inside the virtual phone bezel.
2. The lockscreen renders the top status bar (lock icon, Dynamic Island, signal, battery; strictly zero carrier text), narrative date, large iOS 27 lockscreen clock, and the husband's configured wallpaper.
3. The lockscreen displays 1-2 declarative notification stacks in iOS privacy-masked mode (*"Ẩn nội dung khi khóa màn hình"*), showing only the app icon/name, generic unread count or neutral label, and timestamp (e.g., *"Zola - Bạn có 3 tin nhắn mới (Ẩn nội dung)"*).
4. Lockscreen notifications never display suspect names, disguise aliases (such as *"Anh Tuấn Thợ Điện"*), or smoking-gun message/transaction text before the phone is unlocked.

#### AC02: Playful FaceID / Swipe Unlock (Level 0 & Level 1)
1. On levels without a configured phone passcode (Level 0 and Level 1), the lockscreen shows an unlock prompt (*"Lén quét FaceID / Vuốt lên để mở khóa"*).
2. Swiping up from the bottom home indicator or tapping the FaceID/unlock prompt plays a brief playful FaceID scan sequence (*"Đang lén quét FaceID lúc chồng ngủ..."* -> unlocked state) and transitions smoothly into the Phone Home Screen (`US-002`).
3. Unlocking on Level 0 and Level 1 never consumes suspicion strikes or triggers lockouts.

#### AC03: Optional Passcode Challenge & Strike Integration (Level 2 & Level 3)
1. On levels where the declarative case config defines a lockscreen passcode (Level 2 and Level 3), swiping up or tapping the unlock area reveals the 4-digit iOS keypad with an optional narrative hint and current suspicion strike indicator.
2. Entering the correct 4-digit passcode unlocks the phone and transitions into the Phone Home Screen (`US-002`). Once unlocked, the phone remains unlocked for the rest of the active session until case restart or level switch.
3. Entering an incorrect 4-digit passcode triggers a horizontal shake animation, clears the PIN dots, displays *"Mã PIN không chính xác! Nghi ngờ tăng lên."*, increments the suspicion strike counter (+1), and routes to the shared lockout / caught-snooping fail engine (`US-013`, `US-014`) if the strike limit is reached.
4. Tapping *"Hủy"* on the keypad returns to the lockscreen view without consuming a strike.

#### AC04: Notification Preview Tap Routing
1. Tapping a privacy-masked notification stack on the lockscreen triggers the level's unlock flow first (FaceID on L0-1, or passcode prompt on L2-3).
2. Once unlocked, the phone shell opens directly into that notification's target parody app (respecting `US-025` splash rules).

#### AC05: Top-Down Notification Dropdown (Replacing AssistiveTouch)
1. Once unlocked, pulling down from the top status bar / Dynamic Island area (or tapping the top pull handle) on any in-phone screen opens the **Notification Dropdown** shade.
2. The Notification Dropdown provides quick case controls:
   - *"Hồ sơ vụ án"* -> opens the read-only Case Briefing & Husband Persona overlay (`US-037`).
   - *"Chọn màn"* -> opens the mid-case level switch confirmation modal and routes to the Level Selector Hub (`US-036`).
   - *"Chơi lại"* -> confirms and restarts the current level.
   - *"Sổ tay Vợ"* -> opens the Wife's Detective Notebook (`US-015`).
3. Below the quick actions, the dropdown lists non-spoiler recent app activity summaries; swiping up or tapping the dismiss area closes the shade and resumes the active screen.

#### AC06: Accessibility & Reduced Motion
1. All lockscreen unlock controls, keypad buttons, and Notification Dropdown actions meet the >= 44x44px touch target requirement.
2. Under `prefers-reduced-motion: reduce`, FaceID scan animations, keypad shakes, and Notification Dropdown slides simplify to instant or short static state transitions, and tap controls remain available alongside swipe gestures.

---

### Out of Scope

- AssistiveTouch floating menu (deprecated and removed).
- Custom player wallpaper upload or biometric hardware API integration (FaceID is purely a simulated in-game visual gag).
- In-app locks for Techcornbank, Photos hidden album, or Zola hidden chats (owned by `US-012`).

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Transition Performance | Unlock and Notification Dropdown transitions render smoothly at 60fps with zero layout shift inside the phone bezel. |
| Zero-Emoji Compliance | All lock, FaceID, signal, battery, and dropdown icons render via canonical Ionicons vector SVGs. |

---

### Dependencies

- [Virtual Phone Shell Container & Home Grid (US-002)](./us-002-virtual-phone-shell-container-8-app-home-grid.md)
- [Polymorphic PIN Pad & Security Unlocks (US-012)](../functional-decomposition.md)
- [Suspicion Meter Escalation & Lockout (US-013)](../functional-decomposition.md)
- [Level Context, Husband Persona & Interactive Intro Briefing (US-037)](./us-037-level-context-persona-intro-briefing.md)

---

### Open Questions

None.

---

### Citations

- [Signed-off Elicitation Session](../elicitation/2026-11-27-startup-level-selector-context-lockscreen.md)
- [Signed-off ASCII Wireframe](./wireframes/wireframe-startup-level-flow-lockscreen.md)
