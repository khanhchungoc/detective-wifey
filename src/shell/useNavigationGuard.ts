import { useCallback, useEffect, useRef, useState } from 'react';

export interface TargetWindow {
  history: {
    state: unknown;
    pushState: (data: unknown, unused: string, url?: string | URL | null) => void;
    go: (delta?: number) => void;
  };
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  removeEventListener: (type: string, listener: (event: Event) => void) => void;
}

export interface NavigationGuardConfig {
  /** Whether the navigation guard is enabled (default: true). */
  enabled?: boolean;
  /** Callback fired when the exit confirmation popup should be opened. */
  onOpenConfirm?: () => void;
  /** Callback fired when the exit confirmation popup should be closed. */
  onCloseConfirm?: () => void;
  /** Callback fired before triggering back navigation on leave. */
  onLeave?: () => void;
  /** Target window or mock window object (defaults to global window). */
  targetWindow?: TargetWindow;
}

export interface NavigationGuardEngine {
  isArmed: () => boolean;
  isLeaving: () => boolean;
  stay: () => void;
  leave: () => void;
  dispose: () => void;
}

function hasGuardState(state: unknown): boolean {
  return typeof state === 'object' && state !== null && (state as Record<string, unknown>).guard === 'exit';
}

export function createNavigationGuard({
  enabled = true,
  onOpenConfirm,
  onCloseConfirm,
  onLeave,
  targetWindow = typeof window !== 'undefined' ? (window as unknown as TargetWindow) : undefined,
}: NavigationGuardConfig = {}): NavigationGuardEngine {
  let isLeaving = false;
  let popStateListener: ((event: unknown) => void) | null = null;
  let beforeUnloadListener: ((event: { preventDefault: () => void; returnValue: unknown }) => string | void) | null = null;

  const win = targetWindow;
  const canOperate = Boolean(
    enabled &&
    win &&
    win.history &&
    typeof win.history.pushState === 'function' &&
    typeof win.addEventListener === 'function' &&
    typeof win.removeEventListener === 'function'
  );

  if (canOperate && win) {
    // 1. Arm history trap on start / mount if not already trapped
    if (!hasGuardState(win.history.state)) {
      win.history.pushState({ guard: 'exit' }, '');
    }

    // 2. Intercept popstate: immediately re-push history state and display modal
    popStateListener = () => {
      if (isLeaving) return;
      win.history.pushState({ guard: 'exit' }, '');
      onOpenConfirm?.();
    };

    // 5. Add beforeunload listener for native tab close/reload protection
    beforeUnloadListener = (event: { preventDefault: () => void; returnValue: unknown }) => {
      if (isLeaving) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    win.addEventListener('popstate', popStateListener);
    win.addEventListener('beforeunload', beforeUnloadListener);
  }

  const cleanupListeners = () => {
    if (win && typeof win.removeEventListener === 'function') {
      if (popStateListener) {
        win.removeEventListener('popstate', popStateListener);
        popStateListener = null;
      }
      if (beforeUnloadListener) {
        win.removeEventListener('beforeunload', beforeUnloadListener);
        beforeUnloadListener = null;
      }
    }
  };

  return {
    isArmed: () => Boolean(hasGuardState(win?.history?.state)),
    isLeaving: () => isLeaving,
    // 3. User chooses to stay
    stay: () => {
      onCloseConfirm?.();
    },
    // 4. User chooses to leave: remove listeners and trigger back navigation (go(-2))
    leave: () => {
      isLeaving = true;
      cleanupListeners();
      onCloseConfirm?.();
      onLeave?.();
      if (win?.history && typeof win.history.go === 'function') {
        win.history.go(-2);
      }
    },
    dispose: () => {
      cleanupListeners();
    },
  };
}

export interface UseNavigationGuardOptions {
  /** Whether the navigation guard is enabled (default: true). */
  enabled?: boolean;
  /** Optional callback fired when leaving before back navigation. */
  onLeave?: () => void;
}

export function useNavigationGuard({
  enabled = true,
  onLeave,
}: UseNavigationGuardOptions = {}) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const guardRef = useRef<NavigationGuardEngine | null>(null);

  useEffect(() => {
    const engine = createNavigationGuard({
      enabled,
      onOpenConfirm: () => setShowExitConfirm(true),
      onCloseConfirm: () => setShowExitConfirm(false),
      onLeave,
    });
    guardRef.current = engine;

    return () => {
      engine.dispose();
      guardRef.current = null;
    };
  }, [enabled, onLeave]);

  const handleStay = useCallback(() => {
    guardRef.current?.stay();
    setShowExitConfirm(false);
  }, []);

  const handleLeave = useCallback(() => {
    guardRef.current?.leave();
    setShowExitConfirm(false);
  }, []);

  return {
    showExitConfirm,
    setShowExitConfirm,
    handleStay,
    handleLeave,
  };
}
