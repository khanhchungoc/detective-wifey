import type { CaseConfig } from '../../shared/contracts/case-schema';
import type { CaseKnowledgeGraph, CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { TaggedEvidenceItem, PlacedNode } from './types';

export interface ClueInfo {
  id: string;
  title: string;
  sourceApp?: string;
  snippet?: string;
  clueRefId?: string;
}

export interface VerifiedStringItem {
  id: string;
  sourceTitle: string;
  targetTitle: string;
  sourceApp?: string;
  targetApp?: string;
  sourceSnippet?: string;
  targetSnippet?: string;
  relationship: string;
  relationshipLabel?: string;
  isSmokingGun: boolean;
  isConnectedToSuspect?: boolean;
  hint?: string;
}

export type ConvictionChanceLevel = 'very_low' | 'low' | 'high' | 'very_high';

export interface ConvictionChance {
  level: ConvictionChanceLevel;
  label: string;       // e.g. "Rất thấp"
  genericWord: string; // e.g. "Very low"
  displayText: string; // e.g. "Rất thấp (Very low)"
}

export interface SuspectOnBoard {
  id: string;
  displayName: string;
  alias?: string;
  roleOrSubtitle?: string;
  avatarName?: string;
  sourceApp?: string;
  isCulprit?: boolean;
  isUnmasked?: boolean;
  unmaskedEvidenceHint?: string;
}

export interface ConfrontationPreflightInfo {
  accusedSuspectId?: string;
  accusedSuspectName?: string;
  accusedSuspectAlias?: string;
  isWrongSuspect: boolean;
  totalClues: number;
  cluesFound: number;
  cluesFoundDisplay: string; // e.g. "7/10 manh mối" or "Không áp dụng"
  cluesFoundPercent: number;
  successRate: number;
  convictionChance: ConvictionChance;
  potentialStars: 0 | 1 | 2 | 3;
  isLowSuccessRate: boolean;
  verifiedCluesList: ClueInfo[];
  verifiedStringsList: VerifiedStringItem[];
}

export interface ConfrontationEvaluationParams {
  caseConfig: CaseConfig;
  knowledgeGraph?: CaseKnowledgeGraph;
  activeEdges: CaseGraphEdge[];
  unmaskedSuspectIds: string[];
  currentStrikes: number;
  accusedSuspectId?: string;
  placedNodes?: PlacedNode[];
  taggedSuspects?: TaggedEvidenceItem[];
  totalClues?: number;
  cluesFound?: number;
  rngRoll?: number; // 0..100, if omitted Math.random() * 100
}

export interface ConfrontationEvaluationResult {
  stars: 0 | 1 | 2 | 3;
  verifiedSmokingGunCount: number;
  requiredSmokingGunCount: number;
  verifiedSmokingGunEdgeIds: string[];
  totalClues: number;
  cluesFound: number;
  successRate: number;
  convictionChance: ConvictionChance;
  rngRoll: number;
  isRngSuccess: boolean;
  husbandName: string;
  husbandDialogue: string;
  husbandMood: 'confident' | 'surprised' | 'nervous' | 'broken';
  wifeTitle?: string;
  narrativeRoast?: string;
  isRedHerringAccusation: boolean;
  accusedSuspectName?: string;
  newStrikesRemaining: number;
  isMaxStrikesReached: boolean;
}

/**
 * Derives distinct suspects that have been added to the corkboard or tagged evidence.
 */
export function getSuspectsOnBoard({
  placedNodes = [],
  taggedSuspects = [],
  caseConfig,
  knowledgeGraph,
  edges = [],
  unmaskedSuspectIds = [],
}: {
  placedNodes?: PlacedNode[];
  taggedSuspects?: TaggedEvidenceItem[];
  caseConfig?: CaseConfig;
  knowledgeGraph?: CaseKnowledgeGraph;
  edges?: CaseGraphEdge[];
  unmaskedSuspectIds?: string[];
}): SuspectOnBoard[] {
  const culpritId = caseConfig?.groundTruth?.culpritSuspectId ?? 'suspect_huong';
  const suspectsMap = new Map<string, SuspectOnBoard>();

  // Helper to determine if a node represents "Vợ" (the player) - must never be an accusation suspect
  const isWifeNode = (label?: string, id?: string) => {
    if (!label && !id) return false;
    const clean = (label || '').trim().toLowerCase();
    const cleanId = (id || '').trim().toLowerCase();
    return clean === 'vợ' || clean === 'vo' || clean === 'vợ yêu' || cleanId.includes('wife');
  };

  // Helper to test if identity bridging exists between alias / phone and real suspect / order
  const hasIdentityBridgingEdge = (suspectId: string) => {
    return edges.some(edge => {
      const rel = edge.relationship;
      const isBridge = rel === 'bridges_identity' ||
        edge.edgeId === 'edge_order_phone' ||
        edge.edgeId === 'edge_order_name' ||
        edge.edgeId === 'edge_name_suspect' ||
        edge.edgeId.startsWith('shared_phone_');
      if (!isBridge) return false;

      // In Level 1, edge_order_phone and shared_phone link the phone to the order of Thu Huong
      if (edge.edgeId === 'edge_order_phone' || edge.edgeId.startsWith('shared_phone_') || edge.edgeId === 'edge_order_name') {
        return suspectId === culpritId || suspectId === 'suspect_huong';
      }

      const sourceNode = placedNodes.find(n => n.nodeId === edge.sourceNodeId);
      const targetNode = placedNodes.find(n => n.nodeId === edge.targetNodeId);
      const touchesSuspect = (sourceNode && (sourceNode.subjectSuspectId === suspectId || sourceNode.suspectId === suspectId || sourceNode.nodeId.includes(suspectId))) ||
                             (targetNode && (targetNode.subjectSuspectId === suspectId || targetNode.suspectId === suspectId || targetNode.nodeId.includes(suspectId)));
      return Boolean(touchesSuspect);
    });
  };

  // 1. From caseConfig suspectPool
  const suspectPool = caseConfig?.suspectPool ?? [];
  for (const poolItem of suspectPool) {
    if (isWifeNode(poolItem.displayName, poolItem.suspectId)) continue;
    const isCulprit = poolItem.suspectId === culpritId;

    const boardNode = placedNodes.find(node => {
      if (isWifeNode(node.label, node.nodeId)) return false;
      if (node.subjectSuspectId === poolItem.suspectId) return true;
      if (node.suspectId === poolItem.suspectId) return true;
      if (node.nodeId.includes(poolItem.suspectId)) return true;
      if (node.label === poolItem.displayName || poolItem.displayName.includes(node.label)) return true;
      if (knowledgeGraph) {
        const kgNode = knowledgeGraph.nodes.find(kn => kn.nodeId === node.nodeId);
        if (
          kgNode?.unmasksToSuspectId &&
          (kgNode.unmasksToSuspectId === poolItem.suspectId ||
            kgNode.unmasksToSuspectId.includes(poolItem.suspectId))
        ) {
          return true;
        }
      }
      return false;
    });

    const tagged = taggedSuspects.find(tag => tag.suspectId === poolItem.suspectId);

    if (boardNode || tagged) {
      const cleanRealName = poolItem.displayName.split('·')[0].trim();

      const isSameAsRealName = (str?: string) => {
        if (!str) return false;
        const normA = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normB = cleanRealName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return normA === normB || normA.includes(normB) || normB.includes(normA);
      };

      let alias: string | undefined;

      // 1. Check knowledge graph for canonical disguise alias (e.g. node_alias_tuan for suspect_huong)
      const canonicalAliasNode = knowledgeGraph?.nodes.find(kn =>
        kn.type === 'alias' &&
        (kn.unmasksToSuspectId === poolItem.suspectId ||
          kn.unmasksToSuspectId === `node_${poolItem.suspectId}` ||
          kn.unmasksToSuspectId?.includes(poolItem.suspectId))
      );
      if (canonicalAliasNode?.label && !isSameAsRealName(canonicalAliasNode.label)) {
        alias = canonicalAliasNode.label;
      }

      // 2. Check placedNodes for an alias node or disguise label differing from real name
      if (!alias) {
        const disguiseNode = placedNodes.find(n => {
          const belongsToPoolItem =
            n.subjectSuspectId === poolItem.suspectId ||
            n.suspectId === poolItem.suspectId ||
            n.nodeId.includes(poolItem.suspectId) ||
            (knowledgeGraph && knowledgeGraph.nodes.some(kn =>
              (kn.nodeId === n.nodeId || (kn.recordRefId && kn.recordRefId === n.recordRefId)) &&
              kn.unmasksToSuspectId?.includes(poolItem.suspectId)
            ));

          const isCulpritElectrician = (poolItem.suspectId === 'suspect_huong' || isCulprit) && (
            (n.label || '').toLowerCase().includes('thợ điện') ||
            (n.label || '').toLowerCase().includes('tuan') ||
            n.nodeId.includes('tuan')
          );

          if (!belongsToPoolItem && !isCulpritElectrician) return false;

          if (n.type === 'alias' && !isSameAsRealName(n.label)) return true;
          if (n.visibleAlias && !isSameAsRealName(n.visibleAlias)) return true;
          if (isCulpritElectrician) return true;
          return false;
        });

        if (disguiseNode) {
          if (!isSameAsRealName(disguiseNode.label)) {
            alias = disguiseNode.label;
          } else if (!isSameAsRealName(disguiseNode.visibleAlias)) {
            alias = disguiseNode.visibleAlias;
          }
        }
      }

      // 3. Explicit fallback for suspect_huong / culprit
      if (!alias && (poolItem.suspectId === 'suspect_huong' || isCulprit)) {
        alias = 'Anh Tuấn Thợ Điện';
      }

      // 4. Fallback for mock test fixtures (e.g. orderAttribution.test.ts where placed order visibleAlias is expected)
      if (!alias) {
        const fallbackNode = placedNodes.find(n => n.subjectSuspectId === poolItem.suspectId || n.suspectId === poolItem.suspectId);
        alias = fallbackNode?.visibleAlias || tagged?.visibleAlias;
      }

      // Check whether this suspect has been unmasked
      const isUnmaskedByState = unmaskedSuspectIds.some(
        id => id === poolItem.suspectId || id === `node_${poolItem.suspectId}` || id.includes(poolItem.suspectId)
      );
      const isUnmaskedByEdge = hasIdentityBridgingEdge(poolItem.suspectId);
      const isUnmasked = isUnmaskedByState || isUnmaskedByEdge;

      // Has any node with the real suspect's name actually been placed or tagged?
      const hasRealNameOnBoard = Boolean(
        tagged ||
        placedNodes.some(n => {
          if (isWifeNode(n.label, n.nodeId)) return false;
          const cleanLabel = (n.label || '').toLowerCase();
          return cleanLabel.includes(cleanRealName.toLowerCase()) || n.nodeId === `node_${poolItem.suspectId}`;
        })
      );

      let displayName: string;
      let avatarName: string;

      if (isUnmasked) {
        displayName = cleanRealName;
        avatarName = cleanRealName;
      } else if (!hasRealNameOnBoard && alias) {
        displayName = alias;
        avatarName = alias;
      } else {
        displayName = boardNode?.label || tagged?.displayName || poolItem.displayName;
        avatarName = boardNode?.label || tagged?.displayName || poolItem.displayName;
      }

      let unmaskedEvidenceHint: string | undefined;
      if (isUnmasked) {
        const hasPhoneBridge = edges.some(e => e.edgeId === 'edge_order_phone' || e.edgeId.startsWith('shared_phone_') || e.edgeId === 'edge_alias_phone');
        if (hasPhoneBridge || poolItem.suspectId === 'suspect_huong') {
          unmaskedEvidenceHint = 'Trùng SĐT: 0988886677';
        } else {
          unmaskedEvidenceHint = 'Khớp dữ liệu nhận diện';
        }
      }

      suspectsMap.set(poolItem.suspectId, {
        id: poolItem.suspectId,
        displayName,
        alias,
        sourceApp: boardNode?.sourceAppId || tagged?.sourceApp || poolItem.initialDiscoveredApp,
        avatarName,
        isCulprit,
        isUnmasked,
        unmaskedEvidenceHint,
      });
    }
  }

  // 2. Include contacts on ordinary message and call cards, too, with deduplication across apps & excluding Wife
  for (const node of placedNodes) {
    if (isWifeNode(node.label, node.nodeId)) continue;
    if (node.subjectSuspectId || node.type === 'suspect' || node.type === 'alias' || node.conversationId ||
        (node.visibleAlias && (node.sourceAppId === 'phone' || node.sourceAppId === 'messages' || node.sourceAppId === 'internet-messaging'))) {
      const suspectId = node.subjectSuspectId || node.suspectId || node.nodeId.replace(/^node_suspect_/, '').replace(/^node_/, '');

      // Check if this contact alias belongs to an existing suspect in suspectsMap (e.g. Anh Tuấn Thợ Điện belongs to suspect_huong)
      const existingEntry = Array.from(suspectsMap.values()).find(suspect => {
        if (suspect.id === suspectId) return true;
        if (suspect.displayName === node.label) return true;
        if (node.visibleAlias && suspect.displayName === node.visibleAlias) return true;
        if (suspect.alias && suspect.alias === node.label) return true;
        if (suspect.alias && node.visibleAlias && suspect.alias === node.visibleAlias) return true;

        // Level 1 electrician check: any node with 'Anh Tuấn Thợ Điện' belongs to suspect_huong / culprit
        const cleanNodeLabel = (node.label || '').toLowerCase();
        const isElectricianNode = cleanNodeLabel.includes('thợ điện') || cleanNodeLabel.includes('anh tuấn') || node.nodeId.includes('tuan');
        if (isElectricianNode && (suspect.id === 'suspect_huong' || suspect.id === culpritId || suspect.isCulprit)) {
          return true;
        }

        // Check canonical knowledge graph mapping by nodeId or recordRefId
        if (knowledgeGraph) {
          const kn = knowledgeGraph.nodes.find(k =>
            k.nodeId === node.nodeId ||
            (k.recordRefId && (k.recordRefId === node.recordRefId || k.recordRefId === node.nodeId))
          );
          if (kn?.unmasksToSuspectId && (kn.unmasksToSuspectId === suspect.id || kn.unmasksToSuspectId.includes(suspect.id))) {
            return true;
          }
        }
        return false;
      });

      // If already listed (even from a different app or node), do not add duplicate!
      if (existingEntry) {
        if (!existingEntry.sourceApp && node.sourceAppId) {
          existingEntry.sourceApp = node.sourceAppId;
        }
        continue;
      }

      const isCulprit = suspectId === culpritId || node.nodeId.includes(culpritId) ||
        Boolean(knowledgeGraph?.nodes.find(kn => kn.nodeId === node.nodeId)?.unmasksToSuspectId?.includes(culpritId));

      suspectsMap.set(suspectId, {
        id: isCulprit ? culpritId : suspectId,
        displayName: node.label,
        alias: node.visibleAlias || (node.type === 'alias' ? node.label : undefined),
        roleOrSubtitle: node.subtitle,
        sourceApp: node.sourceAppId,
        avatarName: node.label,
        isCulprit,
        isUnmasked: false,
      });
    }
  }

  return Array.from(suspectsMap.values());
}

/**
 * Standard red-herring over-jealous roast dialogues for Level 1 suspects.
 */
const RED_HERRING_ROASTS_L1: Record<string, string> = {
  suspect_lan_anh:
    'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
  suspect_thao:
    'Người ta nhắc anh mang phiếu đánh giá cột sống. Em bắt được lưng đau, chưa bắt được người tình.',
  suspect_ngoc:
    'Em gái nhắn cảm ơn anh trai còn chưa đủ rõ à? Chủ nhật về quê chắc phải giới thiệu lại gia phả.',
  suspect_mai:
    'Em kiểm tra điện thoại hay kiểm kê cả khu phố đấy? Mai anh còn đi làm!',
};

const DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS = [
  'edge_order_name',
  'edge_alibi_contradiction',
] as const;

function isMatchingRequiredSmokingGun(edgeId: string, requiredEdgeIds: readonly string[]): boolean {
  return (
    requiredEdgeIds.includes(edgeId) ||
    (edgeId === 'edge_name_suspect' && requiredEdgeIds.includes('edge_order_name')) ||
    (edgeId === 'edge_order_name' && requiredEdgeIds.includes('edge_name_suspect'))
  );
}

/**
 * Identity bridge edges `edge_order_name` and `edge_name_suspect` prove the same link;
 * collapse them to one proof key so connecting both doesn't double-count as two smoking guns.
 */
function normalizeSmokingGunKey(edgeId: string): string {
  return edgeId === 'edge_name_suspect' ? 'edge_order_name' : edgeId;
}

function collectVerifiedSmokingGunEdgeIds(
  edges: readonly CaseGraphEdge[],
  requiredEdgeIds: readonly string[],
): string[] {
  const verified: string[] = [];
  for (const edge of edges) {
    const matchesRequired = isMatchingRequiredSmokingGun(edge.edgeId, requiredEdgeIds);
    if (edge.isCanonical !== false && (edge.isSmokingGun || matchesRequired) && !verified.includes(edge.edgeId)) {
      verified.push(edge.edgeId);
    }
  }
  return verified;
}

/**
 * Computes preflight details and RNG success probability based on clues found.
 *
 * Rules:
 * - < 50% (< 5 clues of 10): 0% success (Guaranteed fail -> 0 stars, +1 strike, warning shown).
 * - 5-8 clues (50%-80%): Success rate rises from 0% to 90% -> 1 star victory on success.
 * - 9 clues (90%): 100% success -> 2 stars victory.
 * - 10 clues (100%): 100% success -> 3 stars victory.
 * - If successRate < 50%: isLowSuccessRate is true (prompts warning popup).
 */
export function calculateConfrontationPreflight({
  caseConfig,
  knowledgeGraph,
  activeEdges,
  placedNodes = [],
  taggedSuspects = [],
  accusedSuspectId,
  totalClues = 10,
  explicitCluesFound,
  unmaskedSuspectIds = [],
}: {
  caseConfig?: CaseConfig;
  knowledgeGraph?: CaseKnowledgeGraph;
  activeEdges: CaseGraphEdge[];
  placedNodes?: PlacedNode[];
  taggedSuspects?: TaggedEvidenceItem[];
  accusedSuspectId?: string;
  totalClues?: number;
  explicitCluesFound?: number;
  unmaskedSuspectIds?: string[];
}): ConfrontationPreflightInfo {
  const culpritId = caseConfig?.groundTruth?.culpritSuspectId ?? 'suspect_huong';

  // If accusedSuspectId is not provided, default to culpritId for backward compatibility
  let effectiveSuspectId = accusedSuspectId || culpritId;
  if (
    effectiveSuspectId.includes('tuan') ||
    effectiveSuspectId.includes('thodien') ||
    effectiveSuspectId.includes('tho_dien')
  ) {
    effectiveSuspectId = culpritId;
  }
  const isWrongSuspect = Boolean(
    accusedSuspectId &&
    effectiveSuspectId !== culpritId &&
    !effectiveSuspectId.includes(culpritId) &&
    !culpritId.includes(effectiveSuspectId),
  );

  // Derive suspect display details
  const derivedSuspect = getSuspectsOnBoard({
    placedNodes,
    taggedSuspects,
    caseConfig,
    knowledgeGraph,
    edges: activeEdges,
    unmaskedSuspectIds,
  }).find(suspect => suspect.id === effectiveSuspectId);
  let accusedSuspectName = derivedSuspect?.displayName;
  let accusedSuspectAlias: string | undefined = derivedSuspect?.alias;

  const poolSuspect = caseConfig?.suspectPool?.find(s => s.suspectId === effectiveSuspectId);
  if (poolSuspect && !accusedSuspectName) {
    accusedSuspectName = poolSuspect.displayName;
  }
  const suspectNode = placedNodes.find(
    n => n.subjectSuspectId === effectiveSuspectId || n.suspectId === effectiveSuspectId ||
      n.nodeId.includes(effectiveSuspectId) ||
      (poolSuspect && n.label.includes(poolSuspect.displayName)),
  );
  if (suspectNode) {
    if (!accusedSuspectName) accusedSuspectName = suspectNode.label;
    if (!accusedSuspectAlias) {
      accusedSuspectAlias = suspectNode.visibleAlias || (suspectNode.type === 'alias' ? suspectNode.label : undefined);
    }
  }
  if (!accusedSuspectAlias && effectiveSuspectId === culpritId) {
    const aliasNode = placedNodes.find(n => n.type === 'alias' || n.visibleAlias);
    if (aliasNode) {
      accusedSuspectAlias = aliasNode.visibleAlias || aliasNode.label;
    }
  }

  const requiredEdgeIds = knowledgeGraph?.requiredSmokingGunEdgeIds ?? [...DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS];

  // 1. Identify canonical active edges & placed evidence reachable from this suspect
  const canonicalActiveEdges = activeEdges.filter(edge => edge.isCanonical ?? Boolean(
    knowledgeGraph?.edges.some(canonical => canonical.edgeId === edge.edgeId),
  ));

  const placedNodeIds = new Set(placedNodes.map(node => node.nodeId));
  const connectedNodeIds = new Set(placedNodes.filter(node =>
    (node.type === 'suspect' || node.type === 'alias' || node.isExplicitConversationPin) && (
      node.suspectId === effectiveSuspectId || node.nodeId === effectiveSuspectId ||
      node.nodeId === `node_${effectiveSuspectId}` ||
      ((node.type === 'suspect' || node.type === 'alias') && (node.label === accusedSuspectName || (!isWrongSuspect && node.label.includes('Tuấn'))))),
  ).map(node => node.nodeId));
  const pending = [...connectedNodeIds];
  for (const nodeId of pending) {
    for (const edge of canonicalActiveEdges) {
      const otherId = edge.sourceNodeId === nodeId ? edge.targetNodeId
        : edge.targetNodeId === nodeId ? edge.sourceNodeId : undefined;
      if (otherId && placedNodeIds.has(otherId) && !connectedNodeIds.has(otherId)) {
        connectedNodeIds.add(otherId);
        pending.push(otherId);
      }
    }
  }

  const getRelationshipLabel = (relationship: string, sourceTitle: string, targetTitle: string): string => {
    const combined = `${sourceTitle} ${targetTitle}`.toLowerCase();
    if (relationship === 'contradicts_alibi') return 'Mâu thuẫn lời khai';
    if (relationship === 'occurred_at') return 'Trùng mốc thời gian';
    if (relationship === 'bridges_identity') {
      if (combined.includes('0988') || combined.includes('sđt') || combined.includes('điện thoại') || combined.includes('cuộc gọi')) {
        return 'Trùng số liên hệ';
      }
      if (combined.includes('160') || combined.includes('tiền') || combined.includes('hoàn') || combined.includes('ngân hàng')) {
        return 'Khớp dòng tiền';
      }
      return 'Khớp danh tính';
    }
    return 'Mắt xích liên kết';
  };

  const getConciseNodeSnippet = (node: PlacedNode | CaseGraphNode | undefined): string | undefined => {
    if (!node) return undefined;
    if ('messages' in node && node.messages?.length) {
      return node.messages.map(m => m.text).filter(Boolean).join(' · ');
    }
    return node.subtitle;
  };

  const verifiedStringsList: VerifiedStringItem[] = [];

  for (const edge of canonicalActiveEdges) {
    const isSmokingGun = Boolean(
      edge.isSmokingGun || isMatchingRequiredSmokingGun(edge.edgeId, requiredEdgeIds),
    );

    const sourcePlaced = placedNodes.find(n => n.nodeId === edge.sourceNodeId);
    const targetPlaced = placedNodes.find(n => n.nodeId === edge.targetNodeId);
    const sourceNode = sourcePlaced || knowledgeGraph?.nodes.find(n => n.nodeId === edge.sourceNodeId);
    const targetNode = targetPlaced || knowledgeGraph?.nodes.find(n => n.nodeId === edge.targetNodeId);

    const sourceTitle = sourceNode?.label || edge.sourceNodeId;
    const targetTitle = targetNode?.label || edge.targetNodeId;
    const isConnectedToSuspect = connectedNodeIds.has(edge.sourceNodeId) && connectedNodeIds.has(edge.targetNodeId);

    verifiedStringsList.push({
      id: edge.edgeId,
      sourceTitle,
      targetTitle,
      sourceApp: sourceNode?.sourceAppId,
      targetApp: targetNode?.sourceAppId,
      sourceSnippet: getConciseNodeSnippet(sourceNode),
      targetSnippet: getConciseNodeSnippet(targetNode),
      relationship: edge.relationship,
      relationshipLabel: getRelationshipLabel(edge.relationship, sourceTitle, targetTitle),
      isSmokingGun,
      isConnectedToSuspect,
      hint: edge.explanationRoastHint,
    });
  }

  const verifiedCluesList: ClueInfo[] = [];
  const seenClueKeys = new Set<string>();
  for (const node of placedNodes) {
    if (!connectedNodeIds.has(node.nodeId) || !canonicalActiveEdges.some(edge =>
      (edge.sourceNodeId === node.nodeId && placedNodeIds.has(edge.targetNodeId)) ||
      (edge.targetNodeId === node.nodeId && placedNodeIds.has(edge.sourceNodeId)),
    )) continue;
    if (node.type === 'suspect' || (node.type === 'alias' && !node.messages?.length && !node.subtitle)) continue;
    const key = `${node.sourceAppId || ''}:${node.recordRefId || node.nodeId}`;
    if (seenClueKeys.has(key)) continue;
    seenClueKeys.add(key);
    const tag = taggedSuspects.find(item => item.sourceApp === node.sourceAppId &&
      ((node.recordRefId && item.evidence?.recordId === node.recordRefId) ||
        (node.conversationId && item.conversationId === node.conversationId)),
    );
    verifiedCluesList.push({
      id: key,
      title: node.label,
      sourceApp: node.sourceAppId,
      snippet: node.messages?.map(message => message.text).filter(Boolean).join(' · ') ||
        node.subtitle || tag?.evidence?.snippet,
      clueRefId: node.clueRefId,
    });
  }

  // 3. Clue Count & Progress Calculation
  let cluesFound: number;
  let cluesFoundDisplay: string;
  let cluesFoundPercent: number;
  let successRate: number;
  let potentialStars: 0 | 1 | 2 | 3;
  let convictionChance: ConvictionChance;

  if (isWrongSuspect) {
    // Wrong suspect: Clue count is NOT APPLICABLE towards convicting husband of affair with this person.
    cluesFound = 0;
    cluesFoundDisplay = 'Không áp dụng';
    cluesFoundPercent = 0;
    successRate = 0;
    potentialStars = 0;
    convictionChance = {
      level: 'very_low',
      label: 'Rất thấp',
      genericWord: 'Very low',
      displayText: 'Rất thấp (Very low)',
    };
  } else {
    // Correct culprit: Clue count is based strictly on actual clues found
    const verifiedSmokingGunEdgeIds = collectVerifiedSmokingGunEdgeIds(canonicalActiveEdges, requiredEdgeIds);
    const verifiedSmokingGunKeys = new Set(verifiedSmokingGunEdgeIds.map(normalizeSmokingGunKey));
    const distinctSmokingGunCount = verifiedSmokingGunKeys.size;
    const requiredKeys = new Set(requiredEdgeIds.map(normalizeSmokingGunKey));

    // US-016 AC 6: 100% of required smoking-gun chain (or >= 3 distinct verified links) yields watertight 3-star victory
    const isCompleteSmokingGunChain = requiredKeys.size > 0
      ? [...requiredKeys].every(reqKey => verifiedSmokingGunKeys.has(reqKey))
      : distinctSmokingGunCount >= 3;

    const smokingGunClueFloor = isCompleteSmokingGunChain
      ? 10
      : distinctSmokingGunCount >= 2
        ? 9
        : distinctSmokingGunCount === 1
          ? 5
          : 0;

    if (explicitCluesFound !== undefined) {
      cluesFound = explicitCluesFound;
    } else {
      // Without any verified smoking-gun link, ordinary clues alone cannot auto-reach 100% (2-3 stars).
      const cappedClueCount = distinctSmokingGunCount === 0
        ? Math.min(8, verifiedCluesList.length)
        : verifiedCluesList.length;
      cluesFound = Math.max(cappedClueCount, smokingGunClueFloor);
    }

    cluesFound = Math.max(0, Math.min(totalClues, cluesFound));
    cluesFoundDisplay = `${cluesFound}/${totalClues} manh mối`;
    cluesFoundPercent = Math.round((cluesFound / totalClues) * 100);

    if (cluesFound < 5) {
      successRate = 0;
      potentialStars = 0;
      convictionChance = {
        level: 'very_low',
        label: 'Rất thấp',
        genericWord: 'Very low',
        displayText: 'Rất thấp (Very low)',
      };
    } else if (cluesFound >= 5 && cluesFound <= 8) {
      // 5-8 clues: 30% to 90%
      successRate = Math.round(30 + ((cluesFound - 5) / 3) * 60);
      potentialStars = 1;
      if (cluesFound === 5) {
        convictionChance = {
          level: 'low',
          label: 'Thấp',
          genericWord: 'Low',
          displayText: 'Thấp (Low)',
        };
      } else {
        convictionChance = {
          level: 'high',
          label: 'Cao',
          genericWord: 'High chance',
          displayText: 'Cao (High chance)',
        };
      }
    } else if (cluesFound === 9) {
      // 9 clues: 100% -> 2 stars
      successRate = 100;
      potentialStars = 2;
      convictionChance = {
        level: 'very_high',
        label: 'Rất cao',
        genericWord: 'Very high chance',
        displayText: 'Rất cao (Very high chance)',
      };
    } else {
      // 10 clues: 100% -> 3 stars
      successRate = 100;
      potentialStars = 3;
      convictionChance = {
        level: 'very_high',
        label: 'Rất cao',
        genericWord: 'Very high chance',
        displayText: 'Rất cao (Very high chance)',
      };
    }
  }

  const isLowSuccessRate = successRate < 50;

  return {
    accusedSuspectId: effectiveSuspectId,
    accusedSuspectName,
    accusedSuspectAlias,
    isWrongSuspect,
    totalClues,
    cluesFound,
    cluesFoundDisplay,
    cluesFoundPercent,
    successRate,
    convictionChance,
    potentialStars,
    isLowSuccessRate,
    verifiedCluesList,
    verifiedStringsList,
  };
}

/**
 * Pure evaluation engine for Anytime Confrontation (US-016).
 * Analyzes active corkboard edges, clue counts, and RNG roll.
 */
export function evaluateConfrontation({
  caseConfig,
  knowledgeGraph,
  activeEdges,
  unmaskedSuspectIds,
  currentStrikes,
  accusedSuspectId,
  placedNodes,
  taggedSuspects,
  totalClues = 10,
  cluesFound: explicitCluesFound,
  rngRoll,
}: ConfrontationEvaluationParams): ConfrontationEvaluationResult {
  const husbandName = caseConfig.husbandName || 'Hoàng';
  const groundTruth = caseConfig.groundTruth;
  const culpritId = groundTruth.culpritSuspectId;

  // 1. Identify canonical required smoking-gun edge IDs
  const requiredEdgeIds = knowledgeGraph?.requiredSmokingGunEdgeIds ?? [...DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS];
  const requiredCount = requiredEdgeIds.length;

  // 2. Identify verified smoking-gun edges in the player's active corkboard
  const verifiedSmokingGunEdgeIds = collectVerifiedSmokingGunEdgeIds(activeEdges, requiredEdgeIds);
  const verifiedCount = verifiedSmokingGunEdgeIds.length;

  // 3. Preflight & RNG Calculation
  const preflight = calculateConfrontationPreflight({
    caseConfig,
    knowledgeGraph,
    activeEdges,
    placedNodes,
    taggedSuspects,
    accusedSuspectId,
    totalClues,
    explicitCluesFound,
  });

  const actualRngRoll = rngRoll !== undefined ? rngRoll : Math.random() * 100;
  const isRngSuccess = actualRngRoll < preflight.successRate;

  // 4. Check for red-herring suspect accusations
  let isRedHerringAccusation = false;
  let accusedSuspectName: string | undefined = preflight.accusedSuspectName;
  let redHerringRoast: string | undefined;

  if (preflight.isWrongSuspect && accusedSuspectId) {
    isRedHerringAccusation = true;
    redHerringRoast =
      RED_HERRING_ROASTS_L1[accusedSuspectId] ||
      groundTruth.overJealousRoast ||
      'Em đa nghi quá rồi! Người ta chỉ là đồng nghiệp bình thường thôi mà!';
  } else if ((!isRngSuccess || preflight.potentialStars === 0) && caseConfig.suspectPool) {
    for (const suspect of caseConfig.suspectPool) {
      if (suspect.suspectId === culpritId) continue;

      const isConnected = activeEdges.some(
        e => e.sourceNodeId.includes(suspect.suspectId) || e.targetNodeId.includes(suspect.suspectId),
      );
      const isUnmasked = unmaskedSuspectIds.some(id => id.includes(suspect.suspectId));

      if (isConnected || isUnmasked) {
        isRedHerringAccusation = true;
        accusedSuspectName = suspect.displayName;
        redHerringRoast =
          RED_HERRING_ROASTS_L1[suspect.suspectId] ||
          groundTruth.overJealousRoast ||
          'Em đa nghi quá rồi! Người ta chỉ là đồng nghiệp bình thường thôi mà!';
        break;
      }
    }
  }

  // 5. Calculate final stars, dialogue, and husband mood
  let stars: 0 | 1 | 2 | 3;
  let husbandDialogue: string;
  let husbandMood: 'confident' | 'surprised' | 'nervous' | 'broken';
  let wifeTitle: string | undefined;
  let narrativeRoast: string | undefined;

  if (isRngSuccess && preflight.potentialStars > 0 && !isRedHerringAccusation) {
    stars = preflight.potentialStars;

    if (stars === 3) {
      // 3 Stars: Watertight victory (Bắt quả tang trọn vẹn)
      husbandMood = 'broken';
      husbandDialogue =
        'Anh xin lỗi vợ... Thôi anh khai thật! Bọn anh có hẹn riêng tối nay ở quán cơm niêu... Em đừng giận nữa mà!';
      wifeTitle = 'Nữ thám tử ghen tuông';
      narrativeRoast =
        groundTruth.narrativeRoast ||
        'Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?';
    } else if (stars === 2) {
      // 2 Stars: Partial victory (Đã vạch trần một phần)
      husbandMood = 'nervous';
      husbandDialogue =
        'Con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra thôi mà em! Anh có biết gì đâu...';
    } else {
      // 1 Star: Partial victory (Thắng non)
      husbandMood = 'surprised';
      husbandDialogue =
        'Số thợ điện hôm trước anh gọi nhờ sửa dây mạng văn phòng mà... chứ có gì đâu!';
    }
  } else {
    // 0 Stars: Premature confrontation failure, wrong suspect, or RNG roll failed
    stars = 0;
    husbandMood = 'confident';
    if (isRedHerringAccusation && redHerringRoast) {
      husbandDialogue = redHerringRoast;
    } else {
      husbandDialogue =
        'Em lại lướt TikTok drama rồi đa nghi đúng không? Anh đi làm cả ngày mệt mỏi, em lại tra khảo anh chuyện vô căn cứ!';
    }
  }

  // 6. Suspicion strike calculation for 0-star premature confrontations
  const newStrikesRemaining = stars === 0 ? Math.max(0, currentStrikes - 1) : currentStrikes;
  const isMaxStrikesReached = stars === 0 && newStrikesRemaining === 0;

  return {
    stars,
    verifiedSmokingGunCount: verifiedCount,
    requiredSmokingGunCount: requiredCount,
    verifiedSmokingGunEdgeIds,
    totalClues: preflight.totalClues,
    cluesFound: preflight.cluesFound,
    successRate: preflight.successRate,
    convictionChance: preflight.convictionChance,
    rngRoll: actualRngRoll,
    isRngSuccess,
    husbandName,
    husbandDialogue,
    husbandMood,
    wifeTitle,
    narrativeRoast,
    isRedHerringAccusation,
    accusedSuspectName,
    newStrikesRemaining,
    isMaxStrikesReached,
  };
}
