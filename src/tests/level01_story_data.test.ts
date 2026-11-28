import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import level01 from '../data/cases/husband_01/level_01';
import { mergeWithDefaultAppsData } from '../features/case-runtime';
import { readMessagingData } from '../apps/internet-messaging/data';
import { readBankingData } from '../apps/banking/bankingData';
import { normalizeEcommerceData } from '../apps/ecommerce/ecommerceData';
import { readAppData as readCommunications } from '../apps/comms/data';
import { readPhotosData } from '../apps/photos/data';
import { InternetMessagingApp } from '../apps/internet-messaging/InternetMessagingApp';

// Generic IDs are numbered in file order, story records first, filler history after.
const num = (id: string) => Number(id.split('_')[1]);
const data = level01.appsData;
const messaging = readMessagingData(data['internet-messaging']);
const banking = readBankingData(data.banking)!;
const shop = normalizeEcommerceData(data.ecommerce)!;
const phone = readCommunications(data.phone);
const sms = readCommunications(data.messages);
const thread = (id: string) => [...messaging.threads!, ...messaging.otherThreads!].find(item => item.threadId === id)!;
const stamp = (item: { timestamp?: string; time?: string }) => item.timestamp || item.time || '';

/** Collects every JSON object (record) that contains the given string value anywhere inside its own fields. */
function recordsContaining(node: unknown, needle: string, found: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(node)) node.forEach(child => recordsContaining(child, needle, found));
  else if (node && typeof node === 'object') {
    const row = node as Record<string, unknown>;
    if (Object.values(row).some(value => typeof value === 'string' && value.includes(needle))) found.push(row);
    Object.values(row).forEach(child => recordsContaining(child, needle, found));
  }
  return found;
}

