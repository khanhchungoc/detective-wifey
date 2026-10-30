---
type: Wireframe
status: draft
description: "Photos gallery & media forensics ASCII wireframe for US-008."
tags: [requirement, wireframe, photos, gallery, media-forensics]
---

# Photos (Ảnh) - Thư viện ảnh & Giám định hình ảnh pháp y

## Người dùng, mục tiêu và bối cảnh

- Người chơi (Người vợ thám tử) kiểm tra ứng dụng Ảnh mặc định trên điện thoại của chồng để duyệt qua kho ảnh, mở rộng chi tiết EXIF/vị trí địa lý, phóng to các chi tiết phản chiếu đáng ngờ và mở khóa thư mục ảnh bị ẩn.
- Nền tảng: Ứng dụng web chạy trong khung điện thoại ảo iOS (393px × 852px); mở từ màn hình chính hoặc dock ứng dụng khi màn chơi kích hoạt Photos.
- [US-008](../us-008-photos-gallery-media-forensics-app-module.md).
- Trạng thái: Chờ duyệt bố cục ASCII; tham chiếu trực tiếp theo 2 ảnh chụp thực tế từ hệ điều hành iOS (Chế độ Thư viện lưới & Chế độ Thanh thông tin chi tiết EXIF/Bản đồ).

## Nguồn đối chiếu & Single Source of Truth (SSOT)

- [features.md](../../../../project-knowledge-base/solution-context/apps/phone-os/photos/features.md): Mục 2.1 (Lưới ảnh & Album), 2.2 (Hộp phóng đại pháp y & EXIF drawer), 2.3 (Thư mục ẩn 4 số PIN), Mục 3 (Ánh xạ manh mối `CLUE-PHOT-01` đến `CLUE-PHOT-04`), Mục 4 (Dữ liệu rác đời thường), Mục 5 (`PhotosData` schema).
- [app-design.md](../../../../project-knowledge-base/solution-context/apps/phone-os/photos/app-design.md): Hệ màu Obsidian Dark (`#000000`, `#1C1C1E`, `#2C2C2E`, `#2979FF`, `#FFC107`), kiểu chữ và bố cục iOS chuẩn.
- [US-011 Universal Long-Press Clue Pinning](../../epic-02-investigation-suspicion-mechanics/us-011-zero-spoiler-universal-long-press-clue-suspect-pinning.md): Nhấn giữ $\ge 380\text{ms}$ qua `StoryEvidenceTarget` mở `UniversalEvidenceModal`. Không có nút "Ghim" thường trực, không viền phát sáng báo trước manh mối.
- Ảnh thực tế 1: Bố cục xem thông tin chi tiết ảnh (EXIF, thông số chụp, bản đồ ghim ảnh thu nhỏ, ngày giờ chụp, tên tệp `IMG_xxxx`).
- Ảnh thực tế 2: Bố cục lưới thư viện ảnh ("Thư viện", khoảng ngày tháng, thời lượng video góc dưới ảnh, thanh điều hướng nổi Năm / Tháng / Tất cả ảnh).

## Danh sách màn hình

| Mã | Màn hình | Thành phần chính |
|---|---|---|
| PH1 | Thư viện ảnh (Library Grid) | Tiêu đề lớn "Thư viện", khoảng thời gian, nút Lọc và Chọn, lưới ảnh 3-4 cột có gắn thời lượng video, thanh điều hướng nổi ("Năm", "Tháng", "Tất cả", tìm kiếm), lối vào "Mục bị ẩn". |
| PH2 | Trình xem ảnh toàn màn hình (Forensic Lightbox) | Ảnh toàn màn hình, nút Đóng/Quay lại, công cụ phóng đại pháp y (Kính lúp / Hotspot), thanh công cụ iOS bên dưới (Chia sẻ, Yêu thích, Thông tin [ℹ️], Chỉnh sửa, Thùng rác). |
| PH3 | Bảng thông tin chi tiết ảnh (Photo Info & EXIF Drawer) | Xem ảnh thu nhỏ, trường chú thích, thời gian chụp kèm "Điều chỉnh", tên tệp/Cloud, thẻ thông số máy ảnh & cảm biến (ISO, tiêu cự, khẩu độ, tốc độ màn trập), thẻ bản đồ GPS với ghim ảnh thu nhỏ, nút "Xem trong Tất cả ảnh". |
| PH4 | Mở khóa Thư mục bị ẩn (Locked Hidden Album Gate) | Bàn phím số PIN 4 chữ số (`onRequestUnlock('lock_photos')`), danh sách ảnh nhạy cảm/kỷ niệm sau khi mở khóa thành công. |

