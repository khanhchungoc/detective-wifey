# Wireframe: iOS-Like Virtual Phone Shell, Launcher & Level Selector

**Epic**: [`epic-01-virtual-phone-app-ecosystem`](../epic.md)  
**Related User Story**: [`us-002`](../us-002-virtual-phone-shell-container-8-app-home-grid.md)  
**Related GUI Spec**: [`gui-phone-shell-launcher.md`](../gui-phone-shell-launcher.md)  
**Format**: ASCII Text Wireframe (iOS Mobile Portrait Viewport: 393px × 852px base width)  

---

## 1. Physical Smartphone Shell Frame & iOS Status Bar

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
└────────────────────────────────────────────────────────┘
```

- **Top Center Cutout**: Apple Dynamic Island pill (`#09090B`, $120\text{px} \times 32\text{px}$, $16\text{px}$ radius).
- **iOS Status Bar Left**: Time display (`23:45`, Semibold $14\text{px}$).
- **iOS Status Bar Right**: Cellular signal bars (`[Signal]`), cellular tech tag (`5G`), Wi-Fi icon (`[Wifi]`), and capsule battery glyph with percentage (`[Battery 42%]`).

---

## 2. iOS Home Screen Launcher with Floating AssistiveTouch (`PhoneOSHomeView`)

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
├────────────────────────────────────────────────────────┤
│                                                        │
│                         23:45                          │
│                Thứ Ba, 13 tháng 10                     │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Upper Grid Row 1]                                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│
│  │  Shopoo  │   │   Grap   │   │ NetSurf  │   │ Photos││
│  │ [ShopBag]│   │  [Car]   │   │[Compass] │   │[Image]││
│  └──────────┘   └──────────┘   └──────────┘   └───────┘│
│     Shopoo          Grap         NetSurf       Photos  │
│                                                        │
│  [Upper Grid Row 2]                                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│
│  │ GeeMail  │(4)│ InkedLin │(1)│   Tim    │(2)│ Notes ││
│  │ [Letter] │   │ [Inked]  │   │ [Teams]  │   │ [Doc] ││
│  └──────────┘   └──────────┘   └──────────┘   └───────┘│
│     GeeMail       InkedLin         Tim        Ghi chú  │
│                                                        │
│                 ••••   [ [Search] Tìm kiếm ]           │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  (Frosted Glass Dock - backdrop-blur)              │ │
│ │  ┌──────────┐      ┌──────────┐      ┌──────────┐  │ │
│ │  │   Zola   │(3)   │ Techcornbank  │(1)   │  Comms   │  │ │
│ │  │  [Chat]  │      │  [Card]  │      │  [Call]  │  │ │
│ │  └──────────┘      └──────────┘      └──────────┘  │ │
│ │      Zola             Techcornbank            Comms     │ │
│ └────────────────────────────────────────────────────┘ │
│                                             ┌─────┐    │
│                                             │ [O] │    │
│                                             └─────┘    │
│                                          (Assistive)   │
├────────────────────────────────────────────────────────┤
│                 ═══════ [ - ] ═══════                  │
│                (iOS Home Indicator Bar)                │
└────────────────────────────────────────────────────────┘
```

- **Universal 11-App Grid Rule**: All 11 registered parody apps are permanently visible on the home screen (8 in the upper application area across two 4-icon rows + 3 docked in the bottom frosted glass dock tray).
- **Floating AssistiveTouch Button**: Translucent circular icon (`#334155` frosted with white concentric ring, $48\text{px} \times 48\text{px}$) floating over the viewport. Accessible on the home screen and inside all apps.
- **Frosted Glass Dock**: Translucent floating tray (`rgba(255, 255, 255, 0.18)` with `backdrop-filter: blur(25px)`, $32\text{px}$ border radius) docking `Zola`, `Techcornbank`, and `Comms`.

---

## 3. AssistiveTouch Quick Action Popup Menu

