---
type: Wireframe
status: draft
description: "Anytime Confrontation Hub & Dynamic Excuse Engine ASCII wireframe for US-016."
tags: [requirement, wireframe, confrontation, excuse-engine, verdict, epic-03]
---

# Đối Chất & Chối Bay Chối Biến - Màn Hình Đối Chất Trực Tiếp

## Người dùng, mục tiêu và bối cảnh

- Người chơi (Người Vợ) có thể bấm "Đối chất" bất kỳ lúc nào từ Sổ Tay Bắt Ghen để chất vấn Chồng Hoàng.
- Hệ thống tự động đối chiếu các mối nối và cụm đối tượng đã giải mã trên Bảng Manh Mối với dữ liệu sự thật (`groundTruth`).
- Tùy theo số lượng manh mối cốt lõi đã liên kết, chồng sẽ đưa ra các mức chống chế hài hước (0–2 manh mối) hoặc đầu hàng thú nhận toàn bộ (3 manh mối).
- Nền tảng: Ứng dụng web trong khung điện thoại giả lập (viewport 393px × 852px); hiển thị dưới dạng màn hình phủ toàn phần (`z-index: 80`).
- Tham chiếu User Story: [US-016](../us-016-anytime-confrontation-hub-dynamic-excuse-engine.md).
- Trạng thái: Chờ duyệt bố cục ASCII (Phase 1); chưa tạo HTML (Phase 3).

## Nguồn đối chiếu

- [Thiết kế Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md): Mục 2.4 màn hình phán quyết và đối chất.
- [Tính năng Sổ Tay Bắt Ghen](../../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md): Mục 2.4 quy tắc tính sao và lời bình châm biếm.
- [Màn chơi Chồng Hoàng Màn 1](../../epic-04-detective-case-stories-level-content/us-027-husband-hoang-level-1-case-implementation.md): Mục 5 bậc thang chống chế và lời thoại thú tội.
- [Biên bản khám phá](../../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md): Tự động đánh giá đồ thị, đối chất không cần gắp thẻ thủ công, phạt 1 vạch nghi ngờ khi đối chất vội vã (0 sao).
- Thành phần mã nguồn thực tế: `WifeNotebookModal.tsx`, `graphEngine.ts`, `level01Fixture.ts`.

## Danh sách màn hình & trạng thái

| Mã | Trạng thái / Màn hình | Thành phần chính |
|---|---|---|
| M0-A | Chọn nghi phạm: Chưa lột mặt nạ | Khay Polaroid, vỏ bọc "Anh Tuấn Thợ Điện", ảnh túi đồ nghề, con dấu "NGHI PHẠM" |
| M0-B | Chọn nghi phạm: ĐÃ LỘT MẶT NẠ | Thẻ Polaroid chuyển hóa: tên thật "Nguyễn Thị Thu Hương", ảnh chân dung nữ, nhãn `🎭 Vỏ bọc: "Anh Tuấn Thợ Điện"`, manh mối `📞 Trùng SĐT 0988886677`, dấu "ĐÃ LỘT MẶT NẠ" |
| M1 | Đối chất sớm / Chưa đủ chứng cứ (0 sao) | Tiến độ 0/3, chồng chối quanh/thao túng tâm lý, cảnh báo tăng 1 vạch nghi ngờ, nút "Tiếp tục điều tra" |
| M2 | Kết tội một phần (1–2 sao) | Tiến độ 1/3 hoặc 2/3, chồng lắp bắp chống chế phòng thủ, kết quả 1 sao hoặc 2 sao, nút "Tha thứ & Qua màn" hoặc "Điều tra tiếp" |
| M3 | Thắng lợi trọn vẹn / Bắt quả tang (3 sao) | Tiến độ 3/3, chồng quỳ gối/cúi đầu nhận tội, đạt 3 sao trọn vẹn, danh hiệu Vợ, văn bản châm biếm, nút chia sẻ và qua màn |

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

---

