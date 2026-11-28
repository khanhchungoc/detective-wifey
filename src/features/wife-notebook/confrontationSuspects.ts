import type { CaseConfig } from '../../shared/contracts/case-schema';
import type { CaseKnowledgeGraph, CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { TaggedEvidenceItem, PlacedNode } from './types';

export const DEFAULT_CULPRIT_SUSPECT_ID = 'suspect_01';

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
  const culpritId = caseConfig?.groundTruth?.culpritSuspectId ?? DEFAULT_CULPRIT_SUSPECT_ID;
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

      // The order/phone/name bridges identify the culprit behind the alias; only they lift the mask.
      if (edge.edgeId === 'edge_order_phone' || edge.edgeId.startsWith('shared_phone_') || edge.edgeId === 'edge_order_name' ||
          edge.edgeId === 'edge_name_suspect') {
        return suspectId === culpritId;
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

      // 1. Check knowledge graph for canonical disguise alias (e.g. node_alias_01 for suspect_01)
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

          if (!belongsToPoolItem) return false;

          if (n.type === 'alias' && !isSameAsRealName(n.label)) return true;
          if (n.visibleAlias && !isSameAsRealName(n.visibleAlias)) return true;
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

      // 3. Fallback for mock test fixtures (e.g. orderAttribution.test.ts where placed order visibleAlias is expected)
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

      // Has any identity card with the real suspect's name actually been placed or tagged?
      // Evidence cards (orders, receipts, bridges) may print the real name but must not unmask the alias.
      const hasRealNameOnBoard = Boolean(
        tagged ||
        placedNodes.some(n => {
          if (isWifeNode(n.label, n.nodeId)) return false;
          if (n.type === 'record_clue' || n.type === 'bridge_id' || n.type === 'timeline_slot') return false;
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
        const phoneLabel = knowledgeGraph?.nodes.find(n => n.type === 'bridge_id' && /^SĐT/i.test(n.label))?.label;
        if (hasPhoneBridge && phoneLabel) {
          unmaskedEvidenceHint = `Trùng ${phoneLabel}`;
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

      // Evidence-only cards (phone bridge, group post, alibi record) are not suspects themselves.
      const canonicalKind = knowledgeGraph?.nodes.find(k => k.nodeId === node.nodeId)?.type;
      if (!node.subjectSuspectId && (canonicalKind === 'bridge_id' || canonicalKind === 'record_clue' || canonicalKind === 'timeline_slot')) {
        continue;
      }

      // Check if this contact alias belongs to an existing suspect in suspectsMap (e.g. the "Khoa BE" alias belongs to suspect_01)
      const existingEntry = Array.from(suspectsMap.values()).find(suspect => {
        if (suspect.id === suspectId) return true;
        if (suspect.displayName === node.label) return true;
        if (node.visibleAlias && suspect.displayName === node.visibleAlias) return true;
        if (suspect.alias && suspect.alias === node.label) return true;
        if (suspect.alias && node.visibleAlias && suspect.alias === node.visibleAlias) return true;

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
