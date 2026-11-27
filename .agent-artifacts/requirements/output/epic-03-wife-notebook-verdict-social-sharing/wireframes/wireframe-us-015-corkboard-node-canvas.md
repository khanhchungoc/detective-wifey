# Sổ Tay Bắt Ghen - Bảng Điều Tra Nối Dây (Detective Corkboard Node Canvas) ASCII Wireframe

**App ID**: `wife_notebook`  
**Parent Epic**: [`epic-03-wife-notebook-verdict-social-sharing`](../epic.md)  
**Related User Story**: [`us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md`](../us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md)  
**Parent Specification**: [evidence-board/app-design.md](../../../../project-knowledge-base/solution-context/apps/phone-os/evidence-board/app-design.md)  
**Functional Features**: [evidence-board/features.md](../../../../project-knowledge-base/solution-context/apps/phone-os/evidence-board/features.md)  
**Viewport Target**: Mobile Portrait Viewport (393px × 852px base container)  
**Interaction Paradigm**: 2A Mobile-Optimized Detective Corkboard (Tap-to-Connect Red-String Graph Canvas)  
**Design Standard**: Strict Zero-Emoji Invariant, Canonical Ionicons (`react-icons/io5`), Parchment Corkboard Texture, High-Contrast Node Cards  

---

## 1. Physical Container & Top Navigation Header

```
┌────────────────────────────────────────────────────────────────────────┐
│ 23:45 [App: SoTay]                         [Signal: 5G] [||||] [Batt: 42%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Back] Quay lại     BẢNG ĐIỀU TRA NỐI DÂY               [Radar: MiniMap]│
├────────────────────────────────────────────────────────────────────────┤
│ [Tab: BangNoiDay (Active)]           [Tab: PhanQuyet (DoiChat)]        │
│ ══════════════════════════           ──────────────────────────        │
```

- **Top Bar Surface**: Darkroom Slate Header (`#090C10` - `#111722`) with `#F1F5F9` text and forensic status indicators.
- **[Back] Button**: Closes the Notebook and returns to the active virtual app or OS home screen.
- **[Radar: MiniMap]**: Compact floating radar indicator (44px × 44px) showing the player's current viewport relative to the overall 2D canvas boundary (1200px × 1200px virtual canvas).
- **Segmented Tabs**:
  - `[Tab: BangNoiDay]`: Interactive 2D Node Canvas.
  - `[Tab: PhanQuyet]`: Final Verdict Confrontation & Accusation Hub.

---

## 2. Screen 1: Canvas Viewport & Node Canvas Layout

