# Màn 1 - Dữ liệu sinh hoạt và lời thoại

> Phần dữ liệu của [hồ sơ Màn 1](level-01.md) và [Storyboard](level-01-storyboard.md), dùng cùng hồ sơ khi hiện thực hóa. D = thứ Năm 15/10/2026, thời điểm kiểm tra máy 23:45. Ngày giờ thuộc đồng hồ hư cấu, không gắn với ngày chạy ứng dụng.

## 1. Quy tắc phân bố

- Bốn ứng dụng có manh mối kết tội: `internet-messaging`, `ecommerce`, `banking`, `phone`. `messages` chỉ có một SMS giải oan (Thảo). Các ứng dụng còn lại chỉ có sinh hoạt.
- Ít nhất 75% bản ghi cấp danh sách trong từng ứng dụng có manh mối là sinh hoạt hoặc giải oan. Không đếm từng bong bóng chat để đạt tỷ lệ.
- Hiển thị theo thời gian. Không ghim sẵn, đổi màu, tăng số chưa đọc hay đẩy manh mối lên đầu. Nhãn "sinh hoạt / giải oan / manh mối" chỉ dành cho tác giả.
- Không có ngày sau D hoặc giờ sau 23:45 D. Cuộc gọi nhỡ có thời lượng 0. Mã, tên, giờ và số tiền lặp giữa các ứng dụng phải trùng nhau.
- Nội dung chuyển khoản do Thịnh gõ để chung chung ("CK", "Coc"): người chơi phải đọc chat để hiểu.

## 2. `internet-messaging` - 15 luồng (10 luồng 1-1, 5 nhóm)

Mỗi dòng có giờ và người nói; ngày ghi ở đầu dòng. Bản xem trước của danh sách luồng là tin cuối cùng của luồng, cắt theo độ dài hiển thị.

### `thread_003` - Khoa BE

Liên hệ `contact_011`, SĐT `0988886677`. Danh tính tác giả: `suspect_01`. Ảnh đại diện là ảnh phong cảnh đồng quê (như nhiều liên hệ khác có ảnh thật), không phải avatar chữ. Luồng đọc như trao đổi công việc giữa hai đồng nghiệp; không emoji tình cảm, không từ ngữ yêu đương. Các chỗ lỡ lời chỉ là gợi hướng: "dev backend" lại hỏi banner/CTA và chụp màn hình làm bài đăng (việc Marketing); "tròn 1 tháng" chỉ có nghĩa khi đối chiếu thiệp "15/09 - 15/10"; "Vừa lắm a" chỉ có nghĩa khi tìm ra đơn váy.

- 12/10 09:40 - Khoa: "A ơi landing page bị lỗi form đăng ký, a xem giúp e với"
- 12/10 09:52 - Thịnh: "Ok e, gửi a link với ảnh lỗi nhé."
- 12/10 09:55 - Khoa: "E gửi qua mail rồi a. Phần CTA trên banner a check giúp luôn nhé"
- 12/10 14:20 - Thịnh: "Fix xong form rồi, e test lại nhé."
- 12/10 14:35 - Khoa: "Chạy ok rồi a, cảm ơn a."
- 13/10 12:10 - Khoa: "Trưa nay a ăn gì? E order cơm bên dưới luôn nha"
- 13/10 12:12 - Thịnh: "Cho a 1 suất như hôm trc."
- 14/10 21:12 - Khoa: "Thứ 5 tròn 1 tháng rồi đó a. A nhớ vụ khao nhé"
- 14/10 21:15 - Thịnh: "Tối đó a vướng họp sprint rồi e."
- 14/10 21:16 - Khoa: "Vâng, để hôm khác ạ."
- D 09:30 - Khoa: "Bản build sáng nay lên staging chưa a? Bên e cần chụp màn hình làm bài đăng"
- D 09:41 - Thịnh: "Lên rồi e."
- D 17:35 - Thịnh: "Tối nay a xong sớm. Vụ khao làm luôn nhé?"
- D 17:40 - Khoa: "Ok a, e đặt chỗ hôm trước lúc 7h30 nha." (`msg_003_0014`, `CLUE-ZOLA-01`)
- D 21:31 - Thịnh: "Mai a xem lại banner cho e nhé."
- D 21:33 - Khoa: "Vâng ạ, e gửi file từ sáng."

Không có tin nào sau bữa tối lộ địa điểm hay món quà ("quán", "áo khoác", "Vừa lắm" đã bỏ). `unreadCount` = 0.

Ghi chú tác giả: "tròn 1 tháng" có thể bị hiểu là 1 tháng dự án hoặc 1 tháng vào công ty, nhưng tin ghim HR ghi ngày vào là 08/09, còn thiệp váy ghi 15/09. Chat không nêu tên quán, không nói "váy".

### `thread_012` - Technosoft - Toàn công ty (nhóm, 46 thành viên)

