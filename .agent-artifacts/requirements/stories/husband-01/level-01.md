---
husband: husband_01
level: 1
---

# Hồ sơ Đặc tả Cốt truyện - Màn 1: Điện thoại ngoài phòng tắm

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Là căn cứ cốt truyện pháp y (SSOT) chứa hợp đồng đối chất, bảng phân bổ ứng dụng, bảng Nodes & Edges (`CaseKnowledgeGraph`) và tiêu chí nghiệm thu kỹ thuật. Dùng đồng bộ cùng [husband-profile.md](husband-profile.md), [level-01-storyboard.md](level-01-storyboard.md) và [level-01-phone-data.md](level-01-phone-data.md). Bàn giao cho `@frontend-game-developer` để hiện thực hóa file cấu hình `src/data/cases/husband_01/level_01.json`.

---

## 1. Bối cảnh Vụ án & Liên kết Hồ sơ Gốc

### 1.1. Liên kết Hồ sơ Người Chồng & Người Vợ (SSOT)
- **Hồ sơ Người Chồng, Ảnh đại diện gốc, Mỏ neo Người Vợ & Nhân vật cố định**: Tái sử dụng từ [husband-profile.md](husband-profile.md) (không định nghĩa lặp lại tại đây).
- **Hành vi Khả nghi Kích hoạt Cơn Ghen Ở Màn 1**: 23:45 thứ Năm 15/10/2026, Thịnh vào tắm. Lần đầu tiên anh để điện thoại ngoài phòng vì máy còn 8% pin phải cắm sạc. Màn hình khóa có hai thông báo chưa đọc: một từ "Anh Tuấn Thợ Điện" (22:58), một từ "Khoa BE" (23:41).

### 1.2. Chất liệu Trào phúng & Bản chất Vụ việc
- **Nguồn cảm hứng**: Meme "lưu số bồ là Anh Tuấn Thợ Điện" trên TikTok / *Tâm sự Eva*, chiêu "đặt hộ đồng nghiệp lấy mã Freeship Extra", hành vi thật của app nhắn tin: tên danh bạ đã lưu hiện thay tên thật trong nhóm chat.
- **Bản chất Câu chuyện**: Thịnh quen Thu Hương (25 tuổi, Marketing Executive, vào Technosoft 08/09) từ 15/09. Anh lưu số Hương thành đồng nghiệp nam "Khoa BE"; cách xưng `anh - em` của một đồng nghiệp trẻ giữ cho vỏ bọc tự nhiên. Ngày 12/10 Thịnh đặt váy lụa size S kèm thiệp "15/09 - 15/10 ♡", để tên Hương làm người nhận nhằm có sẵn cớ "đặt hộ". Chiều D, Team Dev hủy họp sprint vì sếp Hùng bay Đà Nẵng. Thịnh không báo vợ, hẹn Hương ăn tối kỷ niệm 1 tháng tại Cơm Niêu Phố Cổ, rồi hai lần nói dối vợ là đang họp. Cùng chiều đó, vợ anh vừa biết mình có thai 6 tuần và đang đợi anh về để nói.
- **Cú lừa thiết kế**: "Anh Tuấn Thợ Điện" là thợ điện thật ở quê, đang bí mật lắp bình nóng lạnh làm quà sinh nhật mẹ Thịnh (18/10). Người chơi bắt ghen theo meme sẽ bị trừ lượt và nhận roast.
- **Storyboard & Sơ đồ Dòng thời gian**: Xem [level-01-storyboard.md](level-01-storyboard.md).

---

## 2. Danh sách Nghi phạm & Danh mục Đối tượng Nhìn thấy

*Nhân khẩu học chi tiết tại Mục 1 của [level-01-storyboard.md](level-01-storyboard.md).*

| Suspect ID | Tên Hiển thị | Thân phận Thật / Nghề nghiệp | App Phát hiện Đầu tiên | Vỏ bọc Danh bạ / Biệt danh | Vai trò |
|---|---|---|---|---|---|
| `suspect_01` | Khoa BE (trước lột mặt nạ) / Nguyễn Thị Thu Hương (sau lột mặt nạ) | Nữ, 25 tuổi, Marketing Executive Technosoft | `internet-messaging` | "Khoa BE" | **Kẻ chủ mưu (Culprit)** |
| `suspect_02` | Anh Tuấn Thợ Điện | Nam, 41 tuổi, thợ điện nước ở quê | `internet-messaging` | "Anh Tuấn Thợ Điện" | Bẫy meme (Vô tội) |
| `suspect_03` | Bé Ngọc KTX | Nữ, 20 tuổi, em gái ruột | `internet-messaging` | "Bé Ngọc KTX" | Bẫy nghi ngờ (Vô tội) |
| `suspect_04` | Lan Anh Kế Toán | Nữ, 27 tuổi, kế toán kiêm thủ quỹ | `internet-messaging` | "Lan Anh Kế Toán" | Bẫy nghi ngờ (Vô tội) |
| `suspect_05` | Thảo PT California | Nữ, 24 tuổi, huấn luyện viên cá nhân | `internet-messaging` | "Thảo PT California" | Bẫy nghi ngờ (Vô tội) |
| `suspect_06` | Mai Lễ Tân | Nữ, 24 tuổi, lễ tân tòa Minh An | `internet-messaging` | "Mai Lễ Tân" | Bẫy nghi ngờ (Vô tội) |

