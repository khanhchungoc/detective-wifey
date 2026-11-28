import React from 'react';
import {
  IoChatbubbleEllipses,
  IoCard,
  IoBagHandle,
  IoCall,
  IoChatbubble,
  IoImages,
  IoCar,
  IoCompass,
  IoDocumentText,
  IoMail,
  IoNotifications,
  IoClose,
} from 'react-icons/io5';
import type { NotificationToast } from '../contracts/case-schema';
import { getAppDisplayName } from '../branding';

interface NotificationBannerProps {
  toast: NotificationToast | null;
  onClose: () => void;
  onClick: (toast: NotificationToast) => void;
}

const APP_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; gradient: string }
> = {
  'internet-messaging': { icon: IoChatbubbleEllipses, gradient: 'from-[#0088FF] to-[#0066CC]' },
  'banking': { icon: IoCard, gradient: 'from-[#ED1C24] to-[#B71C1C]' },
  'ecommerce': { icon: IoBagHandle, gradient: 'from-[#EE4D2D] to-[#D03B1E]' },
  'phone': { icon: IoCall, gradient: 'from-[#34C759] to-[#28A745]' },
  'comms': { icon: IoCall, gradient: 'from-[#34C759] to-[#28A745]' },
  'messages': { icon: IoChatbubble, gradient: 'from-[#34C759] to-[#28A745]' },
  'photos': { icon: IoImages, gradient: 'from-amber-400 via-rose-500 to-indigo-600' },
  'ride-hailing': { icon: IoCar, gradient: 'from-[#00B14F] to-[#00873D]' },
  'web-browser': { icon: IoCompass, gradient: 'from-[#007AFF] to-[#0051A8]' },
  'personal-notes': { icon: IoDocumentText, gradient: 'from-amber-400 to-amber-500' },
  'email': { icon: IoMail, gradient: 'from-[#EA4335] to-[#C5221F]' },
  'professional-network': { icon: IoCard, gradient: 'from-[#0A66C2] to-[#004182]' },
  'team-collaboration': { icon: IoChatbubbleEllipses, gradient: 'from-[#464EB8] to-[#3B3E98]' },
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  toast,
  onClose,
  onClick,
}) => {
  if (!toast) return null;

  const appMeta = APP_META[toast.sourceAppId] || {
    icon: IoNotifications,
    gradient: 'from-slate-700 to-slate-900',
  };
  const IconComponent = appMeta.icon;

  let appName = getAppDisplayName(toast.sourceAppId);
  let timeText = 'vừa xong';

  if (toast.senderTitle?.includes('•')) {
    const parts = toast.senderTitle.split('•').map((p) => p.trim());
    if (parts[0]) appName = parts[0];
    if (parts[1]) timeText = parts[1];
  }

  let senderName = toast.senderTitle;
  let messageText = toast.snippetBody;

  if (toast.snippetBody?.includes(': ')) {
    const colonIndex = toast.snippetBody.indexOf(': ');
    senderName = toast.snippetBody.slice(0, colonIndex).trim();
    messageText = toast.snippetBody.slice(colonIndex + 2).trim();
  }

  return (
    <div
      onClick={() => onClick(toast)}
      className="ios-notification absolute left-3.5 right-3.5 z-[70] max-w-[440px] mx-auto glass-toast-light rounded-[22px] p-3 cursor-pointer transition-transform active:scale-[0.98] select-none text-slate-900 animate-slideDown flex items-start gap-3"
      style={{ top: 'calc(var(--phone-system-top, 59px) + 8px)' }}
      role="alert"
    >
      {/* iOS App Squircle Icon */}
      <div
        className={`w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br ${appMeta.gradient} shadow-md flex items-center justify-center text-white shrink-0 mt-0.5`}
      >
        <IconComponent className="w-5 h-5 text-white" />
      </div>

      {/* Notification Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 text-ios-caption-2 uppercase font-semibold text-slate-600 tracking-wider">
            <span>{appName}</span>
            <span className="text-slate-400 font-normal">•</span>
            <span className="text-slate-400 font-normal lowercase">{timeText}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 -mr-1 -mt-1 rounded-full bg-slate-200/70 hover:bg-slate-300 active:scale-90 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shrink-0 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[13.5px] font-semibold text-slate-900 leading-snug truncate">
          {senderName}
        </div>

        <p className="text-ios-footnote text-slate-700 leading-snug line-clamp-2 mt-0.5">
          {messageText}
        </p>
      </div>
    </div>
  );
};

export default NotificationBanner;