### M1 - Đối chất sớm / Không có chứng cứ cốt lõi (0 sao)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
|                                                |
|            ⚖️ ĐỐI CHẤT CHỒNG HOÀNG             |
|       [ Tiến độ chứng cứ cốt lõi: 0/3 ]        |
|------------------------------------------------|
|                                                |
|                 [ Ảnh Hoàng ]                  |
|               (Khoanh tay, tự tin)             |
|                                                |
|  +------------------------------------------+  |
|  | Hoàng:                                   |  |
|  | "Em lại lướt TikTok drama rồi đa nghi      |  |
|  | đúng không? Anh đi làm cả ngày mệt mỏi,  |  |
|  | em lại tra khảo anh chuyện vô căn cứ!"   |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  | ⚠️ CẢNH BÁO: Nghi ngờ tăng thêm 1 vạch!   |  |
|  | Thước đo nghi ngờ: [ ■ ■ □ □ □ ] (2/5)   |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  |         [ 🔍 TIẾP TỤC ĐIỀU TRA ]          |  |
|  +------------------------------------------+  |
|                                                |
+------------------------------------------------+
```

- Kích hoạt khi người chơi bấm "Đối chất" nhưng chưa nối được manh mối cốt lõi nào trên Bảng Manh Mối.
- Chồng tỏ thái độ tự tin, thao túng tâm lý (gaslighting) người vợ vì thiếu chứng cứ.
- Thước đo nghi ngờ (Suspicion Meter) tăng thêm 1 vạch.
- Nếu vạch nghi ngờ chạm mốc tối đa (5 vạch ở Màn 1), game kích hoạt ngay màn hình thất bại "Bị giật lại máy" (US-014).
- Nút `[ 🔍 TIẾP TỤC ĐIỀU TRA ]`: Đóng màn hình đối chất, đưa người chơi về màn hình trước đó để tiếp tục mò manh mối mà không bị trừ màn chơi.

---

### M2 - Kết tội một phần (1 sao hoặc 2 sao)

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
|                                                |
|            ⚖️ ĐỐI CHẤT CHỒNG HOÀNG             |
|       [ Tiến độ chứng cứ cốt lõi: 2/3 ]        |
|------------------------------------------------|
|                                                |
|                 [ Ảnh Hoàng ]                  |
|             (Gãi đầu, toát mồ hôi)             |
|                                                |
|  +------------------------------------------+  |
|  | Hoàng (lắp bắp):                         |  |
|  | "Ơ kìa... Con bé Marketing nó nhờ anh    |  |
|  | đặt hộ cái váy để áp mã Freeship Extra   |  |
|  | thôi mà em! Anh có biết gì đâu..."       |  |
|  +------------------------------------------+  |
|                                                |
|               KẾT QUẢ PHÁN QUYẾT               |
|                    ★ ★ ☆                       |
|           [ ĐÃ VẠCH TRẦN MỘT PHẦN ]            |
|                                                |
|  +------------------------------------------+  |
|  |         [ 🔓 THA THỨ & QUA MÀN ]          |  |
|  +------------------------------------------+  |
|  |     [ 🔍 ĐIỀU TRA TIẾP ĐỂ ĐẠT 3 SAO ]     |  |
|  +------------------------------------------+  |
|                                                |
+------------------------------------------------+
```

- Khi người chơi đã kết nối được 1 hoặc 2 mắt xích đúng:
  - 1 manh mối (1 sao `★☆☆`): Chồng chống chế phòng thủ nhẹ (`"Số thợ điện hôm trước anh gọi nhờ sửa dây mạng văn phòng mà..."`).
  - 2 manh mối (2 sao `★★☆`): Chồng toát mồ hôi, bịa lý do đặt hàng hộ.
- Đã đủ điều kiện tối thiểu để mở khóa nút `[ 🔓 THA THỨ & QUA MÀN ]` (US-018) để sang Level tiếp theo.
- Người chơi có quyền chọn `[ 🔍 ĐIỀU TRA TIẾP ĐỂ ĐẠT 3 SAO ]` để quay lại bổ sung các mối nối còn thiếu.

