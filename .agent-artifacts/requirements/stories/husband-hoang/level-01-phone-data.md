# Màn 1 - Dữ liệu sinh hoạt và lời thoại

> Phần dữ liệu của [hồ sơ Màn 1](level-01.md) và [Storyboard](level-01-storyboard.md), dùng cùng hồ sơ khi hiện thực hóa. Các ngày bên dưới thuộc đồng hồ hư cấu của màn chơi; D = 15/10/2026, thời điểm kiểm tra máy 23:45, không gắn với ngày chạy ứng dụng.

## 1. Quy tắc phân bố

- Chỉ bốn ứng dụng có manh mối kết tội: `internet-messaging`, `banking`, `ecommerce`, `phone`. `messages` và bảy ứng dụng còn lại có sinh hoạt bình thường.
- Ít nhất 75% bản ghi cấp danh sách trong từng ứng dụng có manh mối là sinh hoạt hoặc dữ liệu giải oan. Không tính từng bong bóng chat thành một bản ghi để đạt tỷ lệ. Tin nhắn trong luồng nghi vấn vẫn có trao đổi bình thường.
- Hiển thị theo thời gian của từng ứng dụng. Không ghim sẵn, đổi màu, tăng số chưa đọc hoặc đẩy manh mối lên đầu vì vai trò trong vụ án. Dữ liệu sinh hoạt có chi tiết để đọc, không chỉ có tiêu đề rỗng.
- Các nhãn “sinh hoạt”, “giải oan”, “manh mối” chỉ dành cho tác giả; không xuất hiện trên điện thoại. Không tự gắn người mới vào danh sách nghi phạm.
- Không có ngày sau D hoặc giờ sau 23:45 D. Cuộc gọi nhỡ có thời lượng kết nối bằng 0. Mã, tên, thời điểm và số tiền lặp giữa ứng dụng phải trùng nhau.

## 2. `internet-messaging` - 10 luồng

Mỗi dòng có tiền tố người nói và giờ; ngày chung ở tiêu đề. Các tin cùng người được giữ thành bong bóng riêng. Có thể đọc trọn luồng, không chỉ bản xem trước.

### `thread_tuan` - Anh Tuấn Thợ Điện

Số liên hệ `0988886677`; danh tính thật chỉ dành cho tác giả: `suspect_huong`. Hương chính là kẻ đóng giả vỏ bọc thợ điện ("fake electrician"). Hoàng cố tình lưu tên danh bạ là "Anh Tuấn Thợ Điện" để đánh lừa vợ, và hai người thống nhất dùng cớ dịch vụ sửa điện làm bình phong nhắn tin. Tuy nhiên, nội dung hội thoại giữa người liên hệ (Hương đóng vai thợ điện xưng "em") và Hoàng (khách hàng xưng "anh") lại tràn ngập những ẩn ý vụng trộm, mập mờ và dấu hiệu ngoại tình phản bội (bảo hành tận nơi vì anh thấy người nóng ran, lắp đèn ngủ ấm áp đòi khao cơm niêu, hẹn chỗ cũ tầng 2 kín đáo mừng tròn 1 tháng ngày nhận sửa điện lần đầu, ăn xong về bảo dưỡng đường dây tiếp, nửa đêm nhắn treo áo khoác của khách hàng lên tủ).

- 13/10 10:10 - Hoàng: “Tuấn ơi, tối mai qua kiểm tra lại cái đường dây điện giúp a đc ko?”
- 13/10 10:14 - Người liên hệ: “Mai e kín lịch rùi a. Để tối thứ Năm (15/10) em ghé kiểm tra toàn bộ nhé.”
- 13/10 10:18 - Người liên hệ: “Kiểm tra xong nhớ khao thợ điện bữa cơm niêu như a hứa đấy.”
- 14/10 12:45 - Người liên hệ: “E gửi lại a 160k tiền thừa hôm trc a đưa mua cuộn băng dính vs cầu chì nhé.”
- 14/10 12:50 - Hoàng: “Có mấy đồng mà cũng gửi lại. Để mai a bù vào bữa tối khao thợ điện nhé.”
- D 15:20 - Hoàng: “Tối nay thợ điện nhớ mang đủ đồ nghề nhé. Đúng hẹn chứ?”
- D 16:42 - Người liên hệ: “Vâng anh, em đặt bàn bên Phố Cổ rồi nhé, 19h30. Chỗ cũ trên tầng 2 cho yên tĩnh.”
- D 16:45 - Hoàng: “Nay tròn 1 tháng ngày em nhận sửa điện cho anh lần đầu đấy, tối nay để anh khao.”
- D 16:48 - Người liên hệ: “Khách hàng gì mà nhớ dai thế. Ăn cơm niêu xong nhớ về bảo dưỡng đường dây tiếp cho em đấy.”
- D 19:20 - Người liên hệ: “Em đang gửi xe dưới quán Cơm Niêu rồi, anh tới chưa?”
- D 23:44 - Người liên hệ: “Đồ anh để quên em cất rồi, mai em mang qua nhé.”

