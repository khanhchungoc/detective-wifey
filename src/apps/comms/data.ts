import { record, records, text, number, optionalNumber } from '../../shared/data/read';
import type { AppCaseContext } from '../../shared/contracts/app-contracts';

export interface NarrativeRecord { id: string; suspectName: string; clueRefId: string }
export interface Contact extends NarrativeRecord { name: string; phone: string; secondaryPhone: string; notes: string; avatarIndex?: number }
export interface Call extends NarrativeRecord { name: string; phone: string; contactId: string; time: string; duration: string; direction: string; avatarIndex?: number }
export interface Message extends NarrativeRecord {
  body: string; time: string; outgoing: boolean; canceled: boolean; scheduledTime: string; canceledTime: string;
  reaction?: { type: string; time: string };
}
export interface Thread { id: string; name: string; contactId: string; phone: string; pinned: boolean; unread: boolean; time: string; messages: Message[]; avatarIndex?: number }
const value = (row: Record<string, unknown>, ...keys: string[]) => keys.map(key => text(row[key])).find(Boolean) ?? '';
const identity = (row: Record<string, unknown>, id: string): NarrativeRecord => ({ id, suspectName: text(row.suspectName), clueRefId: text(row.clueRefId) });

function parseThreadTimestamp(raw: string): number {
  if (!raw) return 0;
  const fullMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (fullMatch) {
    const day = parseInt(fullMatch[1], 10);
    const month = parseInt(fullMatch[2], 10) - 1;
    const year = parseInt(fullMatch[3], 10);
    const hour = parseInt(fullMatch[4], 10);
    const min = parseInt(fullMatch[5], 10);
    return new Date(year, month, day, hour, min).getTime();
  }
  const shortMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (shortMatch) {
    const day = parseInt(shortMatch[1], 10);
    const month = parseInt(shortMatch[2], 10) - 1;
    const hour = parseInt(shortMatch[3], 10);
    const min = parseInt(shortMatch[4], 10);
    return new Date(2026, month, day, hour, min).getTime();
  }
  const parsed = Date.parse(raw);
  return isNaN(parsed) ? 0 : parsed;
}

export function readAppData(input: unknown) {
  const data = record(input);
  const calls: Call[] = records(data.calls).map((row, i) => ({
    ...identity(row, value(row, 'callId', 'id') || `call-${i}`), name: value(row, 'contactName', 'name', 'phoneNumber'),
    phone: text(row.phoneNumber), contactId: text(row.contactId), time: value(row, 'timestamp', 'time'),
    direction: value(row, 'direction', 'type'), avatarIndex: optionalNumber(row.avatarIndex),
    duration: typeof row.durationSeconds === 'number' && row.durationSeconds >= 0
      ? `${Math.floor(row.durationSeconds / 60)} phút ${row.durationSeconds % 60} giây` : text(row.duration),
  }));
  const contacts: Contact[] = records(data.contacts).map((row, i) => ({
    ...identity(row, value(row, 'contactId', 'id') || `contact-${i}`), name: value(row, 'displayName', 'name', 'primaryPhone'),
    phone: value(row, 'primaryPhone', 'phoneNumber'), secondaryPhone: text(row.secondaryPhone), notes: value(row, 'notesField', 'notes'), avatarIndex: optionalNumber(row.avatarIndex),
  }));
  // Legacy call-only cases retain their known identities without invented numbers or notes.
  for (const call of calls) if (!contacts.some(c => c.id === call.contactId || (call.phone && c.phone === call.phone) || c.name === call.name)) {
    contacts.push({ id: call.contactId || call.id, name: call.name, phone: call.phone, secondaryPhone: '', notes: '', suspectName: call.suspectName, clueRefId: '' });
  }
  const threads: Thread[] = records(data.threads).map((row, i) => {
    const messages = records(row.messages).map((message, j) => ({
      ...identity(message, value(message, 'messageId', 'id') || `message-${i}-${j}`), body: value(message, 'bodyText', 'text'),
      time: value(message, 'timestamp', 'time'), outgoing: message.sender === 'outgoing', canceled: message.isCanceledDraft === true,
      scheduledTime: text(message.scheduledSendTimestamp), canceledTime: text(message.canceledAt),
      reaction: message.tapback && typeof message.tapback === 'object' ? { type: text(record(message.tapback).type), time: text(record(message.tapback).timestamp) } : undefined,
    }));
    const lastMsg = messages[messages.length - 1];
    const time = text(row.lastMessageTimestamp) || (lastMsg ? lastMsg.time : '');
    return {
      id: value(row, 'threadId', 'id') || `thread-${i}`, name: value(row, 'senderTitle', 'name'), contactId: text(row.contactId), phone: text(row.phoneNumber),
      pinned: row.isPinned === true, unread: number(row.unreadCount) > 0, time, avatarIndex: optionalNumber(row.avatarIndex),
      messages,
    };
  });
  for (const [i, sms] of records(data.sms).entries()) {
    const name = text(sms.sender); const existing = threads.find(t => t.name === name);
    const message: Message = { ...identity(sms, text(sms.id) || `sms-${i}`), body: text(sms.text), time: text(sms.time), outgoing: false, canceled: false, scheduledTime: '', canceledTime: '' };
    if (existing) existing.messages.push(message);
    else threads.push({ id: text(sms.threadId) || `legacy-${name}`, name, contactId: text(sms.contactId), phone: text(sms.phoneNumber), pinned: false, unread: false, time: text(sms.time), messages: [message] });
  }
  threads.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return parseThreadTimestamp(b.time) - parseThreadTimestamp(a.time);
  });
  return { calls, contacts, threads };
}