---

## Bố cục từng màn hình

### PH1 - Thư viện ảnh (Library Grid View)
*(Tham chiếu Layout Ảnh thực tế 2)*

```text
+------------------------------------------------+
| 18:36 [Silent]                 [5G] [Pin 83%]  |
| ◀ Camera                                       |
|                                                |
| Thư viện                         [ ☰ ]  [ Chọn ]|
| 1–15 thg 8, 2026                               |
|------------------------------------------------|
| [ Ảnh 1 ]    [ Ảnh 2 ]    [ Ảnh 3 ]   [ Video ]|
|                                          0:03  |
|                                                |
| [ QR Code ]  [ Video ]    [ Ảnh 4 ]   [ Tin nhắn]|
|                 0:13                           |
|                                                |
| [ Bé đọc ]   [ Bé đọc ]   [ Bé cười]  [ Bé đọc ]|
|                                                |
| [ Quán ăn ]  [ Nhà bóng ] [ Đồ ăn ]   [ Video ]|
|                              0:07        0:31  |
|                                                |
| [ Hóa đơn ]  [ Cơm tấm ]  [ Xe máy ]  [ Video ]|
|                              0:43        2:40  |
|------------------------------------------------|
|        /==============================\        |
|       |  [🖼️]  [Năm]  [Tháng]  [Tất cả]| [🔍]   |
|        \==============================/        |
|               [Về màn hình chính]              |
+------------------------------------------------+
```

- **Tiêu đề & Bộ lọc**:
  - Tiêu đề lớn "Thư viện", phụ đề nhóm thời gian (ví dụ: `1–15 thg 8, 2026`).
  - Nút biểu tượng Lọc `[ ☰ ]` (dạng nút tròn tối) và nút `[ Chọn ]` (dạng viên thuốc bo tròn).
- **Lưới hiển thị đa phương tiện**:
  - Lưới ảnh 3 hoặc 4 cột cuộn dọc mượt mà.
  - Video hiển thị nhãn thời lượng màu trắng trên nền mờ ở góc dưới bên phải (ví dụ: `0:13`, `2:40`).
  - Bao gồm ảnh đời thường (cơm tấm, mèo, hóa đơn, xe máy) và ảnh câu chuyện/manh mối theo cấu hình màn chơi.
- **Thanh điều hướng nổi (Floating Bottom Capsule Bar)**:
  - Nằm nổi phía trên các ảnh cuối: Biểu tượng Thư viện `[🖼️]`, Bộ chuyển phân đoạn: `[ Năm ]`, `[ Tháng ]`, `[ Tất cả ]` (đang kích hoạt), nút Tìm kiếm `[ 🔍 ]`.
- **Thao tác**:
  - Chạm ngắn vào một ảnh/video: Mở trình xem toàn màn hình (PH2).
  - Nhấn giữ $\ge 380\text{ms}$ vào một ô ảnh: Kích hoạt `StoryEvidenceTarget` mở `UniversalEvidenceModal` để kiểm tra và ghim vào Sổ tay thám tử.

---

### PH2 - Trình xem ảnh toàn màn hình (Forensic Lightbox View)

```text
+------------------------------------------------+
| [◀ Thư viện]       13/10/2026 21:30       [ℹ️] |
|------------------------------------------------|
|                                                |
|                                                |
|             ┌────────────────────────┐         |
|             │    🍷 Bữa tối sang     │         |
|             │   (Bóng ly rượu vang   │         |
|             │    soi bàn tay nữ)     │         |
|             └────────────────────────┘         |
|                                                |
|          [ 🔍 Chạm đúp / Kính lúp phóng to ]   |
|                                                |
|------------------------------------------------|
|   [ ↑ ]      [ ♡ ]      [ ℹ️ ]      [ ⊶ ]    [ 🗑️ ]|
|   Chia sẻ   Yêu thích  Thông tin  Bộ lọc    Xóa|
+------------------------------------------------+
```

