---
type: Wireframe
status: draft
description: "Anytime Confrontation Hub & Dynamic Excuse Engine ASCII wireframe for US-016."
tags: [requirement, wireframe, confrontation, excuse-engine, verdict, epic-03]
---

# Đối Chất & Chối Bay Chối Biến - Màn Hình Đối Chất Trực Tiếp

## Người dùng, mục tiêu và bối cảnh

- Người chơi (Người Vợ) có thể bấm "Đối chất" bất kỳ lúc nào từ Sổ Tay Bắt Ghen để thẩm vấn Chồng Hoàng theo từng nhịp hỏi cung (`confrontationScript`) hoặc chấm điểm bậc thang tự động ở các màn dự phòng.
- Hệ thống tự động đối chiếu các mối nối canonical đã giải mã trên Bảng Manh Mối (`requiredEdgeIds`) và nghi phạm đang chọn với dữ liệu sự thật (`groundTruth`).
- Nền tảng: Ứng dụng web trong khung điện thoại giả lập (`max-w-[480px] h-[100dvh]`, kiểm chuẩn mobile `390x844`); hiển thị dưới dạng phòng hỏi cung phủ toàn phần (`z-index: 80`, nền tối `bg-darkroom-bg` `#080b0f`).
- Tham chiếu User Story: [US-016](../us-016-anytime-confrontation-hub-dynamic-excuse-engine.md).
- Trạng thái: Đã cập nhật theo kiến trúc Phòng Thẩm Vấn, Phụ đề chạy chữ 13px dịu màu & Danh sách lựa chọn dọc đánh số.

## Nguồn đối chiếu

- [Thiết kế Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md): Mục 3.3 phòng thẩm vấn, đèn spotlight, Comic Hoàng, phụ đề chạy chữ 13px và danh sách lựa chọn dọc đánh số.
- [Tính năng Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md): Mục 2.4 state machine đối chất theo nhịp và fallback bậc thang.
- [Màn chơi Chồng Hoàng Màn 1](../../epic-04-detective-case-stories-level-content/us-027-husband-hoang-level-1-case-implementation.md): Mục 5 kịch bản đối chất 4 nhịp và lời thoại thú tội.
- [Biên bản khám phá](../../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md): Tự động đánh giá đồ thị, không gắp thẻ thủ công, phạt 1 vạch nghi ngờ khi đối chất thất bại.
- Thành phần mã nguồn thực tế: `WifeNotebookModal.tsx`, `confrontationEngine.ts`, `ConfrontationModal.tsx`, `HusbandCharacterImage.tsx`, `confrontationMotion.ts`, `graphEngine.ts`, `level01Fixture.ts`.

## Danh sách màn hình & trạng thái

