export type TutorialStepId =
  | 'goal'
  | 'open_messages'
  | 'pin_message'
  | 'open_phone'
  | 'open_notebook'
  | 'connect_alias'
  | 'independent_alibi'
  | 'confrontation_rules'
  | 'complete';

export type Level0Status = 'not_started' | 'skipped' | 'completed';

export interface TutorialProgressState {
  activeStep: TutorialStepId | null;
  dismissedCurrentPopup: boolean;
  guideSkipped: boolean;
  seenSteps: TutorialStepId[];
  completed: boolean;
}

export interface TutorialPopupGuideProps {
  step: TutorialStepId | null;
  visible: boolean;
  onDismiss: () => void;
  onSkipGuide: () => void;
  onEnterLevel1?: () => void;
  onReplayLevel0?: () => void;
}