Tin của `contact_011` hiển thị theo tên danh bạ "Khoa BE" (đúng hành vi app thật). Các thành viên khác hiển thị tên tài khoản.

- 📌 Tin ghim, 08/09 09:00 - HR Technosoft: "Chào mừng bạn Nguyễn Thị Thu Hương - Marketing Executive gia nhập Technosoft từ hôm nay 🎉 Mọi người nhớ hỗ trợ bạn nhé!" (`msg_012_0001`, `CLUE-ZOLA-08`)
- 13/10 08:30 - HR Technosoft: "Nhắc cả nhà cập nhật thông tin người phụ thuộc trước 31/10 ạ."
- 14/10 16:00 - Ban Hành chính: "Thứ 7 này vệ sinh điều hòa tầng 9, mọi người dọn bàn giúp nhé."
- D 10:05 - Khoa BE: "Team MKT nhờ cả nhà share bài ra mắt app ShopNow giúp nha 🙏" (`msg_012_0004`, `CLUE-ZOLA-08`)
- D 10:20 - HR Technosoft: "Cảm ơn Hương nha 🙌 Đã share!" (trả lời tin 10:05, `msg_012_0005`)
- D 10:22 - Bách Chut: "Đã share 👍"
- D 11:00 - Ban Hành chính: "Bãi xe B1 sáng mai sơn lại vạch, mọi người gửi xe B2 nhé."

### `thread_002` - Team Dev Technosoft (nhóm: Thịnh, Nam, Bách; tắt thông báo)

Người gửi hiện theo tên danh bạ (`senderContactId`: Nam Dev `contact_004`, Bách Chut `contact_014`).

- D 09:05 - Nam: "Bản fix cart lên staging rùi nhé ae."
- D 09:12 - Thịnh: "Nhờ ae test thêm case update quantity nhé."
- D 14:10 - Bách: "E confirm hết bug cũ rùi a."
- D 17:30 - Nam: "Sếp Tuấn Anh 6h bay Đà Nẵng, họp sprint tối nay dời sang T2 nhé ae." (`msg_002_0012`, `CLUE-ZOLA-09`)
- D 17:32 - Thịnh: "Ok ông 👍"
- D 17:33 - Bách: "Ngon, về sớm 🎉"
- D 23:43 - Nam: "Ae ơi staging lại lỗi giỏ hàng, mai sáng check giúp nhé"
- D 23:44 - Bách: "Ok a, e note lại rồi"

### `thread_005` - Vợ

Lịch sử cũ (trước 12/10) giữ dạng sinh hoạt từ shared fixtures.

- 13/10 21:00 - Vợ: "Thứ 5 em đi khám, anh xin về sớm đi cùng em được không?"
- 13/10 21:05 - Thịnh: "Thứ 5 anh có họp sprint rồi vợ ơi. Em đi trước, có gì nhắn anh nhé."
- 13/10 21:06 - Vợ: "Vâng."
- 14/10 17:40 - Vợ: "Về mua giúp em túi rác loại vừa nhé."
- 14/10 17:43 - Thịnh: "Anh đặt rồi, mai giao."
- D 16:05 - Vợ: "Em khám xong rồi. Tối về em có chuyện muốn nói 🙂"
- D 16:20 - Thịnh: "Chuyện gì thế vợ? Khám ổn không em?"
- D 16:21 - Vợ: "Ổn mà. Tối nói 😊"
- D 18:52 - Vợ: "Em nấu canh cua mồng tơi anh thích rồi. Mấy giờ anh về?"
- D 18:55 - Thịnh: "Tối nay họp sprint với cả team, chắc 9h. Vợ ăn trước nhé ❤️" (`msg_005_0079`, `CLUE-ZOLA-09`)
- D 18:56 - Vợ: "Vâng. Em đợi anh."
- D 20:45 - Vợ: "Họp xong chưa anh?"
- D 20:46 - Thịnh: "Chưa em, sếp Tuấn Anh đang chốt nốt." (`msg_005_0082`, `CLUE-ZOLA-09`)
- D 22:10 - Thịnh: "Anh về tới hầm rồi."

### `thread_004` - Anh Tuấn Thợ Điện

Liên hệ `contact_013`, SĐT `0912345801`. Danh tính tác giả: `suspect_02` (vô tội). Thịnh xưng `em`, Tuấn xưng `anh`.

- 13/10 08:10 - Thịnh: "Anh Tuấn ơi, em nhờ anh lắp bình nóng lạnh nhà mẹ em trước chủ nhật được không ạ? Em muốn làm bất ngờ cho mẹ dịp sinh nhật."
- 13/10 08:25 - Tuấn: "Được em. Bình em đặt về thẳng nhà bà ấy à?"
- 13/10 08:30 - Thịnh: "Vâng, shop giao thứ 6. Anh lắp sáng thứ 6 lúc mẹ em đi chợ nhé."
- D 15:35 - Tuấn: "Anh nhận cọc rồi nhé."
- D 22:58 - Tuấn: "Sáng mai anh vào lắp sớm. Em yên tâm, không để bà ấy biết đâu." (`toast_001`, `CLUE-ZOLA-11`)