| Mã | Trạng thái / Màn hình | Thành phần chính |
|---|---|---|
| M0-A | Chọn nghi phạm: Chưa lột mặt nạ | Khay Polaroid, vỏ bọc "Anh Tuấn Thợ Điện", ảnh túi đồ nghề, con dấu "NGHI PHẠM" |
| M0-B | Chọn nghi phạm: ĐÃ LỘT MẶT NẠ | Thẻ Polaroid chuyển hóa: tên thật "Nguyễn Thị Thu Hương", ảnh chân dung nữ, nhãn `Vỏ bọc: "Anh Tuấn Thợ Điện"` (`IoGlassesOutline`), manh mối `Trùng SĐT 0988886677` (`IoCallOutline`), dấu "ĐÃ LỘT MẶT NẠ" |
| M0-C | Xác nhận đối chất (Darkroom Casefile Dossier) | Tập hồ sơ niêm phong tối (`FILE 01`), 2 thẻ Polaroid giấy lạnh dập ghim nối chỉ đỏ đối đầu, thước đo tỉ lệ thành công, các cặp **Mắt xích suy luận (Linkage Bridges)**, nút dấu mộc đỏ "MÀY DÁM LỪA BÀ!" |
| M1 | Phòng thẩm vấn: Nhịp 1 Mở màn & Nhịp 2..N Chất vấn (Danh sách chọn dọc đánh số) | Sân khấu tối `#080b0f` + spotlight chiếu đỉnh + Comic Hoàng cỡ lớn (`confident` -> `nervous`), thanh tiến độ `- • -`, phụ đề 13px dịu màu chạy chữ, danh sách lựa chọn dọc đánh số (`1`, `2`, `3`) mở khóa sau khi chạy xong chữ |
| M2 | Nhánh False: Thiếu chứng cứ / Bẫy nghi ngờ (`smug` & Khóa kết tội) | Comic Hoàng cười cợt (`smug`), khóa hoàn toàn lựa chọn kết tội (`canAccuse = false`), cảnh báo trừ 1 lượt nghi ngờ khi rút lui, chỉ hiện nút "Quay lại điều tra" |
| M3 | Nhánh True Cuối -> Bước `End` (`broken` -> Phán quyết & Roast 3 sao) | Comic Hoàng suy sụp khóc xin tha (`broken`), mở khóa lựa chọn kết cục (`Ly hôn` / `Tha thứ`), đóng dấu phán quyết theo `groundTruth.verdict`, 3 sao, danh hiệu Vợ, Roast Card và qua màn |

---

## Bố cục từng màn hình

### M0 - Chọn Nghi Phạm & Lột Trần Vỏ Bọc (Suspect Selection & Dynamic Unmasking)

#### Trạng thái M0-A: Chưa lột mặt nạ (Chưa nối dây trùng SĐT)

```text
+------------------------------------------------+
|  Chọn nghi phạm                             [X]|
+------------------------------------------------+
|  +------------------------------------------+  |
|  |             (Khay gỗ bần cork)           |  |
|  |                                          |  |
|  |              [ Ghim đỏ 3D ]              |  |
|  |           +------------------+           |  |
|  |           | [ Túi đồ nghề ]  |           |  |
|  |           |     [NGHI PHẠM]  |           |  |
|  |           +------------------+           |  |
|  |            Anh Tuấn Thợ Điện             |  |
|  |           (Vỏ bọc chưa rõ)               |  |
|  |           +------------------+           |  |
|  |                                          |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```

#### Trạng thái M0-B: ĐÃ LỘT MẶT NẠ (Đã nối dây trùng SĐT 0988886677 trên bảng điều tra)

```text
+------------------------------------------------+
|  Chọn nghi phạm                             [X]|
+------------------------------------------------+
|  +------------------------------------------+  |
|  |             (Khay gỗ bần cork)           |  |
|  |                                          |  |
|  |              [ Ghim đỏ 3D ]              |  |
|  |           +------------------+           |  |
|  |           | [ Chân dung Nữ ] |           |  |
|  |           |  [ĐÃ LỘT MẶT NẠ] |           |  |
|  |           +------------------+           |  |
|  |          Nguyễn Thị Thu Hương            |  |
|  |      🎭 Vỏ bọc: Anh Tuấn Thợ Điện        |  |
|  |         📞 Trùng SĐT: 0988886677         |  |
|  |           +------------------+           |  |
|  |                                          |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```

#### Trạng thái M0-C: Xác Nhận Đối Chất (Darkroom Casefile Dossier & Linkage Bridges)

