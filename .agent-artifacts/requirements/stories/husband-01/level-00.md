---
husband: husband_01
level: 0
---

# Hồ sơ Đặc tả Cốt truyện - Màn 0 (Hướng dẫn): Bữa cà phê tăng ca

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Là căn cứ cốt truyện pháp y (SSOT) cho Màn 0 (Tutorial) với 3 ứng dụng sẵn có (`internet-messaging`, `phone`, `photos`), 0 khóa bảo mật và popup hướng dẫn từng bước. Dùng đồng bộ cùng [husband-profile.md](husband-profile.md), [level-00-storyboard.md](level-00-storyboard.md) và [level-00-phone-data.md](level-00-phone-data.md). Bàn giao cho `@frontend-game-developer` để hiện thực hóa `src/data/cases/husband_01/level_00/`.

---

## 1. Bối cảnh Vụ án & Liên kết Hồ sơ Gốc

### 1.1. Liên kết Hồ sơ Người Chồng & Người Vợ (SSOT)
- **Hồ sơ Người Chồng, Ảnh đại diện gốc, Mỏ neo Người Vợ & Nhân vật cố định**: Tái sử dụng từ [husband-profile.md](husband-profile.md) (không định nghĩa lặp lại tại đây).
- **Hành vi Khả nghi Kích hoạt Cơn Ghen Ở Màn 0**: 22:15 thứ Bảy 12/09/2026 (tiền truyện ngắn, trước Màn 1 hơn 1 tháng). Thịnh vừa về nhà sau khi báo vợ "ngồi công ty fix lỗi gấp", ra bếp uống nước và để điện thoại trên bàn. Màn hình sáng lên thông báo tin nhắn ngắn từ **"Tùng Gara"** nhắc chuyện áo khoác để quên.

### 1.2. Chất liệu Trào phúng & Bản chất Vụ việc
- **Nguồn cảm hứng**: Chiêu lưu tên người lạ thành thợ sửa xe ("Tùng Gara") với lời nhắn trung tính dễ gây lầm tưởng, kết hợp bài cớ kinh điển "ngồi công ty fix lỗi gấp" nhưng quên xóa ảnh chụp bàn nước trong máy.
- **Bản chất Câu chuyện**: Tối thứ Bảy 12/09, Thịnh hẹn gặp Lê Ngọc Vy (24 tuổi, quản lý ca quán Góc Phố, 45 Nguyễn Khang) lúc 20:15. Anh lưu số Vy (`0933112244`) thành `"Tùng Gara"` và giữ lời thoại ngắn gọn như trao đổi với thợ sửa xe, nhưng quên xóa dòng ghi chú cũ `"Lê Ngọc Vy - 45 Nguyễn Khang"` trong thẻ danh bạ. Lúc 20:10, Thịnh nhắn nói dối vợ là đang ngồi công ty fix lỗi, nhưng chỉ 15 phút sau (20:25) anh lại chụp ảnh bàn 2 ly nước tại Góc Phố Coffee (45 Nguyễn Khang).
- **Storyboard & Sơ đồ Dòng thời gian**: Xem chi tiết tại [level-00-storyboard.md](level-00-storyboard.md).

---

## 2. Danh sách Nghi phạm & Danh mục Đối tượng Nhìn thấy

*Nhân khẩu học chi tiết tại Mục 1 của [level-00-storyboard.md](level-00-storyboard.md).*

| Suspect ID | Tên Hiển thị | Thân phận Thật / Nghề nghiệp | App Phát hiện Đầu tiên | Vỏ bọc Danh bạ / Biệt danh | Vai trò |
|---|---|---|---|---|---|
| `suspect_01` | Tùng Gara (trước lột mặt nạ) / Lê Ngọc Vy (sau lột mặt nạ) | Nữ, 24 tuổi, Quản lý ca quán Góc Phố | `internet-messaging` | `"Tùng Gara"` | **Kẻ chủ mưu (Culprit)** |
| `suspect_02` | Chị Hằng In Ấn | Nữ, 32 tuổi, Đối tác in thẻ nhân viên Technosoft | `phone` | `"Chị Hằng In Ấn"` | Bẫy nghi ngờ (Red Herring - Vô tội) |

