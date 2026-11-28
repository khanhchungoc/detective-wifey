import { resolveConversationId } from '../../shared/contracts/conversationId';
import {
  placeNewNodesBelow,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampCardPosition,
} from './graphEngine';
import type { PlacedNode, CorkboardViewport, TaggedEvidenceItem } from './types';
import type { CaseKnowledgeGraph, CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { PinnedMessageEntry } from '../../shared/contracts/evidence';

/** 'wall' = whole board hung on the wall (no pan/zoom); 'focus' = zoomed into the board. */
export type CorkboardMode = 'wall' | 'focus';

export interface SavedCorkboardState {
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  viewport?: CorkboardViewport;
  mode?: CorkboardMode;
}

/** Screen gap (px) kept around the board in wall view so the detective office and lamp stay visible. */
const WALL_VIEW_MARGIN_PX = 36;
export const FOCUS_ZOOM = 1.0;

export function isInsideBoard(point: { x: number; y: number }): boolean {
  return point.x >= 0 && point.y >= 0 && point.x <= CANVAS_WIDTH && point.y <= CANVAS_HEIGHT;
}

/** Floating controls over the board (not the buttons printed on cards) stay usable in wall view. */
export function isBoardChromeControl(target: EventTarget): boolean {
  const el = target as HTMLElement;
  return Boolean(el.closest('button, .corkboard-control-dock, .corkboard-drawer')) && !el.closest('[data-node-id]');
}

export function computeWallViewport(board: HTMLElement | null): CorkboardViewport {
  const width = board?.clientWidth || 390;
  const height = board?.clientHeight || 844;
  const isLandscape = width >= height;
  const marginX = isLandscape ? Math.max(WALL_VIEW_MARGIN_PX, Math.round(width * 0.18)) : WALL_VIEW_MARGIN_PX;
  const marginY = isLandscape ? Math.max(WALL_VIEW_MARGIN_PX, Math.round(height * 0.26)) : WALL_VIEW_MARGIN_PX;
  const fit = Math.min(
    (width - marginX * 2) / CANVAS_WIDTH,
    (height - marginY * 2) / CANVAS_HEIGHT,
  );
  const zoom = Math.max(0.05, fit);
  // Position the board slightly above center on the wall, sitting cleanly beneath the top lamp.
  const upwardShiftPx = Math.round(height * (isLandscape ? 0.02 : 0.04));
  return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + upwardShiftPx / zoom, zoom };
}

function getStorageKey(caseId?: string): string {
  return `detective:v1:${caseId || 'case_hoang_01'}:corkboard_state`;
}

