---
husband: <tên_chồng> # ví dụ: hoang (thư mục: husband-hoang)
level: <1 | 2 | 3>
---

# Hồ sơ Đặc tả Cốt truyện - Màn <N>: <Tên Màn Chơi>

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Là căn cứ cốt truyện pháp y (SSOT) chứa hợp đồng đối chất, bảng phân bổ ứng dụng, bảng Nodes & Edges (`CaseKnowledgeGraph`) và tiêu chí nghiệm thu kỹ thuật. Dùng đồng bộ cùng [husband-profile.md](husband-profile.md), [level-0<N>-storyboard.md](level-0<N>-storyboard.md) và [level-0<N>-phone-data.md](level-0<N>-phone-data.md). Bàn giao cho `@frontend-game-developer` để hiện thực hóa file cấu hình `src/data/cases/<husbandId>/level_0<N>.json`.

---

## 1. Bối cảnh Vụ án & Liên kết Hồ sơ Gốc

### 1.1. Liên kết Hồ sơ Người Chồng & Người Vợ (SSOT)
- **Hồ sơ Người Chồng, Ảnh đại diện gốc, Mỏ neo Người Vợ & Nhân vật cố định**: Tái sử dụng từ [husband-profile.md](husband-profile.md) (Tuyệt đối không định nghĩa lặp lại tại đây).
- **Hành vi Khả nghi Kích hoạt Cơn Ghen Ở Màn <N>**: <ví dụ: Nửa đêm 23:45 điện thoại rung chuông nhẹ, màn hình sáng lên tin nhắn khả nghi khiến vợ lén mở máy kiểm tra>

### 1.2. Chất liệu Trào phúng & Bản chất Vụ việc
- **Nguồn cảm hứng**: <ví dụ: Tâm sự Eva, hội nhóm Vén khéo, chiêu trò chuyển khoản 1.000đ khi bị chặn tin nhắn, đặt tên bồ là Anh Tuấn Thợ Điện>
- **Bản chất Câu chuyện**: <1-2 đoạn văn giải thích rõ bản chất thực sự của vụ việc ở màn này: người chồng thực sự đang làm gì, với ai, và thủ đoạn che giấu nâng cấp thế nào so với màn trước>
- **Storyboard & Sơ đồ Dòng thời gian**: Xem chi tiết nhân khẩu học nghi phạm, kịch bản tương tác theo dòng thời gian (ai làm gì với ai, qua app nào) và sơ đồ Mermaid tại [level-0<N>-storyboard.md](level-0<N>-storyboard.md).

---

## 2. Danh sách Nghi phạm & Danh mục Đối tượng Nhìn thấy

*Nhân khẩu học chi tiết (tuổi, giới tính, nghề nghiệp, khẩu khí và cách xưng hô chuẩn tiếng Việt với chồng) được định nghĩa tại Mục 1 của [level-0<N>-storyboard.md](level-0<N>-storyboard.md).*

| Suspect ID | Tên Hiển thị | Thân phận Thật / Nghề nghiệp | App Phát hiện Đầu tiên | Vỏ bọc Danh bạ / Biệt danh | Vai trò |
|---|---|---|---|---|---|
| `suspect_<tên_tiểu_tam>` | <ví dụ: Hương Marketing> | <ví dụ: Nữ đồng nghiệp 25 tuổi cùng cơ quan> | `internet-messaging` | <ví dụ: "Anh Tuấn Thợ Điện"> | **Kẻ chủ mưu (Culprit)** |
| `suspect_<nghi_phạm_giả>` | <ví dụ: Mai Lễ Tân> | <ví dụ: Lễ tân 24 tuổi tòa nhà văn phòng> | `ecommerce` | <ví dụ: "Mai Lễ Tân"> | Bẫy nghi ngờ (Red Herring) |
| `suspect_<người_thân>` | <ví dụ: Bé Ngọc Sinh Viên> | <ví dụ: Em gái ruột 20 tuổi của chồng> | `banking` | <ví dụ: "Bé Ngọc KTX"> | Người vô tội |

### 2.1. Danh mục Đối tượng Người chơi Nhìn thấy