### `thread_010` - Mẹ Ở Quê

Liên hệ `contact_001`, SĐT `0915220011`. Mẹ viết đủ chữ, không viết tắt.

- 13/10 07:15 - Mẹ: "Bình nóng lạnh nhà mình hỏng mấy hôm rồi con ạ. Mẹ đun nước tắm cũng được, con đừng lo."
- 13/10 07:30 - Thịnh: "Mẹ cứ để con tính."
- 14/10 07:20 - Mẹ: "Gà mẹ gửi xe lên rồi, hai đứa nhớ cất ngăn đá."
- 14/10 07:35 - Thịnh: "Con nhận rồi mẹ. Chủ nhật chúng con về mừng sinh nhật mẹ."
- 14/10 07:40 - Mẹ: "Về là vui rồi, đừng mua gì tốn kém."
- D 18:12 - Mẹ: "Bưởi để ngoài cho ráo, đừng bọc túi kín."
- D 18:15 - Thịnh: "Vâng mẹ."

### `thread_008` - Bé Ngọc KTX

Liên hệ `contact_003`, SĐT `0922334455`. Bản xem trước của luồng trên danh sách: "Nhớ là a đừng kể gì nha 🙊".

- 12/10 09:10 - Ngọc: "A ơi e nhận đc tiền phòng rùi nha."
- 12/10 09:12 - Thịnh: "Ừa, nhớ báo mẹ là a chuyển rùi nhé."
- 13/10 10:40 - Ngọc: "Đèn học về rùi, sáng đỉnh chóp lun a 😍"
- D 19:50 - Ngọc: "A ơi cứu e 😭"
- D 19:51 - Ngọc: "E trượt Vĩ mô rùi, mai hạn đóng tiền học lại 1tr2. Mẹ mà biết thì e toi."
- D 20:02 - Thịnh: "Học hành kiểu gì thế. A chuyển rồi đấy."
- D 20:12 - Ngọc: "E nhận đc rùi, cảm ơn a nhiều 😭"
- D 20:13 - Ngọc: "Nhớ là a đừng kể gì nha 🙊" (`CLUE-ZOLA-10`, bẫy bản xem trước)

### `thread_007` - Lan Anh Kế Toán

Liên hệ `contact_007`, SĐT `0966778899`.

- 14/10 15:02 - Lan Anh: "A ơi a đặt giúp e lẵng hoa sáp sinh nhật anh Tuấn Anh nhé. Để tên Mai lễ tân nhận cho kín, anh Tuấn Anh hay xuống sảnh lắm 😅"
- 14/10 15:06 - Thịnh: "Ok e, a đặt luôn."
- 14/10 15:10 - Lan Anh: "Quỹ nhóm mình mỗi người 100 nha a, e gom dần."
- D 19:58 - Lan Anh: "A ơi, 6h thấy a về sớm thế, mỗi a chưa đóng quỹ sinh nhật anh Tuấn Anh 😤 Sinh nhật dời sang T2 vì a ấy đi công tác rồi."
- D 20:31 - Thịnh: "A ck rồi nhé, ứng luôn 500k cho cả nhóm, mọi người gửi lại a sau."
- D 20:35 - Lan Anh: "Nhận rồi ạ, e ghi sổ đủ 5 người nhé."

### `thread_009` - Thảo PT California

Liên hệ `contact_005`, SĐT `0944556677`.

- 13/10 17:15 - Thảo: "Thứ 5 a có họp tối thì mình tập sớm 18h nhé, buổi đánh giá lại cột sống."
- 13/10 17:20 - Thịnh: "Đc e, lưng a dạo này lại căng."
- 13/10 17:22 - Thảo: "A mang phiếu đánh giá buổi trước nha. Mình tập nhẹ thôi."
- D 08:10 - Thảo: "Nhắc a đứng dậy đi lại sau mỗi tiếng ngồi làm việc nhé."
- D 18:20 - Thảo: "A tới chưa? E đợi a nãy giờ 😤"
- D 18:45 - Thảo: "A ko tới thì e trừ buổi nha a. Lưng mà đau lại thì đừng kêu e đấy."

### `thread_011` - Mai Lễ Tân

Liên hệ `contact_009`, SĐT `0988990011`.

- D 11:38 - Mai: "Sảnh có 2 kiện liên quan a ạ: 1 túi dài người nhận tên e (chị Lan Anh dặn rồi), 1 hộp nhỏ người nhận khác nhưng shipper bảo đưa a."
- D 11:42 - Thịnh: "Ừ của a cả, chiều a xuống lấy hộp nhỏ nha."
- D 15:05 - Mai: "A lấy hộp nhỏ rồi nhé. Túi hoa e cất kho tới T2 như chị Lan Anh dặn ạ. Lần sau a nhớ ký sổ giúp e 🙏"

