# Thiết kế truyện trước ứng dụng

> SSOT cho quy trình xây dựng hồ sơ người chồng, kịch bản tương tác theo dòng thời gian (`level-XX-storyboard.md`), ánh xạ dấu vết ứng dụng (`level-XX.md`) và dữ liệu thoại (`level-XX-phone-data.md`); dùng cùng [quy tắc thiết kế](level-design-rules.md). Áp dụng cho ngoại tình, quan hệ chu cấp và kết luận vô tội.

## 0. Hồ sơ Gốc Người Chồng, Mỏ neo Người Vợ & Dàn Nhân vật Cố định (`husband-profile.md`)

Trước khi thiết kế Màn 1 của một người chồng mới (hoặc khi tái sử dụng cho Màn 2, Màn 3):
1. **Định nghĩa 1 lần, Tái sử dụng Xuyên suốt**: Mỗi thư mục `stories/husband-<name>/` có duy nhất một file [husband-profile.md](husband-profile-template.md) kèm ảnh đại diện gốc của người chồng. Các màn `level-01`, `level-02`, `level-03` bắt buộc tham chiếu file này, không định nghĩa lại hay làm sai lệch tuổi tác, SĐT, nghề nghiệp, khẩu khí của người chồng.
2. **Mỏ neo Pháp y Người Vợ ("Nóc Nhà" Physical Anchors)**: Ghi rõ tuổi của vợ, địa chỉ nhà chung, cỡ quần áo/giày dép, món ăn yêu thích/dị ứng, ngày kỷ niệm cưới và quy tắc tài chính gia đình trong `husband-profile.md`. Nhờ đó, các manh mối lệch size quà tặng, giao hàng sai địa chỉ hoặc đặt món vợ dị ứng ở các màn sau có căn cứ suy luận công bằng.
3. **Vòng tròn Nhân vật Cố định & Lộ trình Tiến hóa (Recurring Cast & Escalation Arc)**: Giữ nguyên nhân khẩu học và avatar của các nhân vật cố định (Vợ, Mẹ ruột, Bạn thân, Sếp) qua các màn. Cấp độ che giấu của chồng phải tiến hóa hợp lý từ Màn 1 (ngụy trang danh bạ đơn giản, 0 khóa) -> Màn 2 (rút kinh nghiệm, cài 1 khóa PIN, giấu qua kênh công việc/giao nhận) -> Màn 3 (2 khóa bảo mật, dấu vết gián tiếp đa tầng).

## 1. Storyboard Dòng thời gian, Nhân khẩu học & Sơ đồ Mermaid (`level-XX-storyboard.md`)

Mỗi màn chơi bắt đầu bằng việc thiết kế file [level-XX-storyboard.md](storyboard-template.md) trước khi viết đặc tả kỹ thuật và dữ liệu thoại:
1. **Nhân khẩu học Nghi phạm & Nhân vật (`Suspect & Cast Personas`)**: Xác định rõ họ tên thật, tuổi tác, giới tính, nghề nghiệp, mối quan hệ với người chồng, vỏ bọc ngụy trang và khẩu khí của toàn bộ nghi phạm (cả thủ phạm lẫn bẫy nghi ngờ) và người liên hệ trong màn.
2. **Kịch bản Tương tác Theo Dòng thời gian (`Chronological Interaction Storyboard`)**: Liệt kê theo trình tự thời gian từ quá khứ gần đến lúc kiểm tra máy (`D-Day`):
   - Ai tương tác với người chồng (`EVT-*` cho sự kiện vụ án, `ACT-*` cho sinh hoạt đời thường/giải oan).
   - Họ làm gì cùng nhau hoặc cho nhau (ăn uống, đi chơi, làm việc, chat, đặt khách sạn, mua sắm, chuyển khoản, gọi điện, nhận bưu phẩm...).
   - Địa điểm, vật phẩm trao tay (ai giữ trước -> ai giữ sau) và **tương tác qua ứng dụng nào (`appId`)**.
3. **Hai Sơ đồ Mermaid Bắt buộc trong `level-XX-storyboard.md`**:
   - **Sơ đồ 1 - Timeline Cốt truyện & Dấu vết Ứng dụng (`Mermaid Story Timeline Diagram`)**: Minh họa luồng sự kiện theo trình tự thời gian và ứng dụng ghi nhận dấu vết.
   - **Sơ đồ 2 - Mạng lưới Kết nối `ALL_SUSPECTS -> ALIASES -> APPS -> CLUE_NODES` (`Mermaid Clue & Suspect Graph`)**: Bố cục 4 cột từ Trái sang Phải: Container toàn bộ nghi phạm (`ALL_SUSPECTS`) -> Vỏ bọc / định danh của nghi phạm (`ALIASES`) -> Ứng dụng xuất hiện (`APPS`) -> Các nút bản ghi manh mối (`CLUE_NODES`) với các cạnh nối trực tiếp giữa các manh mối (`Clue <--> Clue` qua SĐT/tên pháp lý, mâu thuẫn ngoại phạm cùng khung giờ, khớp vật phẩm/kỷ niệm tạo Smoking Gun hoặc giải oan) để phục vụ lập trình đồ thị `CaseKnowledgeGraph`.

