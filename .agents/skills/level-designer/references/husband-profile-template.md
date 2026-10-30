---
husband: <tên_chồng> # ví dụ: hoang (thư mục: husband-hoang)
---

# Hồ sơ Nhân vật & Vũ trụ Cốt truyện - Người Chồng: <Họ và Tên>

> **Thẩm quyền Tác giả**: Được thiết kế bởi `level-designer`. Là nguồn dữ liệu gốc duy nhất (SSOT) cho chân dung người chồng, ảnh đại diện gốc, mỏ neo thông tin người vợ và dàn nhân vật phụ cố định xuyên suốt các màn chơi (`level-01`, `level-02`, `level-03`).

---

## 1. Chân dung Người Chồng (Husband Persona & Avatar SSOT)

- **Mã định danh (`husbandId`)**: `husband_<tên_chồng>`
- **Họ và Tên Pháp lý**: <ví dụ: Nguyễn Huy Hoàng (không dấu trên Bank: `NGUYEN HUY HOANG`)>
- **Biệt danh Thường gọi**: <ví dụ: Hoàng, Anh Hoàng IT>
- **Tuổi & Năm sinh**: <ví dụ: 29 tuổi>
- **Nghề nghiệp & Chức danh**: <ví dụ: Senior Full-stack Developer / Tech Lead tại Technosoft>
- **Số điện thoại Cá nhân**: `<ví dụ: 0901236789>`
- **Nhóm tuổi & Thế hệ (`generationTag`)**: `<Gen Z (20-25) | Millennial (26-35) | Gen X (36+)>`
- **Khẩu khí & Văn phong Chat (`chatTone`)**: <Mức độ viết tắt, từ lóng nghề nghiệp/mạng xã hội, cách nhắn tin với vợ so với đồng nghiệp/bạn bè>
- **Thói quen Ứng dụng & Lối sống (`lifestyleHabits`)**: <Ứng dụng hay dùng, thói quen chi tiêu, lập quỹ đen, giờ giấc sinh hoạt>
- **Tính cách Đặc trưng**: <Vẻ ngoài với vợ và tật xấu che giấu>
- **Ảnh Đại diện Chuẩn (`husbandAvatar`)**:
  - **Đường dẫn Asset**: `<ví dụ: public/assets/avatars/hoang/husband_hoang.png>`
  - **Mô tả Chân dung & Bối cảnh Ảnh**: <Kiểu ảnh đời thường tự nhiên, trang phục, biểu cảm, góc chụp cố định để tái sử dụng xuyên suốt các màn>

---

## 2. Hồ sơ Người Vợ & Mỏ neo Pháp y ("Nóc Nhà" Profile & Physical Anchors)

*Dữ liệu mỏ neo giúp người chơi đối chiếu và phát hiện điểm bất thường (sai cỡ quần áo/giày, dị ứng món ăn, sai địa chỉ nhà, sai ngày kỷ niệm) mà không cần đoán mò:*

- **Tên Hiển thị trong Máy Chồng**: <ví dụ: "Vợ Yêu", "Nóc Nhà">
- **Họ tên & Tuổi**: <ví dụ: Trần Minh Thư, 28 tuổi (nhỏ hơn chồng 1 tuổi - xưng hô chuẩn: `anh` - `em`)>
- **Nghề nghiệp**: <ví dụ: Nhân viên Nhân sự / Kế toán>
- **Địa chỉ Nhà Chung**: <ví dụ: Căn hộ B1208, Chung cư Rivera Park, Quận 10>
- **Kích cỡ Trang phục & Giày dép**: <ví dụ: Áo/váy size M, giày size 37>
- **Sở thích & Dị ứng Đồ ăn/Thức uống**: <ví dụ: Dị ứng hải sản có vỏ, không uống được trà sữa matcha, chỉ uống cà phê đen ít đường>
- **Mốc Kỷ niệm & Quy tắc Gia đình**: <ví dụ: Kỷ niệm ngày cưới 20/11; nộp lương 90% vào tài khoản chung mỗi ngày 05 hàng tháng>

---

## 3. Vòng tròn Nhân vật Cố định Xuyên Màn (Recurring Cast)

*Các nhân vật xuất hiện lặp lại qua nhiều màn chơi của cùng người chồng để tạo cảm giác chiếc điện thoại sống động, liền mạch:*

| Character ID | Họ tên & Tên lưu trong máy | Tuổi & Giới tính | Quan hệ với Chồng | Khẩu khí & Văn phong | Ảnh Đại diện (`avatarPath`) |
|---|---|---|---|---|---|
| `char_wife` | <Tên vợ> | <Tuổi, Nữ> | Vợ hợp pháp | <Khẩu khí> | `<path>` |
| `char_mom` | <Mẹ ở quê> | <Tuổi, Nữ> | Mẹ ruột | Chính tả chuẩn mực, không viết tắt | `<path>` |
| `char_best_friend` | <Bạn thân> | <Tuổi, Nam> | Bạn chí cốt cùng tuổi | Thoải mái, suồng sã | `<path>` |
| `char_boss` | <Sếp> | <Tuổi, Nam/Nữ> | Sếp trực tiếp (lớn tuổi hơn) | Lịch sự công sở | `<path>` |

---

## 4. Lộ trình Tiến hóa Chiêu trò Qua Các Màn (Cross-Level Escalation Arc)

| Màn chơi | Chủ đề Kịch bản | Cấp độ Tinh vi & Thay đổi Hành vi Che giấu | Kết luận (`verdict`) |
|---|---|---|---|
| **Màn 1** | <Tên/chủ đề màn 1> | <Ngụy trang danh bạ cơ bản, lộ sơ hở qua đơn hàng và biên lai ăn tối; 0 khóa> | `<cheating \| innocent \| sugar_relationship>` |
| **Màn 2** | <Tên/chủ đề màn 2> | <Rút kinh nghiệm màn 1: xóa/đổi cách liên lạc, đặt 1 mã khóa PIN ứng dụng, giấu qua kênh công việc/giao hàng> | `<cheating \| innocent \| sugar_relationship>` |
| **Màn 3** | <Tên/chủ đề màn 3> | <Cảnh giác cao độ: 2 lớp khóa bảo mật, ảnh phản chiếu, hóa đơn ẩn, điều hướng qua nhiều ứng dụng> | `<cheating \| innocent \| sugar_relationship>` |

