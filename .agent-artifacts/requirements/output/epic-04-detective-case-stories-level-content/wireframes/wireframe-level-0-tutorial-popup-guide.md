---
type: Wireframe
epic: "Epic 04: Level 0 Tutorial & Husband Thịnh Level 1 Case Content (Release 1)"
status: signed-off
description: "Phase 1 ASCII wireframe for Level 0 Tutorial 7-step popup guide including opening game goal, confrontation win/star rules, and completion modal."
tags: [wireframe, tutorial, level-0, popup-guide, us-034]
timestamp: "2026-11-28"
---

# Wireframe - Màn 0 (Hướng dẫn): Popup Hướng dẫn Từng bước

> **Liên kết User Story**: [US-034 - Level 0 Tutorial: Bữa cà phê tăng ca](../us-034-level-0-tutorial.md)
> **Trạng thái**: Signed-off (được duyệt ngày 28/11/2026).
> **Tiêu chuẩn thiết kế**: Bám sát `design.md` và `phone-os/app-design.md` (khung mobile 390x844, Dynamic Island, Ionicons SVG - Zero-Emoji Policy trong UI điều khiển, touch target >= 44x44px).

---

## 1. Popup Bước 1 (Vừa vào Màn 0 - Mục tiêu trò chơi)

*Hiển thị ngay khi vừa vào Màn 0, trước khi thông báo `toast_001` xuất hiện.*

```text
+------------------------------------------+
| 22:15       [Dynamic Island]     5G  54% |
+------------------------------------------+
|                                          |
|  +====================================+  |
|  | [Icon Search]  MỤC TIÊU TRÒ CHƠI   |  |
|  |                BƯỚC 1 / 7          |  |
|  |                                    |  |
|  | Chồng bạn đang giấu chuyện gì đó   |  |
|  | trong điện thoại.                  |  |
|  |                                    |  |
|  | Nhiệm vụ của bạn:                  |  |
|  | 1. Kiểm tra các ứng dụng trong máy |  |
|  | 2. Ghim bằng chứng khả nghi        |  |
|  | 3. Nối dây suy luận trong Sổ tay   |  |
|  | 4. Đối chất để bắt quả tang        |  |
|  |                                    |  |
|  | [ Bỏ qua hướng dẫn ]  [ Bắt đầu ]  |  |
|  +====================================+  |
|                                          |
|            [Home Indicator]              |
+------------------------------------------+
```

---

## 2. Màn hình chính Màn 0 + Popup Bước 2 (Mở Zola)

*Chỉ 3 ứng dụng hoạt động (`internet-messaging`, `phone`, `photos`); 9 ứng dụng còn lại hiển thị mờ (`grayedOutAppIds`).*

```text
+------------------------------------------+
| 22:15       [Dynamic Island]     5G  54% |
+------------------------------------------+
| +--------------------------------------+ |
| | [Icon Chat] Tin nhắn • 22:10         | |
| | Tùng Gara: Áo khoác anh để quên em   | |
| | cất rồi, mai rảnh em gửi lại nhé.    | |
| +--------------------------------------+ |
|                                          |
|  [Shopoo*]  [Grap*]  [Web*]   [Ảnh]      |
|  [Mail*]    [Link*]  [Team*]  [Notes*]   |
|  (* = mờ/khóa xám ở Màn 0)               |
|                                          |
|  +====================================+  |
|  | [Icon Info]  BƯỚC 2 / 7            |  |
|  |                                    |  |
|  | Bạn vừa thấy tin nhắn lạ từ        |  |
|  | "Tùng Gara". Hãy mở ứng dụng       |  |
|  | Tin nhắn (Zola) để kiểm tra.       |  |
|  |                                    |  |
|  | [ Bỏ qua hướng dẫn ]   [ Đã hiểu ] |  |
|  +====================================+  |
|                                          |
| +--------------------------------------+ |
| | [Điện thoại] [Zola] [Bank*] [SMS*]   | |
| +--------------------------------------+ |
|            [Home Indicator]              |
+------------------------------------------+
```

---