## 2. Chuyển Storyboard thành Đặc tả (`level-XX.md`) & Dữ liệu Điện thoại (`level-XX-phone-data.md`)

- **Chuẩn gói 3 file mỗi màn chơi (+ 1 file `husband-profile.md` dùng chung)**:
  1. `level-XX-storyboard.md`: Nhân khẩu học nghi phạm, bảng tương tác theo dòng thời gian, sơ đồ Mermaid Timeline và sơ đồ Mermaid Clue-to-Clue / Clue-to-Suspect.
  2. `level-XX.md`: Hợp đồng đối chất, phân bổ ứng dụng, mồi nhử thông báo, bảng `nodes[]` & `edges[]` (`CaseKnowledgeGraph`), khóa giải đố và tiêu chí bàn giao.
  3. `level-XX-phone-data.md`: Toàn bộ kịch bản lời thoại và bản ghi ứng dụng trong phạm vi 2-3 ngày quanh `D-Day` (chiếm ít nhất 75% bản ghi sinh hoạt/giải oan ở mỗi danh sách có clue). Tuyệt đối không tạo file `level-XX-history.md`; dữ liệu quá khứ sâu do developer nạp từ shared mock fixtures.
- **Chuẩn Xưng hô Tiếng Việt Tự nhiên Theo Nhân khẩu học (`Standard Vietnamese Pronouns`)**:
  - Khi sinh lời thoại, tin nhắn chat, SMS, ghi chú, email hoặc lời nhắn chuyển khoản trong `level-XX-phone-data.md`, toàn bộ nhân vật bắt buộc tuân thủ chuẩn xưng hô tiếng Việt tự nhiên (`anh`, `em`, `chị`, `cô`, `chú`, `bác`, `con`, `cháu`, `mày`, `tao`, `sếp`, `mình`, `bạn`) khớp chính xác với độ tuổi và vai vế nhân khẩu học đã định nghĩa trong `husband-profile.md` và `level-XX-storyboard.md`.
  - Ví dụ: Nếu người chồng (29 tuổi) nhắn tin cho người lớn tuổi hơn (chị gái 33 tuổi, sếp 38 tuổi, đồng nghiệp đàn chị 32 tuổi), đại từ tự xưng của chồng BẮT BUỘC là `em` và gọi đối phương là `chị` / `anh` / `sếp`. Nếu nhắn cho mẹ/bố, chồng xưng `con`. Tuyệt đối không để xảy ra lỗi xưng hô ngược vai vế hoặc mâu thuẫn ngay trong cùng một câu (như gọi `"Anh Tuấn ơi"` nhưng lại tự xưng `"giúp anh nhé"`).
- **Thông báo Shopoo khớp lịch sử đơn hàng**: Khi màn có dữ liệu `ecommerce`, soạn thông báo cập nhật đơn từ các sự kiện của đơn hàng đã xác định, gồm cả đơn sinh hoạt/giải oan; ghi trong `level-XX-phone-data.md`. Mỗi thông báo loại `order` phải chỉ rõ Record ID của đơn nguồn và `orderId` theo hợp đồng app hiện có. Nội dung phải khớp sản phẩm, shop, mã vận đơn, người nhận, địa chỉ và số tiền khi được nhắc; thời điểm thông báo không trước sự kiện tương ứng, không sau lúc kiểm tra máy.
- **Chuyển thành Đồ thị Tri thức (System Scope 1C)**: Mọi sự kiện và dấu vết phải được ánh xạ thành mạng lưới Nodes (`suspect`, `alias`, `bridge_id`, `record_clue`, `timeline_slot`) và Edges (`uses_alias`, `bridges_identity`, `occurred_at`, `contradicts_alibi`) trong `level-XX.md`, đồng bộ 100% với sơ đồ Mermaid tại `level-XX-storyboard.md`.

## 3. Kết nối rất tinh tế, nhưng có thể kiểm chứng

- Gợi liên tục bằng vài chi tiết đời thường: vật chuyển tay, thói quen có tiền lệ, lịch hẹn, giờ xuất hiện và hậu quả. Chi tiết được nhắc lại vì nhân vật cần xử lý việc đó, không phải để rải mật hiệu cho người chơi.
- Tách **gợi hướng** khỏi **xác thực**. Vật, màu, món ăn, chữ cái đầu hoặc ba số cuối chỉ gợi kiểm tra tiếp. Nhận diện duy nhất cần dữ liệu phân biệt được từ nguồn độc lập, như số liên hệ đầy đủ và tên pháp lý đối chiếu được với hồ sơ người chơi đọc thấy.
- Với mỗi phép nối, điền hợp đồng xác thực trong bảng mục 5.2 của [mẫu hồ sơ](story-spec-template.md): Record ID của hai nguồn, trường/nội dung nhìn thấy dùng đối chiếu, tập bản ghi hoặc tin nhắn tối thiểu phải ghim, mức kết luận được phép và trường hợp đạt/không đạt.
- Dây chỉ được xác thực từ nội dung thực tế của các thẻ đã ghim. Ghim tên hội thoại không thu thập nội dung cả luồng; tin nhắn chưa ghim, cùng Conversation ID, Clue ID hoặc ánh xạ danh tính của tác giả không thay thế bằng chứng.
- Mỗi quan hệ có ít nhất một ca đạt và một ca không đạt. Xét tin không liên quan trong cùng hội thoại, chỉ ghim tên liên hệ, thiếu hoặc khác định danh; thêm/bỏ tin quyết định phải thay đổi trạng thái xác thực tương ứng.
- Thông tin đời thường trong từng nguồn đứng riêng vẫn có nghĩa. Toàn chuỗi mới thu hẹp kết luận; không dùng thoại tự khai quan hệ, tự kể che giấu, nhãn nghi phạm hay thông báo tiết lộ đáp án.
- Để người chơi đọc được giải thích vô tội của bẫy nghi ngờ trước đối chất.
- Lập danh mục riêng cho mọi người, bí danh, nhóm và tài khoản dịch vụ nhìn thấy, kể cả sinh hoạt/giải oan tại mục 2.1 của `level-XX.md`.

