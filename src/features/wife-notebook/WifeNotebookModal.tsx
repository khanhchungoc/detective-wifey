import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  IoRefreshOutline,
  IoGridOutline,
  IoArrowUndoOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import {
  createEdgeBetweenNodes,
  evaluateUnmaskedSuspects,
  evaluateContradictions,
  autoArrangeNodes,
  placeNewNodesBelow,
  calculateClueCardsCenter,
  CORKBOARD_COLUMNS_X,
  CANVAS_SIZE,
} from './graphEngine';
import {
  evaluateConfrontation,
  calculateConfrontationPreflight,
  getSuspectsOnBoard,
  type ConfrontationEvaluationResult,
  type ConfrontationPreflightInfo,
} from './confrontationEngine';
import { useCorkboardGestures } from './useCorkboardGestures';
import { MiniMapRadar } from './components/MiniMapRadar';
import { CorkboardCanvas } from './components/CorkboardCanvas';
import { ConfrontationConfirmModal } from './components/ConfrontationConfirmModal';
import { ConfrontationModal } from './components/ConfrontationModal';
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

interface SavedCorkboardState {
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  viewport?: CorkboardViewport;
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
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    let resolvedViewport = viewport;
    if (!resolvedViewport) {
      const existing = loadSavedCorkboard(caseId);
      resolvedViewport = existing?.viewport;
    }
    localStorage.setItem(
      getStorageKey(caseId),
      JSON.stringify({ placedNodes, edges, viewport: resolvedViewport }),
    );
  } catch {
    // Ignore storage quota errors
  }
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
    // Resolve conversationId from recordId if format is thread_tuan_m4 or chat:shop:message:1
    let conversationId = rawConvId;
    if (!conversationId && tag.evidence?.recordId) {
      const rec = tag.evidence.recordId;
      if (rec.startsWith('thread_')) {
        const parts = rec.split('_');
        if (parts.length >= 3) conversationId = `${parts[0]}_${parts[1]}`;
        else conversationId = rec;
      } else if (rec.startsWith('chat:')) {
        const parts = rec.split(':');
        if (parts.length >= 2) conversationId = parts[1];
      }
    }
    const cleanedDisplayName = cleanLabel(tag.displayName);
    if (!conversationId && tag.sourceApp === 'internet-messaging' && cleanedDisplayName === 'Anh Tuấn Thợ Điện') {
      conversationId = 'thread_tuan';
    }
    if (!conversationId && (tag.sourceApp === 'messages' || tag.sourceApp === 'phone') && cleanedDisplayName === 'Anh Tuấn Thợ Điện') {
      conversationId = 'sms_contact_10';
    }

    // 1. Try to match by exact recordId or conversationId first, then clueRefId.
    // Invariant: Distinct records (e.g. tx_01 vs tx_02) sharing the same clueRefId must NOT collapse into one card.
    let canonicalMatch = canonicalGraph.nodes.find(n =>
      Boolean(tag.evidence?.recordId && n.sourceAppId === tag.sourceApp && n.recordRefId === tag.evidence.recordId),
    );

    if (!canonicalMatch && conversationId) {
      canonicalMatch = canonicalGraph.nodes.find(n =>
        Boolean(n.sourceAppId === tag.sourceApp && n.recordRefId === conversationId),
      );
    }

    if (!canonicalMatch && tag.evidence?.clueRefId) {
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
      const subtitle = hasMessages ? undefined : (tag.isExplicitConversationPin ? undefined : (tag.evidence?.snippet ?? canonicalMatch?.subtitle));

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

  // All tagged evidence derived from PlaySession
  const allTaggedNodes = useMemo(() => {
    return deriveNodesFromTaggedEvidence(knowledgeGraph, taggedSuspects);
  }, [knowledgeGraph, taggedSuspects]);

  // Load saved corkboard state from localStorage
  const savedState = useMemo(() => {
    return loadSavedCorkboard(caseId);
  }, [caseId]);

  // Placed nodes restored from saved state + auto-place any new tagged clues in 3 centered columns below existing clues
  const [placedNodes, setPlacedNodes] = useState<PlacedNode[]>(() => {
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
          restoredPlaced.push({
            ...targetNode,
            x: saved.x,
            y: saved.y,
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
  });

  // Edges restored from saved state
  const [storedEdges, setEdges] = useState<CaseGraphEdge[]>(savedState?.edges || []);
  const edges = useMemo(() => storedEdges.map(edge => {
    const { newEdge } = createEdgeBetweenNodes(knowledgeGraph, [], edge.sourceNodeId, edge.targetNodeId, allTaggedNodes);
    return newEdge ? { ...newEdge, edgeId: newEdge.isCanonical ? newEdge.edgeId : edge.edgeId } : edge;
  }), [storedEdges, knowledgeGraph, allTaggedNodes]);

  // Synchronize placed nodes content (messages, label, subtitle) and auto-place newly arriving tagged clues
  useEffect(() => {
    setPlacedNodes(prevPlaced => {
      const placedIds = new Set(prevPlaced.map(n => n.nodeId));
      const unplaced = allTaggedNodes.filter(n => !placedIds.has(n.nodeId));

      let changed = false;
      const updatedExisting = prevPlaced.map(placed => {
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
        persistCorkboard(caseId, nextResult, edges);
        return nextResult;
      }

      if (changed) {
        persistCorkboard(caseId, updatedExisting, edges);
        return updatedExisting;
      }

      return prevPlaced;
    });
  }, [allTaggedNodes, caseId, edges]);

  // All suspects placed or tagged on the corkboard (only needed when confirming confrontation)
  const suspectsOnBoard = useMemo(() => {
    if (!isConfirmingConfrontation) return [];
    return getSuspectsOnBoard({
      placedNodes,
      taggedSuspects,
      caseConfig,
      knowledgeGraph,
    });
  }, [isConfirmingConfrontation, placedNodes, taggedSuspects, caseConfig, knowledgeGraph]);

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
  const initialViewport = useMemo<CorkboardViewport>(() => {
    const hasPreviousCards = (savedState?.placedNodes?.length ?? 0) > 0;
    if (savedState?.viewport && hasPreviousCards) {
      return savedState.viewport;
    }
    return {
      ...calculateClueCardsCenter(placedNodes),
      zoom: 1.0,
    };
  }, [savedState, placedNodes]);

  // Corkboard gestures and zoom engine
  const {
    viewport,
    viewportRef,
    isPinching,
    setViewport,
    setCenter,
    containerProps,
  } = useCorkboardGestures({
    initialViewport,
    onTapBackground: handleDismissSelection,
  });

  // On first open, once cards mount in DOM, accurately center the bounding box if not restoring a saved viewport
  const hasInitializedViewport = useRef(
    Boolean(savedState?.viewport && (savedState?.placedNodes?.length ?? 0) > 0),
  );
  useLayoutEffect(() => {
    if (hasInitializedViewport.current) return;
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

  // Flush position immediately when modal closes
  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      persistCorkboard(caseId, placedNodes, edges, viewportRef.current);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, caseId, placedNodes, edges, viewportRef]);

  // Graph Evaluation State
  const unmaskedSuspectIds = useMemo(
    () => evaluateUnmaskedSuspects(knowledgeGraph, edges),
    [knowledgeGraph, edges],
  );

  const activeContradictions = useMemo(
    () => evaluateContradictions(edges),
    [edges],
  );

  // Card Movement Handler (repositioning card on the corkboard & persisting)
  const handleMoveNode = useCallback((nodeId: string, x: number, y: number) => {
    setPlacedNodes(prev => {
      const updated = prev.map(n => (n.nodeId === nodeId ? { ...n, x, y } : n));
      return updated;
    });
  }, []);

  // Save once movement settles, and flush the last position when leaving.
  useEffect(() => {
    const timer = window.setTimeout(
      () => persistCorkboard(caseId, placedNodes, edges, viewport),
      150,
    );
    return () => window.clearTimeout(timer);
  }, [caseId, placedNodes, edges, viewport]);
  const latestBoard = useRef({ caseId, placedNodes, edges, viewport });
  useEffect(() => {
    latestBoard.current = { caseId, placedNodes, edges, viewport };
  }, [caseId, placedNodes, edges, viewport]);
  useEffect(() => {
    const flush = () => {
      const board = latestBoard.current;
      persistCorkboard(board.caseId, board.placedNodes, board.edges, board.viewport);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

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
        const updated = [...prev, newEdge];
        persistCorkboard(caseId, placedNodes, updated);
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
  }, [activePairing.sourceNodeId, caseId, edges, knowledgeGraph, placedNodes, allTaggedNodes]);

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
      const updated = prev.filter(e => e.edgeId !== edgeId);
      persistCorkboard(caseId, placedNodes, updated);
      return updated;
    });
    setSelectedEdgeId(null);
  }, [caseId, placedNodes]);

  // Remove a whole clue card (with Undo)
  const handleDeleteCard = useCallback((nodeId: string) => {
    const node = placedNodes.find(n => n.nodeId === nodeId);
    if (!node) return;

    const severedEdges = edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
    const updatedPlaced = placedNodes.filter(n => n.nodeId !== nodeId);
    const updatedEdges = edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);

    setPlacedNodes(updatedPlaced);
    setEdges(updatedEdges);
    persistCorkboard(caseId, updatedPlaced, updatedEdges);

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
  }, [activePairing.sourceNodeId, caseId, edges, onUpdateTaggedSuspects, placedNodes, pushUndo, selectedCardId, taggedSuspects]);

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
      persistCorkboard(caseId, updatedPlaced, updatedEdges);
      if (selectedCardId === nodeId) setSelectedCardId(null);
    } else {
      // Keep card with updated messages list
      const updatePlaced = (n: PlacedNode) => n.nodeId === nodeId ? { ...n, messages: remainingMessages } : n;
      const nextPlaced = placedNodes.map(updatePlaced);
      setPlacedNodes(nextPlaced);
      persistCorkboard(caseId, nextPlaced, edges);
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
  }, [caseId, edges, onUpdateTaggedSuspects, placedNodes, pushUndo, selectedCardId, taggedSuspects]);

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
    setCenter(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    setPlacedNodes(prev => {
      const updated = autoArrangeNodes(prev, edges, nodeId => {
        const card = cards.get(nodeId);
        return card ? { width: card.offsetWidth, height: card.offsetHeight } : undefined;
      });
      persistCorkboard(caseId, updated, edges, viewportRef.current);
      return updated;
    });
  }, [caseId, edges, viewportRef, setCenter]);

  const handleCenterCluster = useCallback(() => {
    if (placedNodes.length === 0) {
      setCenter(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      return;
    }
    const avgX = placedNodes.reduce((acc, n) => acc + n.x + 105, 0) / placedNodes.length;
    const avgY = placedNodes.reduce((acc, n) => acc + n.y + 50, 0) / placedNodes.length;
    setCenter(avgX, avgY);
  }, [placedNodes, setCenter]);

  const handleResetView = useCallback(() => {
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
    setViewport({ ...center, zoom: 1 });
  }, [placedNodes, setViewport]);

  const handleSelectCard = useCallback((id: string | null) => {
    setSelectedCardId(id);
    if (id !== null) setSelectedEdgeId(null);
  }, []);
  const handleNavigateToSource = useCallback((appId?: string, recordId?: string) => {
    persistCorkboard(caseId, placedNodes, edges, viewportRef.current);
    onNavigateToSource?.(appId as AppId, recordId);
  }, [caseId, edges, onNavigateToSource, placedNodes, viewportRef]);
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
          'Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?',
        overJealousRoast:
          'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
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
          'Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?',
        overJealousRoast:
          'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
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
          'Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?',
        overJealousRoast:
          'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
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

    const evalResult = evaluateConfrontation({
      caseConfig: resolvedConfig,
      knowledgeGraph,
      activeEdges: edges,
      unmaskedSuspectIds,
      currentStrikes: currentStrikes ?? (maxStrikes || 5),
      accusedSuspectId: targetSuspectId,
      placedNodes,
      taggedSuspects,
      totalClues: 10,
    });

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

  return (
    <div className="wife-notebook absolute inset-0 z-50 flex flex-col bg-[var(--notebook-canvas)] text-stone-800">
      {/* Floating radar map */}
      <header className="absolute top-0 left-0 right-0 z-40 flex justify-end p-3 pointer-events-none">
        <div className="pointer-events-auto">
          <MiniMapRadar
            viewport={viewport}
            placedNodes={placedNodes}
            onCenterCluster={handleCenterCluster}
            size={56}
          />
        </div>
      </header>

      {/* Main Corkboard Viewport */}
      <div ref={boardRef} className="relative flex-1 w-full h-full overflow-hidden min-h-0" {...containerProps}>
        <CorkboardCanvas
          getSourceApp={getSourceApp}
          viewport={viewport}
          isPinching={isPinching}
          placedNodes={placedNodes}
          edges={edges}
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

        {/* Floating Bottom Control Dock */}
        <div className="corkboard-control-dock absolute bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-2 right-2 z-20 flex items-center justify-between gap-2 p-1">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <span className="flex h-11 min-w-14 items-center justify-center rounded-xl bg-[var(--notebook-paper)] px-2 text-center font-mono text-sm font-bold text-stone-800">
              {Math.round(viewport.zoom * 100)}%
            </span>

            <button
              type="button"
              aria-label="Căn giữa các thẻ và đặt thu phóng 100%"
              onClick={handleResetView}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-800 active:scale-90 cursor-pointer"
            >
              <IoRefreshOutline className="text-xl" />
            </button>
          </div>

          {/* Auto-Arrange Action & Confrontation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAutoArrange}
              className="flex items-center min-h-11 gap-1.5 whitespace-nowrap rounded-xl bg-rose-50 hover:bg-rose-100 px-3 py-2.5 text-sm font-bold text-[#C2185B] active:scale-95 border border-rose-200 cursor-pointer"
            >
              <IoGridOutline className="text-xl" /> Xếp gọn
            </button>
            <button
              type="button"
              onClick={handleOpenConfrontation}
              className="flex items-center min-h-11 gap-1.5 whitespace-nowrap rounded-xl bg-[#8E24AA] hover:bg-purple-800 px-3 py-2.5 text-sm font-bold text-white shadow active:scale-95 cursor-pointer"
            >
              <IoScaleOutline className="text-xl" />
              <span>Đối chất</span>
            </button>
          </div>
        </div>

        {/* Undo Notification Banner */}
        {activeUndo && (
          <div
            role="status"
            aria-live="polite"
            className="fixed sm:absolute bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] z-50 flex items-center justify-between gap-3 rounded-2xl bg-stone-900/95 text-white px-4 py-3 shadow-2xl border border-white/10 backdrop-blur-md animate-fadeIn"
            onMouseEnter={pauseUndoTimer}
            onMouseLeave={resumeUndoTimer}
            onFocus={pauseUndoTimer}
            onBlur={resumeUndoTimer}
          >
            <span className="text-xs font-medium text-stone-200 truncate">
              {activeUndo.message}
            </span>
            <button
              type="button"
              onClick={handleExecuteUndo}
              className="flex items-center gap-1 shrink-0 px-3 py-1.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
      {isConfronting && confrontationEvaluation && (
        <ConfrontationModal
          isOpen={isConfronting}
          evaluation={confrontationEvaluation}
          maxStrikes={maxStrikes || caseConfig?.allowedStrikes || 5}
          onContinueInvestigation={() => setIsConfronting(false)}
          onForgiveAndAdvance={() => {
            setIsConfronting(false);
            onNextLevel?.();
            onClose();
          }}
          onShareRoastCard={() => {
            // US-017 shareable card hook
          }}
          onClose={() => setIsConfronting(false)}
        />
      )}
    </div>
  );
};
