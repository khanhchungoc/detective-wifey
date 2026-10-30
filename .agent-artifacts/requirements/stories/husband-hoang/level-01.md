---
husband: hoang
level: 1
---

# Hồ sơ Đặc tả Cốt truyện - Màn 1: Cơn ghen lúc nửa đêm

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Là căn cứ cốt truyện pháp y (SSOT) chứa hợp đồng đối chất, bảng phân bổ ứng dụng, bảng Nodes & Edges (`CaseKnowledgeGraph`) và tiêu chí nghiệm thu kỹ thuật. Dùng đồng bộ cùng [husband-profile.md](husband-profile.md), [level-01-storyboard.md](level-01-storyboard.md) và [level-01-phone-data.md](level-01-phone-data.md). Bàn giao cho `@frontend-game-developer` để hiện thực hóa file cấu hình `src/data/cases/hoang/level_01.json`.

---

## 1. Bối cảnh Vụ án & Liên kết Hồ sơ Gốc

### 1.1. Liên kết Hồ sơ Người Chồng & Người Vợ (SSOT)
- **Hồ sơ Người Chồng, Ảnh đại diện gốc, Mỏ neo Người Vợ & Nhân vật cố định**: Tái sử dụng từ [husband-profile.md](husband-profile.md) (Tuyệt đối không định nghĩa lặp lại tại đây).
- **Hành vi Khả nghi Kích hoạt Cơn Ghen**: Đúng 23:45 đêm, khi Hoàng vờ ngáy ngủ say sưa trên giường, màn hình điện thoại chợt sáng đèn với thông báo tin nhắn từ danh bạ "Anh Tuấn Thợ Điện" (`toast_01`): *"Đồ anh để quên em cất rồi, mai em mang qua nhé."* Chi tiết bất thường này giục giã người vợ phải lén mở khóa máy kiểm tra.

### 1.2. Chất liệu Trào phúng & Bản chất Vụ việc
- **Nguồn cảm hứng**: Trào lưu *Tâm sự Eva*, hội nhóm *Vén khéo*, chiêu trò đặt tên bồ nhí thành danh bạ thợ điện / thợ sửa ống nước để nhắn tin mờ ám qua mắt vợ.
- **Bản chất Câu chuyện**: Hoàng (29 tuổi, Tech Lead Technosoft) lén lút quan hệ vụng trộm với Hương (25 tuổi, chuyên viên Marketing cùng công ty Technosoft). Để qua mắt vợ, Hoàng lưu số Hương thành "Anh Tuấn Thợ Điện", dùng cớ dịch vụ sửa chữa điện nước làm bình phong trao đổi. Tối ngày 15/10/2026, hai người hẹn nhau ăn tối tại quán Cơm Niêu Phố Cổ để kỷ niệm tròn 1 tháng ngày vụng trộm (từ 15/09 đến 15/10). Hoàng đã đặt mua set váy lụa size S kèm thiệp dặn riêng *"15/09 - 15/10. Vẫn chỗ cũ nhé. H."* gửi tới sảnh công ty cho Hương. Khi vợ nhắn tin hỏi cơm tối, Hoàng liên tục nói dối là đang ở phòng họp công ty, nhưng thực chất đã quẹt thẻ thanh toán 640.000đ tại Cơm Niêu Phố Cổ lúc 20:48 (chỉ 2 phút sau tin nhắn khẳng định đang họp). Khi về nhà, Hoàng để quên áo khoác nên gọi điện đêm 96 giây cho Hương, dẫn tới tin nhắn kích hoạt lúc 23:44.
- **Storyboard & Sơ đồ Dòng thời gian**: Xem chi tiết nhân khẩu học nghi phạm, kịch bản tương tác theo dòng thời gian và hai sơ đồ Mermaid tại [level-01-storyboard.md](level-01-storyboard.md).

---

## 2. Danh sách Nghi phạm & Danh mục Đối tượng Nhìn thấy

