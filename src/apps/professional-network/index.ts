import { lazy } from 'react';
import { IoBriefcase } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('professional-network');
const LazyProfessionalNetworkApp = lazy(() =>
  import('./ProfessionalNetworkApp').then(m => ({ default: m.ProfessionalNetworkApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['professional-network'],
  appId: 'professional-network',
  displayName: BRAND.brandName,
  icon: IoBriefcase,
  themeGradient: 'from-blue-700 to-indigo-800',
  themeColor: '#0A66C2',
  bottomBarColor: '#F3F2F0',
  isLocked: false,
  component: LazyProfessionalNetworkApp,
};
