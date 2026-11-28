import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  IoChevronBack,
  IoDocumentsOutline,
  IoGitBranchOutline,
  IoGridOutline,
  IoArrowUndoOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import { resolveConversationId } from '../../shared/contracts/conversationId';
import {
  createEdgeBetweenNodes,
  evaluateUnmaskedSuspects,
  evaluateContradictions,
  autoArrangeNodes,
  placeNewNodesBelow,
  calculateClueCardsCenter,
  CORKBOARD_COLUMNS_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampCardPosition,
} from './graphEngine';
import {
  evaluateConfrontation,
  calculateConfrontationPreflight,
  getKeyConnectionProgress,
  getVerifiedKeyEdgeIds,
  getSuspectsOnBoard,
  hasConfrontationScript,
  createScriptedConfrontation,
  advanceScriptedConfrontation,
  type ConfrontationEvaluationResult,
  type ConfrontationPreflightInfo,
  type ScriptedConfrontationState,
} from './confrontationEngine';
import { useCorkboardGestures } from './useCorkboardGestures';
import { CorkboardCanvas } from './components/CorkboardCanvas';
import { ConfrontationConfirmModal } from './components/ConfrontationConfirmModal';
import { ConfrontationModal } from './components/ConfrontationModal';
import chalkboardBoardUrl from './assets/chalkboard-board.webp';
import detectiveOfficeWallUrl from './assets/detective-office-wall.webp';
import './notebook.css';
import type { PlacedNode, CorkboardViewport, PairingState, TaggedEvidenceItem, UndoAction } from './types';
import type { CaseKnowledgeGraph, CaseGraphEdge, CaseGraphNode } from '../../shared/contracts/knowledge-graph';
import type { AppDefinition, AppId } from '../../shared/contracts/app-contracts';
import type { PinnedMessageEntry } from '../../shared/contracts/evidence';
import type { CaseConfig } from '../../shared/contracts/case-schema';

export interface WifeNotebookModalProps {
  isOpen?: boolean;
  getSourceApp?: (id: string) => Pick<AppDefinition, 'displayName' | 'icon' | 'iconAsset' | 'themeGradient'> | undefined;
  caseId?: string;
  caseTitle?: string;
  caseConfig?: CaseConfig;
  knowledgeGraph?: CaseKnowledgeGraph;
  taggedSuspects?: TaggedEvidenceItem[];
  currentStrikes?: number;
  maxStrikes?: number;
  onClose: () => void;
  onNavigateToSource?: (appId: AppId, recordRefId?: string) => void;
  onConfront?: () => void;
  onReturnHome?: () => void;
  onUpdateTaggedSuspects?: (suspects: TaggedEvidenceItem[]) => void;
  onApplyConfrontationStrike?: () => void;
  onConfrontationVictory?: (stars: 1 | 2 | 3, wifeTitle?: string) => void;
  onNextLevel?: () => void;
  onCaught?: () => void;
}

/** 'wall' = whole board hung on the wall (no pan/zoom); 'focus' = zoomed into the board. */
export type CorkboardMode = 'wall' | 'focus';

interface SavedCorkboardState {
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  viewport?: CorkboardViewport;
  mode?: CorkboardMode;
}

/** Screen gap (px) kept around the board in wall view so the detective office and lamp stay visible. */
const WALL_VIEW_MARGIN_PX = 36;
const FOCUS_ZOOM = 1.0;

function isInsideBoard(point: { x: number; y: number }): boolean {
  return point.x >= 0 && point.y >= 0 && point.x <= CANVAS_WIDTH && point.y <= CANVAS_HEIGHT;
}

/** Floating controls over the board (not the buttons printed on cards) stay usable in wall view. */
function isBoardChromeControl(target: EventTarget): boolean {
  const el = target as HTMLElement;
  return Boolean(el.closest('button, .corkboard-control-dock, .corkboard-drawer')) && !el.closest('[data-node-id]');
}