*Nhân khẩu học chi tiết (tuổi, giới tính, nghề nghiệp, khẩu khí và cách xưng hô chuẩn tiếng Việt với chồng) được định nghĩa tại Mục 1 của [level-01-storyboard.md](level-01-storyboard.md).*

| Suspect ID | Tên Hiển thị | Thân phận Thật / Nghề nghiệp | App Phát hiện Đầu tiên | Vỏ bọc Danh bạ / Biệt danh | Vai trò |
|---|---|---|---|---|---|
| `suspect_huong` | Nguyễn Thị Thu Hương · Marketing | Nguyễn Thị Thu Hương, 25 tuổi, Chuyên viên Marketing cùng công ty Technosoft | `internet-messaging` | "Anh Tuấn Thợ Điện" | **Kẻ chủ mưu (Culprit)** |
| `suspect_lan_anh` | Lan Anh Kế Toán | Lan Anh, 27 tuổi, Thủ quỹ công đoàn kiêm Kế toán nội bộ Technosoft | `internet-messaging` | "Lan Anh Kế Toán" | Bẫy nghi ngờ 1 (Vô tội) |
| `suspect_thao` | Thảo PT Gym | Thảo, 24 tuổi, Nữ huấn luyện viên thể hình California Fitness | `internet-messaging` | "Thảo PT California" | Bẫy nghi ngờ 2 (Vô tội) |
| `suspect_ngoc` | Bé Ngọc Sinh Viên | Nguyễn Bảo Ngọc, 20 tuổi, Em gái ruột của Hoàng ở quê lên trọ học đại học | `banking` | "Bé Ngọc KTX" | Bẫy nghi ngờ 3 (Vô tội) |
| `suspect_mai` | Mai Lễ Tân | Mai, 24 tuổi, Nhân viên lễ tân sảnh tòa nhà Minh An (Technosoft) | `ecommerce` | "Mai Lễ Tân" | Bẫy nghi ngờ 4 (Vô tội) |

### 2.1. Danh mục Đối tượng Người chơi Nhìn thấy

| ID liên hệ / hội thoại | Loại (người / bí danh / nhóm / dịch vụ) | App | Tên nhìn thấy | Điều kiện vào bộ chọn nghi phạm / lý do loại trừ | Khóa gộp | Danh tính tác giả (không hiển thị) |
|---|---|---|---|---|---|---|
| `thread_tuan` / `contact_10` | bí danh | `internet-messaging`, `phone`, `messages` | Anh Tuấn Thợ Điện | Vào bộ chọn nghi phạm (vỏ bọc của tiểu tam) | `contact_10` | `suspect_huong` |
| `thread_lan_anh` / `contact_6` | người | `internet-messaging`, `phone`, `messages` | Lan Anh Kế Toán | Vào bộ chọn nghi phạm (bẫy nghi ngờ) | `contact_6` | `suspect_lan_anh` |
| `thread_thao` / `contact_4` | người | `internet-messaging`, `phone`, `messages` | Thảo PT California | Vào bộ chọn nghi phạm (bẫy nghi ngờ) | `contact_4` | `suspect_thao` |
| `thread_ngoc` / `contact_2` | người | `internet-messaging`, `banking`, `phone`, `messages` | Bé Ngọc KTX | Vào bộ chọn nghi phạm (bẫy nghi ngờ) | `contact_2` | `suspect_ngoc` |
| `thread_mai` / `contact_8` | người | `internet-messaging`, `ecommerce`, `phone`, `messages` | Mai Lễ Tân | Vào bộ chọn nghi phạm (bẫy nghi ngờ) | `contact_8` | `suspect_mai` |
| `thread_wife` / `contact_9` | người | `internet-messaging`, `phone`, `messages` | Vợ | Mỏ neo gia đình, loại trừ khỏi nghi phạm | `contact_9` | `char_wife` |
| `thread_family` / `contact_0` | người | `internet-messaging`, `phone`, `messages` | Mẹ Ở Quê | Bề trên gia đình, loại trừ khỏi nghi phạm | `contact_0` | `char_mom` |
| `thread_friend` / `contact_5` | người | `internet-messaging`, `phone`, `messages` | Tuấn Đụt | Bạn thân chí cốt, loại trừ khỏi nghi phạm | `contact_5` | `char_best_friend` |
| `thread_dev` / `contact_3` | nhóm / người | `internet-messaging`, `phone` | Team Dev Technosoft / Nam Dev | Đồng nghiệp công việc, loại trừ khỏi nghi phạm | `contact_3` | `char_boss` |
| `thread_building` / `contact_11` | nhóm / dịch vụ | `internet-messaging`, `phone`, `messages` | Cư dân tầng 8 / Ban Quản Lý | Dịch vụ tòa nhà, loại trừ khỏi nghi phạm | `contact_11` | Dịch vụ ban quản lý |
| `thread_carrier` / `service_carrier` | dịch vụ | `internet-messaging`, `phone`, `messages` | Chăm sóc thuê bao / Nhà mạng | Tổng đài viễn thông, loại trừ khỏi nghi phạm | `service_carrier` | Nhà mạng viễn thông |
| `seller_satin` | người bán | `ecommerce` | Tiệm Lụa Nàng Thơ | Shop thời trang bán set váy lụa | `seller_satin` | Người bán Shopee |