> **Mobile Viewport Invariant**: To prevent gesture collision with OS back navigation (`useSwipeBack`), horizontal/vertical panning is constrained to single-finger drag on empty canvas. Two-finger pinch gestures zoom continuously between 0.5x and 2.0x centered around the touch midpoint, with `touch-action: none` applied to the canvas container. Double-tapping empty canvas toggles between 1.0x and 1.5x zoom.
>
> **Crisp Zoom Rendering Invariant**: Panning (`transform: translate(...)`) and zooming (CSS `zoom`) must remain decoupled on separate wrappers—never apply `transform: scale(...)` on the virtual plane containing rotated evidence cards, which causes 1x GPU bitmap upscaling and blurry card text when `zoom > 1`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   ┌──────────────────────┐              ┌──────────────────────┐       │
│   │ [Mask] VO BOC  [Loc] │              │ [Phone] SĐT   [Loc]  │       │
│   │ "Anh Tuấn Thợ Điện"  │══(Vàng)══════╡ 0988886677           │       │
│   │ [Zola] 23:44 Tra ao  │              │ [Phone] [Shopoo]     │       │
│   └──────────────────────┘              └──────────┬───────────┘       │
│                                                    │                   │
│                                                 (Vàng)                 │
│                                                    │                   │
│   ┌──────────────────────┐              ┌──────────▼───────────┐       │
│   │ [Clock] 20:46  [Loc] │              │ [Cart] DON HANG[Loc] │       │
│   │ "Chồng: Vẫn đang họp"│              │ Váy be S + Thiệp     │       │
│   └──────────┬───────────┘              │ "Nguyen Thi Thu Huong"       │
│              │                          └──────────┬───────────┘       │
│         (Đỏ: Mâu Thuẫn)                            │                   │
│              │                                  (Vàng)                 │
│   ┌──────────▼───────────┐                         │                   │
│   │ [Bank] 20:48   [Loc] │              ┌──────────▼───────────┐       │
│   │ Com Nieu Pho Co 640k │              │ [Target] THU PHAM    │       │
│   │ (Lech loi khai!)     │              │ Nguyễn Thị Thu Hương │       │
│   └──────────────────────┘              │ Marketing            │       │
│                                         └──────────────────────┘       │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Zoom: -] [100%] [Zoom: +]     [Auto-Arrange]    [Reset-View: Center]  │
├────────────────────────────────────────────────────────────────────────┤
│ [Drawer-Handle: ^] KHAY MANH MỐI MỚI (3 thẻ chưa kéo vào bảng)         │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Card: SMS 1900]   [Card: Grap 18:30]   [Card: GhiChu MatKhau]     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- **Yarn String Visual Types (2 Types)**:
  - **Critical / Key Evidence (`contradicts_alibi` or verified smoking-gun / required key edge)**: Red solid (`#DC2626`) — highest-priority links (alibi contradictions and verified smoking-gun connections such as phone/order match).
  - **Neutral (All other connections)**: Yellow solid (`#FBBF24`, solid) — supporting and speculative evidence links.
- **`[Loc]` / Clue Location Jump Icon Button (`IoNavigateOutline`)**: Compact icon button positioned on the top-right header of each clue node card (touch target 36px × 36px). Tapping this icon activates deep-link navigation directly to the original clue location (source parody app and specific conversation/screen), completely decoupled from the card body tap gesture (which remains dedicated to tap-to-connect yarn string pairing).

---

## 3. Screen 2: Tap-to-Connect Pairing Mode (Mobile One-Handed Interaction)

> **Tap-to-Connect Invariant**: Mobile screens make dragging cables between small pins imprecise. Players tap Node A to select it, then tap Node B to create an edge.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 23:45 [App: SoTay]                         [Signal: 5G] [||||] [Batt: 42%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Cancel-Link: X]  ĐANG NỐI DÂY: Chọn thẻ thứ hai để kết nối...         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────────────────────────┐                                 │
│   │ [Active-Node: Highlight-Pulsing] │                                 │
│   │ [Mask] "Anh Tuấn Thợ Điện"  [Loc]│                                 │
│   │ Trạng thái: ĐANG CHỌN ĐẦU DÂY    │                                 │
│   └─────────────────┬────────────────┘                                 │
│                     ┆ (Đường nét đứt dẫn hướng theo ngón tay)          │
│                     ▼                                                  │
│   ┌──────────────────────────────────┐                                 │
│   │ [Target-Candidate: Glow-Green]   │                                 │
│   │ [Phone] SĐT: 0988886677     [Loc]│ <── Nhấn vào đây để CHỐT NỐI    │
│   │ Chạm để hoàn tất nối dây         │                                 │
│   └──────────────────────────────────┘                                 │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ GỢI Ý NỐI DÂY:                                                         │
│ • Nối Vỏ bọc với SĐT / Tên tài khoản để bóc trần chân tướng.          │
│ • Nối 2 mốc thời gian lệch nhau để tạo bằng chứng Mâu thuẫn lời khai.  │
├────────────────────────────────────────────────────────────────────────┤
│ [Button: HuyNoiDay] Huỷ thao tác               [Button: CatDay] Cắt dây│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Screen 3: Identity Unmasking & Cluster Snap (Zero-Spoiler Resolution)

