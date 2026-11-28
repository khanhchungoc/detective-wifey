import { useState, useCallback, useEffect, useRef } from 'react';
import { CORKBOARD_COLUMNS_X } from './graphEngine';
import type { PlacedNode, PairingState, TaggedEvidenceItem, UndoAction, CorkboardViewport } from './types';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { AppId } from '../../shared/contracts/app-contracts';

interface UseNotebookUndoParams {
  caseId?: string;
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  taggedSuspects?: TaggedEvidenceItem[];
  selectedCardId: string | null;
  activePairing: PairingState;
  setPlacedNodes: React.Dispatch<React.SetStateAction<PlacedNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<CaseGraphEdge[]>>;
  setSelectedCardId: React.Dispatch<React.SetStateAction<string | null>>;
  setActivePairing: React.Dispatch<React.SetStateAction<PairingState>>;
  saveCorkboard: (
    targetCaseId: string | undefined,
    nextNodes: PlacedNode[],
    nextEdges: CaseGraphEdge[],
    nextViewport?: CorkboardViewport,
  ) => void;
  onUpdateTaggedSuspects?: (suspects: TaggedEvidenceItem[]) => void;
}

export function useNotebookUndo({
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
}: UseNotebookUndoParams) {
  const [, setUndoQueue] = useState<UndoAction[]>([]);
  const [activeUndo, setActiveUndo] = useState<UndoAction | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        }
        setActiveUndo(null);
        return [];
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

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [caseId]);

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
  }, [
    activePairing.sourceNodeId,
    caseId,
    edges,
    onUpdateTaggedSuspects,
    placedNodes,
    pushUndo,
    saveCorkboard,
    selectedCardId,
    setActivePairing,
    setEdges,
    setPlacedNodes,
    setSelectedCardId,
    taggedSuspects,
  ]);

  const handleDeleteMessage = useCallback((nodeId: string, messageRecordId: string) => {
    const node = placedNodes.find(n => n.nodeId === nodeId);
    if (!node) return;

    const messages = node.messages || [];
    const messageToRemove = messages.find(m => m.recordId === messageRecordId);
    if (!messageToRemove) return;

    const remainingMessages = messages.filter(m => m.recordId !== messageRecordId);
    let severedEdges: CaseGraphEdge[] = [];

    if (remainingMessages.length === 0 && !node.isExplicitConversationPin) {
      severedEdges = edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
      const updatedPlaced = placedNodes.filter(n => n.nodeId !== nodeId);
      const updatedEdges = edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);

      setPlacedNodes(updatedPlaced);
      setEdges(updatedEdges);
      saveCorkboard(caseId, updatedPlaced, updatedEdges);
      if (selectedCardId === nodeId) setSelectedCardId(null);
    } else {
      const updatePlaced = (n: PlacedNode) => n.nodeId === nodeId ? { ...n, messages: remainingMessages } : n;
      const nextPlaced = placedNodes.map(updatePlaced);
      setPlacedNodes(nextPlaced);
      saveCorkboard(caseId, nextPlaced, edges);
    }

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
  }, [
    caseId,
    edges,
    onUpdateTaggedSuspects,
    placedNodes,
    pushUndo,
    saveCorkboard,
    selectedCardId,
    setEdges,
    setPlacedNodes,
    setSelectedCardId,
    taggedSuspects,
  ]);

  const handleExecuteUndo = useCallback(() => {
    if (!activeUndo) return;

    if (activeUndo.type === 'card') {
      const nodeToRestore: PlacedNode | null = activeUndo.restoredPlacedNode || (activeUndo.restoredNode ? {
        ...activeUndo.restoredNode,
        x: CORKBOARD_COLUMNS_X[0],
        y: 160,
      } : null);

      if (nodeToRestore) {
        setPlacedNodes(prev => [...prev.filter(n => n.nodeId !== activeUndo.affectedNodeId), nodeToRestore]);
      }
      if (activeUndo.restoredEdges && activeUndo.restoredEdges.length > 0) {
        setEdges(prev => [...prev, ...activeUndo.restoredEdges!]);
      }

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
      }
      setActiveUndo(null);
      return [];
    });
  }, [activeUndo, caseId, onUpdateTaggedSuspects, placedNodes, setEdges, setPlacedNodes, startUndoTimer, taggedSuspects]);

  return {
    activeUndo,
    pauseUndoTimer,
    resumeUndoTimer,
    handleDeleteCard,
    handleDeleteMessage,
    handleExecuteUndo,
  };
}