---

## 3. Sự thật, Lời Roasting & Thang Ngụy biện

### 3.1. Phân loại Kết luận Sự thật (Ground Truth)
- **Kết luận (`verdict`)**: `cheating`
- **Mã Tiểu tam (`culpritSuspectId`)**: `suspect_huong`

### 3.2. Lời Roasting Kết thúc Vụ án
- **Chiến thắng Bắt ghen (`narrativeRoast`)**:
  > *"Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?"*
- **Ghen Tuông Mù Quáng (`overJealousRoast`)**:
  > *"Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?"*
- **Ghen nhầm Thảo PT**:
  > *"Người ta nhắc anh mang phiếu đánh giá cột sống. Em bắt được lưng đau, chưa bắt được người tình."*
- **Ghen nhầm Bé Ngọc**:
  > *"Em gái nhắn cảm ơn anh trai còn chưa đủ rõ à? Chủ nhật về quê chắc phải giới thiệu lại gia phả."*
- **Ghen nhầm Mai Lễ Tân**:
  > *"Mai giữ cả hoa sinh nhật lẫn gói đồ, còn nhắc anh ký sổ. Sảnh lễ tân đâu phải danh sách người tình."*
- **Bị Giật Lại Máy (Hết 5 lượt nghi ngờ)**:
  > *"Hoàng giật lại máy: 'Em kiểm tra điện thoại hay kiểm kê cả khu phố đấy? Mai anh còn đi làm!'"*

### 3.3. Thang Ngụy biện Khi Đối chất Sớm ("Chối bay chối biến")

| Số lượng Bằng chứng | Thái độ Người Chồng | Lời Thoại Ngụy biện Điển hình | Kết quả |
|---|---|---|---|
| **0 Thẻ (Cáo buộc non)** | Hùng hổ, gạt phăng | *"Em lại lướt TikTok xem mấy cái clip drama bắt ghen xàm xí rồi đa nghi đúng không? Đưa máy đây anh đi ngủ mai còn đi làm!"* | Thất bại (0 Sao) |
| **1 Thẻ (Mới có 1 manh mối)** | Hơi giật mình, phân bua | *"Ơ kìa em, số thợ điện đấy thật mà, hôm trước anh gọi nhờ sửa cái ổ cắm chập điện ở phòng làm việc thôi chứ có gì đâu!"* | Chiến thắng 1 Sao (Thắng non) |
| **2 Thẻ (Đã đối chiếu 2 nguồn)** | Toát mồ hôi, bao biện | *"À... cái đơn hàng đó là con bé phòng Marketing nó nhờ anh đặt hộ qua tài khoản mua sắm để áp mã Freeship Extra thôi mà, anh biết gì đâu!"* | Chiến thắng 2 Sao (Khá thuyết phục) |
| **3+ Thẻ (Đủ tam giác bằng chứng)** | Cúi đầu nhận tội | *"Anh xin lỗi vợ... Bọn anh có hẹn riêng tối nay. Anh không nên nói dối em là còn họp, em cho anh giải thích..."* | Chiến thắng Tuyệt đối 3 Sao |

