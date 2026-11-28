import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import {
  createEdgeBetweenNodes,
  evaluateUnmaskedSuspects,
  evaluateContradictions,
  autoArrangeNodes,
  placeNewNodesBelow,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from './graphEngine';
import {
  getKeyConnectionProgress,
  getVerifiedKeyEdgeIds,
} from './confrontationEngine';
import {
  loadSavedCorkboard,
  persistCorkboard,
  pruneEdgesToNodes,
  restoreCorkboardState,
  deriveNodesFromTaggedEvidence,
} from './corkboardState';
import { useCorkboardViewport } from './useCorkboardViewport';
import { useNotebookUndo } from './useNotebookUndo';
import { useConfrontationFlow } from './useConfrontationFlow';
import { CorkboardCanvas } from './components/CorkboardCanvas';
import { NotebookOverlayControls } from './components/NotebookOverlayControls';
import { ConfrontationConfirmModal } from './components/ConfrontationConfirmModal';
import { ConfrontationModal } from './components/ConfrontationModal';
import './notebook.css';
import type { PlacedNode, CorkboardViewport, PairingState, TaggedEvidenceItem } from './types';
import type { CaseKnowledgeGraph, CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { AppDefinition, AppId } from '../../shared/contracts/app-contracts';
import type { CaseConfig } from '../../shared/contracts/case-schema';

export { restoreCorkboardState, deriveNodesFromTaggedEvidence } from './corkboardState';
export type { CorkboardMode } from './corkboardState';

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
  onVerifiedEdgesChange?: (verifiedEdgeIds: string[]) => void;
  onNextLevel?: () => void;
  onCaught?: () => void;
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
  onVerifiedEdgesChange,
  onNextLevel,
  onCaught,
}) => {
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

  const [activePairing, setActivePairing] = useState<PairingState>({ sourceNodeId: null });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const hasDirtyBoardRef = useRef(false);

  const handleDismissSelection = useCallback(() => {
    setSelectedCardId(null);
    setSelectedEdgeId(null);
    setActivePairing({ sourceNodeId: null });
  }, []);

  const {
    boardMode,
    boardModeRef,
    viewport,
    viewportRef,
    isPinching,
    planeRef,
    surfaceRef,
    setCenter,
    enterFocusView,
    boardContainerProps,
  } = useCorkboardViewport({
    caseId,
    savedState,
    initialPlacedNodes: boardInit.placedNodes,
    placedNodes,
    boardRef,
    onDismissSelection: handleDismissSelection,
  });

  const saveCorkboard = useCallback((
    targetCaseId: string | undefined,
    nextNodes: PlacedNode[],
    nextEdges: CaseGraphEdge[],
    nextViewport?: CorkboardViewport,
  ) => {
    hasDirtyBoardRef.current = false;
    persistCorkboard(targetCaseId, nextNodes, nextEdges, nextViewport, boardModeRef.current);
  }, [boardModeRef]);

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

  const {
    activeUndo,
    pauseUndoTimer,
    resumeUndoTimer,
    handleDeleteCard,
    handleDeleteMessage,
    handleExecuteUndo,
  } = useNotebookUndo({
    caseId,
    placedNodes,
    edges,
    taggedSuspects,
    selectedCardId,
    activePairing,
    setPlacedNodes,
    setEdges,
    setSelectedCardId,
    setActivePairing,
    saveCorkboard,
    onUpdateTaggedSuspects,
  });

  const confrontation = useConfrontationFlow({
    caseId,
    caseConfig,
    knowledgeGraph,
    placedNodes,
    edges,
    taggedSuspects,
    unmaskedSuspectIds,
    currentStrikes,
    maxStrikes,
    onConfront,
    onClose,
    onApplyConfrontationStrike,
    onConfrontationVictory,
    onNextLevel,
    onCaught,
  });

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
    setPlacedNodes(prev => prev.map(n => (n.nodeId === nodeId ? { ...n, x, y } : n)));
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
      setActivePairing({ sourceNodeId: nodeId });
      return;
    }

    if (activePairing.sourceNodeId === nodeId) {
      setActivePairing({ sourceNodeId: null });
      return;
    }

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
            navigator.vibrate([50, 50, 80]);
          } else if (newEdge.isCanonical) {
            navigator.vibrate([40, 50, 40]);
          } else {
            navigator.vibrate(20);
          }
        } catch { /* ignore */ }
      }
    }

    setActivePairing({ sourceNodeId: null });
  }, [activePairing.sourceNodeId, caseId, edges, knowledgeGraph, placedNodes, allTaggedNodes, saveCorkboard]);

  const handleSelectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    if (edgeId !== null) {
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
  }, [boardModeRef, caseId, edges, viewportRef, setCenter, saveCorkboard]);

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

  const verifiedKeyEdgeIds = useMemo(
    () => getVerifiedKeyEdgeIds(edges, knowledgeGraph),
    [edges, knowledgeGraph],
  );

  useEffect(() => {
    onVerifiedEdgesChange?.(verifiedKeyEdgeIds);
  }, [verifiedKeyEdgeIds, onVerifiedEdgesChange]);

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

        <NotebookOverlayControls
          placedCount={placedNodes.length}
          verifiedKeyCount={keyConnectionProgress.verifiedCount}
          requiredKeyCount={keyConnectionProgress.requiredCount}
          activeUndo={activeUndo}
          onCenterCluster={handleCenterCluster}
          onClose={onClose}
          onAutoArrange={handleAutoArrange}
          onOpenConfrontation={confrontation.handleOpenConfrontation}
          onPauseUndoTimer={pauseUndoTimer}
          onResumeUndoTimer={resumeUndoTimer}
          onExecuteUndo={handleExecuteUndo}
        />
      </div>

      {/* Pre-confrontation Confirmation Modal */}
      {caseConfig && confrontation.isConfirmingConfrontation && confrontation.confrontationPreflight && (
        <ConfrontationConfirmModal
          isOpen={confrontation.isConfirmingConfrontation}
          preflight={confrontation.confrontationPreflight}
          suspectsOnBoard={confrontation.suspectsOnBoard}
          getSourceApp={getSourceApp}
          selectedSuspectId={confrontation.selectedConfrontationSuspectId}
          husbandName={caseConfig.husband.shortName}
          onSelectSuspect={confrontation.handleSelectConfrontationSuspect}
          onConfirmConfront={confrontation.handleExecuteConfrontation}
          onCancel={confrontation.handleCancelConfrontation}
        />
      )}

      {/* Anytime Confrontation Hub Overlay (US-016) */}
      {confrontation.isConfronting && (confrontation.scriptedConfrontation || confrontation.confrontationEvaluation) && (
        <ConfrontationModal
          isOpen={confrontation.isConfronting}
          session={confrontation.scriptedConfrontation}
          evaluation={confrontation.confrontationEvaluation}
          epilogueNotification={caseConfig?.epilogueNotification}
          maxStrikes={maxStrikes || caseConfig?.allowedStrikes || 5}
          onSelectChoice={confrontation.handleSelectConfrontationChoice}
          onContinueInvestigation={confrontation.handleCloseConfrontation}
          onForgiveAndAdvance={confrontation.handleForgiveAndAdvance}
          onShareRoastCard={() => {
            // US-017 shareable card hook
          }}
          onClose={confrontation.handleCloseConfrontation}
        />
      )}
    </div>
  );
};
