import { lazy } from 'react';
import { IoDocumentText } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';

const LazyPersonalNotesApp = lazy(() =>
  import('./PersonalNotesApp').then(m => ({ default: m.PersonalNotesApp })),
);

export const appDefinition: AppDefinition = {
  dataKeys: ['personal-notes', 'husband_notes'],
  appId: 'personal-notes',
  displayName: 'Ghi chú',
  icon: IoDocumentText,
  themeGradient: 'from-amber-500 to-yellow-600',
  themeColor: '#1A73E8',
  bottomBarColor: '#FFF9E6',
  notificationBadgeCount: 0,
  isLocked: false,
  component: LazyPersonalNotesApp,
};