| ID liên hệ / hội thoại | Loại (người / bí danh / nhóm / dịch vụ) | App | Tên nhìn thấy | Điều kiện vào bộ chọn nghi phạm / lý do loại trừ | Khóa gộp | Danh tính tác giả (không hiển thị) |
|---|---|---|---|---|---|---|
| `<contact_or_conversation_id>` | <loại> | `<app_id>` | <tên trên thẻ ghim> | <điều kiện theo hợp đồng app> | <khóa> | <ID hoặc chưa xác định> |

---

## 3. Sự thật, Lời Roasting & Thang Ngụy biện

### 3.1. Phân loại Kết luận Sự thật (Ground Truth)
- **Kết luận (`verdict`)**: `<cheating | innocent | sugar_relationship>`
- **Mã Tiểu tam (`culpritSuspectId`)**: `suspect_<tên_tiểu_tam>` (hoặc để trống `""` nếu kết luận là `innocent`)

### 3.2. Lời Roasting Kết thúc Vụ án
- **Chiến thắng Bắt ghen (`narrativeRoast`)**:
  > *"<1-2 câu châm biếm sâu cay, bóc trần toàn bộ chiêu trò của chồng và tuyên bố người vợ thắng cuộc>"*
- **Ghen Tuông Mù Quáng (`overJealousRoast`)**:
  > *"<Câu chọc quê hài hước cho từng nghi phạm vô tội khi người vợ kết tội nhầm>"*
- **Bị Giật Lại Máy (Thất bại do hết lượt nghi ngờ)**:
  > *"Bị giật lại máy! Chồng giật phắt điện thoại: 'Nửa đêm không ngủ còn mò mẫm máy anh làm gì?'"*

### 3.3. Thang Ngụy biện Khi Đối chất Sớm ("Chối bay chối biến")

| Số lượng Bằng chứng | Thái độ Người Chồng | Lời Thoại Ngụy biện Điển hình | Kết quả |
|---|---|---|---|
| **0 Thẻ (Cáo buộc non)** | Hùng hổ, tự tin | *"Em lại xem mấy video TikTok linh tinh rồi ghen bậy bạ đúng không? Đưa máy đây anh đi ngủ!"* | Thất bại (Không thuyết phục) |
| **1 Thẻ (Mới có 1 manh mối)** | Giật mình, phân bua | *"Ơ kìa, cái đấy là anh tiện tay giúp đồng nghiệp cùng phòng thôi mà, em làm gì mà nhảy dựng lên thế?"* | Chiến thắng 1 Sao (Thắng non) |
| **2 Thẻ (Đã đối chiếu 2 app)** | Toát mồ hôi, bao biện | *"Thì... thì đúng là có quen, nhưng bọn anh chỉ là bạn bè công việc trong sáng, có cả phòng làm chứng mà!"* | Chiến thắng 2 Sao (Thuyết phục) |
| **3+ Thẻ (Đủ tam giác bằng chứng)** | Cúi đầu nhận tội | *"Anh xin lỗi vợ ơi... Anh biết anh sai rồi, anh thề từ nay không bao giờ dám nữa, em tha cho anh lần này!"* | Chiến thắng Tuyệt đối 3 Sao |

---

## 4. Cấu hình Ứng dụng & Mồi nhử Thông báo (Notification Hook)

### 4.1. Phân cấp Độ khó
- **Phân bậc Màn chơi**: Màn `<1 | 2 | 3>`
- **Số lượt nghi ngờ tối đa (`allowedStrikes`)**: `<Màn 1: 5 | Màn 2: 4 | Màn 3: 3>`
- **Số app có manh mối**: `<Màn 1: 3-4 | Màn 2: 5-6 | Màn 3: 8-11>`
- **Số câu đố mã khóa (`lockChallenges`)**: `<Màn 1: 0 | Màn 2: 1 | Màn 3: 2>`

### 4.2. Bảng Phân bổ Trạng thái Ứng dụng

| App ID | Có clue / chỉ sinh hoạt | Event / Activity ID nguồn (từ Storyboard) | Màn / trường hiện có | Khoảng trống hợp đồng nếu có |
|---|---|---|---|---|
| `<app_id>` | <vai trò> | `<EVT-XX / ACT-XX>` | <khả năng đã xác minh> | <nếu có> |