---

## 4. Cấu hình Ứng dụng & Mồi nhử Thông báo (Notification Hook)

### 4.1. Phân cấp Độ khó
- **Phân bậc Màn chơi**: Màn 1 (Khởi động)
- **Số lượt nghi ngờ tối đa (`allowedStrikes`)**: 5 lượt (`allowedStrikes: 5`)
- **Số app có manh mối**: 4 app (`internet-messaging`, `banking`, `ecommerce`, `phone`)
- **Số câu đố mã khóa (`lockChallenges`)**: 0 câu đố (`lockChallenges: []`)

### 4.2. Bảng Phân bổ Trạng thái Ứng dụng

| App ID | Có clue / chỉ sinh hoạt | Event / Activity ID nguồn (từ Storyboard) | Dữ liệu chi tiết trong máy | Khoảng trống hợp đồng nếu có |
|---|---|---|---|---|
| `internet-messaging` | Manh mối + Sinh hoạt | `EVT-02`, `EVT-06`, `EVT-07`, `EVT-08`, `EVT-09`, `EVT-10`, `EVT-11`, `EVT-14`, `ACT-05`, `ACT-06`, `ACT-07`, `ACT-08`, `ACT-09`, `ACT-10`, `ACT-11` | 9 luồng chính, 2 luồng phụ (Other), 1 tài liệu đám mây, 1 bài viết dòng thời gian, 13 liên hệ | Không |
| `banking` | Manh mối + Sinh hoạt | `EVT-03`, `EVT-12`, `ACT-01`, `ACT-02`, `ACT-03`, `ACT-04`, `ACT-08` | 60 giao dịch tài khoản, 2 hũ tiết kiệm; 2 giao dịch nòng cốt (`tx_01` 640k, `tx_02` +160k) | Không |
| `ecommerce` | Manh mối + Sinh hoạt | `EVT-01`, `EVT-04`, `ACT-09` | 22 đơn hàng, 8 luồng chat người bán, 21 thông báo, 5 tìm kiếm gần đây; 1 đơn nòng cốt (`order_01`) | Không |
| `phone` | Manh mối + Sinh hoạt | `EVT-10`, `EVT-13`, `ACT-10` | 46 cuộc gọi, 16 danh bạ chuẩn; 1 cuộc gọi đêm nòng cốt (`call_tuan_late` 96s) | Không |
| `messages` | Chỉ sinh hoạt | `EVT-02`, `ACT-04` | 16 luồng SMS nạp tiền, giao hàng, bảo trì, thông tin gói cước | Không |
| `ride-hailing` | Chỉ sinh hoạt | `ACT-01`, `ACT-02` | 20 chuyến đi làm, về nhà, siêu thị, giao đồ ăn | Không |
| `web-browser` | Chỉ sinh hoạt | `ACT-01` | 25 lịch sử tra cứu công nghệ, thể thao và 2 tab mở | Không |
| `photos` | Chỉ sinh hoạt | `ACT-07` | 1 album gồm 16 ảnh gia đình, đồ ăn, công việc; không ảnh nhạy cảm | Không |
| `personal-notes` | Chỉ sinh hoạt | `ACT-02` | 14 ghi chú việc nhà, bảo dưỡng xe, công việc IT | Không |
| `email` | Chỉ sinh hoạt | `ACT-01` | 25 thư công việc, sao kê, thông báo nội bộ Technosoft | Không |
| `professional-network`| Chỉ sinh hoạt | `ACT-01` | 12 bài đăng nghề nghiệp, cập nhật công nghệ | Không |
| `team-collaboration` | Chỉ sinh hoạt | `ACT-01` | 12 kênh thảo luận dự án sprint, hành chính Technosoft | Không |

