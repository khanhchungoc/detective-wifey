import { describe, expect, it } from 'vitest';
import { case01 } from '../../data/cases';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { AppId } from '../../shared/contracts/app-contracts';
import { LEVEL_01_KNOWLEDGE_GRAPH as GRAPH } from './level01Fixture';
import { createEdgeBetweenNodes } from './graphEngine';
import { deriveNodesFromTaggedEvidence } from './WifeNotebookModal';
import type { TaggedEvidenceItem } from './types';
import { calculateConfrontationPreflight, evaluateConfrontation, getSuspectsOnBoard } from './confrontationEngine';

const record = (sourceApp: AppId, recordId: string, snippet: string, suspectId?: string): TaggedEvidenceItem => ({
  suspectId: `tag_${recordId}`, displayName: recordId, sourceApp, timestamp: 1,
  evidence: { caseId: 'case_01', recordId, title: recordId, snippet, suspectId },
});
const thread = (conversationId: string, displayName: string, ...messageIds: string[]): TaggedEvidenceItem => ({
  suspectId: `tag_${conversationId}`, displayName, sourceApp: 'internet-messaging', timestamp: 1, conversationId,
  messages: messageIds.map(recordId => ({ recordId, text: `text of ${recordId}` })),
});

/** Pin two items, link them, return the edge the player would get. */
function link(a: TaggedEvidenceItem, b: TaggedEvidenceItem) {
  const nodes = deriveNodesFromTaggedEvidence(GRAPH, [a, b]);
  return createEdgeBetweenNodes(GRAPH, [], nodes[0].nodeId, nodes[1].nodeId, nodes).newEdge!;
}

const KHOA_PHONE = 'Số điện thoại: 0988 886 677';

describe('Level 1 knowledge graph (level-01.md 5.2)', () => {
  it('has 13 nodes, 11 edges and three required smoking guns', () => {
    expect(GRAPH.nodes).toHaveLength(13);
    expect(GRAPH.edges).toHaveLength(11);
    expect(GRAPH.requiredSmokingGunEdgeIds).toEqual(['edge_order_phone', 'edge_order_name', 'edge_alibi_contradiction']);
    expect(GRAPH.edges.filter(edge => edge.isSmokingGun).map(edge => edge.edgeId).sort())
      .toEqual([...GRAPH.requiredSmokingGunEdgeIds].sort());
    expect(JSON.stringify(GRAPH)).not.toMatch(/tuan|thợ điện|tx_02|photo_dinner/i);
  });

  describe('edge_order_phone pass/fail', () => {
    const order = record('ecommerce', 'order_005', KHOA_PHONE, 'suspect_01');
    it('passes when the phone number matches the contact or any call to it', () => {
      for (const phoneRecord of ['contact_011', 'call_001', 'call_003']) {
        expect(link(order, record('phone', phoneRecord, '0988886677'))).toMatchObject({
          edgeId: 'edge_order_phone', isCanonical: true, isSmokingGun: true,
        });
      }
    });
    it('fails for the number of another recipient (Mai, Mẹ) or the electrician', () => {
      for (const [orderId, phone] of [['order_003', '0988990011'], ['order_004', '0915220011']]) {
        expect(link(record('ecommerce', orderId, `SĐT: ${phone}`), record('phone', 'contact_011', '0988886677')).isCanonical).toBe(false);
      }
      expect(link(order, record('phone', 'call_013', '0912345801')).isCanonical).toBe(false);
    });
    it('does not turn another recipient\'s own matching phone into the culprit smoking gun', () => {
      const edge = link(record('ecommerce', 'order_003', 'SĐT: 0988990011'), record('phone', 'contact_009', '0988990011'));
      expect(edge.isSmokingGun).toBe(false);
      expect(edge.edgeId).not.toBe('edge_order_phone');
    });
  });

  describe('edge_alias_phone, edge_call_phone, edge_alias_group', () => {
    it('links the Khoa BE thread to its phone contact and the late call to the same number', () => {
      expect(link(thread('thread_003', 'Khoa BE', 'msg_003_0014'), record('phone', 'contact_011', '0988886677')).edgeId).toBe('edge_alias_phone');
      expect(link(record('phone', 'call_001', '0988886677'), record('phone', 'contact_011', '0988886677')).edgeId).toBe('edge_call_phone');
    });
    it('links the Khoa BE thread to the company-group post, but not to another sender\'s message', () => {
      expect(link(thread('thread_003', 'Khoa BE'), thread('thread_012', 'Technosoft - Toàn công ty', 'msg_012_0004')).edgeId).toBe('edge_alias_group');
      expect(link(thread('thread_003', 'Khoa BE'), thread('thread_002', 'Team Dev', 'msg_002_0012')).isCanonical).toBe(false);
    });
  });

  describe('edge_order_name pass/fail', () => {
    const order = (id: string) => record('ecommerce', id, 'Người nhận');
    it('passes with order_005 and the HR pinned message', () => {
      expect(link(order('order_005'), thread('thread_012', 'Technosoft - Toàn công ty', 'msg_012_0001')))
        .toMatchObject({ edgeId: 'edge_order_name', isCanonical: true, isSmokingGun: true });
    });
    it('fails for the other recipients (Mai, Ngọc) or an unrelated group message', () => {
      for (const id of ['order_003', 'order_006']) {
        expect(link(order(id), thread('thread_012', 'Technosoft - Toàn công ty', 'msg_012_0001')).isCanonical).toBe(false);
      }
      expect(link(order('order_005'), thread('thread_012', 'Technosoft - Toàn công ty', 'msg_012_0005')).isCanonical).toBe(false);
    });
  });

  describe('edge_alibi_contradiction, edge_meeting_cancelled pass/fail', () => {
    const swipe = record('banking', 'tx_003', '- 640.000 đ 20:48');
    it('passes with the 20:46 message and the card swipe', () => {
      expect(link(thread('thread_005', 'Vợ', 'msg_005_0082'), swipe))
        .toMatchObject({ edgeId: 'edge_alibi_contradiction', isCanonical: true, isSmokingGun: true });
    });
    it('fails with online transfers (tx_005, tx_004) or the 18:55 message', () => {
      for (const tx of ['tx_005', 'tx_004']) {
        expect(link(thread('thread_005', 'Vợ', 'msg_005_0082'), record('banking', tx, 'Chuyển khoản')).isCanonical).toBe(false);
      }
      expect(link(thread('thread_005', 'Vợ', 'msg_005_0079'), swipe).isCanonical).toBe(false);
    });
    it('cancelled meeting needs both the 17:30 cancel and the 18:55 report', () => {
      expect(link(thread('thread_002', 'Team Dev', 'msg_002_0012'), thread('thread_005', 'Vợ', 'msg_005_0079')).edgeId).toBe('edge_meeting_cancelled');
      expect(link(thread('thread_002', 'Team Dev', 'msg_002_0012'), thread('thread_005', 'Vợ', 'msg_005_0082')).isCanonical).toBe(false);
    });
  });
});

