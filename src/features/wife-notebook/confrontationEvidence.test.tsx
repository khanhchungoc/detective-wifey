import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { PlacedNode } from './types';
import { calculateConfrontationPreflight } from './confrontationEngine';
import { CONFRONTATION_LABELS, ConfrontationConfirmModal, getDeckTrackOffsetPct, resolveSwipeStep } from './components/ConfrontationConfirmModal';

const nodes: PlacedNode[] = [
  { nodeId: 'suspect', type: 'alias', label: 'Contact', suspectId: 'suspect_huong', x: 0, y: 0 },
  { nodeId: 'chat', type: 'record_clue', label: 'Chat', sourceAppId: 'internet-messaging', messages: [{ recordId: 'm1', text: 'Pinned message content' }], x: 0, y: 0 },
  { nodeId: 'receipt', type: 'record_clue', label: 'Receipt', subtitle: 'Pinned receipt content', x: 0, y: 0 },
  { nodeId: 'unverified', type: 'record_clue', label: 'Unverified', suspectId: 'suspect_huong', x: 0, y: 0 },
  { nodeId: 'unrelated', type: 'record_clue', label: 'Unrelated', clueRefId: 'real-clue', x: 0, y: 0 },
  { nodeId: 'other', type: 'suspect', label: 'Other', suspectId: 'other', x: 0, y: 0 },
];
const edge = (sourceNodeId: string, targetNodeId: string, isCanonical?: boolean): CaseGraphEdge => ({
  edgeId: `${sourceNodeId}-${targetNodeId}`, sourceNodeId, targetNodeId, isCanonical,
  relationship: 'bridges_identity', isSmokingGun: false,
});
const activeEdges = [edge('suspect', 'chat', true), edge('receipt', 'chat', true),
  edge('suspect', 'unverified', false), edge('other', 'unrelated', true), edge('suspect', 'unrelated')];

