---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Read-only inspection of photo library, video durations, forensic lightbox with hotspot magnification, EXIF metadata drawer with geotag map card, 4-digit PIN-protected hidden albums, and zero-spoiler evidence pinning."
tags: [requirement, user-story, screen, photos, gallery, media-forensics, ios-parody]
timestamp: "2026-10-22"
---

# US-008 - Photos Gallery & Media Forensics App Module

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player (Wife)**, I want to browse my husband's photo library, inspect EXIF capture timestamps and geotagged maps, zoom into reflective surfaces and car passenger seats for hidden details, and unlock protected hidden albums using discovered PIN codes so that I can collect visual forensic evidence for my investigation.

---

### Canonical Wireframe & Layout References

- **ASCII Wireframe (Screen SSOT)**: [`wireframe-photos-investigation.md`](./wireframes/wireframe-photos-investigation.md)
- **Functional Specification (SSOT)**: [`features.md`](../../../project-knowledge-base/solution-context/apps/phone-os/photos/features.md)
- **Visual Design Specification**: [`app-design.md`](../../../project-knowledge-base/solution-context/apps/phone-os/photos/app-design.md)
- **Zero-Spoiler Pinning Standard**: [`US-011`](../../epic-02-investigation-suspicion-mechanics/us-011-zero-spoiler-universal-long-press-clue-suspect-pinning.md)
- **Layout Reference 1 (Attached Image 1)**: iOS Photo Info Inspector Drawer (EXIF tabular parameters, camera specs, capture timestamp, and interactive geotag map with photo pin).
- **Layout Reference 2 (Attached Image 2)**: iOS Photo Library Grid View ("Thư viện", date range header, video duration badges, filter/select pills, and floating bottom navigation capsule).

---

### Acceptance Criteria

#### AC01: App Mount & Photo Library Grid View (`PhotoGridView`)
1. Launching Photos for a level that provisions it mounts the app in the virtual phone shell within 100ms with an Obsidian Black canvas (`#000000`).
2. The top header renders a large bold title "Thư viện" (Library), chronological date range grouping (e.g., *"1–15 thg 8, 2026"*, *"Hôm nay"*), a dark circular filter pill button (`[ ☰ ]`), and a rounded "Chọn" (Select) action button.
3. The photo grid renders media thumbnails in a dense multi-column layout (3 or 4 columns) ordered chronologically.
4. Video thumbnails display a duration overlay badge in the bottom-right corner (e.g. `0:13`, `0:26`, `2:40`) with white text on a semi-transparent dark rounded badge.
5. A floating frosted bottom navigation capsule renders over the bottom portion of the gallery with:
   - Photos tab icon glyph (`[🖼️]`),
   - Segmented view filter pills: "Năm" (Years), "Tháng" (Months), and "Tất cả" (All photos - active highlighted pill),
   - Search icon button (`[ 🔍 ]`).
6. Tapping "Năm", "Tháng", or "Tất cả" re-aggregates or filters the visible photo stream without modifying source data.
7. Tapping "Chọn" or the filter pill displays non-blocking read-only feedback without altering media or mutating case state.
8. If the current level supplies zero photos, the screen displays a centered message: *"Chưa có ảnh"*.

#### AC02: Interactive Forensic Lightbox View (`PhotoLightboxView`)
1. Tapping any photo thumbnail transitions to the full-screen Forensic Lightbox (`PhotoLightboxView`) on an Obsidian Black canvas (`#000000`) within 100ms.
2. The top bar displays a back button (`[◀ Thư viện]`), the narrative date/time of the photo, and an information toggle button (`[ ℹ️ ]`).
3. Double-tapping or pinch-to-zoom expands the image resolution up to 400% with smooth panning, enabling forensic inspection of subtle background details:
   - `CLUE-PHOT-02`: Zooming into a restaurant wine glass reflection reveals a woman's manicured hand and silhouette.
   - `CLUE-PHOT-03`: Inspecting a car dashboard photo reveals an unfamiliar designer female handbag sitting on the passenger seat.
4. The bottom iOS action toolbar displays 5 standard controls: Share (`[ ↑ ]`), Favorite (`[ ♡ ]`), Info (`[ ℹ️ ]`), Adjust/Filters (`[ ⊶ ]`), and Trash (`[ 🗑️ ]`).
5. Destructive and editing actions (Trash, Edit, Share) are disabled during investigation mode and display a brief toast: *"Không khả dụng trong chế độ điều tra"*.
6. Tapping Favorite toggles a local visual heart indicator without modifying case story configuration.

