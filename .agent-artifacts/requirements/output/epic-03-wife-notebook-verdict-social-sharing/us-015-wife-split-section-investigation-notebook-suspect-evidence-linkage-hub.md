---
type: Requirement Story
epic: "Epic 03: Wife's Detective Notebook, Anytime Confrontation & Social Sharing"
status: draft
description: "Establishes the mobile-optimized 2A Detective Corkboard Node Canvas, declarative Knowledge Graph schema (System Scope 1C), tap-to-connect red-string pairing, and zero-spoiler alias resolution."
tags: [requirement, user-story, wife-notebook, node-graph, corkboard-canvas, zero-spoiler, mobile-ux]
timestamp: "2026-10-16T18:20:00+07:00"
---

# US-015 - Wife's Detective Corkboard Node Canvas & Zero-Spoiler Linkage Engine

### Epic: [Epic 03: Wife's Detective Notebook, Anytime Confrontation & Social Sharing](./epic.md)

---

### User Story Statement

As a jealous wife investigating suspicious traces across parody phone apps, I want to pan and pinch-to-zoom across a corkboard canvas to arrange clue nodes, connect relationship strings, and jump directly to any clue's original app location.

---

### Wireframe & UI Reference

- **Authoritative ASCII Wireframe SSOT**: [`wireframes/wireframe-us-015-corkboard-node-canvas.md`](./wireframes/wireframe-us-015-corkboard-node-canvas.md)
- **Parent App Design Specification**: [`wife-notebook/app-design.md`](../../../project-knowledge-base/solution-context/apps/phone-os/wife-notebook/app-design.md)
- **Master OS Design System**: [`phone-os/app-design.md`](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)

---

### Definitions & Domain Rules

- **System Scope 1C (End-to-End Declarative Graph)**: The case schema, authoring tools, and runtime engine operate on a unified Knowledge Graph (`CaseKnowledgeGraph`) composed of typed Nodes (`Suspect`, `Alias`, `BridgeIdentifier`, `RecordClue`, `TimelineSlot`) and typed Edges (`USES_ALIAS`, `BRIDGES_IDENTITY`, `OCCURRED_AT`, `CONTRADICTS_ALIBI`).
- **Strict Zero-Spoiler Alias Resolution Invariant**: Long-pressing narrative content via `StoryEvidenceTarget` (380ms) pins only the raw observable node (e.g., alias handle `"Anh Tuấn Thợ Điện"`, phone number `0988886677`, order record `order_01`). The game engine strictly forbids exposing the culprit suspect identity (`suspect_huong`) upon pinning. The suspect profile node is only resolved and unmasked when the player links the mystery alias to verifiable bridge identifiers on the board.
- **Mobile 2A Corkboard UX Paradigm**: The 2D node-link canvas operates inside the mobile portrait container (393px × 852px viewport) using:
  1. *Isolated Panning/Zooming*: Panning is handled via single-touch drag on empty canvas. Two-finger pinch gestures zoom the canvas continuously centered around the dynamic touch midpoint between 0.5x (macro overview) and 2.0x (close-up inspection) with boundary dampening. Panning and zooming gestures inside the canvas container apply `touch-action: none` and suppress OS swipe-back navigation (`useSwipeBack`).
  2. *Tap-to-Connect Pairing*: Connecting nodes uses a two-tap state machine (Tap Node A to highlight as source $\rightarrow$ Tap Node B to form a connecting red string) rather than micro cable dragging.
  3. *Unorganized Bottom Drawer ("Khay Manh Mối")*: Newly pinned items land in a collapsible bottom sheet drawer instead of automatically cluttering the active board. Players explicitly drag or tap "Đưa lên bảng" to place nodes.
  4. *Visual Mini-Map Radar*: A compact floating radar indicator (44px × 44px) shows the current viewport position relative to the overall 1200px × 1200px canvas bounds.
  5. *Cluster Snap on Merge*: When an Alias Node and a Bridge Node correctly link, they trigger a magnetic snap animation, grouping into a unified composite card to preserve screen real estate.
- **Clue Location Deep-Linking & Floating Return Navigation (`sourceAppId`, `recordRefId`)**:
  - Each clue node (whether placed on the corkboard canvas or queued in "Khay Manh Mối") carries provenance coordinates (`sourceAppId`, `recordRefId`, `clueRefId`).
  - Activating the dedicated location jump icon button (`IoNavigateOutline`) minimizes the Wife's Detective Notebook and deep-links directly to the original parody app and specific screen/conversation where the clue was discovered.
  - While viewing the source screen, an omnipresent top floating return pill (`[⤺ Quay lại Sổ tay]`, `IoReturnUpBackOutline`) remains anchored beneath the OS status bar (`z-index: 9999`).
  - Tapping the return pill immediately restores the Notebook, preserving the exact corkboard viewport coordinates, zoom level, drawer status, and draft connections.
  - Upon arrival at the target app screen, the system automatically scrolls the viewport to the source evidence item and applies a 1.5s subtle pulse-highlight effect (`ring-2 ring-fuchsia-500 ring-offset-2 animate-pulse`).