> **Zero-Spoiler Progression**: When a mystery alias card connects via a bridge identifier to a suspect's legal identity, the cards trigger a celebratory snap animation and merge into an unmasked suspect card.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 23:45 [App: SoTay]                         [Signal: 5G] [||||] [Batt: 42%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Back] Quay lại     BẢNG ĐIỀU TRA NỐI DÂY               [Radar: MiniMap]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ [Check-Circle] ĐÃ BÓC TRẦN DANH TÍNH TIỂU TAM!               │     │
│   │ ════════════════════════════════════════════════════════════ │     │
│   │ [Target] NGUYỄN THỊ THU HƯƠNG (Marketing Technosoft)         │     │
│   │                                                              │     │
│   │ • Vỏ bọc Zola: "Anh Tuấn Thợ Điện"                           │     │
│   │ • Số điện thoại trùng khớp: 0988886677 (Danh bạ & Đơn Shopee)│     │
│   │ • Tên nhận hàng & Tài khoản: Nguyen Thi Thu Huong            │     │
│   │                                                              │     │
│   │ [Trạng thái: 🔗 Đã nối 3 mắt xích chứng cứ hoàn chỉnh]       │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ [Warning] MÂU THUẪN NGOẠI PHẠM ĐÃ XÁC LẬP                    │     │
│   │ • 20:46 Zola: "Vẫn đang họp công ty"                         │     │
│   │ • 20:48 Bank: Thanh toán Cơm Niêu Phố Cổ 640.000đ            │     │
│   │ ──> Chứng cứ nói dối vợ không thể chối cãi!                  │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ TIẾN ĐỘ ĐIỀU TRA: [||||||||||||||||||||] 3/3 Bằng chứng cốt lõi        │
├────────────────────────────────────────────────────────────────────────┤
│ [Button: ChuyenSangPhanQuyet] SẴN SÀNG ĐỐI CHẤT VỚI CHỒNG! [Arrow-Right]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Screen 4: "Khay Manh Mối Chưa Phân Loại" (Bottom Drawer Sheet)

> **Ergonomics**: Newly pinned items from long-pressing app elements land in this bottom sheet so they don't clutter the 2D canvas until the player intentionally places them.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ══════ [Drag-Handle] ══════                     │
│ KHAY MANH MỐI THU THẬP (3 thẻ sẵn sàng đưa lên bảng)            [Close]│
├────────────────────────────────────────────────────────────────────────┤
│ [Filter: Tất cả]     [Filter: Tin nhắn]   [Filter: Hoá đơn]   [Filter: SĐT] │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Cart] Váy lụa Satin Size S (Đơn Shopee #SPX-8821)                 │ │
│ │ Chi tiết: Người nhận "Nguyen Thi Thu Huong" - SĐT 0988886677        │ │
│ │ [Button: DuaLenBang] Đưa lên bảng   [Button: DenViTri] Đi tới nguồn│ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Bank] Hoàn tiền ăn trưa 160.000đ                                  │ │
│ │ Chi tiết: Tài khoản chuyển: Nguyen Thi Thu Huong                   │ │
│ │ [Button: DuaLenBang] Đưa lên bảng   [Button: DenViTri] Đi tới nguồn│ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Call] Cuộc gọi đêm 23:30 (96 giây)                                │ │
│ │ Chi tiết: Gọi đến "Anh Tuấn Thợ Điện" (0988886677)                 │ │
│ │ [Button: DuaLenBang] Đưa lên bảng   [Button: DenViTri] Đi tới nguồn│ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- **`[Button: DenViTri]` Button (`IoNavigateOutline`)**: Placed on each drawer card alongside `[Button: DuaLenBang]`. Allows players to inspect or re-verify where an unplaced clue was originally found before committing to place it on the corkboard canvas.

---

## 6. Screen 5: Clue Source Deep-Link View & Omnipresent Quick-Return Pill

