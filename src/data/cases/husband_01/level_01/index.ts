import type { LevelContact } from '../../../../shared/contracts/case-schema';
import { resolveLevel } from '../../shared/resolveLevel';
import { husband01Master } from '../master';
import meta from './meta.json';
import contacts from './contacts.json';
import confrontationScript from './confrontation.json';
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

const level01 = resolveLevel(husband01Master, {
  meta,
  contacts: contacts as LevelContact[],
  confrontationScript,
  apps: {
    'internet-messaging': internetMessaging,
    banking,
    ecommerce,
    phone,
    messages,
    'ride-hailing': rideHailing,
    'web-browser': webBrowser,
    photos,
    'personal-notes': personalNotes,
    email,
    'professional-network': professionalNetwork,
    'team-collaboration': teamCollaboration,
  },
});

export default level01;