### 4.3. Thông số Thiết bị & Thông báo Mồi nhử (Zero-Spoiler Hook)
- **Đồng hồ Cốt truyện (`narrativeTime`)**: `<ví dụ: 23:45>`
- **Thời lượng Pin (`batteryPercent`)**: `<ví dụ: 42%>`
- **Nhà mạng (`carrierTag`)**: `<ví dụ: 5G>`
- **Màu Chủ đề PWA (`pwaThemeColor`)**: `<ví dụ: #0f172a>`

**Thông báo Đẩy Khởi phát (Tuyệt đối không spoil):**
- **Toast ID**: `toast_01`
- **Ứng dụng Nguồn**: `<ví dụ: internet-messaging hoặc banking>`
- **Tiêu đề Người gửi**: `<ví dụ: Tin nhắn • Vừa xong>`
- **Nội dung Rút gọn**: `"<ví dụ: Anh Tuấn Thợ Điện: 'Đồ anh để quên em cất rồi, mai em mang qua nhé.'>"`
- **Thời gian Trì hoãn**: `<ví dụ: 4 giây>`

---

## 5. Đồ Thị Bằng Chứng & Ma Trận Dữ Liệu Pháp Y

### 5.1. Liên kết Sơ đồ Mermaid (Timeline & Clue-to-Suspect Graph)
- **Sơ đồ Dòng thời gian (Story Timeline)** và **Sơ đồ Mạng lưới Manh mối - Manh mối & Manh mối - Nghi phạm (Clue & Suspect Graph)**: Xem tại Mục 3 và Mục 4 của [level-0<N>-storyboard.md](level-0<N>-storyboard.md).

### 5.2. Bảng Dữ Liệu Nodes & Edges (Compiler & Tooling SSOT)
*Đặc tả mạng lưới Node-Edge đồng bộ trực tiếp với hợp đồng `CaseKnowledgeGraph` trong `case-schema.ts`. Mọi màn chơi bắt buộc phải có bảng này.*

#### Danh sách Nodes
| Node ID | Loại (`type`) | Tên hiển thị (`label`) | App nguồn / Record ID | Clue ID (nếu có) | Vỏ bọc ban đầu (`isInitialDisguise`) |
|---|---|---|---|---|---|
| `node_suspect_<id>` | `suspect` | <Tên thật & nghề nghiệp> | - | - | `false` |
| `node_alias_<id>` | `alias` | <Tên ngụy trang trong app> | `<app_id>` / `<record_id>` | `<clue_id>` | `true` |
| `node_bridge_<id>` | `bridge_id` | <SĐT / Tên TK pháp lý> | `<app_id>` / `<record_id>` | - | `false` |
| `node_record_<id>` | `record_clue` | <Tên bản ghi / đơn / biên lai>| `<app_id>` / `<record_id>` | `<clue_id>` | `false` |
| `node_timeline_<id>`| `timeline_slot`| <Mốc thời gian cụ thể> | - | - | `false` |

#### Danh sách Edges & Smoking Guns
| Edge ID | Nút Nguồn (`source`) | Nút Đích (`target`) | Loại quan hệ (`relationship`) | Bằng chứng chốt (`isSmokingGun`) | Record ID nguồn / đích | Trường / nội dung nhìn thấy khớp nhau; chuẩn hóa cho phép | Tập bằng chứng tối thiểu phải ghim (Record ID / Message ID) | Kết luận được phép | Ca đạt / ca không đạt | Lời ngụy biện / bóc trần của Chồng |
|---|---|---|---|---|---|---|---|---|---|---|
| `edge_<id>` | `<node_A>` | `<node_B>` | `uses_alias` / `bridges_identity` / `occurred_at` / `contradicts_alibi` | `true` / `false` | `<record_A>` / `<record_B>` | <giá trị và quy tắc đối chiếu> | <các ID cụ thể> | <mức kết luận> | <đầu vào và kết quả mong đợi> | <lời thoại> |

- **Danh sách Cạnh Bắt buộc để Thắng 3 Sao (`requiredSmokingGunEdgeIds`)**: `['edge_<id_1>', 'edge_<id_2>', 'edge_<id_3>']`