> **Ràng buộc hiển thị**: `displayName` ban đầu của `suspect_01` trong bộ chọn nghi phạm là `"Tùng Gara"`. Chỉ chuyển sang `"Lê Ngọc Vy"` (kèm nhãn vỏ bọc `"Tùng Gara"`) sau khi người chơi nối thành công cạnh `edge_l0_alias_identity`.

### 2.1. Danh mục Đối tượng Người chơi Nhìn thấy

| ID liên hệ / hội thoại | Loại (người / bí danh / nhóm / dịch vụ) | App | Tên nhìn thấy | Điều kiện vào bộ chọn nghi phạm / lý do loại trừ | Khóa gộp | Danh tính tác giả (không hiển thị) |
|---|---|---|---|---|---|---|
| `thread_l0_001` / `contact_l0_001` | bí danh | `internet-messaging`, `phone` | Tùng Gara | Vào bộ chọn (vỏ bọc tiểu tam) | `contact_l0_001` | `suspect_01` |
| `thread_l0_003` / `contact_l0_002` | người | `internet-messaging`, `phone` | Chị Hằng In Ấn | Vào bộ chọn (bẫy nghi ngờ vô tội) | `contact_l0_002` | `suspect_02` |
| `thread_l0_002` / `contact_010` | người | `internet-messaging`, `phone` | Vợ | Mỏ neo người chơi, loại trừ | `contact_010` | `char_wife` |
| `thread_l0_004` / `contact_003` | người | `internet-messaging`, `phone` | Mẹ Ở Quê | Bề trên, loại trừ | `contact_003` | `char_mom` |
| `thread_l0_005` / `contact_004` | người | `internet-messaging`, `phone` | Tuấn Chó | Bạn thân, loại trừ | `contact_004` | `char_best_friend` |
| `thread_l0_006` / `contact_005` | người | `internet-messaging`, `phone` | Nam Dev | Đồng nghiệp, loại trừ | `contact_005` | `char_boss` |
| `thread_l0_007` / `contact_006` | dịch vụ | `internet-messaging`, `phone` | BQL CT2 An Bình | Dịch vụ tòa nhà, loại trừ | `contact_006` | Ban quản lý |

---

## 3. Sự thật, Lời Roasting & Thang Ngụy biện

### 3.1. Phân loại Kết luận Sự thật (Ground Truth)
- **Kết luận (`verdict`)**: `cheating`
- **Mã Tiểu tam (`culpritSuspectId`)**: `suspect_01`

### 3.2. Lời Roasting Kết thúc Vụ án
- **Chiến thắng Bắt ghen (`narrativeRoast`)**:
  > *"Tùng Gara nào mà tên là Lê Ngọc Vy ở 45 Nguyễn Khang, 20:25 còn ngồi Góc Phố uống nước trong khi anh bảo đang ngồi công ty fix lỗi? Lần sau sửa xe nhớ xóa luôn ghi chú danh bạ nhé!"*
- **Ghen nhầm Chị Hằng In Ấn (`overJealousRoast`)**:
  > *"Chị Hằng lớn hơn anh một tuổi, làm in thẻ nhân viên cho công ty. Em đọc lại tin nhắn xin file PDF đi, oan cho người ta quá!"*
- **Đối chất chưa đủ chứng cứ (Chế độ an toàn Màn 0 - Không thua màn)**:
  > *"Chứng cứ chưa đủ để anh ấy nhận tội. Hãy kiểm tra lại Sổ tay Điều tra và nối đủ 2 mối nối rồi thử lại nhé!"*

### 3.3. Thang Ngụy biện Khi Đối chất ("Chối bay chối biến")

| Số lượng Mối nối Đúng | Thái độ Người Chồng | Lời Thoại Ngụy biện Điển hình | Kết quả (Màn 0 an toàn) |
|---|---|---|---|
| **0 Mối nối (Cáo buộc non)** | Tự tin, gạt phăng | *"Em lại đa nghi rồi, tối nay anh ngồi công ty fix lỗi mệt phờ râu đây này!"* | Chưa đủ chứng cứ - quay lại điều tra (không thua màn) |
| **1 Mối nối (Mới lột vỏ bọc Tùng Gara)** | Giật mình, chống chế | *"À... Ngọc Vy là người quen gần công ty, anh lưu nhầm tên thôi chứ tối nay anh vẫn ngồi văn phòng mà!"* | Chưa đủ chứng cứ - gợi ý tìm ảnh đối lập lời khai (không thua màn) |
| **2 Mối nối (Đủ lột vỏ bọc + phá ngoại phạm)** | Cúi đầu nhận lỗi | *"Anh xin lỗi vợ... tối nay anh không ngồi công ty mà ra 45 Nguyễn Khang gặp Vy. Anh sai rồi, anh hứa không giấu em nữa!"* | **Hoàn thành Màn 0 (3 Sao)** -> hiện popup tổng kết |