Chỉ cụm hẹn ăn ngày D (16:42, 16:45, 19:20) mang `CLUE-ZOLA-07`. Sự liên kết giữa "chỗ cũ trên tầng 2 Phố Cổ" và cớ "tròn 1 tháng ngày em nhận sửa điện lần đầu" ngụy trang tinh tế cho mốc kỷ niệm 1 tháng (15/09 - 15/10) trên thiệp quà tặng ở ứng dụng mua sắm, đồng thời khớp với hóa đơn nhà hàng Cơm Niêu Phố Cổ lúc 20:48. Cuộc gọi 26s lúc 19:22 (`call_tuan_early`) giải thích việc đón tiếp tại bàn mà không cần nhắn tin khi đang ngồi ăn; sau đó hai người về phòng riêng "bảo dưỡng đường dây" và Hoàng bỏ quên đồ; cuộc gọi đêm 23:30 (`call_tuan_late`, 96s) giải thích việc Hoàng phát hiện để quên đồ trước khi có tin nhắn 23:44. Tin nhắn 23:44 là thông báo khởi phát (`toast_01`), không tự là bằng chứng độc lập.

### `thread_wife` - Vợ

- 14/10 17:40 - Vợ: “Về mua giúp em túi rác loại vừa nhé.”
- 14/10 17:43 - Hoàng: “Anh mua rồi, để cạnh cửa.”
- D 18:52 - Vợ: “Em để phần canh trong nồi. Mấy giờ anh về?”
- D 18:55 - Hoàng: “Anh còn ở công ty, họp với cả nhóm. Em ăn trước nhé.”
- D 18:57 - Vợ: “Vâng, về hâm lại rồi ăn.”
- D 20:45 - Vợ: “Anh họp xong chưa?”
- D 20:46 - Hoàng: “Chưa em, cả nhóm vẫn ở phòng họp.”

Tin 18:55 và 20:46 thuộc cùng `CLUE-ZOLA-07`, tạo mốc đối chiếu; không tạo thêm thẻ để nhân điểm. Người chơi phải đọc thấy lời khai này, không phải tự biết từ phần mở đầu.

### `thread_lan_anh` - Lan Anh Kế Toán

- 14/10 15:02 - Lan Anh: “A chuyển phần a trc nhé, e còn chốt vs bên hoa.”
- 14/10 15:06 - Hoàng: “A ứng cả nhóm, tổng 500k đúng ko e?”
- 14/10 15:08 - Lan Anh: “Đúng rồi. Sinh nhật anh Hùng thứ sáu, nhóm mình mỗi người 100.”
- D 09:20 - Lan Anh: “E ghi nhận đủ 5 người rùi nhé a.”

Giải oan trong chính luồng; không dùng quỹ bí mật hoặc giấu vợ để làm bẫy giả tạo.

### `thread_thao` - Thảo PT California

- 13/10 17:15 - Thảo: “Buổi 20h30 e chuyển sang 18h30 đc ko a?”
- 13/10 17:20 - Hoàng: “Đc e, lưng a hôm nay lại hơi căng.”
- 13/10 17:22 - Thảo: “Anh mang phiếu đánh giá cột sống buổi trước. Mình tập nhẹ thôi.”
- D 08:10 - Thảo: “Nhắc a đứng dậy đi lại sau mỗi tiếng ngồi làm việc nhé.”

### `thread_ngoc` - Bé Ngọc KTX