#### AC03: Photo Info & EXIF Metadata Drawer (Swipe-Up Inspector)
1. Tapping the Info button (`[ ℹ️ ]`) or swiping up on the lightbox image opens the Photo Info Drawer from the bottom, conforming to the attached reference layout.
2. The drawer displays:
   - Top cropped preview of the inspected photo.
   - Read-only caption header (*"Thêm chú thích"* placeholder or narrative caption if configured).
   - Formatted Vietnamese capture date and time (e.g. *"Lúc 18:37 Thứ Năm, ngày 22 tháng 10, 2026"*) alongside a blue *"Điều chỉnh"* link.
   - Cloud sync icon glyph with original image filename (e.g. `IMG_9422`).
3. The Camera & Hardware EXIF Card renders in a Charcoal Dark rounded box (`#1C1C1E`) containing:
   - Device model name (e.g., *"Apple iPhone 15 Pro"*) and file format badge (`[HEIF]` or `[JPEG]`).
   - Lens focal length and aperture (e.g., *"Camera chính — 24 mm ƒ1,78"*).
   - Sensor resolution, pixel dimensions, and file size (e.g., *"24 MP • 4284 × 5712 • 2,1 MB"*).
   - Tabular 5-column divider row displaying exact exposure metrics: `ISO [val]` | `[focal] mm` | `[ev] ev` | `ƒ[aperture]` | `[shutter] s` (e.g. `ISO 500 | 24 mm | 0 ev | ƒ1,78 | 1/50 s`).
4. The Geotag Map Card renders in a Charcoal Dark rounded box (`#1C1C1E`) containing:
   - Vector street map preview with neighborhood/street labels (e.g., *"P. Nghĩa Đô"*, *"HỒ TÙNG MẬU"*, *"QL.32"*).
   - Custom marker pin embedded with a miniature thumbnail of the photo pointing at the GPS coordinate.
   - Chevron and *"Điều chỉnh"* location link.