export function readCommunicationData(context: AppCaseContext) {
  const legacy = record(context.appsData.comms);
  const messages = record(context.appsData.messages);
  const data = readAppData({ ...legacy, ...record(context.appsData.phone), ...messages,
    // An authored thread list replaces legacy SMS filler, including explicit empty lists.
    ...(Array.isArray(messages.threads) ? { sms: [] } : {}),
  });
  return { ...data, threads: data.threads.map(thread => {
    const contact = data.contacts.find(contact => thread.contactId && contact.id === thread.contactId)
      ?? data.contacts.find(contact => thread.phone && phoneKey(contact.phone) === phoneKey(thread.phone));
    return contact ? { ...thread, name: contact.name, phone: contact.phone, contactId: contact.id, avatarIndex: contact.avatarIndex ?? thread.avatarIndex } : thread;
  }) };
}

const phoneKey = (value: string) => value.replace(/[\s().-]/g, '').replace(/^\+84/, '0');

export function findContact(call: Call, contacts: Contact[]): Contact {
  return contacts.find(c => (call.contactId && c.id === call.contactId) || (call.phone && c.phone === call.phone) || c.name === call.name)
    ?? { id: call.id, name: call.name || call.phone, phone: call.phone, secondaryPhone: '', notes: '', suspectName: call.suspectName, clueRefId: '' };
}
export function matchThread(contact: Contact, threads: Thread[]) {
  const byId = threads.find(thread => thread.contactId && thread.contactId === contact.id);
  if (byId) return byId;
  const byPhone = contact.phone ? threads.filter(thread => thread.phone && phoneKey(thread.phone) === phoneKey(contact.phone)) : [];
  if (byPhone.length === 1) return byPhone[0];
  const byName = threads.filter(thread => !thread.contactId && !thread.phone && contact.name && thread.name === contact.name);
  return byName.length === 1 ? byName[0] : undefined;
}
export function searchThreads(threads: Thread[], query: string) {
  const normalized = query.trim().toLocaleLowerCase('vi');
  return threads.filter(t => `${t.name} ${t.messages.map(m => m.body).join(' ')}`.toLocaleLowerCase('vi').includes(normalized));
}