function computeWallViewport(board: HTMLElement | null): CorkboardViewport {
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

function loadSavedCorkboard(caseId?: string): SavedCorkboardState | null {
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

function persistCorkboard(
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

function pruneEdgesToNodes(
  edges: readonly CaseGraphEdge[],
  nodes: ReadonlyArray<{ nodeId: string }>,
): CaseGraphEdge[] {
  const nodeIds = new Set(nodes.map(node => node.nodeId));
  return edges.filter(edge => nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId));
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
 */
function cleanLabel(name?: string): string {
  if (!name) return '';
  return name.replace(/^Tin nhắn:\s*/i, '').trim();
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

export const WifeNotebookModal: React.FC<WifeNotebookModalProps> = ({
  isOpen,
  caseId,
  caseTitle: _caseTitle,
  caseConfig,
  getSourceApp,
  knowledgeGraph = LEVEL_01_KNOWLEDGE_GRAPH,
  taggedSuspects,
  currentStrikes,
  maxStrikes,
  onClose,
  onNavigateToSource,
  onConfront,
  onReturnHome: _onReturnHome,
  onUpdateTaggedSuspects,
  onApplyConfrontationStrike,
  onConfrontationVictory,
  onNextLevel,
  onCaught,
}) => {
  const [isConfirmingConfrontation, setIsConfirmingConfrontation] = useState(false);
  const [confrontationPreflight, setConfrontationPreflight] = useState<ConfrontationPreflightInfo | null>(null);
  const [selectedConfrontationSuspectId, setSelectedConfrontationSuspectId] = useState<string | null>(null);
  const [isConfronting, setIsConfronting] = useState(false);
  const [confrontationEvaluation, setConfrontationEvaluation] = useState<ConfrontationEvaluationResult | null>(null);
  const [scriptedConfrontation, setScriptedConfrontation] = useState<ScriptedConfrontationState | null>(null);
  const scriptedPenaltyAppliedRef = useRef(false);
  const scriptedVictoryRecordedRef = useRef(false);

  // All tagged evidence derived from PlaySession
  const allTaggedNodes = useMemo(() => {
    return deriveNodesFromTaggedEvidence(knowledgeGraph, taggedSuspects);
  }, [knowledgeGraph, taggedSuspects]);

  // Load saved corkboard state from localStorage
  const savedState = useMemo(() => {
    return loadSavedCorkboard(caseId);
  }, [caseId]);

  // Placed nodes restored from saved state + auto-place any new tagged clues in 3 centered columns below existing clues
  const [boardInit] = useState(() => restoreCorkboardState(savedState, allTaggedNodes));
  const [placedNodes, setPlacedNodes] = useState<PlacedNode[]>(boardInit.placedNodes);

  // Edges restored from saved state, pruned to currently placed nodes so removed/reset cards leave no phantom links
  const [storedEdges, setEdges] = useState<CaseGraphEdge[]>(boardInit.edges);
  const edges = useMemo(() => pruneEdgesToNodes(storedEdges, placedNodes).map(edge => {
    const { newEdge } = createEdgeBetweenNodes(knowledgeGraph, [], edge.sourceNodeId, edge.targetNodeId, allTaggedNodes);
    return newEdge ? { ...newEdge, edgeId: newEdge.isCanonical ? newEdge.edgeId : edge.edgeId } : edge;
  }), [storedEdges, placedNodes, knowledgeGraph, allTaggedNodes]);

  const hasDirtyBoardRef = useRef(false);
  const [boardMode, setBoardMode] = useState<CorkboardMode>(() => loadSavedCorkboard(caseId)?.mode ?? 'wall');
  const boardModeRef = useRef(boardMode);
  boardModeRef.current = boardMode;
  const saveCorkboard = useCallback((
    targetCaseId: string | undefined,
    nextNodes: PlacedNode[],
    nextEdges: CaseGraphEdge[],
    nextViewport?: CorkboardViewport,
  ) => {
    hasDirtyBoardRef.current = false;
    persistCorkboard(targetCaseId, nextNodes, nextEdges, nextViewport, boardModeRef.current);
  }, []);

  const prevTaggedIdsRef = useRef<Set<string>>(new Set(allTaggedNodes.map(n => n.nodeId)));
  const latestEdgesRef = useRef(edges);
  useLayoutEffect(() => {
    latestEdgesRef.current = edges;
  }, [edges]);

  // Synchronize placed nodes content (messages, label, subtitle) and auto-place newly arriving tagged clues
  useEffect(() => {
    const nextTaggedIds = new Set(allTaggedNodes.map(n => n.nodeId));
    const removedFromTags = new Set(
      [...prevTaggedIdsRef.current].filter(id => !nextTaggedIds.has(id)),
    );
    prevTaggedIdsRef.current = nextTaggedIds;

    setPlacedNodes(prevPlaced => {
      const filtered = removedFromTags.size > 0
        ? prevPlaced.filter(node => !removedFromTags.has(node.nodeId))
        : prevPlaced;
      const removedAnyNode = filtered.length !== prevPlaced.length;

      const placedIds = new Set(filtered.map(n => n.nodeId));
      const unplaced = allTaggedNodes.filter(n => !placedIds.has(n.nodeId));

      let changed = removedAnyNode;
      const updatedExisting = filtered.map(placed => {
        const matching = allTaggedNodes.find(n => n.nodeId === placed.nodeId);
        if (!matching) return placed;
        const messagesEqual = JSON.stringify(placed.messages) === JSON.stringify(matching.messages);
        if (placed.label === matching.label && placed.subtitle === matching.subtitle && messagesEqual) {
          return placed;
        }
        changed = true;
        return {
          ...placed,
          ...matching,
          x: placed.x,
          y: placed.y,
        };
      });

      if (unplaced.length > 0) {
        const newlyPlaced = placeNewNodesBelow(updatedExisting, unplaced);
        const nextResult = [...updatedExisting, ...newlyPlaced];
        saveCorkboard(caseId, nextResult, pruneEdgesToNodes(latestEdgesRef.current, nextResult));
        return nextResult;
      }

      if (changed) {
        saveCorkboard(caseId, updatedExisting, pruneEdgesToNodes(latestEdgesRef.current, updatedExisting));
        return updatedExisting;
      }

      return prevPlaced;
    });

    if (removedFromTags.size > 0) {
      setEdges(prevEdges => {
        const nextEdges = prevEdges.filter(
          edge => !removedFromTags.has(edge.sourceNodeId) && !removedFromTags.has(edge.targetNodeId),
        );
        return nextEdges.length === prevEdges.length ? prevEdges : nextEdges;
      });
    }
  }, [allTaggedNodes, caseId, saveCorkboard]);

  // Graph Evaluation State
  const unmaskedSuspectIds = useMemo(
    () => evaluateUnmaskedSuspects(knowledgeGraph, edges),
    [knowledgeGraph, edges],
  );

  const activeContradictions = useMemo(
    () => evaluateContradictions(edges),
    [edges],
  );

  // All suspects placed or tagged on the corkboard (only needed when confirming confrontation)
  const suspectsOnBoard = useMemo(() => {
    if (!isConfirmingConfrontation) return [];
    return getSuspectsOnBoard({
      placedNodes,
      taggedSuspects,
      caseConfig,
      knowledgeGraph,
      edges,
      unmaskedSuspectIds,
    });
  }, [isConfirmingConfrontation, placedNodes, taggedSuspects, caseConfig, knowledgeGraph, edges, unmaskedSuspectIds]);

  const [activePairing, setActivePairing] = useState<PairingState>({ sourceNodeId: null });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Undo Notification Queue State
  const [, setUndoQueue] = useState<UndoAction[]>([]);
  const [activeUndo, setActiveUndo] = useState<UndoAction | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoPausedRef = useRef(false);
  const remainingUndoTimeRef = useRef(8000);
  const undoStartTimeRef = useRef<number>(0);

  const startUndoTimer = useCallback((durationMs: number) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoStartTimeRef.current = Date.now();
    remainingUndoTimeRef.current = durationMs;
    isUndoPausedRef.current = false;

    undoTimerRef.current = setTimeout(() => {
      setUndoQueue(prevQueue => {
        if (prevQueue.length > 0) {
          const [next, ...rest] = prevQueue;
          setActiveUndo(next);
          startUndoTimer(8000);
          return rest;
        } else {
          setActiveUndo(null);
          return [];
        }
      });
    }, durationMs);
  }, []);

  const pauseUndoTimer = useCallback(() => {
    if (isUndoPausedRef.current || !activeUndo) return;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    const elapsed = Date.now() - undoStartTimeRef.current;
    remainingUndoTimeRef.current = Math.max(500, remainingUndoTimeRef.current - elapsed);
    isUndoPausedRef.current = true;
  }, [activeUndo]);

  const resumeUndoTimer = useCallback(() => {
    if (!isUndoPausedRef.current || !activeUndo) return;
    startUndoTimer(remainingUndoTimeRef.current);
  }, [activeUndo, startUndoTimer]);

  const pushUndo = useCallback((action: UndoAction) => {
    setActiveUndo(current => {
      if (!current) {
        startUndoTimer(8000);
        return action;
      }
      setUndoQueue(prev => [...prev, action]);
      return current;
    });
  }, [startUndoTimer]);

  // Clean up timer on unmount / case switch
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [caseId]);

  const handleDismissSelection = useCallback(() => {
    setSelectedCardId(null);
    setSelectedEdgeId(null);
    setActivePairing({ sourceNodeId: null });
  }, []);

  // Check if we should restore previously saved viewport or center clue cards on first open
  const hasRestoredCards = Boolean(
    savedState?.viewport &&
    boardInit.placedNodes.length > 0 &&
    savedState.placedNodes.some(saved => boardInit.placedNodes.some(node => node.nodeId === saved.nodeId)),
  );
  const initialViewport = useMemo<CorkboardViewport>(() => {
    if (hasRestoredCards && savedState?.viewport) {
      return savedState.viewport;
    }
    return {
      ...calculateClueCardsCenter(placedNodes),
      zoom: 1.0,
    };
  }, [hasRestoredCards, savedState, placedNodes]);

  const planeRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Warm chalkboard + office wall textures and handwriting font on idle so the first slide-out never stalls on decode.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const warmAssets = () => {
      if (typeof Image !== 'undefined') {
        for (const src of [chalkboardBoardUrl, detectiveOfficeWallUrl]) {
          const img = new Image();
          img.src = src;
          void img.decode?.().catch(() => {});
        }
      }
      void document.fonts?.load('400 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
      void document.fonts?.load('500 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
      void document.fonts?.load('600 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
    };
    const idleApi = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleApi.requestIdleCallback) {
      const id = idleApi.requestIdleCallback(warmAssets, { timeout: 1200 });
      return () => idleApi.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(warmAssets, 300);
    return () => window.clearTimeout(timer);
  }, []);

  // Corkboard gestures and zoom engine
  const prefersReducedMotion = useReducedMotion();
  const {
    viewport,
    viewportRef,
    isPinching,
    setViewport,
    setCenter,
    containerProps,
    animateTo,
  } = useCorkboardGestures({
    initialViewport,
    onTapBackground: point => tapBackgroundRef.current(point),
    onDoubleTapBackground: () => doubleTapBackgroundRef.current(),
    onPinchOutAtMinZoom: () => pinchCloseRef.current(),
    onPinchInFromLocked: () => pinchOpenRef.current(),
    locked: boardMode === 'wall',
    reducedMotion: Boolean(prefersReducedMotion),
    planeRef,
    surfaceRef,
    boardRef,
  });

  const flightMs = prefersReducedMotion ? 0 : 420;
  const suppressNextWallClickRef = useRef(false);
  const enterWallView = useCallback(() => {
    suppressNextWallClickRef.current = true;
    handleDismissSelection();
    setBoardMode('wall');
    boardModeRef.current = 'wall';
    animateTo(computeWallViewport(boardRef.current), flightMs);
  }, [animateTo, flightMs, handleDismissSelection]);
  const enterFocusView = useCallback((point: { x: number; y: number }) => {
    setBoardMode('focus');
    boardModeRef.current = 'focus';
    animateTo({ x: point.x, y: point.y, zoom: FOCUS_ZOOM }, flightMs);
  }, [animateTo, flightMs]);

  // Focus view: tapping the wall around the board, double-tapping the board, or pinching out at min zoom puts it back on the wall.
  const tapBackgroundRef = useRef<(point: { x: number; y: number }) => void>(() => {});
  tapBackgroundRef.current = point => {
    if (!isInsideBoard(point)) {
      enterWallView();
      return;
    }
    handleDismissSelection();
  };
  const doubleTapBackgroundRef = useRef<() => void>(() => {});
  doubleTapBackgroundRef.current = () => {
    enterWallView();
  };
  const pinchCloseRef = useRef<() => void>(() => {});
  pinchCloseRef.current = () => {
    enterWallView();
  };
  const pinchOpenRef = useRef<() => void>(() => {});
  pinchOpenRef.current = () => {
    setBoardMode('focus');
    boardModeRef.current = 'focus';
  };

  // Wall view: cards are not interactive; a single tap on the board or a card brings the board forward into focus view.
  const handleWallClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isBoardChromeControl(e.target)) return;
    e.stopPropagation();
    e.preventDefault();
    if (suppressNextWallClickRef.current) {
      suppressNextWallClickRef.current = false;
      return;
    }
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>('[data-node-id]');
    const node = cardEl ? placedNodes.find(n => n.nodeId === cardEl.dataset.nodeId) : undefined;
    if (node && cardEl) {
      enterFocusView({ x: node.x + cardEl.offsetWidth / 2, y: node.y + cardEl.offsetHeight / 2 });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const cam = viewportRef.current;
    const point = {
      x: cam.x + (e.clientX - rect.left - rect.width / 2) / cam.zoom,
      y: cam.y + (e.clientY - rect.top - rect.height / 2) / cam.zoom,
    };
    if (isInsideBoard(point)) enterFocusView(point);
  }, [enterFocusView, placedNodes, viewportRef]);

  const boardContainerProps = boardMode === 'wall'
    ? {
        // Keep move/up/cancel capture handlers mounted so pinch-to-close never orphans pointers
        // and 1-gesture pinch-to-zoom works directly from wall view.
        ...containerProps,
        onPointerDownCapture: (e: React.PointerEvent<HTMLDivElement>) => {
          suppressNextWallClickRef.current = false;
          containerProps.onPointerDownCapture(e);
          if (!isBoardChromeControl(e.target)) e.stopPropagation();
        },
        onClickCapture: handleWallClickCapture,
      }
    : containerProps;

  // Keep the whole board framed in wall view when the screen size changes.
  useEffect(() => {
    if (boardMode !== 'wall') return;
    const refit = () => setViewport(computeWallViewport(boardRef.current));
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, [boardMode, setViewport]);

  // On first open, once cards mount in DOM, accurately center the bounding box if not restoring a saved viewport
  const hasInitializedViewport = useRef(hasRestoredCards && boardMode === 'focus');
  useLayoutEffect(() => {
    if (hasInitializedViewport.current) return;
    if (boardModeRef.current === 'wall') {
      hasInitializedViewport.current = true;
      setViewport(computeWallViewport(boardRef.current));
      return;
    }
    if (placedNodes.length === 0) return;
    hasInitializedViewport.current = true;
    const cards = new Map(
      Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-node-id]') ?? []).map(card => [
        card.dataset.nodeId,
        card,
      ]),
    );
    const center = calculateClueCardsCenter(placedNodes, nodeId => {
      const el = cards.get(nodeId);
      return el ? { width: el.offsetWidth, height: el.offsetHeight } : undefined;
    });
    setViewport({ ...center, zoom: 1.0 });
  }, [placedNodes, setViewport]);

  // Flush position after close slide completes so storage serialization never stalls frame 1.
  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    let timer: number | undefined;
    if (prevIsOpen.current && !isOpen) {
      const snapshotViewport = viewportRef.current;
      timer = window.setTimeout(() => {
        saveCorkboard(caseId, placedNodes, edges, snapshotViewport);
      }, 360);
    }
    prevIsOpen.current = isOpen;
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [isOpen, caseId, placedNodes, edges, viewportRef, saveCorkboard]);

  // Card Movement Handler (repositioning card on the corkboard & persisting)
  const handleMoveNode = useCallback((nodeId: string, x: number, y: number) => {
    hasDirtyBoardRef.current = true;
    setPlacedNodes(prev => {
      const updated = prev.map(n => (n.nodeId === nodeId ? { ...n, x, y } : n));
      return updated;
    });
  }, []);

  // Save once movement settles, and flush the last position when leaving.
  const didMountPersistEffectRef = useRef(false);
  useEffect(() => {
    if (!didMountPersistEffectRef.current) {
      didMountPersistEffectRef.current = true;
      return;
    }
    hasDirtyBoardRef.current = true;
    const timer = window.setTimeout(
      () => saveCorkboard(caseId, placedNodes, edges, viewport),
      150,
    );
    return () => window.clearTimeout(timer);
  }, [caseId, placedNodes, edges, viewport, saveCorkboard]);
  const latestBoard = useRef({ caseId, placedNodes, edges, viewport });
  useEffect(() => {
    latestBoard.current = { caseId, placedNodes, edges, viewport };
  }, [caseId, placedNodes, edges, viewport]);
  useEffect(() => {
    const flushIfDirty = () => {
      if (!hasDirtyBoardRef.current) return;
      const board = latestBoard.current;
      saveCorkboard(board.caseId, board.placedNodes, board.edges, board.viewport);
    };
    window.addEventListener('pagehide', flushIfDirty);
    return () => {
      window.removeEventListener('pagehide', flushIfDirty);
      flushIfDirty();
    };
  }, [saveCorkboard]);

  // Tap-to-Connect Pairing State Machine & Edge Persist
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedCardId(nodeId);
    setSelectedEdgeId(null); // Mutually exclusive: deselect string when selecting card
    if (!activePairing.sourceNodeId) {
      // First tap: Select Node A
      setActivePairing({ sourceNodeId: nodeId });
      return;
    }

    if (activePairing.sourceNodeId === nodeId) {
      // Tapped same node again: cancel selection
      setActivePairing({ sourceNodeId: null });
      return;
    }

    // Second tap: Attempt connection between Node A and Node B
    const { newEdge, isDuplicate } = createEdgeBetweenNodes(
      knowledgeGraph,
      edges,
      activePairing.sourceNodeId,
      nodeId,
      allTaggedNodes,
    );

    if (newEdge && !isDuplicate) {
      setEdges(prev => {
        const updated = pruneEdgesToNodes([...prev, newEdge], placedNodes);
        saveCorkboard(caseId, placedNodes, updated);
        return updated;
      });
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          if (newEdge.isSmokingGun) {
            navigator.vibrate([50, 50, 80]); // Distinct double pulse for smoking gun discovery
          } else if (newEdge.isCanonical) {
            navigator.vibrate([40, 50, 40]); // Confirmed evidence pulse
          } else {
            navigator.vibrate(20);           // Soft speculation tap
          }
        } catch { /* ignore */ }
      }
    }

    // Reset pairing mode
    setActivePairing({ sourceNodeId: null });
  }, [activePairing.sourceNodeId, caseId, edges, knowledgeGraph, placedNodes, allTaggedNodes, saveCorkboard]);

  const handleSelectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    if (edgeId !== null) {
      // Mutually exclusive: deselect card and cancel pairing when selecting string
      setSelectedCardId(null);
      setActivePairing({ sourceNodeId: null });
    }
  }, []);

  const handleSeverEdge = useCallback((edgeId: string) => {
    setEdges(prev => {
      const updated = pruneEdgesToNodes(prev.filter(e => e.edgeId !== edgeId), placedNodes);
      saveCorkboard(caseId, placedNodes, updated);
      return updated;
    });
    setSelectedEdgeId(null);
  }, [caseId, placedNodes, saveCorkboard]);

  // Remove a whole clue card (with Undo)
  const handleDeleteCard = useCallback((nodeId: string) => {
    const node = placedNodes.find(n => n.nodeId === nodeId);
    if (!node) return;

    const severedEdges = edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
    const updatedPlaced = placedNodes.filter(n => n.nodeId !== nodeId);
    const updatedEdges = edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);

    setPlacedNodes(updatedPlaced);
    setEdges(updatedEdges);
    saveCorkboard(caseId, updatedPlaced, updatedEdges);

    if (selectedCardId === nodeId) setSelectedCardId(null);
    if (activePairing.sourceNodeId === nodeId) setActivePairing({ sourceNodeId: null });

    // Update tagged suspects in PlaySession
    const suspectTargetId = node.suspectId || nodeId;
    const remainingSuspects = (taggedSuspects || []).filter(
      s => s.suspectId !== suspectTargetId && (!node.conversationId || s.conversationId !== node.conversationId),
    );
    onUpdateTaggedSuspects?.(remainingSuspects);

    pushUndo({
      id: `undo_card_${Date.now()}`,
      message: `Đã bỏ ghim thẻ ${node.label}.`,
      type: 'card',
      affectedNodeId: nodeId,
      restoredNode: node,
      restoredPlacedNode: node,
      restoredEdges: severedEdges,
      targetSuspectId: node.suspectId,
      targetConversationId: node.conversationId,
      wasPlaced: true,
      timestamp: Date.now(),
    });
  }, [activePairing.sourceNodeId, caseId, edges, onUpdateTaggedSuspects, placedNodes, pushUndo, saveCorkboard, selectedCardId, taggedSuspects]);

  // Remove an individual message from a card (with Undo)
  const handleDeleteMessage = useCallback((nodeId: string, messageRecordId: string) => {
    const node = placedNodes.find(n => n.nodeId === nodeId);
    if (!node) return;

    const messages = node.messages || [];
    const messageToRemove = messages.find(m => m.recordId === messageRecordId);
    if (!messageToRemove) return;

    const remainingMessages = messages.filter(m => m.recordId !== messageRecordId);
    let severedEdges: CaseGraphEdge[] = [];

    if (remainingMessages.length === 0 && !node.isExplicitConversationPin) {
      // Empty card is removed entirely since conversation wasn't explicitly pinned
      severedEdges = edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
      const updatedPlaced = placedNodes.filter(n => n.nodeId !== nodeId);
      const updatedEdges = edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);

      setPlacedNodes(updatedPlaced);
      setEdges(updatedEdges);
      saveCorkboard(caseId, updatedPlaced, updatedEdges);
      if (selectedCardId === nodeId) setSelectedCardId(null);
    } else {
      // Keep card with updated messages list
      const updatePlaced = (n: PlacedNode) => n.nodeId === nodeId ? { ...n, messages: remainingMessages } : n;
      const nextPlaced = placedNodes.map(updatePlaced);
      setPlacedNodes(nextPlaced);
      saveCorkboard(caseId, nextPlaced, edges);
    }

    // Update tagged suspects in PlaySession
    const suspectTargetId = node.suspectId || nodeId;
    const updatedSuspects = (taggedSuspects || []).map(s => {
      if (s.suspectId === suspectTargetId || (node.conversationId && s.conversationId === node.conversationId)) {
        return {
          ...s,
          messages: (s.messages || []).filter(m => m.recordId !== messageRecordId),
        };
      }
      return s;
    }).filter(s => (s.messages && s.messages.length > 0) || s.isExplicitConversationPin);
    onUpdateTaggedSuspects?.(updatedSuspects);

    pushUndo({
      id: `undo_msg_${Date.now()}`,
      message: 'Đã bỏ ghim 1 tin nhắn.',
      type: 'message',
      affectedNodeId: nodeId,
      restoredNode: node,
      restoredPlacedNode: node,
      restoredEdges: severedEdges,
      restoredMessage: messageToRemove,
      targetSuspectId: node.suspectId,
      targetConversationId: node.conversationId,
      wasPlaced: true,
      timestamp: Date.now(),
    });
  }, [caseId, edges, onUpdateTaggedSuspects, placedNodes, pushUndo, saveCorkboard, selectedCardId, taggedSuspects]);

  // Execute Undo
  const handleExecuteUndo = useCallback(() => {
    if (!activeUndo) return;

    if (activeUndo.type === 'card') {
      const nodeToRestore: PlacedNode = activeUndo.restoredPlacedNode || (activeUndo.restoredNode ? {
        ...activeUndo.restoredNode,
        x: CORKBOARD_COLUMNS_X[0],
        y: 160,
      } : (null as unknown as PlacedNode));

      if (nodeToRestore) {
        setPlacedNodes(prev => [...prev.filter(n => n.nodeId !== activeUndo.affectedNodeId), nodeToRestore]);
      }
      if (activeUndo.restoredEdges && activeUndo.restoredEdges.length > 0) {
        setEdges(prev => [...prev, ...activeUndo.restoredEdges!]);
      }

      // Restore tagged suspects
      if (activeUndo.restoredNode) {
        const restoredSuspect: TaggedEvidenceItem = {
          suspectId: activeUndo.restoredNode.suspectId || activeUndo.affectedNodeId,
          displayName: activeUndo.restoredNode.label,
          sourceApp: (activeUndo.restoredNode.sourceAppId || 'internet-messaging') as AppId,
          timestamp: activeUndo.timestamp || Date.now(),
          conversationId: activeUndo.restoredNode.conversationId,
          visibleAlias: activeUndo.restoredNode.visibleAlias,
          isExplicitConversationPin: activeUndo.restoredNode.isExplicitConversationPin,
          messages: activeUndo.restoredNode.messages,
          evidence: activeUndo.restoredNode.recordRefId ? {
            caseId: caseId || 'case_01',
            recordId: activeUndo.restoredNode.recordRefId,
            title: activeUndo.restoredNode.label,
            snippet: activeUndo.restoredNode.subtitle || '',
            clueRefId: activeUndo.restoredNode.clueRefId,
          } : undefined,
        };
        const existing = taggedSuspects || [];
        if (!existing.some(s => s.suspectId === restoredSuspect.suspectId)) {
          onUpdateTaggedSuspects?.([...existing, restoredSuspect]);
        }
      }
    } else if (activeUndo.type === 'message' && activeUndo.restoredMessage) {
      const cardStillExists = placedNodes.some(n => n.nodeId === activeUndo.affectedNodeId);

      if (!cardStillExists) {
        const baseNode = activeUndo.restoredPlacedNode || (activeUndo.restoredNode ? {
          ...activeUndo.restoredNode,
          x: CORKBOARD_COLUMNS_X[0],
          y: 160,
        } : null);
        if (baseNode) {
          const placedWithMsg: PlacedNode = {
            ...baseNode,
            messages: [activeUndo.restoredMessage],
          };
          setPlacedNodes(prev => [...prev, placedWithMsg]);
        }
        if (activeUndo.restoredEdges && activeUndo.restoredEdges.length > 0) {
          setEdges(prev => [...prev, ...activeUndo.restoredEdges!]);
        }
      } else {
        setPlacedNodes(prev => prev.map(n => n.nodeId === activeUndo.affectedNodeId ? {
          ...n,
          messages: [...(n.messages || []).filter(m => m.recordId !== activeUndo.restoredMessage!.recordId), activeUndo.restoredMessage!],
        } : n));
      }

      // Restore message in taggedSuspects
      const updatedSuspects = (taggedSuspects || []).map(s => {
        if (s.suspectId === activeUndo.targetSuspectId || (activeUndo.targetConversationId && s.conversationId === activeUndo.targetConversationId)) {
          const currentMessages = s.messages || [];
          if (!currentMessages.some(m => m.recordId === activeUndo.restoredMessage!.recordId)) {
            return {
              ...s,
              messages: [...currentMessages, activeUndo.restoredMessage!],
            };
          }
        }
        return s;
      });
      onUpdateTaggedSuspects?.(updatedSuspects);
    }

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoQueue(prevQueue => {
      if (prevQueue.length > 0) {
        const [next, ...rest] = prevQueue;
        setActiveUndo(next);
        startUndoTimer(8000);
        return rest;
      } else {
        setActiveUndo(null);
        return [];
      }
    });
  }, [activeUndo, caseId, onUpdateTaggedSuspects, placedNodes, startUndoTimer, taggedSuspects]);

  // Remove a node from the corkboard (delegates directly to handleDeleteCard)
  const handleRemoveNode = useCallback((nodeId: string) => {
    handleDeleteCard(nodeId);
  }, [handleDeleteCard]);

  const handleAutoArrange = useCallback(() => {
    const cards = new Map(
      Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-node-id]') ?? [])
        .map(card => [card.dataset.nodeId, card]),
    );
    if (boardModeRef.current === 'focus') setCenter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    setPlacedNodes(prev => {
      const updated = autoArrangeNodes(prev, edges, nodeId => {
        const card = cards.get(nodeId);
        return card ? { width: card.offsetWidth, height: card.offsetHeight } : undefined;
      });
      saveCorkboard(caseId, updated, edges, viewportRef.current);
      return updated;
    });
  }, [caseId, edges, viewportRef, setCenter, saveCorkboard]);

  const handleCenterCluster = useCallback(() => {
    if (placedNodes.length === 0) {
      enterFocusView({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
      return;
    }
    const avgX = placedNodes.reduce((acc, n) => acc + n.x + 105, 0) / placedNodes.length;
    const avgY = placedNodes.reduce((acc, n) => acc + n.y + 50, 0) / placedNodes.length;
    enterFocusView({ x: avgX, y: avgY });
  }, [placedNodes, enterFocusView]);

  const handleSelectCard = useCallback((id: string | null) => {
    setSelectedCardId(id);
    if (id !== null) setSelectedEdgeId(null);
  }, []);
  const handleNavigateToSource = useCallback((appId?: string, recordId?: string) => {
    saveCorkboard(caseId, placedNodes, edges, viewportRef.current);
    onNavigateToSource?.(appId as AppId, recordId);
  }, [caseId, edges, onNavigateToSource, placedNodes, saveCorkboard, viewportRef]);
  const handleCancelPairing = useCallback(() => setActivePairing({ sourceNodeId: null }), []);

  const handleOpenConfrontation = useCallback(() => {
    onConfront?.();
    const resolvedConfig: CaseConfig = caseConfig ?? {
      caseId: caseId || 'case_01',
      husbandId: 'husband_hoang',
      husbandName: 'Hoàng',
      levelNumber: 1,
      allowedStrikes: maxStrikes || 5,
      groundTruth: {
        verdict: 'cheating',
        culpritSuspectId: 'suspect_huong',
        narrativeRoast:
          'Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?',
        overJealousRoast:
          'Lan Anh thu quỹ sinh nhật sếp, cả nhóm mỗi người một trăm. Em đọc thêm hai dòng là giải oan được rồi.',
      },
      suspectPool: [],
      lockChallenges: [],
      deviceMetadata: {
        narrativeTime: '23:45',
        batteryPercent: '42%',
        carrierTag: '5G',
        pwaThemeColor: '#0f172a',
      },
      activeAppIds: [],
      appsData: {},
    };

    // Reset selected suspect on open so user can pick from list on Step 1
    setSelectedConfrontationSuspectId(null);

    const preflight = calculateConfrontationPreflight({
      caseConfig: resolvedConfig,
      knowledgeGraph,
      activeEdges: edges,
      placedNodes,
      taggedSuspects,
      totalClues: 10,
    });

    setConfrontationPreflight(preflight);
    setIsConfirmingConfrontation(true);
  }, [caseConfig, caseId, edges, knowledgeGraph, maxStrikes, onConfront, placedNodes, taggedSuspects]);

  const handleSelectConfrontationSuspect = useCallback((suspectId: string | null) => {
    setSelectedConfrontationSuspectId(suspectId);
    const resolvedConfig: CaseConfig = caseConfig ?? {
      caseId: caseId || 'case_01',
      husbandId: 'husband_hoang',
      husbandName: 'Hoàng',
      levelNumber: 1,
      allowedStrikes: maxStrikes || 5,
      groundTruth: {
        verdict: 'cheating',
        culpritSuspectId: 'suspect_huong',
        narrativeRoast:
          'Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?',
        overJealousRoast:
          'Lan Anh thu quỹ sinh nhật sếp, cả nhóm mỗi người một trăm. Em đọc thêm hai dòng là giải oan được rồi.',
      },
      suspectPool: [],
      lockChallenges: [],
      deviceMetadata: {
        narrativeTime: '23:45',
        batteryPercent: '42%',
        carrierTag: '5G',
        pwaThemeColor: '#0f172a',
      },
      activeAppIds: [],
      appsData: {},
    };

    const preflight = calculateConfrontationPreflight({
      caseConfig: resolvedConfig,
      knowledgeGraph,
      activeEdges: edges,
      placedNodes,
      taggedSuspects,
      accusedSuspectId: suspectId ?? undefined,
      totalClues: 10,
    });

    setConfrontationPreflight(preflight);
  }, [caseConfig, caseId, edges, knowledgeGraph, maxStrikes, placedNodes, taggedSuspects]);

  const handleExecuteConfrontation = useCallback((confirmedSuspectId?: string) => {
    const targetSuspectId = confirmedSuspectId || selectedConfrontationSuspectId;
    if (!targetSuspectId || !suspectsOnBoard.some(suspect => suspect.id === targetSuspectId)) return;
    setIsConfirmingConfrontation(false);
    const resolvedConfig: CaseConfig = caseConfig ?? {
      caseId: caseId || 'case_01',
      husbandId: 'husband_hoang',
      husbandName: 'Hoàng',
      levelNumber: 1,
      allowedStrikes: maxStrikes || 5,
      groundTruth: {
        verdict: 'cheating',
        culpritSuspectId: 'suspect_huong',
        narrativeRoast:
          'Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?',
        overJealousRoast:
          'Lan Anh thu quỹ sinh nhật sếp, cả nhóm mỗi người một trăm. Em đọc thêm hai dòng là giải oan được rồi.',
      },
      suspectPool: [],
      lockChallenges: [],
      deviceMetadata: {
        narrativeTime: '23:45',
        batteryPercent: '42%',
        carrierTag: '5G',
        pwaThemeColor: '#0f172a',
      },
      activeAppIds: [],
      appsData: {},
    };

    const activeStrikes = currentStrikes ?? (maxStrikes || 5);

    if (hasConfrontationScript(resolvedConfig)) {
      scriptedPenaltyAppliedRef.current = false;
      scriptedVictoryRecordedRef.current = false;
      const initialSession = createScriptedConfrontation({
        caseConfig: resolvedConfig,
        knowledgeGraph,
        activeEdges: edges,
        placedNodes,
        accusedSuspectId: targetSuspectId,
        currentStrikes: activeStrikes,
      });
      setConfrontationEvaluation(null);
      setScriptedConfrontation(initialSession);
      setIsConfronting(true);
      return;
    }

    const evalResult = evaluateConfrontation({
      caseConfig: resolvedConfig,
      knowledgeGraph,
      activeEdges: edges,
      unmaskedSuspectIds,
      currentStrikes: activeStrikes,
      accusedSuspectId: targetSuspectId,
      placedNodes,
      taggedSuspects,
      totalClues: 10,
    });

    setScriptedConfrontation(null);
    setConfrontationEvaluation(evalResult);
    setIsConfronting(true);

    if (evalResult.stars === 0) {
      onApplyConfrontationStrike?.();
      if (evalResult.isMaxStrikesReached) {
        onCaught?.();
        onClose();
      }
    } else {
      onConfrontationVictory?.(evalResult.stars, evalResult.wifeTitle);
    }
  }, [
    caseConfig,
    caseId,
    currentStrikes,
    edges,
    knowledgeGraph,
    maxStrikes,
    onApplyConfrontationStrike,
    onCaught,
    onClose,
    onConfrontationVictory,
    placedNodes,
    selectedConfrontationSuspectId,
    suspectsOnBoard,
    taggedSuspects,
    unmaskedSuspectIds,
  ]);

  const handleSelectConfrontationChoice = useCallback((choiceId: string) => {
    if (!caseConfig || !hasConfrontationScript(caseConfig)) return;
    setScriptedConfrontation(prev => {
      if (!prev) return prev;
      const next = advanceScriptedConfrontation(prev, choiceId, {
        caseConfig,
        knowledgeGraph,
        activeEdges: edges,
        placedNodes,
      });
      if (next.phase === 'resolved' && !scriptedVictoryRecordedRef.current) {
        scriptedVictoryRecordedRef.current = true;
        onConfrontationVictory?.(3, next.wifeTitle);
      }
      return next;
    });
  }, [caseConfig, edges, knowledgeGraph, onConfrontationVictory, placedNodes]);

  const handleCloseConfrontation = useCallback(() => {
    if (scriptedConfrontation?.phase === 'failed' && !scriptedPenaltyAppliedRef.current) {
      scriptedPenaltyAppliedRef.current = true;
      onApplyConfrontationStrike?.();
      if (scriptedConfrontation.isMaxStrikesReached) {
        setIsConfronting(false);
        setScriptedConfrontation(null);
        onCaught?.();
        onClose();
        return;
      }
    }
    setIsConfronting(false);
    setScriptedConfrontation(null);
  }, [onApplyConfrontationStrike, onCaught, onClose, scriptedConfrontation]);

  const verifiedKeyEdgeIds = useMemo(
    () => getVerifiedKeyEdgeIds(edges, knowledgeGraph),
    [edges, knowledgeGraph],
  );

  const keyConnectionProgress = useMemo(
    () => getKeyConnectionProgress(edges, knowledgeGraph),
    [edges, knowledgeGraph],
  );

  return (
    <div className="wife-notebook relative w-full h-full flex flex-col overflow-hidden bg-[#090C10] text-[#F1F5F9]">
      {/* Full-bleed Corkboard Viewport */}
      <div ref={boardRef} className="relative flex-1 w-full h-full overflow-hidden min-h-0" {...boardContainerProps}>
          <CorkboardCanvas
            getSourceApp={getSourceApp}
            viewport={viewport}
            viewportRef={viewportRef}
            planeRef={planeRef}
            surfaceRef={surfaceRef}
            mode={boardMode}
            isOpen={isOpen}
            isPinching={isPinching}
            placedNodes={placedNodes}
            edges={edges}
            verifiedKeyEdgeIds={verifiedKeyEdgeIds}
            activePairing={activePairing}
            unmaskedSuspectIds={unmaskedSuspectIds}
            activeContradictions={activeContradictions}
            selectedEdgeId={selectedEdgeId}
            selectedNodeId={selectedCardId}
            onSelectNode={handleSelectNode}
            onSelectCard={handleSelectCard}
            onMoveNode={handleMoveNode}
            onSelectEdge={handleSelectEdge}
            onSeverEdge={handleSeverEdge}
            onRemoveNode={handleRemoveNode}
            onDeleteCard={handleDeleteCard}
            onDeleteMessage={handleDeleteMessage}
            onNavigateToSource={handleNavigateToSource}
            onCancelPairing={handleCancelPairing}
          />

          {/* Top-Right Floating Forensic Stats Overlay Pill */}
          <button
            type="button"
            onClick={handleCenterCluster}
            aria-label={`Định vị bảng: ${placedNodes.length} manh mối, ${keyConnectionProgress.verifiedCount}/${keyConnectionProgress.requiredCount} mắt xích quan trọng`}
            title="Định vị các manh mối trên bảng"
            style={{ top: 'calc(max(6px, var(--phone-system-top, 59px)) + 6px)' }}
            className="corkboard-stats-overlay absolute right-3 z-20 flex h-9 items-center rounded-[6px] border border-slate-700/85 bg-[#0D1219]/95 px-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-slate-800/95 active:scale-95 transition-all cursor-pointer after:absolute after:-inset-1 after:content-['']"
          >
            <span className="flex items-center gap-1.5 font-sans text-ios-caption-2 font-semibold tabular-nums">
              <IoDocumentsOutline className="h-3.5 w-3.5 text-[#F1F5F9]" aria-hidden="true" />
              <span className="text-[#F1F5F9]">{placedNodes.length}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <IoGitBranchOutline className="h-3.5 w-3.5 text-[#E11D48]" aria-hidden="true" />
              <span className="text-[#F1F5F9]">{keyConnectionProgress.verifiedCount}/{keyConnectionProgress.requiredCount}</span>
            </span>
          </button>

          {/* Split Floating Bottom Bar: Back (Left) & Tactical Actions (Right) */}
          <div
            className="corkboard-control-dock pointer-events-none absolute inset-x-3 z-20 flex items-center justify-between gap-2"
            style={{ bottom: 'max(14px, var(--phone-system-bottom, 18px))' }}
          >
            <button
              type="button"
              onPointerDown={(e) => {
                // Keep left-edge swipe-back and bottom swipe-home from intercepting taps on the close button.
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Đóng sổ tay của vợ"
              title="Quay lại màn hình chính"
              className="group pointer-events-auto relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-slate-700/85 bg-[#0D1219]/[0.96] text-[#F1F5F9] shadow-[0_10px_24px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
            >
              <IoChevronBack className="h-4 w-4 transition-transform duration-100 group-active:scale-90" aria-hidden="true" />
            </button>

            <div className="pointer-events-auto flex items-center gap-1 rounded-[6px] border border-slate-700/85 bg-[#0D1219]/[0.96] p-0.5 shadow-[0_10px_24px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={handleAutoArrange}
                aria-label="Xếp gọn"
                title="Xếp gọn"
                className="relative flex h-11 w-11 items-center justify-center rounded-[4px] text-[#CBD5E1] hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                <IoGridOutline className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleOpenConfrontation}
                className="relative flex h-11 items-center justify-center gap-1.5 rounded-[4px] border border-[#FB7185]/35 bg-[#E11D48] hover:bg-[#BE123C] px-3 text-white shadow-[0_4px_12px_rgba(225,29,72,0.38)] active:scale-95 transition-all cursor-pointer"
              >
                <IoScaleOutline className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="whitespace-nowrap font-sans text-ios-caption-2 font-bold uppercase tracking-[0.05em] text-white leading-none">
                  Đối chất
                </span>
              </button>
            </div>
          </div>

          {/* Undo Notification Banner */}
          {activeUndo && (
            <div
              role="status"
              aria-live="polite"
              className="fixed sm:absolute bottom-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[360px] z-50 flex items-center justify-between gap-3 rounded-[6px] bg-[#0D1219]/96 text-[#F1F5F9] px-4 py-2.5 shadow-2xl border border-slate-700/85 animate-fadeIn"
              onMouseEnter={pauseUndoTimer}
              onMouseLeave={resumeUndoTimer}
              onFocus={pauseUndoTimer}
              onBlur={resumeUndoTimer}
            >
              <span className="text-ios-footnote font-medium text-slate-200 truncate">
                {activeUndo.message}
              </span>
              <button
                type="button"
                onClick={handleExecuteUndo}
                className="flex items-center gap-1 shrink-0 px-3 py-1.5 min-h-[44px] rounded-[4px] bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 text-white font-sans font-bold text-ios-caption-1 uppercase shadow-md transition-all cursor-pointer"
              >
                <IoArrowUndoOutline className="text-sm" />
                <span>Hoàn tác</span>
              </button>
            </div>
          )}
      </div>

      {/* Pre-confrontation Confirmation Modal */}
      {isConfirmingConfrontation && confrontationPreflight && (
        <ConfrontationConfirmModal
          isOpen={isConfirmingConfrontation}
          preflight={confrontationPreflight}
          suspectsOnBoard={suspectsOnBoard}
          getSourceApp={getSourceApp}
          selectedSuspectId={selectedConfrontationSuspectId}
          husbandName={caseConfig?.husbandName || 'Hoàng'}
          onSelectSuspect={handleSelectConfrontationSuspect}
          onConfirmConfront={handleExecuteConfrontation}
          onCancel={() => setIsConfirmingConfrontation(false)}
        />
      )}

      {/* Anytime Confrontation Hub Overlay (US-016) */}
      {isConfronting && (scriptedConfrontation || confrontationEvaluation) && (
        <ConfrontationModal
          isOpen={isConfronting}
          session={scriptedConfrontation}
          evaluation={confrontationEvaluation}
          epilogueNotification={caseConfig?.epilogueNotification}
          maxStrikes={maxStrikes || caseConfig?.allowedStrikes || 5}
          onSelectChoice={handleSelectConfrontationChoice}
          onContinueInvestigation={handleCloseConfrontation}
          onForgiveAndAdvance={() => {
            setIsConfronting(false);
            setScriptedConfrontation(null);
            onNextLevel?.();
            onClose();
          }}
          onShareRoastCard={() => {
            // US-017 shareable card hook
          }}
          onClose={handleCloseConfrontation}
        />
      )}
    </div>
  );
};
