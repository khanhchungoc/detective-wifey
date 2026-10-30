---
name: level-designer
description: "Design story-first game levels: establish reusable husband personas and avatars, chronological interaction storyboards with suspect demographics, timeline and clue-to-suspect Mermaid graphs, and subtle Vietnamese app traces. Use when: defining a new husband profile, authoring level storyboards and design specs under requirements/stories/, creating husband cheating scenarios, adding or updating clues in clue inventories, structuring deduction paths for the developer agent, or generating persona-matched avatars and Shopoo chat/order/product images after a level story is approved."
---

# Level Designer

- Thiết kế các màn chơi game phá án, xây dựng các kịch bản bắt ghen trào phúng mang đậm bản sắc văn hóa mạng xã hội Việt Nam (*Tâm sự Eva*, *Vén khéo*, *quỹ đen*).
- **Phương pháp thiết kế**: Tuân theo [truyện trước ứng dụng](references/story-first-design.md); quy tắc độ khó, chuẩn xưng hô tiếng Việt theo nhân khẩu học và bằng chứng gián tiếp thuộc [quy tắc thiết kế](references/level-design-rules.md).
- Quản trị vòng đời manh mối 2 chiều: tham khảo danh mục ý tưởng (`clue-ideas-inventory.md`) hoặc sáng tạo manh mối mới theo cấu trúc chuẩn.
- Sản xuất hồ sơ theo cấu trúc chuẩn tại `.agent-artifacts/requirements/stories/husband-<name>/`:
  - **Cấp độ Người Chồng (Định nghĩa 1 lần, tái sử dụng cho mọi màn của người chồng đó)**:
    - `husband-profile.md`: Hồ sơ gốc chứa chân dung người chồng + ảnh đại diện gốc (`husbandAvatar`), mỏ neo thông tin người vợ (tuổi, size quần áo/giày, dị ứng, địa chỉ nhà), dàn nhân vật cố định xuyên màn (Mẹ, Sếp, Bạn thân) và lộ trình tiến hóa chiêu trò qua các màn.
  - **Cấp độ Màn Chơi (Đúng 3 files cho mỗi màn `level-XX`)**:
    1. `level-XX-storyboard.md`: Bảng nhân khẩu học nghi phạm/nhân vật, kịch bản tương tác theo trình tự thời gian (ai tương tác với chồng, làm gì cùng nhau/cho nhau, qua app nào), **Sơ đồ Mermaid Dòng thời gian (Timeline)** và **Sơ đồ Mermaid Mạng lưới Manh mối - Manh mối & Manh mối - Nghi phạm (Clue & Suspect Graph)**.
    2. `level-XX.md`: Căn cứ thiết kế pháp y (SSOT) chứa kết luận, lời đối chất, bảng phân bổ ứng dụng, bảng Nodes & Edges (`CaseKnowledgeGraph` - Scope 1C) và hợp đồng bàn giao kỹ thuật.
    3. `level-XX-phone-data.md`: Kịch bản chi tiết lời thoại, tin nhắn chat và bản ghi trong máy (giới hạn thời gian D-Day $\pm$ 2-3 ngày, $\ge 75\%$ sinh hoạt/bẫy giải oan; tuân thủ chuẩn xưng hô tiếng Việt theo độ tuổi/vai vế nhân khẩu học).
    *(Tuyệt đối KHÔNG tạo file `level-XX-history.md` - dữ liệu nền quá khứ sâu thuộc trách nhiệm của shared fixtures phía lập trình).*

> [!NOTE]
> **SSOT for Skill Triggers**: The frontmatter `description` above is the **Single Source of Truth** for when to activate this skill. Do NOT repeat a redundant `## When to Use` section in the body. Agents that mount this skill define dispatch conditions in their own `.agent.md` file.

---

## References

