import { readMessagingData } from '../apps/internet-messaging/data';
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { APP_REGISTRY } from '../bootstrap/appRegistry';
import { loadCase } from '../features/case-runtime';
import { appDefinition, InternetMessagingApp } from '../apps/internet-messaging';
import { normalizeEcommerceData } from '../apps/ecommerce/ecommerceData';
import { getAppDisplayName } from '../shared/branding';
import type { MessagingMessage } from '../apps/internet-messaging/types';

describe('US-003 Internet Messaging App Module Suite', () => {
  it('preserves app mounting, branding and configuration', () => {
    assert.ok(APP_REGISTRY['internet-messaging']);
    assert.equal(appDefinition.displayName, getAppDisplayName('internet-messaging'));
    assert.equal(appDefinition.themeColor, '#0088FF');
    assert.equal(appDefinition.notificationBadgeCount, 4, 'Registry default remains independent of case thread unread counts');
    assert.equal(appDefinition.isLocked, false);
    assert.ok(InternetMessagingApp);
  });

  it('keeps the alias ordinary while the dinner clue spans the alias thread and the wife alibi', () => {
    const data = readMessagingData(loadCase('case_01').appsData['internet-messaging']);
    assert.equal(data.threads!.length, 12);
    assert.equal(data.otherThreads!.some(thread => thread.threadId === 'thread_tuan'), false, 'Old alias thread is gone');
    const thread = data.threads!.find(thread => thread.contactName === 'Khoa BE');
    assert.ok(thread);
    assert.equal(thread.threadId, 'thread_khoa');
    assert.equal(thread.isPinned, false, 'Clues must not be promoted by pinning');
    assert.equal(thread.isDisguised, false, 'No visible disguise metadata reveals the alias');
    assert.equal(thread.realIdentity, '', 'Identity must be deduced across apps');
    assert.equal(thread.suspectId, '', 'No author metadata leaks the real identity');
    assert.equal(thread.unreadCount, 0, 'Unread counts never steer the player');
    assert.equal(thread.systemBanner, '', 'No disappearing-message shortcut');
    assert.equal(thread.messages.length, 13);
    assert.equal(thread.lastMessage, 'Đồ anh để quên em cất rồi nhé. Mai em mang lên công ty.');
    const reservation = thread.messages.find(message => message.id === 'msg_khoa_booking');
    assert.ok(reservation);
    assert.ok((reservation.timestamp || reservation.time).includes('15/10') && (reservation.timestamp || reservation.time).includes('17:40'));
    assert.equal(reservation.text, 'E book bàn 7h30 rồi nhé a. Tầng 2 như lần trước.');
    assert.equal(reservation.clueRefId, 'CLUE-ZOLA-01');
    const wife = data.threads!.find(thread => thread.threadId === 'thread_wife');
    assert.ok(wife);
    for (const [id, time] of [['msg_wife_1855', '18:55'], ['msg_wife_2046', '20:46']] as const) {
      const alibi: MessagingMessage | undefined = wife.messages.find(message => message.id === id);
      assert.ok(alibi);
      assert.ok((alibi.timestamp || alibi.time).includes('15/10') && (alibi.timestamp || alibi.time).includes(time));
      assert.equal(alibi.clueRefId, 'CLUE-ZOLA-09');
    }
    assert.equal(thread.messages.filter(message => message.type === 'location').length, 0);
    assert.ok(thread.messages.some(message => (message.timestamp || message.time).includes('14/10') && (message.timestamp || message.time).includes('21:12') && message.text.includes('tròn 1 tháng')));
    // The toast texts mirror the last message of each notification thread.
    const tuan = data.threads!.find(thread => thread.threadId === 'thread_tuan_dien')!;
    assert.equal(tuan.lastMessage, 'Sáng mai anh vào lắp sớm. Em yên tâm, không để bà ấy biết đâu.');
    assert.equal(tuan.suspectId, '');
  });

  it('uses a complete shared phone number for cross-app identity without directory spoilers', () => {
    const case1 = loadCase('case_01');
    const data = readMessagingData(case1.appsData['internet-messaging']);
    assert.equal(data.contacts!.length, 14);
    const alias = data.contacts!.find(contact => contact.name === 'Khoa BE');
    assert.ok(alias);
    assert.equal(alias.id, 'contact_10');
    assert.equal(alias.phone, '0988886677');
    assert.equal(alias.department, '');
    assert.equal(alias.note, '');
    assert.equal(alias.suspectName, '');
    assert.equal(data.contacts!.some(contact => contact.isBlocked || contact.name.includes('Hương')), false);
    const electrician = data.contacts!.find(contact => contact.id === 'contact_12');
    assert.equal(electrician?.name, 'Anh Tuấn Thợ Điện');
    assert.equal(electrician?.phone, '0912345801');
    assert.equal(data.contacts!.find(contact => contact.id === 'contact_0')?.phone, '0915220011');
    const order = normalizeEcommerceData(case1.appsData.ecommerce)!.orders.find(order => order.orderId === 'order_01');
    assert.equal(order?.recipientName, 'Nguyễn Thị Thu Hương');
    assert.equal(order?.recipientPhone, alias.phone);
  });

  it('supplies benign profile, cloud, timeline, secondary inbox and discovery content', () => {
    const data = readMessagingData(loadCase('case_01').appsData['internet-messaging']);
    assert.equal(data.currentUser?.name, 'Nguyễn Huy Hoàng');
    assert.equal(data.currentUser?.handle, 'hoang_tech88');
    assert.equal(data.cloudDocuments!.length, 1);
    const document = data.cloudDocuments![0];
    assert.equal(document.fileName, 'quy_uoc_hook.txt');
    assert.equal(document.fileType, 'text');
    assert.ok(document.textMessage?.includes('useCart'));
    assert.equal(document.clueRefId, '');
    assert.equal(data.otherThreads!.length, 1);
    assert.ok(data.otherThreads!.find(thread => thread.threadId === 'thread_carrier')!.messages[0].text.includes('gói cước'));
    assert.equal(data.timelinePosts!.length, 1);
    assert.ok(data.timelinePosts![0].content.includes('Chủ nhật'));
    assert.equal(data.discoverData?.promoBanner?.title, 'Thông tin tài khoản');
    assert.deepEqual(data.discoverData?.miniApps, []);
    assert.deepEqual(data.discoverData?.officialAccounts, []);
  });
});