### 4.3. Thông số Thiết bị & Thông báo Mồi nhử (Zero-Spoiler Hook)
- **Đồng hồ Cốt truyện (`narrativeTime`)**: `23:45` (Ngày hư cấu: 15/10/2026)
- **Thời lượng Pin (`batteryPercent`)**: `42%`
- **Nhà mạng (`carrierTag`)**: `5G`
- **Màu Chủ đề PWA (`pwaThemeColor`)**: `#0f172a`

**Thông báo Đẩy Khởi phát (Tuyệt đối không spoil):**
- **Toast ID**: `toast_01`
- **Ứng dụng Nguồn**: `internet-messaging`
- **Tiêu đề Người gửi**: `Tin nhắn • 21:05`
- **Nội dung Rút gọn**: `Anh Tuấn Thợ Điện: Đồ anh để quên em cất rồi, mai em mang qua nhé.`
- **Thời gian Trì hoãn**: 4 giây (`triggerDelaySeconds: 4`)

---

## 5. Đồ Thị Bằng Chứng & Ma Trận Dữ Liệu Pháp Y

### 5.1. Liên kết Sơ đồ Mermaid (Timeline & Clue-to-Suspect Graph)
- **Sơ đồ Dòng thời gian (Story Timeline)** và **Sơ đồ Mạng lưới Manh mối - Manh mối & Manh mối - Nghi phạm (Clue & Suspect Graph)**: Xem tại Mục 3 và Mục 4 của [level-01-storyboard.md](level-01-storyboard.md).

### 5.2. Bảng Dữ Liệu Nodes & Edges (Compiler & Tooling SSOT)
*Đặc tả mạng lưới Node-Edge đồng bộ 100% với `LEVEL_01_KNOWLEDGE_GRAPH` trong `src/features/wife-notebook/level01Fixture.ts`.*

#### Danh sách Nodes (12 nodes)
| Node ID | Loại (`type`) | Tên hiển thị (`label`) | App nguồn / Record ID | Clue ID (nếu có) | Vỏ bọc ban đầu (`isInitialDisguise`) |
|---|---|---|---|---|---|
| `node_suspect_huong` | `suspect` | Nguyễn Thị Thu Hương · Marketing | - | - | `false` |
| `node_suspect_lan_anh` | `suspect` | Lan Anh Kế Toán · Thủ quỹ | - | - | `false` |
| `node_alias_tuan` | `alias` | Anh Tuấn Thợ Điện | `internet-messaging` / `thread_tuan` | `CLUE-ZOLA-07` | `true` |
| `node_alias_tuan_sms` | `alias` | Anh Tuấn Thợ Điện (SMS) | `messages` / `sms_contact_10` | `CLUE-PHONE-01` | `true` |
| `node_bridge_phone` | `bridge_id` | SĐT: 0988886677 | `phone` / `call_tuan_late` | `CLUE-PHONE-01` | `false` |
| `node_bridge_name` | `bridge_id` | Tên pháp lý: Nguyen Thi Thu Huong | `banking` / `tx_02` | `CLUE-BANK-06` | `false` |
| `node_record_zola_chat` | `record_clue` | Tin nhắn: Bàn 19h30 "như tháng trước" | `internet-messaging` / `thread_tuan` | `CLUE-ZOLA-07` | `false` |
| `node_record_wife_alibi` | `record_clue` | Báo vợ: "Vẫn ở phòng họp" (20:46) | `internet-messaging` / `thread_wife` | `CLUE-ZOLA-07` | `false` |
| `node_record_bank_receipt` | `record_clue` | Cơm Niêu Phố Cổ 640k (20:48) | `banking` / `tx_01` | `CLUE-BANK-06` | `false` |
| `node_record_ecommerce_order` | `record_clue` | Váy Satin + Thiệp "15/09 - 15/10" | `ecommerce` / `order_01` | `CLUE-POSH-05` | `false` |
| `node_record_phone_call` | `record_clue` | Cuộc gọi đêm 23:30 (96s) | `phone` / `call_tuan_late` | `CLUE-PHONE-01` | `false` |
| `node_timeline_dinner` | `timeline_slot` | Tối 15/10 (20:46 - 20:48) | - | - | `false` |