> **Ràng buộc hiển thị**: `displayName` ban đầu của `suspect_01` trong bộ chọn là `"Khoa BE"`. Không đưa tên thật hoặc chữ "Marketing" vào bộ chọn trước khi cạnh `edge_order_phone` được xác thực.

### 2.1. Danh mục Đối tượng Người chơi Nhìn thấy

| ID liên hệ / hội thoại | Loại (người / bí danh / nhóm / dịch vụ) | App | Tên nhìn thấy | Điều kiện vào bộ chọn nghi phạm / lý do loại trừ | Khóa gộp | Danh tính tác giả (không hiển thị) |
|---|---|---|---|---|---|---|
| `thread_003` / `contact_011` | bí danh | `internet-messaging`, `phone`, `messages` | Khoa BE | Vào bộ chọn (vỏ bọc tiểu tam) | `contact_011` | `suspect_01` |
| `thread_012` (người gửi `contact_011`) | nhóm | `internet-messaging` | Technosoft - Toàn công ty (tin của Hương hiện là "Khoa BE") | Nhóm, không vào bộ chọn; người gửi gộp về `contact_011` | `contact_011` | `suspect_01` |
| `thread_004` / `contact_013` | người | `internet-messaging`, `phone` | Anh Tuấn Thợ Điện | Vào bộ chọn (bẫy meme) | `contact_013` | `suspect_02` |
| `thread_008` / `contact_003` | người | `internet-messaging`, `banking`, `phone`, `ecommerce` | Bé Ngọc KTX | Vào bộ chọn (bẫy nghi ngờ) | `contact_003` | `suspect_03` |
| `thread_007` / `contact_007` | người | `internet-messaging`, `banking`, `phone` | Lan Anh Kế Toán | Vào bộ chọn (bẫy nghi ngờ) | `contact_007` | `suspect_04` |
| `thread_009` / `contact_005` | người | `internet-messaging`, `phone`, `messages` | Thảo PT California | Vào bộ chọn (bẫy nghi ngờ) | `contact_005` | `suspect_05` |
| `thread_011` / `contact_009` | người | `internet-messaging`, `ecommerce`, `phone` | Mai Lễ Tân / người nhận "Đỗ Thị Mai" | Vào bộ chọn (bẫy nghi ngờ) | `contact_009` | `suspect_06` |
| `thread_005` / `contact_010` | người | `internet-messaging`, `phone` | Vợ | Mỏ neo, loại trừ | `contact_010` | `char_wife` |
| `thread_010` / `contact_001` | người | `internet-messaging`, `phone`, `ecommerce` | Mẹ Ở Quê / người nhận "Nguyễn Thị Hòa" | Bề trên, loại trừ | `contact_001` | `char_mom` |
| `thread_006` / `contact_006` | người | `internet-messaging`, `phone` | Tuấn Chó | Bạn thân, loại trừ | `contact_006` | `char_best_friend` |
| `thread_002` / `contact_004` | nhóm / người | `internet-messaging`, `phone` | Team Dev Technosoft / Nam Dev / Bách Dev | Đồng nghiệp, loại trừ | `contact_004` | `char_boss` |
| `thread_001` / `contact_012` | nhóm / dịch vụ | `internet-messaging`, `phone` | Cư dân tầng 12 / Ban Quản Lý | Dịch vụ tòa nhà, loại trừ | `contact_012` | Ban quản lý |
| `thread_015` | dịch vụ | `messages` | California Fitness | Dịch vụ, loại trừ | `thread_015` | Phòng gym |
| `shopchat_004`, `shopchat_002`, `shopchat_003` | người bán | `ecommerce` | Lụa Satin / Hoa Sáp Xinh / Điện Máy Nhà Mình | Người bán, loại trừ | theo shop | Người bán |

---

## 3. Sự thật, Lời Roasting & Thang Ngụy biện

### 3.1. Phân loại Kết luận Sự thật (Ground Truth)
- **Kết luận (`verdict`)**: `cheating`
- **Mã Tiểu tam (`culpritSuspectId`)**: `suspect_01`

### 3.2. Lời Roasting Kết thúc Vụ án
- **Chiến thắng Bắt ghen (`narrativeRoast`)**:
  > *"Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?"*
- **Ghen nhầm Anh Tuấn Thợ Điện (`overJealousRoast` mặc định)**:
  > *"Bà ấy là mẹ anh! Bình nóng lạnh là quà sinh nhật mẹ. Em xem TikTok thợ điện nhiều quá nên ghen luôn với mẹ chồng à?"*
