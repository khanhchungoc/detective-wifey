import { lazy } from 'react';
import { IoImages } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';
import photosIcon from './assets/photos-icon.svg';

const LazyPhotosApp = lazy(() => import('./PhotosApp').then(m => ({ default: m.PhotosApp })));

export const appDefinition: AppDefinition = {
  appId: 'photos',
  dataKeys: ['photos'],
  displayName: 'Photos',
  icon: IoImages,
  iconAsset: photosIcon,
  themeGradient: 'from-amber-400 via-rose-500 to-indigo-600',
  themeColor: '#000000',
  bottomBarColor: '#000000',
  isLocked: false,
  component: LazyPhotosApp,
};
