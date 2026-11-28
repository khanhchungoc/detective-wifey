import type { CaseConfig } from '../../shared/contracts/case-schema';
import type { CaseKnowledgeGraph, CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { TaggedEvidenceItem, PlacedNode } from './types';
import { DEFAULT_CULPRIT_SUSPECT_ID, getSuspectsOnBoard } from './confrontationSuspects';

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
 * Standard red-herring over-jealous roast dialogues for Level 1 suspects.
 */
const RED_HERRING_ROASTS_L1: Record<string, string> = {
  suspect_02:
    'Bà ấy là mẹ anh! Bình nóng lạnh là quà sinh nhật mẹ. Em xem TikTok thợ điện nhiều quá nên ghen luôn với mẹ chồng à?',
  suspect_04:
    'Lan Anh thu quỹ sinh nhật sếp, cả nhóm mỗi người một trăm. Em đọc thêm hai dòng là giải oan được rồi.',
  suspect_05:
    'Người ta đợi anh tập trị liệu cột sống rồi còn trừ buổi của anh. Em bắt được lưng đau, chưa bắt được người tình.',
  suspect_03:
    'Em gái anh trượt môn Vĩ mô nhờ anh giấu mẹ. Em định bắt ghen hay đi méc mẹ?',
  suspect_06:
    'Hoa sinh nhật sếp Hùng, Lan Anh dặn để tên Mai nhận cho kín. Sảnh lễ tân đâu phải danh sách người tình.',
};

const DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS = [
  'edge_order_phone',
  'edge_alibi_contradiction',
] as const;

function isMatchingRequiredSmokingGun(edgeId: string, requiredEdgeIds: readonly string[]): boolean {
  return requiredEdgeIds.includes(edgeId);
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

function resolveRequiredSmokingGunEdgeIds(knowledgeGraph?: CaseKnowledgeGraph): string[] {
  return knowledgeGraph?.requiredSmokingGunEdgeIds?.length
    ? knowledgeGraph.requiredSmokingGunEdgeIds
    : [...DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS];
}

/**
 * Returns verified key (smoking-gun or required) edge IDs present in active edges.
 */
export function getVerifiedKeyEdgeIds(
  activeEdges: readonly CaseGraphEdge[],
  knowledgeGraph?: CaseKnowledgeGraph,
): string[] {
  const requiredEdgeIds = resolveRequiredSmokingGunEdgeIds(knowledgeGraph);
  const canonicalActiveEdges = activeEdges.filter(edge =>
    edge.isCanonical ?? Boolean(knowledgeGraph?.edges.some(canonical => canonical.edgeId === edge.edgeId)),
  );
  return collectVerifiedSmokingGunEdgeIds(canonicalActiveEdges, requiredEdgeIds);
}

/**
 * Computes how many required key (smoking-gun) connections have been verified
 * out of the total required for the case (e.g. 2/2 for Level 1).
 */
export function getKeyConnectionProgress(
  activeEdges: readonly CaseGraphEdge[],
  knowledgeGraph?: CaseKnowledgeGraph,
): { verifiedCount: number; requiredCount: number } {
  const requiredKeys = new Set(resolveRequiredSmokingGunEdgeIds(knowledgeGraph));
  const verifiedKeys = new Set(getVerifiedKeyEdgeIds(activeEdges, knowledgeGraph));
  const verifiedCount = [...requiredKeys].filter(key => verifiedKeys.has(key)).length;

  return {
    verifiedCount,
    requiredCount: requiredKeys.size,
  };
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
  const culpritId = caseConfig?.groundTruth?.culpritSuspectId ?? DEFAULT_CULPRIT_SUSPECT_ID;

  // If accusedSuspectId is not provided, default to culpritId for backward compatibility
  const effectiveSuspectId = accusedSuspectId || culpritId;
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
    accusedSuspectAlias = knowledgeGraph?.nodes.find(n =>
      n.type === 'alias' && n.unmasksToSuspectId?.includes(culpritId))?.label;
  }

  const requiredEdgeIds = knowledgeGraph?.requiredSmokingGunEdgeIds ?? [...DEFAULT_REQUIRED_SMOKING_GUN_EDGE_IDS];

  // 1. Identify canonical active edges & placed evidence reachable from this suspect
  const canonicalActiveEdges = activeEdges.filter(edge => edge.isCanonical ?? Boolean(
    knowledgeGraph?.edges.some(canonical => canonical.edgeId === edge.edgeId),
  ));

  const placedNodeIds = new Set(placedNodes.map(node => node.nodeId));
  const unmasksToAccused = (nodeId: string) =>
    knowledgeGraph?.nodes.find(n => n.nodeId === nodeId)?.unmasksToSuspectId?.includes(effectiveSuspectId) ?? false;
  const connectedNodeIds = new Set(placedNodes.filter(node =>
    (node.type === 'suspect' || node.type === 'alias' || node.isExplicitConversationPin) && (
      node.suspectId === effectiveSuspectId || node.nodeId === effectiveSuspectId ||
      node.nodeId === `node_${effectiveSuspectId}` || unmasksToAccused(node.nodeId) ||
      ((node.type === 'suspect' || node.type === 'alias') && node.label === accusedSuspectName)),
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
    const verifiedSmokingGunKeys = new Set(collectVerifiedSmokingGunEdgeIds(canonicalActiveEdges, requiredEdgeIds));
    const distinctSmokingGunCount = verifiedSmokingGunKeys.size;
    const requiredKeys = new Set(requiredEdgeIds);

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
  const husbandName = caseConfig.husband.shortName;
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
        'Anh xin lỗi... không có họp nào cả. Anh đi ăn với Hương. Mới một tháng thôi, anh sai rồi...';
      wifeTitle = 'Nữ thám tử ghen tuông';
      narrativeRoast =
        groundTruth.narrativeRoast ||
        'Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?';
    } else if (stars === 2) {
      // 2 Stars: Partial victory (Đã vạch trần một phần)
      husbandMood = 'nervous';
      husbandDialogue =
        'À... Hương bên Marketing nhờ anh áp mã Freeship Extra thôi. Anh với nó chỉ là đồng nghiệp!';
    } else {
      // 1 Star: Partial victory (Thắng non)
      husbandMood = 'surprised';
      husbandDialogue =
        'Khoa... Khoa là dev mới bên anh. Nó nhờ anh đặt hộ váy cho người yêu nên để số nó thôi!';
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
