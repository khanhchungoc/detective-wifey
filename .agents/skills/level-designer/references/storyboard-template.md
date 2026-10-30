---
husband: <tên_chồng> # ví dụ: hoang (thư mục: husband-hoang)
level: <1 | 2 | 3>
---

# Storyboard & Sơ đồ Pháp y - Màn <N>: <Tên Màn Chơi>

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Tái sử dụng hồ sơ gốc tại [husband-profile.md](husband-profile.md). Tài liệu này định nghĩa nhân khẩu học của các nghi phạm, kịch bản tương tác theo dòng thời gian (Storyboard), sơ đồ Timeline và sơ đồ mạng lưới nối kết Manh mối - Nghi phạm trước khi viết dữ liệu thoại chi tiết.

---

## 1. Hồ sơ Nhân khẩu học Nghi phạm & Nhân vật Trong Màn (Suspect & Cast Personas)

*Kế thừa chân dung chồng, vợ và nhân vật cố định từ [husband-profile.md](husband-profile.md). Mọi hội thoại tiếng Việt bắt buộc tuân thủ chuẩn xưng hô tiếng Việt tự nhiên (`anh/em/chị/cô/chú/bác/con/mày/tao`) theo đúng độ tuổi, giới tính, thứ bậc xã hội/gia đình và mối quan hệ thực tế với người chồng (chồng `<tuổi_chồng>` tuổi):*

| ID Nhân vật / Nghi phạm | Họ tên Thật | Tuổi & Giới tính | Nghề nghiệp & Nhân khẩu học | Quan hệ với Chồng & Cách xưng hô chuẩn | Vỏ bọc trong máy (`alias`) | Khẩu khí & Thói quen ngôn ngữ (`chatTone`) | Vai trò trong Màn |
|---|---|---|---|---|---|---|---|
| `suspect_<id>` | <Họ tên thật> | <Tuổi, Nữ/Nam> | <Nghề nghiệp, nơi ở, hoàn cảnh> | <Nhỏ/lớn hơn chồng bao nhiêu tuổi; xưng hô tự nhiên> | `<Tên lưu danh bạ/app>` | <Mức độ viết tắt, từ lóng, văn phong> | **Kẻ chủ mưu (Culprit)** |
| `suspect_<id>` | <Họ tên thật> | <Tuổi, Nữ/Nam> | <Nghề nghiệp, nơi ở, hoàn cảnh> | <Quan hệ công việc/gia đình/dịch vụ; xưng hô tự nhiên> | `<Tên lưu danh bạ/app>` | <Mức độ viết tắt, từ lóng, văn phong> | Bẫy nghi ngờ (Red Herring) |
| `contact_<id>` | <Họ tên thật> | <Tuổi, Nữ/Nam> | <Nghề nghiệp, hoàn cảnh> | <Quan hệ sinh hoạt đời thường; xưng hô tự nhiên> | `<Tên lưu danh bạ/app>` | <Mức độ viết tắt, từ lóng, văn phong> | Sinh hoạt / Giải oan |

---

## 2. Kịch bản Tương tác Theo Dòng thời gian (Chronological Interaction Storyboard)

*Liệt kê theo trình tự thời gian từ quá khứ gần đến thời điểm kiểm tra máy (`D-Day`). Bao gồm cả chuỗi sự kiện vụ án (`EVT-*`) và hoạt động sinh hoạt/giải oan đời thường (`ACT-*`):*

| Thứ tự / ID | Thời điểm | Chồng tương tác với ai | Họ làm gì cùng nhau / cho nhau (ăn uống, mua sắm, công việc, khách sạn, chuyển tiền, chat...) | Địa điểm & Vật phẩm trao tay (Ai giữ trước -> sau) | Qua Ứng dụng nào (`appId`) | Mã Bản ghi / Manh mối sinh ra (`Record ID` / `Clue ID`) | Sự thật ngầm vs Vỏ bọc hiển thị |
|---|---|---|---|---|---|---|---|
| `EVT-01` | <Ngày Giờ> | <Nhân vật> | <Hành động tương tác cụ thể> | <Địa điểm / Vật phẩm> | `<appId>` | `<record_id>` (`<CLUE-ID>`) | <Sự thật tác giả biết vs điều vợ thấy trên máy> |
| `ACT-01` | <Ngày Giờ> | <Nhân vật> | <Hoạt động sinh hoạt / nhờ vả vô tội> | <Địa điểm / Vật phẩm> | `<appId>` | `<record_id>` (Sinh hoạt / Giải oan) | <Lý do vô tội hợp lý> |