> **Navigation & State Preservation Invariant**: Deep-linking to a clue location minimizes the Wife's Detective Notebook into an omnipresent top floating return pill (`Quay lại Sổ tay`) without destroying canvas state, pan/zoom offsets, or active connection drafts.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 23:45 [App: Zola]                          [Signal: 5G] [||||] [Batt: 42%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Pill: QuayLaiSoTay] ⤺ Quay lại Sổ tay Điều tra               [Close: X]│
├────────────────────────────────────────────────────────────────────────┤
│ [Back] Trò chuyện     "Anh Tuấn Thợ Điện"                  [Phone] [More]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [Avatar]  [Anh Tuấn Thợ Điện] 23:40                                  │
│             ┌──────────────────────────────────────────────┐           │
│             │ Em về đến nhà rồi nhé anh yêu...             │           │
│             └──────────────────────────────────────────────┘           │
│                                                                        │
│   [Avatar]  [Anh Tuấn Thợ Điện] 23:44                                  │
│             ┌──────────────────────────────────────────────┐ ◄──[PULSE] │
│             │ Mai anh nhớ mang áo sơ mi qua em giặt ủi nha │ [VỊ TRÍ   │
│             │ Chồng iu ngủ ngon :*                         │  MANH MỐI]│
│             └──────────────────────────────────────────────┘           │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Attach: +] [Input: Nhập tin nhắn...]                       [Send: Mic]│
└────────────────────────────────────────────────────────────────────────┘
```

- **`[Pill: QuayLaiSoTay]` Floating Quick-Return Banner**: Docked at the top of the viewport (`z-index: 9999`) immediately beneath the phone OS status bar. Features a high-contrast Crimson Alert background (`#E11D48`) with white text and return icon (`IoReturnUpBackOutline`). Tapping the pill immediately restores the Wife's Detective Notebook without losing canvas pan/zoom coordinates or unplaced drawer state.
- **Source Clue Auto-Scroll & Pulse Highlight**: The virtual app scrolls automatically to center the clue message/record, triggering a 1.5s glowing outline (`ring-2 ring-fuchsia-500 ring-offset-2 animate-pulse`) to orient the player.

---

## 7. Canonical Icon Mapping (`react-icons/io5`)

| Wireframe Token | Canonical Ionicons Component | Purpose |
|---|---|---|
| `[Back]` | `IoChevronBack` | Close notebook and return to virtual app/launcher |
| `[Radar: MiniMap]` | `IoScanOutline` | Visual viewport radar & canvas overview |
| `[Mask]` | `IoGlassesOutline` | Disguised contact alias node |
| `[Phone]` | `IoCallOutline` | Phone number identifier bridge node |
| `[Cart]` | `IoBagHandleOutline` | E-commerce order / parcel record node |
| `[Bank]` | `IoCardOutline` | Bank transaction / payment record node |
| `[Clock]` | `IoTimeOutline` | Timestamp & alibi node |
| `[Target]` | `IoPersonOutline` / `IoFlameOutline` | Suspect / Culprit profile node |
| `[Check-Circle]` | `IoCheckmarkCircle` | Solved link / verified identity badge |
| `[Warning]` | `IoAlertCircle` / `IoFlashOutline` | Alibi contradiction lightning edge |
| `[Zoom: +]` / `[Zoom: -]` | `IoAddOutline` / `IoRemoveOutline` | Canvas zoom controls |
| `[Auto-Arrange]` | `IoGridOutline` | Snap nodes into tidy semantic columns |
| `[Reset-View: Center]` | `IoLocateOutline` | Re-center canvas on active cluster |
| `[Cancel-Link: X]` | `IoCloseOutline` | Cancel tap-to-connect pairing mode |
| `[CatDay]` | `IoCutOutline` | Cut / remove existing connection line |
| `[Arrow-Right]` | `IoArrowForward` | Proceed to Verdict & Confrontation tab |
| `[Loc]` / `[DenViTri]` | `IoNavigateOutline` | Jump to original clue location in source parody app |
| `[Pill: QuayLaiSoTay]` | `IoReturnUpBackOutline` | Return back to corkboard canvas in Wife's Notebook |