### 3.4. Kịch bản Đối chất Theo Nhịp (`confrontationScript`)

| Nhịp / Giai đoạn | Chủ đề (`topic`) | Lựa chọn chính (`slot` / `requiredEdgeIds`) | Phản ứng Nhánh True (`onTrue`) | Phản ứng Nhánh False / Bẫy nghi ngờ (`onFalse`) |
|---|---|---|---|---|
| **Nhịp 1 (`opening`)** | Mở màn | `left` (`choice_l0_01`): *"Thịnh, tối nay anh thật sự đi đâu?"* / `right` (`choice_l0_02`): *"Anh giải thích chuyện 'Tùng Gara' đi."* | `confident`: *"Tùng Gara là cậu thợ sửa xe chứ ai? Tối nay anh ngồi công ty fix lỗi gấp mà!"* | - |
| **Nhịp 2 (`beat_l0_01`)** | Tùng Gara là ai? | `up` (`choice_l0_03`, `['edge_l0_alias_identity']`): *"Thợ sửa xe nào dùng số 0933112244 mà ghi chú danh bạ lại là 'Lê Ngọc Vy - 45 Nguyễn Khang'?"* | `nervous`: *"À... Vy là người quen gần công ty. Anh lưu nhầm tên thôi chứ tối nay anh vẫn ở văn phòng!"* | Thiếu cạnh: *"Em đọc kỹ lại đi, có bằng chứng gì chứng minh Tùng Gara là ai đâu?"*. `left` (`choice_l0_04`): *"Chị Hằng In Ấn gọi anh chiều nay là sao?"* -> roast Chị Hằng (an toàn, không thua màn) |
| **Nhịp 3 (`beat_l0_02`)** | Anh có thật sự ở công ty lúc 20:10? | `up` (`choice_l0_05`, `['edge_l0_alibi_photo']`): *"20:10 anh nhắn tôi đang ngồi công ty fix lỗi. Vậy bức ảnh bàn 2 ly nước lúc 20:25 ở 45 Nguyễn Khang là ai chụp?"* | `broken`: *"Anh xin lỗi vợ... anh không ngồi công ty mà ra Góc Phố gặp Vy. Anh sai rồi!"* -> mở khóa `ending` | Thiếu cạnh: *"Anh ngồi công ty thật mà, em có bằng chứng nào bảo anh đi chỗ khác đâu?"* (an toàn, quay lại Sổ tay) |
| **Bước `End` (`ending`)** | Kết thúc Màn 0 | `left` (`choice_l0_06`): *"Lần đầu cảnh cáo. Chặn số ngay!"* / `right` (`choice_l0_07`): *"Đừng để tôi bắt được lần nữa."* | `broken`: *"Anh xóa ngay đây vợ ơi..."* -> **Hoàn thành Màn 0** -> Popup tổng kết & nút **Vào Màn 1** | - |

---

## 4. Cấu hình Ứng dụng & Mồi nhử Thông báo (Notification Hook)

### 4.1. Phân cấp Độ khó
- **Phân bậc Màn chơi**: Màn 0 (Tutorial / Hướng dẫn)
- **Số lượt nghi ngờ tối đa (`allowedStrikes`)**: Chế độ tập luyện an toàn (không thua màn khi đối chất sai; giữ nguyên toàn bộ thẻ và dây đã tạo)
- **Số app hoạt động (`activeAppIds` không bị khóa xám)**: Đúng **3 apps** (`internet-messaging`, `phone`, `photos`). Toàn bộ 9 apps còn lại (`banking`, `ecommerce`, `messages`, `ride-hailing`, `web-browser`, `personal-notes`, `email`, `professional-network`, `team-collaboration`) nằm trong `grayedOutAppIds`.
- **Số câu đố mã khóa (`lockChallenges`)**: `0` (`lockChallenges: []`)
- **Thời gian giải án mục tiêu**: 2-3 phút.