### `thread_006` - Tuấn Chó

- 14/10 12:02 - Tuấn: "Cn đủ ng đá chưa ông?"
- 14/10 12:10 - Thịnh: "Cn tôi về quê sinh nhật mẹ, nghỉ 1 tuần nhé."
- 14/10 12:12 - Tuấn: "Ok, cho tôi gửi lời chúc bác."
- D 21:18 - Tuấn: "Tuần sau nhớ mang áo xanh, tuần trc lẫn đội suốt."
- D 21:34 - Thịnh: "Rùi, giày còn đang phơi."

### `thread_001` - Cư dân tầng 12 CT2 (tắt thông báo)

- D 07:45 - Ban quản lý: "Sáng thứ bảy bảo trì thang B từ 9h đến 11h."
- D 07:52 - Căn 1204: "Thang A vẫn hoạt động chứ ạ?"
- D 08:00 - Ban quản lý: "Vâng, thang A hoạt động bình thường."
- D 23:42 - Căn 1208: "Xe biển 29X1-468.xx đang chắn lối hầm B1, chủ xe xuống dời giúp ạ"
- D 23:45 - Ban quản lý: "Bảo vệ đang liên hệ chủ xe ạ."

### `thread_046` - Hội Poker Tối Thứ 6 (nhóm 7 người: A9, Namzua, Bình Đại Bàng, Sếp Tuấn Anh, Tuấn Chó, Trung Khỉm, Thịnh; 3 tin chưa đọc)

- 13/10 21:05 - A9: "Thứ 6 này chơi ở nhà anh nhé, chị đi vắng." / Namzua: "Ok a, e mang bánh." / Thịnh: "Em đến muộn tí, 8h nhé."
- D 22:31 - 22:34 - Bình hỏi chốt người; Trung và Tuấn Chó nhận đi.
- D 22:50 - Sếp Tuấn Anh: "Anh đang ở Đà Nẵng, CN mới về. Tuần này anh nghỉ." (xác nhận gián tiếp họp sprint bị hủy)
- D 22:52 - A9: "Sếp đi công tác là bọn em vui rồi 😂"
- D 23:38 - 23:42 (chưa đọc) - Namzua: "Ông Thịnh đâu, im thế?"; Bình: "Chắc đang bận việc nhà 😏"; A9: "Thịnh còn nợ anh 2 phỉnh tuần trước đấy nhé, đừng có lặn 😏" (`toast_002`)

### `thread_047` - Cầu lông T3-T5 (nhóm 4 người: Namzua, Tuấn Chó, Trung Khỉm, Thịnh)

13/10 trêu nhau về trận thứ 3; D 21:58 Namzua báo sân bảo trì, nghỉ buổi tối nay; Tuấn Chó hẹn bù thứ 7; D 23:28 Trung đặt sân 3 lúc 7h thứ 7; D 23:30 Thịnh: "Ok, t7 a đi được."

### `thread_048` - Minh Bằng Cổ (1-1, `contact_028`)

10/10 Minh khoe mua thêm tay cầm máy game; D 22:41 - 22:45 rủ Thịnh và vợ chủ nhật sang nhà (ngõ 68 Trung Kính) đua xe. Thịnh xưng `em`.

Thứ tự hộp thư theo giờ tin cuối: Cư dân (23:45), Team Dev (23:44), Poker (23:42), Cầu lông (23:30), thợ điện (22:58), Minh Bằng Cổ (22:45), Vợ (22:10), Tuấn Chó (21:34), "Khoa BE" (21:33, thứ 9). Số chưa đọc chỉ ở các luồng có tin sau lúc Thịnh cầm máy lần cuối (Cư dân 2, Team Dev 2, Poker 3, thợ điện 1 khớp thông báo); luồng có manh mối không bao giờ có tin chưa đọc. Huy hiệu Zola = 8.

Tỷ lệ: 15 luồng, 2 luồng mang manh mối kết tội (`thread_003`, `thread_005`) cộng tin rải rác trong 2 nhóm; các luồng còn lại là sinh hoạt hoặc giải oan.

## 3. `banking` - 20 giao dịch

Chỉ tên tài khoản pháp lý không dấu xuất hiện. Không có nhãn nghi phạm, chức danh hay SĐT.