describe('Level 1 suspect picker (real level_01.json)', () => {
  const edgeOrderPhone: CaseGraphEdge = {
    edgeId: 'edge_order_phone', sourceNodeId: 'node_record_ecommerce_order', targetNodeId: 'node_bridge_phone',
    relationship: 'bridges_identity', isCanonical: true, isSmokingGun: true,
  };
  const board = (tags: TaggedEvidenceItem[], edges: CaseGraphEdge[] = []) => getSuspectsOnBoard({
    placedNodes: deriveNodesFromTaggedEvidence(GRAPH, tags).map(node => ({ ...node, x: 0, y: 0 })),
    caseConfig: case01, knowledgeGraph: GRAPH, edges,
  });

  it('shows "Khoa BE" (no real name, no Marketing) before the phone bridge is verified', () => {
    for (const tags of [
      [thread('thread_003', 'Khoa BE', 'msg_003_0014')],
      [record('ecommerce', 'order_005', 'Nguyễn Thị Thu Hương', 'suspect_01')],
    ]) {
      const huong = board(tags).find(suspect => suspect.id === 'suspect_01')!;
      expect(huong.displayName).toBe('Khoa BE');
      expect(huong.isUnmasked).toBe(false);
      expect(JSON.stringify(huong)).not.toMatch(/Hương|Marketing/);
    }
  });

  it('reveals the real name after edge_order_phone', () => {
    const huong = board([thread('thread_003', 'Khoa BE', 'msg_003_0014')], [edgeOrderPhone]).find(suspect => suspect.id === 'suspect_01')!;
    expect(huong).toMatchObject({ displayName: 'Nguyễn Thị Thu Hương', alias: 'Khoa BE', isUnmasked: true });
    expect(huong.unmaskedEvidenceHint).toBe('Trùng SĐT: 0988886677');
  });

  it('treats Anh Tuấn Thợ Điện as a normal innocent suspect, separate from Khoa BE', () => {
    const suspects = board([thread('thread_004', 'Anh Tuấn Thợ Điện', 'msg_903_0001'), thread('thread_003', 'Khoa BE')]);
    expect(suspects.map(suspect => [suspect.id, suspect.displayName, suspect.isCulprit])).toEqual([
      ['suspect_01', 'Khoa BE', true],
      ['suspect_02', 'Anh Tuấn Thợ Điện', false],
    ]);
  });

  it('keeps evidence-only cards (HR pin, wife report) out of the picker', () => {
    expect(board([thread('thread_012', 'Technosoft - Toàn công ty', 'msg_012_0001'), thread('thread_005', 'Vợ', 'msg_005_0082')])).toEqual([]);
  });

  it('accusing the electrician is a wrong accusation: his roast, 0 stars, one strike', () => {
    const preflight = calculateConfrontationPreflight({ caseConfig: case01, knowledgeGraph: GRAPH, activeEdges: [], accusedSuspectId: 'suspect_02' });
    expect(preflight.isWrongSuspect).toBe(true);
    const result = evaluateConfrontation({
      caseConfig: case01, knowledgeGraph: GRAPH, activeEdges: [], unmaskedSuspectIds: [], currentStrikes: 5,
      accusedSuspectId: 'suspect_02', rngRoll: 0,
    });
    expect(result).toMatchObject({ stars: 0, isRedHerringAccusation: true, newStrikesRemaining: 4 });
    expect(result.husbandDialogue).toContain('Bà ấy là mẹ anh');
  });

  it('accusing Khoa BE (suspect_01) is not a wrong accusation', () => {
    expect(calculateConfrontationPreflight({ caseConfig: case01, knowledgeGraph: GRAPH, activeEdges: [], accusedSuspectId: 'suspect_01' }).isWrongSuspect).toBe(false);
  });
});
