import { lazy } from 'react';
import { IoMail } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('email');
const LazyEmailApp = lazy(() => import('./EmailApp').then(m => ({ default: m.EmailApp })));

export const appDefinition: AppDefinition = {
  dataKeys: ['email'],
  appId: 'email',
  displayName: BRAND.brandName,
  icon: IoMail,
  themeGradient: 'from-red-500 to-rose-600',
  themeColor: '#EA4335',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyEmailApp,
};