- 12/10 09:10 - Ngọc: “A ơi e nhận đc tiền phòng rùi nha.”
- 12/10 09:12 - Hoàng: “Ừa, nhớ báo mẹ là a chuyển rùi nhé.”
- 12/10 09:14 - Ngọc: “Mẹ bảo cn 2 a c về thì mang hộ e áo khoác nhé.”
- 14/10 20:05 - Ngọc: “Đèn học sáng đỉnh chóp lun a, cảm ơn anh trai iu quý nha.”

### `thread_mai` - Mai Lễ Tân

- D 11:38 - Mai: “Sảnh có 2 kiện của a, 1 hộp nhỏ vs 1 túi dài ạ.”
- D 11:42 - Hoàng: “Nhờ e giữ giúp, chiều a xuống lấy nha.”
- D 15:05 - Mai: “Anh đã lấy đủ rồi nhé. Nhớ ký sổ lần sau giúp em.”

Không chỉ giữ gói quà của vụ án; không có bằng chứng ngoại tình hoặc tên Hương trong lời Mai.

### `thread_dev` - Team Dev Technosoft

- D 09:05 - Nam: “Bản fix cart lên môi trường staging rùi nhé.”
- D 09:12 - Hoàng: “Nhờ mn test thêm case update quantity nhé.”
- D 14:10 - Bách: “Mik confirm hết bug cũ rùi.”
- D 14:16 - Hoàng: “Cảm ơn, mai check tiếp flow refund nhé.”

Không thêm câu xác nhận cả nhóm tan làm: ứng dụng sinh hoạt không trở thành nguồn kết tội thứ năm.

### `thread_friend` - Tuấn Đụt

- 14/10 12:02 - Tuấn: “Cn đủ ng đá chưa ông?”
- 14/10 12:10 - Hoàng: “Tôi chỉ đá hiệp đầu thôi, chiều về quê.”
- D 21:18 - Tuấn: “Mang áo xanh nhé, tuần trc lẫn đội suốt.”
- D 21:34 - Hoàng: “Rùi, giày còn đang phơi.”

### `thread_family` - Mẹ Ở Quê

- 14/10 07:20 - Mẹ: “Gà mẹ gửi lên rồi, hai đứa nhớ cất ngăn đá.”
- 14/10 07:35 - Hoàng: “Con nhận rồi mẹ. Chủ nhật chúng con về.”
- D 18:12 - Mẹ: “Bưởi để ngoài cho ráo, đừng bọc túi kín.”
- D 18:15 - Hoàng: “Vâng mẹ, tối con bảo vợ.”

### `thread_building` - Cư dân tầng 8

- D 07:45 - Ban quản lý: “Sáng thứ bảy bảo trì thang B từ 9h đến 11h.”
- D 07:52 - Căn 806: “Thang A vẫn hoạt động chứ ạ?”
- D 08:00 - Ban quản lý: “Vâng, thang A hoạt động bình thường.”

## 3. `banking` - 20 giao dịch nòng cốt

Số tiền có dấu là dòng tiền của Hoàng. Đây là các giao dịch hiển thị trong cửa sổ lịch sử, không phải toàn bộ sổ cái tài khoản; không suy số dư từ tổng bảng. Chỉ tên tài khoản pháp lý xuất hiện trên biên lai. Không in vai trò Marketing, nhãn nghi phạm hoặc số điện thoại suy từ số tài khoản.

