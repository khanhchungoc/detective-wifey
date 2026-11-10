---
type: Wireframe
status: signed-off
revision: 2
signed_off_at: "2026-11-10"
description: "Universal Evidence Long-Press Dark Context Menu, Pinned Red Bookmark Marker, and Quick Unpin ASCII wireframe for US-011."
tags: [requirement, wireframe, evidence, long-press, context-menu, bookmark, us-011]
---

# Bằng Chứng Nghi Vấn - Menu Ngữ Cảnh Nền Tối & Đánh Dấu Đã Ghim

## Người dùng, mục tiêu và bối cảnh

- Người chơi (Người Vợ) nhấn giữ vào các đoạn hội thoại, cuộc gọi, giao dịch, hóa đơn, ảnh hoặc ghi chú đáng ngờ trong các ứng dụng để kiểm tra, ghim vào Sổ Tay Bắt Ghen, nhận biết mục nào đã ghim qua huy hiệu đánh dấu màu đỏ, và có thể bỏ ghim nhanh ngay tại nguồn.
- Nền tảng: Ứng dụng web trong khung điện thoại giả lập (`375px-430px`, `100dvh`); kích hoạt từ bất kỳ dữ liệu câu chuyện động nào bọc `StoryEvidenceTarget`.
- Tham chiếu User Story: [US-011](../us-011-zero-spoiler-universal-long-press-clue-suspect-pinning.md).
- Trạng thái: Bản sửa đổi 2 (Phase 1 ASCII), đã được người dùng duyệt ngày 10/11/2026.

## Nguồn đối chiếu

- [Thiết kế Hệ thống Chung](../../../../project-knowledge-base/solution-context/design-system/design.md): Mục 2.7 (nguyên tắc Zero-Spoiler trước khi ghim & ngoại lệ dấu đỏ sau khi ghim), Mục 3.1.1 (`text-ios-*`), Mục 4 (Ionicons), Mục 5 (nhấn giữ `380ms`).
- [Design Tokens](../../../../project-knowledge-base/solution-context/design-system/tokens.md): `.glass-elevated`, `--sys-surface-elevated`, `--sys-badge-red` (`#EF4444`).
- [Hành vi & Chuyển động](../../../../project-knowledge-base/solution-context/design-system/behaviors-motion.md): Mục 1.2 (ngoại lệ đóng context menu qua chạm nền mờ hoặc phím `Escape`).
- [Thiết kế Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md): Mục 3.1 giao diện context menu nền tối.
- [Tính năng Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md): Mục 2.2 cơ chế ghim, dấu đỏ đồng bộ và bỏ ghim tại nguồn.
- [Thẻ manh mối dùng chung](../../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-clue-card.md): Quy chuẩn gom nhóm manh mối theo liên hệ/cuộc trò chuyện.
- [Biên bản khám phá](../../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md): Xác nhận ngưỡng `380ms`, context menu nền tối 1 nút tiếng Việt, huy hiệu đỏ trên mọi mục đã ghim và thao tác bỏ ghim tại chỗ.

## Danh sách màn hình & trạng thái

| Mã | Trạng thái / Màn hình | Thành phần chính |
|---|---|---|
| M1 | Nhấn giữ dữ liệu chưa ghim (`380ms`) | Giữ nguyên UI sạch (Zero-Spoiler), co nhẹ `scale-[0.98]`, rung haptic `50ms` khi đạt `380ms` |
| M2 | Context Menu nền tối (Chế độ Ghim) | Nền mờ tối, mục đang chọn nổi sáng có viền highlight, thẻ `.glass-elevated` neo ngay dưới/trên mục, tóm tắt 2 dòng + phụ đề nguồn/giờ, 1 hàng nút `"Ghim vào Sổ tay"` + `[IoBookmarkOutline]` |
| M3 | Đánh dấu đã ghim trên mọi ứng dụng | Huy hiệu tròn màu đỏ (`#EF4444`) chứa icon `[IoBookmark]` màu trắng gắn ở góc/cạnh phải mọi `StoryEvidenceTarget` đã ghim (không hiện trên mục chưa ghim) |
| M4 | Context Menu nền tối (Chế độ Bỏ ghim) | Khi nhấn giữ lại vào mục đã có dấu đỏ, hàng hành động đổi thành `"Bỏ ghim khỏi Sổ tay"` (chữ cảnh báo nổi bật) + `[IoBookmark]`; bấm để gỡ khỏi Sổ tay và xóa dấu đỏ |