---

### M3 - Bắt quả tang trọn vẹn / Thắng lợi 3 sao

```text
+------------------------------------------------+
| [15:42]              [Đảo động]      [Sóng][Pin]|
|                                                |
|            ⚖️ ĐỐI CHẤT CHỒNG HOÀNG             |
|       [ Tiến độ chứng cứ cốt lõi: 3/3 ]        |
|------------------------------------------------|
|                                                |
|                 [ Ảnh Hoàng ]                  |
|              (Cúi đầu, hoảng hốt)              |
|                                                |
|  +------------------------------------------+  |
|  | Hoàng (thú nhận):                        |  |
|  | "Anh xin lỗi vợ... Thôi anh khai thật!    |  |
|  | Bọn anh có hẹn riêng tối nay ở quán cơm  |  |
|  | niêu... Em đừng giận nữa mà!"            |  |
|  +------------------------------------------+  |
|                                                |
|               KẾT QUẢ PHÁN QUYẾT               |
|                    ★ ★ ★                       |
|         👑 NỮ THÁM TỬ GHEN TUÔNG 👑            |
|                                                |
|  "Thợ điện gì mà hẹn lại đúng ngày, nhận váy   |
|   kèm thiệp riêng, còn khiến anh họp ở công ty |
|   mà quẹt thẻ tận quán cơm! Anh sửa điện hay   |
|   sửa luôn lời khai?"                          |
|                                                |
|  +------------------------------------------+  |
|  |      [ 📸 TẠO THẺ ROAST KHOE MXH ]        |  |
|  +------------------------------------------+  |
|  |         [ 🔓 THA THỨ & QUA MÀN ]          |  |
|  +------------------------------------------+  |
|                                                |
+------------------------------------------------+
```

- Kích hoạt khi toàn bộ 3 mắt xích chứng cứ cốt lõi (`CaseKnowledgeGraph`) đã được người chơi liên kết thành công trên Bảng Manh Mối.
- Chồng Hoàng sụp đổ, nhận tội hoàn toàn.
- Đạt điểm tuyệt đối 3 sao (`★★★`), phong tặng danh hiệu `Nữ Thám Tử Ghen Tuông`.
- Hiển thị văn bản châm biếm tổng kết vụ án (Roast Punchline).
- Nút `[ 📸 TẠO THẺ ROAST KHOE MXH ]`: Mở bộ tạo ảnh 9:16 để tải về hoặc chia sẻ lên Zalo/TikTok/Facebook (US-017).
- Nút `[ 🔓 THA THỨ & QUA MÀN ]`: Thực hiện chuyển màn và lưu trạng thái hoàn thành vào `localStorage` (US-018).

---

## Thành phần và ràng buộc thiết kế

| Thành phần | Quy chuẩn thiết kế | Ràng buộc kỹ thuật |
|---|---|---|
| Lớp phủ màn hình | Phủ toàn màn hình `z-index: 80`, nền tối chuyển sắc | Đè lên trên khung Sổ Tay Bắt Ghen (`z-index: 50`) |
| Đánh giá đồ thị | Tự động đọc danh sách `edges` và `unmaskedSuspects` | Không yêu cầu người chơi kéo thả thẻ vào ô nộp bài |
| Bậc thang sao | 0 sao: Thất bại; 1 sao: Yếu; 2 sao: Khá; 3 sao: Xuất sắc | Điểm số lưu vào `PlaySession.stars` |
| Hình phạt vạch nghi ngờ | Tăng đúng 1 vạch nghi ngờ khi đối chất 0 sao | Kiểm tra ngưỡng tối đa của màn chơi; kích hoạt fail state nếu vượt ngưỡng |
| Trình bày văn bản | Cỡ chữ đối thoại tối thiểu 16px, không xuống dòng cụt | Hỗ trợ cuộn nội dung mượt mà nếu lời thoại dài |