### 4.2. Bảng Phân bổ Trạng thái Ứng dụng

| App ID | Có clue / chỉ sinh hoạt | Event / Activity ID nguồn (từ Storyboard) | Màn / trường hiện có | Khoảng trống hợp đồng nếu có |
|---|---|---|---|---|
| `internet-messaging` | Có clue chính + sinh hoạt | `EVT-01`, `EVT-02`, `EVT-04`, `EVT-06`, `ACT-01..06` | `threads[]`, `messages[]`, nhấn giữ bong bóng tin nhắn để ghim | Không |
| `phone` | Có clue chính + sinh hoạt | `EVT-03`, `ACT-06` | `contacts[]` (`displayName`, `primaryPhone`, `notesField`), `calls[]` | Không |
| `photos` | Có clue chính + sinh hoạt | `EVT-05`, `ACT-01`, `ACT-02`, `ACT-04`, `ACT-05` | `albums[]`, `photos[]` (`title`, `description`, `date`, `timestamp`, `exif.locationName`), nhấn giữ ảnh để ghim | Cần 1 asset ảnh bàn 2 ly nước (`photo_l0_001`) sau khi duyệt cốt truyện |

### 4.3. Thông số Thiết bị & Thông báo Mồi nhử (Zero-Spoiler Hook)
- **Đồng hồ Cốt truyện (`narrativeTime`)**: `22:15`
- **Thời lượng Pin (`batteryPercent`)**: `54%`
- **Nhà mạng (`carrierTag`)**: `5G`
- **Màu Chủ đề PWA (`pwaThemeColor`)**: `#0f172a`

**Thông báo Đẩy Khởi phát (Tuyệt đối không spoil):**
- **Toast ID**: `toast_001`
- **Ứng dụng Nguồn**: `internet-messaging`
- **Tiêu đề Người gửi**: `Tin nhắn • 22:10`
- **Nội dung Rút gọn**: `"Tùng Gara: Áo khoác anh để quên em cất rồi, mai rảnh em gửi lại nhé."`
- **Thời gian Trì hoãn**: `2 giây`

---

## 5. Đồ Thị Bằng Chứng & Ma Trận Dữ Liệu Pháp Y

### 5.1. Liên kết Sơ đồ Mermaid (Timeline & Clue-to-Suspect Graph)
- Xem tại Mục 3 và Mục 4 của [level-00-storyboard.md](level-00-storyboard.md).

### 5.2. Bảng Dữ Liệu Nodes & Edges (Compiler & Tooling SSOT)

#### Danh sách Nodes
| Node ID | Loại (`type`) | Tên hiển thị (`label`) | App nguồn / Record ID | Clue ID (nếu có) | Vỏ bọc ban đầu (`isInitialDisguise`) |
|---|---|---|---|---|---|
| `node_suspect_01` | `suspect` | Lê Ngọc Vy (Quản lý ca quán Góc Phố) | - | - | `false` |
| `node_suspect_02` | `suspect` | Đỗ Thanh Hằng (Đối tác In Ấn) | - | - | `false` |
| `node_alias_tung` | `alias` | Tùng Gara | `internet-messaging` / `thread_l0_001` | `CLUE-ZOLA-01` | `true` |
| `node_bridge_phone_vy` | `bridge_id` | SĐT `0933112244` / Ghi chú `Lê Ngọc Vy - 45 Nguyễn Khang` | `phone` / `contact_l0_001` | `CLUE-PHONE-02` | `false` |
| `node_record_zola_tung` | `record_clue` | Tin nhắn "Tùng Gara" hẹn ngồi tầng 2 & nhắc áo khoác để quên | `internet-messaging` / `msg_l0_001_03`, `msg_l0_001_04` | `CLUE-ZOLA-01` | `false` |
| `node_record_phone_contact` | `record_clue` | Danh bạ "Tùng Gara" (`0933112244`) ghi chú "Lê Ngọc Vy - 45 Nguyễn Khang" & cuộc gọi 20:12 | `phone` / `contact_l0_001`, `call_l0_001` | `CLUE-PHONE-02` | `false` |
| `node_record_zola_alibi` | `record_clue` | Tin nhắn 20:10 gửi Vợ: "Anh đang ngồi công ty fix lỗi gấp" | `internet-messaging` / `msg_l0_002_05` | `CLUE-ZOLA-07` | `false` |
| `node_record_photo_cafe` | `record_clue` | Ảnh bàn 2 ly nước lúc 20:25 tại Góc Phố Coffee (45 Nguyễn Khang) | `photos` / `photo_l0_001` | `CLUE-PHOT-05` | `false` |
| `node_timeline_2010_2025` | `timeline_slot` | Khung giờ 20:10 - 20:25 tối 12/09 | - | - | `false` |