- **Ghen nhầm Bé Ngọc**:
  > *"Em gái anh trượt môn Vĩ mô nhờ anh giấu mẹ. Em định bắt ghen hay đi méc mẹ?"*
- **Ghen nhầm Lan Anh**:
  > *"Lan Anh thu quỹ sinh nhật sếp, cả nhóm mỗi người một trăm. Em đọc thêm hai dòng là giải oan được rồi."*
- **Ghen nhầm Thảo PT**:
  > *"Người ta đợi anh tập trị liệu cột sống rồi còn trừ buổi của anh. Em bắt được lưng đau, chưa bắt được người tình."*
- **Ghen nhầm Mai Lễ Tân**:
  > *"Hoa sinh nhật sếp Hùng, Lan Anh dặn để tên Mai nhận cho kín. Sảnh lễ tân đâu phải danh sách người tình."*
- **Bị Giật Lại Máy (hết 5 lượt nghi ngờ)**:
  > *"Thịnh bước ra từ phòng tắm, giật lại máy: 'Em soi máy anh hay kiểm kê cả công ty đấy? Mai anh còn đi làm!'"*

### 3.3. Thang Ngụy biện Khi Đối chất Sớm ("Chối bay chối biến")

| Số lượng Bằng chứng | Thái độ Người Chồng | Lời Thoại Ngụy biện Điển hình | Kết quả |
|---|---|---|---|
| **0 Thẻ (Cáo buộc non)** | Hùng hổ, tự tin | *"Em lại xem clip bắt ghen trên TikTok rồi đúng không? Anh họp tới tối mịt, giờ chỉ muốn đi ngủ."* | Thất bại (Không thuyết phục) |
| **1 Thẻ (Lột mặt nạ Khoa BE)** | Giật mình, phân bua | *"Khoa... Khoa là dev mới bên anh. Nó nhờ anh đặt hộ váy cho người yêu nên để số nó thôi!"* | Chiến thắng 1 Sao (Thắng non) |
| **2 Thẻ (Thêm tên người nhận váy)** | Toát mồ hôi, bao biện | *"À... Hương bên Marketing nhờ anh áp mã Freeship Extra thôi. Anh với nó chỉ là đồng nghiệp!"* | Chiến thắng 2 Sao (Thuyết phục) |
| **3 Thẻ (Đủ tam giác bằng chứng)** | Cúi đầu nhận tội | *"Anh xin lỗi... không có họp nào cả. Anh đi ăn với Hương. Mới một tháng thôi, anh sai rồi..."* | Chiến thắng Tuyệt đối 3 Sao |

### 3.4. Kịch bản Đối chất Theo Nhịp (`confrontationScript`)

Vợ chuyển xưng hô từ `em` sang `tôi` khi đối chất (giận lạnh), đúng khẩu khí drama gia đình Việt.