```text
+------------------------------------------------+
|  [<]         HỒ SƠ ĐỐI CHẤT               [X]  |
+------------------------------------------------+
|   +---------+                                  |
|   | FILE 01 |                                  |
| +-+---------+--------------------------------+ |
| |  IN PROGRESS                 [ #01 ]       | |
| |                                            | |
| |   +-------------+        +-------------+   | |
| |   | (Pin đỏ)    |        | (Pin đỏ)    |   | |
| |   | [Ảnh Hoàng] |══Chỉ đỏ| [Ảnh Bồ/Vỏ] |   | |
| |   |             |        | [NGHI PHẠM] |   | |
| |   | Hoàng       |        | Thu Hương   |   | |
| |   +-------------+        +-------------+   | |
| |                                            | |
| |  TỈ LỆ THÀNH CÔNG (ÁP LỰC KẾT TỘI)         | |
| |  [ ==== ] [ ==== ] [ ==== ] [ ==== ] [ ==== ]|
| |                                            | |
| |  CÁC MẮT XÍCH SUY LUẬN:                    | |
| |  +--------------------------------------+  | |
| |  | [App] Manh mối A (Điểm chạm)         |  | |
| |  |       ▲ [ 🔗 Nhãn liên kết ] ▼       |  | |
| |  | [App] Manh mối B (Điểm chạm)         |  | |
| |  +--------------------------------------+  | |
| |                                            | |
| |  ⚠️ Đối chất thất bại: mất 1 lượt nghi ngờ.| |
| |                                            | |
| |  +--------------------------------------+  | |
| |  | [💬] MÀY DÁM LỪA BÀ!          [ #01 ]|  | |
| |  +--------------------------------------+  | |
| |               Điều tra thêm                | |
| +--------------------------------------------+ |
+------------------------------------------------+
```

- Giao diện sử dụng phong cách **Darkroom Casefile Dossier** đồng bộ với bảng điều tra Cold War: nền tối sẫm, tập hồ sơ niêm phong tối (`#141A22`, viền trái `#E11D48`), tab `FILE 01`, font chính của dự án (`font-sans`), dấu mộc đỏ, ảnh Polaroid giấy lạnh (`#EEF2F6`) và phiếu chứng cứ giấy lạnh (`#EAEFF4`) ghim đinh đỏ nối bằng sợi chỉ đỏ.
- Phần tóm tắt bằng chứng hiển thị theo từng **Cặp mắt xích liên kết (Linkage Bridges)** trích xuất từ `verifiedStringsList` (chỉ giữ tiêu đề/điểm chạm cốt lõi + nhãn kết nối ở giữa), loại bỏ đoạn văn bản dài dòng thừa thông tin.

---

### M1 - Phòng Thẩm Vấn Theo Nhịp & Danh Sách Chọn Dọc Đánh Số (`opening` -> `beat`)

```text
+------------------------------------------------+
|                 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                 |
| [X]            ĐỐI CHẤT · HOÀNG      [Scale 0/5]|
|                  -  •  -  -  -                 |
|              ╱   (Spotlight)    ╲              |
|             ╱  [ Comic Hoàng ]   ╲             |
|            ╱ (confident / nervous)╲            |
|   Vợ : "Hoàng, anh có gì lừa dối tôi không?"   |
|   Hoàng : "Lừa dối gì? Anh họp tới tối mịt..." |
|                                                |
|------------------------------------------------|
| ANH TUẤN THỢ ĐIỆN LÀ AI?     Khoanh tay, tự tin|
|  +------------------------------------------+  |
|  | [1] Thợ điện nào dùng chung số 098888... |  |
|  +------------------------------------------+  |
|  +------------------------------------------+  |
|  | [2] Thảo PT California nhắn riêng cho... |  |
|  +------------------------------------------+  |
|  +------------------------------------------+  |
|  | [3] Lan Anh Kế Toán đòi anh chuyển...    |  |
|  +------------------------------------------+  |
|------------------------------------------------|
| HỒ SƠ #01 · HOÀNG                    BƯỚC 2/5  |
+------------------------------------------------+
```