Tapping the floating AssistiveTouch button expands a modal radial/card menu centered over the screen:

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
├────────────────────────────────────────────────────────┤
│                                                        │
│               ┌────────────────────────┐               │
│               │   MENU TRỢ NĂNG (iOS)  │               │
│               ├────────────────────────┤               │
│               │  [Home]     Màn hình   │               │
│               │  [Notebook] Sổ tay vợ  │               │
│               │  [Levels]   Chọn màn   │               │
│               │  [Restart]  Chơi lại   │               │
│               │  [Close]    Đóng       │               │
│               └────────────────────────┘               │
│                                                        │
├────────────────────────────────────────────────────────┤
│                 ═══════ [ - ] ═══════                  │
└────────────────────────────────────────────────────────┘
```

- **Actions Provided**:
  - `[Home] Màn hình chính`: Returns immediately to the iOS home screen launcher.
  - `[Notebook] Sổ tay của vợ`: Opens the Wife's Detective Notebook & Suspect Dossier overlay sheet.
  - `[Levels] Chọn màn chơi`: Opens the Level Selector bottom sheet.
  - `[Restart] Chơi lại màn này`: Resets current case progress (strikes, clues) with confirmation.

---

## 4. iOS Level Selector Modal Sheet (`PhoneOSLevelSelectorSheet`)

Tapping `Chọn màn chơi` slides up an authentic iOS modal sheet displaying case progression and unlocked levels:

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ ══════════════════ [ ── ] ════════════════════     │ │
│ │ HỒ SƠ VỤ ÁN & CHỌN MÀN CHƠI                 [Close]│ │
│ │ Nghi phạm: Thịnh • 32 tuổi (CEO Triệu Phú)         │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [ MÀN 1 ] Đi Làm Về Muộn                 ★★★       │ │
│ │ Độ khó: Dễ (5 Strikes • 0 Khóa PIN)                │ │
│ │ Trạng thái: ĐÃ PHÁ ÁN (Vợ Thám Tử)                 │ │
│ │ [ Chơi lại màn này ]                               │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [ MÀN 2 ] Tin Nhắn Người Lạ              ★★☆       │ │
│ │ Độ khó: Vừa (4 Strikes • 1 Khóa PIN)               │ │
│ │ [ TIẾP TỤC ĐIỀU TRA ▶ ]                            │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [ MÀN 3 ] Quỹ Đen Bí Ẩn                  [Lock] KHÓA│ │
│ │ Độ khó: Khó (3 Strikes • 2 Khóa PIN)               │ │
│ │ Điều kiện mở: Vượt qua Màn 2                       │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Level Cards**:
  - **Level 1**: Unlocked, displays 3 earned stars and best title.
  - **Level 2**: Active/unlocked, primary action button to resume or start investigation.
  - **Level 3**: Locked with padlock icon (`[Lock]`), grayed out, displaying required unlock condition.
- **Close Action**: Swipe down on drag pill or tap `[Close]` to dismiss sheet and return to previous view.

---

## 5. Shared PIN Lock Screen Component (`SharedPinLockpad`)

Universal security lockpad protecting private micro-app roots or confidential items (*Techcornbank, Photos hidden album, Zola hidden chat*) per `app-design.md` Section 3.3:

```
┌────────────────────────────────────────────────────────┐
│ [< Thoát ra]              KHÓA BẢO MẬT                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│                     [Lock] KHÓA MÃ PIN                 │
│               Nhập mã PIN 4 số để truy cập             │
│                                                        │
│                    ○   ○   ○   ○                       │
│                   (Chấm nhập mã)                       │
│                                                        │
├────────────────────────────────────────────────────────┤
│               ┌─────┐   ┌─────┐   ┌─────┐              │
│               │  1  │   │  2  │   │  3  │              │
│               └─────┘   └─────┘   └─────┘              │
│               ┌─────┐   ┌─────┐   ┌─────┐              │
│               │  4  │   │  5  │   │  6  │              │
│               └─────┘   └─────┘   └─────┘              │
│               ┌─────┐   ┌─────┐   ┌─────┐              │
│               │  7  │   │  8  │   │  9  │              │
│               └─────┘   └─────┘   └─────┘              │
│                         ┌─────┐   ┌─────┐              │
│                         │  0  │   │[Del]│              │
│                         └─────┘   └─────┘              │
├────────────────────────────────────────────────────────┤
│ [Alert] Sai mã sẽ làm tăng mức độ nghi ngờ của chồng!  │
│ Số lần thử còn lại: [ • • • ] (3/4)                    │
└────────────────────────────────────────────────────────┘
```

- **Interactive Keypad Rules**:
  - **4-Digit Input Indicator**: Sequential dot fills (`○` -> `●`).
  - **Ergonomics**: Circular number buttons ($\ge 68\text{px} \times 68\text{px}$), bold $24\text{px}$ numbers, Charcoal Soft `#334155` default, pressed glow `#6366F1`.
  - **Error Penalty Feedback**: Incorrect PIN triggers a $400\text{ms}$ horizontal shake, clears dots, flashes `#EF4444`, and decrements remaining strikes.
  - **Exit Button**: `[< Thoát ra]` returns to previous screen without penalty.

---

## 6. Top Notification Toast Banner (`NotificationBanner`)

Simulated real-time incoming notification toast sliding down over active viewports per `app-design.md` Section 3.4:

```
┌────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐ │
│ │ [MessageCircle] Zola • Vừa xong            [Close] │ │
│ │ Anh Tuấn Thợ Điện: "Tối mai anh đón em chỗ cũ nhé" │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ (Giao diện ứng dụng đang mở bên dưới)                  │
└────────────────────────────────────────────────────────┘
```