| Nhịp / Giai đoạn | Chủ đề (`topic`) | Lựa chọn chính (`slot` / `requiredEdgeIds`) | Phản ứng Nhánh True (`onTrue`) | Phản ứng Nhánh False / Bẫy nghi ngờ (`onFalse` - `smug`) |
|---|---|---|---|---|
| **Nhịp 1 (`opening`)** | Mở màn | `left` (`choice_001`): *"Thịnh, anh có gì giấu tôi không?"* / `right` (`choice_002`): *"Tôi biết hết rồi. Tôi cho anh một cơ hội nói thật."* | `confident`: *"Giấu gì? Anh họp sprint tới tối mịt mới về. Em lại xem clip bắt ghen trên TikTok rồi đúng không?"* | - |
| **Nhịp 2 (`beat_001`)** | Khoa BE là ai? | `up` (`choice_003`, `['edge_order_phone']`): *"Dev backend nào mà dùng chung số 0988886677 với người nhận váy lụa size S?"* | `nervous`: *"Khoa... Khoa là dev mới bên anh. Nó nhờ anh đặt hộ váy cho người yêu nên để số nó thôi!"* | Thiếu cạnh: *"Khoa là dev backend, nhắn việc với anh suốt. Em ghen cả với đàn ông à?"*. `left` (`choice_004`): *"Thợ điện nào nửa đêm dặn 'không để bà ấy biết'?"* -> roast thợ điện. `right` (`choice_005`): *"Thảo PT đợi anh tối nay là sao?"* -> roast Thảo. Trừ 1 strike khi thoát |
| **Nhịp 3 (`beat_002`)** | Váy size S gửi cho ai? | `up` (`choice_006`, `['edge_order_name']`): *"Người nhận váy là Nguyễn Thị Thu Hương. Nhóm công ty ghim rõ: Hương - Marketing. 'Khoa' của anh mặc váy size S à? Tôi mặc size M."* | `nervous`: *"À... Hương bên Marketing nhờ anh áp mã Freeship Extra thôi. Anh với nó chỉ là đồng nghiệp!"* | Thiếu cạnh: *"Váy với thiệp thì sao? Shop giao nhầm, em định bắt ghen cả shipper à?"*. `left` (`choice_007`): *"Lẵng hoa gửi Đỗ Thị Mai là sao?"* -> roast Mai. `right` (`choice_008`): *"Bé Ngọc dặn anh 'đừng kể gì' là chuyện gì?"* -> roast Ngọc. Trừ 1 strike khi thoát |
| **Nhịp 4 (`beat_003`)** | Tối nay anh thật sự ở đâu? | `up` (`choice_009`, `['edge_alibi_contradiction']`): *"20:46 anh nhắn sếp Hùng đang chốt nốt. 20:48 thẻ anh quẹt 640 nghìn ở Cơm Niêu Phố Cổ. Mà sếp Hùng bay Đà Nẵng từ 6 giờ."* | `broken`: *"Anh xin lỗi... không có họp nào cả. Anh đi ăn với Hương. Mới một tháng thôi, anh sai rồi..."* -> mở khóa `ending` | Thiếu cạnh: *"Anh họp tới khuya, cả Team Dev làm chứng. Em định gọi hỏi từng người à?"*. `down` (`choice_010`): *"8 giờ tối anh chuyển tiền cho Lan Anh làm gì?"* -> roast Lan Anh. Trừ 1 strike khi thoát |
| **Bước `End` (`ending`)** | Phán quyết của vợ (vợ nói bí mật) | `left` (`choice_011`): *"Chiều nay tôi đi khám. Tôi có thai 6 tuần. Con tôi không cần một người bố nói dối. Ký đơn đi."* / `right` (`choice_012`): *"Chiều nay tôi đi khám. Tôi có thai 6 tuần. Vì con, tôi cho anh một lần. Chặn số 'Khoa BE' ngay trước mặt tôi."* | `broken`: ly hôn: *"Vợ ơi... con mình? Anh van em, cho anh một cơ hội thôi!"*; tha thứ: *"Anh chặn ngay. Anh thề với em và con, không có lần sau."* -> dấu `BẮT QUẢ TANG NGOẠI TÌNH`, 3 Sao + Roast Card | - |
| **Hậu kết (`epilogue`)** | Móc nối Màn 2 | Không lựa chọn | Thông báo ngân hàng mới: `+1.000 đ` từ `NGUYEN THI THU HUONG`, lời nhắn *"Anh chan so em that a?"* | - |

---

## 4. Cấu hình Ứng dụng & Mồi nhử Thông báo (Notification Hook)

### 4.1. Phân cấp Độ khó
- **Phân bậc Màn chơi**: Màn 1 (Khởi động, nhỉnh độ khó so với bản trước)
- **Số lượt nghi ngờ tối đa (`allowedStrikes`)**: 5
- **Số app có manh mối kết tội**: 4 (`internet-messaging`, `ecommerce`, `banking`, `phone`); `messages` chỉ chứa bằng chứng giải oan
- **Số câu đố mã khóa (`lockChallenges`)**: 0
- **Độ khó tăng thêm (theo yêu cầu duyệt)**: mồi meme thợ điện ở thông báo đầu; 5 bẫy nghi ngờ, mỗi bẫy có một khoảnh khắc trông có tội và đều nằm trong ngày D; 3 cạnh bắt buộc thay vì 2; nội dung chuyển khoản chung chung ("CK", "Coc"), phải đọc chat để giải oan.
- **Thời gian giải án mục tiêu**: 5-7 phút.

### 4.2. Bảng Phân bổ Trạng thái Ứng dụng

| App ID | Có clue / chỉ sinh hoạt | Event / Activity ID nguồn (từ Storyboard) | Màn / trường hiện có | Khoảng trống hợp đồng nếu có |
|---|---|---|---|---|
| `internet-messaging` | Manh mối + Sinh hoạt + Giải oan | `ACT-00`, `EVT-01`, `EVT-03`..`EVT-07`, `EVT-09`, `EVT-11`, `EVT-12`, `EVT-14`, `ACT-02`, `ACT-03`, `ACT-05`..`ACT-07`, `ACT-09`..`ACT-11`, `ACT-13`, `ACT-15`..`ACT-17` | Luồng 1-1, nhóm (US-030), tin ghim, bản xem trước luồng | Cần xác nhận: (1) tin ghim trong nhóm; (2) tên người gửi trong nhóm lấy theo tên danh bạ `contact_011`; (3) ghim được một tin trong nhóm lên Bảng Điều tra |
| `ecommerce` | Manh mối + Giải oan | `EVT-02`, `ACT-04`, `ACT-08` | Đơn hàng có tên/SĐT/địa chỉ người nhận, chat người bán | Không |
| `banking` | Manh mối + Giải oan | `ACT-01`, `ACT-10`, `ACT-15`, `ACT-16`, `EVT-10` | Giao dịch có tên đối tác và nội dung | Không |
| `phone` | Manh mối phụ (cầu nối SĐT) | `EVT-08`, `EVT-13` | Nhật ký cuộc gọi, danh bạ có SĐT đầy đủ | Không |
| `messages` | Giải oan | `ACT-14` | SMS dịch vụ | Không |
| `photos`, `ride-hailing`, `web-browser`, `personal-notes`, `email`, `professional-network`, `team-collaboration` | Chỉ sinh hoạt | - | Sinh hoạt theo [level-01-phone-data.md](level-01-phone-data.md) | Bỏ manh mối ảnh cơm niêu của bản cũ; không còn phụ thuộc ghim ảnh |

