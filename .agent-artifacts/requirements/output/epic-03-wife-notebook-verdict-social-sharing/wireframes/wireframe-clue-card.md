---
type: ASCII Wireframe
status: draft
scope: project-wide
---

# Thẻ manh mối và hoàn tác

## Người dùng, mục tiêu và phạm vi

- Người chơi quản lý thông tin đã thu thập trong Sổ Tay Bắt Ghen.
- Một cuộc trò chuyện có một thẻ; từng tin nhắn đã chọn nằm trong phần nội dung.
- Áp dụng cho bảng manh mối và khay manh mối trên giao diện điện thoại.
- Trạng thái: đề xuất chờ duyệt. Ví dụ bên dưới chỉ minh họa bố cục, không bổ sung dữ liệu vụ án.
- Tham chiếu: [Thiết kế Sổ Tay Bắt Ghen](../../../project-knowledge-base/solution-context/apps/phone-os/evidence-board/app-design.md).

## 1. Thẻ chỉ ghim người hoặc bí danh

```text
+------------------------------------------------+
| [Zola]  Anh Tuấn                                |
+------------------------------------------------+
```

- Không hiển thị tin nhắn gần nhất, thời gian ghim hay phần nội dung trống.
- Mặc định ẩn toàn bộ nút thao tác. Chạm thẻ để chọn và hiện nút; chạm ngoài thẻ để ẩn, chạm thẻ khác để chuyển lựa chọn.
- Chạm nút không kích hoạt kéo thẻ, đổi lựa chọn hoặc mở nguồn ngoài ý muốn.
- Tên cửa hàng thay cho tên người khi ghim cuộc trò chuyện trên Shopoo.

## 2. Thẻ có nhiều tin nhắn đã ghim

```text
+------------------------------------------------+
| [Zola]  Anh Tuấn                                |
|------------------------------------------------|
| • 28/09 · 12:10: "Nội dung tin nhắn             |
|   thứ nhất..."                                  |
|                                                |
| • 28/09 · 12:15: "Nội dung tin nhắn             |
|   thứ hai..."                                   |
+------------------------------------------------+
```

- Mỗi tin nhắn tối đa hai dòng, bao gồm ngày giờ; nội dung dài kết thúc bằng dấu ba chấm.
- Từng mục dùng thời gian của chính tin nhắn, không dùng thời gian ghim hoặc thời gian của cuộc trò chuyện.
- Trạng thái chưa chọn không có nút thao tác ở cả cấp thẻ và cấp tin nhắn.
- Truy cập nguồn để đọc toàn bộ nội dung. Không cắt dữ liệu đã lưu.
- Một tin nhắn duy nhất dùng cùng bố cục với một dấu đầu dòng.

## 3. Thẻ được chọn sau khi chạm

```text
+------------------------------------------------+
| [Zola] Anh Tuấn              [Đến chat] [Xóa]   |
|------------------------------------------------|
| • 28/09 · 12:10: "Nội dung tin nhắn     [Xóa]   |
|   thứ nhất..."                                  |
|                                                |
| • 28/09 · 12:15: "Nội dung tin nhắn     [Xóa]   |
|   thứ hai..."                                   |
+------------------------------------------------+
```

- Chỉ sau khi chạm chọn thẻ mới hiện hai nút cấp thẻ và các nút xóa từng tin nhắn. Không dùng trình đơn “Tùy chọn”.
- Cấp thẻ có đúng hai nút: “Đến chat” mở vị trí cuộc trò chuyện gốc; “Xóa” bỏ ghim toàn bộ thẻ và các mục bên trong.
- Thẻ chỉ có tên hiển thị cùng hai nút khi được chọn, không thêm phần nội dung.
- Các nhãn trong sơ đồ biểu thị biểu tượng có tên truy cập tương ứng khi triển khai.
- Không xóa cuộc trò chuyện gốc. Không ảnh hưởng thẻ khác của cùng một người.

## 4. Thao tác của từng tin nhắn

```text
+------------------------------------------------+
| • 28/09 · 12:10: "Nội dung tin nhắn     [Xóa]   |
|   thứ nhất..."                                  |
+------------------------------------------------+
```

- Mỗi mục chỉ có một nút “Xóa”, chỉ hiện khi thẻ được chọn. Không có nút đi tới nguồn hoặc trình đơn riêng ở cấp mục.
- Chỉ gỡ mục được chọn. Các tin nhắn khác vẫn nằm trong thẻ; cả hai cấp xóa đều có “Hoàn tác”.
- Gỡ tin nhắn cuối cùng: giữ thẻ chỉ có tên nếu người chơi từng ghim riêng cuộc trò chuyện/người đó; nếu không, gỡ thẻ rỗng.

## 5. Sau khi bỏ ghim một tin nhắn

