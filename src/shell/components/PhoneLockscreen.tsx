import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from 'motion/react';
import {
  IoBackspaceOutline,
  IoBagHandleOutline,
  IoCameraOutline,
  IoCardOutline,
  IoChatbubbleEllipsesOutline,
  IoChevronBack,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoMoon,
  IoMoonOutline,
  IoNotificationsOffOutline,
  IoNotificationsOutline,
  IoScanOutline,
} from 'react-icons/io5';
import type {
  LockscreenNotificationItem,
  PhoneLockscreenConfig,
} from '../../shared/contracts/game-flow';

export interface PhoneLockscreenProps {
  config: PhoneLockscreenConfig;
  currentStrikes: number;
  maxStrikes: number;
  onUnlock: (targetAppId?: string) => void;
  onBack?: () => void;
  onPasscodeFailStrike: () => void;
}

export type LockscreenMode = 'lockscreen' | 'scanning' | 'passcode';

export interface LockscreenState {
  mode: LockscreenMode;
  pendingAppId?: string;
  enteredPin: string;
  errorMessage: string | null;
  isShaking: boolean;
}

export type LockscreenAction =
  | { type: 'REQUEST_UNLOCK'; hasPasscode: boolean; targetAppId?: string }
  | { type: 'DIGIT_PRESS'; digit: string; expectedPasscode: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'CANCEL_PASSCODE' }
  | { type: 'CLEAR_SHAKE' };

export const PIN_ERROR_MESSAGE = 'Mã PIN không chính xác. Nghi ngờ tăng lên.';
export const FACEID_SCAN_DELAY_MS = 350;
export const SHAKE_RESET_DELAY_MS = 420;
export const SWIPE_UP_THRESHOLD_PX = -44;
export const SWIPE_UP_COMMIT_PX = -96;

const SNAP_SPRING = { type: 'spring' as const, stiffness: 400, damping: 40 };
const EASE_OUT_IOS = [0.22, 1, 0.36, 1] as const;
const EASE_LIFT_OFF = [0.4, 0, 1, 1] as const;

const KEYPAD_ROWS: ReadonlyArray<ReadonlyArray<{ digit: string; letters: string }>> = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
];

export function createInitialLockscreenState(): LockscreenState {
  return {
    mode: 'lockscreen',
    pendingAppId: undefined,
    enteredPin: '',
    errorMessage: null,
    isShaking: false,
  };
}

export function isLockscreenSwipeUp(dx: number, dy: number): boolean {
  return dy <= SWIPE_UP_THRESHOLD_PX && Math.abs(dy) >= Math.abs(dx);
}

export type LockscreenSwipePhase = 'move' | 'end' | 'cancel';

/**
 * Decides whether a drag unlocks. Never unlocks while the finger is still down (`move`);
 * only evaluates on finger lift (`end`) or browser cancel (`cancel`).
 */
export function shouldUnlockOnSwipe(phase: LockscreenSwipePhase, dx: number, dy: number): boolean {
  if (phase === 'move') return false;
  return isLockscreenSwipeUp(dx, dy);
}

