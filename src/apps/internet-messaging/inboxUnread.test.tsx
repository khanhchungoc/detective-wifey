import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessagingInboxView } from './components/MessagingInboxView';
import { readMessagingData } from './data';
import { loadCase } from '../../features/case-runtime';
import { getAppBadgeCount } from '../../shared/data/appBadge';

describe('Zola inbox unread markers', () => {
  it('shows a per-chat unread count for every unread chat, adding up to the home badge', () => {
    const level = loadCase('case_01');
    const data = readMessagingData(level.appsData['internet-messaging'])!;
    const html = renderToStaticMarkup(
      <MessagingInboxView caseId="case_01" contacts={data.contacts ?? []} threads={data.threads ?? []}
        onSelectThread={vi.fn()} onTagSuspect={vi.fn()} onReturnHome={vi.fn()} />,
    );
    const counts = [...html.matchAll(/data-thread-unread="(\d+)"/g)].map(match => Number(match[1]));
    expect(counts.reduce((sum, n) => sum + n, 0)).toBe(getAppBadgeCount('internet-messaging', level.appsData));
    expect(counts.length).toBe((data.threads ?? []).filter(thread => thread.unreadCount).length);
  });
});