---

## 3. Sơ đồ Dòng thời gian Cốt truyện & Dấu vết Ứng dụng (Mermaid Story Timeline Diagram)

*Sơ đồ trực quan hóa trình tự thời gian của vụ án, ai tương tác với chồng, làm việc gì và để lại dấu vết trên ứng dụng nào:*

```mermaid
flowchart TD
  subgraph DAY_MINUS ["1. Giai đoạn Chuẩn bị & Sinh hoạt Trước D-Day"]
    T1["<Ngày Giờ> - <EVT/ACT ID><br/>Chồng & <Nhân vật>: <Hành động (mua hàng / hẹn lịch / chuyển khoản)><br/>📱 App: <appId> (<record_id>)"]
    T2["<Ngày Giờ> - <EVT/ACT ID><br/>Chồng & <Nhân vật>: <Hành động><br/>📱 App: <appId> (<record_id>)"]
  end

  subgraph D_DAY_DAYTIME ["2. Trong Ngày D-Day (Giao nhận / Phối hợp)"]
    T3["<Ngày Giờ> - <EVT/ACT ID><br/>Chồng & <Nhân vật>: <Hành động (nhận hàng / nhắn tin chốt hẹn)><br/>📱 App: <appId> (<record_id>)"]
  end

  subgraph D_DAY_NIGHT ["3. Cao trào Tối D-Day (Gặp gỡ & Ngoại phạm Giả)"]
    T4["<Ngày Giờ> - <EVT ID><br/>Chồng nhắn Vợ: '<Lời khai ngoại phạm>'<br/>📱 App: internet-messaging (<record_id>)"]
    T5["<Ngày Giờ> - <EVT ID><br/>Chồng & <Nghi phạm>: <Ăn tối / Khách sạn / Thanh toán><br/>📱 App: <appId> (<record_id>)"]
    T6["<Ngày Giờ> - <EVT ID><br/>Thông báo khởi phát lúc nửa đêm (toast_01)<br/>📱 App: <appId> (<record_id>)"]
  end

  T1 --> T2 --> T3 --> T4 --> T5 --> T6
```

---

## 4. Sơ đồ Mạng lưới Nghi phạm -> Vỏ bọc -> Ứng dụng -> Nút Manh mối (Mermaid Clue & Suspect Graph)

*Sơ đồ phục vụ trực tiếp cho việc lập trình `CaseKnowledgeGraph` (`nodes[]` và `edges[]`), bố cục từ Trái sang Phải theo đúng 4 cột (`ALL_SUSPECTS -> ALIASES -> APPS -> CLUE_NODES`):*
1. **Cột 1 (`ALL_SUSPECTS`)**: Container gom toàn bộ nghi phạm thật trong màn (chia rõ Kẻ chủ mưu và Nhóm nghi phạm bẫy/vô tội).
2. **Cột 2 (`ALIASES`)**: Các vỏ bọc danh bạ, tài khoản ngụy trang hoặc tên pháp lý (`node_alias_*` / `node_bridge_*`) mà từng nghi phạm sử dụng.
3. **Cột 3 (`APPS`)**: Các ứng dụng nơi vỏ bọc/danh tính đó xuất hiện.
4. **Cột 4 (`CLUE_NODES`)**: Các nút bản ghi manh mối (`node_record_*`) sinh ra từ ứng dụng đó, nối trực tiếp với nhau (`Clue <--> Clue`) bằng các cạnh ghi rõ loại liên kết (`bridges_identity`, `contradicts_alibi`, `occurred_at`, hoặc đối chiếu giải oan).