| ID | Ngày giờ | Số tiền (đ) | Đối tác | Nội dung |
|---|---|---:|---|---|
| `tx_020` | 10/10 08:30 | +35.000.000 | CONG TY CP CONG NGHE TECHNOSOFT | Luong thang 10 Nguyen Huy Thinh |
| `tx_019` | 10/10 08:45 | -31.500.000 | TRAN MINH THU | Sinh hoat thang 10 |
| `tx_018` | 10/10 09:10 | -280.000 | VNPT | Cuoc internet thang 10 |
| `tx_017` | 10/10 09:12 | -1.450.000 | EVN HA NOI | Thanh toan tien dien |
| `tx_016` | 11/10 07:40 | -70.000 | CUA HANG XANG DAU | Thanh toan QR |
| `tx_015` | 12/10 08:50 | -2.500.000 | NGUYEN BAO NGOC | Tien phong thang 10 |
| `tx_014` | 12/10 17:30 | -326.000 | SIEU THI | Thanh toan the |
| `tx_013` | 13/10 12:15 | -45.000 | COM VAN PHONG | Thanh toan QR |
| `tx_012` | 13/10 17:45 | -1.500.000 | CALIFORNIA FITNESS | Goi PT thang 10 |
| `tx_011` | 13/10 18:55 | -5.000 | BAI XE MINH AN | Thanh toan QR |
| `tx_010` | 14/10 18:20 | -60.000 | NUOC UONG | Thanh toan QR |
| `tx_009` | 14/10 19:10 | +89.000 | SAN MUA SAM | Hoan don huy |
| `tx_008` | D 07:35 | -30.000 | BANH MI | Thanh toan QR |
| `tx_007` | D 13:05 | +55.000 | TRAN VAN NAM | Com hom qua |
| `tx_006` | D 15:30 | -1.500.000 | TRAN VAN TUAN | Coc |
| `tx_005` | D 20:10 | -1.200.000 | NGUYEN BAO NGOC | CK |
| `tx_004` | D 20:30 | -500.000 | NGUYEN LAN ANH | CK |
| `tx_003` | D 20:48 | -640.000 | COM NIEU PHO CO | Thanh toan the |
| `tx_002` | D 21:15 | -100.000 | NHA MANG | Nap tien dien thoai |
| `tx_001` | D 22:05 | -28.000 | CUA HANG TIEN LOI | Thanh toan QR |

`CLUE-BANK-07` chỉ gắn `tx_003`. Ba khoản chuyển tối D (`tx_005`, `tx_004`) và khoản cọc chiều (`tx_006`) là bẫy có lời giải trong chat. Chuyển khoản online không chứng minh vị trí; chỉ thanh toán thẻ tại quán làm được việc đó. Không có giao dịch nào với Hương ở màn này.

## 4. `ecommerce` - 9 đơn, 5 luồng người bán

| ID | Đặt / nhận | Mặt hàng, phân loại | Giá đã trả | Người nhận, SĐT, địa chỉ / trạng thái |
|---|---|---|---:|---|
| `order_005` | 12/10 20:10 / D 11:35 | Set váy lụa công sở, be, size S | 489.000đ | Nguyễn Thị Thu Hương, `0988886677`, Sảnh tầng 1 tòa Minh An, 28 Duy Tân / Đã giao (`CLUE-POSH-05`) |
| `order_003` | 14/10 15:20 / D 11:35 | Lẵng hoa sáp, mẫu vàng | 350.000đ | Đỗ Thị Mai, `0988990011`, Sảnh tầng 1 tòa Minh An / Đã giao (`CLUE-POSH-06`) |
| `order_004` | 13/10 09:30 / chưa nhận | Bình nóng lạnh 20L, trắng | 2.390.000đ | Nguyễn Thị Hòa, `0915220011`, Xóm 3, xã Yên Phong, huyện Ý Yên, Nam Định / Đang vận chuyển, dự kiến 16/10 (`CLUE-POSH-06`) |
| `order_006` | 10/10 / 13/10 | Đèn học, trắng | 179.000đ | Nguyễn Bảo Ngọc, `0922334455`, Phòng 305 nhà B2, KTX An Hòa, 16 ngõ 165 Xuân Thủy / Đã giao |
| `order_008` | 09/10 / 11/10 | Bàn phím cơ, nâu | 690.000đ | Nguyễn Huy Thịnh, `0901236789`, Căn hộ 1206 tòa CT2 An Bình / Đã giao |
| `order_009` | 08/10 / 10/10 | Dây rút, túi 100 chiếc | 25.000đ | Nguyễn Huy Thịnh, nhà / Đã giao |
| `order_007` | 10/10 / 12/10 | Cà phê hạt, 500g | 140.000đ | Nguyễn Huy Thịnh, nhà / Đã giao |
| `order_002` | 14/10 / - | Áo polo nam, xanh, L | 0đ (hoàn 89.000đ 14/10) | Nguyễn Huy Thịnh, nhà / Đã hủy |
| `order_001` | 14/10 / dự kiến 16/10 | Túi rác, cỡ vừa | 39.000đ | Nguyễn Huy Thịnh, nhà / Đang vận chuyển |

