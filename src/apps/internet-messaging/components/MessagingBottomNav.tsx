import React from 'react';
import {
  IoChatbubbleOutline,
  IoGridOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoTimeOutline,
} from 'react-icons/io5';

export type MessagingTab = 'messages' | 'contacts' | 'discover' | 'timeline' | 'profile';
export type ZolaTab = MessagingTab;

interface MessagingBottomNavProps {
  activeTab: MessagingTab;
  onTabChange: (tab: MessagingTab) => void;
  messageBadgeCount?: number;
}

export const MessagingBottomNav: React.FC<MessagingBottomNavProps> = ({
  activeTab,
  onTabChange,
  messageBadgeCount = 4,
}) => {
  return (
    <nav data-zola-bottom-nav className="app-bottom-nav bg-white border-t border-[#E5E7EB] flex items-center justify-around px-1 z-30 select-none">
      {/* 1. Tin nhắn */}
      <button
        type="button"
        onClick={() => onTabChange('messages')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeTab === 'messages' ? 'text-[#0088FF]' : 'text-[#595C60] hover:text-[#0F172A]'
        }`}
        aria-label="Tin nhắn"
      >
        <div className="relative">
          <IoChatbubbleOutline />
          {messageBadgeCount > 0 && (
            <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D70015] text-white text-ios-caption-2 font-bold flex items-center justify-center shadow-xs">
              {messageBadgeCount}
            </span>
          )}
        </div>
        <span className="text-ios-caption-1 font-medium leading-none">Tin nhắn</span>
      </button>

      {/* 2. Danh bạ */}
      <button
        type="button"
        onClick={() => onTabChange('contacts')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeTab === 'contacts' ? 'text-[#0088FF]' : 'text-[#595C60] hover:text-[#0F172A]'
        }`}
        aria-label="Danh bạ"
      >
        <div className="relative">
          <IoPeopleOutline />
        </div>
        <span className="text-ios-caption-1 font-medium leading-none">Danh bạ</span>
      </button>

      {/* 3. Khám phá */}
      <button
        type="button"
        onClick={() => onTabChange('discover')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeTab === 'discover' ? 'text-[#0088FF]' : 'text-[#595C60] hover:text-[#0F172A]'
        }`}
        aria-label="Khám phá"
      >
        <div className="relative">
          <IoGridOutline />
          <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D70015]" />
        </div>
        <span className="text-ios-caption-1 font-medium leading-none">Khám phá</span>
      </button>

      {/* 4. Nhật ký */}
      <button
        type="button"
        onClick={() => onTabChange('timeline')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeTab === 'timeline' ? 'text-[#0088FF]' : 'text-[#595C60] hover:text-[#0F172A]'
        }`}
        aria-label="Nhật ký"
      >
        <div className="relative">
          <IoTimeOutline />
        </div>
        <span className="text-ios-caption-1 font-medium leading-none">Nhật ký</span>
      </button>

      {/* 5. Cá nhân */}
      <button
        type="button"
        onClick={() => onTabChange('profile')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeTab === 'profile' ? 'text-[#0088FF]' : 'text-[#595C60] hover:text-[#0F172A]'
        }`}
        aria-label="Cá nhân"
      >
        <div className="relative">
          <IoPersonOutline />
          <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D70015]" />
        </div>
        <span className="text-ios-caption-1 font-medium leading-none">Cá nhân</span>
      </button>
    </nav>
  );
};

export const ZolaBottomNav = MessagingBottomNav;
