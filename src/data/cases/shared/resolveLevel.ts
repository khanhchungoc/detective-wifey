import type { CaseConfig, CaseMaster, HusbandMaster, LevelContact, Org, Person } from '../../../shared/contracts/case-schema';
import { registerAvatarNames } from '../../../shared/ui/avatarDirectory';

/**
 * Joins master data (people, orgs, husband), level contacts and the transactional app JSON
 * into the payload shapes the apps already read (`contactName`, `recipientName`, `beneficiary`, ...).
 * Transactional JSON holds IDs only; every display name is produced here.
 */
type Row = Record<string, unknown>;

export interface LevelParts {
  meta: Row;
  contacts: LevelContact[];
  apps: Record<string, unknown>;
  confrontationScript?: unknown;
}

interface ResolvedContact {
  id: string;
  name: string;
  phone?: string;
  avatarIndex?: number;
}

interface Context {
  master: CaseMaster;
  contact(id: unknown): ResolvedContact;
  person(id: unknown): Person;
  org(id: unknown): Org;
}

const rows = (value: unknown): Row[] => (Array.isArray(value) ? (value as Row[]) : []);
const mapRows = (value: unknown, map: (row: Row) => Row) => rows(value).map(map);

/** Bank statements print names as upper-case ASCII. */
export const upperAscii = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();

const without = (row: Row, ...keys: string[]): Row => Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key)));
const defined = (row: Row): Row => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));

function buildContext(master: CaseMaster, contacts: LevelContact[]): Context {
  const people = new Map(master.people.map((person) => [person.personId, person]));
  const orgs = new Map(master.orgs.map((org) => [org.orgId, org]));
  const byId = new Map(contacts.map((contact) => [contact.contactId, contact]));
  const person = (id: unknown): Person => {
    const found = people.get(String(id));
    if (!found) throw new Error(`Unknown personId "${String(id)}"`);
    return found;
  };
  const org = (id: unknown): Org => {
    const found = orgs.get(String(id));
    if (!found) throw new Error(`Unknown orgId "${String(id)}"`);
    return found;
  };
  const contact = (id: unknown): ResolvedContact => {
    const found = byId.get(String(id));
    if (!found) throw new Error(`Unknown contactId "${String(id)}"`);
    const owner = found.personId ? person(found.personId) : undefined;
    if (found.orgId) org(found.orgId);
    return {
      id: found.contactId,
      name: found.savedName,
      phone: found.phone ?? owner?.phones?.[0],
      avatarIndex: found.avatarIndex ?? owner?.avatarIndex,
    };
  };
  return { master, contact, person, org };
}

/** A person ref may also be the husband (`husbandId`). */
function personIdentity(ctx: Context, id: unknown): { name: string; phone?: string } {
  const { husband } = ctx.master;
  if (id === husband.husbandId) return { name: husband.fullName, phone: husband.phone };
  const person = ctx.person(id);
  return { name: person.legalName, phone: person.phones?.[0] };
}

function phoneApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    calls: mapRows(data.calls, (call) => {
      const contact = ctx.contact(call.contactId);
      return defined({ ...call, contactName: contact.name, phoneNumber: contact.phone, avatarIndex: contact.avatarIndex });
    }),
    contacts: mapRows(data.contacts, (row) => {
      const contact = ctx.contact(row.contactId);
      return defined({ ...row, displayName: contact.name, primaryPhone: contact.phone, avatarIndex: contact.avatarIndex });
    }),
  };
}

function messagesApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    threads: mapRows(data.threads, (thread) => {
      const contact = ctx.contact(thread.contactId);
      return defined({ ...thread, senderTitle: contact.name, phoneNumber: contact.phone, avatarIndex: contact.avatarIndex });
    }),
  };
}

function messagingApp(data: Row, ctx: Context): Row {
  const { husband } = ctx.master;
  const thread = (row: Row): Row => {
    if (row.contactId === undefined) return row;
    const contact = ctx.contact(row.contactId);
    return defined({ ...without(row, 'contactId'), contactName: contact.name, avatarIndex: contact.avatarIndex });
  };
  return {
    ...data,
    currentUser: { name: husband.fullName, handle: husband.handle, avatarInitials: husband.initials, statusText: '' },
    threads: mapRows(data.threads, thread),
    otherThreads: mapRows(data.otherThreads, thread),
    contacts: mapRows(data.contacts, (row) => {
      const contact = ctx.contact(row.contactId);
      return defined({
        ...without(row, 'contactId'),
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        section: contact.name.charAt(0).toLocaleUpperCase('vi'),
        avatarIndex: contact.avatarIndex,
      });
    }),
    timelinePosts: mapRows(data.timelinePosts, (post) => {
      const contact = ctx.contact(post.authorContactId);
      return { ...without(post, 'authorContactId'), author: contact.name, avatarInitials: contact.name.charAt(0).toLocaleUpperCase('vi') };
    }),
  };
}

function ecommerceApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    orders: mapRows(data.orders, (order) => {
      const recipient = personIdentity(ctx, order.recipientPersonId);
      return defined({
        ...without(order, 'recipientPersonId', 'shopOrgId'),
        shopName: ctx.org(order.shopOrgId).name,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        suspectName: order.suspectId ? recipient.name : undefined,
      });
    }),
    chats: mapRows(data.chats, (chat) => ({ ...without(chat, 'shopOrgId'), shopName: ctx.org(chat.shopOrgId).name })),
  };
}

function bankingApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    transactions: mapRows(data.transactions, (tx) => {
      if (tx.counterpartyPersonId !== undefined) {
        return { ...without(tx, 'counterpartyPersonId'), beneficiary: upperAscii(personIdentity(ctx, tx.counterpartyPersonId).name) };
      }
      if (tx.counterpartyOrgId !== undefined) {
        const org = ctx.org(tx.counterpartyOrgId);
        return { ...without(tx, 'counterpartyOrgId'), beneficiary: upperAscii(org.legalName ?? org.name) };
      }
      return tx;
    }),
  };
}

function emailApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    emails: mapRows(data.emails, (email) =>
      email.senderContactId === undefined ? email : { ...without(email, 'senderContactId'), sender: ctx.contact(email.senderContactId).name },
    ),
  };
}

function professionalNetworkApp(data: Row, ctx: Context): Row {
  return {
    ...data,
    posts: mapRows(data.posts, (post) => {
      if (post.authorContactId !== undefined) return { ...without(post, 'authorContactId'), author: ctx.contact(post.authorContactId).name };
      if (post.authorOrgId !== undefined) return { ...without(post, 'authorOrgId'), author: ctx.org(post.authorOrgId).name };
      return post;
    }),
  };
}

function rideHailingApp(data: Row, ctx: Context): Row {
  const place = (trip: Row, key: 'pickup' | 'dropoff', refKey: string): Row =>
    trip[refKey] === undefined ? trip : { ...without(trip, refKey), [key]: ctx.org(trip[refKey]).name };
  return { ...data, trips: mapRows(data.trips, (trip) => place(place(trip, 'pickup', 'pickupOrgId'), 'dropoff', 'dropoffOrgId')) };
}

const APP_RESOLVERS: Record<string, (data: Row, ctx: Context) => Row> = {
  phone: phoneApp,
  messages: messagesApp,
  'internet-messaging': messagingApp,
  ecommerce: ecommerceApp,
  banking: bankingApp,
  email: emailApp,
  'professional-network': professionalNetworkApp,
  'ride-hailing': rideHailingApp,
};

function suspectPool(meta: Row, ctx: Context): Row[] {
  return mapRows(meta.suspectPool, (suspect) => {
    const person = ctx.person(suspect.personId);
    const contact = ctx.contact(suspect.contactId);
    const displayName = suspect.displayTitle ? `${person.legalName} · ${String(suspect.displayTitle)}` : contact.name;
    return { ...without(suspect, 'personId', 'contactId', 'displayTitle'), displayName };
  });
}

const TOKEN = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** Replaces `{{husband.<field>}}` in every string. An unknown token fails loudly. */
export function substituteTokens<T>(value: T, husband: HusbandMaster): T {
  if (typeof value === 'string') {
    return value.replace(TOKEN, (_match, path: string) => {
      const [scope, field] = path.split('.');
      const resolved = scope === 'husband' ? (husband as unknown as Record<string, unknown>)[field] : undefined;
      if (typeof resolved !== 'string' && typeof resolved !== 'number') throw new Error(`Unknown token "{{${path}}}"`);
      return String(resolved);
    }) as T;
  }
  if (Array.isArray(value)) return value.map((item) => substituteTokens(item, husband)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, substituteTokens(item, husband)])) as T;
  }
  return value;
}

/** Name to photo-slot pairs for UI that only holds a display name. */
function avatarNames(ctx: Context, contacts: LevelContact[], pool: Row[]): Array<[string, number]> {
  const entries: Array<[string, number]> = [];
  for (const person of ctx.master.people) if (person.avatarIndex !== undefined) entries.push([person.legalName, person.avatarIndex]);
  for (const contact of contacts) {
    const resolved = ctx.contact(contact.contactId);
    if (resolved.avatarIndex !== undefined) entries.push([resolved.name, resolved.avatarIndex]);
  }
  for (const suspect of pool) {
    const person = ctx.person(suspect.personId);
    if (suspect.displayTitle && person.avatarIndex !== undefined) entries.push([`${person.legalName} · ${String(suspect.displayTitle)}`, person.avatarIndex]);
  }
  return entries;
}

export function resolveLevel(master: CaseMaster, parts: LevelParts): CaseConfig {
  const ctx = buildContext(master, parts.contacts);
  const appsData = Object.fromEntries(
    Object.entries(parts.apps).map(([appId, data]) => {
      const resolver = APP_RESOLVERS[appId];
      return [appId, resolver ? resolver(data as Row, ctx) : data];
    }),
  );
  const level = {
    ...without(parts.meta, 'suspectPool'),
    husband: master.husband,
    suspectPool: suspectPool(parts.meta, ctx),
    confrontationScript: parts.confrontationScript,
    appsData,
  };
  registerAvatarNames(avatarNames(ctx, parts.contacts, rows(parts.meta.suspectPool)));
  return substituteTokens(level, master.husband) as unknown as CaseConfig;
}
