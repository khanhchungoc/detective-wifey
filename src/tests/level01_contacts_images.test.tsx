import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { loadCase } from '../features/case-runtime';
import { createAppContext } from '../bootstrap/appContext';
import { readCommunicationData, matchThread } from '../apps/comms/data';
import { MessagesApp } from '../apps/comms/MessagesApp';
import { readMessagingData } from '../apps/internet-messaging/data';
import { MessagingChatThreadView } from '../apps/internet-messaging/components/MessagingChatThreadView';
import { husbandFixture } from './helpers/husbandFixture';

describe('Level 1 shared contacts and conversation images', () => {
  it('resolves every Phone contact to the same saved identity and a readable SMS thread', () => {
    const config = loadCase('case_01');
    const phone = readCommunicationData(createAppContext(config, 'phone'));
    const smsContext = createAppContext(config, 'messages');
    const sms = readCommunicationData(smsContext);
    expect(sms.contacts).toEqual(phone.contacts);
    expect(new Set(sms.threads.map(thread => thread.contactId)).size).toBe(phone.contacts.length);
    for (const contact of phone.contacts) {
      const thread = matchThread(contact, phone.threads);
      expect(thread, contact.name).toBeDefined();
      expect(thread).toMatchObject({ contactId: contact.id, phone: contact.phone, name: contact.name });
      expect(thread!.messages.length).toBeGreaterThanOrEqual(6);
      const html = renderToStaticMarkup(createElement(MessagesApp, {
        caseData: smsContext, initialThreadId: thread!.id, unlockedChallenges: new Set<string>(),
        onReturnHome: vi.fn(), onTagSuspect: vi.fn(),
      }));
      expect(html).toContain(thread!.messages[0].body);
      expect(html).not.toContain('Không có cuộc trò chuyện');
    }
  });

  it('matches IDs and formatted full numbers without sending duplicate names to the wrong person', () => {
    const data = readCommunicationData({ caseId: 'test', husband: husbandFixture, levelNumber: 1, suspectPool: [], lockChallenges: [], appsData: {
      phone: { contacts: [{ contactId: 'one', displayName: 'Nam', primaryPhone: '0933445566' }] },
      messages: { threads: [
        { threadId: 'wrong', contactId: 'two', senderTitle: 'Nam', phoneNumber: '0900000099', messages: [] },
        { threadId: 'right', senderTitle: 'Tên cũ', phoneNumber: '+84 933 445 566', messages: [] },
      ] },
    } });
    expect(matchThread(data.contacts[0], data.threads)?.id).toBe('right');
    expect(matchThread(data.contacts[0], [data.threads[0]])).toBeUndefined();
    expect(data.threads[1].name).toBe('Nam');
  });

  it('renders bundled images in separate ordinary messaging conversations with captions and alt text', () => {
    const data = readMessagingData(loadCase('case_01').appsData['internet-messaging']);
    const imageThreads = data.threads!.filter(thread => thread.messages.some(message => message.type === 'image'));
    expect(imageThreads.map(thread => thread.threadId).sort()).toEqual(['thread_006', 'thread_010']);
    for (const thread of imageThreads) {
      const photo = thread.messages.find(message => message.type === 'image')!;
      const html = renderToStaticMarkup(createElement(MessagingChatThreadView, { thread, onBack: vi.fn(), onTagSuspect: vi.fn() }));
      expect(html).toContain('<img');
      expect(html).toContain(photo.imageAlt!);
      expect(html).toContain(photo.text);
      expect(html).not.toContain('src="http');
      expect(photo.clueRefId).toBe('');
    }
  });
});
