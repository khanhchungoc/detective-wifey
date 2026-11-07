---
type: Universal Design Specification
system_name: Parody Phone OS Universal Design System
topic: behaviors-motion
status: approved
description: "Authoritative specification for systemic interaction patterns, gesture navigation, modal drawers, toast behaviors, spring animations, and audio-haptic feedback."
tags: [interactions, gestures, navigation, modal-sheets, toasts, motion-physics, spring-curves, haptics]
timestamp: "2026-10-15T09:20:00+07:00"
---

# Design System - Systemic Behaviors & Motion Physics

> **Parent Design Master**: [design.md](design.md)  
> **Scope**: Universal interaction patterns, spring curves, and audio-haptics across all virtual apps.

---

## 1. Common Systemic Behaviors & Navigation

Universal interaction patterns guarantee intuitive, consistent mobile physics across all virtual apps:

### 1.1. Navigation & View Hierarchy

* **Edge Swipe-to-Back Gesture**:
  - Dragging inward from the left screen edge ($< 30\text{px}$ threshold) initiates a horizontal view drag.
  - The active app translates horizontally ($1:1$ drag resistance with backdrop darkening).
  - Releasing beyond **$80\text{px}$** or with swipe velocity $> 0.5\text{px/ms}$ pops the view back to the parent view or SpringBoard.
  - Releasing below the threshold triggers a spring snap-back to $0\text{px}$.
* **Back Button Fallback**: Every subview navigation header provides a chevron-left back button with a $44\text{px} \times 44\text{px}$ touch target.
* **Home Button / Assistive Touch**:
  - Floating `AssistiveTouch` button persists on screen and provides a one-tap return to SpringBoard (`activeAppId = 'home'`).

#### Global App Resumption Rule

- Returning Home or switching apps preserves each visited app's current page, navigation stack, selected tab, filters, inputs, and scroll position. Reopening from the launcher resumes that location.
- Keep unopened or locked apps unmounted. Background apps and their portaled overlays must not receive input or accessibility focus.
- Explicit navigation to a target, such as Phone opening a Messages thread, takes precedence over the retained page.
- Restarting the level or changing cases clears retained app views, including same-case restarts. This UI state lives in memory for the current session; browser reloads continue to use the existing gameplay save contract.

### 1.2. Modal Bottom Sheets & Drawers

* **Top Grab Handle Pill**: Centered pill ($36\text{px} \times 5\text{px}$, radius $9999\text{px}$, color `rgba(255, 255, 255, 0.35)`).
* **Drag-Down Dismissal & Close Button**: Pulling down $\ge 80\text{px}$ smoothly animates the sheet off-screen. Every modal sheet also provides an explicit $44 \times 44\text{px}$ close/cancel button (`IoCloseOutline`) and `Escape` key handler as a non-pointer alternative.
* **Focus Trap & Restoration**: Opening any modal sheet, lockpad, or `UniversalEvidenceModal` traps keyboard focus within the dialog (`role="dialog"`, `aria-modal="true"`) and restores focus to the triggering element upon dismissal.
* **Scrolled Position Guard**: Drag-to-dismiss is active only when the inner scroll container is at top position (`scrollTop === 0`).
* **Scrim Backdrop**: Semi-transparent dark blur overlay (`background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px);`). Tapping the backdrop dismisses the drawer.

### 1.3. Notification Banner Toast Behaviors

* **Dynamic Island Descent**: Banners drop down from the Dynamic Island position with an iOS spring curve.
* **Auto-Dismissal Timer**: Banners automatically retract after **$4.5\text{s}$** if untouched.
* **Interactive Tap-to-Navigate**: Tapping the banner instantly opens the originating app and routes directly to the relevant clue thread or notification.
* **Flick-to-Dismiss**: Swiping up on the banner dismisses it immediately.

### 1.4. Interactive Button States & Tactile Feedback

* **Active / Pressed State**:
  - All interactive cards, list rows, and buttons exhibit an immediate **$0.97$ scale reduction** and **$0.75$ opacity dip** on touch-down (`active:scale-[0.97] active:opacity-75`).
  - Transition duration: Ultra-fast $0.1\text{s}$ cubic-bezier.
* **Hover States (Desktop Only)**:
  - Hover states apply subtle lightness lifts ($+5\%$) and cursor pointers, strictly disabled on touch devices to avoid sticky hover artifacts.