Chat người bán:
- `shopchat_004` (Lụa Satin), 12/10: 20:10 Thịnh: "Mẫu be còn S không shop?"; 20:12 Shop: "Còn anh nhé."; 20:15 Thịnh: "Gửi kèm thiệp ghi giúp mình: 15/09 - 15/10 ♡"; 20:17 Shop: "Dạ, shop để thiệp trong hộp, không in ngoài kiện." (`CLUE-POSH-05`)
- `shopchat_002` (Hoa Sáp Xinh), 14/10: 15:18 Thịnh: "Thiệp ghi giúp: Chúc mừng sinh nhật! - Team Dev"; 15:22 Shop: "Dạ, giao sảnh Minh An sáng thứ 5 ạ." (giải oan Mai)
- `shopchat_003` (Điện Máy Nhà Mình), 13/10: 09:28 Thịnh: "Shop giao về quê giúp mình, gọi số người nhận trước khi tới nhé."; 09:35 Shop: "Dạ, bên em gọi bác Hòa trước 30 phút ạ." (giải oan thợ điện)
- `shopchat_005`, 09/10: 12:20 Thịnh: "Bản này ghép được hai máy không?"; 12:25 Shop: "Dạ được ạ."
- `shopchat_001`, 14/10: 18:20 Shop: "Màu xanh hết L, anh đổi màu không?"; 18:25 Thịnh: "Thôi hủy giúp mình."; 18:30 Shop: "Dạ shop xác nhận hoàn 89.000đ."

Thông báo đơn hàng (khớp đơn nguồn, không sau 23:45 D): D 11:36 "Đơn `order_005` đã giao thành công"; D 11:37 "Đơn `order_003` đã giao thành công"; D 14:00 "Đơn `order_004` đang trên đường giao tới Nam Định"; 14/10 19:10 "Đơn `order_002` đã hoàn 89.000đ"; D 09:00 "Đơn `order_001` dự kiến giao 16/10".

Tìm kiếm gần đây: "bình nóng lạnh 20l", "váy lụa be", "hoa sáp sinh nhật", "túi rác vừa", "bàn phím không dây".

Mỏ neo đối chiếu: vợ mặc size M ([husband-profile.md](husband-profile.md)); váy size S không phải cho vợ. Ba đơn có người nhận nữ (Hương, Mai, Hòa); chỉ đơn váy có SĐT trùng "Khoa BE".

## 5. `phone` - 14 cuộc gọi, 32 liên hệ

| ID | Ngày giờ | Liên hệ | Hướng | Giây kết nối |
|---|---|---|---|---:|
| `call_014` | 12/10 18:05 | Mẹ Ở Quê | Đến | 320 |
| `call_012` | 13/10 09:15 | Bé Ngọc KTX | Đến | 186 |
| `call_013` | 13/10 08:40 | Anh Tuấn Thợ Điện | Đi | 132 |
| `call_011` | 13/10 11:40 | Nam Dev | Đi | 95 |
| `call_010` | 13/10 17:25 | Thảo PT California | Đến | 63 |
| `call_009` | 14/10 12:20 | Tuấn Chó | Đi | 240 |
| `call_008` | 14/10 15:00 | Lan Anh Kế Toán | Nhỡ | 0 |
| `call_007` | D 11:40 | Mai Lễ Tân | Nhỡ | 0 |
| `call_006` | D 12:30 | Vợ | Đến | 88 |
| `call_005` | D 18:00 | Mẹ Ở Quê | Đến | 144 |
| `call_004` | D 18:30 | Thảo PT California | Nhỡ | 0 |
| `call_003` | D 19:18 | Khoa BE | Đi | 26 |
| `call_002` | D 21:05 | Ban Quản Lý | Đến | 51 |
| `call_001` | D 23:20 | Khoa BE | Đi | 96 (`CLUE-PHONE-01`) |

Danh bạ 32 mục: 17 mục gốc dưới đây cộng 15 bạn bè từ [friend-aliases.md](../friend-aliases.md) (`contact_019` - `contact_033`, chỉ sinh hoạt). 17 mục gốc (số đầy đủ hiện trong thẻ liên hệ; thêm California Fitness `19006868` và Thông tin gói cước `191` để mỗi luồng SMS có liên hệ): Vợ `0900112233`; Mẹ Ở Quê `0915220011`; Bé Ngọc KTX `0922334455`; Nam Dev `0933445566`; Bách Chut `0933778899`; Thảo PT California `0944556677`; Tuấn Chó `0977112233`; Lan Anh Kế Toán `0966778899`; Mai Lễ Tân `0988990011`; Khoa BE `0988886677`; Ban Quản Lý `0243556677`; Anh Tuấn Thợ Điện `0912345801`; Giao Nước `0904556677`; Giao Hàng `0905667788`; Tổng đài nhà mạng `18008098`. Không ghi chú, ảnh thật hay nhãn quan hệ trên "Khoa BE".

## 6. `messages` - SMS (một luồng cho mỗi liên hệ Phone)

