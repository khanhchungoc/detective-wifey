import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import level01 from '../data/cases/hoang/level_01.json';
import { mergeWithDefaultAppsData } from '../features/case-runtime';
import { readMessagingData } from '../apps/internet-messaging/data';
import { readBankingData } from '../apps/banking/bankingData';
import { normalizeEcommerceData } from '../apps/ecommerce/ecommerceData';
import { readAppData as readCommunications } from '../apps/comms/data';
import { readPhotosData } from '../apps/photos/data';
import { InternetMessagingApp } from '../apps/internet-messaging/InternetMessagingApp';

const data = level01.appsData;
const messaging = readMessagingData(data['internet-messaging']);
const banking = readBankingData(data.banking)!;
const shop = normalizeEcommerceData(data.ecommerce)!;
const phone = readCommunications(data.phone);
const sms = readCommunications(data.messages);

describe('Level 1 story content through runtime adapters', () => {
  it('preserves ordinary daily activity and exposes all supplied categories', () => {
    expect(level01.allowedStrikes).toBe(5);
    expect(level01.lockChallenges).toEqual([]);
    expect(level01.suspectPool.map(suspect => suspect.suspectId)).toEqual([
      'suspect_huong', 'suspect_lan_anh', 'suspect_thao', 'suspect_ngoc', 'suspect_mai',
    ]);
    expect(new Set(level01.activeAppIds)).toEqual(new Set(Object.keys(data)));
    expect(messaging.threads).toHaveLength(9);
    expect(banking.transactions.length).toBeGreaterThanOrEqual(60);
    expect(shop.orders.length).toBeGreaterThanOrEqual(22);
    expect(shop.chats.length).toBeGreaterThanOrEqual(8);
    expect(shop.notifications.length).toBeGreaterThanOrEqual(20);
    expect(phone.calls.length).toBeGreaterThanOrEqual(46);
    expect(sms.threads.length).toBeGreaterThanOrEqual(16);
    expect(messaging.threads!.every(thread => thread.messages.length >= 11)).toBe(true);
    expect(messaging.threads!.flatMap(thread => thread.messages).filter(message => message.type === 'image')).toHaveLength(2);
    expect(data['ride-hailing'].trips.length).toBeGreaterThanOrEqual(20);
    expect(data['web-browser'].history.length).toBeGreaterThanOrEqual(25);
    expect(data['web-browser'].tabs).toHaveLength(2);
    expect(readPhotosData(data.photos).albums.flatMap(album => album.photos).length).toBeGreaterThanOrEqual(16);
    expect(data['personal-notes'].notes.length).toBeGreaterThanOrEqual(14);
    expect(data.email.emails.length).toBeGreaterThanOrEqual(25);
    expect(data['professional-network'].posts.length).toBeGreaterThanOrEqual(12);
    expect(data['team-collaboration'].channels.length).toBeGreaterThanOrEqual(12);
    expect([...messaging.threads!, ...messaging.otherThreads!].filter(thread => thread.messages.some(message => message.clueRefId))).toHaveLength(2);
    expect(banking.transactions.filter(transaction => transaction.clueRefId)).toHaveLength(2);
    expect(shop.orders.filter(order => order.clueRefId)).toHaveLength(1);
    expect(shop.chats.filter(chat => chat.messages.some(message => message.clueRefId))).toHaveLength(1);
    expect(phone.calls.filter(call => call.clueRefId)).toHaveLength(1);
    expect(sms.threads.flatMap(thread => thread.messages).some(message => message.clueRefId)).toBe(false);
  });

  it('connects collection, dinner, false alibi and forgotten coat without replacing identity with an answer', () => {
    const contact = phone.contacts.find(contact => contact.name === 'Anh Tuấn Thợ Điện')!;
    const order = shop.orders.find(order => order.orderId === 'order_01')!;
    expect(contact.phone).toBe('0988886677');
    expect(contact.notes).toBe('');
    expect(order.recipientName).toBe('Nguyễn Thị Thu Hương');
    expect(order.recipientPhone).toBe(contact.phone);
    expect(order.shippingAddress).toBe('Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội');
    const thread = messaging.otherThreads!.find(thread => thread.threadId === 'thread_tuan')!;
    expect(thread.realIdentity).toBe('');
    expect(thread.isPinned).toBe(false);
    expect(thread.messages.find(message => (message.timestamp || message.time).includes('15/10') && (message.timestamp || message.time).includes('15:20'))!.text).toContain('đồ nghề');
    expect(thread.messages.find(message => (message.timestamp || message.time).includes('15/10') && (message.timestamp || message.time).includes('16:42'))!.text).toContain('Phố Cổ');
    const lastMessage = thread.messages[thread.messages.length - 1];
    expect(lastMessage.text).toBe('Đồ anh để quên em cất rồi, mai em mang qua nhé.');
    expect(level01.notifications[0].snippetBody).toContain(lastMessage.text);
    expect(shop.chats.find(chat => chat.shopId === 'seller_satin')!.messages.find(message => message.clueRefId)!.text).toContain('15/09 - 15/10');
    const wife = messaging.threads!.find(thread => thread.threadId === 'thread_wife')!;
    expect(wife.messages.find(message => (message.timestamp || message.time).includes('15/10') && (message.timestamp || message.time).includes('20:46'))!.text).toContain('phòng họp');
    const dinner = banking.transactions.find(transaction => transaction.id === 'tx_01')!;
    expect(dinner.timestamp).toContain('20:48');
    expect(dinner.formattedAmount).toBe('- 640.000 đ');
    expect(dinner.counterpartyName).toBe('Com Nieu Pho Co');
    const lateCall = phone.calls.find(call => call.id === 'call_tuan_late')!;
    expect(lateCall.phone).toBe(contact.phone);
    expect(lateCall.time).toContain('15/10');
    expect(lateCall.time).toContain('23:30');
    expect(lateCall.duration).toBe('1 phút 36 giây');
    expect(lateCall.clueRefId).toBe('CLUE-PHONE-01');
    expect(phone.calls.filter(call => call.direction === 'missed').every(call => call.duration === '0 phút 0 giây')).toBe(true);
  });

  it('keeps benign explanations readable and suppresses old default evidence after merge', () => {
    const merged = mergeWithDefaultAppsData(data);
    const mergedMessages = readMessagingData(merged['internet-messaging']);
    expect(mergedMessages.cloudDocuments!.length).toBeGreaterThan(0);
    expect(mergedMessages.cloudDocuments!.some(document => document.clueRefId)).toBe(false);
    expect(mergedMessages.otherThreads!.length).toBeGreaterThan(0);
    expect(mergedMessages.contacts!.some(contact => contact.name.includes('Hương'))).toBe(false);
    const text = (id: string) => messaging.threads!.find(thread => thread.threadId === id)!.messages.map(message => message.text).join(' ');
    expect(text('thread_lan_anh')).toContain('mỗi người 100');
    expect(text('thread_thao')).toContain('phiếu đánh giá cột sống');
    expect(text('thread_ngoc')).toContain('anh trai');
    expect(text('thread_mai')).toContain('ký sổ');
    const serialized = JSON.stringify(data);
    for (const oldContent of ['Romance Boutique', 'Chùa Láng', 'váy ngủ', 'Em gian anh', 'catalogue', 'CLUE-ZOLA-04']) {
      expect(serialized).not.toContain(oldContent);
    }
    const clues = [...serialized.matchAll(/CLUE-[A-Z]+-\d+/g)].map(match => match[0]);
    expect(new Set(clues)).toEqual(new Set(['CLUE-ZOLA-07', 'CLUE-BANK-06', 'CLUE-POSH-05', 'CLUE-PHONE-01', 'CLUE-PHOT-05']));
    const dinnerPhoto = readPhotosData(data.photos).photos.find(photo => photo.id === 'photo_dinner_claypot');
    expect(dinnerPhoto?.clueRefId).toBe('CLUE-PHOT-05');
    expect(dinnerPhoto?.locationTag).toContain('Phố Cổ');
    expect(dinnerPhoto?.highResUrl).toBeTruthy();
  });

  it('renders the supplied inbox preview without leaking the replaced rental story', () => {
    const html = renderToStaticMarkup(createElement(InternetMessagingApp, {
      caseData: {
        caseId: level01.caseId, husbandName: level01.husbandName, levelNumber: 1,
        suspectPool: level01.suspectPool, lockChallenges: [], appsData: mergeWithDefaultAppsData(data),
      },
      onReturnHome: () => {}, onTagSuspect: () => {}, unlockedChallenges: new Set<string>(),
    }));
    expect(html).toContain('quy_uoc_hook.txt');
    expect(html).not.toContain('Đồ anh để quên em cất rồi, mai em mang qua nhé.');
    for (const retired of ['Chua_Lang', 'Chùa Láng', 'Romance Boutique', 'catalogue', '2 tệp mới']) {
      expect(html).not.toContain(retired);
    }
  });

  it('places the disguised conversation only in Other and mixes SMS time order', () => {
    expect(messaging.threads!.some(thread => thread.threadId === 'thread_tuan')).toBe(false);
    expect(messaging.otherThreads!.filter(thread => thread.threadId === 'thread_tuan')).toHaveLength(1);

    const nonPersonTitles = ['Nhà mạng', 'Ban Quản Lý', 'Mua sắm', 'Thông tin gói cước', 'Giao Hàng'];
    const firstFiveAreAllNonPerson = sms.threads.slice(0, 5).every(thread => nonPersonTitles.includes(thread.name));
    expect(firstFiveAreAllNonPerson).toBe(false);
    expect(nonPersonTitles.includes(sms.threads[0].name)).toBe(false);
  });
});

