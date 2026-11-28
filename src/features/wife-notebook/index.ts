export { WifeNotebookModal } from './WifeNotebookModal';
export type { WifeNotebookModalProps } from './WifeNotebookModal';
export { CorkboardCanvas } from './components/CorkboardCanvas';
export { MiniMapRadar } from './components/MiniMapRadar';
export { ConfrontationModal } from './components/ConfrontationModal';
export type { ConfrontationModalProps } from './components/ConfrontationModal';
export { ConfrontationConfirmModal } from './components/ConfrontationConfirmModal';
export type { ConfrontationConfirmModalProps } from './components/ConfrontationConfirmModal';
export { HusbandCharacterImage, HUSBAND_COMIC_ASSETS } from './components/HusbandCharacterImage';
export type { HusbandMood, HusbandCharacterImageProps } from './components/HusbandCharacterImage';
export { useCorkboardGestures } from './useCorkboardGestures';
export {
  createEdgeBetweenNodes,
  evaluateUnmaskedSuspects,
  evaluateContradictions,
  autoArrangeNodes,
  placeNewNodesBelow,
  CORKBOARD_COLUMNS_X,
  CORKBOARD_ROW_HEIGHT,
  CORKBOARD_VERTICAL_GAP,
  clampZoom,
  calculateClueCardsCenter,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MIN_ZOOM,
  MAX_ZOOM,
} from './graphEngine';
export {
  evaluateConfrontation,
  calculateConfrontationPreflight,
  getKeyConnectionProgress,
  getVerifiedKeyEdgeIds,
  getSuspectsOnBoard,
  hasConfrontationScript,
  isBeatChoiceSatisfied,
  createScriptedConfrontation,
  advanceScriptedConfrontation,
} from './confrontationEngine';
export type {
  ConfrontationEvaluationParams,
  ConfrontationEvaluationResult,
  ConfrontationPreflightInfo,
  ClueInfo,
  VerifiedStringItem,
  ConvictionChance,
  ConvictionChanceLevel,
  SuspectOnBoard,
  ConfrontationStepPhase,
  ActiveConfrontationChoice,
  ScriptedConfrontationParams,
  ScriptedConfrontationState,
} from './confrontationEngine';
export { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
export type {
  PlacedNode,
  CorkboardViewport,
  PairingState,
  WifeNotebookState,
} from './types';
