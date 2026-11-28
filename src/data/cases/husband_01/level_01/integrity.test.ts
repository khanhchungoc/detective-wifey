import { describe, expect, it } from 'vitest';
import { husband01Master } from '../master';
import { substituteTokens } from '../../shared/resolveLevel';
import level01 from './index';
import contacts from './contacts.json';
import meta from './meta.json';
import confrontation from './confrontation.json';
import internetMessaging from './apps/internet-messaging.json';
import banking from './apps/banking.json';
import ecommerce from './apps/ecommerce.json';
import phone from './apps/phone.json';
import messages from './apps/messages.json';
import rideHailing from './apps/ride-hailing.json';
import webBrowser from './apps/web-browser.json';
import photos from './apps/photos.json';
import personalNotes from './apps/personal-notes.json';
import email from './apps/email.json';
import professionalNetwork from './apps/professional-network.json';
import teamCollaboration from './apps/team-collaboration.json';

// Raw transactional JSON: every cross-record reference must resolve to master or level contact data.
const rawLevel = {
  meta, confrontation, internetMessaging, banking, ecommerce, phone, messages, rideHailing,
  webBrowser, photos, personalNotes, email, professionalNetwork, teamCollaboration,
};

const { husband, people, orgs } = husband01Master;
const contactIds = new Set(contacts.map((contact) => contact.contactId));
const personIds = new Set([husband.husbandId, ...people.map((person) => person.personId)]);
const orgIds = new Set(orgs.map((org) => org.orgId));

type Ref = { path: string; key: string; value: string };

function collectRefs(value: unknown, path = '$'): Ref[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => collectRefs(item, `${path}[${index}]`));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => {
    const here = `${path}.${key}`;
    if (typeof item === 'string' && /(ContactId|PersonId|OrgId)$|^(contactId|personId|orgId)$/.test(key)) return [{ path: here, key, value: item }];
    if (Array.isArray(item) && key === 'memberContactIds') return item.map((id, index) => ({ path: `${here}[${index}]`, key, value: String(id) }));
    return collectRefs(item, here);
  });
}

const kindOf = (key: string) => (/ContactId$/.test(key) || key === 'contactId' ? 'contact' : /OrgId$|^orgId$/.test(key) ? 'org' : 'person');
const refs = collectRefs(rawLevel);

function keysDeep(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysDeep);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => [key, ...keysDeep(item)]);
}

describe('level_01 referential integrity', () => {
  it('finds references to check', () => {
    expect(refs.length).toBeGreaterThan(100);
  });

  it('resolves every contact, person and org reference', () => {
    const broken = refs.filter(({ key, value }) => {
      const kind = kindOf(key);
      return !(kind === 'contact' ? contactIds : kind === 'org' ? orgIds : personIds).has(value);
    });
    expect(broken).toEqual([]);
  });

  it('points every level contact at a person or org that exists', () => {
    for (const contact of contacts) {
      expect(Boolean(contact.personId) !== Boolean((contact as { orgId?: string }).orgId), contact.contactId).toBe(true);
      if (contact.personId) expect(personIds.has(contact.personId), contact.contactId).toBe(true);
      const orgId = (contact as { orgId?: string }).orgId;
      if (orgId) expect(orgIds.has(orgId), contact.contactId).toBe(true);
    }
  });

  it('has no orphan contacts (every contact is used by some record)', () => {
    const used = new Set(refs.filter(({ key }) => kindOf(key) === 'contact').map(({ value }) => value));
    expect(contacts.map((contact) => contact.contactId).filter((id) => !used.has(id))).toEqual([]);
  });

  it('resolves every suspect to a person and a contact of that person', () => {
    for (const suspect of meta.suspectPool) {
      expect(personIds.has(suspect.personId), suspect.suspectId).toBe(true);
      expect(contacts.find((contact) => contact.contactId === suspect.contactId)?.personId, suspect.suspectId).toBe(suspect.personId);
    }
    expect(level01.suspectPool.map((suspect) => suspect.suspectId)).toEqual(meta.suspectPool.map((suspect) => suspect.suspectId));
    expect(level01.suspectPool.every((suspect) => suspect.displayName.length > 0)).toBe(true);
  });

  it('points the wife and the husband at existing records', () => {
    expect(personIds.has(husband.wifePersonId)).toBe(true);
    expect(people.find((person) => person.personId === husband.wifePersonId)?.role).toBe('wife');
  });
});

describe('level_01 resolved payload guards', () => {
  const resolvedText = JSON.stringify(level01);

  it('leaves no unresolved {{tokens}}', () => {
    expect(resolvedText).not.toMatch(/\{\{/);
  });

  it('fails loudly on an unknown token', () => {
    expect(() => substituteTokens('x {{husband.nope}}', husband)).toThrow(/Unknown token/);
    expect(() => substituteTokens('x {{wife.shortName}}', husband)).toThrow(/Unknown token/);
    expect(substituteTokens('x {{husband.shortName}}', husband)).toBe(`x ${husband.shortName}`);
  });

  it('never leaks author-only roles or reference fields into app payloads', () => {
    const keys = new Set(keysDeep(level01.appsData));
    for (const forbidden of ['role', 'personId', 'orgId', 'recipientPersonId', 'shopOrgId', 'counterpartyPersonId', 'counterpartyOrgId', 'authorContactId', 'authorOrgId']) {
      expect(keys.has(forbidden), forbidden).toBe(false);
    }
  });

  it('keeps the husband identity out of raw level JSON (it comes from master via tokens)', () => {
    const rawText = JSON.stringify(rawLevel);
    for (const field of ['shortName', 'fullName', 'fullNameAscii', 'handle'] as const) {
      expect(rawText, field).not.toContain(husband[field]);
    }
  });

  it('shows player-facing order codes, never internal order ids, in order notifications', () => {
    const codes = ecommerce.orders.map((order) => order.displayCode);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((code) => /^\d{6}[0-9A-Z]{6}$/.test(code))).toBe(true);
    for (const notification of ecommerce.notifications) expect(notification.snippet).not.toMatch(/order_\d+/);
  });
});