- **Corkboard Canvas Layout & Swimlane Architecture**:
  - *Virtual Canvas Extent*: $1200\text{px} \times 1200\text{px}$ coordinate plane centered by default at `(600, 600)`.
  - *3-Swimlane Magnetic Grid*:
    - **Left Swimlane ($X: 50 - 350\text{px}$)**: Reserved for `alias` (Vỏ bọc) and `suspect` (Hồ sơ nghi phạm) cards.
    - **Center Swimlane ($X: 450 - 750\text{px}$)**: Reserved for `bridge_id` (Cầu nối SĐT / Tên TK) and `record_clue` (Hóa đơn / Đơn hàng) cards.
    - **Right Swimlane ($X: 850 - 1150\text{px}$)**: Reserved for `timeline_slot` (Mốc giờ) and contradiction pairs (`contradicts_alibi`).
  - *Unorganized Bottom Drawer ("Khay Manh Mối Chưa Phân Loại")*:
    - Long-pressing any dynamic story evidence item in any virtual app (380ms) queues the card into this collapsible bottom sheet.
    - Players tap *"Đưa lên bảng"* to place the card onto the active board at the center of the viewport, or use *"Auto-Arrange"* to snap active cards into their designated swimlanes.

---

### Declarative Schema Contract (System Scope 1C)

```typescript
export type GraphNodeType = 
  | 'suspect'          // Canonical suspect profile (e.g., Hương Marketing)
  | 'alias'            // Disguised contact or handle (e.g., Anh Tuấn Thợ Điện)
  | 'bridge_id'        // Shared identifier (e.g., phone number, bank legal name)
  | 'record_clue'      // App record with evidence (e.g., Shopee dress order, Cơm Niêu receipt)
  | 'timeline_slot';   // Time marker (e.g., 20:46 vs 20:48)

export type GraphEdgeType =
  | 'uses_alias'          // Mystery contact uses disguised name
  | 'bridges_identity'    // Identifier links alias to legal suspect profile
  | 'occurred_at'         // Record belongs to a specific timestamp
  | 'contradicts_alibi';  // Two records contradict claimed whereabouts

export interface CaseGraphNode {
  nodeId: string;
  type: GraphNodeType;
  label: string;
  subtitle?: string;
  sourceAppId?: string;
  recordRefId?: string;
  clueRefId?: string;
  isInitialDisguise?: boolean;
  metadata?: Record<string, string>;
}

export interface CaseGraphEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: GraphEdgeType;
  isSmokingGun: boolean;
  explanationRoastHint?: string;
}

export interface CaseKnowledgeGraph {
  nodes: CaseGraphNode[];
  edges: CaseGraphEdge[];
  requiredSmokingGunEdgeIds: string[];
}
```

---

### Acceptance Criteria (Plain English)

#### 1. Canvas Viewport & Navigation Gestures
- 1.1. The Wife's Detective Notebook sheet mounts a dedicated "Bảng Điều Tra Nối Dây" corkboard canvas covering the full-bleed viewport, paired with a compact top-right floating stats overlay pill (`36px` visual / `44×44px` touch target) displaying placed clue count (`IoDocumentsOutline` in white `#F1F5F9`) and verified key smoking-gun connection progress (`IoGitBranchOutline` in `#E11D48`, formatted as `<verified>/<required>`, e.g. `2/2` for Level 1, excluding non-key or non-canonical edges), and a split bottom control bar (Back icon on the left; icon-only "Xếp gọn" + primary "Đối chất" pill on the right).
- 1.2. Touching and dragging on the empty corkboard background smoothly pans the canvas viewport across a 1200px × 1200px virtual canvas bounds.
- 1.3. Canvas dragging within the active board area prevents triggering the parent shell's `useSwipeBack` gesture handler.
- 1.4. Two-finger pinch gestures continuously scale the corkboard canvas centered around the dynamic touch focal midpoint, supporting a clamped zoom range between 0.5x (broad board overview) and 2.0x (close-up clue inspection) with spring boundary resistance. Double-tapping empty canvas toggles between 1.0x (normal) and 1.5x (zoomed). The bottom dock provides step zoom buttons ([+] +25%, [-] -25%) and a [100%] reset button with current zoom percentage readout.
- 1.5. A floating mini-map radar widget displays in the upper right corner, rendering the player's current viewport bounding box relative to the canvas extent. Tapping the mini-map centers the viewport on the largest node cluster.
- 1.6. An "Auto-Arrange" button in the bottom floating dock automatically aligns active nodes into tidy vertical swimlanes (Aliases on Left, Bridge Clues in Center, Alibis and Timestamps on Right).

