import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessagingChatThreadView } from './components/MessagingChatThreadView';
import { MessagingInboxView } from './components/MessagingInboxView';
import { groupSenderLabel } from './groupChat';
import type { MessagingContact, MessagingThread } from './types';

const captured = vi.hoisted(() => ({ items: [] as Array<Record<string, any>> }));
vi.mock('../../shared/motion/useMotionState', () => ({
  useMotionState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock('../../features/investigation', () => ({
  StoryEvidenceTarget: ({ item, children }: { item: Record<string, any>; children: React.ReactNode }) => {
    captured.items.push(item);
    return <div>{children}</div>;
  },
}));

const contacts: MessagingContact[] = [{ id: 'contact_10', name: 'Khoa BE', section: 'K' }];
const thread: MessagingThread = {
  threadId: 'thread_company', contactName: 'Technosoft All', lastMessage: 'x', timestamp: '09:10',
  isGroup: true, memberCount: 46, pinnedMessageId: 'msg_pin',
  messages: [
    { id: 'msg_pin', sender: 'them', senderName: 'HR Technosoft', text: 'Quy định mới', timestamp: '08/09/2026 09:00' },
    { id: 'msg_post', sender: 'them', senderContactId: 'contact_10', text: 'Share tài liệu nhé', timestamp: '08/09/2026 09:05' },
    { id: 'msg_thanks', sender: 'them', senderName: 'HR Technosoft', replyToId: 'msg_post', text: 'Cảm ơn nha', timestamp: '08/09/2026 09:10' },
  ],
};

const render = () => {
  captured.items = [];
  return renderToStaticMarkup(<MessagingChatThreadView thread={thread} contacts={contacts} caseId="case_01"
    onBack={vi.fn()} onTagSuspect={vi.fn()} />);
};

it('resolves sender label from saved contact, else senderName', () => {
  expect(groupSenderLabel(thread.messages[1], contacts)).toBe('Khoa BE');
  expect(groupSenderLabel(thread.messages[0], contacts)).toBe('HR Technosoft');
  expect(groupSenderLabel({ id: 'a', sender: 'them', text: 't' }, contacts)).toBe('');
});

it('renders header count, sender labels, pinned bar and reply quote', () => {
  const html = render();
  expect(html).toContain('46 thành viên');
  expect(html).toContain('>Khoa BE<');
  expect(html).toContain('data-pinned-message-id="msg_pin"');
  expect(html).toContain('Quy định mới');
  expect(html).toContain('data-testid="reply-quote"');
  expect(html).toContain('Share tài liệu nhé');
});

it('pins group messages with the displayed sender label and message id', () => {
  render();
  const post = captured.items.find(item => item.source?.recordId === 'msg_post')!;
  expect(post.source).toMatchObject({
    recordId: 'msg_post', conversationId: 'thread_company', kind: 'message',
    visibleAlias: 'Khoa BE', title: 'Khoa BE', snippet: 'Share tài liệu nhé',
  });
  expect(post.suspectToTag).toBe('Khoa BE');
  const pinned = captured.items.find(item => item.source?.recordId === 'msg_pin')!;
  expect(pinned.source.visibleAlias).toBe('HR Technosoft');
});

it('prefixes group inbox preview with the sender label', () => {
  const html = renderToStaticMarkup(<MessagingInboxView caseId="case_01" contacts={contacts}
    threads={[{ ...thread, messages: thread.messages.slice(0, 2), lastMessage: 'Share tài liệu nhé' }]}
    onSelectThread={vi.fn()} onTagSuspect={vi.fn()} onReturnHome={vi.fn()} />);
  expect(html).toContain('Khoa BE: Share tài liệu nhé');
});
