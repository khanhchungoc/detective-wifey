import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { readAppData, readCommunicationData, matchThread, searchThreads } from './data';
import { CommsApp } from './CommsApp';
import { MessagesApp } from './MessagesApp';
import type { VirtualAppProps } from '../../shared/contracts/app-contracts';
import type { UniversalEvidenceItem } from '../../shared/contracts/evidence';
import { husbandFixture } from '../../tests/helpers/husbandFixture';

vi.mock('../../features/investigation', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../features/investigation')>(),
  StoryEvidenceTarget: ({ item, children }: { item: UniversalEvidenceItem; children: ReactNode }) =>
    createElement('div', { 'data-evidence-snippet': item.source?.snippet }, children),
}));

const payload = {
  calls: [{ callId: 'call', contactName: 'Liên hệ', phoneNumber: '0123', direction: 'outgoing', timestamp: '23:45', durationSeconds: 72 }],
  contacts: [{ contactId: 'contact', displayName: 'Liên hệ', primaryPhone: '0123', notesField: 'Ghi chú màn chơi', clueRefId: 'CLUE-PHONE-02' }],
  threads: [{ threadId: 'thread', senderTitle: 'Liên hệ', phoneNumber: '0123', unreadCount: 1, messages: [
    { messageId: 'message', bodyText: 'Xác nhận đặt phòng', timestamp: '20:15', tapback: { type: 'heart', timestamp: '20:18' } },
    { messageId: 'draft', bodyText: 'Bản nháp', isCanceledDraft: true, scheduledSendTimestamp: 'Ngày mai', canceledAt: '23:50' },
  ] }],
};
function props(appsData: Record<string, unknown>): VirtualAppProps {
  return { caseData: { caseId: 'case', husband: husbandFixture, levelNumber: 1, suspectPool: [], lockChallenges: [], appsData },
    onReturnHome: vi.fn(), onTagSuspect: vi.fn(), unlockedChallenges: new Set() };
}

describe('Phone and Messages contracts', () => {
  it.each(['outgoing', 'incoming', 'missed'])('includes the actual phone number in pinned %s call content', direction => {
    const call = { ...payload.calls[0], direction };
    const render = (row: object) => renderToStaticMarkup(createElement(CommsApp, props({ phone: { ...payload, calls: [row] } })));
    expect(render(call)).toContain('data-evidence-snippet="0123\n');
    expect(render({ ...call, phoneNumber: '', contactId: 'contact' })).toContain('data-evidence-snippet="0123\n');
    expect(render({ ...call, contactName: 'Không rõ', phoneNumber: '' })).not.toContain('data-evidence-snippet="0123');
    if (direction === 'missed') expect(render(call)).not.toContain('1 phút 12 giây');
  });
  it('accepts canonical design schemas and preserves immutable narrative source fields', () => {
    const source = JSON.stringify(payload);
    const data = readAppData(payload);
    expect(data.calls[0].duration).toBe('1 phút 12 giây');
    expect(data.contacts[0].notes).toBe('Ghi chú màn chơi');
    expect(data.contacts[0].clueRefId).toBe('CLUE-PHONE-02');
    expect(data.threads[0].messages[0].reaction?.time).toBe('20:18');
    expect(data.threads[0].messages[1]).toMatchObject({ canceled: true, scheduledTime: 'Ngày mai', canceledTime: '23:50' });
    expect(JSON.stringify(payload)).toBe(source);
  });
  it('groups legacy SMS without dropping messages and does not invent numbers or contact notes', () => {
    const data = readAppData({ calls: [{ id: 'c', name: 'Mẹ', type: 'missed' }], sms: [
      { id: 'a', sender: 'EVN', text: 'Một' }, { id: 'b', sender: 'EVN', text: 'Hai' },
    ] });
    expect(data.threads).toHaveLength(1);
    expect(data.threads[0].messages.map(m => m.body)).toEqual(['Một', 'Hai']);
    expect(data.contacts[0]).toMatchObject({ name: 'Mẹ', notes: '', phone: '' });
  });
  it('matches only an existing contact thread and searches full message content', () => {
    const data = readAppData(payload);
    expect(matchThread(data.contacts[0], data.threads)?.id).toBe('thread');
    expect(matchThread({ ...data.contacts[0], id: 'other', name: 'Other', phone: '' }, data.threads)).toBeUndefined();
    expect(searchThreads(data.threads, '  ĐẶT PHÒNG ')).toHaveLength(1);
    expect(searchThreads(data.threads, 'missing')).toHaveLength(0);
  });
  it('handles malformed optional payloads without throwing', () => {
    expect(readAppData(null)).toEqual({ calls: [], contacts: [], threads: [] });
    expect(readAppData({ calls: [null, 3], threads: 'invalid' }).calls).toEqual([]);
    expect(readCommunicationData(props({ phone: { calls: payload.calls }, messages: { threads: payload.threads } }).caseData).threads).toHaveLength(1);
  });
  it('renders iOS Phone controls without keypad, favorites or a permanent evidence button', () => {
    const html = renderToStaticMarkup(createElement(CommsApp, props({ phone: payload })));
    expect(html).toContain('Điện thoại');
    expect(html).toContain('Gọi nhỡ');
    expect(html).toContain('Danh bạ');
    expect(html).not.toContain('Bàn phím');
    expect(html).not.toContain('Ghim');
    expect(html).not.toContain('Yêu thích');
  });
  it('opens the requested thread with reaction and draft inspection but no composer', () => {
    const html = renderToStaticMarkup(createElement(MessagesApp, { ...props({ messages: payload }), initialThreadId: 'thread' }));
    expect(html).toContain('Xác nhận đặt phòng');
    expect(html).toContain('Xem thời gian phản ứng');
    expect(html).toContain('Xem bản nháp hẹn giờ đã hủy');
    expect(html).not.toContain('<input');
    expect(html).not.toContain('Ghim');
  });
});
