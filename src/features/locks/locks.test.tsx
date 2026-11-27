import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { findAppChallenge } from './locks';
import { SharedPinLockpad } from './components/SharedPinLockpad';
import type { LockChallenge } from '../../shared/contracts/case-schema';

const noop = () => {};

describe('findAppChallenge', () => {
  const challenges: LockChallenge[] = [
    {
      challengeId: 'lock_banking',
      targetType: 'app',
      targetId: 'banking',
      lockType: 'numeric_pin',
      expectedAnswer: '1234',
      clueSourceApp: 'internet-messaging',
    },
    {
      challengeId: 'lock_hidden_album',
      targetType: 'album',
      targetId: 'photos',
      lockType: 'numeric_pin',
      expectedAnswer: '5678',
      clueSourceApp: 'personal-notes',
    },
  ];

  it('finds an app-level lock challenge by appId', () => {
    const match = findAppChallenge(challenges, 'banking');
    expect(match?.challengeId).toBe('lock_banking');
    expect(match?.expectedAnswer).toBe('1234');
  });

  it('ignores non-app challenges even if targetId matches an appId', () => {
    expect(findAppChallenge(challenges, 'photos')).toBeUndefined();
  });

  it('returns undefined when no challenge matches', () => {
    expect(findAppChallenge(challenges, 'ecommerce')).toBeUndefined();
    expect(findAppChallenge([], 'banking')).toBeUndefined();
  });
});

describe('SharedPinLockpad', () => {
  it('renders app security title, 10 numeric keys, delete key, and strike counter', () => {
    const html = renderToStaticMarkup(
      <SharedPinLockpad
        appName="VietPay"
        targetChallengeId="lock_banking"
        expectedPin="1234"
        currentStrikes={3}
        maxStrikes={4}
        onSuccess={noop}
        onFailStrike={noop}
        onCancel={noop}
      />,
    );

    expect(html).toContain('Khóa Bảo Mật VietPay');
    expect(html).toContain('NHẬP MÃ PIN 4 SỐ');
    expect(html).toContain('Thoát ra');
    expect(html).toContain('aria-label="Xóa"');
    expect(html).toContain('3 / 4');

    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(html).toContain(`>${digit}</button>`);
    }
  });
});