### 4.3. Thông số Thiết bị & Thông báo Mồi nhử (Zero-Spoiler Hook)
- **Đồng hồ Cốt truyện (`narrativeTime`)**: `23:45` (ngày hư cấu 15/10/2026)
- **Thời lượng Pin (`batteryPercent`)**: `8%` (đang sạc; lý do máy nằm ngoài phòng tắm)
- **Nhà mạng (`carrierTag`)**: `5G`
- **Màu Chủ đề PWA (`pwaThemeColor`)**: `#0f172a`

**Thông báo Đẩy Khởi phát (không spoil, hai thông báo xếp chồng trên màn hình khóa):**
- **Toast ID**: `toast_001`
  - **Ứng dụng Nguồn**: `internet-messaging`
  - **Tiêu đề Người gửi**: `Tin nhắn • 22:58`
  - **Nội dung Rút gọn**: `"Anh Tuấn Thợ Điện: Sáng mai anh vào lắp sớm. Em yên tâm, không để bà ấy biết đâu."`
  - **Thời gian Trì hoãn**: 3 giây
- **Toast ID**: `toast_002`
  - **Ứng dụng Nguồn**: `internet-messaging`
  - **Tiêu đề Người gửi**: `Tin nhắn • 23:41`
  - **Nội dung Rút gọn**: `"Khoa BE: A để quên áo khoác ở quán, e cầm về rồi. Mai e mang lên cty nha."`
  - **Thời gian Trì hoãn**: 5 giây
- **Lời giới thiệu màn (`storySnippet`, đề xuất cho dev)**: *"Độ khó: Dễ (5 lượt nghi ngờ • 0 khóa PIN). 23:45, chồng đang tắm, điện thoại 8% pin cắm sạc ngoài phòng. Màn hình sáng lên hai lần..."*

---

## 5. Đồ Thị Bằng Chứng & Ma Trận Dữ Liệu Pháp Y

### 5.1. Liên kết Sơ đồ Mermaid (Timeline & Clue-to-Suspect Graph)
- Xem Mục 3 và Mục 4 của [level-01-storyboard.md](level-01-storyboard.md).

### 5.2. Bảng Dữ Liệu Nodes & Edges (Compiler & Tooling SSOT)
*Đồng bộ với `LEVEL_01_KNOWLEDGE_GRAPH` trong `src/features/wife-notebook/level01Fixture.ts` khi dev hiện thực hóa.*

#### Danh sách Nodes (13 nodes)
| Node ID | Loại (`type`) | Tên hiển thị (`label`) | App nguồn / Record ID | Clue ID (nếu có) | Vỏ bọc ban đầu (`isInitialDisguise`) |
|---|---|---|---|---|---|
| `node_suspect_01` | `suspect` | Nguyễn Thị Thu Hương · Marketing | - | - | `false` |
| `node_alias_01` | `alias` | Khoa BE | `internet-messaging` / `thread_003` | `CLUE-ZOLA-01` | `true` |
| `node_alias_01_group` | `alias` | Khoa BE (nhóm toàn công ty) | `internet-messaging` / `msg_012_0004` | `CLUE-ZOLA-08` | `true` |
| `node_bridge_phone` | `bridge_id` | SĐT: 0988886677 | `phone` / `contact_011` | - | `false` |
| `node_bridge_name` | `bridge_id` | Nguyễn Thị Thu Hương - Marketing Executive | `internet-messaging` / `msg_012_0001` | `CLUE-ZOLA-08` | `false` |
| `node_record_ecommerce_order` | `record_clue` | Váy lụa be size S + thiệp "15/09 - 15/10" | `ecommerce` / `order_005` | `CLUE-POSH-05` | `false` |
| `node_record_booking` | `record_clue` | Khoa BE: book bàn 7h30, chỗ hôm trước | `internet-messaging` / `msg_003_0014` | `CLUE-ZOLA-01` | `false` |
| `node_record_dev_cancel` | `record_clue` | Team Dev 17:30: họp dời sang T2 | `internet-messaging` / `msg_002_0012` | `CLUE-ZOLA-09` | `false` |
| `node_record_wife_1855` | `record_clue` | Báo vợ 18:55: "họp sprint với cả team" | `internet-messaging` / `msg_005_0079` | `CLUE-ZOLA-09` | `false` |
| `node_record_wife_alibi` | `record_clue` | Báo vợ 20:46: "sếp Hùng đang chốt nốt" | `internet-messaging` / `msg_005_0082` | `CLUE-ZOLA-09` | `false` |
| `node_record_bank_receipt` | `record_clue` | COM NIEU PHO CO -640.000đ (20:48) | `banking` / `tx_003` | `CLUE-BANK-07` | `false` |
| `node_record_phone_call` | `record_clue` | Gọi Khoa BE 23:20 (96s) | `phone` / `call_001` | `CLUE-PHONE-01` | `false` |
| `node_timeline_dinner` | `timeline_slot` | Tối 15/10 (18:55 - 20:48) | - | - | `false` |

