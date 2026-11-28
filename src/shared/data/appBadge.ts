import { number, record, records } from './read';

const sumUnread = (threads: unknown) => records(threads).reduce((total, thread) => total + number(thread.unreadCount), 0);
const badgeField = (data: Record<string, unknown>) => Math.max(0, Math.floor(number(data.unreadBadge)));

/**
 * Home-screen badge for an app, derived only from level data. Mirrors what the app shows inside.
 * `appsData` is the case payload map (keyed like CaseConfig.appsData).
 */
export function getAppBadgeCount(appId: string, appsData: Record<string, unknown>): number {
  switch (appId) {
    case 'internet-messaging': {
      const data = record(appsData['internet-messaging']);
      return sumUnread(data.threads) + sumUnread(data.otherThreads);
    }
    case 'messages': {
      const messages = record(appsData.messages);
      return sumUnread(Array.isArray(messages.threads) ? messages.threads : record(appsData.comms).threads);
    }
    case 'phone':
    case 'comms':
      return badgeField({ ...record(appsData.comms), ...record(appsData.phone) });
    default:
      return badgeField(record(appsData[appId]));
  }
}