| ID | Ngày giờ | Số tiền (đ) | Đối tác | Nội dung |
|---|---|---:|---|---|
| `tx_07` | 10/10 08:30 | +35.000.000 | Cong Ty CP Cong Nghe Technosoft | Luong thang 10 Nguyen Huy Hoang |
| `tx_home` | 10/10 08:45 | -31.500.000 | Vo | Sinh hoat thang 10 |
| `tx_net` | 10/10 09:10 | -280.000 | VNPT | Cuoc internet thang 10 |
| `tx_power` | 10/10 09:12 | -1.450.000 | EVN Ha Noi | Thanh toan tien dien |
| `tx_fuel` | 11/10 07:40 | -70.000 | Cua hang xang dau | Thanh toan QR |
| `tx_coffee` | 11/10 08:05 | -35.000 | Ca phe dau ngo | Thanh toan QR |
| `tx_05` | 12/10 08:50 | -2.500.000 | Nguyen Bao Ngoc | Tien phong thang 10 |
| `tx_market` | 12/10 17:30 | -326.000 | Sieu thi | Thanh toan the |
| `tx_06` | 13/10 17:45 | -1.500.000 | California Fitness | Goi tap thang 10 |
| `tx_lunch` | 13/10 12:15 | -45.000 | Com van phong | Thanh toan QR |
| `tx_parking` | 13/10 18:55 | -5.000 | Bai xe | Thanh toan QR |
| `tx_04` | 14/10 15:10 | -500.000 | Nguyen Lan Anh | Ung nhom qua SN Hung |
| `tx_water` | 14/10 18:20 | -60.000 | Nuoc uong | Thanh toan QR |
| `tx_refund` | 14/10 19:10 | +89.000 | San mua sam | Hoan don huy |
| `tx_breakfast` | D 07:35 | -30.000 | Banh mi | Thanh toan QR |
| `tx_02` | D 12:40 | +160.000 | Nguyen Thi Thu Huong | Hoan phan trua 14/10 |
| `tx_nam` | D 13:05 | +55.000 | Tran Van Nam | Com hom qua |
| `tx_01` | D 20:48 | -640.000 | Com Nieu Pho Co | Thanh toan the |
| `tx_phone` | D 21:15 | -100.000 | Nha mang | Nap tien dien thoai |
| `tx_snack` | D 22:05 | -28.000 | Cua hang tien loi | Thanh toan QR |

`CLUE-BANK-06` chỉ gắn `tx_01`, `tx_02` như cùng một nhóm manh mối. Tiền ăn trưa là một khoản chia tiền bình thường, không phải chứng cứ tự đủ. Khoản 640.000đ hỗ trợ mốc bữa tối; không suy số người từ số tiền. Bỏ giao dịch 2.000đ gửi lời tình cảm, không chuyển ý đó sang nơi khác.

## 4. `ecommerce` - 8 đơn, 4 luồng người bán nòng cốt

| ID | Đặt / nhận | Mặt hàng, phân loại | Giá đã trả | Người nhận / trạng thái |
|---|---|---|---:|---|
| `order_01` | 12/10 / D 11:35 | Set váy lụa công sở, be, S | 489.000đ | Nguyễn Thị Thu Hương, sảnh Technosoft / Đã giao |
| `order_02` | 10/10 / 13/10 | Đèn học, trắng | 179.000đ | Nguyễn Bảo Ngọc, KTX Cầu Giấy / Đã giao |
| `order_03` | 11/10 / D 11:35 | Lẵng hoa sáp, mẫu vàng | 350.000đ | Nguyễn Huy Hoàng, sảnh Technosoft / Đã giao |
| `order_04` | 09/10 / 11/10 | Bàn phím cơ, nâu | 690.000đ | Nguyễn Huy Hoàng, nhà / Đã giao |
| `order_cable` | 08/10 / 10/10 | Dây rút, túi 100 chiếc | 25.000đ | Nguyễn Huy Hoàng, nhà / Đã giao |
| `order_coffee` | 10/10 / 12/10 | Cà phê hạt, 500g | 140.000đ | Nguyễn Huy Hoàng, nhà / Đã giao |
| `order_polo` | 14/10 / chưa nhận | Áo polo nam, xanh, L | 0đ, hoàn 89.000đ ngày 14/10 | Nguyễn Huy Hoàng, nhà / Đã hủy |
| `order_bag` | 14/10 / chưa nhận | Túi rác, cỡ vừa | 39.000đ | Nguyễn Huy Hoàng, nhà / Đang vận chuyển |

Quy ước giao nhận thống nhất cho cả đơn nòng cốt và dữ liệu chi tiết (địa chỉ hư cấu phục vụ cốt truyện):

| Người nhận | Định danh | Số điện thoại | Địa chỉ giao đầy đủ |
|---|---|---|---|
| Nguyễn Huy Hoàng | `husband_hoang` | `0901236789` | Nhà: Căn hộ 1206, tòa CT2, chung cư An Bình, 18 ngõ 68 Trung Kính, Hà Nội |
| Nguyễn Huy Hoàng | `husband_hoang` | `0901236789` | Công ty (`order_03`): Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội |
| Nguyễn Thị Thu Hương | `suspect_huong` | `0988886677` | `order_01`: Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội |
| Nguyễn Bảo Ngọc | `suspect_ngoc` | `0922334455` | `order_02`: Phòng 305, nhà B2, KTX An Hòa, 16 ngõ 165 Xuân Thủy, Hà Nội |

