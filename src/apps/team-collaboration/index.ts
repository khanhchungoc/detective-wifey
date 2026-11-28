import { lazy } from 'react';
import { IoPeople } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('team-collaboration');
const LazyTeamCollaborationApp = lazy(() =>
  import('./TeamCollaborationApp').then(m => ({ default: m.TeamCollaborationApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['team-collaboration'],
  appId: 'team-collaboration',
  displayName: BRAND.brandName,
  icon: IoPeople,
  themeGradient: 'from-indigo-600 to-purple-700',
  themeColor: '#464EB8',
  bottomBarColor: '#F5F5F5',
  isLocked: false,
  component: LazyTeamCollaborationApp,
};
