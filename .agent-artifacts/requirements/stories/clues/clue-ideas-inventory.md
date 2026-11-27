# Clue Ideas Inventory & Cross-App Distribution Matrix

> **Target Game:** Jealous Wife Detective Game (*Bắt được Tiểu tam*)  
> **Source Inspiration:** Viral tropes from *Tâm sự Eva*, *Vén khéo*, Vietnamese TikTok/Threads relationship dramas, and Gen Z/Alpha internet culture.  
> **Purpose:** Canonical Single Source of Truth (SSOT) catalog of clues, suspicious footprints, innocent red herrings, and unlock puzzle mechanics to be mapped across game levels.

---

## 1. Clue Archetypes by App

### 1.1. Zola (Zalo Parody - Private Messaging)
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-ZOLA-01` | **Disguised Contact Name:** Chat with "Anh Tuấn Thợ Điện" or "Sếp Hùng Cty", but conversation tone is overly affectionate with hearts and cute stickers. | Text / Tone mismatch | Cheating (Colleague / Affair) | Easy |
| `CLUE-ZOLA-02` | **Hidden / Locked Chat:** A chat requiring a 4-digit PIN to open. PIN clue found in Notes app (e.g. "Pass vali: 1204"). | Locked Feature | Cheating or Sugar | Medium |
| `CLUE-ZOLA-03` | **Disappearing Message Notice:** System notice in chat: *"Tin nhắn tự xoá sau 24h đã được bật"*. Remaining messages contain vague fragmented arrangements ("Tối mai chỗ cũ nhé"). | Fragmented Chat | Cheating | Easy |
| `CLUE-ZOLA-04` | **Shared Location Pin:** Husband sent a real-time location pin to a contact at a luxury hotel / boutique cafe while telling his wife he was "kẹt xe trên đường về". | Metadata / Location | Cheating | Medium |
| `CLUE-ZOLA-05` | **Innocent Red Herring:** Passionate voice messages discussing "bé cưng", "em này đầm tay lắm", "tối nay anh qua đón em"... which turns out to be discussing a second-hand vintage Vespa motorbike or fishing rod with a fellow enthusiast. | Audio / Red Herring | Innocent | Hard |
| `CLUE-ZOLA-06` | **AI Companion Chat:** Chat history with an official account "Em Yêu Ảo - AI Girlfriend" with paid premium tier messages. | Bot Chat | Cheating (Non-Human / AI) | Medium |
| `CLUE-ZOLA-07` | **Lịch hẹn trái lời khai:** Lịch hẹn bàn 19h30 "chỗ cũ tầng 2 Phố Cổ" với cớ mừng 1 tháng ngày sang sửa điện lần đầu trong luồng liên hệ ngụy trang; cùng tối người chồng báo vợ đang họp với cả nhóm. Chi tiết lấy đồ ở sảnh, dùng bữa tại Phố Cổ và nhắn trả áo khép thành cùng một buổi gặp; không tự đủ xác định người nếu thiếu đối chiếu số đầy đủ và tên pháp lý. | Timeline / Cross-App | Cheating | Easy |
| `CLUE-ZOLA-08` | **Tên danh bạ lộ trong nhóm chat:** Trong nhóm toàn công ty, tin của người tình hiện theo tên chồng đã lưu (ví dụ 'Khoa BE') nhưng nội dung là việc phòng khác và người khác gọi bằng tên thật; tin ghim chào mừng ghi họ tên và chức danh. | Group Sender Mismatch | Cheating | Easy |
| `CLUE-ZOLA-09` | **Họp bị hủy nhưng vẫn khai đang họp:** Nhóm công việc báo hủy họp và chồng đã trả lời xác nhận; sau đó chồng vẫn nhắn vợ là đang họp, rồi bị biên lai thẻ cùng tối bóc trần. | Alibi Contradiction | Cheating | Easy |
| `CLUE-ZOLA-10` | **Bản xem trước bị cắt:** Bản xem trước luồng chat chỉ hiện câu cuối trông như che giấu ('a đừng kể gì nha'); đọc trọn luồng thấy lý do vô tội (em gái trượt môn, sợ mẹ biết). | Preview Truncation Red Herring | Innocent | Easy |
| `CLUE-ZOLA-11` | **Thợ điện thật (bẫy meme):** Danh bạ 'Anh Tuấn Thợ Điện' gửi tin mập mờ 'không để bà ấy biết'; thực ra là thợ điện thật lắp bình nóng lạnh làm quà sinh nhật mẹ chồng, kiểm chứng qua luồng mẹ và đơn hàng. | Meme Bait Red Herring | Innocent | Easy |
| `CLUE-MSG-02` | **SMS vắng mặt buổi tập:** SMS dịch vụ phòng gym báo khách vắng mặt buổi PT, giải oan cho huấn luyện viên nhắn 'e đợi a nãy giờ' và cho thấy chồng không ở gym. | Service SMS Exoneration | Innocent | Easy |


---

### 1.2. Bank / E-Wallet Parody (VietQR / MoMo Style)
*Core Trope: Using bank transfer descriptions as an undetectable chat channel or hiding secret stashes (quỹ đen).*

| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-BANK-01` | **1,000 VNĐ Micro-Transfers as Chat:** A sequence of 1,000–2,000 VNĐ transfers sent consecutively with message contents: *"Em gian anh a"*, *"Sao khong nghe may"*, *"Anh xin loi ma"*. | Transaction History | Cheating | Easy |
| `CLUE-BANK-02` | **Secret Allowance from Sugar Mommy:** Inflow transactions of 10,000,000–20,000,000 VNĐ with descriptions like *"Chi chuyen tien cafe"*, *"Thuong cho chuot con"*, *"Tien tieu vat cho be"*. | Statement Inflow | Sugar Relationship | Medium |
| `CLUE-BANK-03` | **Hotel / Resort Expense Disguise:** Bank debit of 1,500,000 VNĐ to "Nha Hang Sen Tay Ho" or "Dich Vu Khach San", but husband claimed he ate 35k pho with coworkers. | Expense Discrepancy | Cheating | Easy |
| `CLUE-BANK-04` | **Quỹ Đen Secret Piggybank (Innocent):** Recurring monthly transfers into a hidden sub-vault named "Tiet Kiem Mua Nhan Kim Cuong Cho Vo" (Saving for wife's diamond ring). | Hidden Vault | Innocent (Anniversary) | Hard |
| `CLUE-BANK-05` | **Bill Split on Dating App Dinner:** Transfer description: *"Campuchia tien an toi 50/50"* with a girl's personal bank account. | Expense Split | Cheating | Medium |
| `CLUE-BANK-06` | **Thanh toán tối và danh tính chia tiền:** Khoản thanh toán nhà hàng cùng tối kiểm chứng lịch hẹn; một khoản hoàn tiền trưa riêng cung cấp tên tài khoản pháp lý. Không suy số người từ số tiền, không dùng memo tình cảm. | Timeline / Legal Identity | Cheating | Easy |
| `CLUE-BANK-07` | **Quẹt thẻ nhà hàng trái lời khai:** Thanh toán thẻ tại quán ăn 2 phút sau tin nhắn khai đang họp ở công ty; chuyển khoản online cùng tối không chứng minh vị trí, chỉ thanh toán thẻ tại quán mới làm được. | Alibi Contradiction | Cheating | Easy |


---

### 1.3. Shopoo (Shopee Parody - E-Commerce)
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-POSH-01` | **Suspicious Delivery Address:** Order history shows an order delivered to an address that is neither home nor his company (e.g. "Chung cư mini số 12 ngõ..."). | Shipping Address | Cheating / Sugar | Medium |
| `CLUE-POSH-02` | **Women's Items in Wrong Size:** Orders for silk pajamas, high-end lipstick (e.g. Dior 999), or lace lingerie in size S, whereas the wife wears size L. | Product mismatch | Cheating | Easy |
| `CLUE-POSH-03` | **Secret Delivery for Wife (Innocent):** Order for a robot vacuum cleaner or high-end cosmetic set delivered to his mother's or sister's house to hide the surprise. | Shipping Address | Innocent (Surprise Gift) | Hard |
| `CLUE-POSH-04` | **Search Keyword Suggestions:** Recent search bar suggestions: "nội y quyến rũ", "váy body tôn dáng", "quà tặng sinh nhật bạn gái mới quen". | Search History | Cheating | Easy |
| `CLUE-POSH-05` | **Thiệp ngày trùng lịch hẹn:** Đơn trang phục giao công ty có liên hệ giao nhận phụ tên pháp lý và số đầy đủ; chat người bán lưu thiệp với hai mốc cách nhau một tháng và lời nhắc chỗ cũ. | Gift Card / Identity Match | Cheating | Easy |

---

### 1.4. Grap / Be (Ride Hailing & Delivery Parody)
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-GRAP-01` | **Late-Night Ride Destinations:** Ride history showing trips booked from 22:30 to 01:00 to love hotels (*"Khách sạn Sao Mai"*, *"Love Hotel Phố Cổ"*). | Ride History | Cheating | Easy |
| `CLUE-GRAP-02` | **Food Delivery to Alternate Location:** GrapFood order for 2 portions of *"Trà sữa trân châu đường đen 70% đường"* + *"Bánh ngọt"* delivered to an unfamiliar office building with driver note: *"Giao tận tay bạn Mai lễ tân giúp mình"*. | Food Delivery | Cheating | Medium |
| `CLUE-GRAP-03` | **Ride to Wife's Parents' House (Innocent):** Husband booked a delivery of premium bird's nest (*yến sào*) to his mother-in-law without telling the wife. | Delivery History | Innocent | Medium |

---

### 1.5. Web Browser & Search History ("GooGle Parody")
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-BROW-01` | **Suspicious Search Queries:** Searches such as *"cách tắt định vị iphone mà vợ không biết"*, *"xoá lịch sử zalo có khôi phục được không"*, *"quán ăn lãng mạn có phòng riêng cho 2 người"*. | Search Query | Cheating | Easy |
| `CLUE-BROW-02` | **Incognito Tab Left Open:** An open private tab showing a boutique gift shop or a hotel booking confirmation page. | Open Tabs | Cheating or Innocent | Medium |
| `CLUE-BROW-03` | **Sugar Dating Forum / AI Chat:** Browsing history on sugar baby / sugar daddy matching platforms, or forum threads: *"kinh nghiệm chu cấp cho sinh viên"*. | Bookmarks / History | Sugar Relationship | Medium |
| `CLUE-BROW-04` | **Waifu / Anime Romance Search:** Queries like *"cách tỏ tình với nhân vật anime"*, *"top game bạn gái ảo hay nhất 2026"*. | Search Query | Cheating (Non-Human) | Easy |

---

### 1.6. Photos & Gallery
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-PHOT-01` | **Locked Hidden Album:** Photo album requiring PIN (found in Calendar or Notes). Contains screenshots of flirtatious conversations or selfies with another person. | Hidden Folder | Cheating | Medium |
| `CLUE-PHOT-02` | **Reflective Surfaces & Background Details:** A seemingly harmless photo of a dinner plate at a fancy restaurant, but in the reflection of the wine glass or water cup, a woman's manicured hand/face is visible. | Visual Forensics | Cheating | Hard |
| `CLUE-PHOT-03` | **Passenger Seat Footprint:** Photo of his car dashboard showing a female luxury handbag on the passenger seat that does not belong to the wife. | In-Car Evidence | Cheating | Medium |
| `CLUE-PHOT-04` | **Innocent Surprise Photo:** Hidden folder containing drafts of a hand-drawn portrait of the wife or receipt for custom-engraved anniversary jewelry. | Hidden Folder | Innocent | Hard |
| `CLUE-PHOT-05` | **Ảnh bữa tối đối lập ngoại phạm:** Ảnh chụp cận mâm cơm niêu tối D-Day (EXIF 19:45, Phố Cổ, Hoàn Kiếm) đối lập lời khai đang họp tại văn phòng lúc 18:55 và 20:46; phóng to góc trên thấy thêm một chén trà và đôi đũa thứ hai trên bàn gỗ nhỏ cho 2 người, không lộ mặt hay đồ vật phụ nữ. | EXIF / Visual Forensics | Cheating | Easy |


---

### 1.7. Phone (Call Logs, Contacts) & Messages (SMS)
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-PHONE-01` | **Late-Night 1-Minute Calls:** Call log showing outgoing calls at 23:45 lasting exactly 1 to 2 minutes to a contact named "Tổng Đài Viettel" or "Đồng nghiệp Nam". | Call Log Duration | Cheating | Easy |
| `CLUE-MSG-01` | **Booking Confirmation SMS:** SMS from hotel/resort confirming room reservation for 2 guests on a weekend when he told his wife he had an urgent company retreat. | Brand SMS | Cheating | Medium |
| `CLUE-PHONE-02` | **Contact Note Field:** Opening contact info for "Bác Sĩ Cương" reveals a secondary phone number and an address note matching a luxury apartment complex. | Contact Card | Cheating | Hard |

---

### 1.8. Notes & Calendar ("Ghi Chú" & "Lịch")
| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-NOTE-01` | **Cryptic Password Clues:** A note titled "Mật khẩu quan trọng": *"Ngày đầu tiên ta chạm mặt tại Highland Nhà Thờ: DDMM"*. Must find this date from SMS or Photo archives to unlock the Bank App. | Puzzle Clue | Unlock Mechanic | Medium |
| `CLUE-NOTE-02` | **The "Quỹ Đen" Ledger:** A financial breakdown comparing his real freelance earnings vs the official amount handed over to his wife (*"Vén khéo" classic*), noting where the difference is parked. | Financial Log | Cheating or Innocent | Medium |
| `CLUE-NOTE-03` | **Fake Calendar Events:** Calendar shows "OT Dự Án Sprint Đột Xuất", but Grap ride history shows he traveled in the opposite direction. | Cross-App Contradiction | Cheating | Hard |

---

## 2. Cross-App Puzzle Chaining Mechanics

```
[Clue A: SMS / Notes] ───(Provides PIN / Hint)───> [Locked Bank App / Hidden Album]
                                                              │
                                                     (Reveals Name / Address)
                                                              │
                                                              ▼
[Clue B: Shopoo / Grap] <───(Cross-reference)─── [Cross-App Suspect Board]
```

### Chaining Example 1: The Hidden Birthday PIN (Level 2)
1. Player tries to open **Bank App** -> Locked with 4-digit PIN.
2. Player explores **Notes** -> Finds note: *"Pass thẻ: Ngày bé Mèo nhận việc"*.
3. Player opens **Zola** -> Searches contact "Bé Mèo", scrolls to initial greeting message: *"Hôm nay 15/06 em bắt đầu thử việc, anh chỉ bảo em nhé!"*.
4. Player enters `1506` into Bank App -> Bank unlocks!
5. Bank transfer history shows micro-transfers with affectionate messages to "Bé Mèo".

### Chaining Example 2: The Innocent Surprise Gift (Level 3 Red Herring)
1. Player sees suspicious **Grap** trip to a high-end diamond boutique and 15,000,000 VNĐ deducted in **Bank App**.
2. Player checks **Shopoo** -> Finds order for luxury silk lingerie delivered to sister's house address.
3. Player unlocks **Hidden Photos** (using anniversary date from **Calendar**) -> Finds a photo of husband holding the jewelry box next to his sister with handwritten note: *"Cảm ơn chị gái đã đi chọn nhẫn kỷ niệm 10 năm cưới giúp em, giấu vợ kỹ nhé!"*.
4. **Resolution:** Innocent! If the player wrongfully accuses him, the game shows the husband presenting the gift while looking heartbroken at his wife's lack of trust ("Vợ Sư Tử Hà Đông").

---

## 3. UI Home Screen & App Visibility Rule

- **Universal App Grid Rule:** All 8 app icons are visible on the virtual smartphone home screen across **all levels** (L1, L2, L3) for every husband.
- **Cognitive Purpose:** Prevents "process of elimination" spoilers. In Level 1, unneeded apps contain realistic, benign daily clutter (e.g. junk mail SMS, official bank salary deposit, news browsing history, ordinary photos of food or pets), requiring the player to genuinely inspect and deduce where real clues are hidden.

### Ecommerce

| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-POSH-06` | **Người nhận nữ vô tội:** Đơn quà có người nhận là phụ nữ lạ (lễ tân nhận hộ hoa sinh nhật sếp, mẹ chồng nhận bình nóng lạnh); SĐT người nhận khớp danh bạ vô tội và chat người bán ghi rõ thiệp. | Recipient Red Herring | Innocent | Easy |