- **Tầng trên**: Sân khấu phòng hỏi cung tối (`#080b0f`), đèn spotlight chiếu từ đỉnh xuống Comic Hoàng cỡ lớn (`HusbandCharacterImage` `max-w-[380px] max-h-[360px]` lấp đầy khoảng trống trên đầu, giữ nhịp thở nhẹ và giật lùi `POP` khi trúng chứng cứ), đi kèm thanh tiến độ `- • -` trên header.
- **Vùng phụ đề thoại**: Hiển thị liền trên nền tối dưới chân Hoàng (`text-ios-footnote` `13px`), giữ `Vợ :` ở tông trầm (`#78889C`) và `Hoàng :` (`#94A3B8`) chạy chữ từng ký tự (`22ms/ký tự`, tối đa `1600ms`, chạm/phím để hiện nhanh), tạo khoảng thở `pb-5` (`20px`) phía trên đường kẻ mảnh `border-darkroom-divider`.
- **Tầng dưới**: Danh sách lựa chọn dọc đánh số `1`..`4` (`min-h-[48px]`, `text-ios-subheadline` `15px` `#F1F5F9`), chỉ hiện và mở khóa bấm sau khi lời thoại của Hoàng chạy xong chữ (giữ nguyên chiều cao khung để tránh giật bố cục), hỗ trợ phím `1`-`4` và `ArrowUp`/`ArrowDown` trên desktop, chuyển cụm bằng spring `SNAP` (không overshoot).

---

### M2 - Nhánh False: Thiếu / Sai Chứng Cứ (`failed` - `smug` & Khóa Kết Tội)

```text
+------------------------------------------------+
| [X]            ĐỐI CHẤT · HOÀNG      [Scale 1/5]|
|                 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                 |
|              ╱   (Spotlight)    ╲              |
|             ╱  [ Comic Hoàng ]   ╲             |
|            ╱  (smug - cười cợt)   ╲            |
|------------------------------------------------|
|                  -  •  -  -  -                 |
|             THIẾU CHỨNG CỨ KẾT TỘI             |
|  +------------------------------------------+  |
|  | Vợ: "Thảo PT nhắn riêng cho anh..."      |  |
|  |------------------------------------------|  |
|  | Hoàng                  Nhếch mép, thách thức|
|  | "Người ta nhắc anh mang phiếu đánh giá   |  |
|  | cột sống. Em bắt được lưng đau, chưa bắt |  |
|  | được người tình."                        |  |
|  +------------------------------------------+  |
|------------------------------------------------|
|  +------------------------------------------+  |
|  | [!] Cảnh báo: Mất 1 lượt nghi ngờ (1/5)  |  |
|  | [ ■ □ □ □ □ ]                            |  |
|  +------------------------------------------+  |
|  +------------------------------------------+  |
|  |          [ QUAY LẠI ĐIỀU TRA ]           |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```

- Kích hoạt khi chọn phương án bẫy nghi ngờ (red herring), cáo buộc sai nghi phạm, hoặc chọn mũi chất vấn nhưng chưa nối đủ cạnh `requiredEdgeIds` trên Sổ tay.
- Hoàng chuyển sang biểu cảm `smug` kệch cỡm, khóa hoàn toàn `canAccuse = false` (tuyệt đối không hiển thị nút kết tội / tha thứ / thẻ Roast).
- Khi bấm `[ QUAY LẠI ĐIỀU TRA ]` hoặc đóng phòng đối chất, hệ thống trừ đúng 1 lượt nghi ngờ (nếu chạm mốc tối đa thì kích hoạt trạng thái bị phát hiện US-014).

---

### M3 - Nhánh True Cuối -> Bước `End` (`broken` -> Đóng Dấu Phán Quyết 3 Sao)

```text
+------------------------------------------------+
| [X]            ĐỐI CHẤT · HOÀNG      [Scale 0/5]|
|                 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                 |
|              ╱   (Spotlight)    ╲              |
|             ╱  [ Comic Hoàng ]   ╲             |
|            ╱ (broken - suy sụp)   ╲            |
|------------------------------------------------|
|                  -  -  -  -  •                 |
|            BẮT QUẢ TANG NGOẠI TÌNH             |
|  +------------------------------------------+  |
|  | Vợ: "Ký đơn đi. Tôi không sống với..."   |  |
|  |------------------------------------------|  |
|  | Hoàng                    Cúi đầu, nhận tội  |
|  | "Vợ ơi, anh van em... cho anh một cơ hội |  |
|  | thôi mà!"                                |  |
|  +------------------------------------------+  |
|  +------------------------------------------+  |
|  |                 ★ ★ ★                    |  |
|  |        [ NỮ THÁM TỬ GHEN TUÔNG ]         |  |
|  | "Thợ điện gì mà hẹn lại đúng ngày..."    |  |
|  +------------------------------------------+  |
|------------------------------------------------|
|  +------------------------------------------+  |
|  |       [ TẠO THẺ ROAST KHOE MXH ]         |  |
|  +------------------------------------------+  |
|  +------------------------------------------+  |
|  |        [ CHỐT HỒ SƠ & QUA MÀN ]          |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```