#### Danh sách Edges & Smoking Guns
| Edge ID | Nút Nguồn (`source`) | Nút Đích (`target`) | Loại quan hệ (`relationship`) | Bằng chứng chốt (`isSmokingGun`) | Record ID nguồn / đích | Trường / nội dung nhìn thấy khớp nhau; chuẩn hóa cho phép | Tập bằng chứng tối thiểu phải ghim (Record ID / Message ID) | Kết luận được phép | Ca đạt / ca không đạt | Lời ngụy biện / bóc trần của Chồng |
|---|---|---|---|---|---|---|---|---|---|---|
| `edge_l0_alias_identity` | `node_record_zola_tung` | `node_record_phone_contact` | `bridges_identity` | `true` | `msg_l0_001_03` hoặc `msg_l0_001_04` / `contact_l0_001` | Khớp tên hiển thị `"Tùng Gara"` và SĐT `0933112244`; mục ghi chú danh bạ ghi `"Lê Ngọc Vy - 45 Nguyễn Khang"` | 1 tin nhắn trong `thread_l0_001` (`msg_l0_001_03` hoặc `msg_l0_001_04`) + thẻ danh bạ `contact_l0_001` | Lột mặt nạ `"Tùng Gara"` -> `"Lê Ngọc Vy"` | **Đạt**: ghim `msg_l0_001_04` + `contact_l0_001` rồi nối. **Không đạt**: nối `msg_l0_001_04` với `contact_l0_002` (Chị Hằng) hoặc chỉ ghim 1 thẻ | *"À... Vy là người quen gần công ty, anh lưu nhầm tên thôi!"* |
| `edge_l0_alibi_photo` | `node_record_zola_alibi` | `node_record_photo_cafe` | `contradicts_alibi` | `true` | `msg_l0_002_05` / `photo_l0_001` | Mốc giờ `20:10` khai *"ngồi công ty"* đối lập trực tiếp ảnh EXIF `20:25` tại `Góc Phố Coffee - 45 Nguyễn Khang` | `msg_l0_002_05` + `photo_l0_001` | Phá vỡ lời khai ngoại phạm tối 12/09 | **Đạt**: ghim `msg_l0_002_05` + `photo_l0_001` rồi nối. **Không đạt**: nối `msg_l0_002_05` với `photo_l0_002` (ảnh bàn làm việc lúc sáng) | *"Anh xin lỗi vợ... tối nay anh không ngồi công ty mà ra 45 Nguyễn Khang gặp Vy."* |

- **Danh sách Cạnh Bắt buộc để Hoàn thành Màn 0 (`requiredSmokingGunEdgeIds`)**: `['edge_l0_alias_identity', 'edge_l0_alibi_photo']`

### 5.3. Thử thách Mã khóa & Câu đố
Màn 0 không sử dụng khóa bảo mật: `lockChallenges: []`.

---

## 6. Lộ trình Popup Hướng dẫn & Bảng Điều tra Nối dây

Màn 0 không phụ thuộc Giác quan thứ 6 (`US-022`), mà dẫn dắt trực tiếp bằng **7 bước Popup Hướng dẫn ngắn gọn** (chi tiết giao diện và AC tại [US-034](../../output/epic-04-detective-case-stories-level-content/us-034-level-0-tutorial.md) và [wireframe-level-0-tutorial-popup-guide.md](../../output/epic-04-detective-case-stories-level-content/wireframes/wireframe-level-0-tutorial-popup-guide.md)):