- **Vùng ảnh chính**:
  - Hiển thị ảnh độ phân giải cao trên nền đen tuyền `#000000`.
  - Hỗ trợ cử chỉ phóng to (Pinch-to-zoom hoặc Double-tap) để soi các điểm pháp y bí mật (`CLUE-PHOT-02` - bóng phản chiếu trên ly rượu, `CLUE-PHOT-03` - túi xách nữ ghế phụ xe hơi).
- **Thanh thao tác iOS phía dưới**:
  - `[ ↑ ]` (Chia sẻ), `[ ♡ ]` (Yêu thích), `[ ℹ️ ]` (Thông tin chi tiết), `[ ⊶ ]` (Bộ lọc/Chỉnh sửa), `[ 🗑️ ]` (Xóa ảnh).
  - *Quy tắc điều tra*: Thao tác Xóa, Chỉnh sửa, Chia sẻ hiển thị thông báo "Không khả dụng trong chế độ điều tra" để bảo đảm tính toàn vẹn dữ liệu.
  - Nhấn nút `[ ℹ️ ]` hoặc vuốt nhẹ từ dưới lên: Mở bảng thông tin chi tiết EXIF (PH3).
- **Thu thập chứng cứ**:
  - Nhấn giữ ảnh $\ge 380\text{ms}$ kích hoạt rung haptic 50ms và mở `UniversalEvidenceModal`.

---

### PH3 - Bảng thông tin chi tiết ảnh & Vị trí địa lý (Photo Info & EXIF Drawer)
*(Tham chiếu Layout Ảnh thực tế 1)*

```text
+------------------------------------------------+
| [ Phần ảnh thu nhỏ đang xem ]                  |
|------------------------------------------------|
| Thêm chú thích                                 |
|                                                |
| Lúc 18:37 Thứ Năm, ngày 22 tháng 10, 2026     |
| [☁️] IMG_9422                      [Điều chỉnh] |
|                                                |
| +--------------------------------------------+ |
| | Apple iPhone 15 Pro                 [HEIF] | |
| | Camera chính — 24 mm ƒ1,78                 | |
| | 24 MP • 4284 × 5712 • 2,1 MB               | |
| |--------------------------------------------| |
| | ISO 500 | 24 mm | 0 ev | ƒ1,78 | 1/50 s    | |
| +--------------------------------------------+ |
|                                                |
| +--------------------------------------------+ |
| | [ Bản đồ thu nhỏ khu vực ]                 | |
| |           P. Nghĩa Đô                      | |
| |               [📍 Ảnh]                     | |
| |  QL.32       HỒ TÙNG MẬU                   | |
| |--------------------------------------------| |
| | >                              [Điều chỉnh]| |
| +--------------------------------------------+ |
|                                                |
| [          Xem trong Tất cả ảnh              ] |
|------------------------------------------------|
|   [ ↑ ]      [ ♡ ]      [ ℹ️*]     [ ⊶ ]    [ 🗑️ ]|
+------------------------------------------------+
```

- **Thành phần chi tiết**:
  - **Chú thích ảnh**: Mục "Thêm chú thích" (chỉ đọc trong chế độ điều tra).
  - **Thời gian & Định danh**: Dòng ngày giờ định dạng tiếng Việt rõ ràng kèm nút "Điều chỉnh", biểu tượng đám mây [☁️] cùng mã tên tệp (ví dụ: `IMG_9422`).
  - **Thẻ thông số phần cứng & Máy ảnh (Camera EXIF Card)**:
    - Khối nền xám than bo góc (`#1C1C1E`).
    - Dòng trên: Tên thiết bị chụp (ví dụ: `Apple iPhone 15 Pro`), định dạng tệp (`[HEIF]` hoặc `[JPEG]`).
    - Ống kính & thông số: `Camera chính — 24 mm ƒ1,78`.
    - Độ phân giải & kích thước: `24 MP • 4284 × 5712 • 2,1 MB`.
    - Dải thông số phơi sáng dạng bảng 5 cột: `ISO [giá trị] | [tiêu cự] mm | [ev] ev | ƒ[khẩu độ] | [tốc độ màn trập] s`.
  - **Thẻ định vị GPS & Bản đồ (Geotag Map Card)**:
    - Bản đồ thu nhỏ hiển thị tên đường/phường xã (ví dụ: `P. Nghĩa Đô`, `HỒ TÙNG MẬU`, `QL.32`).
    - Ghim vị trí đặc biệt có lồng hình ảnh thu nhỏ của chính bức ảnh trỏ ngay tọa độ chụp.
    - Nút "Điều chỉnh" vị trí địa lý.
  - **Nút tiện ích**: `[ Xem trong Tất cả ảnh ]` đưa trực tiếp người chơi về vị trí ảnh trong lưới tổng thư viện.
