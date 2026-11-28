import { lazy } from 'react';
import { IoCompass } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('web-browser');
const LazyWebBrowserApp = lazy(() =>
  import('./WebBrowserApp').then(m => ({ default: m.WebBrowserApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['web-browser'],
  appId: 'web-browser',
  displayName: BRAND.brandName,
  icon: IoCompass,
  themeGradient: 'from-blue-600 to-indigo-700',
  themeColor: '#3F51B5',
  bottomBarColor: '#F2F2F7',
  notificationBadgeCount: 0,
  isLocked: false,
  component: LazyWebBrowserApp,
};