## 3. Popup Bước 3 (Trong Zola - Nhấn giữ & Ghim) & Bước 4 (Mở Điện thoại)

```text
+------------------------------------------+
| 22:15       [Dynamic Island]     5G  54% |
+------------------------------------------+
| [<]  Tùng Gara               [Sổ tay(0)] |
+------------------------------------------+
|                                          |
|  +----------------------------------+    |
|  | Em tới rồi nhé, ngồi trên tầng 2 |    |
|  | cho thoáng.               20:15  |    |
|  +----------------------------------+    |
|                                          |
|  +----------------------------------+    |
|  | Áo khoác anh để quên em cất rồi, |    |
|  | mai rảnh em gửi lại nhé.  22:10  |    |
|  +----------------------------------+    |
|                                          |
|  +====================================+  |
|  | [Icon Hand]  BƯỚC 3 / 7            |  |
|  |                                    |  |
|  | Nhấn giữ vào bong bóng tin nhắn    |  |
|  | khoảng 0,4 giây để mở bảng bằng    |  |
|  | chứng rồi bấm Ghim vào sổ tay.     |  |
|  |                                    |  |
|  | [ Bỏ qua hướng dẫn ]   [ Đã hiểu ] |  |
|  +====================================+  |
|            [Home Indicator]              |
+------------------------------------------+
```

*Sau khi ghim thành công thẻ đầu tiên, Popup Bước 4 hiển thị tương tự:*
- **Tiêu đề**: `BƯỚC 4 / 7`
- **Nội dung**: `"Tuyệt vời! Hãy mở ứng dụng Điện thoại, tìm danh bạ 'Tùng Gara' xem đó là ai rồi ghim lại."`
- **Nút**: `[Bỏ qua hướng dẫn]` | `[Đã hiểu]`

---

## 4. Popup Bước 5 (Trong Sổ tay - Nối dây đầu tiên & Tự suy luận mối nối cuối)

```text
+------------------------------------------+
| [<]  Sổ tay Điều tra         [Đối chất]  |
+------------------------------------------+
|  +----------------+   +----------------+ |
|  | [Zola]         |   | [Điện thoại]   | |
|  | Tùng Gara:     |   | Tùng Gara      | |
|  | Áo khoác anh   |   | 0933112244     | |
|  | để quên em cất |   | Lê Ngọc Vy -   | |
|  +----------------+   | 45 Nguyễn Khang| |
|                       +----------------+ |
|                                          |
|  +====================================+  |
|  | [Icon Link]  BƯỚC 5 / 7            |  |
|  |                                    |  |
|  | Chọn 2 thẻ liên quan rồi nối dây   |  |
|  | để lột trần vỏ bọc "Tùng Gara".    |  |
|  |                                    |  |
|  | [ Bỏ qua hướng dẫn ]   [ Đã hiểu ] |  |
|  +====================================+  |
|            [Home Indicator]              |
+------------------------------------------+
```

*Sau khi nối thành công `edge_l0_alias_identity`, Popup Bước 5b hiển thị:*
- **Tiêu đề**: `BƯỚC 5 / 7 - TỰ SUY LUẬN`
- **Nội dung**: `"Bạn đã lột mặt nạ 'Tùng Gara' thành Lê Ngọc Vy! Giờ hãy tự tìm thêm 1 cặp bằng chứng chứng minh anh ấy nói dối lời khai 'đang ngồi công ty' (gợi ý: xem tin nhắn với Vợ và Thư viện ảnh), nối chúng lại rồi bấm Đối chất."`
- **Nút**: `[Bỏ qua hướng dẫn]` | `[Đã hiểu]`

---

## 5. Popup Bước 6 (Khi vào Đối chất - Cách chiến thắng & Tính sao)

*Hiển thị ngay khi người chơi lần đầu bấm **Đối chất** ở Màn 0.*

