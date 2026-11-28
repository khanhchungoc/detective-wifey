import { describe, expect, it } from 'vitest';
import { getAppBadgeCount } from './appBadge';
import { APP_REGISTRY } from '../../bootstrap/appRegistry';
import { loadCase } from '../../features/case-runtime';
import { readMessagingData } from '../../apps/internet-messaging/data';
import { readBankingData } from '../../apps/banking/bankingData';

describe('getAppBadgeCount', () => {
  it('sums internet-messaging unread over threads and otherThreads', () => {
    const data = { 'internet-messaging': { threads: [{ unreadCount: 2 }, { unreadCount: 1 }], otherThreads: [{ unreadCount: 3 }] } };
    expect(getAppBadgeCount('internet-messaging', data)).toBe(6);
    expect(getAppBadgeCount('internet-messaging', {})).toBe(0);
  });

  it('sums SMS thread unread for messages, falling back to legacy comms', () => {
    expect(getAppBadgeCount('messages', { messages: { threads: [{ unreadCount: 1 }, { unreadCount: 2 }] } })).toBe(3);
    expect(getAppBadgeCount('messages', { comms: { threads: [{ unreadCount: 2 }] } })).toBe(2);
    expect(getAppBadgeCount('messages', { messages: { threads: [] }, comms: { threads: [{ unreadCount: 2 }] } })).toBe(0);
  });

  it('reads unreadBadge for phone and every other app', () => {
    expect(getAppBadgeCount('phone', { phone: { unreadBadge: 2 } })).toBe(2);
    expect(getAppBadgeCount('phone', { comms: { unreadBadge: 3 } })).toBe(3);
    for (const id of ['banking', 'ecommerce', 'email', 'team-collaboration', 'professional-network', 'ride-hailing', 'web-browser', 'photos', 'personal-notes']) {
      expect(getAppBadgeCount(id, { [id]: { unreadBadge: 5 } })).toBe(5);
      expect(getAppBadgeCount(id, { [id]: { unreadBadge: 0 } })).toBe(0);
      expect(getAppBadgeCount(id, { [id]: { unreadBadge: 'x' } })).toBe(0);
      expect(getAppBadgeCount(id, { [id]: { unreadBadge: -2 } })).toBe(0);
      expect(getAppBadgeCount(id, {})).toBe(0);
    }
  });

  it('matches what the apps show inside for case_01', () => {
    const { appsData } = loadCase('case_01');
    const messaging = readMessagingData(appsData['internet-messaging']);
    const inApp = [...(messaging.threads ?? []), ...(messaging.otherThreads ?? [])].reduce((t, th) => t + (th.unreadCount ?? 0), 0);
    expect(getAppBadgeCount('internet-messaging', appsData)).toBe(inApp);
    expect(getAppBadgeCount('banking', appsData)).toBe(readBankingData(appsData.banking)?.unreadCount ?? 0);
  });

  it('keeps hard-coded badges out of app definitions', () => {
    for (const app of Object.values(APP_REGISTRY)) expect('notificationBadgeCount' in app).toBe(false);
  });
});
