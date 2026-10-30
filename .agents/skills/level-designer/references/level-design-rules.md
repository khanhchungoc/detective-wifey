# Quy tắc Thiết kế Màn chơi & Nghệ thuật Cài cắm Manh mối Gián tiếp
## Level Design Rules & Subtle Forensic Narrative Guidelines

> **Thẩm quyền (Authority)**: Bộ quy chuẩn bắt buộc về thiết kế cốt truyện bắt ghen trào phúng, xây dựng câu đố gián tiếp không lộ liễu, và phân bổ manh mối cho game *Bắt được Tiểu tam* (Jealous Wife Detective Game).

---

**Quy trình tạo nội dung**: [Truyện trước ứng dụng](story-first-design.md) là SSOT cho hồ sơ người chồng (`husband-profile.md`), kịch bản tương tác dòng thời gian và sơ đồ Mermaid (`level-XX-storyboard.md`), ánh xạ dấu vết pháp y (`level-XX.md`) và dữ liệu thoại (`level-XX-phone-data.md`).

## 1. Nguyên tắc Cốt lõi: Bằng chứng Gián tiếp (Subtle Clues Invariant - Zero Obvious Spoilers)

> [!CAUTION]
> **CẤM TUYỆT ĐỐI MANH MỐI LỘ LIỄU (ANTI-OBVIOUSNESS RULE)**:
> Người chơi đóng vai thám tử suy luận. Nếu đọc tin nhắn hay thông báo mà thấy ngay câu trả lời thì trò chơi mất hoàn toàn tính hấp dẫn. Các dữ liệu mẫu trước đây (ví dụ: tin nhắn tự nhận *"vợ có kiểm tra máy không"*, *"váy ren đỏ mua trên mua sắm"*, thông báo ngân hàng *"chuyển 15tr tiền tiêu vặt cho bé"*, hay ghi chú *"Mã PIN là 2026"*) là **phản mẫu (anti-pattern) nghiêm trọng** và bị nghiêm cấm trong các màn chơi chính thức!
> 
> **Mọi màn, kể cả Màn 1**: manh mối phải gián tiếp. Giảm khó bằng chuỗi ngắn hơn, ít phép đối chiếu và gợi ý nguồn; không bằng thoại tự khai quan hệ hoặc thông báo nêu đáp án.

