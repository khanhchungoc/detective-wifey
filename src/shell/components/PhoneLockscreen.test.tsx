import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { PhoneLockscreenConfig } from '../../shared/contracts/game-flow';
import {
  createInitialLockscreenState,
  isLockscreenSwipeUp,
  lockscreenDragOffset,
  shouldUnlockOnSwipe,
  lockscreenReducer,
  PasscodePadView,
  PhoneLockscreen,
  PIN_ERROR_MESSAGE,
} from './PhoneLockscreen';

const level1Config: PhoneLockscreenConfig = {
  narrativeStartIso: '2026-10-15T23:45:00',
  narrativeDate: 'Thứ Sáu, 14 tháng 11',
  narrativeTime: '23:45',
  batteryPercent: '42%',
  wallpaperUrl: '/assets/wallpaper.webp',
  notifications: [
    {
      id: 'notif-1',
      appId: 'internet-messaging',
      appName: 'Zola',
      iconAsset: '/assets/icons/zola.png',
      themeGradient: 'from-blue-500 to-sky-600',
      maskedBody: 'Bạn có 3 tin nhắn mới',
      timeLabel: '23:40',
    },
    {
      id: 'notif-2',
      appId: 'banking',
      appName: 'Techcornbank',
      themeGradient: 'from-rose-600 to-red-700',
      maskedBody: 'Thông báo biến động số dư',
      timeLabel: '23:12',
    },
  ],
};

const level2Config: PhoneLockscreenConfig = {
  ...level1Config,
  passcode: '1402',
  passcodeHint: 'Gợi ý: Ngày kỷ niệm quen nhau (ddmm)',
};