* **Disabled States & Out-of-Scope Level Apps**:
  - Standard disabled controls: `opacity: 0.40; pointer-events: none; filter: grayscale(50%);`.
  - Out-of-scope launcher apps (apps on the 12-app grid that are not enabled in the current level's scope): `opacity: 0.38; filter: grayscale(85%); aria-disabled="true";`. Tapping a disabled launcher icon does not open the app (optional subtle shake or inert state with screen-reader announcement *"Ứng dụng không nằm trong phạm vi màn này"*).

### 1.5. Scroll & Overscroll Physics

* **Overscroll Suppression**: `overscroll-behavior: none` is enforced on `html`, `body`, and outer containers to eliminate native browser pull-to-refresh interference.
* **Momentum Scrolling**: `-webkit-overflow-scrolling: touch; overflow-y: auto;` on all scrollable app viewports.
* **Clean Scrollbars**: Scrollbars are styled as slim, translucent hairlines ($4\text{px}$ width) or hidden (`scrollbar-width: none`) to maintain authentic mobile OS fidelity.

---

## 2. Motion & Feedback Physics

Animations strictly emulate the natural inertia, springs, and mechanical resistances of modern mobile operating systems:

### 2.1. Timing Curves & Easing Recipes

Animations follow Apple's core motion principles: steep entry with gentle deceleration, context-driven durations, intentional anchor points, and restrained overshoot ($\le 8\%$).

| Motion Token | Curve (Cubic-Bezier) | Duration | Usage |
|---|---|---|---|
| `--ease-ios-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | $0.32\text{s}$–$0.35\text{s}$ | Modal bottom sheet slides, toast drop-downs ($\le 8\%$ bounce) |
| `--ease-ios-default` | `cubic-bezier(0.40, 0, 0.20, 1)` | $0.35\text{s}$ | Screen push/pop transitions, drawer slide-overs (steep entry, long settle) |
| `--ios-app-open-duration` | `cubic-bezier(0.40, 0, 0.20, 1)` | $0.45\text{s}$ | Pure iOS standard app zoom-in launch from launcher icon |
| `--ios-app-close-duration` | `cubic-bezier(0.40, 0, 0.20, 1)` | $0.38\text{s}$ | Pure iOS standard app shrink-to-home dismiss back into icon |
| `--ease-micro-tap` | `cubic-bezier(0.4, 0, 0.2, 1)` | $0.08\text{s}$–$0.10\text{s}$ | Keypad button presses, app icon touch darken & active scale down |
| `--ease-shake` | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` | $0.40\text{s}$ | PIN lockpad and input error vibration oscillation |

### 2.2. Intentional Geometry & Contextual Timing Principles

1. **Decoupled Property Timings**: Position/scale transitions and opacity/fade transitions run on separate timelines (e.g. app zooms over $450\text{ms}$ while content opacity fades in over $80\text{ms}$, avoiding blank frame stutter).
2. **Context-Driven Durations (Pure iOS Standard)**:
   - Micro-press / Tap: $\le 100\text{ms}$ (`active:scale-90` + `bg-black/25` highlight).
   - Modal bottom sheets & drawers: $320\text{ms}$.
   - Screen push / pop navigation: $350\text{ms}$.
   - App zoom launch: $450\text{ms}$.
   - App dismiss to home: $380\text{ms}$.
3. **Intentional Anchor Points**:
   - App expansion transforms originate from the tapped icon's measured viewport bounds (`--app-dx`, `--app-dy`, `--app-scale-x`, `--app-scale-y`), never a generic center point.
   - Micro-cards and sheets slide from their trailing origin edges.
4. **App Launch/Close Settle**:
   - Surfaces round their clipping bounds from squircle ($22.5\%$) to square ($0\text{px}$) during open, and reverse on close.
   - When returning home, destination icon dissolves in smoothly over the final $180\text{ms}$ interval.

### 2.3. Error Shake Animation (PIN Lock & Validation Feedback)

When an invalid PIN or security passcode is submitted, input indicators execute a horizontal spring shake:

```css
@keyframes shakeDots {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
  40%, 60% { transform: translate3d(5px, 0, 0); }
}

.animate-shake {
  animation: shakeDots 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
```

### 2.4. Simulated Audio-Haptic Feedback Standards

To recreate the physical sensation of interacting with a real mobile phone:

* **Dialer Keypad Click**: Short audio tick ($10\text{ms}$, $1.2\text{kHz}$ sine wave) + `navigator.vibrate(10)` on numeric button press.
* **Evidence Pinning Chime**: Uplifting two-tone chime ($520\text{Hz} \to 780\text{Hz}$, $150\text{ms}$) + double vibration pulse (`navigator.vibrate([15, 40, 25])`).
* **Error / Strike Thud**: Low-frequency warning buzz ($180\text{Hz}$, $200\text{ms}$) + warning vibration (`navigator.vibrate([40, 60, 40])`).
* **Level Victory Fanfare**: Celebratory chime sequence + triumphant triple vibration pulse.
* **Audio Preference**: Mute preferences set in the player state (`audioMutePreference: true`) suppress audio playback while preserving silent haptic vibrations where supported.