#### Danh sách Edges & Smoking Guns (8 edges)
| Edge ID | Nút Nguồn (`source`) | Nút Đích (`target`) | Loại quan hệ (`relationship`) | Bằng chứng chốt (`isSmokingGun`) | Record ID nguồn / đích | Trường / nội dung nhìn thấy khớp nhau | Lời ngụy biện / bóc trần của Chồng |
|---|---|---|---|---|---|---|---|
| `edge_alias_phone` | `node_alias_tuan` | `node_bridge_phone` | `bridges_identity` | `false` | `thread_tuan` / `call_tuan_late` | Khớp số điện thoại danh bạ `0988886677` | *"Số đó của thợ điện thật mà, hôm trước anh gọi nhờ sửa dây mạng văn phòng!"* |
| `edge_alias_sms_phone` | `node_alias_tuan_sms` | `node_bridge_phone` | `bridges_identity` | `false` | `sms_contact_10` / `call_tuan_late` | Khớp số điện thoại trong SMS và cuộc gọi | *"Tin nhắn SMS với số điện thoại danh bạ cùng một người!"* |
| `edge_alias_zola_sms` | `node_alias_tuan` | `node_alias_tuan_sms` | `bridges_identity` | `false` | `thread_tuan` / `sms_contact_10` | Cùng liên hệ ngụy trang Anh Tuấn trên Zola và SMS | *"Cùng một người liên hệ Anh Tuấn Thợ Điện trên cả Zola và SMS!"* |
| `edge_order_phone` | `node_record_ecommerce_order` | `node_bridge_phone` | `bridges_identity` | `false` | `order_01` / `call_tuan_late` | Số nhận hàng đơn Shopee trùng SĐT thợ điện | *"Đơn hàng giao tới số điện thoại của thợ điện"* |
| `edge_order_name` | `node_record_ecommerce_order` | `node_bridge_name` | `bridges_identity` | `false` | `order_01` / `tx_02` | Tên người nhận đơn trùng tên chủ tài khoản nhận hoàn tiền | *"Tên người nhận đơn trùng với tên pháp lý tài khoản"* |
| `edge_name_suspect` | `node_bridge_name` | `node_suspect_huong` | `bridges_identity` | `true` | `tx_02` / `suspect_huong` | Tên pháp lý `Nguyen Thi Thu Huong` khớp nhân sự Marketing | *"À... cái đơn đó con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra..."* |
| `edge_alibi_contradiction` | `node_record_wife_alibi` | `node_record_bank_receipt` | `contradicts_alibi` | `true` | `thread_wife` / `tx_01` | Khai với vợ 20:46 họp ở công ty vs quẹt thẻ 20:48 Cơm Niêu Phố Cổ | *"Anh... lúc đó cả nhóm kéo nhau ra quán ăn đêm làm việc tiếp mà..."* |
| `edge_zola_dinner_receipt` | `node_record_zola_chat` | `node_record_bank_receipt` | `occurred_at` | `false` | `thread_tuan` / `tx_01` | Hẹn ăn bàn 19h30 Phố Cổ khớp giao dịch quán Cơm Niêu Phố Cổ | *"Tin nhắn hẹn ăn tại Cơm Niêu Phố Cổ trùng với giao dịch thanh toán tại quán tối 15/10."* |