1. **Bước 1 (Vừa vào Màn 0 - Mục tiêu trò chơi)**: Popup giải thích mục tiêu cốt lõi của game (kiểm tra điện thoại chồng -> ghim bằng chứng -> nối dây suy luận -> đối chất bắt quả tang), nút `"Bắt đầu"`.
2. **Bước 2 (Màn hình chính)**: Popup hướng dẫn mở `internet-messaging` (Zola) sau khi thông báo `toast_001` xuất hiện.
3. **Bước 3 (Trong Zola)**: Popup hướng dẫn nhấn giữ bong bóng tin nhắn (~0,4s) để mở hộp thoại bằng chứng và bấm **Ghim**.
4. **Bước 4 (Sau khi ghim thẻ đầu tiên)**: Popup gợi ý mở `phone` (Điện thoại) kiểm tra danh bạ `"Tùng Gara"` và ghim lại.
5. **Bước 5 (Trong Sổ tay Điều tra)**:
   - **5a**: Hướng dẫn chọn 2 thẻ liên quan (`msg_l0_001_04` và `contact_l0_001`) để nối dây lột mặt nạ.
   - **5b**: Khen ngợi và giao nhiệm vụ tự tìm bằng chứng phá lời khai *"ngồi công ty"* (gợi ý kiểm tra tin nhắn với **Vợ** và **Thư viện ảnh**), nối dây thứ 2 rồi bấm **Đối chất**.
6. **Bước 6 (Khi vào Đối chất - Cách chiến thắng & Tính sao)**: Popup giải thích cách chiến thắng (chọn luận điểm khớp dây bằng chứng đã nối để buộc chồng nhận tội) và thang tính **1-3 sao** (1 sao: thắng non, 2 sao: thuyết phục, 3 sao: đủ hết bằng chứng chốt; Màn 0 an toàn không thua màn).
7. **Bước 7 (Hoàn thành)**: Popup chúc mừng *"Xong Màn 0!"*, tóm tắt luật chơi Màn 1 (trừ lượt nghi ngờ khi cáo buộc sai, nối đủ bằng chứng chốt để đạt 3 sao), cung cấp 2 nút **Vào Màn 1** và **Chơi lại Màn 0**.

---

## 7. Bàn giao Kỹ thuật cho Lead Dev Agent

### 7.1. File Cấu hình Đích
`src/data/cases/husband_01/level_00/` (cấu trúc chuẩn hóa giống `level_01/`: `meta.json`, `contacts.json`, `confrontation.json`, `apps/internet-messaging.json`, `apps/phone.json`, `apps/photos.json`).

### 7.2. Yêu cầu Cấu trúc Mock Data & Chuẩn Gói 3 File
- Tái sử dụng `husband-profile.md` và master data `src/data/cases/husband_01/master/` (bổ sung 2 nhân vật mới `suspect_01` Lê Ngọc Vy và `suspect_02` Đỗ Thanh Hằng vào phạm vi Màn 0).
- Gói hồ sơ Màn 0 gồm đúng 3 file: `level-00-storyboard.md`, `level-00.md`, `level-00-phone-data.md`.
- Dữ liệu trong `level-00-phone-data.md` giữ tỷ lệ >= 75% bản ghi sinh hoạt/giải oan và chuẩn xưng hô tiếng Việt theo độ tuổi.

### 7.3. Tiêu chí Nghiệm thu Pháp y
1. Chạy lệnh kiểm tra hồ sơ cốt truyện:
   ```bash
   python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec ".agent-artifacts/requirements/stories/husband-01/level-00.md"
   ```
2. Toàn bộ Clue IDs (`CLUE-ZOLA-01`, `CLUE-ZOLA-07`, `CLUE-PHONE-01`, `CLUE-PHONE-02`, `CLUE-PHOT-05`) tồn tại trong `clue-ideas-inventory.md`.
3. **Đọc duyệt ngữ nghĩa**: Đã đối chiếu trình tự 10/09 -> 12/09 22:15 (không có bản ghi sau 22:15), khử chi tiết lộ liễu trong tin nhắn `"Tùng Gara"` (chỉ nhắc ngồi tầng 2 và áo khoác để quên, không nhắc quán cà phê hay trà đào), kiểm tra chuẩn xưng hô tiếng Việt theo độ tuổi. Khoảng trống duy nhất: ảnh `photo_l0_001` sẽ được tạo ở Bước 7 sau khi người dùng duyệt cốt truyện.
4. **Ca kiểm tra bàn giao cho Lead Dev**: Kiểm tra 2 ca đạt/không đạt của `edge_l0_alias_identity` và `edge_l0_alibi_photo`; kiểm tra 9 app ngoài phạm vi bị khóa xám; kiểm tra đối chất sai ở Màn 0 không gây thua màn.
