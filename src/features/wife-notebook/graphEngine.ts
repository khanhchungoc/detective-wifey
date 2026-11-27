import type { CaseKnowledgeGraph, CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { PlacedNode } from './types';

export const CANVAS_SIZE = 1800;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2.0;

/**
 * 3 columns centered horizontally on the 1800px canvas.
 * Card width = 210px. Gap = 40px. Total span = 710px.
 * Left & right margins = (1800 - 710) / 2 = 545px.
 * Column 0: 545 (center 650)
 * Column 1: 795 (center 900 - exact canvas center)
 * Column 2: 1045 (center 1150)
 */
export const CARD_WIDTH = 210;
export const COLUMN_GAP = 40;
export const CORKBOARD_ROW_HEIGHT = 220;
export const CORKBOARD_VERTICAL_GAP = 40;
export const INITIAL_BASE_Y = 160;

/**
 * Default fallback columns (centered at 900 with 40px gap).
 * Col 0: 545 (center 650)
 * Col 1: 795 (center 900 - canvas center)
 * Col 2: 1045 (center 1150)
 */
export const CORKBOARD_COLUMNS_X = [545, 795, 1045] as const;

/**
 * Calculates symmetric, centered X coordinates for `count` cards (1..3) in a row,
 * centered horizontally around `clusterCenterX`.
 */
export function getRowColumnPositions(count: number, clusterCenterX: number): number[] {
  const clampedCount = Math.max(1, Math.min(3, count));
  const totalWidth = clampedCount * CARD_WIDTH + (clampedCount - 1) * COLUMN_GAP;
  let startX = clusterCenterX - totalWidth / 2;

  // Clamp within canvas boundaries [30, CANVAS_SIZE - totalWidth - 30]
  startX = Math.max(30, Math.min(CANVAS_SIZE - totalWidth - 30, startX));

  const positions: number[] = [];
  for (let i = 0; i < clampedCount; i++) {
    positions.push(Math.round(startX + i * (CARD_WIDTH + COLUMN_GAP)));
  }
  return positions;
}

/**
 * Computes an estimated card height to prevent row overlap.
 */
export function getEstimatedCardHeight(node: CaseGraphNode): number {
  const photoExtra = node.imageSrc ? 104 : 0;
  const msgCount = node.messages?.length ?? 0;
  if (msgCount > 0) {
    return Math.max(100, 75 + Math.min(msgCount, 4) * 25) + photoExtra;
  }
  return (node.subtitle ? 120 : 80) + photoExtra;
}

/**
 * Places newly pinned nodes below all existing placed nodes in rows of up to 3 columns,
 * centered horizontally according to the current card areas (cluster center).
 * Guaranteed zero overlap with existing cards.
 */
export function placeNewNodesBelow(
  existingNodes: PlacedNode[],
  newNodes: CaseGraphNode[],
): PlacedNode[] {
  if (newNodes.length === 0) return [];

  // 1. Calculate the horizontal center of existing card areas
  let clusterCenterX = CANVAS_SIZE / 2; // 600 default
  if (existingNodes.length > 0) {
    const lefts = existingNodes.map(n => n.x);
    const rights = existingNodes.map(n => n.x + CARD_WIDTH);
    const clusterLeft = Math.min(...lefts);
    const clusterRight = Math.max(...rights);
    clusterCenterX = Math.round((clusterLeft + clusterRight) / 2);
  }

  const result: PlacedNode[] = [];
  const remainingNewNodes = [...newNodes];

  // 2. Check if the bottom-most row in existingNodes has capacity (< 3 cards)
  if (existingNodes.length > 0) {
    const maxY = Math.max(...existingNodes.map(n => n.y));
    const bottomRowCards = existingNodes.filter(n => Math.abs(n.y - maxY) <= 30);

    // Verify bottomRowCards is an open shelf row below other cards
    const otherCards = existingNodes.filter(n => Math.abs(n.y - maxY) > 30);
    const otherMaxBottom = otherCards.length > 0
      ? Math.max(...otherCards.map(n => n.y + getEstimatedCardHeight(n)))
      : 0;

    const currentXs = getRowColumnPositions(bottomRowCards.length, clusterCenterX);
    const isMatchingShelf = bottomRowCards.every(card =>
      currentXs.some(cx => Math.abs(card.x - cx) <= 25)
    );

    const isBottomShelf = isMatchingShelf && (otherCards.length === 0 || maxY >= otherMaxBottom - 20);

    if (isBottomShelf && bottomRowCards.length >= 1 && bottomRowCards.length < 3) {
      const slotsToFill = Math.min(3 - bottomRowCards.length, remainingNewNodes.length);
      const newTotalInRow = bottomRowCards.length + slotsToFill;
      const newXs = getRowColumnPositions(newTotalInRow, clusterCenterX);

      // Re-align existing cards on this row to stay centered
      bottomRowCards.forEach((card, idx) => {
        card.x = newXs[idx];
      });

      // Place incoming nodes into remaining slots on this row
      for (let i = 0; i < slotsToFill; i++) {
        const node = remainingNewNodes.shift()!;
        result.push({
          ...node,
          x: newXs[bottomRowCards.length + i],
          y: maxY,
        });
      }
    }
  }

  // 3. For any remaining new nodes, create new rows below the lowest existing card
  if (remainingNewNodes.length > 0) {
    const allExisting = [...existingNodes, ...result];
    const bottoms = allExisting.map(n => n.y + getEstimatedCardHeight(n));
    let baseY = Math.max(...bottoms, INITIAL_BASE_Y - CORKBOARD_VERTICAL_GAP) + CORKBOARD_VERTICAL_GAP;

    let idx = 0;
    while (idx < remainingNewNodes.length) {
      const nodesInThisRow = Math.min(3, remainingNewNodes.length - idx);
      const xs = getRowColumnPositions(nodesInThisRow, clusterCenterX);
      const currentY = Math.max(40, Math.min(CANVAS_SIZE - 200, baseY));

      for (let c = 0; c < nodesInThisRow; c++) {
        const node = remainingNewNodes[idx + c];
        result.push({
          ...node,
          x: xs[c],
          y: currentY,
        });
      }

      idx += nodesInThisRow;
      baseY += CORKBOARD_ROW_HEIGHT;
    }
  }

  return result;
}

/**
 * Validates whether two nodes are already connected in the active notebook state.
 */
export function areNodesConnected(edges: CaseGraphEdge[], nodeAId: string, nodeBId: string): boolean {
  return edges.some(
    e => (e.sourceNodeId === nodeAId && e.targetNodeId === nodeBId) ||
         (e.sourceNodeId === nodeBId && e.targetNodeId === nodeAId),
  );
}

/**
 * Creates an edge between nodeA and nodeB.
 * Matches against the canonical CaseKnowledgeGraph to inherit properties like isSmokingGun and explanation.
 * If not in canonical graph, creates a player-speculative edge.
 */
export function createEdgeBetweenNodes(
  canonicalGraph: CaseKnowledgeGraph,
  existingEdges: CaseGraphEdge[],
  nodeAId: string,
  nodeBId: string,
  pinnedNodes?: CaseGraphNode[],
): { newEdge: CaseGraphEdge | null; isDuplicate: boolean } {
  if (nodeAId === nodeBId) return { newEdge: null, isDuplicate: false };
  if (areNodesConnected(existingEdges, nodeAId, nodeBId)) {
    return { newEdge: null, isDuplicate: true };
  }

  // Helper to find equivalent canonical node IDs (e.g. node_alias_tuan and node_record_zola_chat share recordRefId)
  const getEquivalentNodeIds = (targetId: string): string[] => {
    const ids = [targetId];
    const node = canonicalGraph.nodes.find(n => n.nodeId === targetId);
    if (node?.recordRefId) {
      for (const other of canonicalGraph.nodes) {
        if (other.nodeId !== targetId && other.recordRefId === node.recordRefId && (!other.sourceAppId || !node.sourceAppId || other.sourceAppId === node.sourceAppId)) {
          ids.push(other.nodeId);
        }
      }
    }
    return ids;
  };

  const nodeAIds = getEquivalentNodeIds(nodeAId);
  const nodeBIds = getEquivalentNodeIds(nodeBId);

  // Look for canonical match in both directions (including equivalent conversation nodes)
  let canonical = canonicalGraph.edges.find(
    e => (nodeAIds.includes(e.sourceNodeId) && nodeBIds.includes(e.targetNodeId)) ||
         (nodeBIds.includes(e.sourceNodeId) && nodeAIds.includes(e.targetNodeId)),
  );

  if (pinnedNodes) {
    const source = pinnedNodes.find(node => node.nodeId === nodeAId);
    const target = pinnedNodes.find(node => node.nodeId === nodeBId);
    const content = (node?: CaseGraphNode) =>
      [node?.subtitle, ...(node?.messages?.map(message => message.text) ?? [])].filter(Boolean).join('\n');
    // A conversation's other messages are not evidence until the player pins them.
    if (canonical?.edgeId === 'edge_zola_dinner_receipt') {
      const chat = source?.sourceAppId === 'internet-messaging' ? source : target;
      const text = chat?.messages?.map(message => message.text).join('\n') ?? '';
      if (!/com\s+nieu/i.test(text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) canonical = undefined;
    }
    const isPhoneOrder = (source?.sourceAppId === 'phone' && target?.sourceAppId === 'ecommerce') ||
      (target?.sourceAppId === 'phone' && source?.sourceAppId === 'ecommerce');
    if (isPhoneOrder) {
      const phones = (node?: CaseGraphNode) => (content(node).match(/(?<!\d)(?:\+84|0)(?:[ .-]?\d){9}(?!\d)/g) ?? [])
        .map(phone => phone.replace(/[ .-]/g, '').replace(/^\+84/, '0'));
      const targetPhones = phones(target);
      if (phones(source).some(phone => targetPhones.includes(phone))) {
        canonical = canonicalGraph.edges.find(edge => edge.edgeId === 'edge_order_phone') ?? {
          edgeId: `shared_phone_${[nodeAId, nodeBId].sort().join('_')}`,
          sourceNodeId: nodeAId, targetNodeId: nodeBId,
          relationship: 'bridges_identity', isSmokingGun: false,
        };
      } else {
        canonical = undefined;
      }
    }
  }

  const edgeId = canonical?.edgeId ?? `custom_edge_${nodeAId}_${nodeBId}_${Date.now()}`;
  const relationship = canonical?.relationship ?? 'bridges_identity';
  const isSmokingGun = canonical?.isSmokingGun ?? false;
  const isCanonical = Boolean(canonical);
  const explanationRoastHint = canonical?.explanationRoastHint;

  return {
    newEdge: {
      edgeId,
      sourceNodeId: nodeAId,
      targetNodeId: nodeBId,
      relationship,
      isCanonical,
      isSmokingGun,
      explanationRoastHint,
    },
    isDuplicate: false,
  };
}

/**
 * Evaluates whether an alias is unmasked by checking if there is a path connecting
 * the alias node to the target suspect profile node.
 */
export function evaluateUnmaskedSuspects(
  canonicalGraph: CaseKnowledgeGraph,
  activeEdges: CaseGraphEdge[],
): string[] {
  const unmaskedIds: string[] = [];

  // Helper to test if an active edge matches a valid canonical edge
  const canonicalEdgeMap = new Set<string>();
  for (const edge of canonicalGraph.edges) {
    canonicalEdgeMap.add(`${edge.sourceNodeId}->${edge.targetNodeId}`);
    canonicalEdgeMap.add(`${edge.targetNodeId}->${edge.sourceNodeId}`);
  }

  // Build adjacency list for active edges, ONLY considering valid canonical relationships
  const adj = new Map<string, string[]>();
  for (const edge of activeEdges) {
    const isCanonical = edge.isCanonical ?? (
      canonicalEdgeMap.has(`${edge.sourceNodeId}->${edge.targetNodeId}`) ||
      canonicalGraph.edges.some(e => e.edgeId === edge.edgeId)
    );
    if (!isCanonical) continue;

    if (!adj.has(edge.sourceNodeId)) adj.set(edge.sourceNodeId, []);
    if (!adj.has(edge.targetNodeId)) adj.set(edge.targetNodeId, []);
    adj.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    adj.get(edge.targetNodeId)!.push(edge.sourceNodeId);
  }

  const aliasNodes = canonicalGraph.nodes.filter(n => n.type === 'alias');
  const suspectNodes = canonicalGraph.nodes.filter(n => n.type === 'suspect');

  for (const alias of aliasNodes) {
    if (alias.unmasksToSuspectId) {
      // Direct explicit target mapping from case config
      if (hasPath(adj, alias.nodeId, alias.unmasksToSuspectId)) {
        unmaskedIds.push(alias.unmasksToSuspectId);
        unmaskedIds.push(alias.nodeId);
      }
    } else {
      // Fallback: check if connected to any canonical suspect node
      for (const suspect of suspectNodes) {
        if (hasPath(adj, alias.nodeId, suspect.nodeId)) {
          unmaskedIds.push(suspect.nodeId);
          unmaskedIds.push(alias.nodeId);
          break;
        }
      }
    }
  }

  return Array.from(new Set(unmaskedIds));
}

function hasPath(adj: Map<string, string[]>, start: string, goal: string): boolean {
  if (start === goal) return true;
  const visited = new Set<string>();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === goal) return true;
    for (const neighbor of adj.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}

/**
 * Evaluates active alibi contradictions in the graph.
 */
export function evaluateContradictions(activeEdges: CaseGraphEdge[]): string[] {
  return activeEdges
    .filter(e => e.relationship === 'contradicts_alibi')
    .map(e => e.edgeId);
}

/**
 * Calculates a catenary quadratic Bézier curve path and control point
 * simulating natural gravity sag of pinned detective yarn strings.
 */
export function calculateYarnStringCurve(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  isContradiction: boolean,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Natural gravity sag: proportional to Euclidean distance
  // Contradiction strings (dashed yellow) are tauter with less sag
  const sag = isContradiction
    ? Math.min(16, Math.max(4, dist * 0.035))
    : Math.min(36, Math.max(8, dist * 0.075));

  const cx = mx;
  const cy = my + sag;
  const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  return { cx, cy, pathD, dist, sag };
}

type CardDimension = { width?: number; height?: number };

/** Center the board, keeping high-degree cards central and yarn clear of other cards. */
export function autoArrangeNodes(
  nodes: PlacedNode[],
  edges: CaseGraphEdge[] = [],
  getCardDimension?: (nodeId: string) => CardDimension | undefined,
): PlacedNode[] {
  if (nodes.length === 0) return [];
  const sizes = nodes.map(node => {
    const measured = getCardDimension?.(node.nodeId);
    const width = measured?.width || CARD_WIDTH;
    const height = measured?.height || getEstimatedCardHeight(node);
    // Reserve room for the paper's maximum 1.6 degree tilt, plus the pin above it.
    const tilt = Math.sin(1.6 * Math.PI / 180);
    return { width, height, padX: height * tilt / 2, padY: Math.max(10, width * tilt / 2) };
  });
  const indices = new Map(nodes.map((node, i) => [node.nodeId, i]));
  const links = edges.flatMap(edge => {
    const source = indices.get(edge.sourceNodeId);
    const target = indices.get(edge.targetNodeId);
    return source === undefined || target === undefined || source === target
      ? [] : [{ source, target, contradiction: edge.relationship === 'contradicts_alibi' }];
  });
  const degrees = nodes.map(() => 0);
  for (const { source, target } of links) { degrees[source]++; degrees[target]++; }
  const order = nodes.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a]);
  const positions = nodes.map(() => ({ x: 0, y: 0 }));

  const packed = new Set<number>();
  const score = () => {
    let crossings = 0;
    for (const { source, target, contradiction } of links) {
      if (!packed.has(source) || !packed.has(target)) continue;
      const a = positions[source];
      const b = positions[target];
      const y1 = a.y - sizes[source].height / 2 + 3;
      const y2 = b.y - sizes[target].height / 2 + 3;
      const { sag } = calculateYarnStringCurve(a.x, y1, b.x, y2, contradiction);
      for (let i = 0; i < nodes.length; i++) {
        if (!packed.has(i) || i === source || i === target) continue;
        const { width, height, padX, padY } = sizes[i];
        const left = positions[i].x - width / 2 - padX;
        const right = positions[i].x + width / 2 + padX;
        const top = positions[i].y - height / 2 - padY;
        const bottom = positions[i].y + height / 2 + padY;
        // The quadratic yarn has linear X; test its exact Y range while X is inside the card.
        const dx = b.x - a.x;
        if (dx === 0 && (a.x < left || a.x > right)) continue;
        const t1 = dx === 0 ? 0 : Math.max(0, Math.min((left - a.x) / dx, (right - a.x) / dx));
        const t2 = dx === 0 ? 1 : Math.min(1, Math.max((left - a.x) / dx, (right - a.x) / dx));
        if (t1 > t2) continue;
        const y = (t: number) => y1 + (y2 - y1 + 2 * sag) * t - 2 * sag * t * t;
        const peak = Math.max(t1, Math.min(t2, (y2 - y1 + 2 * sag) / (4 * sag)));
        if (Math.min(y(t1), y(t2)) <= bottom && y(peak) >= top) crossings++;
      }
    }
    return crossings;
  };
  for (const i of order) {
    const neighbors = [...packed];
    const candidates = neighbors.length === 0 ? [{ x: 0, y: 0 }] : neighbors.flatMap(j => {
      const dx = (sizes[i].width + sizes[j].width) / 2 + sizes[i].padX + sizes[j].padX + 28;
      const dy = (sizes[i].height + sizes[j].height) / 2 + sizes[i].padY + sizes[j].padY + 28;
      return [-1, 0, 1].flatMap(x => [-1, 0, 1].filter(y => x !== 0 || y !== 0)
        .map(y => ({ x: positions[j].x + x * dx, y: positions[j].y + y * dy })));
    });
    packed.add(i);
    let bestPosition = candidates[0];
    let bestFootprint = Infinity;
    let bestCrossings = Infinity;
    let bestDistance = Infinity;
    for (const candidate of candidates) {
      if (neighbors.some(j =>
        Math.abs(candidate.x - positions[j].x) < (sizes[i].width + sizes[j].width) / 2 + sizes[i].padX + sizes[j].padX + 28 - 1e-6 &&
        Math.abs(candidate.y - positions[j].y) < (sizes[i].height + sizes[j].height) / 2 + sizes[i].padY + sizes[j].padY + 28 - 1e-6)) continue;
      positions[i] = candidate;
      // Prefer a small footprint around the hub, then choose the clearest strings within that footprint.
      const halfWidth = Math.max(...[...packed].map(j => Math.abs(positions[j].x) + sizes[j].width / 2 + sizes[j].padX));
      const halfHeight = Math.max(...[...packed].map(j => Math.abs(positions[j].y) + sizes[j].height / 2 + sizes[j].padY));
      const footprint = Math.max(halfWidth, halfHeight) ** 2 + halfWidth * halfHeight * 0.05;
      if (footprint > bestFootprint + 1e-6) continue;
      const crossings = score();
      const distance = Math.hypot(candidate.x, candidate.y);
      if (footprint < bestFootprint - 1e-6 || crossings < bestCrossings ||
          (crossings === bestCrossings && distance < bestDistance)) {
        bestPosition = candidate;
        bestFootprint = footprint;
        bestCrossings = crossings;
        bestDistance = distance;
      }
    }
    positions[i] = bestPosition;
  }
  const placed = nodes.map((node, i) => ({
    ...node, x: positions[i].x - sizes[i].width / 2, y: positions[i].y - sizes[i].height / 2,
  }));
  const center = calculateClueCardsCenter(placed, id => sizes[indices.get(id)!]);
  return placed.map(node => ({ ...node, x: node.x + CANVAS_SIZE / 2 - center.x, y: node.y + CANVAS_SIZE / 2 - center.y }));
}

/**
 * Clamps zoom scale within [MIN_ZOOM, MAX_ZOOM].
 */
export function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

/**
 * Calculates the bounding box center of all placed clue cards.
 * If no cards are placed, defaults to the canvas center (CANVAS_SIZE / 2).
 */
export function calculateClueCardsCenter(
  nodes: PlacedNode[],
  getCardDimension?: (nodeId: string) => { width?: number; height?: number } | undefined,
): { x: number; y: number } {
  if (nodes.length === 0) {
    return { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
  }
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(
    ...nodes.map(n => n.x + (getCardDimension?.(n.nodeId)?.width ?? CARD_WIDTH)),
  );
  const minY = Math.min(...nodes.map(n => n.y));
  const maxY = Math.max(
    ...nodes.map(n => n.y + (getCardDimension?.(n.nodeId)?.height ?? getEstimatedCardHeight(n))),
  );
  return {
    x: Math.round((minX + maxX) / 2),
    y: Math.round((minY + maxY) / 2),
  };
}

