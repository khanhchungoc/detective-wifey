import type {
  CaseConfig,
  ConfrontationBeatChoice,
  ConfrontationMood,
  ConfrontationSlot,
  VerdictType,
} from '../../shared/contracts/case-schema';
import type { CaseKnowledgeGraph, CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import type { PlacedNode } from './types';

export { getSuspectsOnBoard } from './confrontationSuspects';
export type { SuspectOnBoard } from './confrontationSuspects';
export {
  getVerifiedKeyEdgeIds,
  getKeyConnectionProgress,
  calculateConfrontationPreflight,
  evaluateConfrontation,
} from './confrontationScoring';
export type {
  ClueInfo,
  VerifiedStringItem,
  ConvictionChanceLevel,
  ConvictionChance,
  ConfrontationPreflightInfo,
  ConfrontationEvaluationParams,
  ConfrontationEvaluationResult,
} from './confrontationScoring';

export type ConfrontationStepPhase =
  | 'opening'
  | 'beat'
  | 'failed'
  | 'ending'
  | 'resolved';

export interface ActiveConfrontationChoice {
  choiceId: string;
  slot: ConfrontationSlot;
  wifeLine: string;
}

export interface ScriptedConfrontationParams {
  caseConfig: CaseConfig;
  knowledgeGraph?: CaseKnowledgeGraph;
  activeEdges: readonly CaseGraphEdge[];
  placedNodes?: readonly PlacedNode[];
  accusedSuspectId?: string;
  currentStrikes: number;
}

export interface ScriptedConfrontationState {
  phase: ConfrontationStepPhase;
  husbandName: string;
  husbandMood: ConfrontationMood;
  husbandLine: string | null;
  lastWifeLine: string | null;
  topic: string | null;
  beatIndex: number;
  totalBeats: number;
  currentStepIndex: number;
  totalSteps: number;
  verifiedBeatCount: number;
  hitSeq: number;
  choices: ActiveConfrontationChoice[];
  canAccuse: boolean;
  selectedEndingChoiceId: string | null;
  selectedEndingOutcome: 'divorce' | 'forgive' | null;
  verdict: VerdictType;
  stars: 0 | 3;
  wifeTitle?: string;
  narrativeRoast?: string;
  currentStrikes: number;
  newStrikesRemaining: number;
  isMaxStrikesReached: boolean;
  isWrongSuspect: boolean;
}

export function hasConfrontationScript(
  caseConfig?: CaseConfig,
): caseConfig is CaseConfig & { confrontationScript: NonNullable<CaseConfig['confrontationScript']> } {
  return Boolean(
    caseConfig?.confrontationScript &&
    caseConfig.confrontationScript.opening.length > 0,
  );
}

function resolveIsWrongSuspect(
  caseConfig: CaseConfig,
  accusedSuspectId?: string,
  knowledgeGraph?: CaseKnowledgeGraph,
): boolean {
  if (!accusedSuspectId) return false;
  const culpritId = caseConfig.groundTruth.culpritSuspectId;
  let effectiveId = accusedSuspectId;
  if (knowledgeGraph) {
    const aliasNode = knowledgeGraph.nodes.find(
      n => n.nodeId === effectiveId || n.nodeId === `node_${effectiveId}`,
    );
    if (aliasNode?.unmasksToSuspectId?.includes(culpritId)) {
      effectiveId = culpritId;
    }
  }
  return (
    effectiveId !== culpritId &&
    !effectiveId.includes(culpritId) &&
    !culpritId.includes(effectiveId)
  );
}

function resolveVerdictWifeTitle(verdict: VerdictType): string {
  if (verdict === 'innocent') return 'Vợ hiền thấu tình đạt lý';
  if (verdict === 'sugar_relationship') return 'Khắc tinh Sugar Daddy';
  return 'Nữ thám tử ghen tuông';
}

function toActiveChoices(
  items: ReadonlyArray<{ choiceId: string; slot: ConfrontationSlot; wifeLine: string }>,
): ActiveConfrontationChoice[] {
  return items.map(item => ({
    choiceId: item.choiceId,
    slot: item.slot,
    wifeLine: item.wifeLine,
  }));
}

/**
 * Evaluates whether a confrontation beat choice is backed by canonical verified edges on the notebook.
 * Red herrings (without requiredEdgeIds) and wrong-suspect accusations always evaluate to false.
 */
export function isBeatChoiceSatisfied({
  choice,
  activeEdges,
  knowledgeGraph,
  isWrongSuspect = false,
}: {
  choice: ConfrontationBeatChoice;
  activeEdges: readonly CaseGraphEdge[];
  knowledgeGraph?: CaseKnowledgeGraph;
  isWrongSuspect?: boolean;
}): boolean {
  if (isWrongSuspect) return false;
  if (!choice.requiredEdgeIds || choice.requiredEdgeIds.length === 0 || !choice.onTrue) {
    return false;
  }

  const verifiedEdgeIds = new Set<string>();
  for (const edge of activeEdges) {
    const isCanonical = edge.isCanonical ?? (
      !knowledgeGraph || knowledgeGraph.edges.some(canonical => canonical.edgeId === edge.edgeId)
    );
    if (!isCanonical) continue;
    verifiedEdgeIds.add(edge.edgeId);
    if (edge.edgeId.startsWith('shared_phone_')) {
      verifiedEdgeIds.add('edge_order_phone');
    }
  }

  return choice.requiredEdgeIds.every(reqId => verifiedEdgeIds.has(reqId));
}

/**
 * Initializes a beat-by-beat scripted confrontation session if `caseConfig.confrontationScript` exists.
 * Returns null when absent so callers fall back safely to `evaluateConfrontation`.
 */
export function createScriptedConfrontation({
  caseConfig,
  knowledgeGraph,
  accusedSuspectId,
  currentStrikes,
}: ScriptedConfrontationParams): ScriptedConfrontationState | null {
  if (!hasConfrontationScript(caseConfig)) {
    return null;
  }

  const script = caseConfig.confrontationScript;
  const hasEnding = script.ending.length > 0;
  const totalSteps = 1 + script.beats.length + (hasEnding ? 1 : 0);
  const isWrongSuspect = resolveIsWrongSuspect(caseConfig, accusedSuspectId, knowledgeGraph);

  return {
    phase: 'opening',
    husbandName: caseConfig.husbandName || 'Thịnh',
    husbandMood: 'confident',
    husbandLine: null,
    lastWifeLine: null,
    topic: null,
    beatIndex: 0,
    totalBeats: script.beats.length,
    currentStepIndex: 0,
    totalSteps,
    verifiedBeatCount: 0,
    hitSeq: 0,
    choices: toActiveChoices(script.opening),
    canAccuse: false,
    selectedEndingChoiceId: null,
    selectedEndingOutcome: null,
    verdict: caseConfig.groundTruth.verdict,
    stars: 0,
    currentStrikes,
    newStrikesRemaining: currentStrikes,
    isMaxStrikesReached: false,
    isWrongSuspect,
  };
}

/**
 * Pure state-machine transition for beat-by-beat interrogation.
 */
export function advanceScriptedConfrontation(
  state: ScriptedConfrontationState,
  choiceId: string,
  {
    caseConfig,
    knowledgeGraph,
    activeEdges,
  }: Omit<ScriptedConfrontationParams, 'currentStrikes'>,
): ScriptedConfrontationState {
  if (!hasConfrontationScript(caseConfig)) return state;
  const script = caseConfig.confrontationScript;

  if (state.phase === 'opening') {
    const choice = script.opening.find(item => item.choiceId === choiceId);
    if (!choice) return state;

    if (script.beats.length === 0) {
      const wifeTitle = resolveVerdictWifeTitle(caseConfig.groundTruth.verdict);
      if (script.ending.length > 0) {
        return {
          ...state,
          phase: 'ending',
          currentStepIndex: 1,
          lastWifeLine: choice.wifeLine,
          husbandLine: choice.husbandLine,
          husbandMood: choice.husbandMood,
          choices: toActiveChoices(script.ending),
          canAccuse: true,
          wifeTitle,
          narrativeRoast: caseConfig.groundTruth.narrativeRoast,
        };
      }
      return {
        ...state,
        phase: 'resolved',
        currentStepIndex: 1,
        lastWifeLine: choice.wifeLine,
        husbandLine: choice.husbandLine,
        husbandMood: choice.husbandMood,
        choices: [],
        canAccuse: true,
        stars: 3,
        wifeTitle,
        narrativeRoast: caseConfig.groundTruth.narrativeRoast,
      };
    }

    const firstBeat = script.beats[0];
    return {
      ...state,
      phase: 'beat',
      beatIndex: 0,
      currentStepIndex: 1,
      lastWifeLine: choice.wifeLine,
      husbandLine: choice.husbandLine,
      husbandMood: choice.husbandMood,
      topic: firstBeat.topic,
      choices: toActiveChoices(firstBeat.choices),
      canAccuse: false,
    };
  }

  if (state.phase === 'beat') {
    const currentBeat = script.beats[state.beatIndex];
    if (!currentBeat) return state;
    const choice = currentBeat.choices.find(item => item.choiceId === choiceId);
    if (!choice) return state;

    const matched = isBeatChoiceSatisfied({
      choice,
      activeEdges,
      knowledgeGraph,
      isWrongSuspect: state.isWrongSuspect,
    });

    if (!matched || !choice.onTrue) {
      const newStrikesRemaining = Math.max(0, state.currentStrikes - 1);
      return {
        ...state,
        phase: 'failed',
        lastWifeLine: choice.wifeLine,
        husbandLine: choice.onFalse.husbandLine,
        husbandMood: choice.onFalse.husbandMood,
        choices: [],
        canAccuse: false,
        stars: 0,
        newStrikesRemaining,
        isMaxStrikesReached: newStrikesRemaining === 0,
      };
    }

    const reply = choice.onTrue;
    const verifiedBeatCount = state.verifiedBeatCount + 1;
    const hitSeq = state.hitSeq + 1;
    const nextBeatIndex = state.beatIndex + 1;

    if (nextBeatIndex < script.beats.length) {
      const nextBeat = script.beats[nextBeatIndex];
      return {
        ...state,
        phase: 'beat',
        beatIndex: nextBeatIndex,
        currentStepIndex: 1 + nextBeatIndex,
        verifiedBeatCount,
        hitSeq,
        lastWifeLine: choice.wifeLine,
        husbandLine: reply.husbandLine,
        husbandMood: reply.husbandMood,
        topic: nextBeat.topic,
        choices: toActiveChoices(nextBeat.choices),
        canAccuse: false,
      };
    }

    const wifeTitle = resolveVerdictWifeTitle(caseConfig.groundTruth.verdict);
    if (script.ending.length > 0) {
      return {
        ...state,
        phase: 'ending',
        currentStepIndex: 1 + script.beats.length,
        verifiedBeatCount,
        hitSeq,
        lastWifeLine: choice.wifeLine,
        husbandLine: reply.husbandLine,
        husbandMood: reply.husbandMood,
        topic: null,
        choices: toActiveChoices(script.ending),
        canAccuse: true,
        wifeTitle,
        narrativeRoast: caseConfig.groundTruth.narrativeRoast,
      };
    }

    return {
      ...state,
      phase: 'resolved',
      currentStepIndex: 1 + script.beats.length,
      verifiedBeatCount,
      hitSeq,
      lastWifeLine: choice.wifeLine,
      husbandLine: reply.husbandLine,
      husbandMood: reply.husbandMood,
      topic: null,
      choices: [],
      canAccuse: true,
      stars: 3,
      wifeTitle,
      narrativeRoast: caseConfig.groundTruth.narrativeRoast,
    };
  }

  if (state.phase === 'ending') {
    const endingChoice = script.ending.find(item => item.choiceId === choiceId);
    if (!endingChoice) return state;
    const wifeTitle = state.wifeTitle ?? resolveVerdictWifeTitle(caseConfig.groundTruth.verdict);
    return {
      ...state,
      phase: 'resolved',
      selectedEndingChoiceId: endingChoice.choiceId,
      selectedEndingOutcome: endingChoice.outcome,
      hitSeq: state.hitSeq + 1,
      lastWifeLine: endingChoice.wifeLine,
      husbandLine: endingChoice.husbandLine,
      husbandMood: endingChoice.husbandMood,
      choices: [],
      canAccuse: true,
      stars: 3,
      wifeTitle,
      narrativeRoast: caseConfig.groundTruth.narrativeRoast,
    };
  }

  return state;
}