Tên gọi ngắn “Hoàng” trong hội thoại không thay tên đầy đủ trên thông tin giao nhận. Số của Ngọc và Hương phải khớp danh bạ trong máy; không dùng số của vợ hoặc lễ tân cho đơn đứng tên Hoàng.

- `seller_satin`, 12/10 20:10 - Hoàng: “Mẫu be còn S không shop?”; 20:12 - Shop: “Còn anh nhé.”; 20:15 - Hoàng: “Gửi kèm thiệp ghi đúng dòng này giúp mình: 15/09 - 15/10. Vẫn chỗ cũ nhé. H.”; 20:17 - Shop: “Dạ, shop để thiệp trong hộp, không in ngoài kiện.”
- `seller_keyboard`, 09/10 12:20 - Hoàng: “Bản này ghép được hai máy không?”; 12:25 - Shop: “Dạ được, chuyển bằng tổ hợp phím theo hướng dẫn.”; 12:28 - Hoàng: “Cho mình bản nâu nhé.”
- `seller_polo`, 14/10 18:20 - Shop: “Màu xanh hết L, anh đổi màu không?”; 18:25 - Hoàng: “Thôi hủy giúp mình, mình cần đúng màu.”; 18:30 - Shop: “Dạ shop xác nhận hoàn 89.000đ.”
- `seller_coffee`, 10/10 08:10 - Hoàng: “Shop để nguyên hạt giúp mình nhé.”; 08:15 - Shop: “Dạ bên em đóng túi 500g nguyên hạt, có van một chiều.”; 08:18 - Hoàng: “Đúng loại mình cần, cảm ơn shop.”

Chi tiết giao `order_01` hiển thị người nhận hàng “Nguyễn Thị Thu Hương”, số liên hệ `0988886677`. Cùng số đầy đủ với danh bạ thợ điện; tên pháp lý chỉ hiện trong chi tiết giao nhận, không đổi tên người gửi chat hoặc thêm nhãn Marketing trên đơn. `CLUE-POSH-05` gắn đơn và đoạn thiệp như một nhóm; chỉ đọc đơn có thể nhận ra khả nghi, cần mở chat người bán để hiểu mốc ngày.

Tìm kiếm gần đây: “bàn phím không dây”, “cà phê hạt 500g”, “túi rác vừa”, “váy lụa be”, “đèn học”. Thông báo: đơn túi rác đang giao; đơn polo đã hoàn tiền; nhắc đánh giá bàn phím. Không đánh dấu riêng đơn manh mối.

## 5. `phone` - 14 cuộc gọi, 13 liên hệ nòng cốt

| ID | Ngày giờ | Liên hệ | Hướng | Giây kết nối |
|---|---|---|---|---:|
| `call_mom_1` | 12/10 18:05 | Mẹ Ở Quê | Đến | 320 |
| `call_water` | 12/10 18:30 | Giao Nước | Đi | 42 |
| `call_ngoc` | 13/10 09:15 | Bé Ngọc KTX | Đến | 186 |
| `call_nam` | 13/10 11:40 | Nam Dev | Đi | 95 |
| `call_thao` | 13/10 17:25 | Thảo PT California | Đến | 63 |
| `call_friend` | 14/10 12:20 | Tuấn Đụt | Đi | 240 |
| `call_lan_anh` | 14/10 15:00 | Lan Anh Kế Toán | Nhỡ | 0 |
| `call_courier` | 14/10 17:50 | Giao Hàng | Đến | 28 |
| `call_mai` | D 11:40 | Mai Lễ Tân | Nhỡ | 0 |
| `call_wife` | D 17:30 | Vợ | Đến | 88 |
| `call_mom_2` | D 18:00 | Mẹ Ở Quê | Đến | 144 |
| `call_tuan_early` | D 19:22 | Anh Tuấn Thợ Điện | Đi | 26 |
| `call_building` | D 21:05 | Ban Quản Lý | Đến | 51 |
| `call_tuan_late` | D 23:30 | Anh Tuấn Thợ Điện | Đi | 96 |

13 liên hệ: 12 tên riêng trong bảng và Bách Dev. “Anh Tuấn Thợ Điện” hiển thị `0988886677`, không kèm ảnh Hương, tên thật, ghi chú phòng Marketing hoặc nhãn quan hệ. Liên hệ khác dùng số hư cấu riêng khi triển khai, không trùng số này.