## 4. Đọc duyệt ngữ nghĩa trước bàn giao

Đọc theo dòng thời gian thật từ `level-XX-storyboard.md` và đi ngược từ thông báo khởi phát:

- Chuẩn bị trước hành động, giao hàng trước lấy hàng, quyền giữ/trao vật rõ; các cuộc gặp không mâu thuẫn. Ghi khoảng trống nếu chưa kiểm chứng được quãng di chuyển, không tự đặt thời gian hành trình.
- Ngày, giờ, tên, số, địa điểm, tiền, trạng thái và đồ vật khớp giữa `husband-profile.md`, `level-XX-storyboard.md`, `level-XX.md` và `level-XX-phone-data.md`; không có dữ liệu sau lúc kiểm tra máy.
- Kiểm tra toàn bộ lời thoại tiếng Việt trong `level-XX-phone-data.md`: đại từ xưng hô (`anh/em/chị/con/mày/tao...`) và khẩu khí viết tắt phải khớp 100% với độ tuổi, vai vế của từng nhân vật đối thoại với người chồng.
- Nếu có `ecommerce`, đối chiếu từng thông báo với đơn nguồn theo **Thông báo Shopoo khớp lịch sử đơn hàng** ở mục 2.
- Ít nhất một đường giải đầy đủ qua dữ liệu nhìn thấy; người chơi có thể bắt đầu từ thứ tự khác. Không phụ thuộc ảnh chưa tạo hoặc trường/màn chưa tồn tại.
- Khi sửa bản ghi hoặc ý nghĩa clue, truy ngược sơ đồ Mermaid trong `level-XX-storyboard.md`, các cạnh `edges[]`, `requiredSmokingGunEdgeIds`, gợi ý, lời đối chất và kết thúc phụ thuộc; cập nhật đồng bộ trên cả 3 file của màn chơi.

Script chỉ kiểm tra cấu trúc, danh mục và một số cụm từ spoil. PASS không chứng minh tính tinh tế, nhân quả hoặc khả năng giải; phải đọc duyệt thủ công và báo phần chưa kiểm chứng.

## 5. Đọc duyệt khi triển khai hoặc sửa dữ liệu truyện

Lead frontend thực hiện trước khi báo hoàn thành khi thay đổi bản ghi truyện, preview bằng chứng, bí danh, ánh xạ clue hoặc đồ thị, kể cả thay đổi chỉ ở JSON/fixture. Phạm vi là các đường bằng chứng bị ảnh hưởng theo mục 4, dùng hợp đồng mục 3 làm căn cứ; không yêu cầu thiết kế lại toàn màn.

1. Đối chiếu bộ 3 file đã duyệt (`level-XX-storyboard.md`, `level-XX.md`, `level-XX-phone-data.md`) và `husband-profile.md` với dữ liệu runtime, màn nguồn, preview và thẻ đã ghim; kiểm tra nội dung dùng xác thực thực sự đọc và ghim được qua UI. Báo lệch hồ sơ cho `level-designer`, không tự sáng tác cầu nối để hợp thức hóa code.
2. Chạy các ca đạt/không đạt của quan hệ bị sửa qua luồng ghim và nối dây; để lại kiểm thử hồi quy tập trung cho cả hai kết quả, gồm thêm/bỏ tin quyết định nếu là thẻ hội thoại.
3. Đối chiếu danh mục đối tượng với bộ chọn trên bảng đang ghim, cả nhóm và liên hệ thường; tên hiển thị và việc gộp phải giữ ranh giới thông tin người chơi biết.
4. Khôi phục bảng đã lưu trước thay đổi và kiểm tra xác thực lại khi tải hoặc thay đổi nội dung ghim. Dây mất căn cứ phải hết trạng thái xác thực và điểm bằng chứng; giữ dữ liệu ghim/vị trí còn hợp lệ, không xóa tiến trình để che lỗi.
5. Báo các đường đã kiểm tra, kết quả test và phần UI/lưu-khôi phục chưa kiểm chứng. Kiểm thử dữ liệu hoặc build không thay cho kiểm tra tương tác trình duyệt.