5. Tapping the full-width rounded button *"Xem trong Tất cả ảnh"* dismisses the info drawer and lightbox, returning the viewport to that photo's position in the main Library Grid.
6. EXIF timestamps and geotags reflect narrative case truth (e.g., late-night dinner geotag contradicting husband's claimed office overtime alibi).

#### AC04: Locked Hidden Folder Sub-system (`LockedAlbumGateModal`)
1. The app provides an entry point to the protected hidden folder (*"Mục bị ẩn"*) within Smart Collections or the Albums view, badged with an amber lock icon (`[🔒]` / `#FFC107`).
2. When the hidden album is locked (`hiddenAlbumLocked: true`), tapping *"Mục bị ẩn"* summons the polymorphic 4-digit PIN lockpad (`onRequestUnlock('lock_photos')`).
3. The required 4-digit numeric PIN corresponds to declarative clues discovered in other apps (e.g., secret date note in Notes `CLUE-NOTE-01`, calendar event `CLUE-NOTE-03`, or work anniversary in InkedLin `CLUE-LINK-01`).
4. Entering an incorrect PIN shakes the keypad, plays an error sound/haptic, and increments the suspicion strike counter according to Epic 02 rules (`us-013`).
5. Entering the correct PIN unlocks the hidden folder, persists the unlocked state in `unlockedChallenges`, and reveals protected compromising photos:
   - `CLUE-PHOT-01`: Intimate selfies and chat screenshots with the secret lover.
   - `CLUE-PHOT-04`: Innocent surprise photo (e.g. photo with sister holding an anniversary gift box for the wife).

#### AC05: Zero-Spoiler Universal Long-Press Clue Pinning (US-011 SSOT)
1. Pressing and holding any photo in the library grid, lightbox, or EXIF metadata card for at least 380ms triggers a 50ms haptic vibration pulse via `navigator.vibrate(50)` and opens the `UniversalEvidenceModal`.
2. Both genuine clues (`CLUE-PHOT-01` to `CLUE-PHOT-04`) and mundane everyday photos (cat on motorcycle seat, parking ticket, broken rice, company retreat) exhibit identical long-press behavior.
3. Photos and albums strictly contain zero glowing borders, magnifying badges, or visual tells prior to long-press inspection.
4. Permanent or visible "+ Ghim" / "+ Thêm Bằng Chứng" buttons are strictly absent from all gallery screens, headers, lightboxes, and info drawers.
5. Releasing the pointer before 380ms or dragging/scrolling more than 18px cancels the timer immediately. Short taps open the lightbox or toggle drawers.
6. Structural app chrome (status bar, back button, "Chọn" button, filter pill, floating bottom pill bar, and bottom toolbar action icons) strictly ignores long-press gestures.
7. Confirming pinning in the `UniversalEvidenceModal` saves the photo or metadata clue into the Wife's Detective Notebook under the designated suspect, closes the modal, and triggers a 2-second confirmation toast in the Dynamic Island.

#### AC06: Declarative Data Contract & Read-Only Source Integrity
1. The app consumes the declarative `PhotosData` structure defined in `features.md` from `caseData.appsData?.photos`.
2. Inspection, zooming, metadata viewing, and PIN unlocks operate entirely client-side without network requests and without mutating the source level configuration.

---

### Out of Scope

| ID | Description |
|---|---|
| OOS01 | Taking live photos, device camera integration, or uploading personal media. |
| OOS02 | Editing photos, applying image filters, cropping, or saving edited copies. |
| OOS03 | Deleting photos, moving photos to trash, or creating new custom albums. |
| OOS04 | Permanent or visible "+ Ghim" buttons on photos or screens. |
| OOS05 | External system sharing, AirDrop simulation, or cloud syncing. |

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Platform & Frame | Conforms to iOS phone shell container (393px × 852px) and global NFRs ([`vision-scope.md`](../vision-scope.md#4-key-constraints--non-functional-requirements-global)). |
| Latency SLA | Grid scrolling maintains 60fps; lightbox transitions open in $< 100\text{ms}$; EXIF drawer slides smoothly. |
| Touch Ergonomics | All buttons and interactive pills meet minimum $44 \times 44\text{px}$ touch targets; 18px jitter tolerance for long-press hold. |
| Color Tokens | Obsidian Black canvas (`#000000`), Charcoal Dark tiles (`#1C1C1E`), Slate Dark collections (`#2C2C2E`), Electric Blue accent (`#2979FF`), Amber Yellow lock (`#FFC107`), Pure White primary text (`#FFFFFF`), Muted Gray metadata (`#8E8E93`). |
| Iconography | Strictly Ionicons (`react-icons/io5`) or responsive vector SVGs (`IoImageOutline`, `IoImages`, `IoLockClosedOutline`, `IoInformationCircleOutline`, `IoShareOutline`, `IoHeartOutline`, `IoTrashOutline`, `IoSearchOutline`). Raw Unicode emojis in structural navigation are prohibited. |
| Localization | 100% authentic Vietnamese iOS Photos system terminology (*"Thư viện"*, *"Năm"*, *"Tháng"*, *"Tất cả"*, *"Mục bị ẩn"*, *"Chọn"*, *"Điều chỉnh"*, *"Xem trong Tất cả ảnh"*, *"Thêm chú thích"*). |

---

### Traceability & Clue Mapping

| Clue ID | Component / View | Forensic Discovery & Reveal | Case Truth Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-PHOT-01` | `LockedAlbumGateModal` • Hidden Folder | Enter 4-digit PIN -> Unlocks selfies and screenshots with lover. | Cheating | Medium |
| `CLUE-PHOT-02` | `PhotoLightboxView` • Reflection Magnifier | Zoom into wine glass -> Reveals woman's manicured hand and silhouette. | Cheating | Hard |
| `CLUE-PHOT-03` | `PhotoLightboxView` • Car Dashboard | Inspect dashboard photo -> Designer female handbag on passenger seat. | Cheating | Medium |
| `CLUE-PHOT-04` | `PhotoLightboxView` • Anniversary Photo | Unlock hidden folder -> Photo with sister holding anniversary gift box. | Innocent (Anniversary) | Hard |

---

### Open Questions

| Question ID | Question | Impact | Status |
|---|---|---|---|
| - | None. Scope, UI layout references, EXIF drawer architecture, and forensic clue mapping verified against canonical project specifications. | N/A | Closed |

---

### Citations

- [Photos Features Specification (SSOT)](../../../project-knowledge-base/solution-context/apps/phone-os/photos/features.md)
- [Photos App Design & UI/UX Specification](../../../project-knowledge-base/solution-context/apps/phone-os/photos/app-design.md)
- [US-011 Zero-Spoiler Universal Long-Press Clue Pinning](../../epic-02-investigation-suspicion-mechanics/us-011-zero-spoiler-universal-long-press-clue-suspect-pinning.md)
- [Clue Traceability Matrix](../../stories/clues/clue-traceability-matrix.md)
- [Canonical ASCII Wireframe](./wireframes/wireframe-photos-investigation.md)