### 5.3. Thử thách Mã khóa & Câu đố (Dành cho Màn 2 & Màn 3)
*(Màn 1 để trống mục này: `lockChallenges: []`)*

| Challenge ID | Loại Đối tượng | ID Đối tượng / App | Loại Khóa | Đáp án / Mã PIN | App Chứa Manh mối | Clue ID | Câu hỏi Gợi ý (Chơi đẹp) |
|---|---|---|---|---|---|---|---|
| `lock_banking` | `app` | `banking` | `numeric_pin` | `1509` | `internet-messaging` | `CLUE-NOTE-01` | *"Nhập mã PIN 4 số của ứng dụng Ngân hàng (Gợi ý: Ngày kỷ niệm vào TechCorp)"* |

---

## 6. Lộ trình Phá án & Bảng Điều tra Nối dây

- **Đường suy luận trực quan**: Bắt đầu từ mồi nhử khởi phát `toast_01` -> giải án theo sơ đồ tại [level-0<N>-storyboard.md](level-0<N>-storyboard.md).
- **Thứ tự gợi ý Giác quan thứ 6**: Hướng dẫn thứ tự app cần kiểm tra để định hướng người chơi chơi đẹp.
- **Đặc tả bố cục Bảng Điều tra Nối dây**: Tọa độ và cơ chế hoạt động của Canvas 2A tuân thủ [US-015](../../output/epic-03-wife-notebook-verdict-social-sharing/us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md#corkboard-canvas-layout--swimlane-architecture).

---

## 7. Bàn giao Kỹ thuật cho Lead Dev Agent

### 7.1. File Cấu hình Đích
`src/data/cases/<husbandId>/level_0<N>.json`

### 7.2. Yêu cầu Cấu trúc Mock Data & Chuẩn Gói 3 File Theo Màn (+ 1 File Hồ sơ Chồng)
- Hồ sơ gốc của người chồng (`husband-profile.md`) cùng ảnh đại diện gốc được tạo 1 lần và tái sử dụng cho mọi màn của người chồng đó.
- Mỗi màn chơi gồm **đúng 3 files**:
  1. `level-0<N>-storyboard.md`: Nhân khẩu học nghi phạm, kịch bản tương tác theo thời gian, sơ đồ Mermaid Timeline và sơ đồ Mermaid Clue-to-Clue / Clue-to-Suspect.
  2. `level-0<N>.md`: Hồ sơ đặc tả pháp y và bảng Nodes & Edges.
  3. `level-0<N>-phone-data.md`: Kịch bản chi tiết lời thoại và bản ghi trong khoảng thời gian D-Day $\pm$ 2-3 ngày, đảm bảo $\ge 75\%$ bản ghi sinh hoạt/giải oan. Tuyệt đối không tạo file `history.md` (dữ liệu nền quá khứ sâu do dev nạp từ shared mock fixtures).
- Toàn bộ lời thoại, tin nhắn, ghi chú, chuyển khoản tiếng Việt trong `level-0<N>-phone-data.md` phải tuân thủ đúng nhân khẩu học (tuổi tác, vai vế) và chuẩn xưng hô tiếng Việt tự nhiên (`anh/em/chị/cô/chú/con...`).

### 7.3. Tiêu chí Nghiệm thu Pháp y
1. Chạy lệnh kiểm tra hồ sơ cốt truyện:
   ```bash
   python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec ".agent-artifacts/requirements/stories/husband-<name>/level-0<N>.md"
   ```
2. Đảm bảo toàn bộ Clue IDs tồn tại trong danh mục và tuân thủ định dạng `CLUE-<APP>-XX`.
3. Kết quả [đọc duyệt ngữ nghĩa](../../../../.agents/skills/level-designer/references/story-first-design.md#4-đọc-duyệt-ngữ-nghĩa-trước-bàn-giao): <đường giải đã đối chiếu, tính nhất quán xưng hô tiếng Việt, phụ thuộc thay đổi, khoảng trống>.
4. Bàn giao các ca kiểm tra cho [đọc duyệt triển khai](../../../../.agents/skills/level-designer/references/story-first-design.md#5-đọc-duyệt-khi-triển-khai-hoặc-sửa-dữ-liệu-truyện): <ca kiểm tra / phần runtime chưa kiểm chứng>.
