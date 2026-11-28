import type { LevelContact } from '../../../../shared/contracts/case-schema';
import { resolveLevel } from '../../shared/resolveLevel';
import { husband01Master } from '../master';
import meta from './meta.json';
import contacts from './contacts.json';
import confrontationScript from './confrontation.json';
import messages from './apps/messages.json';
import phone from './apps/phone.json';
import photos from './apps/photos.json';

const level00 = resolveLevel(husband01Master, {
  meta,
  contacts: contacts as LevelContact[],
  confrontationScript,
  apps: {
    messages,
    phone,
    photos,
  },
});

export default level00;