Quy tắc danh bạ chung: mỗi liên hệ trong Phone mở được một luồng SMS có ít nhất 6 tin lịch sử (32 luồng; 15 luồng bạn bè `thread_031` - `thread_045` là lịch sử 09/2026 - 03/10, không có tin ngày D). Bảng dưới là các tin mới quanh D; lịch sử cũ trước 10/10 nằm trong `level_01.json`. Luồng SMS của "Khoa BE" chỉ có việc văn phòng trung tính (cáp phòng họp, tài liệu, brief), không có tin tình cảm. California Fitness có thêm 5 tin xác nhận buổi PT, gồm buổi 18:00 ngày 15/10.

| Luồng | Ngày giờ | Nội dung hiển thị |
|---|---|---|
| `thread_015` | D 19:05 | "California Fitness: Quy khach vang mat buoi PT 18:00 ngay 15/10. Buoi tap da duoc tru khoi goi." (`CLUE-MSG-02`) |
| `thread_014` | D 21:15 | "Nap thanh cong 100.000d. Cam on quy khach." |
| `thread_022` | 13/10 10:05; 10:40 | "Don den hoc dang duoc giao." / "Don hang da giao thanh cong." |
| `thread_018` | D 08:05 | "Nhac lich bao tri thang B sang thu bay, 09h-11h." |
| `thread_020` | 14/10 09:00 | "Uu dai goi data cuoi tuan. Bo qua neu khong co nhu cau." |
| `thread_024` | 12/10 18:00; 18:04 | Mẹ: "Mẹ gọi không được, lát gọi lại nhé." / Thịnh: "Con gọi lại ngay." |

Không có SMS mang manh mối từ "Khoa BE".

## 7. Sinh hoạt trong các ứng dụng còn lại

Không gắn clue hoặc nghi phạm, không khóa, không tạo bằng chứng kết tội.

### `ride-hailing` - 6 hoạt động
Giữ nguyên bản trước: `trip_006` 10/10 08:00, `trip_005` 10/10 18:10, `trip_004` 11/10 11:45, `trip_003` 12/10 16:30, `trip_002` 13/10 07:50 (0đ), `trip_001` 14/10 08:20. Thịnh đi xe máy. Ngày D chỉ có `trip_021` (D 18:58, Technosoft -> Cơm Niêu Phố Cổ, 52.000đ, "Đặt hộ · SĐT người đi 0988886677", `CLUE-GRAP-04`): Thịnh đặt xe cho Hương tới quán.

### `web-browser` - 8 lịch sử, 2 tab + 1 manh mối
12/10 08:52 "Váy lụa dáng suông - bảng size" (`hist_026`, `CLUE-BROW-05`): bảng size S/M, xem trước khi đặt `order_005`; vợ mặc size M.

11/10 "React cập nhật trạng thái"; 11/10 "TypeScript kiểu dữ liệu tổng hợp"; 12/10 "Dự báo mưa cuối tuần"; 13/10 "Bình nóng lạnh 20 lít loại nào tốt"; 13/10 "Cách vệ sinh bàn phím cơ"; 14/10 "Bảo dưỡng xe máy định kỳ"; D 10:00 "CSS grid căn cột"; D 17:10 "Cách bảo quản bưởi". Tab mở: bài CSS grid, so sánh bình nóng lạnh.

### `photos` - 10 ảnh sinh hoạt
10/10 bàn phím mới; 10/10 hộp bàn phím; 11/10 mâm cơm nhà; 11/10 chậu húng quế ban công; 12/10 hai túi đồ siêu thị; 12/10 ảnh gia đình ở quê; 13/10 bảng ghi chú họp; 13/10 ảnh chụp bình nóng lạnh hỏng mẹ gửi; 14/10 bưởi mẹ gửi; 14/10 giày đá bóng đang phơi. Không có ảnh bữa tối ngày D.

### `personal-notes` - 6 ghi chú
10/10 "Tiền nhà": "Đã chuyển sinh hoạt tháng 10."; 11/10 "Đồ cần mua": "Túi rác cỡ vừa; nước rửa bát."; 13/10 "Sinh nhật mẹ 18/10": "Bình nóng lạnh, nhờ anh Tuấn lắp thứ 6. Đừng để mẹ biết."; 13/10 "Lưng": "Đứng dậy mỗi giờ; tập nhẹ."; 14/10 "Bảo dưỡng xe": "Dầu máy, lốp, phanh trước."; D 10:30 "Việc tuần sau": "Họp sprint T2; xem lỗi hoàn tiền; trả sách cho Nam."

### `email` - 8 thư
10/10 "Phiếu lương tháng 10"; 10/10 "Xác nhận thanh toán internet"; 11/10 "Bản tin công nghệ"; 12/10 "Ưu đãi cuối tuần"; 13/10 "Xác nhận gói PT tháng 10" (1.500.000đ); 13/10 "Xác nhận đơn bình nóng lạnh 20L"; 14/10 "Hoàn tiền đơn áo polo" (89.000đ); D 08:00 "Lịch bảo trì thang máy".