export function loadSavedCorkboard(caseId?: string): SavedCorkboardState | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(caseId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.placedNodes) && Array.isArray(parsed.edges)) {
        return parsed as SavedCorkboardState;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

export function persistCorkboard(
  caseId: string | undefined,
  placedNodes: PlacedNode[],
  edges: CaseGraphEdge[],
  viewport?: CorkboardViewport,
  mode?: CorkboardMode,
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    let resolvedViewport = viewport;
    let resolvedMode = mode;
    if (!resolvedViewport || !resolvedMode) {
      const existing = loadSavedCorkboard(caseId);
      resolvedViewport ??= existing?.viewport;
      resolvedMode ??= existing?.mode;
    }
    localStorage.setItem(
      getStorageKey(caseId),
      JSON.stringify({ placedNodes, edges, viewport: resolvedViewport, mode: resolvedMode }),
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function pruneEdgesToNodes(
  edges: readonly CaseGraphEdge[],
  nodes: ReadonlyArray<{ nodeId: string }>,
): CaseGraphEdge[] {
  const nodeIds = new Set(nodes.map(node => node.nodeId));
  return edges.filter(edge => nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId));
}

function cleanLabel(name?: string): string {
  if (!name) return '';
  return name.replace(/^Tin nhắn:\s*/i, '').trim();
}

function buildInitialPlacedNodes(
  savedState: SavedCorkboardState | null,
  allTaggedNodes: CaseGraphNode[],
): PlacedNode[] {
  const seenIds = new Set<string>();
  const restoredPlaced: PlacedNode[] = [];

  if (savedState && savedState.placedNodes.length > 0) {
    for (const saved of savedState.placedNodes) {
      // Find matching node from allTaggedNodes
      let targetNode = allTaggedNodes.find(n => n.nodeId === saved.nodeId);
      // If saved was legacy node for a conversation (e.g. node_internet-messaging_thread_tuan_m4 or node_record_zola_chat)
      if (!targetNode && (saved.nodeId.includes('thread_') || saved.nodeId.includes('chat:'))) {
        targetNode = allTaggedNodes.find(n =>
          (n.recordRefId && saved.nodeId.includes(n.recordRefId)) ||
          (n.conversationId && saved.nodeId.includes(n.conversationId)) ||
          (cleanLabel(saved.label) === n.label),
        );
      }

      if (targetNode && !seenIds.has(targetNode.nodeId)) {
        seenIds.add(targetNode.nodeId);
        // Older saves came from a taller board; pull any off-board card back inside.
        restoredPlaced.push({
          ...targetNode,
          ...clampCardPosition(saved.x, saved.y),
        });
      }
    }
  }

  // Auto-place any newly tagged clues that aren't in the saved placed nodes yet
  const unplaced = allTaggedNodes.filter(n => !seenIds.has(n.nodeId));
  if (unplaced.length === 0) {
    return restoredPlaced;
  }

  const newlyPlaced = placeNewNodesBelow(restoredPlaced, unplaced);
  return [...restoredPlaced, ...newlyPlaced];
}

export function restoreCorkboardState(
  savedState: SavedCorkboardState | null,
  allTaggedNodes: CaseGraphNode[],
): { placedNodes: PlacedNode[]; edges: CaseGraphEdge[] } {
  const placedNodes = buildInitialPlacedNodes(savedState, allTaggedNodes);
  const edges = pruneEdgesToNodes(savedState?.edges || [], placedNodes);
  return { placedNodes, edges };
}

/**
 * Maps player tagged clues/suspects from PlaySession to CaseGraphNode items.
 * Matches canonical graph nodes where possible, or generates dynamic nodes.
 * Invariant: All messages from the same conversation/contact map to exactly ONE node.
 */
export function deriveNodesFromTaggedEvidence(
  canonicalGraph: CaseKnowledgeGraph,
  taggedSuspects?: TaggedEvidenceItem[],
): CaseGraphNode[] {
  if (!taggedSuspects || taggedSuspects.length === 0) {
    return [];
  }

  const nodes: CaseGraphNode[] = [];
  const addedNodeIds = new Set<string>();

  for (const tag of taggedSuspects) {
    const rawConvId = tag.conversationId || tag.evidence?.conversationId || (tag.evidence?.kind === 'conversation' ? tag.evidence.recordId : undefined);
    // Resolve conversationId from recordId if format is thread_khoa_m4 or chat:shop:message:1
    let conversationId = rawConvId ?? resolveConversationId(tag.sourceApp, tag.evidence?.recordId);
    const cleanedDisplayName = cleanLabel(tag.displayName);
    // Legacy contact tags carry no record id: resolve the thread from the visible contact name.
    conversationId ??= resolveConversationId(tag.sourceApp, undefined, undefined, cleanedDisplayName);

    const label = (tag.conversationId || tag.isExplicitConversationPin || conversationId)
      ? (cleanedDisplayName || tag.evidence?.visibleAlias || tag.evidence?.title || 'Cuộc trò chuyện')
      : (cleanLabel(tag.evidence?.title) || cleanedDisplayName || 'Manh mối');

    // Extract incoming messages
    const incomingMessages: PinnedMessageEntry[] = [...(tag.messages || [])];
    if (incomingMessages.length === 0 && tag.evidence?.snippet && tag.evidence.snippet.trim()) {
      const isMessageRecord = tag.evidence.kind === 'message' ||
        (tag.evidence.recordId && tag.evidence.recordId !== conversationId) ||
        tag.displayName.startsWith('Tin nhắn:');
      if (isMessageRecord) {
        let eventTime = tag.evidence.eventTime;
        const eventDate = tag.evidence.eventDate;
        if (!eventTime && tag.evidence.subtitle) {
          const timeMatch = tag.evidence.subtitle.match(/(?:Thời gian:\s*|•\s*)(\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}|\d{1,2}:\d{2})/i);
          if (timeMatch) {
            eventTime = timeMatch[1];
          }
        }
        incomingMessages.push({
          recordId: tag.evidence.recordId || `msg_${tag.timestamp}`,
          text: tag.evidence.snippet,
          eventTime,
          eventDate,
          rawTimestamp: tag.evidence.rawTimestamp,
          clueRefId: tag.evidence.clueRefId,
          direction: tag.evidence.direction,
          sender: tag.evidence.sender,
        });
      }
    }

    for (const m of incomingMessages) {
      if (!m.eventTime && tag.evidence?.subtitle) {
        const timeMatch = tag.evidence.subtitle.match(/(?:Thời gian:\s*|•\s*)(\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}|\d{1,2}:\d{2})/i);
        if (timeMatch) {
          m.eventTime = timeMatch[1];
        }
      }
    }

    // 1. Match the canonical graph node: the conversation itself, then any pinned message, then the
    // record id. Distinct records (e.g. tx_01 vs tx_ngoc) sharing a clueRefId must NOT collapse into one card.
    const inApp = (n: CaseGraphNode) => n.sourceAppId === tag.sourceApp;
    let canonicalMatch = conversationId
      ? canonicalGraph.nodes.find(n => inApp(n) && n.recordRefId === conversationId)
      : undefined;
    for (const m of incomingMessages) {
      if (canonicalMatch) break;
      canonicalMatch = canonicalGraph.nodes.find(n => inApp(n) && n.recordRefId === m.recordId);
    }
    if (!canonicalMatch && tag.evidence?.recordId) {
      canonicalMatch = canonicalGraph.nodes.find(n => inApp(n) && n.recordRefId === tag.evidence!.recordId);
    }

    // A tag with its own record id is a distinct record even when it shares a clueRefId with a canonical node.
    if (!canonicalMatch && !conversationId && !tag.evidence?.recordId && tag.evidence?.clueRefId) {
      canonicalMatch = canonicalGraph.nodes.find(n =>
        Boolean(n.clueRefId === tag.evidence!.clueRefId && (!n.sourceAppId || n.sourceAppId === tag.sourceApp)),
      );
    }

    // 2. If no record/clue match, match by label for person tags or conversation pins
    // Invariant: Different apps maintain separate cards and never conflate into each other
    if (!canonicalMatch && (!tag.evidence || conversationId || tag.isExplicitConversationPin)) {
      canonicalMatch = canonicalGraph.nodes.find(n => {
        const matchesLabel = n.label === cleanedDisplayName || n.nodeId === tag.suspectId;
        if (!matchesLabel) return false;
        // If the node has a sourceAppId, it must match the tag's sourceApp
        if (n.sourceAppId && tag.sourceApp && n.sourceAppId !== tag.sourceApp) return false;
        return true;
      });
    }

    const targetNodeId = canonicalMatch
      ? canonicalMatch.nodeId
      : `node_${tag.sourceApp}_${conversationId || tag.evidence?.recordId || tag.suspectId}`;

    if (addedNodeIds.has(targetNodeId)) {
      // Merge messages into the existing node
      const existing = nodes.find(n => n.nodeId === targetNodeId);
      if (existing) {
        const curMsgs = [...(existing.messages || [])];
        for (const m of incomingMessages) {
          if (!curMsgs.some(em => (em.recordId && em.recordId === m.recordId) || (em.text && em.text.trim() === m.text.trim()))) {
            curMsgs.push(m);
          }
        }
        existing.messages = curMsgs;
        if (curMsgs.length > 0) existing.subtitle = undefined;
        existing.isExplicitConversationPin = existing.isExplicitConversationPin || tag.isExplicitConversationPin;
      }
    } else {
      const hasMessages = incomingMessages.length > 0;
      const isPhotoEvidence = tag.evidence?.kind === 'photo' || Boolean(tag.evidence?.imageSrc);
      const subtitle = isPhotoEvidence
        ? (tag.evidence?.subtitle || (tag.evidence?.snippet?.trim() ? tag.evidence.snippet : canonicalMatch?.subtitle))
        : (hasMessages ? undefined : (tag.isExplicitConversationPin ? undefined : (tag.evidence?.snippet ?? canonicalMatch?.subtitle)));

      if (canonicalMatch) {
        nodes.push({
          ...canonicalMatch,
          label,
          subtitle,
          sourceAppId: tag.sourceApp,
          recordRefId: tag.evidence?.recordId || conversationId || canonicalMatch.recordRefId,
          clueRefId: tag.evidence?.clueRefId || canonicalMatch.clueRefId,
          conversationId,
          visibleAlias: tag.visibleAlias || tag.evidence?.visibleAlias || cleanedDisplayName,
          isExplicitConversationPin: tag.isExplicitConversationPin,
          messages: incomingMessages,
          suspectId: tag.suspectId,
          subjectSuspectId: tag.evidence?.suspectId,
          eventTime: tag.evidence?.eventTime,
          eventDate: tag.evidence?.eventDate,
          rawTimestamp: tag.evidence?.rawTimestamp,
          direction: tag.evidence?.direction,
          sender: tag.evidence?.sender,
          imageSrc: tag.evidence?.imageSrc || canonicalMatch.imageSrc,
          imagePosition: tag.evidence?.imagePosition || canonicalMatch.imagePosition,
          imageAspect: tag.evidence?.imageAspect || canonicalMatch.imageAspect,
        });
      } else {
        nodes.push({
          nodeId: targetNodeId,
          type: tag.evidence ? 'record_clue' : 'suspect',
          label,
          subtitle,
          sourceAppId: tag.sourceApp,
          recordRefId: tag.evidence?.recordId || conversationId,
          clueRefId: tag.evidence?.clueRefId,
          conversationId,
          visibleAlias: tag.visibleAlias || tag.evidence?.visibleAlias || cleanedDisplayName,
          isExplicitConversationPin: tag.isExplicitConversationPin,
          messages: incomingMessages,
          suspectId: tag.suspectId,
          subjectSuspectId: tag.evidence?.suspectId,
          eventTime: tag.evidence?.eventTime,
          eventDate: tag.evidence?.eventDate,
          rawTimestamp: tag.evidence?.rawTimestamp,
          direction: tag.evidence?.direction,
          sender: tag.evidence?.sender,
          imageSrc: tag.evidence?.imageSrc,
          imagePosition: tag.evidence?.imagePosition,
          imageAspect: tag.evidence?.imageAspect,
          isInitialDisguise: false,
        });
      }
      addedNodeIds.add(targetNodeId);
    }
  }

  return nodes;
}