---

## Bố cục từng màn hình

### M1 - Trạng thái mặc định & nhấn giữ dữ liệu câu chuyện (`380ms Hold`)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
| [< Tin nhắn]      Anh Tuấn Thợ Điện            |
|------------------------------------------------|
|                                                |
|  [Anh Tuấn]                                    |
|  +------------------------------------------+  |
|  | Tối nay 20h48 anh qua kiểm tra đường     |  |
|  | điện cho em nhé!                         |  |
|  +------------------------------------------+  |
|                                                |
|  [Đang nhấn giữ >= 380ms]                      |
|  -> Thu nhỏ nhẹ (scale-[0.98]), rung 50ms      |
|  -> Thả trước 380ms hoặc trượt > 18px: HỦY     |
|  -> Mục chưa ghim: KHÔNG có bất kỳ dấu hiệu nào|
|  -> Thanh điều hướng, Back, Tab bar: KHÔNG bấm |
+------------------------------------------------+
```

- Nhấn giữ `>= 380ms` (hoặc `Enter` / `Space` / `Shift+F10` khi focus bằng bàn phím) trên dữ liệu văn bản, cuộc gọi, giao dịch, đơn hàng, ảnh hoặc ghi chú sẽ kích hoạt menu kiểm tra.
- Chạm nhanh (`< 380ms`) thực hiện hành vi mặc định của ứng dụng (ví dụ mở chi tiết hội thoại), không mở menu ghim.
- Cuộn màn hình hoặc dịch chuyển ngón tay quá `18px` sẽ tự động hủy bộ đếm giờ.

---

### M2 - Context Menu nền tối (`UniversalEvidenceModal` - Chưa ghim)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
|================================================|
|    (Nền ứng dụng phía sau bị phủ tối & mờ:     |
|       bg-black/60 backdrop-blur-md)            |
|                                                |
|  +==========================================+  |
|  | Tối nay 20h48 anh qua kiểm tra đường     |  | <- Mục đang chọn nổi sáng
|  | điện cho em nhé!                         |  |    (ring-2 ring-white/75)
|  +==========================================+  |
|                                                |
|  +------------------------------------+        |
|  | Tối nay 20h48 anh qua kiểm tra...  |        | <- text-ios-subheadline (#FFF, tối đa 2 dòng)
|  | Zola · 15/10 · 20:48               |        | <- text-ios-footnote (#94A3B8)
|  |------------------------------------|        | <- Đường kẻ mảnh rgba(255,255,255,0.12)
|  | Ghim vào Sổ tay       [IoBookmark] |        | <- Hàng nút duy nhất (>= 44px)
|  +------------------------------------+        |
|                                                |
|    (Chạm ra ngoài vùng menu hoặc bấm Esc       |
|     để đóng mà không ghim)                     |
+------------------------------------------------+
```

- **Định vị & Highlight**:
  - Khi kích hoạt từ phần tử trong DOM, đo tọa độ `anchorRect` của phần tử tại thời điểm mở để làm nổi sáng vùng mục được chọn lên trên lớp phủ mờ và neo thẻ menu ngay bên dưới (tự động lật lên phía trên nếu gần đáy màn hình, hoặc căn giữa an toàn nếu kích thước phần tử quá lớn như ảnh phóng to / email dài).
