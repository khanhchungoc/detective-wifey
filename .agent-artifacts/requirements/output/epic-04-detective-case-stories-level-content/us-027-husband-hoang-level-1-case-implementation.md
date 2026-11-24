---
type: Requirement Story
epic: "Epic 04: Husband Hoàng Level 1 MVP Case Implementation (Release 1)"
status: draft
description: "Declarative case configuration, suspect profiles, subtle clue chains across 4 active apps, and excuse/roast content for Husband Hoàng Level 1."
tags: [requirement, user-story, case-story, husband-hoang, level-01, declarative-config]
timestamp: "2026-10-17"
---

# US-027 - Husband Hoàng Level 1 Case Implementation ("Cơn ghen lúc nửa đêm")

### Epic: [Epic 04: Husband Hoàng Level 1 MVP Case Implementation (Release 1)](./epic.md)

As a Player, I want to investigate Husband Hoàng's Level 1 case ("Cơn ghen lúc nửa đêm") with authentic suspects, subtle clues across 4 active apps, and comedic excuse/roast reactions.

---

### Canonical Wireframe References

- [Phone Shell Launcher & Level Selector ASCII Wireframe](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-phone-shell-launcher.md)
- [Zola Private Messaging ASCII Wireframe](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-zola-messaging.md)
- [Techcornbank Banking & E-Wallet ASCII Wireframe](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-techcornbank-banking.md)
- [Shopoo E-Commerce ASCII Wireframe](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-poshee-ecommerce.md)
- [Phone Dialer & Contacts ASCII Wireframe](../epic-01-virtual-phone-app-ecosystem/wireframes/wireframe-phone-investigation.md)
- [Wife's Detective Corkboard Node Canvas ASCII Wireframe](../epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-us-015-corkboard-node-canvas.md)

---

### Acceptance Criteria

#### 1. Level Provisioning & Active Apps
1. Selecting Level 1 in the Level Selector loads the case configuration from `src/data/cases/hoang/level_01.json` with case ID `case_hoang_01`, level number `1`, and suspect ID `husband_hoang`.
2. The emulated phone shell displays the narrative clock at 23:45, date at 15/10, cellular status 5G, and battery indicator at 42%.
3. The launcher mounts the 4 active clue apps: `internet-messaging` (Zola), `banking` (Techcornbank), `ecommerce` (Shopoo), and `phone` (Phone dialer & contacts). Other applications display as disabled or contain standard parody filler.
4. Level 1 enforces 5 allowed strikes (`allowedStrikes: 5`) and zero lock challenges (`lockChallenges: []`).
5. Four seconds after case initialization, the system triggers the opening narrative toast (`toast_01`) from `internet-messaging` with title "Tin nhắn • Vừa xong" and snippet "Anh Tuấn Thợ Điện: Đồ anh để quên em cất rồi, mai em mang qua nhé."

#### 2. Suspect Cast & Disguise Profiles
6. The case dataset defines 5 suspect profiles with full Vietnamese names, job titles, and disguised contact aliases:
   - `suspect_huong`: Nguyễn Thị Thu Hương (Culprit, Marketing Technosoft, disguised in contacts as "Anh Tuấn Thợ Điện").
   - `suspect_lan_anh`: Lan Anh Kế Toán (Red Herring 1, Thủ quỹ công đoàn).
   - `suspect_thao`: Thảo PT Gym (Red Herring 2, Nữ HLV thể hình).
   - `suspect_ngoc`: Bé Ngọc Sinh Viên (Red Herring 3, Em gái ruột Hoàng).
   - `suspect_mai`: Mai Lễ Tân (Red Herring 4, Nhân viên lễ tân tòa nhà).
7. In the contact list and messaging inbox, the primary culprit displays exclusively under the disguise alias "Anh Tuấn Thợ Điện" (`node_alias_tuan`) with zero visible UI markers indicating true culprit identity.

#### 3. Cross-App Subtle Clues & Narrative Realism
8. Zola (`internet-messaging`) provides 10 chat threads featuring realistic IT office lifestyle banter, including:
   - Thread with "Anh Tuấn Thợ Điện" containing the 23:44 jacket message and dinner reservation at 19:30 "như tháng trước" (`CLUE-ZOLA-07`).
   - Thread with "Vợ Yêu" containing Hoàng's alibi message at 20:46: "Anh vẫn đang ở phòng họp công ty fix bug giỏ hàng gấp cho kịp sprint."
9. Techcornbank (`banking`) provides financial transaction history, including:
   - POS transaction at 20:48 for 640.000đ at "Cơm Niêu Phố Cổ" (`CLUE-BANK-06`), directly contradicting the 20:46 company meeting alibi by 2 minutes.
   - Refund transaction to account holder "Nguyen Thi Thu Huong", establishing legal identity proof.
   - Background family expenses, utility bills, and salary deposits without clue indicators.
10. Shopoo (`ecommerce`) provides order history, including:
    - Order record for a satin dress with an anniversary gift card reading "15/09 - 15/10" (`CLUE-POSH-05`), delivered to recipient name "Nguyen Thi Thu Huong" at phone number `0988886677`.
11. Phone (`phone`) provides call history and contacts, including:
    - A 96-second late-night call at 23:30 to contact "Anh Tuấn Thợ Điện" at phone number `0988886677` (`CLUE-PHONE-01`).
12. At least 75% of data entries across all active apps consist of benign daily activity and red herrings to eliminate spoiler giveaways.

#### 4. Evidence Inspection & Knowledge Graph Integration
13. Long-pressing any dynamic story evidence item for 380ms opens the blurred `UniversalEvidenceModal` through `StoryEvidenceTarget`. Chrome elements (headers, tabs, search bars, dock buttons) never trigger evidence modals.
14. Pinning evidence queues the item into the Wife's Detective Notebook bottom drawer ("Khay Manh Mối") under the canonical Knowledge Graph nodes (`node_alias_tuan`, `node_bridge_phone`, `node_bridge_name`, `node_record_zola_chat`, `node_record_wife_alibi`, `node_record_bank_receipt`, `node_record_ecommerce_order`, `node_record_phone_call`, `node_timeline_dinner`).
15. The case defines 2 core smoking-gun edges required for a 3-star victory (`requiredSmokingGunEdgeIds`):
    - `edge_order_phone`: Linking the satin dress order (`node_record_ecommerce_order`) to phone number `0988886677` (`node_bridge_phone`), the number saved as "Anh Tuấn Thợ Điện", which exposes the disguise.
    - `edge_alibi_contradiction`: Linking meeting alibi at 20:46 (`node_record_wife_alibi`) to restaurant payment at 20:48 (`node_record_bank_receipt`).
    - Supporting (non-required) evidence: `edge_order_name` / `edge_name_suspect` link the legal name "Nguyen Thi Thu Huong" from the refund to the order and suspect profile.

#### 5. Beat-by-Beat Interrogation (`confrontationScript`), Excuse Ladder & Comedic Roasts
16. Level 1 defines a declarative `confrontationScript` executed inside the dark interrogation room (`ConfrontationModal`) via the COD Cold War D-pad:
    - **Beat 1 (`opening`)**: 2 opening lines (`open_ask` on `left`, `open_offer` on `right`), each triggering a distinct `confident` denial from Hoàng before advancing to Beat 2.
    - **Beat 2 (`beat_tuan_identity`)**: Lead choice `tuan_shared_phone` (`up`, requires `edge_order_phone`) shifts Hoàng to `nervous` ("Ơ... chắc shop ghi nhầm số thôi..."); lacking `edge_order_phone` or picking red herrings (`tuan_herring_thao`, `tuan_herring_lan_anh`) triggers `smug` failure (`canAccuse = false`, +1 strike on exit).
    - **Beat 3 (`beat_dress_recipient`)**: Lead choice `dress_legal_name` (`up`, requires `edge_order_name`) keeps Hoàng `nervous` ("À... cái đơn đó con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra thôi..."); lacking `edge_order_name` or picking red herrings (`dress_herring_mai`, `dress_herring_ngoc`) triggers `smug` failure.
    - **Beat 4 (`beat_meeting_alibi`)**: Lead choice `alibi_card_swipe` (`up`, requires `edge_alibi_contradiction`) breaks Hoàng down (`broken`: "Anh xin lỗi vợ... Anh không họp gì cả. Tối nay anh đi ăn với Hương, kỷ niệm một tháng...") and unlocks `ending` (`end_divorce` on `left`, `end_forgive` on `right`), resolving into a 3-star victory.
17. A 3-star victory triggers the victory roast narrative: "Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?"
18. Accusing innocent red-herring suspects triggers specific over-jealous roast punchlines:
    - Lan Anh Kế Toán: "Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?"
    - Thảo PT Gym: "Người ta nhắc anh mang phiếu đánh giá cột sống. Em bắt được lưng đau, chưa bắt được người tình."
    - Bé Ngọc Sinh Viên: "Em gái nhắn cảm ơn anh trai còn chưa đủ rõ à? Chủ nhật về quê chắc phải giới thiệu lại gia phả."
    - Mai Lễ Tân: "Mai giữ cả hoa sinh nhật lẫn gói đồ, còn nhắc anh ký sổ. Sảnh lễ tân đâu phải danh sách người tình."
19. Reaching 5 suspicion strikes triggers the caught-snooping fail state roast: "Hoàng giật lại máy: 'Em kiểm tra điện thoại hay kiểm kê cả khu phố đấy? Mai anh còn đi làm!'"

---

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Security PIN locks, password challenges, or pattern locks (Level 1 has 0 lock challenges). |
| OOS02 | Interactive outgoing calls, composing new SMS messages, or bank transfers. |
| OOS03 | Content for Level 2 ("Tình cũ không rủ cũng tới") and Level 3 ("Bẫy tiểu tam công sở"). |
| OOS04 | Cloud backend synchronization, user accounts, and external social network API publishing. |

---

### Open Questions

None.