- **Danh sách Cạnh Bắt buộc để Thắng 3 Sao (`requiredSmokingGunEdgeIds`)**:
  `['edge_name_suspect', 'edge_alibi_contradiction']`

### 5.3. Thử thách Mã khóa & Câu đố
*(Màn 1 không có câu đố mã khóa: `lockChallenges: []`)*

---

## 6. Lộ trình Phá án & Bảng Điều tra Nối dây

- **Đường suy luận trực quan**: Người chơi xuất phát từ thông báo khởi phát `toast_01` (tin nhắn Zola từ "Anh Tuấn Thợ Điện" lúc nửa đêm) -> mở Zola phát hiện tin hẹn ăn tối "chỗ cũ Phố Cổ 19h30" -> mở Banking phát hiện quẹt thẻ Cơm Niêu Phố Cổ lúc 20:48 mâu thuẫn trực tiếp với tin nhắn dối vợ lúc 20:46 -> kiểm tra Shopee phát hiện đơn váy lụa size S giao cho "Nguyễn Thị Thu Hương" cùng SĐT thợ điện `0988886677` -> lật tẩy thân phận Hương Marketing.
- **Thứ tự gợi ý Giác quan thứ 6**: 1. `internet-messaging` -> 2. `banking` -> 3. `ecommerce`.
- **Đặc tả bố cục Bảng Điều tra Nối dây**: Tọa độ và cơ chế hoạt động của Canvas 2A tuân thủ [US-015](../../output/epic-03-wife-notebook-verdict-social-sharing/us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md#corkboard-canvas-layout--swimlane-architecture).

---

## 7. Bàn giao Kỹ thuật cho Lead Dev Agent

### 7.1. File Cấu hình Đích
`src/data/cases/hoang/level_01.json` và `src/features/wife-notebook/level01Fixture.ts`.

### 7.2. Yêu cầu Cấu trúc Mock Data & Chuẩn Gói 3 File Theo Màn (+ 1 File Hồ sơ Chồng)
- Hồ sơ gốc của người chồng (`husband-profile.md`) được tạo 1 lần và tái sử dụng cho mọi màn của Hoàng.
- Mỗi màn chơi gồm **đúng 3 files**:
  1. `level-01-storyboard.md`: Nhân khẩu học nghi phạm, kịch bản tương tác theo thời gian, sơ đồ Mermaid Timeline và sơ đồ Mermaid Clue-to-Clue / Clue-to-Suspect.
  2. `level-01.md`: Hồ sơ đặc tả pháp y và bảng Nodes & Edges (`LEVEL_01_KNOWLEDGE_GRAPH`).
  3. `level-01-phone-data.md`: Kịch bản chi tiết lời thoại và bản ghi trong khoảng thời gian D-Day +- 2-3 ngày, đảm bảo >= 75% bản ghi sinh hoạt/giải oan. Tuyệt đối không tạo file `history.md`.
- Toàn bộ lời thoại, tin nhắn, ghi chú, chuyển khoản tiếng Việt trong `level-01-phone-data.md` phải tuân thủ đúng nhân khẩu học (tuổi tác, vai vế) và chuẩn xưng hô tiếng Việt tự nhiên (`anh/em/chị/cô/chú/con...`).

### 7.3. Tiêu chí Nghiệm thu Pháp y
1. Chạy lệnh kiểm tra hồ sơ cốt truyện:
   ```bash
   python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec ".agent-artifacts/requirements/stories/husband-hoang/level-01.md"
   python -B .agents/skills/level-designer/scripts/sync_clues.py validate --file ".agent-artifacts/requirements/stories/husband-hoang/level-01.md"
   ```
2. Đảm bảo toàn bộ 4 Clue IDs tồn tại trong danh mục SSOT (`CLUE-ZOLA-07`, `CLUE-BANK-06`, `CLUE-POSH-05`, `CLUE-PHONE-01`).
3. Chạy toàn bộ test hồi quy của dự án (`npm test`) để xác nhận tính toàn vẹn runtime.