describe('confrontation evidence review', () => {
  it('includes all verified paths in either direction, excluding unverified and unrelated clues', () => {
    const result = calculateConfrontationPreflight({ placedNodes: nodes, activeEdges });
    expect(result.verifiedCluesList.map(clue => clue.title)).toEqual(['Chat', 'Receipt']);
    expect(result.verifiedCluesList.map(clue => clue.snippet)).toEqual(['Pinned message content', 'Pinned receipt content']);
    expect(calculateConfrontationPreflight({ placedNodes: nodes, activeEdges: [] }).verifiedCluesList).toEqual([]);
    expect(calculateConfrontationPreflight({ placedNodes: nodes, activeEdges,
      accusedSuspectId: 'other' }).verifiedCluesList.map(clue => clue.title)).toEqual(['Unrelated']);
  });

  it('recognizes legacy verified edges by canonical graph ID but respects an explicit unverified edge', () => {
    const legacy = edge('suspect', 'chat');
    const knowledgeGraph = { nodes, edges: [legacy], requiredSmokingGunEdgeIds: [] };
    expect(calculateConfrontationPreflight({ placedNodes: nodes, activeEdges: [legacy], knowledgeGraph })
      .verifiedCluesList.map(clue => clue.title)).toEqual(['Chat']);
    expect(calculateConfrontationPreflight({ placedNodes: nodes, activeEdges: [{ ...legacy, isCanonical: false }], knowledgeGraph })
      .verifiedCluesList).toEqual([]);
  });

  it.each([null, 'suspect_huong', 'removed-suspect'])('never reveals a preflight identity without a pinned suspect (selection: %s)', selectedSuspectId => {
    const preflight = calculateConfrontationPreflight({ placedNodes: nodes, activeEdges });
    const html = renderToStaticMarkup(<ConfrontationConfirmModal isOpen
      preflight={{ ...preflight, accusedSuspectName: 'HIDDEN_CULPRIT' }}
      suspectsOnBoard={[]} selectedSuspectId={selectedSuspectId}
      onCancel={() => {}} onConfirmConfront={vi.fn()} />);
    expect(html).toContain('Chưa có nghi phạm');
    expect(html).toContain('Điều tra thêm');
    expect(html).not.toContain('HIDDEN_CULPRIT');
    for (const label of CONFRONTATION_LABELS) expect(html).not.toContain(label.toLocaleUpperCase('vi') + '!');
    expect(html).not.toContain('Pinned message content');
  });

  it.each([[0, 1], [20, 1], [21, 2], [45, 3], [80, 4], [100, 5]])('shows a rough five-segment estimate for rate %s', (successRate, filledSegments) => {
    const html = renderToStaticMarkup(<ConfrontationConfirmModal isOpen
      suspectsOnBoard={[{ id: 'suspect_huong', displayName: 'Contact' }]} selectedSuspectId="suspect_huong"
      preflight={{ ...calculateConfrontationPreflight({ placedNodes: nodes, activeEdges }), successRate }}
      onCancel={() => {}} onConfirmConfront={() => {}} />);
    expect(html).toContain('Tỉ lệ thành công');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuemax="5"');
    expect(html).toContain(`aria-valuenow="${filledSegments}"`);
    expect(html.match(/h-2\.5 flex-1 rounded-\[2px\]/g)).toHaveLength(5);
    expect(html.match(/border-\[#(?:FB7185|4ADE80)\]\/60 bg-\[#(?:E11D48|22C55E)\]/g)).toHaveLength(filledSegments);
    expect(html).not.toMatch(/>\s*\d+%\s*</);
  });

  it('renders a darkroom dossier popup with Polaroid face-off, swipeable dark-mode evidence cards, and centered CTA', () => {
    const html = renderToStaticMarkup(<ConfrontationConfirmModal isOpen
      suspectsOnBoard={[{ id: 'suspect_huong', displayName: 'Contact' }]} selectedSuspectId="suspect_huong"
      preflight={calculateConfrontationPreflight({ placedNodes: nodes, activeEdges })}
      getSourceApp={() => ({ displayName: 'Zola', iconAsset: '/zola.svg', icon: () => null, themeGradient: '' })}
      onCancel={() => {}} onConfirmConfront={() => {}} />);
    expect(html).toContain('max-w-[560px]');
    expect(html).toContain('dossier-folder-sheet');
    expect(html).toContain('dossier-evidence-card');
    expect(html).not.toContain('dossier-paper-card');
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('data-swipe-surface=""');
    expect(html).toContain('1/2');
    expect(html).toContain('overflow-x-hidden');
    expect(html).not.toContain('FILE 01');
    expect(html).not.toContain('border-l-[6px]');
    expect(html).toContain('background-position:60% 31%');
    expect(html).toContain('Chat');
    expect(html).toContain('Receipt');
    expect(html).toContain('Khớp danh tính');
    expect(html).not.toContain('Bằng chứng (');
    expect(html).not.toContain('manh mối');
    expect(html).toContain('VÀO VIỆC!');
    expect(html).not.toContain('TÔI BIẾT HẾT RỒI');
    const ctaMatch = html.match(/data-testid="confrontation-confirm-cta"[\s\S]*?<\/button>/);
    expect(ctaMatch?.[0]).toContain('justify-center');
    expect(ctaMatch?.[0]).not.toContain('#01');
    expect(ctaMatch?.[0]).not.toContain('<svg');
    expect(html).toContain('src="/zola.svg"');
    expect(html).toContain('width:128px;height:128px');
    expect(html).not.toContain('bg-white');
  });

  it('computes swipe deck offsets and swipe step thresholds cleanly across edge cases', () => {
    expect(getDeckTrackOffsetPct(0, 1)).toBe(0);
    expect(getDeckTrackOffsetPct(0, 5)).toBe(0);
    expect(getDeckTrackOffsetPct(1, 5)).toBe(-82);
    expect(getDeckTrackOffsetPct(4, 5)).toBe(-340);

    expect(resolveSwipeStep(-10, 200)).toBe(0);
    expect(resolveSwipeStep(-40, 300)).toBe(1);
    expect(resolveSwipeStep(40, 300)).toBe(-1);
    expect(resolveSwipeStep(-22, 40)).toBe(1);
    expect(resolveSwipeStep(22, 40)).toBe(-1);
  });

  it('ignores dangling canonical edges to unplaced nodes and does not leak culprit aliases to wrong suspects', () => {
    const partialNodes: PlacedNode[] = [
      { nodeId: 'node_alias_tuan', type: 'alias', label: 'Anh Tuấn Thợ Điện', sourceAppId: 'internet-messaging',
        messages: [{ recordId: 'm1', text: 'Tin nhắn bình thường' }], x: 0, y: 0 },
      { nodeId: 'chat_reply', type: 'record_clue', label: 'Chat', sourceAppId: 'internet-messaging',
        messages: [{ recordId: 'm2', text: 'Nội dung khác' }], x: 100, y: 0 },
      { nodeId: 'other', type: 'suspect', label: 'Lan Anh Kế Toán', suspectId: 'suspect_lan_anh', x: 200, y: 0 },
    ];
    const danglingEdge = edge('node_alias_tuan', 'missing_phone_node', true);
    const culpritPf = calculateConfrontationPreflight({
      placedNodes: partialNodes,
      activeEdges: [danglingEdge],
      accusedSuspectId: 'suspect_huong',
    });
    expect(culpritPf.verifiedCluesList).toEqual([]);

    const wrongSuspectPf = calculateConfrontationPreflight({
      placedNodes: partialNodes,
      activeEdges: [edge('node_alias_tuan', 'chat_reply', true)],
      accusedSuspectId: 'suspect_lan_anh',
    });
    expect(wrongSuspectPf.isWrongSuspect).toBe(true);
    expect(wrongSuspectPf.verifiedCluesList).toEqual([]);
  });
});