Chỉ `call_tuan_late` mang `CLUE-PHONE-01`; cuộc 19:22 là ngữ cảnh. Cuộc gọi đêm không chứng minh ngoại tình. Căn cứ xác định người liên hệ là sự trùng khớp số đầy đủ ở đơn hàng, không phải trùng ba số cuối của tài khoản ngân hàng.

## 6. `messages` - 6 luồng nòng cốt, hoàn toàn sinh hoạt

| Luồng | Ngày giờ | Nội dung hiển thị |
|---|---|---|
| `sms_carrier` | D 21:15 | “Nap thanh cong 100.000d. Cam on quy khach.” |
| `sms_delivery` | 13/10 10:05; 10:40 | “Don den hoc dang duoc giao.” / “Don hang da giao thanh cong.” |
| `sms_building` | D 08:05 | “Nhac lich bao tri thang B sang thu bay, 09h-11h.” |
| `sms_promo` | 14/10 09:00 | “Uu dai goi data cuoi tuan. Bo qua neu khong co nhu cau.” |
| `sms_polo` | 14/10 19:10 | “Don ao polo da hoan 89.000d ve phuong thuc thanh toan ban dau.” |
| `sms_mom` | 12/10 18:00; 18:04 | Mẹ: “Mẹ gọi không được, lát gọi lại nhé.” / Hoàng: “Con gọi lại ngay.” |

Không có SMS ngân hàng, nhà hàng, đặt phòng hoặc người tình mở thêm đường tắt. Chỉ đọc; không sửa, gửi hay xóa tin.

## 7. Sinh hoạt trong các ứng dụng còn lại

Mỗi mục dưới là một bản ghi có nội dung, không phải chỉ tên ứng dụng. Không gắn clue hoặc nghi phạm, không dùng khóa, không tự tạo bằng chứng kết tội trong những ứng dụng này.

### `ride-hailing` - 6 hoạt động

| ID | Ngày giờ | Nội dung | Giá |
|---|---|---|---:|
| `ride_work` | 10/10 08:00 | Nhà -> Technosoft, xe máy, hoàn thành | 38.000đ |
| `ride_home` | 10/10 18:10 | Technosoft -> Nhà, xe máy, hoàn thành | 41.000đ |
| `food_lunch` | 11/10 11:45 | Cơm gà văn phòng, một phần, ít cay, giao Technosoft | 45.000đ |
| `ride_market` | 12/10 16:30 | Nhà -> Siêu thị, xe máy, hoàn thành | 24.000đ |
| `ride_cancel` | 13/10 07:50 | Nhà -> Technosoft, hủy trước khi có tài xế, không thu phí | 0đ |
| `food_coffee` | 14/10 08:20 | Cà phê đen ít đá, giao Technosoft | 29.000đ |

Không có chuyến xe ngày D định vị bữa tối. Các hoạt động thanh toán bằng số dư ví của ứng dụng; không tự thêm khoản trừ trực tiếp trùng vào bảng ngân hàng.

### `web-browser` - 8 lịch sử, 2 tab mở

Lịch sử: 11/10 09:10 “React cập nhật trạng thái”; 11/10 09:25 “TypeScript kiểu dữ liệu tổng hợp”; 12/10 08:20 “Dự báo mưa cuối tuần”; 12/10 12:15 “Lịch bóng đá chủ nhật”; 13/10 15:10 “Cách vệ sinh bàn phím cơ”; 14/10 07:30 “Bảo dưỡng xe máy định kỳ”; D 10:00 “CSS grid căn cột”; D 17:10 “Cách bảo quản bưởi”. Tab mở: bài CSS grid, lịch bóng đá. Khi mở lại hiển thị đoạn nội dung phù hợp truy vấn; không có tab riêng tư hoặc bài hướng dẫn che giấu hành vi.

### `photos` - 10 ảnh

10/10: bàn phím mới, hộp bàn phím; 11/10: mâm cơm nhà, chậu húng quế ban công; 12/10: hai túi đồ siêu thị, ảnh gia đình ở quê; 13/10: ghi chú bảng họp, cáp sạc bị gãy; 14/10: bưởi mẹ gửi, giày đá bóng đang phơi. Mô tả ảnh đúng nội dung và ngày; không thêm phản chiếu, hóa đơn, địa chỉ hoặc ảnh đôi liên quan vụ án. Không có album khóa.

