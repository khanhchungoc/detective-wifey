---
type: Requirement Story
epic: "Epic 03: Wife's Detective Notebook, Anytime Confrontation & Social Sharing"
status: draft
description: "Anytime confrontation trigger, dynamic excuse ladder evaluation, suspicion penalty on failure, and tiered star conviction."
tags: [requirement, user-story, confrontation, excuse-engine, verdict, epic-03]
timestamp: "2026-10-20"
---

# US-016 - Anytime Confrontation Hub & Dynamic Excuse Engine ("Đối chất & Chối bay chối biến")

### Epic: [Epic 03](./epic.md)

As a Player (Wife), I want to initiate confrontation ("Đối chất") with the husband at any time to test my evidence, listen to comedic excuses, and convict him for a 1–3 star victory.

### Canonical Wireframe Reference

- [ASCII Wireframe - Screen SSOT](./wireframes/wireframe-us-016-confrontation-hub.md)
- [Corkboard Canvas Wireframe Reference](./wireframes/wireframe-us-015-corkboard-node-canvas.md)
- Interactive HTML: pending ASCII signoff; not generated.

### Acceptance Criteria

1. Tapping the "Đối chất" action button from the Wife's Detective Notebook top bar opens the Anytime Confrontation stage as a full-screen modal overlay (`z-index: 80`).
2. Opening confrontation automatically evaluates the player's active corkboard Knowledge Graph state (verified edges between clues, bridge identifiers, and unmasked suspects) against `caseConfig.groundTruth` without requiring manual card slotting or drag-and-drop submission.
3. **Suspect Selection & Dynamic Disguise Unmasking (Giai đoạn chọn nghi phạm & Lột trần vỏ bọc)**:
   - When launching confrontation, Step 1 presents the suspect selection tray (`"Chọn nghi phạm"`) displaying Polaroid cards for candidates present on the active corkboard.
   - **Initial Disguise State (Trước khi lột mặt nạ)**: If the player has pinned an alias contact (e.g., "Anh Tuấn Thợ Điện") but has not yet connected the bridging identity edge (e.g. matching phone number or legal transaction name), the Polaroid card displays the alias name, the disguise avatar (electrician toolbag), and the default stamp `"NGHI PHẠM"`.
   - **Unmasked Disguise State (Đã lột mặt nạ)**: When the active corkboard contains verified identity-bridging edges (e.g., connecting the late-night electrician call and the Shopee silk dress order via matching phone number `0988886677`), the candidate card dynamically evolves:
     - The primary header displays the suspect's true identity (e.g., `"Nguyễn Thị Thu Hương"`).
     - The card visibly links the two identities with a subtitle: `🎭 Vỏ bọc: "Anh Tuấn Thợ Điện"`.
     - The card displays the smoking-gun bridge anchor: `📞 Trùng SĐT: 0988886677`.
     - The photo switches to the suspect's real persona portrait.
     - The stamp updates to `"ĐÃ LỘT MẶT NẠ"`.
   - In Step 2 ("Xác nhận đối chất"), the unmasked true persona portrait and disguise subtitle are carried over to the confrontation matchup view.
4. Confronting with 0 verified smoking-gun links triggers the premature confrontation failure state:
   - The husband delivers dismissive gaslighting dialogue (e.g., Level 1: "Em lại lướt TikTok drama rồi đa nghi đúng không? Anh đi làm cả ngày mệt mỏi, em lại tra khảo anh chuyện vô căn cứ!").
   - The game increments the Suspicion Meter by 1 strike.
   - If the added strike reaches the case's strike limit (5 strikes in Level 1), the "Caught Snooping" fail state ("Bị giật lại máy", US-014) triggers immediately.
   - Otherwise, the screen displays a "Tiếp tục điều tra" button that closes confrontation and returns the player to the active view without penalty to case progression.
5. Confronting with 1 verified smoking-gun link yields a 1-star win (`★☆☆`):
   - The husband delivers a defensive stammering excuse (e.g., Level 1: "Số thợ điện hôm trước anh gọi nhờ sửa dây mạng văn phòng mà...").
   - Unlocks the "Tha thứ & Qua màn" progression action (US-018) while offering a "Điều tra tiếp để đạt 3 sao" button to return to the case.
6. Confronting with 2 verified smoking-gun links yields a 2-star win (`★★☆`):
   - The husband delivers a stammering partial explanation (e.g., Level 1: "Con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra thôi mà em!").
   - Unlocks the "Tha thứ & Qua màn" progression action while offering a "Điều tra tiếp để đạt 3 sao" button.
7. Confronting with 3 verified smoking-gun links (or the case's complete smoking-gun chain) yields a watertight 3-star victory (`★★★`):
   - The husband breaks down and confesses fully (e.g., Level 1: "Anh xin lỗi vợ... Thôi anh khai thật! Bọn anh có hẹn riêng tối nay ở quán cơm niêu... Em đừng giận nữa mà!").
   - Awards the case's custom Wife Title (e.g., "Nữ thám tử ghen tuông").
   - Displays the victory comedic roast narrative.
   - Displays the "Tạo thẻ Roast khoe MXH" button (US-017) and the "Tha thứ & Qua màn" button (US-018).
8. Accusing an innocent red-herring suspect with verified bridge edges triggers specific over-jealous roast punchlines tailored to that suspect's alibi before returning to investigation.
9. All confrontation evaluation, excuse branching, and star calculation execute 100% client-side without network calls or external server dependencies.

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Manual drag-and-drop evidence slots inside the confrontation view |
| OOS02 | Voice acting, audio clips, or animated video cutscenes for husband reactions |
| OOS03 | Microtransactions or paid hints to bypass failed confrontation strikes |
| OOS04 | Cloud backend synchronization or server-side score validation |

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Platform | Follow existing [global NFRs](../vision-scope.md#4-key-constraints--non-functional-requirements-global); no new backend service. |
| UI & Accessibility | High contrast text, dialog font size $\ge 16\text{px}$, minimum 44px × 44px touch targets, canonical Ionicons/vector SVGs (no raw emojis). |
| Performance | Graph evaluation and dialogue resolution complete in under 50ms upon tapping "Đối chất". |
| Data Consistency | Star rating and completion status persist strictly to local storage (`PlaySession.stars`). |

### Open Questions

None for confirmed behavior. ASCII signoff and team sizing remain pending; status stays draft.

### Citations

- [Signed-off target discovery](../elicitation/2026-10-20-us-011-us-016-pinning-confrontation.md)
- [US-015 Detective Corkboard Canvas](../epic-03-wife-notebook-verdict-social-sharing/us-015-wife-split-section-investigation-notebook-suspect-evidence-linkage-hub.md)
- [Level 1 Case Implementation](../epic-04-detective-case-stories-level-content/us-027-husband-hoang-level-1-case-implementation.md)
- [Wife's Notebook Features](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/features.md)
- [Wife's Notebook Design](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md)
- Implemented runtime contracts: `src/features/wife-notebook/WifeNotebookModal.tsx`, `src/features/wife-notebook/graphEngine.ts`, `src/features/wife-notebook/level01Fixture.ts`