```text
+------------------------------------------------+
| [Zola] Anh Tuấn              [Đến chat] [Xóa]   |
|------------------------------------------------|
| • 28/09 · 12:15: "Nội dung tin nhắn     [Xóa]   |
|   thứ hai..."                                   |
+------------------------------------------------+

+------------------------------------------------+
| Đã bỏ ghim 1 tin nhắn.           [Hoàn tác]     |
+------------------------------------------------+
```

- Hoàn tác khôi phục tin nhắn đúng vị trí trong danh sách, thời gian và nguồn gốc.
- Nếu thao tác đã làm thẻ rỗng biến mất, hoàn tác khôi phục cả thẻ và các liên kết bị ảnh hưởng.

## 6. Sau khi bỏ ghim toàn bộ thẻ

```text
+------------------------------------------------+
|                 BẢNG MANH MỐI                  |
|                                                |
|       Các thẻ còn lại giữ nguyên vị trí.        |
|                                                |
+------------------------------------------------+

+------------------------------------------------+
| Đã bỏ ghim thẻ Anh Tuấn.         [Hoàn tác]     |
+------------------------------------------------+
```

- Hoàn tác khôi phục toàn bộ tin nhắn, trạng thái ghim riêng cuộc trò chuyện, vị trí thẻ, trạng thái trong khay và các liên kết bị ảnh hưởng.
- Thẻ chỉ có tên cũng được bỏ ghim và hoàn tác theo cùng cơ chế.
- Đề xuất không có hộp xác nhận bổ sung; thao tác có thể hoàn tác ngay.
  - Ưu điểm: ít bước, sửa được thao tác nhầm.
  - Hạn chế: cần thông báo hoàn tác dễ thấy và hỗ trợ thao tác liên tiếp.

## 7. Hoàn tác và các trạng thái biên

- Cả hai cấp gỡ đều hiển thị thông báo có nút “Hoàn tác” tại vùng cố định của sổ tay, không gắn với thẻ vừa biến mất.
- Đề xuất thời gian hiển thị: 8 giây; tạm dừng khi thông báo có tiêu điểm hoặc con trỏ đang nằm trên thông báo.
- Khi gỡ liên tiếp, xếp hàng các thông báo theo thứ tự; không thay thế thông báo còn hiệu lực bằng thông báo mới.
- Hoàn tác chỉ khôi phục phần trạng thái bị thao tác đó ảnh hưởng, không ghi đè chỉnh sửa khác xảy ra sau đó.
- Nếu đã ghim lại cùng tin nhắn/thẻ trước khi hoàn tác, hợp nhất theo định danh; không tạo bản sao.
- Chuyển vụ án hoặc đặt lại phiên chơi sẽ hủy các thao tác hoàn tác đang chờ.
- Khi sổ tay trống, hiển thị “Chưa có manh mối đã ghim.”; thông báo hoàn tác vẫn truy cập được.
- Không cần trạng thái tải riêng cho thao tác gỡ cục bộ. Nếu lưu thất bại, khôi phục trạng thái trước thao tác và báo “Chưa lưu được thay đổi. Vui lòng thử lại.”

## Ràng buộc và điểm chờ duyệt

- Tái sử dụng cấu trúc thẻ, khay và nguồn manh mối hiện có.
- Định danh người/bí danh luôn là tiêu đề; không thay bằng danh tính thật chưa được xác minh.
- Không dùng nút ghim thường trực hoặc gắn thao tác thu thập bằng chứng vào thanh điều hướng.
- Biểu tượng triển khai dùng Ionicons; vùng tương tác tối thiểu 44 × 44, không chồng lên nội dung hoặc vùng kéo thẻ.
- Ưu tiên màn hình điện thoại: tiêu đề co giãn, hai nút cấp thẻ giữ vùng chạm riêng; mỗi mục dành cột riêng cho nút xóa. Không dùng nút thu nhỏ để nhét thêm nội dung.
- Giới hạn hai dòng áp dụng cho phần văn bản từng mục; nút không che ngày giờ hoặc nội dung. Không tràn ngang trên màn hình hẹp.
- Bảng manh mối có thu phóng phải giữ vùng chạm nút đủ lớn trên màn hình thực tế. Nếu cần, hiển thị thẻ đang chọn ở lớp thao tác không bị thu nhỏ, giữ nguyên vị trí và liên kết trên bảng.
- Hiện nút không làm dịch chuyển thẻ hay thay đổi vị trí liên kết; dành sẵn vùng thao tác trong bố cục. Không phụ thuộc thao tác rê chuột.
- Thiếu ngày/giờ: chỉ hiện phần đã biết, không suy ra thời gian chính xác.
- Thời hạn hoàn tác 8 giây và cách xếp hàng thông báo là đề xuất chờ duyệt cùng bố cục.
- Chỉ tạo HTML sau khi bản ASCII này được duyệt.