### `personal-notes` - 6 ghi chú

- 10/10 “Tiền nhà”: “Đã chuyển sinh hoạt tháng 10. Cuối tháng xem lại tiền điện.”
- 11/10 “Đồ cần mua”: “Túi rác cỡ vừa; nước rửa bát; khăn lau bếp.”
- 12/10 “Về quê chủ nhật”: “Mang áo khoác cho Ngọc; hỏi mẹ lịch khám.”
- 13/10 “Lưng đỡ mỏi”: “Đứng dậy mỗi giờ; kê màn hình ngang mắt; tập nhẹ.”
- 14/10 “Bảo dưỡng xe”: “Kiểm tra dầu máy, áp suất lốp, phanh trước.”
- D 10:30 “Việc ngày mai”: “Xem lỗi hoàn tiền; trả sách cho Nam; tưới cây.”

### `email` - 8 thư

- 10/10 08:00 “Phiếu lương tháng 10”: thông báo phiếu lương 35.000.000đ từ nhân sự.
- 10/10 09:11 “Xác nhận thanh toán internet”: 280.000đ, kỳ tháng 10.
- 11/10 07:00 “Bản tin công nghệ”: bài quản lý trạng thái và kiểm thử giao diện.
- 11/10 16:30 “Chào mừng thành viên mới”: hướng dẫn gửi yêu cầu hỗ trợ IT.
- 12/10 10:00 “Ưu đãi cuối tuần”: mã giảm phí giao hàng, thư quảng cáo.
- 13/10 17:46 “Lịch tập tháng 10”: xác nhận gói trị liệu 1.500.000đ.
- 14/10 19:11 “Hoàn tiền đơn áo polo”: xác nhận 89.000đ.
- D 08:00 “Lịch bảo trì thang máy”: thang B, sáng thứ bảy 9h-11h.

Mỗi thư có người gửi theo vai trò và đoạn thân thư như trên, không chỉ dòng chủ đề. Không có email catalogue hoặc xác nhận nhà hàng được dùng làm đường tắt.

### `professional-network` - 5 bài / cập nhật

- 10/10 Đồng nghiệp chia sẻ bài “Tách giao diện khỏi dữ liệu để dễ kiểm thử”, Hoàng lưu bài.
- 11/10 Thông báo tuyển lập trình viên frontend, làm việc tại văn phòng, nộp hồ sơ qua nhân sự.
- 12/10 Nam chia sẻ hoàn thành khóa TypeScript, Hoàng bình luận “Chúc mừng ông”.
- 13/10 Trang công ty đăng buổi chia sẻ kỹ thuật tuần sau, chủ đề khả năng tiếp cận.
- 14/10 Bách cập nhật dự án nội bộ, Hoàng bình luận “Cảm ơn cả nhóm”.

### `team-collaboration` - 5 mục hội thoại

- 11/10 `#frontend`: Nam hỏi quy ước đặt tên hook; Hoàng gửi quy ước camelCase và ví dụ `useCart`.
- 12/10 `#general`: Nhân sự nhắc cập nhật thông tin người phụ thuộc trước cuối tháng.
- 13/10 `#support`: Bách báo máy in hết giấy; văn phòng xác nhận đã bổ sung.
- 14/10 `#frontend`: Hoàng nhờ xem màn hình hoàn tiền; Nam hẹn sáng mai xem.
- D 09:15 `#general`: Ban quản lý nhắc lấy bình nước cá nhân trước khi vệ sinh phòng họp.

## 8. Kiểm tra nội dung trước triển khai (các số đếm nòng cốt)