#### Danh sách Edges & Smoking Guns (11 edges)
| Edge ID | Nút Nguồn (`source`) | Nút Đích (`target`) | Loại quan hệ (`relationship`) | Bằng chứng chốt (`isSmokingGun`) | Record ID nguồn / đích | Trường / nội dung nhìn thấy khớp nhau; chuẩn hóa cho phép | Tập bằng chứng tối thiểu phải ghim (Record ID / Message ID) | Kết luận được phép | Ca đạt / ca không đạt | Lời ngụy biện / bóc trần của Chồng |
|---|---|---|---|---|---|---|---|---|---|---|
| `edge_alias_phone` | `node_alias_01` | `node_bridge_phone` | `bridges_identity` | `false` | `thread_003` / `contact_011` | Danh bạ "Khoa BE" có SĐT `0988886677`; bỏ khoảng trắng, `+84` = `0` | `contact_011` | "Khoa BE" dùng số này | Đạt: ghim thẻ liên hệ có số. Không đạt: chỉ ghim tên luồng không có số | - |
| `edge_call_phone` | `node_record_phone_call` | `node_bridge_phone` | `bridges_identity` | `false` | `call_001` / `contact_011` | Cuộc gọi hiển thị số đầy đủ `0988886677` | `call_001` | Cuộc gọi đêm tới cùng số | Đạt: số khớp. Không đạt: ghim `call_013` (số `0912345801`) | - |
| `edge_alias_group` | `node_alias_01` | `node_alias_01_group` | `bridges_identity` | `false` | `thread_003` / `msg_012_0004` | Cùng tên danh bạ "Khoa BE" và cùng `contact_011` | `msg_012_0004` + `contact_011` | "Khoa BE" có trong nhóm toàn công ty | Đạt: ghim tin "Team MKT nhờ cả nhà share..." Không đạt: ghim tin của Nam Dev | - |
| `edge_group_name` | `node_alias_01_group` | `node_bridge_name` | `bridges_identity` | `false` | `msg_012_0005` / `msg_012_0001` | HR trả lời tin của "Khoa BE": "Cảm ơn Hương nha"; tin ghim ghi Nguyễn Thị Thu Hương - Marketing | `msg_012_0005` + `msg_012_0001` | "Khoa BE" được gọi là Hương | Đạt: ghim cả hai tin. Không đạt: chỉ ghim tin ghim | - |
| `edge_order_phone` | `node_record_ecommerce_order` | `node_bridge_phone` | `bridges_identity` | `true` | `order_005` / `contact_011` | SĐT người nhận đơn váy `0988886677` = SĐT "Khoa BE" (lột mặt nạ) | `order_005` (chi tiết giao nhận) + `contact_011` hoặc `call_001` | Người nhận váy size S chính là "Khoa BE" | Đạt: số khớp đủ 10 chữ số. Không đạt: ghim `order_003` (số Mai) hoặc `order_004` (số mẹ) | *"Khoa... Khoa là dev mới bên anh. Nó nhờ anh đặt hộ váy cho người yêu nên để số nó thôi!"* |
| `edge_order_name` | `node_record_ecommerce_order` | `node_bridge_name` | `bridges_identity` | `true` | `order_005` / `msg_012_0001` | Tên người nhận `Nguyễn Thị Thu Hương` khớp tên trong tin ghim HR (có dấu, so khớp không phân biệt hoa thường) | `order_005` + `msg_012_0001` | Người nhận váy là Hương phòng Marketing | Đạt: tên khớp. Không đạt: ghim `order_003` (Đỗ Thị Mai) hoặc `order_006` (Nguyễn Bảo Ngọc) | *"À... Hương bên Marketing nhờ anh áp mã Freeship Extra thôi. Anh với nó chỉ là đồng nghiệp!"* |
| `edge_name_suspect` | `node_bridge_name` | `node_suspect_01` | `bridges_identity` | `false` | `msg_012_0001` / `suspect_01` | Tên pháp lý và chức danh nhân sự | `msg_012_0001` | Xác định nghi phạm thật | Tự động sau `edge_order_name` hoặc `edge_group_name` | - |
| `edge_alibi_contradiction` | `node_record_wife_alibi` | `node_record_bank_receipt` | `contradicts_alibi` | `true` | `msg_005_0082` / `tx_003` | Cùng ngày 15/10: 20:46 khai đang họp, 20:48 quẹt thẻ tại quán ăn | `msg_005_0082` + `tx_003` | Lời khai họp là giả | Đạt: đúng cặp tin 20:46 và `tx_003`. Không đạt: ghép `msg_005_0082` với `tx_005` (20:10) hoặc `tx_004` (20:30) vì chuyển khoản online không chứng minh vị trí | *"Anh xin lỗi... không có họp nào cả. Anh đi ăn với Hương. Mới một tháng thôi, anh sai rồi..."* |
| `edge_meeting_cancelled` | `node_record_dev_cancel` | `node_record_wife_1855` | `contradicts_alibi` | `false` | `msg_002_0012` / `msg_005_0079` | Họp dời sang thứ Hai lúc 17:30 (Thịnh đã trả lời "Ok ông 👍"), 18:55 vẫn khai họp | `msg_002_0012` + `msg_005_0079` | Thịnh biết không có họp | Đạt: ghim đủ hai tin. Không đạt: ghim tin 09:05 về bản fix cart | *"Thì... lịch dời nhưng anh với Nam vẫn ngồi lại làm tiếp mà!"* |
| `edge_booking_receipt` | `node_record_booking` | `node_record_bank_receipt` | `occurred_at` | `false` | `msg_003_0014` / `tx_003` | Bàn 7h30 cùng tối; thanh toán 20:48 cùng tối D | `msg_003_0014` + `tx_003` | Bữa tối có thể là cuộc hẹn với "Khoa BE" (gợi hướng, không tự chứng minh) | Đạt: cùng ngày D. Không đạt: ghép với `tx_013` ngày 13/10 | - |
| `edge_dinner_slot` | `node_record_wife_1855` | `node_timeline_dinner` | `occurred_at` | `false` | `msg_005_0079` / - | Mốc tối D | `msg_005_0079` | Neo khung giờ | - | - |

