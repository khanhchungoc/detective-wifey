import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { PlacedNode } from './types';
import { calculateConfrontationPreflight } from './confrontationEngine';
import { CONFRONTATION_LABELS, ConfrontationConfirmModal } from './components/ConfrontationConfirmModal';

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
    expect(html.match(/border-\[#(?:7F1D1D|14532D)\] bg-\[#(?:991B1B|15803D)\]/g)).toHaveLength(filledSegments);
    expect(html).not.toMatch(/>\s*\d+%\s*</);
  });

  it('renders a Manila dossier popup with Polaroid face-off, linkage bridges, no clue count, and one approved CTA', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const html = renderToStaticMarkup(<ConfrontationConfirmModal isOpen
        suspectsOnBoard={[{ id: 'suspect_huong', displayName: 'Contact' }]} selectedSuspectId="suspect_huong"
        preflight={calculateConfrontationPreflight({ placedNodes: nodes, activeEdges })}
        getSourceApp={() => ({ displayName: 'Zola', iconAsset: '/zola.svg', icon: () => null, themeGradient: '' })}
        onCancel={() => {}} onConfirmConfront={() => {}} />);
      expect(html).toContain('max-w-[560px]');
      expect(html).toContain('dossier-folder-sheet');
      expect(html).toContain('dossier-paper-card');
      expect(html).toContain('FILE 01');
      expect(html).toContain('#01');
      expect(html).toContain('background-position:60% 31%');
      expect(html).toContain('Chat');
      expect(html).toContain('Receipt');
      expect(html).toContain('Khớp danh tính');
      expect(html).not.toContain('Bằng chứng (');
      expect(html).not.toContain('manh mối');
      expect(html).toContain(CONFRONTATION_LABELS[0].toLocaleUpperCase('vi') + '!');
      expect(html).toContain('src="/zola.svg"');
      expect(html).toContain('width:128px;height:128px');
      expect(html).not.toContain('bg-white');
    } finally { random.mockRestore(); }
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