/** Vertical offset (px, negative = up) the lockscreen overlay panel follows 1:1 while dragging upward. */
export function lockscreenDragOffset(dy: number): number {
  return Math.min(0, dy);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function lockscreenReducer(
  state: LockscreenState,
  action: LockscreenAction,
): LockscreenState {
  switch (action.type) {
    case 'REQUEST_UNLOCK': {
      if (state.mode === 'scanning') return state;
      return {
        mode: action.hasPasscode ? 'passcode' : 'scanning',
        pendingAppId: action.targetAppId,
        enteredPin: '',
        errorMessage: null,
        isShaking: false,
      };
    }
    case 'DIGIT_PRESS': {
      if (state.mode !== 'passcode') return state;
      const nextPin = (state.enteredPin + action.digit).slice(0, 4);
      if (nextPin.length < 4) {
        return {
          ...state,
          enteredPin: nextPin,
          errorMessage: null,
          isShaking: false,
        };
      }
      if (nextPin === action.expectedPasscode) {
        return {
          ...state,
          enteredPin: nextPin,
          errorMessage: null,
          isShaking: false,
        };
      }
      return {
        ...state,
        enteredPin: '',
        errorMessage: PIN_ERROR_MESSAGE,
        isShaking: true,
      };
    }
    case 'DELETE_DIGIT': {
      if (state.mode !== 'passcode' || state.enteredPin.length === 0) return state;
      return {
        ...state,
        enteredPin: state.enteredPin.slice(0, -1),
      };
    }
    case 'CANCEL_PASSCODE': {
      return createInitialLockscreenState();
    }
    case 'CLEAR_SHAKE': {
      if (!state.isShaking) return state;
      return {
        ...state,
        isShaking: false,
      };
    }
    default:
      return state;
  }
}

export function getNotificationIconKind(
  appId: string,
): 'chat' | 'card' | 'bag' | 'default' {
  switch (appId) {
    case 'banking':
      return 'card';
    case 'ecommerce':
      return 'bag';
    case 'internet-messaging':
    case 'messages':
    case 'comms':
    case 'phone':
    case 'team-collaboration':
      return 'chat';
    default:
      return 'default';
  }
}

function parseBatteryRatio(batteryPercent: string): number {
  const numeric = Number.parseInt(batteryPercent.replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(numeric)) return 0.5;
  return Math.max(0, Math.min(100, numeric)) / 100;
}

function getNotificationIconBgClass(appId: string): string {
  const kind = getNotificationIconKind(appId);
  switch (kind) {
    case 'card':
      return 'bg-rose-600/90 border-rose-300/20';
    case 'bag':
      return 'bg-orange-500/90 border-orange-200/20';
    case 'chat':
      return 'bg-sky-500/90 border-sky-200/20';
    default:
      return 'bg-indigo-500/85 border-indigo-200/20';
  }
}

function renderNotificationIcon(appId: string): React.ReactNode {
  const kind = getNotificationIconKind(appId);
  const iconClass = 'w-5 h-5 text-white shrink-0';
  switch (kind) {
    case 'card':
      return <IoCardOutline aria-hidden="true" className={iconClass} />;
    case 'bag':
      return <IoBagHandleOutline aria-hidden="true" className={iconClass} />;
    case 'chat':
      return <IoChatbubbleEllipsesOutline aria-hidden="true" className={iconClass} />;
    default:
      return <IoNotificationsOutline aria-hidden="true" className={iconClass} />;
  }
}

interface PasscodePadViewProps {
  passcodeHint?: string;
  enteredPin: string;
  errorMessage: string | null;
  isShaking: boolean;
  currentStrikes: number;
  maxStrikes: number;
  onDigitPress: (digit: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const PasscodePadView: React.FC<PasscodePadViewProps> = ({
  passcodeHint,
  enteredPin,
  errorMessage,
  isShaking,
  currentStrikes,
  maxStrikes,
  onDigitPress,
  onDelete,
  onCancel,
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const remainingStrikes = Math.max(0, maxStrikes - currentStrikes);

  return (
    <motion.div
      data-lockscreen-passcode-pad="true"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={shouldReduceMotion ? { duration: 0.14 } : SNAP_SPRING}
      className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 pt-16 pb-6 bg-slate-950/82"
    >
      <div className="flex flex-col items-center text-center w-full max-w-xs">
        <IoLockClosedOutline aria-hidden="true" className="w-5 h-5 text-white/85 mb-2" />
        <h2 className="text-ios-headline font-medium text-white">
          Nhập mật khẩu
        </h2>
        {passcodeHint ? (
          <p className="mt-1 text-ios-footnote text-white/70 leading-snug">
            {passcodeHint}
          </p>
        ) : null}

        <p
          data-passcode-strikes="true"
          className="mt-2 text-ios-caption-1 text-white/60 tabular-nums"
        >
          Nghi ngờ: {remainingStrikes}/{maxStrikes}
        </p>

        <motion.div
          aria-label={`Đã nhập ${enteredPin.length} trên 4 chữ số`}
          data-pin-shaking={isShaking ? 'true' : 'false'}
          animate={
            isShaking && !shouldReduceMotion
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="mt-6 flex items-center justify-center gap-4"
        >
          {[0, 1, 2, 3].map(index => {
            const filled = index < enteredPin.length;
            return (
              <motion.span
                key={index}
                data-pin-dot={filled ? 'filled' : 'empty'}
                animate={
                  filled && !shouldReduceMotion
                    ? { scale: [1, 1.16, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.16, ease: EASE_OUT_IOS }}
                className={`w-3 h-3 rounded-full border transition-colors ${
                  filled
                    ? 'bg-white border-white'
                    : 'bg-transparent border-white/50'
                }`}
              />
            );
          })}
        </motion.div>

        <div className="mt-3 min-h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.p
                key={errorMessage}
                role="alert"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: EASE_OUT_IOS }}
                className="text-ios-footnote font-medium text-rose-300 text-center"
              >
                {errorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        {KEYPAD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-5">
            {row.map(({ digit, letters }) => (
              <motion.button
                key={digit}
                type="button"
                data-pin-digit={digit}
                onClick={() => onDigitPress(digit)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                transition={SNAP_SPRING}
                className="touch-target-min w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 border border-white/10 flex flex-col items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span className="text-ios-lockpad-digit leading-none tabular-nums">
                  {digit}
                </span>
                {letters ? (
                  <span className="text-ios-lockpad-subtext text-white/65 mt-0.5">
                    {letters}
                  </span>
                ) : null}
              </motion.button>
            ))}
          </div>
        ))}

        <div className="grid grid-cols-3 gap-5 items-center">
          <motion.button
            type="button"
            data-pin-cancel="true"
            onClick={onCancel}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            transition={SNAP_SPRING}
            className="touch-target-min w-16 h-16 rounded-full flex items-center justify-center text-ios-callout font-normal text-white/85 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Hủy
          </motion.button>

          <motion.button
            type="button"
            data-pin-digit="0"
            onClick={() => onDigitPress('0')}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
            transition={SNAP_SPRING}
            className="touch-target-min w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 border border-white/10 flex flex-col items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="text-ios-lockpad-digit leading-none tabular-nums">0</span>
          </motion.button>

          <motion.button
            type="button"
            data-pin-delete="true"
            aria-label="Xóa số"
            disabled={enteredPin.length === 0}
            onClick={onDelete}
            whileTap={
              shouldReduceMotion || enteredPin.length === 0
                ? undefined
                : { scale: 0.92 }
            }
            transition={SNAP_SPRING}
            className="touch-target-min w-16 h-16 rounded-full flex items-center justify-center text-white/85 hover:text-white disabled:opacity-30 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <IoBackspaceOutline aria-hidden="true" className="w-6 h-6" />
          </motion.button>
        </div>

        <div
          aria-hidden="true"
          className="mt-2 w-32 h-1 rounded-full bg-white/60"
        />
      </div>
    </motion.div>
  );
};

export const PhoneLockscreen: React.FC<PhoneLockscreenProps> = ({
  config,
  currentStrikes,
  maxStrikes,
  onUnlock,
  onBack,
  onPasscodeFailStrike,
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [state, dispatch] = useReducer(
    lockscreenReducer,
    undefined,
    createInitialLockscreenState,
  );
  const swipeStartRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeLastRef = useRef<{ dx: number; dy: number } | null>(null);
  const dragY = useMotionValue(0);
  const hasPasscode = Boolean(config.passcode);
  const isScanning = state.mode === 'scanning';
  const batteryRatio = parseBatteryRatio(config.batteryPercent);
  const gaugeRadius = 24;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const batteryDashOffset = gaugeCircumference * (1 - batteryRatio);

  useEffect(() => {
    if (state.mode !== 'scanning') return;
    const delay = shouldReduceMotion || prefersReducedMotion() ? 0 : FACEID_SCAN_DELAY_MS;
    if (delay === 0) {
      onUnlock(state.pendingAppId);
      return;
    }
    const timer = setTimeout(() => {
      onUnlock(state.pendingAppId);
    }, delay);
    return () => clearTimeout(timer);
  }, [state.mode, state.pendingAppId, onUnlock, shouldReduceMotion]);

  useEffect(() => {
    if (!state.isShaking) return;
    const delay = shouldReduceMotion || prefersReducedMotion() ? 0 : SHAKE_RESET_DELAY_MS;
    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_SHAKE' });
    }, delay);
    return () => clearTimeout(timer);
  }, [state.isShaking, shouldReduceMotion]);

  const handleRequestUnlock = useCallback(
    (targetAppId?: string) => {
      dispatch({ type: 'REQUEST_UNLOCK', hasPasscode, targetAppId });
    },
    [hasPasscode],
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!config.passcode || state.mode !== 'passcode') return;
      const nextPin = (state.enteredPin + digit).slice(0, 4);
      dispatch({
        type: 'DIGIT_PRESS',
        digit,
        expectedPasscode: config.passcode,
      });

      if (nextPin.length === 4) {
        if (nextPin === config.passcode) {
          onUnlock(state.pendingAppId);
        } else {
          onPasscodeFailStrike();
        }
      }
    },
    [
      config.passcode,
      state.mode,
      state.enteredPin,
      state.pendingAppId,
      onUnlock,
      onPasscodeFailStrike,
    ],
  );

  const handleDeleteDigit = useCallback(() => {
    dispatch({ type: 'DELETE_DIGIT' });
  }, []);

  const handleCancelPasscode = useCallback(() => {
    dispatch({ type: 'CANCEL_PASSCODE' });
  }, []);

  const finishSwipe = (phase: 'end' | 'cancel') => {
    const start = swipeStartRef.current;
    const last = swipeLastRef.current;
    swipeStartRef.current = null;
    swipeLastRef.current = null;
    if (!start || state.mode !== 'lockscreen') return;
    if (last && shouldUnlockOnSwipe(phase, last.dx, last.dy)) {
      if (hasPasscode) {
        if (dragY.get() !== 0) animate(dragY, 0, SNAP_SPRING);
        handleRequestUnlock();
        return;
      }
      if (shouldReduceMotion) {
        handleRequestUnlock();
        return;
      }
      const exitY = -(typeof window !== 'undefined' ? window.innerHeight : 900);
      const ctrl = animate(dragY, exitY, { duration: 0.24, ease: EASE_OUT_IOS });
      void ctrl.then(() => handleRequestUnlock());
      return;
    }
    if (dragY.get() !== 0) animate(dragY, 0, SNAP_SPRING);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (state.mode !== 'lockscreen' || event.button !== 0 || !event.isPrimary) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    swipeLastRef.current = null;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    if (!start || start.id !== event.pointerId || state.mode !== 'lockscreen') return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    swipeLastRef.current = { dx, dy };
    if (!shouldReduceMotion) dragY.set(lockscreenDragOffset(dy));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    if (!start || start.id !== event.pointerId) return;
    swipeLastRef.current = { dx: event.clientX - start.x, dy: event.clientY - start.y };
    finishSwipe('end');
  };

  const handlePointerCancel = () => finishSwipe('cancel');

  const visibleNotifications: LockscreenNotificationItem[] = config.notifications.slice(0, 2);

  return (
    <motion.section
      aria-label="Màn hình khóa điện thoại"
      data-phone-lockscreen="true"
      data-lockscreen-mode={state.mode}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      // Without this, mobile browsers claim the vertical drag as a scroll and cancel the pointer.
      style={{ touchAction: 'none', y: dragY, willChange: 'transform', backfaceVisibility: 'hidden' }}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.14 : 0.26, ease: EASE_OUT_IOS }}
      className="absolute inset-0 z-30 flex flex-col justify-between overflow-hidden select-none font-sans text-white bg-gradient-to-b from-zinc-900 via-zinc-950 to-black"
    >
      {config.wallpaperUrl ? (
        <img
          src={config.wallpaperUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : null}

      {/* Natural top and bottom legibility scrims leaving wallpaper subject clear */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/55 via-black/20 to-transparent pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none"
      />

      <AnimatePresence mode="wait">
        {state.mode === 'passcode' ? (
          <PasscodePadView
            key="passcode"
            passcodeHint={config.passcodeHint}
            enteredPin={state.enteredPin}
            errorMessage={state.errorMessage}
            isShaking={state.isShaking}
            currentStrikes={currentStrikes}
            maxStrikes={maxStrikes}
            onDigitPress={handleDigitPress}
            onDelete={handleDeleteDigit}
            onCancel={handleCancelPasscode}
          />
        ) : (
          <div key="lockscreen" className="relative z-10 flex flex-1 flex-col">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={
              isScanning
                ? {
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : -24,
                    transition: shouldReduceMotion
                      ? { duration: 0.12 }
                      : { delay: 0.17, duration: 0.18, ease: EASE_LIFT_OFF },
                  }
                : {
                    opacity: 1,
                    y: 0,
                    transition: shouldReduceMotion ? { duration: 0.14 } : SNAP_SPRING,
                  }
            }
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            className="relative z-10 flex flex-1 flex-col justify-between px-5 pt-16 pb-6"
          >
            {/* Top: Lock glyph, date + weather line, bold iOS clock, and 3 quiet mini-widgets */}
            <div className="flex flex-col items-center text-center">
              <div className="h-5 flex items-center justify-center mb-1.5">
                <AnimatePresence mode="wait" initial={false}>
                  {isScanning ? (
                    <motion.span
                      key="unlocked"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, ease: EASE_OUT_IOS }}
                      className="inline-flex items-center justify-center"
                    >
                      <IoLockOpenOutline
                        aria-hidden="true"
                        className="w-4 h-4 text-emerald-300"
                      />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="locked"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14, ease: EASE_OUT_IOS }}
                      className="inline-flex items-center justify-center"
                    >
                      <IoLockClosedOutline
                        aria-hidden="true"
                        className="w-4 h-4 text-white/85"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="inline-flex items-center justify-center gap-2 text-ios-headline font-medium text-white/90">
                <span>{config.narrativeDate}</span>
                <span aria-hidden="true" className="text-white/50">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <IoMoon aria-hidden="true" className="w-4 h-4 text-white/90 shrink-0" />
                  <span>24°</span>
                </span>
              </div>

              <time
                data-lockscreen-clock="true"
                className="mt-1 text-7xl sm:text-8xl font-bold tracking-tight leading-none text-white/95 tabular-nums drop-shadow-sm"
              >
                {config.narrativeTime}
              </time>

              {/* Proportionate iOS Lockscreen Widget Row */}
              <div
                data-lockscreen-widgets="true"
                aria-label="Tiện ích màn hình khóa"
                className="mt-4 flex items-center justify-center gap-4"
              >
                {/* Weather summary widget */}
                <div className="min-h-14 px-3.5 py-2 rounded-2xl bg-slate-950/50 border border-white/15 flex flex-col items-start justify-center text-left">
                  <span className="inline-flex items-center gap-1.5 text-ios-title-3 font-semibold text-white/95 tabular-nums leading-tight">
                    <IoMoonOutline aria-hidden="true" className="w-4 h-4 text-white/85 shrink-0" />
                    <span>24°</span>
                  </span>
                  <span className="text-ios-caption-1 font-medium text-white/85 leading-tight">
                    Quang đãng
                  </span>
                  <span className="text-ios-caption-2 text-white/70 tabular-nums leading-tight">
                    ↑ 27° ↓ 21°
                  </span>
                </div>

                {/* Circular battery gauge ring */}
                <div
                  aria-label={`Pin ${config.batteryPercent}`}
                  className="relative w-14 h-14 rounded-full bg-slate-950/50 border border-white/15 flex items-center justify-center shrink-0"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 56 56"
                    className="w-14 h-14 -rotate-90"
                  >
                    <circle
                      cx="28"
                      cy="28"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.22)"
                      strokeWidth={3.5}
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.92)"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={batteryDashOffset}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-ios-footnote font-semibold text-white/95 tabular-nums">
                    {config.batteryPercent}
                  </span>
                </div>

                {/* Circular quiet night gauge ring (icon-only) */}
                <div
                  aria-label="Không làm phiền"
                  className="relative w-14 h-14 rounded-full bg-slate-950/50 border border-white/15 flex items-center justify-center shrink-0"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 56 56"
                    className="w-14 h-14 -rotate-90"
                  >
                    <circle
                      cx="28"
                      cy="28"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.22)"
                      strokeWidth={3.5}
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.78)"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeCircumference * 0.25}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <IoNotificationsOffOutline
                      aria-hidden="true"
                      className="w-5 h-5 text-white/90"
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Lower-middle: Authentic dark-frosted iOS notification stack */}
            <div className="mt-auto flex flex-col gap-5">
              {visibleNotifications.length > 0 ? (
                <div
                  aria-label="Thông báo màn hình khóa"
                  className="flex flex-col"
                >
                  <div className="flex flex-col gap-2.5">
                    {visibleNotifications.map((notif, index) => (
                      <motion.button
                        key={notif.id}
                        type="button"
                        data-lockscreen-notification={notif.appId}
                        disabled={isScanning}
                        onClick={() => handleRequestUnlock(notif.appId)}
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0.14 : 0.26,
                          delay: shouldReduceMotion ? 0 : 0.08 + index * 0.06,
                          ease: EASE_OUT_IOS,
                        }}
                        whileTap={shouldReduceMotion || isScanning ? undefined : { scale: 0.98 }}
                        className="touch-target-min w-full bg-slate-950/55 border border-white/15 rounded-2xl px-4 py-3.5 text-left flex items-center gap-3.5 hover:bg-slate-900/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-70"
                      >
                        {notif.iconAsset ? (
                          <span className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={notif.iconAsset}
                              alt={notif.appName}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        ) : (
                          <span
                            className={`w-11 h-11 rounded-xl overflow-hidden border flex items-center justify-center shrink-0 ${
                              notif.themeGradient
                                ? `bg-gradient-to-br ${notif.themeGradient} border-white/20`
                                : getNotificationIconBgClass(notif.appId)
                            }`}
                          >
                            {renderNotificationIcon(notif.appId)}
                          </span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-ios-subheadline font-semibold text-white truncate">
                              {notif.appName}
                            </span>
                            <span className="text-ios-caption-1 text-white/60 shrink-0 tabular-nums">
                              {notif.timeLabel}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-ios-footnote text-white/85 truncate leading-snug">
                            {notif.maskedBody}
                          </span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {/* Subtle iOS stacked card peek under last notification */}
                  <div
                    aria-hidden="true"
                    data-lockscreen-notif-peek="true"
                    className="h-2 mx-4 rounded-b-2xl bg-slate-950/35 border-x border-b border-white/10"
                  />
                </div>
              ) : null}

              {/* Bottom: Back & Camera quick actions + quiet unlock trigger */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-full flex items-center justify-between px-3">
                  <motion.button
                    type="button"
                    aria-label="Quay lại"
                    data-lockscreen-back="true"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onBack}
                    disabled={!onBack}
                    whileTap={shouldReduceMotion || !onBack ? undefined : { scale: 0.92 }}
                    transition={SNAP_SPRING}
                    className="touch-target-min w-12 h-12 rounded-full bg-slate-950/50 border border-white/15 text-white hover:bg-slate-900/70 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40"
                  >
                    <IoChevronBack aria-hidden="true" className="w-5 h-5" />
                  </motion.button>

                  <AnimatePresence mode="wait" initial={false}>
                    {isScanning ? (
                      <motion.div
                        key="scanning"
                        role="status"
                        aria-live="polite"
                        data-lockscreen-scanning="true"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: EASE_OUT_IOS }}
                        className="touch-target-min inline-flex items-center justify-center gap-1.5 px-3 text-ios-footnote font-medium text-white/95"
                      >
                        <IoScanOutline
                          aria-hidden="true"
                          className="w-4 h-4 text-emerald-300 shrink-0"
                        />
                        <span>Đang quét FaceID...</span>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="unlock-hint"
                        type="button"
                        data-lockscreen-unlock-btn="true"
                        onClick={() => handleRequestUnlock()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                        transition={{ duration: 0.16, ease: EASE_OUT_IOS }}
                        className="touch-target-min inline-flex items-center justify-center rounded-xl px-3 text-ios-footnote font-medium text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <span>Vuốt lên để mở</span>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="button"
                    aria-label="Camera"
                    data-lockscreen-camera="true"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                    transition={SNAP_SPRING}
                    className="touch-target-min w-12 h-12 rounded-full bg-slate-950/50 border border-white/15 text-white hover:bg-slate-900/70 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <IoCameraOutline aria-hidden="true" className="w-5 h-5" />
                  </motion.button>
                </div>

              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default PhoneLockscreen;
