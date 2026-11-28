import { lazy } from 'react';
import { IoBagHandle } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';
import ecommerceIcon from './assets/ecommerce-icon.svg';

const BRAND = getAppBrand('ecommerce');
const LazyEcommerceApp = lazy(() => import('./EcommerceApp').then(m => ({ default: m.EcommerceApp })));

export const appDefinition: AppDefinition = {
  dataKeys: ['ecommerce'],
  appId: 'ecommerce',
  displayName: BRAND.brandName,
  icon: IoBagHandle,
  iconAsset: ecommerceIcon,
  themeGradient: 'from-orange-500 to-amber-600',
  themeColor: '#EE4D2D',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyEcommerceApp,
};
