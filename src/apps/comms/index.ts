import { lazy } from 'react';
import { IoCall, IoChatbubble } from 'react-icons/io5';
import type { AppDefinition } from '../../shared/contracts/app-contracts';

const LazyCommsApp = lazy(() => import('./CommsApp').then(m => ({ default: m.CommsApp })));
const LazyMessagesApp = lazy(() => import('./MessagesApp').then(m => ({ default: m.MessagesApp })));

export const phoneDefinition: AppDefinition = {
  appId: 'phone',
  dataKeys: ['comms', 'phone', 'messages'],
  displayName: 'Điện thoại',
  icon: IoCall,
  themeGradient: 'from-green-400 to-green-600',
  themeColor: '#FFFFFF',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyCommsApp,
};

export const appDefinition: AppDefinition = {
  ...phoneDefinition,
  appId: 'comms',
};

export const messagesDefinition: AppDefinition = {
  appId: 'messages',
  dataKeys: ['comms', 'phone', 'messages'],
  displayName: 'Tin nhắn',
  icon: IoChatbubble,
  themeGradient: 'from-green-400 to-green-600',
  themeColor: '#FFFFFF',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
  component: LazyMessagesApp,
};