### `professional-network` - 5 bài
Giữ nguyên bản trước (bài kiểm thử giao diện, tin tuyển frontend, Nam hoàn thành khóa TypeScript, buổi chia sẻ kỹ thuật, Bách cập nhật dự án).

### `team-collaboration` - 5 mục
11/10 `#frontend` quy ước đặt tên hook; 12/10 `#general` cập nhật người phụ thuộc; 13/10 `#support` máy in hết giấy; 14/10 `#frontend` Thịnh nhờ xem màn hình hoàn tiền; D 17:31 `#sprint` bot lịch: "Sprint Review 15/10 19:00 đã dời sang 19/10 19:00".

## 8. Kiểm tra nội dung trước triển khai

1. Số `0988886677` chỉ xuất hiện ở danh bạ "Khoa BE", hai cuộc gọi "Khoa BE", người nhận `order_005` và chuyến đặt hộ `trip_021`.
2. Tên `Nguyễn Thị Thu Hương` chỉ xuất hiện ở tin ghim HR và người nhận `order_005`. Lời "Cảm ơn Hương nha" là gợi ý nối, không có họ tên đầy đủ.
3. Hai thông báo khởi phát trùng nguyên văn và giờ với tin trong `thread_004` (22:58) và `thread_046` (23:42). Không thông báo nào nhắc "Khoa BE".
4. Mọi bẫy nghi ngờ có lời giải đọc được trước đối chất: Tuấn (luồng Mẹ, luồng Tuấn, `order_004`, ghi chú), Ngọc (trọn luồng), Lan Anh (luồng Lan Anh), Thảo (luồng Thảo + `thread_015`), Mai (luồng Lan Anh, `shopchat_002`, luồng Mai).
5. Tỷ lệ: 13/15 luồng chat, 19/20 giao dịch, 8/9 đơn, 12/14 cuộc gọi, 32/32 luồng SMS, 20/21 chuyến xe, 25/26 lịch sử web không mang manh mối kết tội.
6. Xưng hô đã kiểm: Thịnh - thợ điện `em - anh`; Thịnh - Mẹ `con - mẹ`; Thịnh - Ngọc, Lan Anh, Thảo, Mai, Khoa BE `a - e`; Thịnh - Nam, Tuấn Chó, Namzua `tôi - ông`; Thịnh - Linh Yoyo `tôi - bà`; Thịnh - A9, Bình, Thành, Minh Worm, Minh Bằng Cổ, Phòng, Vượng, Sếp Tuấn Anh `em - anh`; Thịnh - Hồng Emerald `em - chị`; Thịnh - Trung, Phương, Trang, Dương `a - e`.

## 9. Mạch sự kiện liên tục - chỉ dành cho tác giả

- **Khởi đầu**: Hương vào công ty 08/09; Thịnh và Hương bắt đầu quen 15/09.
- **Chuẩn bị quà**: 12/10 đặt váy size S, để tên và số Hương làm người nhận; nếu bị hỏi sẽ nói "đặt hộ". Shipper gọi Hương lúc giao; Hương dặn để ở lễ tân và đưa anh Thịnh.
- **Lịch trùng**: 13/10 Thảo chốt PT 18:00 thứ Năm vì 19:00 có họp sprint. 14/10 Hương nhắc tròn 1 tháng; Thịnh từ chối vì họp.
- **Biến cố**: 17:30 D họp bị hủy. 17:35 Thịnh chủ động hẹn Hương, quên buổi PT, và không báo vợ dù vợ đang chờ nói tin vui.
- **Buổi tối**: 18:00 rời văn phòng (Lan Anh thấy). 18:58 Thịnh đặt Grab hộ Hương từ Technosoft tới quán (`trip_021`, hiện SĐT người đi). 19:18 gọi Hương, 19:20 Hương tới, hai người ăn ở tầng 2 Cơm Niêu Phố Cổ; Thịnh trao hộp váy. Trong bữa, Thịnh chuyển tiền cho Ngọc và Lan Anh bằng điện thoại. 20:46 nói dối vợ lần 2; 20:48 trả tiền bằng thẻ.
- **Kết thúc buổi tối**: Thịnh về tới hầm 22:10. 23:20 Thịnh gọi Hương từ ban công hỏi đã về tới nhà chưa. Từ 22:31 nhóm poker, cầu lông và Minh Bằng Cổ chat khuya. 23:45 Thịnh vào tắm, máy 8% pin cắm sạc ngoài phòng.
- **Hậu kết (sau đối chất)**: Thịnh chặn số "Khoa BE". Hương chuyển `+1.000 đ` kèm lời nhắn "Anh chan so em that a?" - mở đầu Màn 2.