Đọc phương pháp truyện trước ứng dụng trước khi thiết kế; tra các tài liệu còn lại khi cần:
- **Phương pháp bắt buộc**: [references/story-first-design.md](references/story-first-design.md).
- **Quy tắc Thiết kế Manh mối Gián tiếp, Chuẩn Xưng hô Tiếng Việt & Cốt truyện**: [references/level-design-rules.md](references/level-design-rules.md) - Tam giác bằng chứng gián tiếp, chuẩn xưng hô theo nhân khẩu học, phân bậc độ khó, luật cấm lộ liễu, và thang ngụy biện "chối bay chối biến".
- **Mẫu Hồ sơ Gốc Người Chồng (`husband-profile.md`)**: [references/husband-profile-template.md](references/husband-profile-template.md) - Khung mẫu định nghĩa persona chồng, ảnh gốc, mỏ neo người vợ và dàn nhân vật cố định.
- **Mẫu Storyboard & Sơ đồ Mermaid (`level-XX-storyboard.md`)**: [references/storyboard-template.md](references/storyboard-template.md) - Khung mẫu nhân khẩu học nghi phạm, bảng tương tác dòng thời gian, sơ đồ Timeline và sơ đồ Clue-to-Clue / Clue-to-Suspect.
- **Mẫu Đặc tả Pháp y Màn chơi (`level-XX.md`)**: [references/story-spec-template.md](references/story-spec-template.md) - Khung mẫu hoàn chỉnh cho tài liệu `level-XX.md`.
- **Danh mục Manh mối SSOT**: [clue-ideas-inventory.md](../../../.agent-artifacts/requirements/stories/clues/clue-ideas-inventory.md) - Danh mục ý tưởng manh mối trào phúng Việt Nam.
- **Kiến trúc Hệ thống (SAD)**: [apps-features-architecture.md](../../../.agent-artifacts/project-knowledge-base/solution-context/architecture/apps-features-architecture.md) - Hệ sinh thái ứng dụng giả lập hiện hành.
- **Bề mặt ảnh Shopoo**: [app-design.md](../../../.agent-artifacts/project-knowledge-base/solution-context/apps/ecommerce/app-design.md) và [features.md](../../../.agent-artifacts/project-knowledge-base/solution-context/apps/ecommerce/features.md) - Xác nhận vị trí ảnh sản phẩm, thẻ sản phẩm trong chat và nội dung đơn hàng trước khi tạo asset.

---

## Prerequisites & Inputs

> [!IMPORTANT]
> **Nguyên tắc "Infer First, Ask with Options"**: Nếu hồ sơ người chồng, đề tài kịch bản hoặc độ khó màn chơi chưa rõ ràng, DỪNG LẠI và hỏi người dùng bằng `ask_question` với phương án đề xuất và các lựa chọn cụ thể (2-4 câu/lần). Không bao giờ tự suy diễn kịch bản nếu thiếu dữ kiện định hướng.

Cần chuẩn bị trước khi thiết kế:
- **Hồ sơ & Persona Người Chồng (`husband-profile.md`)**: Mã định danh (ví dụ: `hoang`), thư mục `husband-<name>` (ví dụ: `husband-hoang`), tên, tuổi, nghề nghiệp, nhóm thế hệ (`generationTag`), khẩu khí chat (`chatTone`), thói quen ứng dụng (`lifestyleHabits`), ảnh đại diện gốc (`husbandAvatar`), thông tin mỏ neo của người vợ và dàn nhân vật phụ cố định.
- **Số thứ tự Màn chơi**: 1, 2, hoặc 3.
- **Chủ đề Kịch bản Việt Nam**: Ý tưởng bắt ghen (ví dụ: lén nuôi bồ nhí đội lốt thợ điện, lập quỹ đen mua quà sinh viên, ngoại tình văn phòng qua lời nhắn chuyển khoản 1k).
- **Môi trường**: Python 3 sẵn sàng để chạy `scripts/sync_clues.py`.

---

## Procedure

### Bước 1: Thiết lập hoặc Tái sử dụng Hồ sơ Người Chồng (`husband-profile.md` + Ảnh Chồng)
1. Kiểm tra thư mục `.agent-artifacts/requirements/stories/husband-<name>/`:
   - **Nếu chưa có `husband-profile.md` (Người chồng mới)**: Tạo `husband-profile.md` theo [mẫu hồ sơ chồng](references/husband-profile-template.md), định nghĩa đầy đủ chân dung người chồng, mỏ neo pháp y của người vợ (tuổi, size quần áo/giày, món dị ứng, địa chỉ nhà), dàn nhân vật cố định (Vợ, Mẹ, Bạn thân, Sếp) và lộ trình tiến hóa Màn 1-3. Tạo ảnh đại diện gốc cho người chồng sau khi người dùng duyệt hồ sơ chồng.
   - **Nếu đã có `husband-profile.md` (Thiết kế màn mới cho chồng cũ)**: Đọc và **tái sử dụng bắt buộc** toàn bộ thông tin persona chồng, ảnh đại diện chồng, mỏ neo vợ và nhân vật cố định từ `husband-profile.md`. Tuyệt đối không tạo lại hay viết mâu thuẫn với hồ sơ gốc.
2. Xác định chủ đề màn chơi, kết luận (`verdict`) và phân bậc độ khó theo [quy tắc thiết kế](references/level-design-rules.md).