- Khi vượt qua nhịp chứng cứ then chốt cuối cùng, Hoàng sụp đổ (`broken`), mở khóa bước `ending` (`canAccuse = true`) trong danh sách lựa chọn dọc (ví dụ: `[1] end_divorce`, `[2] end_forgive`) sau khi lời thú tội chạy chữ xong.
- Sau khi chọn phán quyết, hệ thống đóng dấu kết quả bằng spring `POP` phù hợp `groundTruth.verdict` (`BẮT QUẢ TANG NGOẠI TÌNH` / `VẠCH TRẦN SUGAR DADDY` / `MINH OAN CHỒNG VÔ TỘI`), trao 3 sao (`★★★`), danh hiệu Vợ, lời Roast tổng kết, nút `[ TẠO THẺ ROAST KHOE MXH ]` (US-017) và nút qua màn (US-018).
- *(Lưu ý tương thích ngược: Các màn chưa khai báo `confrontationScript` như Màn 2 và Màn 3 tự động hiển thị giao diện đánh giá bậc thang dự phòng 0 / 1-2 / 3 sao).*

---

## Thành phần và ràng buộc thiết kế

| Thành phần | Quy chuẩn thiết kế | Ràng buộc kỹ thuật |
|---|---|---|
| Lớp phủ phòng thẩm vấn | Phủ toàn màn hình `z-index: 80`, bố cục dọc `max-w-[480px] h-[100dvh]`, nền `bg-darkroom-bg` (`#080b0f`) | Đè lên trên khung Sổ Tay Bắt Ghen (`z-index: 50`), hỗ trợ `useSwipeBack` |
| Nhân vật & Spotlight | 4 biểu cảm comic (`confident`, `smug`, `nervous`, `broken`) cỡ lớn dưới luồng spotlight chiếu đỉnh | Chỉ animate `transform` và `opacity` bằng `motion/react`, fallback cross-fade khi `useReducedMotion()` |
| Phụ đề chạy chữ 13px | `Vợ :` (`#78889C`) và `Hoàng :` (`#94A3B8`) cùng cỡ `text-ios-footnote` (`13px`), chạy chữ `22ms/ký tự` (tối đa `1600ms`) | Dùng grid spacer giữ chiều cao chống giật layout, chạm/phím để hiện nhanh, mở hết ngay khi `useReducedMotion()` |
| Danh sách chọn dọc đánh số | Nút chọn dọc đánh số `1`..`4` (`min-h-[48px]`, `text-ios-subheadline` `15px` `#F1F5F9`) | Chỉ mở khóa bấm sau khi chạy chữ xong, hỗ trợ phím `1`-`4` và `ArrowUp`/`ArrowDown`, stagger `40ms` bằng `SNAP` |
| Khóa kết tội nhánh False | Khi `phase === 'failed'` (`canAccuse === false`), ẩn toàn bộ hành động phán quyết | Chỉ hiển thị nút quay lại điều tra và trừ đúng 1 strike khi thoát |
| Trình bày văn bản | Chỉ dùng typography & màu tokens (`text-ios-*`, `darkroom-*`, `font-sans`), không dùng emoji và không dùng em dash | Toàn bộ lời thoại đọc từ `CaseConfig` (`confrontationScript` / `groundTruth`) |

