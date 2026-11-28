import { lazy } from 'react';
import { IoCar } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('ride-hailing');
const LazyRideHailingApp = lazy(() =>
  import('./RideHailingApp').then(m => ({ default: m.RideHailingApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['ride-hailing'],
  appId: 'ride-hailing',
  displayName: BRAND.brandName,
  icon: IoCar,
  themeGradient: 'from-emerald-500 to-green-600',
  themeColor: '#00B14F',
  bottomBarColor: '#F3F4F6',
  isLocked: false,
  component: LazyRideHailingApp,
};