describe('PhoneLockscreen (US-038)', () => {
  it('renders bold iOS lockscreen clock, date + weather, proportionate widgets, real app icons on notifications, and quick actions without silent label', () => {
    const html = renderToStaticMarkup(
      <PhoneLockscreen
        config={level1Config}
        currentStrikes={0}
        maxStrikes={3}
        onUnlock={vi.fn()}
        onPasscodeFailStrike={vi.fn()}
      />,
    );

    expect(html).toContain('Thứ Sáu, 14 tháng 11');
    expect(html).toContain('text-ios-headline');
    expect(html).toContain('24°');
    expect(html).toContain('23:45');
    expect(html).toContain('font-bold');
    expect(html).toContain('sm:text-8xl');
    expect(html).not.toContain('font-light');
    expect(html).toContain('data-lockscreen-widgets="true"');
    expect(html).toContain('Quang đãng');
    expect(html).toContain('↑ 27° ↓ 21°');
    expect(html).toContain('42%');
    expect(html).toContain('w-14 h-14');
    expect(html).not.toContain('Im lặng');
    expect(html).toContain('Zola');
    expect(html).toContain('<img src="/assets/icons/zola.png" alt="Zola" class="h-full w-full object-cover"/>');
    expect(html).toContain('w-11 h-11');
    expect(html).toContain('px-4 py-3.5');
    expect(html).toContain('Bạn có 3 tin nhắn mới');
    expect(html).toContain('Techcornbank');
    expect(html).toContain('from-rose-600 to-red-700');
    expect(html).toContain('Thông báo biến động số dư');
    expect(html).toContain('bg-slate-950/55 backdrop-blur-xl');
    expect(html).toContain('data-lockscreen-wallpaper="true"');
    expect(html).toContain('data-lockscreen-ui="true"');
    expect(html.indexOf('data-lockscreen-wallpaper="true"')).toBeLessThan(html.indexOf('data-lockscreen-ui="true"'));
    expect(html).toContain('data-lockscreen-notif-peek="true"');
    expect(html).toContain('data-lockscreen-back="true"');
    expect(html).toContain('data-lockscreen-camera="true"');
    expect(html).not.toContain('data-lockscreen-home-bar');
    expect(html).toContain('touch-action:none');
    expect(html).toContain('Vuốt lên để mở');
    expect(html).not.toContain('Lén quét FaceID / Vuốt lên để mở khóa');
    expect(html).toContain('tabular-nums');
    expect(html).not.toContain('font-mono');
    expect(html).not.toContain('animate-pulse');
    expect(html).not.toContain('Viettel');
    expect(html).not.toContain('VNPT');
    expect(html).not.toContain('5G');
  });

  it('triggers FaceID scan on Level 0-1 unlock and notification tap preserves targetAppId without strikes', () => {
    const onUnlock = vi.fn();
    const onPasscodeFailStrike = vi.fn();

    // Direct unlock (no notification tapped)
    const directState = lockscreenReducer(createInitialLockscreenState(), {
      type: 'REQUEST_UNLOCK',
      hasPasscode: false,
    });
    expect(directState.mode).toBe('scanning');
    expect(directState.pendingAppId).toBeUndefined();

    // Notification tap stores pendingAppId and triggers scanning
    const notifState = lockscreenReducer(createInitialLockscreenState(), {
      type: 'REQUEST_UNLOCK',
      hasPasscode: false,
      targetAppId: 'internet-messaging',
    });
    expect(notifState.mode).toBe('scanning');
    expect(notifState.pendingAppId).toBe('internet-messaging');

    // Completing scan invokes onUnlock(pendingAppId) and never onPasscodeFailStrike
    onUnlock(notifState.pendingAppId);
    expect(onUnlock).toHaveBeenCalledWith('internet-messaging');
    expect(onPasscodeFailStrike).not.toHaveBeenCalled();

    // Swipe-up threshold check (dy <= -44, dominant vertical)
    expect(isLockscreenSwipeUp(0, -44)).toBe(true);
    expect(isLockscreenSwipeUp(10, -60)).toBe(true);
    expect(isLockscreenSwipeUp(0, -43)).toBe(false);
    expect(isLockscreenSwipeUp(80, -50)).toBe(false);
  });

  it('opens passcode pad on Level 2-3 and unlocks with correct 4-digit PIN preserving targetAppId', () => {
    const onUnlock = vi.fn();
    const onPasscodeFailStrike = vi.fn();

    let state = lockscreenReducer(createInitialLockscreenState(), {
      type: 'REQUEST_UNLOCK',
      hasPasscode: true,
      targetAppId: 'banking',
    });
    expect(state.mode).toBe('passcode');
    expect(state.pendingAppId).toBe('banking');

    for (const digit of ['1', '4', '0', '2']) {
      const nextPin = (state.enteredPin + digit).slice(0, 4);
      state = lockscreenReducer(state, {
        type: 'DIGIT_PRESS',
        digit,
        expectedPasscode: level2Config.passcode!,
      });
      if (nextPin.length === 4) {
        if (nextPin === level2Config.passcode) {
          onUnlock(state.pendingAppId);
        } else {
          onPasscodeFailStrike();
        }
      }
    }

    expect(state.enteredPin).toBe('1402');
    expect(state.errorMessage).toBeNull();
    expect(state.isShaking).toBe(false);
    expect(onUnlock).toHaveBeenCalledWith('banking');
    expect(onPasscodeFailStrike).not.toHaveBeenCalled();
  });

  it('clears dots, shakes, shows error message, and calls onPasscodeFailStrike on wrong 4-digit PIN', () => {
    const onUnlock = vi.fn();
    const onPasscodeFailStrike = vi.fn();

    let state = lockscreenReducer(createInitialLockscreenState(), {
      type: 'REQUEST_UNLOCK',
      hasPasscode: true,
    });

    for (const digit of ['9', '9', '9', '9']) {
      const nextPin = (state.enteredPin + digit).slice(0, 4);
      state = lockscreenReducer(state, {
        type: 'DIGIT_PRESS',
        digit,
        expectedPasscode: level2Config.passcode!,
      });
      if (nextPin.length === 4) {
        if (nextPin === level2Config.passcode) {
          onUnlock(state.pendingAppId);
        } else {
          onPasscodeFailStrike();
        }
      }
    }

    expect(state.enteredPin).toBe('');
    expect(state.isShaking).toBe(true);
    expect(state.errorMessage).toBe(PIN_ERROR_MESSAGE);
    expect(onUnlock).not.toHaveBeenCalled();
    expect(onPasscodeFailStrike).toHaveBeenCalledTimes(1);

    // Verify rendered keypad view shows sentence-case title, hint, quiet strike counter, error, and shake state
    const html = renderToStaticMarkup(
      <PasscodePadView
        passcodeHint={level2Config.passcodeHint}
        enteredPin={state.enteredPin}
        errorMessage={state.errorMessage}
        isShaking={state.isShaking}
        currentStrikes={1}
        maxStrikes={3}
        onDigitPress={vi.fn()}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(html).toContain('Nhập mật khẩu');
    expect(html).toContain(level2Config.passcodeHint!);
    expect(html).toContain('Nghi ngờ: 2/3');
    expect(html).toContain(PIN_ERROR_MESSAGE);
    expect(html).toContain('data-pin-shaking="true"');
    expect(html).toContain('Hủy');
  });

  it('returns to lockscreen on Cancel ("Hủy") without consuming a strike', () => {
    const onPasscodeFailStrike = vi.fn();

    let state = lockscreenReducer(createInitialLockscreenState(), {
      type: 'REQUEST_UNLOCK',
      hasPasscode: true,
      targetAppId: 'ecommerce',
    });
    state = lockscreenReducer(state, {
      type: 'DIGIT_PRESS',
      digit: '1',
      expectedPasscode: level2Config.passcode!,
    });
    expect(state.enteredPin).toBe('1');

    state = lockscreenReducer(state, { type: 'CANCEL_PASSCODE' });
    expect(state.mode).toBe('lockscreen');
    expect(state.enteredPin).toBe('');
    expect(state.pendingAppId).toBeUndefined();
    expect(state.errorMessage).toBeNull();
    expect(onPasscodeFailStrike).not.toHaveBeenCalled();
  });
});

describe('lockscreen swipe decision', () => {
  it('never unlocks while the finger is still dragging (only on release)', () => {
    expect(shouldUnlockOnSwipe('move', 0, -60)).toBe(false);
    expect(shouldUnlockOnSwipe('move', 5, -96)).toBe(false);
    expect(shouldUnlockOnSwipe('move', 0, -300)).toBe(false);
  });

  it('uses the base threshold on lift and on cancel', () => {
    expect(shouldUnlockOnSwipe('end', 0, -44)).toBe(true);
    expect(shouldUnlockOnSwipe('cancel', 0, -60)).toBe(true);
    expect(shouldUnlockOnSwipe('end', 0, -20)).toBe(false);
    expect(shouldUnlockOnSwipe('cancel', 90, -50)).toBe(false);
  });

  it('makes the lockscreen overlay panel follow the finger 1:1 upward only', () => {
    expect(lockscreenDragOffset(40)).toBe(0);
    expect(lockscreenDragOffset(-50)).toBe(-50);
    expect(lockscreenDragOffset(-300)).toBe(-300);
  });
});

