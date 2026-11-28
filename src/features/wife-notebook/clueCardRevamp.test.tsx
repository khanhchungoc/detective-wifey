import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  formatEventDateTime,
  formatMessageBullet,
  tagSuspect,
  normalizeTaggedSuspects,
  removePinnedMessage,
  removePinnedCard,
  restorePinnedEvidence,
  type EvidenceSource,
  type PinnedMessageItem,
} from '../investigation';
import { deriveNodesFromTaggedEvidence } from './WifeNotebookModal';
import { createEdgeBetweenNodes, placeNewNodesBelow } from './graphEngine';
import { CorkboardCanvas } from './components/CorkboardCanvas';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import type { CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { PlacedNode } from './types';
import { ContactAvatar } from '../../shared/ui/ContactAvatar';
import { IoChatbubbleOutline } from 'react-icons/io5';

describe('Clue Card Revamp & Pinning Invariants Suite', () => {
  describe('formatEventDateTime & formatMessageBullet', () => {
    it('formats date and time together with dot separator', () => {
      expect(formatEventDateTime('28/09', '12:10')).toBe('28/09 · 12:10');
    });

    it('formats time only when date is absent', () => {
      expect(formatEventDateTime(undefined, '12:10')).toBe('12:10');
    });

    it('formats date only when time is absent', () => {
      expect(formatEventDateTime('28/09')).toBe('28/09');
    });

    it('formats ISO rawTimestamp fallback when neither time nor date provided', () => {
      const formatted = formatEventDateTime(undefined, undefined, '2026-09-28T12:10:00Z');
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('28/09');
    });

    it('returns empty string when no temporal data is provided', () => {
      expect(formatEventDateTime()).toBe('');
    });

    it('formats message bullet with event timestamp and quotes', () => {
      const msg: PinnedMessageItem = {
        recordId: 'msg_01',
        text: 'Em đang đợi ở sảnh.',
        eventTime: '12:10',
        eventDate: '28/09',
      };
      expect(formatMessageBullet(msg)).toBe('• 28/09 · 12:10: "Em đang đợi ở sảnh."');
    });

    it('formats message bullet with time only if date is not specified', () => {
      const msg: PinnedMessageItem = {
        recordId: 'msg_02',
        text: 'Anh tới liền.',
        eventTime: '12:15',
      };
      expect(formatMessageBullet(msg)).toBe('• 12:15: "Anh tới liền."');
    });

    it('formats message bullet without timestamp if none exists', () => {
      const msg: PinnedMessageItem = {
        recordId: 'msg_03',
        text: 'Tin nhắn bí mật',
      };
      expect(formatMessageBullet(msg)).toBe('• "Tin nhắn bí mật"');
    });
  });

  describe('Investigation Evidence Aggregation & Pinning', () => {
    const caseId = 'case_01';

    it('pins identity-only conversation with empty body and isExplicitConversationPin: true', () => {
      const conversationSource: EvidenceSource = {
        caseId,
        recordId: 'thread_901',
        title: 'Hương Em',
        snippet: '',
        kind: 'conversation',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        isExplicitConversationPin: true,
      };

      const result = tagSuspect([], 'Hương Em', 'internet-messaging', 100, conversationSource);
      expect(result.added).toBe(true);
      expect(result.suspects).toHaveLength(1);

      const tagged = result.suspects[0];
      expect(tagged.displayName).toBe('Hương Em');
      expect(tagged.sourceApp).toBe('internet-messaging');
      expect(tagged.conversationId).toBe('thread_901');
      expect(tagged.isExplicitConversationPin).toBe(true);
      expect(tagged.messages).toEqual([]);
      expect(tagged.evidence?.snippet).toBe('');
    });

    it('aggregates multiple pinned messages from the same conversation into ONE clue card', () => {
      const conversationSource: EvidenceSource = {
        caseId,
        recordId: 'thread_901',
        title: 'Hương Em',
        snippet: '',
        kind: 'conversation',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        isExplicitConversationPin: true,
      };

      // Step 1: Pin conversation
      const step1 = tagSuspect([], 'Hương Em', 'internet-messaging', 100, conversationSource);
      expect(step1.added).toBe(true);

      // Step 2: Pin message 1
      const msg1Source: EvidenceSource = {
        caseId,
        recordId: 'msg_101',
        title: 'Hương Em',
        snippet: 'Em đợi anh ở khách sạn Metropole.',
        kind: 'message',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        eventTime: '12:10',
        eventDate: '28/09',
      };
      const step2 = tagSuspect(step1.suspects, 'Hương Em', 'internet-messaging', 101, msg1Source);
      expect(step2.added).toBe(true);
      expect(step2.suspects).toHaveLength(1);
      expect(step2.suspects[0].messages).toHaveLength(1);
      expect(step2.suspects[0].messages![0].recordId).toBe('msg_101');
      expect(step2.suspects[0].messages![0].text).toBe('Em đợi anh ở khách sạn Metropole.');

      // Step 3: Pin message 2 from same conversation
      const msg2Source: EvidenceSource = {
        caseId,
        recordId: 'msg_102',
        title: 'Hương Em',
        snippet: 'Đừng quên xóa tin nhắn nhé.',
        kind: 'message',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        eventTime: '12:15',
        eventDate: '28/09',
      };
      const step3 = tagSuspect(step2.suspects, 'Hương Em', 'internet-messaging', 102, msg2Source);
      expect(step3.added).toBe(true);
      expect(step3.suspects).toHaveLength(1);
      expect(step3.suspects[0].messages).toHaveLength(2);
      expect(step3.suspects[0].messages![1].recordId).toBe('msg_102');
    });

    it('rejects duplicate message in the same conversation', () => {
      const msg1Source: EvidenceSource = {
        caseId,
        recordId: 'msg_101',
        title: 'Hương Em',
        snippet: 'Em đợi anh ở sảnh.',
        kind: 'message',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        eventTime: '12:10',
      };

      const step1 = tagSuspect([], 'Hương Em', 'internet-messaging', 100, msg1Source);
      expect(step1.added).toBe(true);

      // Attempt to pin same message again
      const step2 = tagSuspect(step1.suspects, 'Hương Em', 'internet-messaging', 101, msg1Source);
      expect(step2.added).toBe(false);
      expect(step2.suspects[0].messages).toHaveLength(1);
    });

    it('preserves existing messages when conversation is explicitly pinned later', () => {
      const msgSource: EvidenceSource = {
        caseId,
        recordId: 'msg_101',
        title: 'Hương Em',
        snippet: 'Tin nhắn trước đó.',
        kind: 'message',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
      };

      const step1 = tagSuspect([], 'Hương Em', 'internet-messaging', 100, msgSource);
      expect(step1.suspects[0].isExplicitConversationPin).toBe(false);
      expect(step1.suspects[0].messages).toHaveLength(1);

      // Now pin conversation explicitly
      const conversationSource: EvidenceSource = {
        caseId,
        recordId: 'thread_901',
        title: 'Hương Em',
        snippet: '',
        kind: 'conversation',
        conversationId: 'thread_901',
        visibleAlias: 'Hương Em',
        isExplicitConversationPin: true,
      };

      const step2 = tagSuspect(step1.suspects, 'Hương Em', 'internet-messaging', 101, conversationSource);
      expect(step2.added).toBe(true);
      expect(step2.suspects).toHaveLength(1);
      expect(step2.suspects[0].isExplicitConversationPin).toBe(true);
      expect(step2.suspects[0].messages).toHaveLength(1);
      expect(step2.suspects[0].messages![0].recordId).toBe('msg_101');
    });
  });

  describe('Message and Card Deletion & Retention Rules', () => {
    it('removes single message while keeping remaining messages', () => {
      const initial = [
        {
          suspectId: 's1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          conversationId: 'thread_1',
          isExplicitConversationPin: true,
          messages: [
            { recordId: 'm1', text: 'Msg 1' },
            { recordId: 'm2', text: 'Msg 2' },
          ],
          evidence: {
            caseId: 'case_1',
            recordId: 'thread_1',
            title: 'Hương Em',
            snippet: '',
          },
        },
      ];

      const { suspects: updated, removedMessage } = removePinnedMessage(initial, 'thread_1', 'm1');
      expect(removedMessage?.recordId).toBe('m1');
      expect(updated).toHaveLength(1);
      expect(updated[0].messages).toHaveLength(1);
      expect(updated[0].messages![0].recordId).toBe('m2');
    });

    it('retains title-only card when last message is removed IF conversation was explicitly pinned', () => {
      const initial = [
        {
          suspectId: 's1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          conversationId: 'thread_1',
          isExplicitConversationPin: true,
          messages: [{ recordId: 'm1', text: 'Msg 1' }],
          evidence: {
            caseId: 'case_1',
            recordId: 'thread_1',
            title: 'Hương Em',
            snippet: '',
          },
        },
      ];

      const { suspects: updated, removedMessage, removedCard } = removePinnedMessage(initial, 'thread_1', 'm1');
      expect(removedMessage?.recordId).toBe('m1');
      expect(Boolean(removedCard)).toBe(false);
      expect(updated).toHaveLength(1);
      expect(updated[0].messages).toHaveLength(0);
      expect(updated[0].isExplicitConversationPin).toBe(true);
    });

    it('removes entire card when last message is removed IF conversation was NOT explicitly pinned', () => {
      const initial = [
        {
          suspectId: 's1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          conversationId: 'thread_1',
          isExplicitConversationPin: false,
          messages: [{ recordId: 'm1', text: 'Msg 1' }],
          evidence: {
            caseId: 'case_1',
            recordId: 'm1',
            title: 'Hương Em',
            snippet: 'Msg 1',
          },
        },
      ];

      const { suspects: updated, removedMessage, removedCard } = removePinnedMessage(initial, 'thread_1', 'm1');
      expect(removedMessage?.recordId).toBe('m1');
      expect(Boolean(removedCard)).toBe(true);
      expect(updated).toHaveLength(0);
    });

    it('removes whole card via removePinnedCard', () => {
      const initial = [
        {
          suspectId: 's1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          evidence: {
            caseId: 'case_1',
            recordId: 'rec_1',
            title: 'Hương Em',
            snippet: '',
          },
        },
      ];

      const { suspects: updated, removedCard } = removePinnedCard(initial, 'rec_1');
      expect(removedCard).toBeDefined();
      expect(removedCard?.evidence?.recordId).toBe('rec_1');
      expect(updated).toHaveLength(0);
    });
  });

  describe('Undo Restoration', () => {
    it('restores removed card to tagged list', () => {
      const card = {
        suspectId: 's1',
        displayName: 'Hương Em',
        sourceApp: 'internet-messaging' as const,
        timestamp: 100,
        evidence: {
          caseId: 'case_1',
          recordId: 'rec_1',
          title: 'Hương Em',
          snippet: '',
        },
      };

      const restored = restorePinnedEvidence([], { card });
      expect(restored).toHaveLength(1);
      expect(restored[0].suspectId).toBe('s1');
    });

    it('restores removed message back into the card', () => {
      const initial = [
        {
          suspectId: 's1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          conversationId: 'thread_1',
          isExplicitConversationPin: true,
          messages: [{ recordId: 'm2', text: 'Msg 2' }],
          evidence: {
            caseId: 'case_1',
            recordId: 'thread_1',
            title: 'Hương Em',
            snippet: '',
          },
        },
      ];

      const messageToRestore: PinnedMessageItem = {
        recordId: 'm1',
        text: 'Msg 1',
        eventTime: '12:00',
      };

      const restored = restorePinnedEvidence(initial, {
        targetId: 'thread_1',
        message: messageToRestore,
      });

      expect(restored).toHaveLength(1);
      expect(restored[0].messages).toHaveLength(2);
      expect(restored[0].messages!.map(m => m.recordId)).toContain('m1');
    });
  });

  describe('Knowledge Graph Node Derivation', () => {
    it('derives aggregated conversation nodes with messages and visible alias', () => {
      const tagged = [
        {
          suspectId: 'tag_1',
          displayName: 'Hương Em',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          conversationId: 'thread_902',
          visibleAlias: 'Hương Em',
          isExplicitConversationPin: true,
          messages: [
            { recordId: 'm1', text: 'Gặp em nhé', eventTime: '12:00', eventDate: '28/09' },
          ],
          evidence: {
            caseId: 'case_1',
            recordId: 'thread_902',
            title: 'Hương Em',
            snippet: '',
          },
        },
      ];

      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, tagged);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].visibleAlias).toBe('Hương Em');
      expect(nodes[0].conversationId).toBe('thread_902');
      expect(nodes[0].isExplicitConversationPin).toBe(true);
      expect(nodes[0].messages).toHaveLength(1);
      expect(nodes[0].messages![0].text).toBe('Gặp em nhé');
    });

    it('derives separate nodes for distinct records sharing the same clueRefId', () => {
      const tagged = [
        {
          suspectId: 'suspect_01',
          displayName: 'Giao dịch: Com Nieu Pho Co',
          sourceApp: 'banking' as const,
          timestamp: 1000,
          evidence: {
            caseId: 'case_01',
            recordId: 'tx_003',
            clueRefId: 'CLUE-BANK-07',
            title: 'Giao dịch: Com Nieu Pho Co',
            snippet: '- 640.000 đ 15/10/2026 20:48\nCom Nieu Pho Co Thanh toan the',
          },
        },
        {
          suspectId: 'suspect_01',
          displayName: 'Giao dịch: Bé Ngọc',
          sourceApp: 'banking' as const,
          timestamp: 1001,
          evidence: {
            caseId: 'case_01',
            recordId: 'tx_005',
            clueRefId: 'CLUE-BANK-07',
            title: 'Giao dịch: Bé Ngọc',
            snippet: '- 1.200.000 đ 15/10/2026 20:10\nCK',
          },
        },
      ];

      const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, tagged);
      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.nodeId)).toEqual(['node_record_bank_receipt', 'node_banking_tx_005']);
      expect(nodes.map(n => n.recordRefId)).toEqual(['tx_003', 'tx_005']);
    });
  });

  describe('CorkboardCanvas & UnorganizedDrawer Wireframe Compliance', () => {
    const sampleConversationNode: CaseGraphNode = {
      nodeId: 'node_903',
      type: 'record_clue',
      label: 'Hương Em',
      sourceAppId: 'internet-messaging',
      recordRefId: 'thread_902',
      conversationId: 'thread_902',
      visibleAlias: 'Hương Em',
      isExplicitConversationPin: true,
      messages: [
        { recordId: 'm1', text: 'Em đang đợi.', eventTime: '12:10', eventDate: '28/09' },
      ],
      isInitialDisguise: false,
    };

    const placedNode: PlacedNode = {
      ...sampleConversationNode,
      x: 100,
      y: 100,
    };

    it.each([
      { type: 'record_clue' as const, conversationId: 'thread_902', sourceAppId: 'internet-messaging', hasAvatar: true },
      { type: 'alias' as const, sourceAppId: 'internet-messaging', hasAvatar: true },
      { type: 'suspect' as const, sourceAppId: undefined, hasAvatar: true },
      { type: 'record_clue' as const, visibleAlias: 'Mẹ Ở Quê', sourceAppId: 'phone', hasAvatar: true },
      { type: 'record_clue' as const, visibleAlias: 'Mẹ Ở Quê', sourceAppId: 'messages', hasAvatar: true },
      { type: 'record_clue' as const, visibleAlias: 'Mẹ Ở Quê', sourceAppId: 'banking', hasAvatar: false },
      { type: 'record_clue' as const, sourceAppId: 'personal-notes', hasAvatar: false },
    ])('uses profile avatar only for profile cards: $type / $sourceAppId / $conversationId', ({ hasAvatar, ...profile }) => {
      const node: PlacedNode = {
        nodeId: 'profile-card', label: 'Anh Tuấn Thợ Điện', x: 100, y: 100,
        ...profile,
      };
      const html = renderToStaticMarkup(
        <CorkboardCanvas
          placedNodes={[node]} edges={[]} viewport={{ x: 0, y: 0, zoom: 1 }}
          activePairing={{ sourceNodeId: null }} unmaskedSuspectIds={[]}
          activeContradictions={[]} selectedEdgeId={null}
          getSourceApp={() => ({ displayName: 'Source app', icon: IoChatbubbleOutline, iconAsset: '/app.svg', themeGradient: 'from-blue-400 to-blue-600' })}
          onSelectNode={vi.fn()} onMoveNode={vi.fn()} onSelectEdge={vi.fn()}
          onSeverEdge={vi.fn()} onNavigateToSource={vi.fn()} onCancelPairing={vi.fn()}
        />,
      );
      const avatar = renderToStaticMarkup(<ContactAvatar name={node.visibleAlias || node.label} size={26} shape="square" />);
      expect(html.includes(avatar)).toBe(hasAvatar);
      // App icon is a small badge on the picture's top-right corner, or stands alone without a picture.
      expect(html.includes('absolute -right-1.5 -top-1.5 z-10 h-4 w-4')).toBe(Boolean(node.sourceAppId) && hasAvatar);
      expect(html.includes('h-5 w-5 rounded-[4px]')).toBe(Boolean(node.sourceAppId) && !hasAvatar);
      expect(html.includes('aria-label="Source app"')).toBe(Boolean(node.sourceAppId));
    });

    it('renders [Đến chat] and [Xóa] on card when selected, hidden when not selected', () => {
      // 1. Not selected
      const unselectedHtml = renderToStaticMarkup(
        <CorkboardCanvas
          placedNodes={[placedNode]}
          edges={[]}
          viewport={{ x: 0, y: 0, zoom: 1 }}
          activePairing={{ sourceNodeId: null }}
          unmaskedSuspectIds={[]}
          activeContradictions={[]}
          selectedEdgeId={null}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          onSelectCard={vi.fn()}
          onMoveNode={vi.fn()}
          onSelectEdge={vi.fn()}
          onSeverEdge={vi.fn()}
          onDeleteCard={vi.fn()}
          onDeleteMessage={vi.fn()}
          onNavigateToSource={vi.fn()}
          onCancelPairing={vi.fn()}
        />
      );

      // Action buttons must have invisible class when not selected, text rendered at full width without mask
      expect(unselectedHtml).toContain('invisible');
      expect(unselectedHtml).not.toContain('mask-image');

      // 2. Selected
      const selectedHtml = renderToStaticMarkup(
        <CorkboardCanvas
          placedNodes={[placedNode]}
          edges={[]}
          viewport={{ x: 0, y: 0, zoom: 1 }}
          activePairing={{ sourceNodeId: null }}
          unmaskedSuspectIds={[]}
          activeContradictions={[]}
          selectedEdgeId={null}
          selectedNodeId="node_903"
          onSelectNode={vi.fn()}
          onSelectCard={vi.fn()}
          onMoveNode={vi.fn()}
          onSelectEdge={vi.fn()}
          onSeverEdge={vi.fn()}
          onDeleteCard={vi.fn()}
          onDeleteMessage={vi.fn()}
          onNavigateToSource={vi.fn()}
          onCancelPairing={vi.fn()}
        />
      );

      expect(selectedHtml).toContain('Đến chat');
      expect(selectedHtml).toContain('Xóa');
      expect(selectedHtml).toContain('28/09 · 12:10');
      expect(selectedHtml).toContain('Em đang đợi.');
      // Selected text must have feather fade mask applied
      expect(selectedHtml).toContain('mask-image:linear-gradient');
    });

    it('auto-places a tagged clue onto the open bottom row of the wide board, re-centered under the cluster', () => {
      const existingCards: PlacedNode[] = [
        { nodeId: 'node_existing_1', type: 'record_clue', label: 'Váy lụa 1', x: 296, y: 160 },
        { nodeId: 'node_existing_2', type: 'record_clue', label: 'Váy lụa 2', x: 500, y: 160 },
        { nodeId: 'node_existing_3', type: 'record_clue', label: 'Váy lụa 3', x: 704, y: 160 },
      ];

      const newClue: CaseGraphNode = {
        nodeId: 'node_new_2',
        type: 'record_clue',
        label: 'Tin nhắn bí mật',
      };

      const placed = placeNewNodesBelow(existingCards, [newClue]);
      expect(placed).toHaveLength(1);
      // Row still has room (up to 6), so the clue joins it at y = 160.
      expect(placed[0].y).toBe(160);
      expect(placed[0].x).toBeGreaterThan(704);
    });

    it('collapses legacy separate message cards from the same person into EXACTLY ONE card', () => {
      // Recreate the exact 3 legacy tags from the user screenshot:
      // 1. Tag for Anh Tuấn Thợ Điện
      // 2. Tag for "Tin nhắn: Anh Tuấn Thợ Điện" (thread_903_m4)
      // 3. Tag for "Tin nhắn: Anh Tuấn Thợ Điện" (thread_903_m5)
      const legacyTags = [
        {
          suspectId: 'tag_1',
          displayName: 'Anh Tuấn Thợ Điện',
          sourceApp: 'internet-messaging' as const,
          timestamp: 100,
          evidence: {
            caseId: 'case_01',
            recordId: 'thread_004',
            title: 'Anh Tuấn Thợ Điện',
            snippet: 'Áo anh em treo lên rồi, mai mang trả nhé.',
            clueRefId: 'CLUE-ZOLA-10',
          },
        },
        {
          suspectId: 'tag_2',
          displayName: 'Tin nhắn: Anh Tuấn Thợ Điện',
          sourceApp: 'internet-messaging' as const,
          timestamp: 101,
          evidence: {
            caseId: 'case_01',
            recordId: 'thread_004_m4',
            title: 'Tin nhắn: Anh Tuấn Thợ Điện',
            snippet: 'Anh xem giúp em bản xuất bị lệch chữ ở trang cuối với.',
            eventTime: '13/10 10:10',
          },
        },
        {
          suspectId: 'tag_3',
          displayName: 'Tin nhắn: Anh Tuấn Thợ Điện',
          sourceApp: 'internet-messaging' as const,
          timestamp: 102,
          evidence: {
            caseId: 'case_01',
            recordId: 'thread_004_m5',
            title: 'Tin nhắn: Anh Tuấn Thợ Điện',
            snippet: 'Đúng là em chọn nhầm vùng. Đủ trang rồi.',
            eventTime: '13/10 10:16',
          },
        },
      ];

      // 1. normalizeTaggedSuspects must produce 1 TaggedSuspect with 2 message bullets
      const normalized = normalizeTaggedSuspects(legacyTags);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].displayName).toBe('Anh Tuấn Thợ Điện');
      expect(normalized[0].conversationId).toBe('thread_004');
      expect(normalized[0].messages).toHaveLength(2);
      expect(normalized[0].messages![0].text).toBe('Anh xem giúp em bản xuất bị lệch chữ ở trang cuối với.');
      expect(normalized[0].messages![1].text).toBe('Đúng là em chọn nhầm vùng. Đủ trang rồi.');

      // 2. deriveNodesFromTaggedEvidence must derive EXACTLY ONE node titled "Anh Tuấn Thợ Điện"
      const derivedNodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, legacyTags);
      expect(derivedNodes).toHaveLength(1);
      expect(derivedNodes[0].label).toBe('Anh Tuấn Thợ Điện');
      expect(derivedNodes[0].messages).toHaveLength(2);
      expect(derivedNodes[0].subtitle).toBeUndefined(); // Body is bullets, no subtitle
    });

    it('keeps the Zola conversation and order connection speculative', () => {
      for (const chatId of ['node_alias_01', 'node_record_booking']) {
        const { newEdge } = createEdgeBetweenNodes(
          LEVEL_01_KNOWLEDGE_GRAPH, [], chatId, 'node_record_ecommerce_order',
        );
        expect(newEdge).toMatchObject({ isCanonical: false, isSmokingGun: false });
        expect(newEdge!.explanationRoastHint).toBeUndefined();
      }
    });

    it('renders crisp settled CSS zoom on the card plane and pure GPU scale on the fixed-size chalkboard surface', () => {
      const html = renderToStaticMarkup(
        <CorkboardCanvas
          placedNodes={[placedNode]}
          edges={[]}
          viewport={{ x: 500, y: 600, zoom: 1.75 }}
          activePairing={{ sourceNodeId: null }}
          unmaskedSuspectIds={[]}
          activeContradictions={[]}
          selectedEdgeId={null}
          onSelectNode={vi.fn()}
          onMoveNode={vi.fn()}
          onSelectEdge={vi.fn()}
          onSeverEdge={vi.fn()}
          onNavigateToSource={vi.fn()}
          onCancelPairing={vi.fn()}
        />,
      );

      expect(html).toContain('transform:translate3d(-875px, -1050px, 0);will-change:transform');
      expect(html).toContain('transform:translate3d(-875px, -1050px, 0) scale(1.75);will-change:transform');
      expect(html).toContain('transform-origin:0 0');
      expect(html).toContain('zoom:1.75');
      expect(html).toContain('class="notebook-board-surface" style="width:1800px;height:1200px"');
      expect(html).toContain('notebook-board-frame');
      expect(html).toContain('notebook-board-rail-top');
      expect(html).toContain('decoding="async"');
      expect(html).toContain('notebook-lamp-beam');
      // 3D depth: overhead lamp tube (z-[4]) sits on the office wall BEHIND the board surface (z-[10]).
      expect(html.indexOf('notebook-lamp-tube')).toBeLessThan(html.indexOf('notebook-board-surface'));
    });

    it('renders red strings for both alibi contradictions and verified key smoking-gun links, and yellow for neutral or speculative links', () => {
      const nodes: PlacedNode[] = [
        { nodeId: 'n1', type: 'record_clue', label: 'Vợ', x: 100, y: 100 },
        { nodeId: 'n2', type: 'record_clue', label: 'Cơm Niêu', x: 400, y: 100 },
        { nodeId: 'n3', type: 'record_clue', label: 'Đơn hàng', x: 100, y: 300 },
        { nodeId: 'n4', type: 'bridge_id', label: 'SĐT', x: 400, y: 300 },
        { nodeId: 'n5', type: 'alias', label: 'Anh Tuấn', x: 700, y: 300 },
      ];
      const edges: CaseGraphEdge[] = [
        {
          edgeId: 'edge_alibi_contradiction',
          sourceNodeId: 'n1',
          targetNodeId: 'n2',
          relationship: 'contradicts_alibi',
          isCanonical: true,
          isSmokingGun: true,
        },
        {
          edgeId: 'edge_order_phone',
          sourceNodeId: 'n3',
          targetNodeId: 'n4',
          relationship: 'bridges_identity',
          isCanonical: true,
          isSmokingGun: true,
        },
        {
          edgeId: 'edge_alias_phone',
          sourceNodeId: 'n4',
          targetNodeId: 'n5',
          relationship: 'bridges_identity',
          isCanonical: true,
          isSmokingGun: false,
        },
        {
          edgeId: 'custom_speculative',
          sourceNodeId: 'n1',
          targetNodeId: 'n5',
          relationship: 'bridges_identity',
          isCanonical: false,
          isSmokingGun: true,
        },
      ];

      const html = renderToStaticMarkup(
        <CorkboardCanvas
          placedNodes={nodes}
          edges={edges}
          verifiedKeyEdgeIds={['edge_alibi_contradiction', 'edge_order_phone']}
          viewport={{ x: 0, y: 0, zoom: 1 }}
          activePairing={{ sourceNodeId: null }}
          unmaskedSuspectIds={[]}
          activeContradictions={['edge_alibi_contradiction']}
          selectedEdgeId={null}
          onSelectNode={vi.fn()}
          onMoveNode={vi.fn()}
          onSelectEdge={vi.fn()}
          onSeverEdge={vi.fn()}
          onNavigateToSource={vi.fn()}
          onCancelPairing={vi.fn()}
        />,
      );

      expect(html.match(/stroke="#DC2626"/g)).toHaveLength(2);
      expect(html.match(/stroke="#FBBF24"/g)).toHaveLength(2);
    });
  });
});