describe('Level 1 story content through runtime adapters', () => {
  it('preserves ordinary daily activity and exposes all supplied categories', () => {
    expect(level01.allowedStrikes).toBe(5);
    expect(level01.lockChallenges).toEqual([]);
    expect(level01.suspectPool.map(suspect => suspect.suspectId)).toEqual([
      'suspect_01', 'suspect_02', 'suspect_03', 'suspect_04', 'suspect_05', 'suspect_06',
    ]);
    expect(level01.groundTruth.culpritSuspectId).toBe('suspect_01');
    expect(level01.deviceMetadata).toEqual({ narrativeTime: '23:45', batteryPercent: '8%', carrierTag: '5G', pwaThemeColor: '#0f172a' });
    expect(new Set(level01.activeAppIds)).toEqual(new Set(Object.keys(data)));
    expect(messaging.threads!.map(item => item.threadId)).toEqual([
      // Late friend and group chatter buries the alias thread mid-list.
      'thread_001', 'thread_002', 'thread_046', 'thread_047', 'thread_004', 'thread_048', 'thread_005',
      'thread_006', 'thread_003', 'thread_007', 'thread_008', 'thread_009', 'thread_010', 'thread_011', 'thread_012',
    ]);
    expect(messaging.otherThreads!.map(item => item.threadId)).toEqual(['thread_013']);
    expect(banking.transactions.filter(row => num(row.id) <= 20)).toHaveLength(20);
    expect(shop.orders.map(order => order.orderId).filter(id => num(id) <= 9).sort()).toEqual([
      'order_001', 'order_002', 'order_003', 'order_004', 'order_005', 'order_006', 'order_007', 'order_008', 'order_009',
    ]);
    expect(shop.chats.map(chat => chat.shopId).filter(id => num(id) <= 5).sort()).toEqual([
      'shopchat_001', 'shopchat_002', 'shopchat_003', 'shopchat_004', 'shopchat_005',
    ]);
    expect(phone.calls.filter(call => num(call.id) <= 14)).toHaveLength(14);
    expect(phone.contacts).toHaveLength(32);
    // Every Phone contact opens a readable SMS history (shared phonebook rule).
    expect(new Set(sms.threads.map(item => item.contactId)).size).toBe(phone.contacts.length);
    expect(sms.threads.every(item => item.messages.length >= 6)).toBe(true);
    expect(messaging.threads!.filter(item => !item.isGroup).every(item => item.messages.length >= 3)).toBe(true);
    expect(messaging.threads!.flatMap(item => item.messages).filter(message => message.type === 'image')).toHaveLength(2);
    expect(data['ride-hailing'].trips.length).toBeGreaterThanOrEqual(20);
    expect(data['web-browser'].history.filter((row: { id: string }) => num(row.id) <= 8)).toHaveLength(8);
    expect(data['web-browser'].tabs.map((tab: { title: string }) => tab.title)).toEqual(['CSS grid căn cột', 'So sánh bình nóng lạnh']);
    expect(readPhotosData(data.photos).albums.flatMap(album => album.photos)).toHaveLength(16);
    expect(data['personal-notes'].notes.filter((note: { id: string }) => num(note.id) <= 6)).toHaveLength(6);
    expect(data.email.emails.filter((mail: { id: string }) => num(mail.id) <= 8)).toHaveLength(8);
    expect(data['professional-network'].posts.length).toBeGreaterThanOrEqual(12);
    expect(data['team-collaboration'].channels.filter((channel: { id: string }) => num(channel.id) <= 5)).toHaveLength(5);
  });

  it('keeps clues sparse: only the intended records carry clue ids and no identity labels', () => {
    const serialized = JSON.stringify(data);
    const clues = [...serialized.matchAll(/CLUE-[A-Z]+-\d+/g)].map(match => match[0]);
    expect(new Set(clues)).toEqual(new Set([
      'CLUE-ZOLA-01', 'CLUE-ZOLA-08', 'CLUE-ZOLA-09', 'CLUE-ZOLA-10', 'CLUE-ZOLA-11',
      'CLUE-POSH-05', 'CLUE-POSH-06', 'CLUE-BANK-07', 'CLUE-PHONE-01', 'CLUE-MSG-02',
      'CLUE-GRAP-04', 'CLUE-BROW-05',
    ]));
    expect(banking.transactions.filter(row => row.clueRefId).map(row => row.id)).toEqual(['tx_003']);
    expect(banking.transactions.some(row => row.suspectName)).toBe(false);
    expect(shop.orders.filter(order => order.clueRefId).map(order => order.orderId).sort()).toEqual(['order_003', 'order_004', 'order_005']);
    expect(phone.calls.filter(call => call.clueRefId).map(call => call.id)).toEqual(['call_001']);
    expect(phone.calls.some(call => call.suspectName)).toBe(false);
    expect(sms.threads.flatMap(item => item.messages).filter(message => message.clueRefId).map(message => message.id)).toEqual(['msg_015_0006']);
    expect(thread('thread_003').messages.filter(message => message.clueRefId).map(message => message.id)).toEqual(['msg_003_0014']);
    expect(thread('thread_008').messages.filter(message => message.clueRefId)).toHaveLength(1);
    // Old story content must not survive.
    for (const retired of ['photo_dinner_claypot', 'CLUE-PHOT-05', '"tx_02"', 'thread_903"', 'Thợ Điện","phoneNumber":"0988886677', 'bút thử điện', 'Romance Boutique', 'Chùa Láng', 'catalogue']) {
      expect(serialized).not.toContain(retired);
    }
    expect(data.photos.albums[0].photos.some((photo: { clueRefId?: string }) => photo.clueRefId)).toBe(false);
  });

  it('keeps the culprit phone and legal name confined to the intended records', () => {
    const owners = (needle: string) => recordsContaining(data, needle)
      .map(row => String(row.callId ?? row.orderId ?? row.id ?? row.contactId ?? row.threadId)).sort();
    expect(owners('0988886677')).toEqual(['call_001', 'call_003', 'contact_011', 'contact_011', 'contact_011', 'order_005', 'trip_021']);
    expect(owners('Thu Hương')).toEqual(['msg_012_0001', 'order_005']);
    expect(JSON.stringify(data)).not.toMatch(/Marketing(?! Executive)/);
    const khoaContacts = messaging.contacts!.filter(contact => contact.id === 'contact_011');
    expect(khoaContacts).toHaveLength(1);
    expect(khoaContacts[0]).toMatchObject({ name: 'Khoa BE', phone: '0988886677', department: '', note: '', suspectName: '' });
    expect(messaging.contacts!.find(contact => contact.id === 'contact_013')).toMatchObject({ name: 'Anh Tuấn Thợ Điện', phone: '0912345801' });
    expect(phone.contacts.find(contact => contact.id === 'contact_001')?.phone).toBe('0915220011');
    // Every call, SMS and order phone matches the saved contact it points at.
    for (const call of phone.calls) {
      expect(phone.contacts.find(contact => contact.id === call.contactId)?.phone, call.id).toBe(call.phone);
    }
    expect(shop.orders.find(order => order.orderId === 'order_004')?.recipientPhone).toBe('0915220011');
    expect(shop.orders.find(order => order.orderId === 'order_003')?.recipientPhone).toBe('0988990011');
    expect(thread('thread_003').messages.some(message => /váy|Hương/.test(message.text))).toBe(false);
  });

  it('has no record dated after the 23:45 inspection time on 15/10/2026', () => {
    const serialized = JSON.stringify(data) + JSON.stringify(level01.notifications);
    const stamps = [...serialized.matchAll(/(\d{2})\/(\d{2})\/2026 (\d{2}):(\d{2})/g)]
      .map(([, day, month, hour, minute]) => Number(month) * 1e6 + Number(day) * 1e4 + Number(hour) * 100 + Number(minute));
    expect(stamps.length).toBeGreaterThan(300);
    expect(Math.max(...stamps)).toBeLessThanOrEqual(10 * 1e6 + 15 * 1e4 + 2345);
    expect(shop.orders.every(order => !/^1[6-9]\//.test(order.orderDate))).toBe(true);
    expect(phone.calls.filter(call => call.direction === 'missed').every(call => call.duration === '0 phút 0 giây')).toBe(true);
  });

  it('shows two lock-screen toasts that mirror the last thread messages', () => {
    expect(level01.notifications.map(toast => toast.toastId)).toEqual(['toast_001', 'toast_002']);
    expect(level01.notifications.map(toast => toast.triggerDelaySeconds)).toEqual([3, 5]);
    const [first, second] = level01.notifications;
    // The second toast comes from the poker group, so the alias thread is never advertised.
    for (const [toast, id, time, sender] of [[first, 'thread_004', '22:58', ''], [second, 'thread_046', '23:42', 'A9: ']] as const) {
      const item = thread(id);
      const last = item.messages[item.messages.length - 1];
      expect(toast.senderTitle).toBe(`Tin nhắn • ${time}`);
      expect(stamp(last)).toBe(`15/10/2026 ${time}`);
      expect(toast.snippetBody).toBe(`${item.contactName}: ${sender}${last.text}`);
      expect(item.unreadCount).toBeGreaterThan(0);
    }
    expect(level01.notifications.some(toast => toast.snippetBody.includes('Khoa BE'))).toBe(false);
    expect(level01.epilogueNotification).toEqual({
      sourceAppId: 'banking', senderTitle: 'Ngân hàng • Vừa xong',
      snippetBody: '+1.000 đ từ NGUYEN THI THU HUONG: Anh chan so em that a?',
    });
  });

  it('lists threads by last message time and resolves group senders to saved contacts', () => {
    const key = (value: string) => { const [d, m, y, h, n] = value.split(/[/ :]/); return `${y}${m}${d}${h}${n}`; };
    const times = messaging.threads!.map(item => item.timestamp);
    expect(times).toEqual([...times].sort((a, b) => key(b).localeCompare(key(a))));
    const groups = messaging.threads!.filter(item => item.isGroup);
    expect(groups.map(item => item.threadId).sort()).toEqual(['thread_001', 'thread_002', 'thread_012', 'thread_046', 'thread_047']);
    expect(thread('thread_012')).toMatchObject({ memberCount: 46, pinnedMessageId: 'msg_012_0001' });
    const contactIds = new Set(messaging.contacts!.map(contact => contact.id));
    for (const group of groups) {
      for (const message of group.messages) {
        if (message.sender === 'me') continue;
        expect(Boolean(message.senderContactId) !== Boolean(message.senderName), message.id).toBe(true);
        if (message.senderContactId) expect(contactIds.has(message.senderContactId), message.id).toBe(true);
        expect(message.text, message.id).not.toMatch(/^[^:]{1,20}: /);
      }
    }
    const company = thread('thread_012');
    expect(company.messages.find(message => message.id === 'msg_012_0004')?.senderContactId).toBe('contact_011');
    expect(company.messages.find(message => message.id === 'msg_012_0005')?.replyToId).toBe('msg_012_0004');
    expect(company.messages.find(message => message.id === company.pinnedMessageId)?.timestamp ?? stamp(company.messages[0])).toContain('08/09/2026 09:00');
  });

  it('connects the booking, the false alibi and the card payment without replacing identity with an answer', () => {
    const contact = phone.contacts.find(item => item.name === 'Khoa BE')!;
    const order = shop.orders.find(item => item.orderId === 'order_005')!;
    expect(contact.phone).toBe('0988886677');
    expect(contact.notes).toBe('');
    expect(order.recipientName).toBe('Nguyễn Thị Thu Hương');
    expect(order.recipientPhone).toBe(contact.phone);
    expect(order.shippingAddress).toBe('Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội');
    expect(order.items[0].variantName).toBe('be, size S');
    expect(shop.chats.find(chat => chat.shopId === 'shopchat_004')!.messages.find(message => message.clueRefId)!.text).toContain('15/09 - 15/10');
    expect(thread('thread_005').messages.find(message => message.id === 'msg_005_0082')!.text).toContain('sếp Tuấn Anh đang chốt nốt');
    const dinner = banking.transactions.find(item => item.id === 'tx_003')!;
    expect(dinner.timestamp).toContain('20:48');
    expect(dinner.formattedAmount).toBe('- 640.000 đ');
    expect(dinner.counterpartyName).toBe('COM NIEU PHO CO');
    const lateCall = phone.calls.find(call => call.id === 'call_001')!;
    expect(lateCall.phone).toBe(contact.phone);
    expect(lateCall.time).toContain('15/10');
    expect(lateCall.time).toContain('23:20');
    expect(lateCall.duration).toBe('1 phút 36 giây');
    expect(lateCall.clueRefId).toBe('CLUE-PHONE-01');
  });

  it('keeps every innocent suspect explainable from readable records', () => {
    const text = (id: string) => thread(id).messages.map(message => message.text).join(' ');
    expect(text('thread_007')).toContain('Quỹ nhóm mình mỗi người 100');
    expect(text('thread_009')).toContain('buổi đánh giá lại cột sống');
    expect(text('thread_008')).toContain('trượt Vĩ mô');
    expect(text('thread_011')).toContain('ký sổ');
    expect(text('thread_010')).toContain('Bình nóng lạnh nhà mình hỏng');
    expect(text('thread_004')).toContain('bình nóng lạnh nhà mẹ em');
    expect(sms.threads.find(item => item.id === 'thread_015')!.messages.at(-1)!.body).toContain('vang mat buoi PT 18:00');
    expect(banking.transactions.find(row => row.id === 'tx_006')).toMatchObject({ memo: 'Coc', formattedAmount: '- 1.500.000 đ' });
    expect(shop.chats.find(chat => chat.shopId === 'shopchat_002')!.messages.map(message => message.text).join(' ')).toContain('Team Dev');
  });

  it('suppresses old default evidence after merge and keeps the inbox free of retired content', () => {
    const merged = mergeWithDefaultAppsData(data);
    const mergedMessages = readMessagingData(merged['internet-messaging']);
    expect(mergedMessages.cloudDocuments!.length).toBeGreaterThan(0);
    expect(mergedMessages.cloudDocuments!.some(document => document.clueRefId)).toBe(false);
    expect(mergedMessages.otherThreads!.length).toBeGreaterThan(0);
    expect(mergedMessages.contacts!.some(contact => contact.name.includes('Hương'))).toBe(false);
    const html = renderToStaticMarkup(createElement(InternetMessagingApp, {
      caseData: {
        caseId: level01.caseId, husband: level01.husband, levelNumber: 1,
        suspectPool: level01.suspectPool, lockChallenges: [], appsData: merged,
      },
      onReturnHome: () => {}, onTagSuspect: () => {}, unlockedChallenges: new Set<string>(),
    }));
    expect(html).toContain('quy_uoc_hook.txt');
    expect(html).not.toContain('Nguyễn Thị Thu Hương');
    for (const retired of ['Chua_Lang', 'Chùa Láng', 'Romance Boutique', 'catalogue', '2 tệp mới']) {
      expect(html).not.toContain(retired);
    }
  });
});
