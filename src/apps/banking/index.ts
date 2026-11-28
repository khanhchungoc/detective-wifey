import { lazy } from 'react';
import { IoCard } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';
import bankingLogo from './assets/banking-logo.svg';

const BRAND = getAppBrand('banking');
const LazyBankingApp = lazy(() => import('./BankingApp').then(m => ({ default: m.BankingApp })));

export const appDefinition: AppDefinition = {
  dataKeys: ['banking'],
  appId: 'banking',
  displayName: BRAND.brandName,
  icon: IoCard,
  iconAsset: bankingLogo,
  themeGradient: 'from-[#ED1C24] to-[#B71C1C]',
  themeColor: '#ED1C24',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyBankingApp,
};