#### 2. Unorganized Nodes Drawer ("Khay Manh Mối")
- 2.1. Pinned evidence items from any app do not spawn directly onto the canvas; they are placed into the collapsible bottom drawer ("Khay Manh Mối").
- 2.2. The drawer header displays a count badge of unplaced nodes (e.g., `3 thẻ chưa đưa lên bảng`).
- 2.3. Tapping "Đưa lên bảng" on any drawer card places the node at the center of the current canvas viewport and removes it from the drawer.
- 2.4. Tapping a filter chip (`Tất cả`, `Tin nhắn`, `Hoá đơn`, `SĐT`, `Thời gian`) filters the items shown inside the drawer.
- 2.5. Each drawer card includes a companion "Đi tới nguồn" button (`IoNavigateOutline`) that directly executes clue location deep-linking without requiring the card to be placed on the canvas first.

#### 3. Tap-to-Connect Pairing Interaction
- 3.1. Tapping the card body of an unselected node card on the canvas selects it as Node A, rendering a pulsing high-contrast outline and entering "Đang nối dây" pairing mode. Tapping the header's location jump icon (`IoNavigateOutline`) bypasses pairing mode and immediately triggers clue location deep-linking.
- 3.2. While in pairing mode, the top banner displays an active prompt with a `[Huỷ thao tác]` button (`IoCloseOutline`) to abort pairing.
- 3.3. Tapping a second node (Node B) completes the pairing, drawing an SVG yarn string line between Node A and Node B (yellow solid `#FBBF24` for neutral links, or red solid `#DC2626` when contradicting an alibi) and triggering a 30ms haptic vibration pulse.
- 3.4. Tapping an existing yarn string or long-pressing a connected node displays a context action sheet with a `[Cắt dây]` button (`IoCutOutline`) to sever the connection.
- 3.5. Duplicate edges between the same two nodes are prevented.

#### 4. Strict Zero-Spoiler Alias Resolution & Cluster Merging
- 4.1. When an Alias node (e.g., `"Anh Tuấn Thợ Điện"`) is placed on the canvas, it renders as a mystery contact card with masked avatar (`IoGlassesOutline`) and zero references to the true suspect (`suspect_huong`).
- 4.2. When the player links an Alias node to a Bridge Identifier node (e.g., phone number `0988886677`), and links that Bridge node to a verified recipient order or account name (`"Nguyễn Thị Thu Hương"`), the game engine validates the multi-hop connection against `CaseKnowledgeGraph`.
- 4.3. Upon validating the complete identity chain, the connected nodes trigger a celebratory merge animation and snap into an unmasked Suspect Cluster card (`NGUYỄN THỊ THU HƯƠNG - Marketing Technosoft`).
- 4.4. Incorrect or decoy connections remain visible on the board as player notes but do not trigger identity resolution or smoke-gun confirmation.

#### 5. Timeline Contradiction & Alibi Linkage
- 5.1. When two timestamped cards with contradictory claims (e.g., 20:46 Zola *"Đang họp công ty"* and 20:48 Banking *"Cơm Niêu Phố Cổ"*) are connected (`contradicts_alibi`), the edge renders as a red solid line (`#DC2626`) to denote the highest-priority conflict link, while all other non-contradiction edges render as neutral yellow solid lines (`#FBBF24`).
- 5.2. The contradiction card highlights with an exclamation badge indicating *"Mâu thuẫn ngoại phạm đã xác lập"*.

#### 6. Confrontation & Verdict Integration
- 6.1. A persistent progress counter at the bottom of the board displays current verified smoking-gun progress (e.g., `Tiến độ: 2/3 Bằng chứng cốt lõi`).
- 6.2. Tapping the "Phán quyết & Đối chất" tab passes the player's active graph connectivity state directly to the confrontation excuse engine (US-016: Anytime Confrontation Hub & Dynamic Excuse Engine).
- 6.3. If the player confronts the husband with 0 unmasked links, the husband uses dismissive gaslighting dialogue. If 2 links are verified, he stammers partial excuses. If all required smoking-gun edges are connected, he confesses fully for a 3-star victory.

#### 7. Clue Location Deep-Linking & Quick-Return Navigation
- 7.1. Each clue node card on the corkboard canvas displays a dedicated location jump icon button (`IoNavigateOutline`, touch target 36px × 36px) on its header, independent of the card body tap gesture.
- 7.2. Each unplaced clue card in the bottom drawer ("Khay Manh Mối") displays a companion "Đi tới nguồn" button (`IoNavigateOutline`) adjacent to "Đưa lên bảng".
- 7.3. Tapping the location jump action reads `sourceAppId` and `recordRefId`, minimizes the Wife's Detective Notebook, and navigates the virtual phone shell directly to the source app and specific record/conversation where the clue was originally found.
- 7.4. Upon navigating to the source screen, the viewport automatically scrolls to the source evidence item and triggers a 1.5s pulse-highlight effect (`ring-2 ring-fuchsia-500 ring-offset-2 animate-pulse`) around the target element.
- 7.5. While viewing the source screen via clue jump, an omnipresent top floating return pill (`[⤺ Quay lại Sổ tay]`, `IoReturnUpBackOutline`) docks at the top status area (`z-index: 9999`).
- 7.6. Tapping the "Quay lại Sổ tay" floating pill immediately restores the Wife's Detective Notebook, preserving the exact corkboard canvas viewport coordinates, zoom level, drawer sheet state, and any active pairing selection.

---

### Open Questions

None.