### Bước 2: Thiết kế Storyboard Dòng thời gian & Sơ đồ Mermaid (`level-XX-storyboard.md`)
Khởi tạo file `level-XX-storyboard.md` theo [mẫu Storyboard](references/storyboard-template.md) và [phương pháp, mục 1](references/story-first-design.md#1-storyboard-dòng-thời-gian-nhân-khẩu-học--sơ-đồ-mermaid-level-xx-storyboardmd):
1. **Định nghĩa Nhân khẩu học Nghi phạm & Nhân vật**: Ghi rõ họ tên thật, tuổi tác, giới tính, nghề nghiệp, mối quan hệ với người chồng, vỏ bọc ngụy trang và khẩu khí của từng nghi phạm/người liên hệ.
2. **Xây dựng Bảng Tương tác Theo Dòng thời gian (Chronological Storyboard)**: Liệt kê theo trình tự thời gian ai tương tác với chồng, họ làm gì cùng nhau hoặc cho nhau (ăn uống, đi chơi, làm việc, chat, khách sạn, mua sắm, chuyển tiền, gọi điện...), ở đâu, vật phẩm trao tay và **qua ứng dụng nào (`appId`)**.
3. **Vẽ Sơ đồ Mermaid 1 (Story Timeline Diagram)**: Trực quan hóa dòng thời gian sự kiện của màn chơi và ứng dụng lưu giữ từng dấu vết.
4. **Vẽ Sơ đồ Mermaid 2 (Clue & Suspect Graph - `ALL_SUSPECTS -> ALIASES -> APPS -> CLUE_NODES`)**: Trực quan hóa theo 4 cột từ Trái sang Phải: Container toàn bộ nghi phạm (`ALL_SUSPECTS`: Kẻ chủ mưu + tất cả Red Herrings) -> Vỏ bọc / định danh sử dụng (`ALIASES`) -> Ứng dụng xuất hiện (`APPS`) -> Các nút bản ghi manh mối (`CLUE_NODES`), trong đó các nút manh mối nối trực tiếp với nhau (`Clue <--> Clue`) bằng các cạnh ghi rõ quan hệ (`bridges_identity`, `contradicts_alibi`, `occurred_at`, hoặc giải oan).

### Bước 3: Đặc tả Pháp y (`level-XX.md`) & Kịch bản Thoại (`level-XX-phone-data.md`)
Thực hiện [phương pháp, mục 2-3](references/story-first-design.md#2-chuyển-storyboard-thành-đặc-tả-level-xxmd--dữ-liệu-điện-thoại-level-xx-phone-datamd). Tra cứu tài liệu app qua `research-project-knowledge`, sau đó hoàn thiện 2 file còn lại của màn chơi:
1. **Hoàn thiện `level-XX.md` theo [mẫu đặc tả](references/story-spec-template.md)**:
   - Liên kết trực tiếp tới `husband-profile.md` và `level-XX-storyboard.md` (không sao chép lặp lại thông tin persona chồng hay sơ đồ Mermaid).
   - Thiết lập cấu trúc `nodes[]` và `edges[]` (Scope 1C) khớp 100% với Sơ đồ Mermaid 2 trong `level-XX-storyboard.md`, tuân thủ **Strict Zero-Spoiler Alias Resolution** (bóc trần qua `bridge_id`), cạnh `contradicts_alibi` và `requiredSmokingGunEdgeIds`.
   - Quy hoạch bố cục Bảng Điều tra Nối dây (Corkboard Canvas - US-015), thang ngụy biện, lời roasting và khóa giải đố.
2. **Biên soạn `level-XX-phone-data.md` (D-Day $\pm$ 2-3 ngày, $\ge 75\%$ sinh hoạt/giải oan)**:
   - **Tuân thủ Tuyệt đối Nhân khẩu học & Chuẩn Xưng hô Tiếng Việt**: Toàn bộ bong bóng chat, SMS, ghi chú, chuyển khoản ngân hàng, email phải bám sát persona, khẩu khí viết tắt (`generationTag`, `chatTone`) và **cách xưng hô tiếng Việt chuẩn (`anh`, `em`, `chị`, `cô`, `chú`, `con`, `mày`, `tao`, `sếp`)** theo đúng độ tuổi và vai vế giữa người chồng với người đối thoại (ví dụ: nếu chồng nhắn tin cho người lớn tuổi hơn mình, đại từ của chồng bắt buộc là `em` và gọi đối phương là `anh`/`chị`/`sếp`; cấm tự mâu thuẫn đại từ trong cùng câu).

### Bước 4: Kiểm tra & Tham khảo Manh mối
Tra cứu ý tưởng bằng `python -B .agents/skills/level-designer/scripts/sync_clues.py list --app <appId>`; dùng `add --help` để lưu clue mới vào danh mục ý tưởng nếu muốn tái sử dụng cho các màn khác.

### Bước 5: Xác thực & Đọc duyệt
Kiểm tra bộ hồ sơ của màn chơi (`husband-profile.md` + 3 files của màn: `level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`):
1. Chạy công cụ kiểm tra cấu trúc, liên kết file, sơ đồ Mermaid và danh mục clue:
   ```bash
   python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec <path_to_level-XX.md>
   python -B .agents/skills/level-designer/scripts/sync_clues.py validate --file <path_to_level-XX.md>
   ```
2. Rà soát `level-XX-phone-data.md`: tỷ lệ $\ge 75\%$ bản ghi sinh hoạt/giải oan, tính chính xác của đại từ xưng hô tiếng Việt theo độ tuổi nhân khẩu học, và thực hiện [đọc duyệt ngữ nghĩa](references/story-first-design.md#4-đọc-duyệt-ngữ-nghĩa-trước-bàn-giao).

### Bước 6: Xin duyệt Thiết kế Cốt truyện
Trình bày `husband-profile.md` (nếu mới tạo/cập nhật) và gói 3 file của màn chơi (`level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`) cùng các khoảng trống/chưa kiểm chứng. Chỉ bắt đầu tạo avatar mới và ảnh nội dung sau khi người dùng duyệt rõ phiên bản cốt truyện cuối cùng.

### Bước 7: Tạo Avatar và Ảnh Nội dung (Chỉ sau khi Duyệt)
Sau khi được duyệt, tạo ảnh cho các nhân vật mới, bí danh, nhóm/tài khoản dịch vụ và nội dung Shopoo có mặt trong màn chơi:
1. **Tái sử dụng Ảnh Cố định**: Bắt buộc tái sử dụng ảnh đại diện của người chồng (`husbandAvatar`) và các nhân vật cố định đã có trong `husband-profile.md`; chỉ tạo mới ảnh cho các nghi phạm/nhân vật/sản phẩm xuất hiện mới ở màn hiện tại.
2. Chọn kiểu ảnh dựa trên persona và nhân khẩu học đã xác nhận: ảnh tự chụp đời thường với góc/khoảng cách khác nhau, thú cưng, ảnh gia đình, ảnh toàn thân ngoài cảnh quan hoặc ảnh phong cảnh. Ưu tiên ảnh camera-roll đời thường, ánh sáng/góc cắt không hoàn hảo; tránh bộ chân dung generic, bóng bẩy và giống nhau.
3. Không sáng tác sở thích, quan hệ gia đình, trẻ em, nghề nghiệp, hay manh mối mới chỉ để hợp thức hóa ảnh. Avatar không được trở thành manh mối mới hoặc làm lộ kết luận.
4. Giữ cùng một ảnh cho cùng danh tính trên các app, trừ khi cốt truyện xác nhận nhân vật dùng ảnh khác nhau theo tài khoản. Với bí danh/vỏ bọc, ảnh chỉ phản ánh điều người chơi được thấy và không hé lộ danh tính thật, giới tính hoặc mối quan hệ bị giấu.
5. Dùng ảnh/biểu trưng phù hợp cho nhóm và tài khoản dịch vụ; không gán chân dung người thật giả cho tổ chức.
6. Với Shopoo, dùng tài liệu [Bề mặt ảnh Shopoo](#references) và sản phẩm/biến thể được ghi trong `level-XX-phone-data.md` đã duyệt để lập danh sách bề mặt ảnh được hỗ trợ. Tạo ảnh khớp tên, màu/size/biến thể đã xác nhận; dùng cùng một asset sản phẩm/biến thể trên thẻ sản phẩm trong chat người bán, danh sách sản phẩm và đơn hàng liên quan.
7. Lưu ảnh vào vị trí asset hiện có của dự án; ghi tên file cùng ID nhân vật/sản phẩm/đơn hàng/hội thoại và app sử dụng trong bàn giao.

### Bước 8: Bàn giao cho Lead Dev
Bàn giao `husband-profile.md`, gói 3 file của màn chơi (`level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`) cùng các ảnh đã tạo sau duyệt tới `@frontend-game-developer` để ánh xạ vào file cấu hình `src/data/cases/<husband>/level_XX.json`. Chỉ rõ ID clue, ID bản ghi, bảng ánh xạ avatar/sản phẩm/đơn hàng/hội thoại và khoảng trống runtime chưa triển khai.

---

## Ranh giới

- Mỗi thư mục người chồng (`stories/husband-<name>/`) có **1 file hồ sơ gốc dùng chung** (`husband-profile.md`) và **đúng 3 files cho mỗi màn chơi** (`level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`) cùng cập nhật danh mục clue (`clues/`). Tuyệt đối không tạo file `level-XX-history.md` (filler lịch sử quá khứ sâu do dev nạp từ shared mock fixtures trong code engine).
- Không trực tiếp sửa JSON trong `src/data/cases/` hoặc mở rộng app/UI trong skill này.
- Hợp đồng hồ sơ thuộc các mẫu trong `references/`; độ khó, khóa, chuẩn xưng hô và chuẩn gói file thuộc [quy tắc thiết kế](references/level-design-rules.md). Chuẩn UI/gesture/icon tuân theo `AGENTS.md` và tài liệu thiết kế app.
