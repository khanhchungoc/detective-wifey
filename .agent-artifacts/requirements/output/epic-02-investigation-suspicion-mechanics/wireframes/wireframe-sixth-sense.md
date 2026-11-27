---
type: Wireframe
status: signed-off
revision: 2
signed_off_at: "2026-10-21"
description: "Giác quan thứ 6: biểu tượng, gợi ý ngắn và vòng chờ."
tags: [wireframe, hint, sixth-sense, us-022]
---

# Giác quan thứ 6

## Người dùng, mục tiêu và bối cảnh

Người chơi cần định hướng tiếp theo. US-022; web, công cụ trong sổ tay cho cả màn tập và màn thường. Bản lần 2 đã được duyệt ngày 21/10/2026.

## Nguồn đối chiếu

[Khám phá](../../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md) · [Thiết kế sổ tay](../../../../project-knowledge-base/solution-context/apps/phone-os/evidence-board/app-design.md) · [Thiết kế hệ điều hành](../../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md) · [Chuyển động](../../../../project-knowledge-base/solution-context/design-system/behaviors-motion.md).

## Danh sách màn hình

Sẵn sàng, nhận gợi ý, chờ 30 giây, đã thu thập đủ, không tạo được gợi ý.

## Bố cục từng màn hình

    +------------------------------------------------+
    | [Đóng]              SỔ TAY                     |
    | [Linh cảm] Giác quan thứ 6       [Đối chất]    |
    |------------------------------------------------|
    | [Biểu tượng ứng dụng] Xem [tên ứng dụng].      |
    |                    [Về màn hình chính]         |
    |------------------------------------------------|
    | [Bảng điều tra hiện có]                        |
    +------------------------------------------------+

    [Linh cảm: sẵn sàng] --> [Vòng chờ + 00:30]
                         --> [Vòng chờ + 00:24]
                         --> [Linh cảm: sẵn sàng]

Nhãn trong ngoặc mô tả hình hoặc trạng thái, không thêm chữ lên giao diện. Không cần câu đếm ngược thứ hai.

## Biểu tượng, minh họa và chuyển động

- Công cụ: sparkles-outline; chờ: time-outline; về màn hình chính: home-outline; thử lại: refresh-outline. Dùng SVG Ionicons, giữ nhãn và tên truy cập.
- Khi học lần đầu: ngón tay minh họa chạm nút, tối đa hai lượt; không tự yêu cầu trợ giúp. Xem lại minh họa theo vùng hướng dẫn Màn 0.
- Có gợi ý: biểu tượng ứng dụng phản hồi nhẹ tối đa hai lượt rồi giữ dấu tĩnh. Chỉ làm nổi ứng dụng sau yêu cầu chủ động, không làm nổi nội dung đúng trong ứng dụng.
- Vòng chờ biểu diễn thời gian còn lại, luôn có số giây; không cần người chơi xem hết hoạt ảnh.
- Giảm chuyển động: dấu tĩnh và số giây, không nhấp nháy hoặc vòng chạy. Không đọc từng giây qua công cụ hỗ trợ.

## Tương tác và trạng thái

| Trạng thái | Nội dung ngắn | Hành vi |
|---|---|---|
| Sẵn sàng | [Linh cảm] Giác quan thứ 6 | Một yêu cầu mỗi lần; miễn phí |
| Có manh mối chưa ghim | [Ứng dụng] Xem [tên ứng dụng]. | Lấy mục tiêu hợp lệ của màn đang chơi; về màn hình chính, không tự mở ứng dụng |
| Đang chờ | [Vòng chờ] 00:24 | 30 giây ở mọi màn; khóa nút yêu cầu mới, cho tiếp tục điều tra |
| Đã thu thập đủ, chưa giải xong | [Sổ tay] Xem lại các mối liên hệ. | Không nêu cặp thẻ đúng; lời nhắc này cũng tính là dùng trợ giúp và bắt đầu chờ |
| Dữ liệu lỗi | Chưa có gợi ý. [Thử lại] | Không giả định đã tìm hết; không tính lượt dùng hoặc bắt đầu chờ |
| Đã kết thúc màn | Công cụ không hoạt động | Dùng thao tác kết quả, chơi lại hoặc chuyển màn hiện có |

## Ràng buộc đã duyệt

- Giữ hạn chờ theo thời gian thực sau yêu cầu hợp lệ, qua đóng/mở sổ tay, đổi màn hình và tải lại. Chạm liên tục không đặt lại thời gian.
- Thu thập mục tiêu thì xóa dấu cũ, không tự gợi ý tiếp. Chuyển màn không mang mục tiêu hay dấu của màn cũ sang.
- Giữ bảng và tiêu điểm khi hiện phản hồi. Không thêm nút trợ giúp nổi trên ứng dụng hoặc làm lộ đáp án.
- Các quy tắc điều hướng, tính lượt dùng, lỗi và lưu hạn chờ đã được duyệt; thời gian chờ là 30 giây.
- [Bước thực hành trong Màn 0](../../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-level-0-deduction-completion.md).

## Truy vết

[US-022](../us-022-giac-quan-thu-6-sixth-sense-app-badging-hint-engine.md). Phê duyệt bố cục và chuyển động không đồng nghĩa đã kiểm chứng hoạt ảnh thực tế.
