import type { Level0Status, TutorialProgressState, TutorialStepId } from './types';

export const TUTORIAL_STORAGE_KEY = 'detective:v1:level0_status';

const VALID_LEVEL0_STATUSES: ReadonlySet<string> = new Set<Level0Status>([
  'not_started',
  'skipped',
  'completed',
]);

export function createInitialTutorialState(): TutorialProgressState {
  return {
    activeStep: 'goal',
    dismissedCurrentPopup: false,
    guideSkipped: false,
    seenSteps: ['goal'],
    completed: false,
  };
}

export function dismissCurrentPopup(state: TutorialProgressState): TutorialProgressState {
  if (state.dismissedCurrentPopup) {
    return state;
  }
  return {
    ...state,
    dismissedCurrentPopup: true,
  };
}

export function skipTutorialGuide(state: TutorialProgressState): TutorialProgressState {
  return {
    ...state,
    guideSkipped: true,
    dismissedCurrentPopup: true,
  };
}

export function triggerTutorialStep(
  state: TutorialProgressState,
  step: TutorialStepId,
): TutorialProgressState {
  if (step === 'complete') {
    const nextSeen: TutorialStepId[] = state.seenSteps.includes('complete')
      ? state.seenSteps
      : [...state.seenSteps, 'complete'];
    return {
      ...state,
      activeStep: 'complete',
      dismissedCurrentPopup: false,
      seenSteps: nextSeen,
      completed: true,
    };
  }

  if (state.guideSkipped || state.seenSteps.includes(step)) {
    return state;
  }

  return {
    ...state,
    activeStep: step,
    dismissedCurrentPopup: false,
    seenSteps: [...state.seenSteps, step],
  };
}

export function readLevel0Status(): Level0Status {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'not_started';
    }
    const raw = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (raw && VALID_LEVEL0_STATUSES.has(raw)) {
      return raw as Level0Status;
    }
    return 'not_started';
  } catch {
    return 'not_started';
  }
}

export function writeLevel0Status(status: Level0Status): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, status);
  } catch {
    // Ignore storage quota or private-browsing errors so gameplay continues cleanly.
  }
}
