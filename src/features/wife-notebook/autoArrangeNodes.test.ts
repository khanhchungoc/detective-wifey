import { describe, expect, it } from 'vitest';
import { autoArrangeNodes, calculateClueCardsCenter, calculateYarnStringCurve, CANVAS_HEIGHT, CANVAS_WIDTH, clampCardPosition } from './graphEngine';
import type { PlacedNode } from './types';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';

const makeNodes = (count: number): PlacedNode[] => Array.from({ length: count }, (_, i) => ({
  nodeId: `n${i}`, type: 'record_clue', label: `Clue ${i}`, x: i * 50, y: i * 20,
}));
const makeEdge = (source: number, target: number): CaseGraphEdge => ({
  edgeId: `${source}-${target}`, sourceNodeId: `n${source}`, targetNodeId: `n${target}`,
  relationship: 'bridges_identity', isSmokingGun: false,
});

function countCrossings(nodes: PlacedNode[], edges: CaseGraphEdge[], height = 120) {
  let crossings = 0;
  for (const edge of edges) {
    const source = nodes.find(n => n.nodeId === edge.sourceNodeId)!;
    const target = nodes.find(n => n.nodeId === edge.targetNodeId)!;
    const x1 = source.x + 105;
    const y1 = source.y + 3;
    const x2 = target.x + 105;
    const y2 = target.y + 3;
    const { cx, cy } = calculateYarnStringCurve(x1, y1, x2, y2, false);
    for (const node of nodes) {
      if (node === source || node === target) continue;
      for (let step = 0; step <= 200; step++) {
        const t = step / 200;
        const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2;
        const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
        if (x >= node.x && x <= node.x + 210 && y >= node.y && y <= node.y + height) {
          crossings++;
          break;
        }
      }
    }
  }
  return crossings;
}

describe('notebook auto layout', () => {
  it('handles an empty board', () => {
    expect(autoArrangeNodes([])).toEqual([]);
  });

  it.each([1, 2, 3, 11, 24, 60])('centers %i variable-height cards with at least 28px clearance, including tilt', count => {
    const nodes = makeNodes(count);
    const original = structuredClone(nodes);
    const dimensions = (id: string) => ({ width: 210, height: 80 + Number(id.slice(1)) % 5 * 100 });
    const arranged = autoArrangeNodes(nodes, [], dimensions);
    expect(nodes).toEqual(original);
    expect(arranged.map(n => n.nodeId)).toEqual(nodes.map(n => n.nodeId));
    const center = calculateClueCardsCenter(arranged, dimensions);
    expect(center).toEqual({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    const tilt = Math.sin(1.6 * Math.PI / 180);
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = arranged[i];
        const b = arranged[j];
        const ha = dimensions(a.nodeId).height;
        const hb = dimensions(b.nodeId).height;
        const horizontalGap = Math.abs(a.x - b.x) - 210 - (ha + hb) * tilt / 2;
        const verticalGap = Math.abs(a.y + ha / 2 - b.y - hb / 2) - (ha + hb) / 2 - 20;
        expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(28 - 1e-6);
      }
    }
    expect(autoArrangeNodes(arranged, [], dimensions)).toEqual(arranged);
  });

  it('puts the most-connected card in the middle and reduces yarn crossings within a compact layout', () => {
    const nodes = makeNodes(9).map(n => ({ ...n, subtitle: 'Details' }));
    // Put the hub last in input to verify placement uses connections, not array order.
    const edges = Array.from({ length: 8 }, (_, i) => makeEdge(8, i));
    const grid = autoArrangeNodes(nodes);
    const arranged = autoArrangeNodes(nodes, edges);
    const center = calculateClueCardsCenter(arranged);
    const hub = arranged[8];
    const distance = (node: PlacedNode) => Math.hypot(node.x + 88 - center.x, node.y + 60 - center.y);
    expect(distance(hub)).toBeLessThan(1);
    for (const leaf of arranged.slice(0, 8)) expect(distance(leaf)).toBeGreaterThan(distance(hub));
    expect(countCrossings(grid, edges)).toBeGreaterThan(0);
    expect(countCrossings(arranged, edges)).toBeLessThan(countCrossings(grid, edges));
    expect(autoArrangeNodes(arranged, edges)).toEqual(arranged);
  });

  it('ignores links whose cards are absent and preserves all card metadata', () => {
    const nodes = makeNodes(3);
    const edges = [makeEdge(0, 12), makeEdge(0, 0)];
    expect(autoArrangeNodes(nodes, edges)).toEqual(autoArrangeNodes(nodes));
    for (const [i, node] of autoArrangeNodes(nodes).entries()) {
      expect(node).toMatchObject({ nodeId: nodes[i].nodeId, type: nodes[i].type, label: nodes[i].label });
    }
  });

  it('packs short cards around a tall hub without inflating every gap to the hub height', () => {
    const nodes = makeNodes(11);
    const edges = nodes.slice(1).map((_, i) => makeEdge(0, i + 1));
    const dimensions = (id: string) => ({ width: 210, height: id === 'n0' ? 300 : 80 });
    const arranged = autoArrangeNodes(nodes, edges, dimensions);
    const width = Math.max(...arranged.map(n => n.x + 210)) - Math.min(...arranged.map(n => n.x));
    const height = Math.max(...arranged.map(n => n.y + dimensions(n.nodeId).height)) - Math.min(...arranged.map(n => n.y));
    expect(width).toBeLessThan(800);
    expect(height).toBeLessThan(850);
    for (const [i, a] of arranged.entries()) {
      for (const b of arranged.slice(i + 1)) {
        const ha = dimensions(a.nodeId).height;
        const hb = dimensions(b.nodeId).height;
        const horizontalGap = Math.abs(a.x - b.x) - 210 - (ha + hb) * Math.sin(1.6 * Math.PI / 180) / 2;
        const verticalGap = Math.abs(a.y + ha / 2 - b.y - hb / 2) - (ha + hb) / 2 - 20;
        expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(28 - 1e-6);
      }
    }
  });
});

describe('clampCardPosition', () => {
  it('pulls cards from older, taller saves back inside the wide board', () => {
    expect(clampCardPosition(100, 1700)).toEqual({ x: 100, y: CANVAS_HEIGHT - 180 });
    expect(clampCardPosition(5000, -40)).toEqual({ x: CANVAS_WIDTH - 230, y: 20 });
    expect(clampCardPosition(400.4, 300.6)).toEqual({ x: 400, y: 301 });
  });
});