### 1.1. Quy tắc "Show, Don't Tell" (Gợi mở thay vì nói thẳng)
- **Không bao giờ dùng thoại trần thuật lộ liễu**:
  - ❌ **Cấm**: *"Tối nay vợ có kiểm tra máy không anh?"*, *"Chiếc váy ren đỏ hôm trước anh mua đẹp lắm á"*, *"Tháng này anh gửi tiêu vặt rồi nhé bé cưng"*.
  - ✅ **Chuẩn**: Nhân vật trò chuyện tự nhiên, dùng tiếng lóng, tiếng lóng công sở, hoặc ẩn ý đời thường:
    - Đối chiếu tiêu chí lời thoại và dấu vết tại [phương pháp, mục 3](story-first-design.md#3-kết-nối-rất-tinh-tế-nhưng-có-thể-kiểm-chứng).

### 1.2. Quy tắc Thông báo Mồi nhử (Notification Hook Invariant)
- **Thông báo đẩy (Notification Toast) chỉ được tạo điểm khả nghi / kích thích tò mò, KHÔNG BAO GIỜ được tiết lộ chân tướng hoặc số tiền / nội dung nhạy cảm**:
  - ❌ **Cấm**: Thông báo hiển thị *"Chuyển thành công 15.000.000 đ cho Tran Thu Trang. Lời nhắn: Tien tieu vat thang nay cho be"*.
  - ✅ **Chuẩn**: Thông báo giữ nguyên sự mơ hồ:
    - `banking • Biến động số dư`: *"Biến động số dư: -15.000.000 đ. Nhấn để xem chi tiết giao dịch."* (Buộc người chơi phải mở `banking` để điều tra người nhận).
    - `internet-messaging • Vừa xong`: *"Người liên hệ: Mai mình gửi lại nhé."* (Cần đọc ngữ cảnh trước đó để biết đang nhắc tới việc gì).

### 1.3. Mô hình "Tam giác Bằng chứng Gián tiếp" (Cross-App Forensic Triangle)
Một kết luận bắt ghen chuẩn mực bắt buộc phải được ghép từ **ít nhất 3 mảnh ghép gián tiếp** phân bổ ở các ứng dụng khác nhau:

Chọn nguồn theo [phương pháp truyện trước ứng dụng](story-first-design.md#3-kết-nối-rất-tinh-tế-nhưng-có-thể-kiểm-chứng), không gán sẵn hành vi cho một app hoặc mặc định ngân hàng là bằng chứng chốt hạ.

### 1.4. Quy tắc Ẩn mã PIN & Mật khẩu (Natural Breadcrumb Clues)
- ❌ **Cấm**: Ghi chú ghi thẳng *"Mã PIN thư mục ảnh ẩn: 2026"* hoặc *"Pass là ngày 1310"*.
- ✅ **Chuẩn**: Mã PIN phải là dữ liệu thực tế gắn liền với thói quen của người chồng:
  - Một ghi chú nhắc việc: *"Lịch phỏng vấn kỷ niệm ngày vào công ty (15/09)"* -> Mã PIN là `1509`.
  - Một bức ảnh chụp thẻ tập gym / thẻ cư dân có in số phòng `0412` -> Mã PIN là `0412`.
  - Một email xác nhận chuyến bay mã hiệu `VN-8291` -> Mã PIN là `8291`.

### 1.5. Khử lộ liễu trong Dữ liệu Pháp y (Decoupled Forensic Data)
- Trong các danh sách giao dịch ngân hàng hoặc hóa đơn thương mại, **không hiển thị nhãn lộ liễu** kiểu `"suspectName": "Hương Đồng Nghiệp"`.
- Ngân hàng chỉ hiển thị tên tài khoản pháp lý (ví dụ: `Nguyen Thi Thu Huong`). Người chơi phải tự đối chiếu với danh bạ, email, hoặc kênh chat công ty để nhận ra đây chính là "Hương Đồng Nghiệp".

### 1.6. Quy tắc Đồ thị Tri thức & Bóc trần Danh tính Gián tiếp (Zero-Spoiler Knowledge Graph Invariant)
- **Tách biệt Alias và Suspect**: Nhân vật ngụy trang ban đầu (như *"Anh Tuấn Thợ Điện"*) phải là một `AliasNode` (`isInitialDisguise: true`), KHÔNG ĐƯỢC gán sẵn liên kết trực tiếp tới `SuspectNode` (`suspect_huong`).
- **Cầu nối Độc lập Bắt buộc (`BridgeNode`)**: Người chơi bắt buộc phải thu thập và nối qua ít nhất một mã định danh khách quan (số điện thoại đầy đủ trong danh bạ / đơn hàng, tên tài khoản pháp lý không dấu) thì hệ thống mới kích hoạt bóc trần danh tính (`bridges_identity`).
- **Mâu thuẫn Ngoại phạm Cặp đôi (`Contradiction Edge`)**: Mọi bằng chứng nói dối ngoại phạm phải có 2 nút đối lập cùng mốc thời gian (ví dụ: Tin nhắn Zola khai *"vẫn đang họp công ty"* lúc 20:46 <-> Biên lai Bank quẹt thẻ quán ăn lúc 20:48) được nối bằng cạnh `contradicts_alibi`.

### 1.7. Quy tắc Nhất quán Danh bạ Hệ điều hành & Khẩu khí Vỏ bọc (Global Phonebook & Cross-App Disguise Consistency Invariant)
- **Hệ điều hành dùng chung danh bạ duy nhất (Single Unified Phonebook)**:
  - Trên điện thoại thực tế, `phone` (Danh bạ & Cuộc gọi), `messages` (SMS) và ứng dụng OTT của bên thứ ba (`internet-messaging` / Zola) **đều đồng bộ từ cùng một danh bạ hệ điều hành**.
  - **Không thể đặt tên alias khác nhau cho cùng một số điện thoại giữa các app**: Nếu số điện thoại `0988456234` được lưu trong Danh bạ là *"Anh Tuấn Thợ Điện"*, thì trong ứng dụng SMS và Zola số này BẮT BUỘC phải mang cùng một tên hiển thị *"Anh Tuấn Thợ Điện"*.
  - **Liên kết đồ thị thống nhất (Unified Alias Mapping)**: Bất kỳ bản ghi nào (SMS, Zola chat, Nhật ký cuộc gọi) xuất phát từ cùng một số điện thoại được ngụy trang đều đại diện cho cùng một vỏ bọc (`node_alias_tuan`), và việc người chơi ghim vỏ bọc từ SMS hay Zola đều có giá trị tương đương khi nối tới cầu nối số điện thoại (`BridgeNode`).
- **Nhất quán Khẩu khí & Persona của Vỏ bọc (Disguise Persona Alignment)**:
  - Khi người chồng cố tình lưu tên bồ nhí thành một vỏ bọc (ví dụ: "Anh Tuấn Thợ Điện" hoặc "Thợ Điện Minh Tuấn"), nếu người đó nhắn tin qua SMS hay Zola, nội dung tin nhắn và văn phong trao đổi phải phản ánh chân thực nhân vật thực sự đằng sau (hoặc giải thích được logic tại sao có tin nhắn đó). Tuyệt đối không để xảy ra lỗi tự mâu thuẫn đại từ trong cùng một câu (ví dụ: gọi đối phương là `"Anh Tuấn ơi"` nhưng lại xưng `"giúp anh nhé"`).

---

## 2. Nguyên tắc Sử dụng Tên Ứng dụng Chuẩn (Generic App Names Only - No Branded Parody Names)

> [!IMPORTANT]
> **LUÔN DÙNG TÊN ỨNG DỤNG GENERIC ĐÃ ĐỊNH NGHĨA TRONG WORKSPACE**:
> Tuyệt đối cấm sử dụng các tên thương hiệu parody (như Zola, VietPay, Shopoo, Grap, NetSurf, GeeMail, InkedLin, Tim) làm App ID.
> Toàn bộ tài liệu kịch bản, hồ sơ phân bổ, và mã khóa bắt buộc sử dụng **danh mục tên chuẩn (Generic App Names)** từ thư mục `.agent-artifacts/project-knowledge-base/solution-context/apps/`:

| App ID | Tên Ứng dụng Chuẩn | Loại Ứng dụng | Mục đích Pháp y Chính |
|---|---|---|---|
| `internet-messaging` | `internet-messaging` | Nhắn tin trực tuyến | Thoại mập mờ, tin nhắn tự xóa, gửi vị trí |
| `banking` | `banking` | Ngân hàng & Ví điện tử | Lịch sử chuyển tiền 1k, quỹ đen, tiền sinh hoạt |
| `ecommerce` | `ecommerce` | Mua sắm trực tuyến | Đơn hàng quà tặng, lệch kích cỡ (size S vs M/L) |
| `phone` | `phone` | Điện thoại | Nhật ký cuộc gọi, số liên hệ, danh bạ |
| `messages` | `messages` | SMS | Tin nhắn cá nhân, thông báo dịch vụ |
| `ride-hailing` | `ride-hailing` | Đặt xe & Giao đồ ăn | Điểm đến chuyến xe đêm, giao trà sữa khác lạ |
| `web-browser` | `web-browser` | Trình duyệt web | Lịch sử tìm kiếm đáng ngờ, tab ẩn danh |
| `photos` | `photos` | Thư viện ảnh | Thư mục ẩn, phản chiếu gương/kính, ảnh xe |
| `personal-notes` | `personal-notes` | Ghi chú cá nhân | Lịch trình mâu thuẫn, ghi nhớ ngày kỷ niệm |
| `email` | `email` | Hộp thư điện tử | Vé máy bay 2 người, xác nhận đặt phòng |
| `professional-network` | `professional-network` | Mạng việc làm | Tin nhắn tuyển dụng tán tỉnh, kỷ niệm công ty |
| `team-collaboration` | `team-collaboration` | Kênh làm việc nhóm | Trạng thái DND nửa đêm, kênh chat nội bộ |

---

## 3. Tiêu chuẩn Kịch bản Đậm chất Việt Nam, Chuẩn Xưng hô & Khẩu Khí Theo Persona

Tất cả các câu chuyện, tình huống và văn phong phải bám sát đời sống văn hóa mạng xã hội Việt Nam và **phù hợp tuyệt đối với nhân khẩu học (độ tuổi, giới tính, nghề nghiệp, thứ bậc quan hệ) của từng nhân vật**:

### 3.1. Chất liệu Cốt truyện Việt Nam, Mỏ neo Người Vợ & Lộ trình Tiến hóa
- Trào lưu *Tâm sự Eva*, hội nhóm *Vén khéo*, văn hóa công sở Việt Nam.
- **Tái sử dụng Hồ sơ Chồng, Mỏ neo Người Vợ & Nhân vật Cố định (`husband-profile.md`)**:
  - Mỗi người chồng có một hồ sơ `husband-profile.md` kèm ảnh đại diện gốc dùng chung cho cả 3 màn (`level-01`, `level-02`, `level-03`).
  - Các mỏ neo thực tế của người vợ (tuổi, size quần áo/giày dép, món ăn dị ứng, địa chỉ nhà chung, ngày kỷ niệm cưới) được định nghĩa trong `husband-profile.md` để người chơi có cơ sở khách quan phát hiện món quà/đơn hàng không dành cho vợ.
  - Dàn nhân vật cố định (Vợ, Mẹ ruột, Bạn thân, Sếp) giữ nguyên nhân khẩu học và cách xưng hô xuyên suốt các màn; chiêu trò che giấu của chồng nâng cấp dần từ Màn 1 đến Màn 3.
- Các chiêu trò ngụy trang điển hình:
  - Đặt tên danh bạ bồ nhí là thợ sửa chữa, sếp, tổng đài, đồng nghiệp.
  - Dùng lời nhắn chuyển khoản ngân hàng 1.000đ, 2.000đ để nhắn tin khi bị chặn.
  - Lập "Quỹ đen" trong ví con, tài khoản phụ ngân hàng.
  - Mượn cớ "đặt hàng hộ đồng nghiệp để áp mã Freeship Extra".
  - Lập tài khoản ảo trên diễn đàn, hội nhóm Sugar Baby / Sugar Daddy.

### 3.2. Quy tắc Xưng Hô Tiếng Việt Chuẩn Nhân Khẩu Học, Viết Tắt & Lối Sống Theo Persona
*Mọi tương tác tiếng Việt (tin nhắn chat, SMS, email, ghi chú, nội dung chuyển khoản) bắt buộc tuân thủ chuẩn xưng hô tiếng Việt tự nhiên dựa trên tuổi tác và vai vế giữa người chồng với người đối thoại:*

1. **Quy tắc Xưng hô Tiếng Việt Tự nhiên Theo Độ tuổi & Vai vế (`Standard Vietnamese Pronouns`)**:
   - **Với người lớn tuổi hơn chồng hoặc bậc bề trên**:
     - Nhắn với đồng nghiệp đàn anh/đàn chị, sếp lớn tuổi hơn, chị gái/anh trai, hoặc người làm dịch vụ lớn tuổi hơn: Chồng BẮT BUỘC tự xưng là `em` và gọi đối phương là `anh` / `chị` / `sếp`.
     - Nhắn với bố mẹ ruột / bố mẹ vợ: Chồng tự xưng `con`, gọi `mẹ` / `bố` / `ba` / `má`. Nhắn với cô chú bác lớn tuổi: Chồng tự xưng `cháu`, gọi `cô` / `chú` / `bác`.
   - **Với người nhỏ tuổi hơn chồng (vợ trẻ hơn, em gái ruột, đồng nghiệp trẻ, nhân viên dưới quyền, tiểu tam trẻ tuổi)**: Chồng tự xưng `anh`, gọi đối phương là `em` (hoặc tên/biệt danh thân mật).
   - **Với bạn bè ngang tuổi (bạn thân chí cốt)**: Xưng hô ngang hàng tự nhiên (`mày - tao`, `tôi - ông`, `mình - bạn`).
   - **Cấm mâu thuẫn đại từ trong câu**: Tuyệt đối không viết câu vừa gọi đối phương là `"Anh <Tên>"` hoặc `"Chị <Tên>"` mà người chồng lại tự xưng là `"anh"` (`"a"`).

2. **Quy tắc Bậc thang Viết tắt Tiếng Việt (Vietnamese Abbreviation Hierarchy)**:
   - **Gen Z / Sinh viên (20-25 tuổi)**: Sử dụng mật độ viết tắt và từ lóng cao (`ko`, `vs`, `ms`, `đc`, `j`, `zạ`, `e`, `a`, `c`, `trc`, `rùi`, `mik`, `lun`, `1 mik`, `vibe`, `chằm zn`, `đỉnh chóp`, `lag`, `update`, `shopee`).
   - **Millennial Trẻ / Dân Văn Phòng (26-35 tuổi, như Hoàng 29t)**: Dùng viết tắt đời thường, tự nhiên và chừng mực trong giao tiếp chat (`a/e`, `ko`, `vs`, `ms`, `đc`, `rùi`, `ng`, `hôm trc`, `cf`, `100k`, `shipper`, `highlight`, `sprint`, `deploy`, `fix bug`, `confirm`). Không dùng teencode trẻ con nhưng không cứng nhắc viết chữ đầy đủ như đơn từ hành chính.
   - **Giao tiếp Hành chính / Lễ tân / BQL**: Lịch sự công sở, chỉ viết tắt nhẹ (`a/e`, `rùi`, `ạ`, `team`).
   - **Thế hệ Cha Mẹ / Bậc Tiền Bối**: Tuyệt đối giữ chính tả chuẩn mực (`không`, `với`, `mới`, `được`), xưng hô kính cẩn, không bao giờ dùng từ viết tắt, teencode hay tiếng lóng mạng.

3. **Chồng Gen Z / Trẻ tuổi (20 - 25 tuổi)**:
   - **Văn phong & Khẩu khí Chat**: Thoải mái, phóng khoáng, dùng teencode và từ lóng mạng xã hội tự nhiên (*"vibe"*, *"chằm zn"*, *"keo lì"*, *"ét o ét"*, *"flex"*, *"overthinking"*, *"simp"*, viết tắt *"dc", "ko", "j", "rep"*).
   - **Thói quen Ứng dụng**: Săn sale 0đ, đặt trà sữa/cà phê muối, chuyển khoản kèm lời nhắn trêu đùa 1k-2k, ghi chú danh sách đi pub/chill.
4. **Chồng Millennial / Dân Văn Phòng - IT (26 - 35 tuổi, như Hoàng)**:
   - **Văn phong & Khẩu khí Chat**: Nửa đùa nửa thật, luôn miệng nịnh vợ để che giấu bí mật, dùng tiếng lóng công sở và thuật ngữ ngành (*"sprint"*, *"OT"*, *"fix bug"*, *"deploy"*, *"chốt task"*, *"feedback"*).
   - **Thói quen Ứng dụng**: Kiểm tra lương thưởng và quỹ đen, mua sắm áp mã giảm giá giao giờ hành chính, đặt xe đi làm, đọc tin công nghệ/thể thao.
5. **Chồng Trung Niên / Doanh Nhân / Gen X (36+ tuổi)**:
   - **Văn phong & Khẩu khí Chat**: Điềm đạm, kín kẽ, viết đúng chính tả, dùng câu từ lịch thiệp và từng trải (*"em đã dùng bữa chưa"*, *"cảm ơn em"*), rất ít khi viết tắt hay dùng icon nhí nhố.
   - **Thói quen Ứng dụng**: Chuyển khoản số tiền lớn chẵn chục triệu qua banking, đặt phòng khách sạn/vé máy bay qua Email, tìm kiếm bất động sản/chứng khoán, chơi golf/tennis.

### 3.3. Thang Ngụy biện Của Người Chồng Khi Bị Bắt Bẻ ("Chối bay chối biến")
*Khẩu khí của người chồng khi bị người vợ đối chất phải phản ánh đúng tính cách persona của nhân vật:*
- **0 Thẻ (Cáo buộc non)**: Hùng hổ, gạt phăng, mắng vợ ghen tuông vô căn cứ (*"Em lại xem mấy cái clip bắt ghen TikTok xàm xí rồi đa nghi đúng không? Đưa máy đây anh đi ngủ!"*).
- **1 Thẻ (Mới có 1 manh mối)**: Phân bua, lấy cớ công việc hoặc giúp đỡ bạn bè (*"Ơ kìa, đấy là con bé Marketing cùng phòng nó nhờ anh đặt hộ để lấy mã giảm giá chứ anh biết gì đâu!"*).
- **2 Thẻ (Đã đối chiếu 2 app)**: Toát mồ hôi, bao biện quan hệ trong sáng (*"Anh thề với em là bọn anh chỉ đi ăn trưa với cả phòng, có anh Bách với sếp Hùng làm chứng mà!"*).
- **3+ Thẻ (Đủ tam giác bằng chứng)**: Cúi đầu xin tha thứ (*"Anh biết anh sai rồi vợ ơi, anh thề là mới chỉ nhắn tin trêu đùa chứ chưa làm gì quá giới hạn cả..."*).

---

## 4. Thang Phân bậc Độ khó & Cấu hình Ứng dụng

| Thông số | Màn 1 (Khởi động / Nhận diện) | Màn 2 (Trung cấp / Chuỗi đa ứng dụng) | Màn 3 (Cao cấp / Pháp y chuyên sâu) |
|---|---|---|---|
| **Mục tiêu suy luận** | Làm quen vòng lặp ghim & đối chất | Ghép nối 2-3 ứng dụng, giải 1 mã khóa PIN | Đối chiếu mốc thời gian, ảnh phản chiếu, 2 mã khóa |
| **Số app có manh mối** | 3-4 apps | 5-6 apps | 8-11 apps |
| **Số mã khóa (Lock Challenges)** | **0 locks** | **1 lock** (PIN App hoặc Chat ẩn) | **2 locks** (PIN App + Thư mục ẩn / Két tiền) |
| **Số lượt nghi ngờ tối đa** | **5 strikes** | **4 strikes** | **3 strikes** |
| **Thời gian giải án trung bình**| 3-5 phút | 5-8 phút | 8-12 phút |
| **Đặc điểm manh mối** | Manh mối gián tiếp, chuỗi ngắn và gợi ý nguồn rõ | Mã khóa từ ngày kỷ niệm, lịch sử di chuyển (100% gián tiếp) | Phản chiếu gương/kính, hóa đơn ẩn trong spam (100% gián tiếp) |

---

## 5. Quy tắc Thiết kế Khóa Giải đố (Lock Challenges)

1. **Nguyên tắc Phân tách Nguồn (Source Separation Invariant)**:
   - Manh mối giải mã PIN bắt buộc phải nằm ở ứng dụng KHÁC với ứng dụng bị khóa (`clueSourceApp !== targetId`).
   - Ví dụ: Khóa `banking` bằng PIN -> Gợi ý nằm trong `internet-messaging` (`clueSourceApp: "internet-messaging"`).
2. **Định dạng Chuẩn mực**:
   - Mã PIN số bắt buộc đúng 4 chữ số (ví dụ: `1509`, `0412`, `8291`).
   - Câu hỏi bảo mật phải có đáp án đơn nghĩa, không thể đoán mò.
3. **Chơi Đẹp (Fair Play)**:
   - Câu hỏi gợi ý phải cung cấp manh mối định hướng rõ ràng (ví dụ: *"Gợi ý: Ngày kỷ niệm gia nhập công ty"* -> người chơi biết tìm trong `professional-network` hoặc `personal-notes`).

---

## 6. Quy tắc Bẫy Nghi phạm Vô tội (Fair-Play Red Herrings)

1. **Tính Nhất quán về Tâm lý**:
   - Bẫy nghi ngờ phải xuất phát từ hành vi giấu diếm thật nhưng có lý do vô tội hoặc bất ngờ:
     - Chồng lén chuyển tiền hàng tháng vào quỹ bí mật -> Thực chất là tiết kiệm mua nhẫn kim cương kỷ niệm ngày cưới cho vợ (`CLUE-BANK-04`).
     - Chồng đặt mua robot hút bụi giao về nhà mẹ đẻ -> Mua quà mừng thọ mẹ (`CLUE-POSH-03`).
2. **Lời Roasting Khi Vợ Ghen Nhầm (`overJealousRoast`)**:
   - Khi người chơi cáo buộc nhầm người vô tội, trò chơi phải đưa ra câu chọc quê hài hước, phản ánh sự xấu hổ của người vợ vì ghen bóng ghen gió.

---

## 7. Quy trình Tự động Đồng bộ Danh mục Manh mối

Mỗi manh mối mới bắt buộc phải được đăng ký qua công cụ đồng bộ:
```bash
python -B .agents/skills/level-designer/scripts/sync_clues.py add \
  --id "CLUE-<APP>-XX" \
  --app "<appId>" \
  --title "<Tiêu đề ngắn>" \
  --desc "<Mô tả manh mối gián tiếp>" \
  --type "<Phân loại>" \
  --truth "<Cheating | Innocent | Sugar>" \
  --difficulty "<Easy | Medium | Hard>" \
  --component "<Tên component>" \
  --ac "<Tiêu chí pháp y>"
```
Và kiểm tra hợp lệ bộ hồ sơ cốt truyện (kiểm tra cả `husband-profile.md`, `level-XX-storyboard.md` và `level-XX.md`) bằng:
```bash
python -B .agents/skills/level-designer/scripts/sync_clues.py verify-spec "<đường_dẫn_file_spec>.md"
```