```text
+------------------------------------------+
| 22:15       [Dynamic Island]     5G  54% |
+------------------------------------------+
|          [Khung Đối chất - Thịnh]        |
|                                          |
|  +====================================+  |
|  | [Icon Trophy] CÁCH THẮNG & TÍNH SAO|  |
|  |               BƯỚC 6 / 7           |  |
|  |                                    |  |
|  | - Cách thắng: Chọn luận điểm khớp  |  |
|  |   với dây bằng chứng đã nối trong  |  |
|  |   Sổ tay để buộc chồng nhận tội.   |  |
|  |                                    |  |
|  | - Cách tính sao (từ Màn 1):        |  |
|  |   [Star] 1 sao: Mới nối 1 bằng     |  |
|  |     chứng chốt (thắng non).        |  |
|  |   [Star][Star] 2 sao: Đủ đối chiếu |  |
|  |     thuyết phục.                   |  |
|  |   [Star][Star][Star] 3 sao: Nối đủ |  |
|  |     toàn bộ bằng chứng chốt.       |  |
|  |                                    |  |
|  | - Màn 0 được thử thoải mái, không  |  |
|  |   bị thua màn nếu hỏi thiếu chứng. |  |
|  |                                    |  |
|  | [ Bỏ qua hướng dẫn ]   [ Đã hiểu ] |  |
|  +====================================+  |
|            [Home Indicator]              |
+------------------------------------------+
```

---

## 6. Popup Bước 7 (Hoàn thành Màn 0)

```text
+------------------------------------------+
| 22:15       [Dynamic Island]     5G  54% |
+------------------------------------------+
|                                          |
|  +====================================+  |
|  |        [Icon Checkmark Circle]     |  |
|  |            XONG MÀN 0!             |  |
|  |                                    |  |
|  | Bạn đã thành thạo 4 bước điều tra: |  |
|  | Xem - Ghim - Nối dây - Đối chất.   |  |
|  |                                    |  |
|  | +--------------------------------+ |  |
|  | | [Icon Alert] Lưu ý từ Màn 1:   | |  |
|  | | Cáo buộc thiếu chứng cứ sẽ bị  | |  |
|  | | trừ lượt nghi ngờ. Nối đủ bằng | |  |
|  | | chứng chốt để đạt tối đa 3 sao.| |  |
|  | +--------------------------------+ |  |
|  |                                    |  |
|  | [       Vào Màn 1 (Chính)       ]  |  |
|  | [        Chơi lại Màn 0         ]  |  |
|  +====================================+  |
|                                          |
|            [Home Indicator]              |
+------------------------------------------+
```

---

## 7. Bảng Thành phần & Tương tác (Component & Touch Target Inventory)

| Thành phần | Icon (Ionicons SVG) | Kích thước chạm tối thiểu | Hành vi |
|---|---|---|---|
| Card Popup Hướng dẫn | `IoSearchOutline` / `IoInformationCircleOutline` / `IoHandLeftOutline` / `IoGitNetworkOutline` / `IoTrophyOutline` | Rộng tối đa `342px`, căn giữa / đáy an toàn | Hiển thị phía trên lớp nội dung, không tự động thực hiện thao tác thay người chơi |
| Biểu tượng sao (Bước 6) | `IoStar` | `16x16px` inline trong danh sách quy tắc | Minh họa thang điểm 1-3 sao bằng SVG (Zero-Emoji Policy) |
| Nút chính `"Bắt đầu"` / `"Đã hiểu"` | Không | >= 44px cao, >= 110px rộng | Đóng popup hiện tại để người chơi thao tác thật |
| Nút phụ `"Bỏ qua hướng dẫn"` | Không | >= 44px cao, >= 130px rộng | Tắt các popup hướng dẫn còn lại trong lượt chơi Màn 0 hiện tại (không bỏ qua màn chơi) |
| Nút `"Vào Màn 1"` (Bước 7) | `IoArrowForwardOutline` | >= 48px cao, full-width | Đánh dấu Màn 0 hoàn thành và chuyển sang Màn 1 |
| Nút `"Chơi lại Màn 0"` (Bước 7) | `IoRefreshOutline` | >= 44px cao, full-width | Khởi tạo lại Màn 0 từ đầu, giữ nguyên tiến độ Màn 1 |