- **Vật liệu & Màu sắc (chuẩn `tokens.md` & `design.md`)**:
  - Nền thẻ menu: `.glass-elevated` / `--sys-surface-elevated` (`bg-slate-900/90` / `rgba(15, 23, 42, 0.92)`, `backdrop-filter: blur(20px)`), bo góc `16px` (`rounded-2xl`), viền mảnh `border-white/15`, bóng đổ `shadow-2xl`, chiều rộng gọn (`max-w-[300px]` - `w-full`).
  - Khối tóm tắt phía trên:
    - Dòng chính: `text-ios-subheadline font-semibold text-white` (cắt tối đa 2 dòng `line-clamp-2`).
    - Dòng phụ: `text-ios-footnote text-[#94A3B8]` (nguồn ứng dụng/tiêu đề và thời gian sự kiện, ví dụ `Zola · 15/10 · 20:48`, đạt tương phản `>= 4.5:1`).
  - Đường phân cách mảnh: `border-t border-white/12`.
  - Hàng hành động duy nhất phía dưới (`min-h-[44px]`, bấm toàn chiều rộng hàng):
    - Bên trái: `"Ghim vào Sổ tay"` (`text-ios-body text-white`).
    - Bên phải: icon Ionicons `IoBookmarkOutline` (`20px`, màu trắng).
- **Thao tác đóng**:
  - Không hiển thị nút `[X]` và không thêm hàng nút `"Bỏ qua"` riêng; chạm vào lớp phủ mờ bên ngoài hoặc bấm `Escape` sẽ đóng menu và trả focus về phần tử vừa kích hoạt.

---

### M3 - Đánh dấu ĐÃ GHIM trên mọi ứng dụng (`StoryEvidenceTarget` Red Marker)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
| [< Tin nhắn]      Anh Tuấn Thợ Điện            |
|------------------------------------------------|
|                                                |
|  +----------------------------------+          |
|  | Tối nay 20h48 anh qua kiểm tra   |  (BM-Đỏ) | <- Huy hiệu tròn đỏ #EF4444
|  | đường điện cho em nhé!           |          |    chứa IoBookmark trắng
|  +----------------------------------+          |
|                                                |
|  +----------------------------------+          |
|  | Dạ vâng tối nay em ở nhà ạ       |          | <- Mục chưa ghim: không dấu hiệu
|  +----------------------------------+          |
|                                                |
|  (Áp dụng thống nhất trên mọi app:             |
|   Tin nhắn, Cuộc gọi, Ngân hàng, Đơn hàng,     |
|   Ảnh/EXIF, Email, Ghi chú, Mạng XH...)        |
+------------------------------------------------+
```

- **Quy tắc hiển thị huy hiệu đỏ**:
  - Chỉ hiển thị trên các `StoryEvidenceTarget` có dữ liệu khớp với bằng chứng đang nằm trong Sổ tay của phiên chơi (`PlaySession.taggedSuspects`).
  - Mục chưa từng được ghim (dù là manh mối thật hay bẫy) tuyệt đối không hiển thị bất kỳ viền hay biểu tượng nào.
  - Hình dáng huy hiệu: vòng tròn nhỏ (`22px x 22px`, `rounded-full`, nền `--sys-badge-red` `#EF4444`, viền trắng mảnh `border border-white/80`, bóng đổ nhẹ), bên trong là icon Ionicons `IoBookmark` màu trắng (`12px`), gắn `pointer-events-none` và `aria-hidden="true"` ở góc/cạnh phải mà không làm xô lệch layout hàng/thẻ của các ứng dụng.
  - Đồng bộ 2 chiều: Khi xóa mục hoặc xóa cả thẻ trong Sổ tay (bao gồm qua nút Xóa trong `WifeNotebookModal`), huy hiệu đỏ tại ứng dụng nguồn lập tức biến mất; khi bấm Hoàn tác trong Sổ tay, huy hiệu đỏ hiện lại tương ứng.

---