- **Tương tác thám tử**:
  - Nhấn giữ vùng thông tin thẻ EXIF hoặc bản đồ $\ge 380\text{ms}$ mở `UniversalEvidenceModal` để trích xuất bằng chứng mâu thuẫn thời gian/địa điểm với lời khai của chồng.

---

### PH4 - Mở khóa Thư mục bị ẩn (Locked Hidden Album Gate)

```text
+------------------------------------------------+
| [◀ Album]                 Mục bị ẩn            |
|------------------------------------------------|
|                                                |
|                      [ 🔒 ]                    |
|                Thư mục này đã bị khóa          |
|         Nhập mã PIN 4 chữ số để mở khóa        |
|                                                |
|                  [ •  •  •  • ]                |
|                                                |
|                 [ 1 ]  [ 2 ]  [ 3 ]            |
|                 [ 4 ]  [ 5 ]  [ 6 ]            |
|                 [ 7 ]  [ 8 ]  [ 9 ]            |
|                        [ 0 ]  [ ⌫ ]            |
|                                                |
|       (Gợi ý: Tìm mã PIN trong Ghi chú        |
|          hoặc Ngày kỷ niệm Lịch)               |
+------------------------------------------------+
```

- **Bảo mật & Thử thách**:
  - Tích hợp thành phần bàn phím số PIN 4 chữ số dùng chung (`onRequestUnlock('lock_photos')`).
  - Nhập sai PIN làm rung lắc bàn phím và ghi nhận điểm nghi ngờ nếu vượt quá số lần cho phép.
  - Nhập đúng PIN mở khóa truy cập vào các bức ảnh selfie/chụp lén với người tình (`CLUE-PHOT-01`) hoặc quà kỷ niệm bất ngờ (`CLUE-PHOT-04`).

---

## Tương tác và trạng thái

| Trường hợp | Hiển thị / kết quả |
|---|---|
| Không có ảnh | Hiển thị thông báo “Chưa có ảnh” ở giữa màn hình. |
| Chạm vào ô ảnh/video | Mở ngay Trình xem ảnh toàn màn hình (PH2) trong $< 100\text{ms}$. |
| Chạm nút [ℹ️] hoặc vuốt lên | Mở Bảng thông tin chi tiết EXIF (PH3) dạng ngăn kéo trượt mượt mà. |
| Chạm đúp / chụm mở | Phóng to ảnh để kiểm tra vùng phản chiếu hoặc góc khuất (Forensic Hotspot). |
| Nhấn giữ ảnh/thẻ EXIF $\ge 380\text{ms}$ | Mở ảnh chụp mờ qua `UniversalEvidenceModal` và `StoryEvidenceTarget`. Rung haptic 50ms. |
| Chạm ngắn / cuộn trước 380ms | Hủy thao tác nhấn giữ; cuộn lưới ảnh bình thường; không mở modal bằng chứng. |
| Ảnh thường vs Ảnh có manh mối | Tương tác hoàn toàn đồng nhất; không có viền sáng hay nhãn phân biệt trước. |
| Thao tác Chỉnh sửa / Xóa / Chia sẻ | Báo toast nhẹ: "Không khả dụng trong chế độ điều tra". Không làm thay đổi dữ liệu gốc. |
| Mở Mục bị ẩn | Hiện bàn phím mã số PIN. Mở khóa thành công hiển thị album ẩn và lưu trạng thái phiên chơi. |

---

## Ràng buộc giao diện & Hệ thống

- Tái sử dụng khung điện thoại iOS, thanh trạng thái Dynamic Island và modal bằng chứng dùng chung.
- Kích thước vùng bấm điều khiển tối thiểu $44 \times 44\text{px}$.
- Biểu tượng sử dụng Ionicons (`react-icons/io5`) hoặc SVG đồng bộ; tuyệt đối không dùng emoji trần làm icon hệ thống.
- Bố cục, tỷ lệ màu sắc và thẻ thông số EXIF tuân thủ chính xác 2 hình ảnh tham chiếu thực tế.

