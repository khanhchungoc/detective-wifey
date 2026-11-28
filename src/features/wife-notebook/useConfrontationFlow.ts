import { useState, useMemo, useCallback, useRef } from 'react';
import {
  evaluateConfrontation,
  calculateConfrontationPreflight,
  getSuspectsOnBoard,
  hasConfrontationScript,
  createScriptedConfrontation,
  advanceScriptedConfrontation,
  type ConfrontationEvaluationResult,
  type ConfrontationPreflightInfo,
  type ScriptedConfrontationState,
} from './confrontationEngine';
import type { PlacedNode, TaggedEvidenceItem } from './types';
import type { CaseKnowledgeGraph, CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { CaseConfig } from '../../shared/contracts/case-schema';

function resolveFallbackCaseConfig(
  caseConfig: CaseConfig | undefined,
  caseId: string | undefined,
  maxStrikes: number | undefined,
): CaseConfig {
  return caseConfig ?? {
    caseId: caseId || 'case_01',
    husbandId: 'husband_hoang',
    husbandName: 'Thịnh',
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
}

interface UseConfrontationFlowParams {
  caseId?: string;
  caseConfig?: CaseConfig;
  knowledgeGraph: CaseKnowledgeGraph;
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  taggedSuspects?: TaggedEvidenceItem[];
  unmaskedSuspectIds: string[];
  currentStrikes?: number;
  maxStrikes?: number;
  onConfront?: () => void;
  onClose: () => void;
  onApplyConfrontationStrike?: () => void;
  onConfrontationVictory?: (stars: 1 | 2 | 3, wifeTitle?: string) => void;
  onNextLevel?: () => void;
  onCaught?: () => void;
}

export function useConfrontationFlow({
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
}: UseConfrontationFlowParams) {
  const [isConfirmingConfrontation, setIsConfirmingConfrontation] = useState(false);
  const [confrontationPreflight, setConfrontationPreflight] = useState<ConfrontationPreflightInfo | null>(null);
  const [selectedConfrontationSuspectId, setSelectedConfrontationSuspectId] = useState<string | null>(null);
  const [isConfronting, setIsConfronting] = useState(false);
  const [confrontationEvaluation, setConfrontationEvaluation] = useState<ConfrontationEvaluationResult | null>(null);
  const [scriptedConfrontation, setScriptedConfrontation] = useState<ScriptedConfrontationState | null>(null);
  const scriptedPenaltyAppliedRef = useRef(false);
  const scriptedVictoryRecordedRef = useRef(false);

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

  const handleOpenConfrontation = useCallback(() => {
    onConfront?.();
    const resolvedConfig = resolveFallbackCaseConfig(caseConfig, caseId, maxStrikes);

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
    const resolvedConfig = resolveFallbackCaseConfig(caseConfig, caseId, maxStrikes);

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
    const resolvedConfig = resolveFallbackCaseConfig(caseConfig, caseId, maxStrikes);
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

  const handleCancelConfrontation = useCallback(() => {
    setIsConfirmingConfrontation(false);
  }, []);

  const handleForgiveAndAdvance = useCallback(() => {
    setIsConfronting(false);
    setScriptedConfrontation(null);
    onNextLevel?.();
    onClose();
  }, [onClose, onNextLevel]);

  return {
    isConfirmingConfrontation,
    confrontationPreflight,
    selectedConfrontationSuspectId,
    isConfronting,
    confrontationEvaluation,
    scriptedConfrontation,
    suspectsOnBoard,
    handleOpenConfrontation,
    handleSelectConfrontationSuspect,
    handleExecuteConfrontation,
    handleSelectConfrontationChoice,
    handleCloseConfrontation,
    handleCancelConfrontation,
    handleForgiveAndAdvance,
  };
}