- **Danh sách Cạnh Bắt buộc để Thắng 3 Sao (`requiredSmokingGunEdgeIds`)**:
  `['edge_order_phone', 'edge_order_name', 'edge_alibi_contradiction']`

### 5.3. Thử thách Mã khóa & Câu đố (Dành cho Màn 2 & Màn 3)
*(Màn 1 không có câu đố mã khóa: `lockChallenges: []`)*

---

## 6. Lộ trình Phá án & Bảng Điều tra Nối dây

- **Đường suy luận chính**:
  1. Hai thông báo trên màn hình khóa. Người chơi theo meme mở "Anh Tuấn Thợ Điện" trước, đọc trọn luồng và luồng Mẹ để giải oan. Người tò mò mở "Khoa BE" chỉ thấy trao đổi công việc, hẹn "khao" ở "chỗ hôm trước" và "Vừa lắm a"; phải đối chiếu với đơn váy và thiệp mới thấy nghĩa.
  2. Mua sắm: đơn váy size S giao sảnh công ty, người nhận `Nguyễn Thị Thu Hương`, SĐT `0988886677`. So với mỏ neo vợ size M. Đối chiếu SĐT với danh bạ "Khoa BE" -> **SG1** (`edge_order_phone`).
  3. Nhóm "Technosoft - Toàn công ty": tin ghim HR có tên thật + chức danh; "Khoa BE" đăng việc Marketing, HR gọi là "Hương" -> **SG2** (`edge_order_name`).
  4. Chat vợ 20:46 "sếp Hùng đang chốt nốt" + ngân hàng 20:48 quẹt thẻ COM NIEU PHO CO -> **SG3** (`edge_alibi_contradiction`). Bằng chứng cộng thêm: Team Dev 17:30 hủy họp, sếp bay Đà Nẵng.
- **Các bẫy nghi ngờ và đường giải oan (người chơi đọc được trước đối chất)**:

| Nghi phạm | Khoảnh khắc trông có tội | Đường giải oan (app khác hoặc cùng luồng) |
|---|---|---|
| Anh Tuấn Thợ Điện | Thông báo 22:58 "không để bà ấy biết đâu"; chuyển "Coc" 1,5tr lúc 15:30 | Luồng Mẹ 13/10 (bình nóng lạnh hỏng), luồng Tuấn 13/10 (lắp làm bất ngờ dịp sinh nhật mẹ), đơn bình nóng lạnh gửi Nguyễn Thị Hòa = SĐT Mẹ |
| Bé Ngọc KTX | Bản xem trước 20:13 "Nhớ là a đừng kể gì nha 🙊"; nhận 1,2tr lúc 20:10 nội dung "CK" | Đọc trọn luồng: trượt Vĩ mô, "mẹ mà biết thì e toi", tiền học lại |
| Lan Anh Kế Toán | Nhận 500k lúc 20:30 giữa buổi tối, nội dung "CK" | Luồng Lan Anh: quỹ sinh nhật anh Hùng, Thịnh "ứng luôn cho cả nhóm" |
| Thảo PT California | 18:20 "A tới chưa? E đợi a nãy giờ 😤" | Luồng Thảo 13/10 chốt buổi đánh giá cột sống 18:00; SMS California Fitness 19:05 báo vắng mặt |
| Mai Lễ Tân | Đơn lẵng hoa sáp người nhận "Đỗ Thị Mai" kèm thiệp sinh nhật | Luồng Lan Anh 14/10 dặn để tên Mai nhận; chat shop hoa: thiệp "Chúc mừng sinh nhật! - Team Dev"; luồng Mai: hoa cất kho tới thứ Hai |

- **Thứ tự gợi ý Giác quan thứ 6**: 1. `ecommerce` -> 2. `internet-messaging` (nhóm toàn công ty) -> 3. `banking`. Không gợi ý luồng "Anh Tuấn Thợ Điện".
- **Đặc tả bố cục Bảng Điều tra Nối dây**: Tuân thủ [US-015](../../output/epic-03-wife-notebook-verdict-social-sharing/us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md#corkboard-canvas-layout--swimlane-architecture).

---

## 7. Bàn giao Kỹ thuật cho Lead Dev Agent

### 7.1. File Cấu hình Đích
`src/data/cases/husband_01/level_01.json`, `src/features/wife-notebook/level01Fixture.ts`, và `levelTitle` / `storySnippet` của Màn 1 trong `src/features/case-runtime/caseRuntime.ts`.

### 7.2. Yêu cầu Cấu trúc Mock Data & Chuẩn Gói 3 File Theo Màn (+ 1 File Hồ sơ Chồng)
- Hồ sơ gốc [husband-profile.md](husband-profile.md) đã cập nhật: vỏ bọc Màn 1 là "Khoa BE"; tên, SĐT, sinh nhật Mẹ.
- Mỗi màn gồm đúng 3 file: [level-01-storyboard.md](level-01-storyboard.md), `level-01.md` (file này), [level-01-phone-data.md](level-01-phone-data.md). Không tạo `history.md`.
- Lời thoại tuân thủ chuẩn xưng hô theo nhân khẩu học tại Mục 1 của storyboard.
- **Thay đổi so với bản cũ cần dọn trong runtime**: bỏ `tx_02` (hoàn tiền 160k), `photo_dinner_claypot` làm manh mối, alias thợ điện cho Hương, SMS liên hệ thợ điện của Hương (`thread_025` cũ); đổi `contact_011` thành "Khoa BE"; thêm `contact_013` thợ điện thật; thêm luồng nhóm `thread_012`.

### 7.3. Tiêu chí Nghiệm thu Pháp y
1. Chạy lệnh kiểm tra hồ sơ cốt truyện:
   ```bash
   python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec ".agent-artifacts/requirements/stories/husband-01/level-01.md"
   python -B .agents/skills/level-designer/scripts/sync_clues.py validate --file ".agent-artifacts/requirements/stories/husband-01/level-01.md"
   ```
2. Clue IDs dùng trong màn: `CLUE-ZOLA-01`, `CLUE-ZOLA-08`, `CLUE-ZOLA-09`, `CLUE-ZOLA-10`, `CLUE-ZOLA-11`, `CLUE-POSH-05`, `CLUE-POSH-06`, `CLUE-BANK-07`, `CLUE-PHONE-01`, `CLUE-MSG-02`.
3. Kết quả đọc duyệt ngữ nghĩa: đã đi xuôi dòng thời gian và ngược từ hai thông báo; không có bản ghi sau 23:45 D; giờ hai thông báo trùng giờ tin trong luồng; số `0988886677` chỉ thuộc "Khoa BE" và người nhận `order_005`; xưng hô `em - anh` với thợ điện và `con - mẹ` với Mẹ đã kiểm. Khoảng trống có chủ đích: vị trí Thịnh 18:00 - 19:20 không được app nào ghi.
4. Khoảng trống runtime đã biết: `edge_group_name` không nối được trên Bảng Điều tra vì cả nhóm `thread_012` là một thẻ; cạnh này không bắt buộc. `edge_order_name` và `edge_alias_group` vẫn chạy từ thẻ nhóm.
5. Ca kiểm tra bàn giao cho đọc duyệt triển khai: ca đạt/không đạt ở bảng Edges; bộ chọn nghi phạm không lộ tên thật trước `edge_order_phone`; tên người gửi trong nhóm hiện theo danh bạ; thông báo hậu kết `+1.000 đ` chỉ hiện sau bước `ending` (cần xác nhận runtime hỗ trợ thông báo hậu kết).