1. Luồng chat, cuộc gọi và đơn hàng dùng cùng số `0988886677`; chỉ số đầy đủ nối liên hệ ngụy trang với người nhận hỗ trợ giao hàng.
2. Không suy danh tính từ tiền chia bữa trưa: tên pháp lý và họ tên trong hồ sơ nghi phạm là cầu nối, chưa đủ chứng minh mối quan hệ.
3. Bữa tối ngày D trái lời khai 18:55; giờ đặt bàn, cuộc gọi, thanh toán và mốc trên thiệp nhất quán. Kết luận cần toàn chuỗi, không chỉ việc hai đồng nghiệp ăn cùng nhau.
4. Người chơi đọc được ngữ cảnh giải oan của Lan Anh, Thảo, Ngọc và Mai trước khi đối chất; thông tin không chỉ có trong kết thúc thua.
5. Có ít nhất 8/10 luồng chat, 18/20 giao dịch, 7/8 đơn và 13/14 cuộc gọi không mang manh mối kết tội; dữ liệu giải oan được tính là sinh hoạt có ngữ cảnh.
6. Mở vài ứng dụng bất kỳ thấy sở thích, gia đình, việc nhà và công việc thực tế. Không biến mọi bản ghi thành một bẫy nghi ngờ.
7. Một clue xuất hiện nhiều bản ghi chỉ tạo một thẻ hợp lệ. Giữ cơ chế chấm sao hiện hành; chưa đề xuất thay đổi bộ máy đối chất.

## 9. Mạch sự kiện liên tục - chỉ dành cho tác giả

Đọc cùng [level-01-storyboard.md](level-01-storyboard.md) và [level-01.md](level-01.md). Không hiển thị bảng kết nối hoàn chỉnh này trên điện thoại.

- **Chuẩn bị**: Hoàng đặt váy ngày 12/10, nhờ ghi hai mốc 15/09 - 15/10. Cuộc trao đổi sửa file ngày 13/10 giữ quan hệ công việc có thật; không phải mọi tin với Hương đều là tán tỉnh.
- **Lấy đồ**: Hai kiện đến sảnh D 11:35; Mai báo và giữ hộ. Tới 15:05 Hoàng đã lấy đủ. Tin 15:20 cho người liên hệ ngụy trang biết anh sẽ mang đồ tối nay, nhưng không gọi tên món đồ.
- **Hẹn gặp**: Người liên hệ đặt bàn 19h30 như tháng trước. Lúc 18:55 Hoàng nói với vợ đang họp; 19:22 gọi 26 giây, 19:20 người kia báo đã tới quán. Đây là cùng một cuộc gặp, không phải các cuộc hẹn rời rạc.
- **Che giấu**: 20:46 Hoàng vẫn báo ở phòng họp; 20:48 có thanh toán tại Cơm Niêu Phố Cổ. Chỉ biên lai mới nêu quán; chat không lặp nguyên tên quán để người chơi tìm bằng từ khóa.
- **Dư âm**: Cuộc gọi 23:30 có cùng số liên hệ, nhưng nội dung không được biết. Tin 23:44 nói chiếc áo đang được người kia giữ, khép lại việc để quên đồ. Sự thật tác giả: Hoàng quên áo khi rời bữa tối, Hương cầm về; người chơi chỉ được suy rằng hai người đã trao đồ/ở cùng dịp, không được suy họ về chung nhà.

Khoản hoàn tiền trưa D 12:40 là một nhánh nhận diện có thật trong sinh hoạt đồng nghiệp, không phải tiền trả váy hoặc tiền bữa tối. Không ép mọi giao dịch thành mắt xích tình cảm.

## 10. Dữ liệu nòng cốt và danh bạ thống nhất

Toàn bộ dữ liệu mở rộng chi tiết của Màn 1 đã được biên soạn và đồng bộ trực tiếp vào file cấu hình runtime `src/data/cases/hoang/level_01.json`. Từ Màn 2 trở đi tuân thủ Chuẩn gói 3 file (`husband-profile.md` dùng chung, kèm `level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`), tuyệt đối không tạo thêm file `level-XX-history.md` (dữ liệu nền do phía frontend nạp từ shared mock fixtures).

- Ảnh Zola nằm trong luồng Mẹ Ở Quê và Tuấn Đụt, có chú thích, văn bản thay thế và tài sản đi kèm được đóng gói trong ứng dụng. Nhấn giữ vẫn áp dụng cho nội dung truyện; không tải ảnh từ máy chủ bên ngoài.
- 16 liên hệ chuẩn nằm trong Phone, gồm 13 người/liên hệ ban đầu và ba đầu mối dịch vụ. Cả Phone và SMS đọc cùng nguồn; từng luồng SMS liên kết bằng ID và số đầy đủ. Tên giống nhau không đủ để nối khi số/ID khác.
- Nút Nhắn tin của từng liên hệ Phone mở hội thoại SMS tương ứng có lịch sử đọc được. Không chuyển sang Zola, không gửi tin hoặc tạo hội thoại rỗng giả.
