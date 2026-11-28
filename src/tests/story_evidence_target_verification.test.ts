import { readMessagingData } from '../apps/internet-messaging/data';
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { loadCase } from '../features/case-runtime';

describe('Story JSON Data Ingestion & Evidence Long-Press Target Suite', () => {
  it('confirms all chat content is 100% loaded from story JSON and maps to evidence targets', () => {
    const case1 = loadCase('case_01');
    const zolaData = readMessagingData(case1.appsData['internet-messaging']);

    assert.ok(zolaData, 'internet-messaging data must exist in case_01');
    const threads = [...zolaData.threads!, ...zolaData.otherThreads!];
    assert.ok(threads.length > 0, 'Threads must exist in story JSON');
    const at = (message: { timestamp?: string; time?: string }) => message.timestamp || message.time || '';

    // The disguised culprit is saved as "Khoa BE"; the booking is the dinner clue.
    const khoa = threads.find((t) => t.threadId === 'thread_003');
    assert.ok(khoa, 'Khoa BE thread must exist');
    assert.equal(khoa.contactName, 'Khoa BE');
    assert.ok(khoa.messages.length >= 13, 'Must contain full message sequence');
    const booking = khoa.messages.find((m) => m.id === 'msg_003_0014');
    assert.ok(booking);
    assert.ok(at(booking).includes('15/10') && at(booking).includes('17:40'));
    assert.ok(booking.text.includes('7h30') && booking.text.includes('chỗ hôm trước'), 'Booking must keep its time and repeat venue');
    assert.equal(booking.clueRefId, 'CLUE-ZOLA-01');
    assert.ok(!booking.text.toLowerCase().includes('váy'), 'Chat never names the dress');
    assert.ok(khoa.messages.every((m) => !m.locationData), 'No location shortcut survives');
    assert.equal(khoa.messages[khoa.messages.length - 1].text, 'Vâng ạ, e gửi file từ sáng.', 'The alias thread ends on ordinary work chatter');
    assert.ok(khoa.messages.every((m) => !/quán|áo khoác|Vừa lắm/.test(m.text)), 'No post-dinner confession survives');

    // The real electrician is an innocent decoy whose notification is explained by other chats.
    const tuan = threads.find((t) => t.threadId === 'thread_004');
    assert.ok(tuan, 'Anh Tuấn Thợ Điện thread must exist');
    assert.equal(tuan.contactName, 'Anh Tuấn Thợ Điện');
    const tuanLast = tuan.messages[tuan.messages.length - 1];
    assert.ok(at(tuanLast).includes('22:58'));
    assert.equal(tuanLast.text, 'Sáng mai anh vào lắp sớm. Em yên tâm, không để bà ấy biết đâu.');
    assert.ok(tuan.messages.some((m) => at(m).includes('13/10') && m.text.includes('bình nóng lạnh nhà mẹ em')));
    const family = threads.find((t) => t.threadId === 'thread_010')!;
    assert.ok(family.messages.some((m) => at(m).includes('13/10') && m.text.includes('Bình nóng lạnh nhà mình hỏng')));

    // Alibi: the cancelled sprint (17:30) vs the two false reports to the wife (18:55 and 20:46).
    const dev = threads.find((t) => t.threadId === 'thread_002')!;
    const cancel = dev.messages.find((m) => m.id === 'msg_002_0012')!;
    assert.ok(cancel.text.includes('họp sprint tối nay dời sang T2'));
    assert.equal(cancel.senderContactId, 'contact_004', 'Group sender resolves to the saved contact (Nam Dev)');
    assert.ok(!cancel.text.startsWith('Nam:'), 'Group text carries no sender prefix');
    const wife = threads.find((t) => t.threadId === 'thread_005')!;
    const early = wife.messages.find((m) => m.id === 'msg_005_0079')!;
    const late = wife.messages.find((m) => m.id === 'msg_005_0082')!;
    assert.ok(at(early).includes('18:55') && early.text.includes('họp sprint với cả team'));
    assert.ok(at(late).includes('20:46') && late.text.includes('sếp Tuấn Anh đang chốt nốt'));
    assert.equal(early.clueRefId, 'CLUE-ZOLA-09');
    assert.equal(late.clueRefId, 'CLUE-ZOLA-09');

    // Company group: the culprit posts as the saved contact; HR names her in a reply.
    const company = threads.find((t) => t.threadId === 'thread_012')!;
    assert.equal(company.isGroup, true);
    assert.equal(company.pinnedMessageId, 'msg_012_0001');
    const post = company.messages.find((m) => m.id === 'msg_012_0004')!;
    const thanks = company.messages.find((m) => m.id === 'msg_012_0005')!;
    assert.equal(post.senderContactId, 'contact_011');
    assert.equal(thanks.replyToId, post.id);
    assert.ok(thanks.text.includes('Cảm ơn Hương'));
    assert.ok(company.messages.find((m) => m.id === 'msg_012_0001')!.text.includes('Nguyễn Thị Thu Hương - Marketing Executive'));
    assert.equal(company.messages.some((m) => m.text.includes('Khoa BE')), false, 'Real name never appears next to the alias');

    console.log('[PASS] All chat contents confirmed to be 100% loaded from story JSON (src/data/cases/husband_01/level_01.json).');
  });
});
