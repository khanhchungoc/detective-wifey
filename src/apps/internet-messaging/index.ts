import { lazy } from 'react';
import { IoChatbubbleOutline } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';
import messagingIcon from './assets/messaging-icon.svg';

const BRAND = getAppBrand('internet-messaging');
const LazyInternetMessagingApp = lazy(() =>
  import('./InternetMessagingApp').then(m => ({ default: m.InternetMessagingApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['internet-messaging'],
  appId: 'internet-messaging',
  displayName: BRAND.brandName,
  icon: IoChatbubbleOutline,
  iconAsset: messagingIcon,
  themeGradient: 'from-blue-500 to-sky-600',
  themeColor: '#0088FF',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyInternetMessagingApp,
};
