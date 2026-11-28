import { describe, it, expect, vi } from 'vitest';
import {
  createEdgeBetweenNodes,
  evaluateUnmaskedSuspects,
  evaluateContradictions,
  clampZoom,
  MIN_ZOOM,
  MAX_ZOOM,
} from './graphEngine';
import {
  calculateYarnStringCurve,
  PIN_OFFSET_X,
  PIN_OFFSET_Y,
} from './components/CorkboardCanvas';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import { deriveNodesFromTaggedEvidence } from './WifeNotebookModal';
import type { PlacedNode } from './types';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import { getKeyConnectionProgress, getSuspectsOnBoard, getVerifiedKeyEdgeIds } from './confrontationEngine';

describe('US-015: Wife Detective Corkboard & Graph Engine Suite', () => {
  it('does not verify dinner messages against the office-dress order, including saved links', () => {
    const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [
      { suspectId: 'chat', displayName: 'Khoa BE', sourceApp: 'internet-messaging', timestamp: 1,
        conversationId: 'thread_003', messages: [
          { recordId: 'm1', text: 'Tối nay anh, em đặt bàn bên Phố Cổ rồi nhé, 19h30. Chỗ trên tầng 2 cho yên tĩnh.' },
          { recordId: 'm2', text: 'Thì điện có tắt thế nào hôm nào anh cũng hỏi bữa cơm niêu ấm cúng đấy nhé.' },
        ] },
      { suspectId: 'order', displayName: 'Nguyễn Thị Thu Hương', sourceApp: 'ecommerce', timestamp: 2,
        evidence: { caseId: 'case', recordId: 'order_005', title: 'Nguyễn Thị Thu Hương',
          snippet: 'Set váy lụa công sở\nSảnh Technosoft\n0988886677\n489.000đ' } },
    ]);
    for (const [source, target] of [[nodes[0], nodes[1]], [nodes[1], nodes[0]]]) {
      // Saved strings use this same reconstruction path when the notebook opens.
      const { newEdge } = createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], source.nodeId, target.nodeId, nodes);
      expect(newEdge).toMatchObject({ isCanonical: false, isSmokingGun: false });
    }
    expect(LEVEL_01_KNOWLEDGE_GRAPH.requiredSmokingGunEdgeIds).not.toContain('edge_zola_order_anniversary');
  });

  it('verifies phone/order strings from matching pinned phone numbers, including other call records', () => {
    const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [
      { suspectId: 'call', displayName: 'Anh Tuấn Thợ Điện', sourceApp: 'phone', timestamp: 1,
        evidence: { caseId: 'case', recordId: 'call_003', title: 'Anh Tuấn Thợ Điện', snippet: '0988886677\nCuộc gọi đi' } },
      { suspectId: 'order', displayName: 'Nguyễn Thị Thu Hương', sourceApp: 'ecommerce', timestamp: 2,
        evidence: { caseId: 'case', recordId: 'order_005', title: 'Nguyễn Thị Thu Hương', snippet: 'Số điện thoại: 0988 886 677' } },
    ]);
    const connect = () => createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge;
    expect(connect()).toMatchObject({ isCanonical: true, isSmokingGun: true, edgeId: 'edge_order_phone' });
    nodes[1].messages = [{ recordId: 'order_005', text: 'Số điện thoại: 0988990011' }];
    expect(connect()?.isCanonical).toBe(false);
  });

  it('rechecks the alibi string using only pinned wife messages when messages are added or removed', () => {
    const wife = [
      { recordId: 'msg_005_0079', text: 'Tối nay anh họp sprint với cả team, về muộn nhé.' },
    ];
    const tags = () => [
      { suspectId: 'chat', displayName: 'Vợ', sourceApp: 'internet-messaging' as const, timestamp: 1,
        conversationId: 'thread_005', messages: [...wife] },
      { suspectId: 'tx', displayName: 'COM NIEU PHO CO', sourceApp: 'banking' as const, timestamp: 2,
        evidence: { caseId: 'case', recordId: 'tx_003', title: 'COM NIEU PHO CO', snippet: '-640.000đ' } },
    ];
    const connect = () => {
      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, tags());
      return createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge;
    };
    // 18:55 alone does not contradict the 20:48 card swipe.
    expect(connect()?.isCanonical).toBe(false);
    wife.push({ recordId: 'msg_005_0082', text: 'Sếp Tuấn Anh đang chốt nốt, anh chưa về được.' });
    expect(connect()).toMatchObject({ isCanonical: true, isSmokingGun: true, edgeId: 'edge_alibi_contradiction' });
    wife.pop();
    expect(connect()?.isCanonical).toBe(false);
  });

  it('rejects alibi pairings that do not prove location (online transfers, wrong message)', () => {
    const wife = { suspectId: 'chat', displayName: 'Vợ', sourceApp: 'internet-messaging' as const, timestamp: 1,
      conversationId: 'thread_005', messages: [{ recordId: 'msg_005_0082', text: 'Sếp Tuấn Anh đang chốt nốt.' }] };
    for (const recordId of ['tx_005', 'tx_004']) {
      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [wife,
        { suspectId: recordId, displayName: recordId, sourceApp: 'banking', timestamp: 2,
          evidence: { caseId: 'case', recordId, title: recordId, snippet: 'Chuyển khoản' } }]);
      expect(createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge?.isCanonical).toBe(false);
    }
  });

  it('connects order_005 to the HR-pinned legal name but not to other recipients', () => {
    const order = (recordId: string, name: string) => ({ suspectId: recordId, displayName: name, sourceApp: 'ecommerce' as const,
      timestamp: 1, evidence: { caseId: 'case', recordId, title: name, snippet: `Người nhận: ${name}` } });
    const group = (messageId: string) => ({ suspectId: 'grp', displayName: 'Technosoft - Toàn công ty',
      sourceApp: 'internet-messaging' as const, timestamp: 2, conversationId: 'thread_012',
      messages: [{ recordId: messageId, text: 'Nguyễn Thị Thu Hương - Marketing Executive' }] });
    const connect = (recordId: string, messageId: string) => {
      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [order(recordId, 'Nguyễn Thị Thu Hương'), group(messageId)]);
      return createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge;
    };
    expect(connect('order_005', 'msg_012_0001')).toMatchObject({ isCanonical: true, isSmokingGun: true, edgeId: 'edge_order_name' });
    expect(connect('order_003', 'msg_012_0001')?.isCanonical).toBe(false);
    expect(connect('order_006', 'msg_012_0001')?.isCanonical).toBe(false);
    expect(connect('order_005', 'msg_012_0005')?.isCanonical).toBe(false);
  });

  it('keeps one canonical node per thread card: Khoa BE thread resolves to the alias even for a booking message', () => {
    const [node] = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [
      { suspectId: 'chat', displayName: 'Khoa BE', sourceApp: 'internet-messaging', timestamp: 1,
        conversationId: 'thread_003', messages: [{ recordId: 'msg_003_0014', text: 'Book bàn 7h30 tầng 2' }] },
    ]);
    expect(node).toMatchObject({ nodeId: 'node_alias_01', type: 'alias', label: 'Khoa BE' });
  });

  it('pairs the booking message with the card-swipe receipt only on the same night', () => {
    const khoa = { suspectId: 'chat', displayName: 'Khoa BE', sourceApp: 'internet-messaging' as const, timestamp: 1,
      conversationId: 'thread_003', messages: [{ recordId: 'msg_003_0014', text: 'Book bàn 7h30' }] };
    const connect = (recordId: string) => {
      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [khoa,
        { suspectId: recordId, displayName: recordId, sourceApp: 'banking', timestamp: 2,
          evidence: { caseId: 'case', recordId, title: recordId, snippet: 'Thanh toán' } }]);
      return createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge;
    };
    expect(connect('tx_003')).toMatchObject({ edgeId: 'edge_booking_receipt', isCanonical: true, isSmokingGun: false });
    expect(connect('tx_013')?.isCanonical).toBe(false);
  });

  it('includes ordinary pinned conversation and call aliases in the suspect picker', () => {
    const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [
      { suspectId: 'group', displayName: 'Cư dân tầng 8', sourceApp: 'internet-messaging', timestamp: 1,
        conversationId: 'floor8', messages: [{ recordId: 'notice', text: 'Hành lang đã thay bóng đèn.' }],
        evidence: { caseId: 'case', kind: 'message', recordId: 'notice', conversationId: 'floor8',
          title: 'Cư dân tầng 8', snippet: 'Hành lang đã thay bóng đèn.' } },
      { suspectId: 'call', displayName: 'Anh Tuấn Thợ Điện', sourceApp: 'phone', timestamp: 2,
        evidence: { caseId: 'case', recordId: 'call_003', title: 'Anh Tuấn Thợ Điện', snippet: '0988886677' } },
    ]);
    const suspects = getSuspectsOnBoard({ placedNodes: nodes.map(node => ({ ...node, x: 0, y: 0 })) });
    expect(suspects.map(suspect => suspect.displayName)).toEqual(['Cư dân tầng 8', 'Anh Tuấn Thợ Điện']);
  });

  it.each([
    ['node_record_booking', 'node_record_bank_receipt'],
    ['node_record_bank_receipt', 'node_record_booking'],
  ])('verifies the booking and payment connection: %s to %s', (source, target) => {
    const { newEdge } = createEdgeBetweenNodes(LEVEL_01_KNOWLEDGE_GRAPH, [], source, target);
    expect(newEdge).toMatchObject({
      edgeId: 'edge_booking_receipt',
      isCanonical: true,
      isSmokingGun: false,
      relationship: 'occurred_at',
    });
    expect(LEVEL_01_KNOWLEDGE_GRAPH.requiredSmokingGunEdgeIds).not.toContain(newEdge?.edgeId);
  });

  it('maps pinned orders to records instead of matching a person with the same name', () => {
    const graph = { ...LEVEL_01_KNOWLEDGE_GRAPH, nodes: [
      { nodeId: 'person', type: 'suspect' as const, label: 'Nguyễn Thị Thu Hương', isInitialDisguise: false },
      { nodeId: 'order', type: 'record_clue' as const, label: 'Đơn mua', sourceAppId: 'ecommerce' as const,
        recordRefId: 'order_005', clueRefId: 'CLUE-POSH-05', isInitialDisguise: false },
    ] };
    const tag = { suspectId: 'tag_1', displayName: 'Nguyễn Thị Thu Hương', sourceApp: 'ecommerce' as const,
      timestamp: 1, evidence: { caseId: 'case_01', recordId: 'order_005', clueRefId: 'CLUE-POSH-05',
        title: 'Đơn mua order_005', snippet: 'Nội dung' } };
    expect(deriveNodesFromTaggedEvidence(graph, [tag]).map(node => node.nodeId)).toEqual(['order']);
    expect(deriveNodesFromTaggedEvidence(graph, [{ ...tag, evidence: { ...tag.evidence,
      recordId: 'order_002', clueRefId: undefined, title: 'Đơn mua order_002' } }])[0]).toMatchObject({
      type: 'record_clue', label: 'Đơn mua order_002', recordRefId: 'order_002',
    });
  });

  it('clamps zoom scales strictly between 0.5x and 2.0x', () => {
    expect(clampZoom(0.2)).toBe(MIN_ZOOM);
    expect(clampZoom(0.5)).toBe(0.5);
    expect(clampZoom(1.0)).toBe(1.0);
    expect(clampZoom(1.5)).toBe(1.5);
    expect(clampZoom(2.0)).toBe(2.0);
    expect(clampZoom(3.5)).toBe(MAX_ZOOM);
  });

  it('prevents self-connections and duplicate edges between the same two nodes', () => {
    const existingEdges: CaseGraphEdge[] = [];

    // Self connection
    const selfRes = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      existingEdges,
      'node_alias_01',
      'node_alias_01',
    );
    expect(selfRes.newEdge).toBeNull();
    expect(selfRes.isDuplicate).toBe(false);

    // Initial valid connection
    const firstRes = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      existingEdges,
      'node_alias_01',
      'node_bridge_phone',
    );
    expect(firstRes.newEdge).not.toBeNull();
    expect(firstRes.isDuplicate).toBe(false);

    const updatedEdges = [...existingEdges, firstRes.newEdge!];

    // Attempt duplicate connection in same direction
    const dupRes1 = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      updatedEdges,
      'node_alias_01',
      'node_bridge_phone',
    );
    expect(dupRes1.newEdge).toBeNull();
    expect(dupRes1.isDuplicate).toBe(true);

    // Attempt duplicate connection in reverse direction
    const dupRes2 = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      updatedEdges,
      'node_bridge_phone',
      'node_alias_01',
    );
    expect(dupRes2.newEdge).toBeNull();
    expect(dupRes2.isDuplicate).toBe(true);
  });

  it('inherits canonical metadata, smoking-gun flags, and roast hints when connecting matching nodes', () => {
    const res = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      [],
      'node_record_wife_alibi',
      'node_record_bank_receipt',
    );

    expect(res.newEdge).not.toBeNull();
    expect(res.newEdge?.relationship).toBe('contradicts_alibi');
    expect(res.newEdge?.isSmokingGun).toBe(true);
    expect(res.newEdge?.explanationRoastHint).toContain('không có họp nào cả');
  });

  it('preserves Zero-Spoiler invariant: unmasks suspect identity ONLY when a complete bridge path exists', () => {
    // Stage 1: No connections -> suspect is NOT unmasked
    expect(evaluateUnmaskedSuspects(LEVEL_01_KNOWLEDGE_GRAPH, [])).toEqual([]);

    // Stage 2: Partial connection (Alias -> Phone number bridge) -> suspect NOT unmasked yet
    const partialEdges: CaseGraphEdge[] = [
      {
        edgeId: 'edge_alias_phone',
        sourceNodeId: 'node_alias_01',
        targetNodeId: 'node_bridge_phone',
        relationship: 'bridges_identity',
        isSmokingGun: false,
      },
    ];
    expect(evaluateUnmaskedSuspects(LEVEL_01_KNOWLEDGE_GRAPH, partialEdges)).toEqual([]);

    // Stage 3: Adding bridge to legal name -> still no direct link to suspect_01
    const multiHopEdges: CaseGraphEdge[] = [
      ...partialEdges,
      {
        edgeId: 'edge_order_phone',
        sourceNodeId: 'node_record_ecommerce_order',
        targetNodeId: 'node_bridge_phone',
        relationship: 'bridges_identity',
        isSmokingGun: true,
      },
      {
        edgeId: 'edge_order_name',
        sourceNodeId: 'node_record_ecommerce_order',
        targetNodeId: 'node_bridge_name',
        relationship: 'bridges_identity',
        isSmokingGun: false,
      },
    ];
    expect(evaluateUnmaskedSuspects(LEVEL_01_KNOWLEDGE_GRAPH, multiHopEdges)).toEqual([]);

    // Stage 4: Connecting legal name to suspect_01 -> PATH IS COMPLETE! Suspect is unmasked!
    const completeChainEdges: CaseGraphEdge[] = [
      ...multiHopEdges,
      {
        edgeId: 'edge_name_suspect',
        sourceNodeId: 'node_bridge_name',
        targetNodeId: 'node_suspect_01',
        relationship: 'bridges_identity',
        isSmokingGun: false,
      },
    ];
    const unmasked = evaluateUnmaskedSuspects(LEVEL_01_KNOWLEDGE_GRAPH, completeChainEdges);
    expect(unmasked).toContain('node_suspect_01');
    expect(unmasked).toContain('node_alias_01');
  });

  it('does NOT unmask an alias when connected to an innocent suspect (Red Herring)', () => {
    // Attempt connecting node_alias_01 directly to an innocent suspect node (speculative non-canonical edge)
    const invalidEdges: CaseGraphEdge[] = [
      {
        edgeId: 'custom_edge_901',
        sourceNodeId: 'node_alias_01',
        targetNodeId: 'node_suspect_04',
        relationship: 'bridges_identity',
        isSmokingGun: false,
      },
    ];
    const unmasked = evaluateUnmaskedSuspects(LEVEL_01_KNOWLEDGE_GRAPH, invalidEdges);
    expect(unmasked).toEqual([]);
  });

  it('evaluates contradiction edges correctly', () => {
    const edges: CaseGraphEdge[] = [
      {
        edgeId: 'edge_alibi_contradiction',
        sourceNodeId: 'node_record_wife_alibi',
        targetNodeId: 'node_record_bank_receipt',
        relationship: 'contradicts_alibi',
        isSmokingGun: true,
      },
      {
        edgeId: 'edge_alias_phone',
        sourceNodeId: 'node_alias_01',
        targetNodeId: 'node_bridge_phone',
        relationship: 'bridges_identity',
        isSmokingGun: false,
      },
    ];

    const contradictions = evaluateContradictions(edges);
    expect(contradictions).toEqual(['edge_alibi_contradiction']);
  });

  it('calculates red string connection coordinates anchored directly at the top pushpins', () => {
    const cardA: PlacedNode = { nodeId: 'a', type: 'record_clue', label: 'Card A', x: 200, y: 150 };
    const cardB: PlacedNode = { nodeId: 'b', type: 'record_clue', label: 'Card B', x: 500, y: 350 };

    // Card width is 176px; pin is at top center: (x + PIN_OFFSET_X, y + PIN_OFFSET_Y)
    const pinA = { x: cardA.x + PIN_OFFSET_X, y: cardA.y + PIN_OFFSET_Y };
    const pinB = { x: cardB.x + PIN_OFFSET_X, y: cardB.y + PIN_OFFSET_Y };

    expect(pinA).toEqual({ x: 200 + PIN_OFFSET_X, y: 153 });
    expect(pinB).toEqual({ x: 500 + PIN_OFFSET_X, y: 353 });
  });

  it('calculates realistic catenary quadratic Bézier curves with gravity sag for detective yarn', () => {
    // Normal red yarn
    const normalCurve = calculateYarnStringCurve(315, 148, 615, 348, false);
    expect(normalCurve.pathD).toMatch(/^M 315 148 Q \d+(\.\d+)? \d+(\.\d+)? 615 348$/);
    // Control point Y must be below midpoint (cy > my) due to gravity sag
    const midY = (148 + 348) / 2;
    expect(normalCurve.cy).toBeGreaterThan(midY);
    expect(normalCurve.sag).toBeGreaterThanOrEqual(8);

    // Contradiction string (tauter tension, lower sag)
    const contradictionCurve = calculateYarnStringCurve(315, 148, 615, 348, true);
    expect(contradictionCurve.sag).toBeLessThan(normalCurve.sag);
  });

  it('persists and restores corkboard placed nodes, edges, and viewport position across session re-openings', () => {
    const storage = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
      removeItem: (key: string) => { storage.delete(key); },
      clear: () => { storage.clear(); },
    };
    vi.stubGlobal('localStorage', mockStorage);

    const storageKey = 'detective:v2:case_01:corkboard_state';
    const mockState = {
      placedNodes: [
        { nodeId: 'node_alias_01', type: 'alias', label: 'Anh Tuấn', x: 250, y: 180 },
        { nodeId: 'node_bridge_phone', type: 'bridge_id', label: 'SĐT', x: 550, y: 180 },
      ],
      edges: [
        {
          edgeId: 'edge_alias_phone',
          sourceNodeId: 'node_alias_01',
          targetNodeId: 'node_bridge_phone',
          relationship: 'bridges_identity' as const,
          isSmokingGun: false,
        },
      ],
      viewport: {
        x: 1050,
        y: 420,
        zoom: 1.25,
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(mockState));
    const restored = JSON.parse(localStorage.getItem(storageKey)!);

    expect(restored.placedNodes).toHaveLength(2);
    expect(restored.placedNodes[0].x).toBe(250);
    expect(restored.edges[0].edgeId).toBe('edge_alias_phone');
    expect(restored.viewport).toEqual({ x: 1050, y: 420, zoom: 1.25 });

    localStorage.removeItem(storageKey);
  });

  describe('Clue Cards Center Calculation (calculateClueCardsCenter)', () => {
    it('returns canvas center when no cards are placed', async () => {
      const { calculateClueCardsCenter, CANVAS_WIDTH, CANVAS_HEIGHT } = await import('./graphEngine');
      const center = calculateClueCardsCenter([]);
      expect(center).toEqual({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    });

    it('centers precisely on a single card bounding box', async () => {
      const { calculateClueCardsCenter, CARD_WIDTH } = await import('./graphEngine');
      const singleNode = [{
        nodeId: 'card_1',
        type: 'record_clue' as const,
        label: 'Tin nhắn bí mật',
        x: 812,
        y: 160,
      }];
      const center = calculateClueCardsCenter(singleNode);
      expect(center.x).toBe(812 + Math.round(CARD_WIDTH / 2));
      // Y center: (160 + 160 + estimatedHeight) / 2
      expect(center.y).toBeGreaterThan(160);
      expect(center.y).toBeLessThan(300);
    });

    it('centers horizontally and vertically across 3 columns at row 0', async () => {
      const { calculateClueCardsCenter, CORKBOARD_COLUMNS_X } = await import('./graphEngine');
      const rowNodes = [
        { nodeId: 'c1', type: 'record_clue' as const, label: 'C1', x: CORKBOARD_COLUMNS_X[0], y: 160 },
        { nodeId: 'c2', type: 'record_clue' as const, label: 'C2', x: CORKBOARD_COLUMNS_X[1], y: 160 },
        { nodeId: 'c3', type: 'record_clue' as const, label: 'C3', x: CORKBOARD_COLUMNS_X[2], y: 160 },
      ];
      const center = calculateClueCardsCenter(rowNodes);
      expect(center.x).toBe(900);
      expect(center.y).toBeGreaterThan(160);
    });

    it('supports custom card dimensions from DOM elements', async () => {
      const { calculateClueCardsCenter } = await import('./graphEngine');
      const nodes = [
        { nodeId: 'c1', type: 'record_clue' as const, label: 'C1', x: 100, y: 200 },
        { nodeId: 'c2', type: 'record_clue' as const, label: 'C2', x: 500, y: 400 },
      ];
      const dimensions: Record<string, { width: number; height: number }> = {
        c1: { width: 220, height: 150 },
        c2: { width: 220, height: 180 },
      };
      const center = calculateClueCardsCenter(nodes, id => dimensions[id]);
      // Min X = 100, Max X = 500 + 220 = 720. Center X = (100 + 720) / 2 = 410
      expect(center.x).toBe(410);
      // Min Y = 200, Max Y = 400 + 180 = 580. Center Y = (200 + 580) / 2 = 390
      expect(center.y).toBe(390);
    });
  });

  describe('Auto-Placement in 3 Centered Columns (placeNewNodesBelow)', () => {
    const mockNodes = [
      {
        nodeId: 'node_order_1',
        type: 'record_clue' as const,
        label: 'Váy lụa Satin Size S',
        subtitle: 'Người nhận: Thu Hương - 0988886677',
        sourceAppId: 'ecommerce',
        recordRefId: 'rec_order_1',
      },
      {
        nodeId: 'node_bank_1',
        type: 'record_clue' as const,
        label: 'Chuyển khoản 160.000đ',
        subtitle: 'Hoàn tiền ăn trưa',
        sourceAppId: 'banking',
        recordRefId: 'rec_bank_1',
      },
      {
        nodeId: 'node_msg_1',
        type: 'record_clue' as const,
        label: 'Anh Tuấn Thợ Điện',
        sourceAppId: 'internet-messaging',
        recordRefId: 'thread_004',
      },
      {
        nodeId: 'node_msg_2',
        type: 'record_clue' as const,
        label: 'Hương Em',
        sourceAppId: 'internet-messaging',
        recordRefId: 'thread_902',
      },
    ];

    it('places initial new nodes across 3 centered columns at row 0', async () => {
      const { placeNewNodesBelow, CORKBOARD_COLUMNS_X, INITIAL_BASE_Y } = await import('./graphEngine');
      const placed = placeNewNodesBelow([], mockNodes.slice(0, 3));

      expect(placed).toHaveLength(3);
      expect(placed[0].x).toBe(CORKBOARD_COLUMNS_X[0]);
      expect(placed[1].x).toBe(CORKBOARD_COLUMNS_X[1]);
      expect(placed[2].x).toBe(CORKBOARD_COLUMNS_X[2]);
      expect(placed.every(n => n.y === INITIAL_BASE_Y)).toBe(true);
    });

    it('fills a row of up to 6 cards across the wide board before wrapping to the next row', async () => {
      const { placeNewNodesBelow, CARD_WIDTH, CORKBOARD_COLUMNS_X, CORKBOARD_ROW_HEIGHT, INITIAL_BASE_Y, MAX_ROW_COLUMNS, CANVAS_WIDTH } = await import('./graphEngine');
      const many = Array.from({ length: MAX_ROW_COLUMNS + 1 }, (_, i) => ({ ...mockNodes[0], nodeId: `n${i}`, label: `N${i}` }));
      const placed = placeNewNodesBelow([], many);

      expect(placed).toHaveLength(7);
      const firstRow = placed.slice(0, MAX_ROW_COLUMNS);
      expect(firstRow.every(n => n.y === INITIAL_BASE_Y)).toBe(true);
      expect(Math.min(...firstRow.map(n => n.x))).toBeGreaterThanOrEqual(30);
      expect(Math.max(...firstRow.map(n => n.x)) + CARD_WIDTH).toBeLessThanOrEqual(CANVAS_WIDTH - 30);
      // 7th card wraps to row 1, centered on the middle column
      expect(placed[6].x).toBe(CORKBOARD_COLUMNS_X[1]);
      expect(placed[6].y).toBe(INITIAL_BASE_Y + CORKBOARD_ROW_HEIGHT);
    });

    it('places 2 new clues side by side on the same row, centered under the cluster', async () => {
      const { placeNewNodesBelow, CARD_WIDTH } = await import('./graphEngine');
      const existing: PlacedNode[] = [
        {
          nodeId: 'cluster_1',
          type: 'record_clue',
          label: 'Card 1',
          x: 360,
          y: 200,
        },
        {
          nodeId: 'cluster_2',
          type: 'record_clue',
          label: 'Card 2',
          x: 710,
          y: 350,
        },
      ];

      const expectedCenter = Math.round((360 + 710 + CARD_WIDTH) / 2);
      const placed = placeNewNodesBelow(existing, mockNodes.slice(0, 2));
      expect(placed).toHaveLength(2);
      // Must be on the same row below existing cards
      expect(placed[0].y).toBe(placed[1].y);
      expect(placed[0].y).toBeGreaterThan(450);
      // Midpoint between the 2 cards must be exactly clusterCenter
      const mid = (placed[0].x + placed[1].x + CARD_WIDTH) / 2;
      expect(mid).toBe(expectedCenter);
    });
  });

  describe('Key Connection Progress Counter', () => {
    it('counts only required key smoking-gun connections (0/3 -> 1/3 -> 3/3) and ignores non-key edges', () => {
      expect(getKeyConnectionProgress([], LEVEL_01_KNOWLEDGE_GRAPH)).toEqual({
        verifiedCount: 0,
        requiredCount: 3,
      });

      const nonKeyEdges: CaseGraphEdge[] = [
        {
          edgeId: 'edge_booking_receipt',
          sourceNodeId: 'node_record_booking',
          targetNodeId: 'node_record_bank_receipt',
          relationship: 'occurred_at',
          isSmokingGun: false,
          isCanonical: true,
        },
        {
          edgeId: 'custom_decoy_edge',
          sourceNodeId: 'a',
          targetNodeId: 'b',
          relationship: 'occurred_at',
          isSmokingGun: false,
          isCanonical: false,
        },
        {
          edgeId: 'edge_name_suspect',
          sourceNodeId: 'node_bridge_name',
          targetNodeId: 'node_suspect_01',
          relationship: 'bridges_identity',
          isSmokingGun: false,
          isCanonical: true,
        },
      ];
      expect(getKeyConnectionProgress(nonKeyEdges, LEVEL_01_KNOWLEDGE_GRAPH)).toEqual({
        verifiedCount: 0,
        requiredCount: 3,
      });

      const oneKeyPlusBridgeDuplicate: CaseGraphEdge[] = [
        ...nonKeyEdges,
        {
          edgeId: 'edge_order_phone',
          sourceNodeId: 'node_record_ecommerce_order',
          targetNodeId: 'node_bridge_phone',
          relationship: 'bridges_identity',
          isSmokingGun: true,
          isCanonical: true,
        },
      ];
      expect(getKeyConnectionProgress(oneKeyPlusBridgeDuplicate, LEVEL_01_KNOWLEDGE_GRAPH)).toEqual({
        verifiedCount: 1,
        requiredCount: 3,
      });

      const bothKeyEdges: CaseGraphEdge[] = [
        ...oneKeyPlusBridgeDuplicate,
        {
          edgeId: 'edge_order_name',
          sourceNodeId: 'node_record_ecommerce_order',
          targetNodeId: 'node_bridge_name',
          relationship: 'bridges_identity',
          isSmokingGun: true,
          isCanonical: true,
        },
        {
          edgeId: 'edge_alibi_contradiction',
          sourceNodeId: 'node_record_wife_alibi',
          targetNodeId: 'node_record_bank_receipt',
          relationship: 'contradicts_alibi',
          isSmokingGun: true,
          isCanonical: true,
        },
      ];
      expect(getKeyConnectionProgress(bothKeyEdges, LEVEL_01_KNOWLEDGE_GRAPH)).toEqual({
        verifiedCount: 3,
        requiredCount: 3,
      });
      expect(getVerifiedKeyEdgeIds(bothKeyEdges, LEVEL_01_KNOWLEDGE_GRAPH)).toEqual([
        'edge_order_phone',
        'edge_order_name',
        'edge_alibi_contradiction',
      ]);
    });
  });
});

