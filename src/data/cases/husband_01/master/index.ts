import type { CaseMaster, HusbandMaster, Org, Person } from '../../../../shared/contracts/case-schema';
import husband from './husband.json';
import people from './people.json';
import orgs from './orgs.json';

/** Master data for husband_01: shared by every level of this husband. SSOT for names and identity. */
export const husband01Master: CaseMaster = {
  husband: husband as HusbandMaster,
  people: people as Person[],
  orgs: orgs as Org[],
};