- **Tokens & Behavior**:
  - **Glass Surface**: Light Toast Glass (`.glass-toast-light`: `rgba(255, 255, 255, 0.92)`, blur $16\text{px}$, `#E2E8F0` border, $16\text{px}$ radius).
  - **Timing & Transitions**: Enters with a $250\text{ms}$ spring curve from top of viewport; auto-dismisses after $5\text{s}$ or when player taps `[Close]`.
  - **Direct Navigation**: Tapping banner opens corresponding app (`Zola`) and navigates directly to the referenced conversation.

---

## 7. Fullscreen Toggle & PWA Standalone Guidance Sheet (`PhoneOSPwaGuideSheet`)

To eliminate browser toolbars (Safari top/bottom bars and Chrome omnibox) and provide an authentic native app feeling:

```
┌────────────────────────────────────────────────────────┐
│ 23:45        [Dynamic Island]    [Signal] 5G [Batt 42%]│
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ ══════════════════ [ ── ] ════════════════════     │ │
│ │ CHƠI NHƯ ỨNG DỤNG THẬT                       [X]   │ │
│ │ Ẩn thanh công cụ Safari / Chrome để chơi full màn  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │  (1) Trên Safari: Chạm nút Chia sẻ [Share] ở dưới. │ │
│ │      Trên Chrome: Chạm dấu ba chấm [Menu] ở trên.  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │  (2) Chọn "Thêm vào Màn hình chính" (Add to Home)  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │  (3) Mở game từ icon ngoài màn hình chính để chơi   │ │
│ │      toàn màn hình 100% không thanh duyệt web!     │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [          ĐÃ HIỂU, TIẾP TỤC CHƠI                ] │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Universal Fullscreen Toggle**:
  - Located inside AssistiveTouch quick action menu: `[Fullscreen] Toàn màn hình` (`toggleFullscreen()`).
  - On desktop and Android Chrome: invokes native `requestFullscreen()` to conceal browser chrome.
  - On iOS Safari (where `requestFullscreen` on DOM elements is blocked by Apple): launches the PWA guide sheet above with 3 clear steps.
- **PWA Standalone Configuration**:
  - Standalone meta tags (`apple-mobile-web-app-capable: yes`, `black-translucent` status bar) ensure that adding to home screen boots the game in a 100% chromeless standalone window.
- **Scroll & Elastic Bounce Suppression**:
  - Viewport bound to `position: fixed; inset: 0; overscroll-behavior: none;` preventing rubber-banding and accidental page reloads.

---

## 8. Mobile Browser Viewport Architecture: Non-Fullscreen vs Fullscreen PWA

### 8.1. View A: Chế độ Trình duyệt Di động (Non-Fullscreen Safari/Chrome)
Hiển thị đầy đủ giao diện trình duyệt thật của người chơi bao bọc quanh game:

```
┌────────────────────────────────────────────────────────┐
│ 09:41              [ Hardware Notch ]       [Signal 🛜]│ <-- Thiết bị thật của người chơi
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Aa]  [Lock] game.bat-tieu-tam.vn            [Reload]│ │ <-- Safari Top Address Bar (Omnibox)
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Fullscreen] Trải nghiệm nhập vai tốt hơn [Bật >]  │ │ <-- In-Game Immersion Prompt Banner
│ └────────────────────────────────────────────────────┘ │
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
│                                                        │
│                         23:45                          │
│                Thứ Ba, 13 tháng 10                     │
│                                                        │
│  [Shopoo]       [Grap]          [NetSurf]     [Photos] │
│                                                        │
│                 ••••   [ [Search] Tìm kiếm ]           │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Zola](3)     [techcornbank](1)    [Comms](2)    [Notes]│ │
│ └────────────────────────────────────────────────────┘ │
│                                             [Assistive]│
│                 ═══════ [ - ] ═══════                  │
├────────────────────────────────────────────────────────┤
│  [Back]     [Forward]     [Share]     [Bookmark] [Tabs]│ <-- Safari Bottom Toolbar
├────────────────────────────────────────────────────────┤
│                 ═══════ [ - ] ═══════                  │ <-- Hardware Home Bar máy thật
└────────────────────────────────────────────────────────┘
```

### 8.2. View B: Chế độ Toàn Màn Hình (Fullscreen / PWA Standalone)
100% không gian hiển thị được dành cho hệ điều hành ảo của game, loại bỏ hoàn toàn viền và thanh công cụ trình duyệt:

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] 5G [Batt 42%]
│                                                        │
│                         23:45                          │
│                Thứ Ba, 13 tháng 10                     │
│                                                        │
│  [Shopoo]       [Grap]          [NetSurf]     [Photos] │
│                                                        │
│                 ••••   [ [Search] Tìm kiếm ]           │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Zola](3)     [techcornbank](1)    [Comms](2)    [Notes]│ │
│ └────────────────────────────────────────────────────┘ │
│                                             [Assistive]│
│                 ═══════ [ - ] ═══════                  │
└────────────────────────────────────────────────────────┘
```


