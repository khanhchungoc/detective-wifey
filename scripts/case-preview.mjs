// Prints a level with every ID resolved to its current name. Usage: npm run case:preview [-- husband_01/level_01]
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] ?? 'husband_01/level_01';
const { default: level } = await import(pathToFileURL(path.join(root, 'src/data/cases', target, 'index.ts')).href);
const apps = level.appsData;
const section = (title, rows) => {
  console.log(`\n== ${title} (${rows.length})`);
  if (rows.length) console.table(rows);
};

console.log(`${level.caseId} | husband ${level.husband.husbandId} = ${level.husband.fullName} (${level.husband.shortName})`);
section('suspects', level.suspectPool.map((s) => ({ suspectId: s.suspectId, displayName: s.displayName })));
section('contacts', apps.phone.contacts.map((c) => ({ contactId: c.contactId, name: c.displayName, phone: c.primaryPhone, avatar: c.avatarIndex })));
section('calls', apps.phone.calls.map((c) => ({ callId: c.callId, contact: `${c.contactId} ${c.contactName}`, when: c.timestamp, dir: c.direction, sec: c.durationSeconds })));
section('sms', apps.messages.threads.map((t) => ({ threadId: t.threadId, contact: `${t.contactId} ${t.senderTitle}`, phone: t.phoneNumber, messages: t.messages.length })));
const chats = [...apps['internet-messaging'].threads, ...apps['internet-messaging'].otherThreads];
section('chat threads', chats.map((t) => ({ threadId: t.threadId, title: t.contactName, group: Boolean(t.isGroup), messages: t.messages.length })));
section('orders', apps.ecommerce.orders.map((o) => ({ orderId: o.orderId, code: o.displayCode, shop: o.shopName, recipient: o.recipientName, total: o.totalAmount })));
section('bank', apps.banking.transactions.map((t) => ({ id: t.id, when: `${t.date} ${t.time}`, amount: t.amount, beneficiary: t.beneficiary, memo: t.memo })));