### M4 - Context Menu nền tối khi nhấn giữ lại mục ĐÃ GHIM (Bỏ ghim nhanh)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
|================================================|
|    (Nền tối mờ bg-black/60 backdrop-blur-md)    |
|                                                |
|  +==========================================+  |
|  | Tối nay 20h48 anh qua kiểm tra đường     |  | <- Mục đã ghim nổi sáng
|  | điện cho em nhé!                 (BM-Đỏ) |  |
|  +==========================================+  |
|                                                |
|  +------------------------------------+        |
|  | Tối nay 20h48 anh qua kiểm tra...  |        |
|  | Zola · 15/10 · 20:48               |        |
|  |------------------------------------|        |
|  | Bỏ ghim khỏi Sổ tay   [IoBookmark] |        | <- Đổi sang trạng thái Bỏ ghim
|  +------------------------------------+        |
+------------------------------------------------+
```

- Khi người chơi nhấn giữ (`>= 380ms` hoặc bàn phím) vào một mục đang ở trạng thái **đã ghim**:
  - Hàng hành động hiển thị nhãn `"Bỏ ghim khỏi Sổ tay"` (`text-ios-body text-[#FCA5A5]`, tương phản `>= 4.5:1` trên nền tối) cùng icon Ionicons `IoBookmark` (filled, màu `#F87171`).
  - Khi bấm `"Bỏ ghim khỏi Sổ tay"`:
    - Nếu mục đó là một tin nhắn nằm trong thẻ hội thoại gom nhóm (`conversationId`), xóa riêng tin nhắn đó khỏi thẻ qua `removePinnedMessage` (nếu là tin nhắn cuối cùng và cuộc trò chuyện không được ghim riêng thì xóa cả thẻ; nếu cuộc trò chuyện từng được ghim riêng thì giữ thẻ chỉ có tên).
    - Nếu mục đó là thẻ hội thoại/liên hệ/giao dịch/đơn hàng độc lập, gỡ qua `removePinnedCard` (hoặc bỏ cờ ghim hội thoại nếu bên trong vẫn còn tin nhắn con? Nếu ghim lại tên hội thoại thì gỡ thẻ hay chỉ gỡ cờ: theo `wireframe-clue-card.md`, xóa cấp hội thoại/thẻ gỡ cả thẻ đó; đối với bản ghi độc lập như giao dịch/đơn hàng/ảnh/cuộc gọi sẽ xóa thẻ tương ứng).
    - Đóng menu, xóa ngay dấu đỏ trên màn hình ứng dụng và hiển thị thông báo trên Đảo động trong 2 giây (`Đã bỏ ghim "..." khỏi Sổ tay.`).

---

## Thành phần và ràng buộc tương tác

| Thành phần | Quy chuẩn thiết kế | Ràng buộc kỹ thuật |
|---|---|---|
| Cử chỉ nhấn giữ | Thời gian giữ `>= 380ms`, dung sai xê dịch ngón tay `<= 18px` | Kích hoạt `onTriggerEvidence`, chặn `contextmenu` mặc định, hỗ trợ `Enter` / `Space` / `Shift+F10` |
| Phản hồi xúc giác | Web Vibration API (`navigator.vibrate(50)`) | Bỏ qua mượt mà trên thiết bị không hỗ trợ |
| Vùng chạm nút | Hàng hành động cao tối thiểu `44px` (`min-h-[44px]`) | Đạt chuẩn tiếp cận Apple HIG và WCAG 2.1 AA |
| Biểu tượng & Typography | Chỉ dùng Ionicons v5 (`IoBookmarkOutline`, `IoBookmark`) và token `text-ios-*` | Cấm Unicode emoji thô, cấm Lucide, cấm class pixel cứng `text-[...px]` |
| Bảo mật manh mối | Mục chưa ghim hoàn toàn không có dấu hiệu; huy hiệu đỏ chỉ hiện sau khi tự ghim | Giữ đồng bộ trạng thái giữa `StoryEvidenceTarget`, `UniversalEvidenceModal` và `PlaySession.taggedSuspects` |