```mermaid
flowchart LR
  subgraph ALL_SUSPECTS ["1. 👥 TẤT CẢ NGHI PHẠM (ALL SUSPECTS)"]
    Suspect_Culprit["node_suspect_<culprit_id><br/><Họ tên thật> (<Tuổi>, <Nghề nghiệp>)<br/>🔥 Vai trò: KẺ CHỦ MƯU (CULPRIT)"]
    Suspect_RH1["node_suspect_<rh1_id><br/><Họ tên 1> (<Tuổi>, <Nghề nghiệp>)<br/>🛡️ Vai trò: Bẫy nghi ngờ (Vô tội)"]
    Suspect_RH2["node_suspect_<rh2_id><br/><Họ tên 2> (<Tuổi>, <Nghề nghiệp>)<br/>🛡️ Vai trò: Bẫy nghi ngờ (Vô tội)"]
    Suspect_RH3["node_suspect_<rh3_id><br/><Họ tên 3> (<Tuổi>, <Nghề nghiệp>)<br/>🛡️ Vai trò: Bẫy nghi ngờ (Vô tội)"]
  end

  subgraph ALIASES ["2. 🎭 VỎ BỌC & ĐỊNH DANH (ALIASES)"]
    Alias_Disguise["node_alias_<id><br/>Vỏ bọc danh bạ: '<Tên ngụy trang>'"]
    Alias_Legal["node_bridge_<id><br/>Định danh thật: SĐT / Tên pháp lý"]
    Alias_RH1["'<Tên hiển thị Nghi phạm 1>'"]
    Alias_RH2["'<Tên hiển thị Nghi phạm 2>'"]
    Alias_RH3["'<Tên hiển thị Nghi phạm 3>'"]
  end

  subgraph APPS ["3. 📱 ỨNG DỤNG (APPS)"]
    App_1["<app_1> (ví dụ: internet-messaging)"]
    App_2["<app_2> (ví dụ: ecommerce)"]
    App_3["<app_3> (ví dụ: banking)"]
  end

  subgraph CLUE_NODES ["4. 🔍 NÚT MANH MỐI & LIÊN KẾT (CLUE NODES & EDGES)"]
    Clue_1["node_record_<id_1> (<CLUE-ID>)<br/><Bản ghi 1: Tin nhắn hẹn lịch + SĐT>"]
    Clue_2["node_record_<id_2> (<CLUE-ID>)<br/><Bản ghi 2: Đơn hàng quà tặng + SĐT/Tên nhận>"]
    Clue_3["node_record_<id_3> (<CLUE-ID>)<br/><Bản ghi 3: Biên lai thanh toán quán ăn>"]
    Clue_Alibi["node_record_<alibi_id> (<CLUE-ID>)<br/><Lời khai ngoại phạm với vợ>"]
    Clue_RH1_Hook["node_record_<rh1_hook><br/><Chi tiết gây nghi ngờ Nghi phạm 1>"]
    Clue_RH1_Proof["node_record_<rh1_proof><br/><Bằng chứng giải oan Nghi phạm 1>"]
    Clue_RH2_Hook["node_record_<rh2_hook><br/><Chi tiết gây nghi ngờ Nghi phạm 2>"]
    Clue_RH2_Proof["node_record_<rh2_proof><br/><Bằng chứng giải oan Nghi phạm 2>"]
  end

  %% 1. Suspects -> Aliases
  Suspect_Culprit -->|"uses_alias"| Alias_Disguise
  Suspect_Culprit -->|"bridges_identity"| Alias_Legal
  Suspect_RH1 --> Alias_RH1
  Suspect_RH2 --> Alias_RH2
  Suspect_RH3 --> Alias_RH3

  %% 2. Aliases -> Apps
  Alias_Disguise --> App_1
  Alias_Legal --> App_2
  Alias_Legal --> App_3
  Alias_RH1 --> App_1
  Alias_RH2 --> App_2
  Alias_RH3 --> App_3

  %% 3. Apps -> Clue Nodes
  App_1 --> Clue_1
  App_1 --> Clue_Alibi
  App_2 --> Clue_2
  App_3 --> Clue_3
  App_1 --> Clue_RH1_Hook
  App_1 --> Clue_RH1_Proof
  App_2 --> Clue_RH2_Hook
  App_2 --> Clue_RH2_Proof

  %% 4. Direct Clue <-> Clue Edges (inside CLUE_NODES)
  Clue_1 <==>|"🔥 SG1 (bridges_identity): Khớp SĐT / Tên pháp lý"| Clue_2
  Clue_1 <==>|"🔥 SG2 (bridges_identity): Khớp ngày kỷ niệm / vật phẩm"| Clue_2
  Clue_Alibi <==>|"🔥 SG3 (contradicts_alibi): Lệch lời khai cùng khung giờ"| Clue_3
  Clue_1 -.->|"occurred_at: Khớp giờ & địa điểm hẹn"| Clue_3

  Clue_RH1_Hook -.->|"🛡️ Giải oan: Khớp công việc / gia đình"| Clue_RH1_Proof
  Clue_RH2_Hook -.->|"🛡️ Giải oan: Khớp dịch vụ đời thường"| Clue_RH2_Proof
```

