import { useMotionState } from '../../../shared/motion/useMotionState';
import React from 'react';
import {
  IoBriefcaseOutline,
  IoChevronForward,
  IoCloudOutline,
  IoFolderOpenOutline,
  IoLockClosedOutline,
  IoQrCodeOutline,
  IoSearchOutline,
  IoServerOutline,
  IoSettingsOutline,
  IoShieldOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';
import { MessagingCloudDocument } from '../types';
import { StoryEvidenceTarget } from '../../../features/investigation';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';

export interface MessagingProfileViewProps {
  currentUser?: {
    name: string;
    handle: string;
    avatarInitials?: string;
    statusText?: string;
  };
  cloudDocuments: MessagingCloudDocument[];
  onOpenCloudDrawer: () => void;
  onReturnHome: () => void;
  onTagSuspect?: (name: string) => void;
}

interface ProfileMenuRowProps {
  icon: IconType;
  iconClassName: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

/** Single grouped feature row (app-design.md §4.4): icon tile, title, subtitle, chevron. */
const ProfileMenuRow: React.FC<ProfileMenuRowProps> = ({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-all text-left min-h-[56px] border-t border-slate-100 first:border-t-0 cursor-pointer"
  >
    <div className="flex items-center gap-3.5 min-w-0">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-ios-headline font-medium text-[#0F172A] block truncate">{title}</span>
        <p className="text-ios-footnote text-[#64748B] truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
    <IoChevronForward className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
  </div>
);

export const MessagingProfileView: React.FC<MessagingProfileViewProps> = ({
  currentUser = {
    name: 'Nguyễn Huy Hoàng',
    handle: 'hoang_tech88',
    avatarInitials: 'H',
    statusText: 'Đang làm việc...',
  },
  onOpenCloudDrawer,
  onTagSuspect,
}) => {
  const [evidenceItem, setEvidenceItem] = useMotionState<{
    title: string;
    snippet: string;
    suspectTag: string;
    subtitle?: string;
  } | null>(null, 'sheet');

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F2F5] text-[#0F172A] select-none font-sans overflow-y-auto pb-24">
      {/* Header: Search + Settings (red alert badge) */}
      <header className="h-14 px-3 bg-[#0088FF] text-white flex items-center gap-2 shrink-0 shadow-sm">
        <div className="flex-1 h-9 bg-white/20 rounded-lg flex items-center px-2.5 gap-2">
          <IoSearchOutline className="w-4 h-4 text-white/80 shrink-0" />
          <span className="text-ios-subheadline text-white/80">Tìm kiếm</span>
        </div>
        <button
          type="button"
          className="relative w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg shrink-0"
          aria-label="Cài đặt tài khoản"
        >
          <IoSettingsOutline className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF3B30] text-white text-ios-caption-2 font-bold flex items-center justify-center">
            !
          </span>
        </button>
      </header>

      {/* Profile Header Card: status pill, avatar, display name (story data, long-press to pin) */}
      <StoryEvidenceTarget
        item={{
          title: `Tài khoản: ${currentUser.name}`,
          snippet: `Chủ tài khoản: ${currentUser.name}\nHandle: @${currentUser.handle}\nTrạng thái: ${currentUser.statusText || 'Đang làm việc...'}`,
          suspectToTag: currentUser.name,
          subtitle: 'Thông tin tài khoản máy',
        }}
        onTriggerEvidence={(item) =>
          setEvidenceItem({
            title: item.title,
            snippet: item.snippet,
            suspectTag: item.suspectToTag,
            subtitle: item.subtitle,
          })
        }
      >
        <div className="pt-4 pb-5 bg-white flex flex-col items-center gap-2.5 cursor-pointer">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-slate-300 text-ios-footnote text-[#475569]">
            <span>{currentUser.statusText || 'Trạng thái...'}</span>
          </div>
          <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
            {currentUser.avatarInitials || currentUser.name.charAt(0)}
          </div>
          <div className="flex items-center gap-1 max-w-full px-4">
            <h3 className="text-ios-headline font-bold text-[#0F172A] truncate">{currentUser.name}</h3>
            <IoChevronForward className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </StoryEvidenceTarget>

      {/* Section 1: Ecosystem */}
      <div className="mt-2 bg-white">
        <ProfileMenuRow
          icon={IoBriefcaseOutline}
          iconClassName="bg-indigo-50 text-indigo-600"
          title="zBusiness"
          subtitle="Công cụ bán hàng và chăm sóc khách hàng"
        />
        <ProfileMenuRow
          icon={IoCloudOutline}
          iconClassName="bg-sky-50 text-[#0088FF]"
          title="zCloud"
          subtitle="Lưu trữ tin nhắn và đồng bộ đa thiết bị"
        />
        <ProfileMenuRow
          icon={IoSparklesOutline}
          iconClassName="bg-pink-50 text-pink-600"
          title="zStyle"
          subtitle="Cá nhân hoá giao diện và nhãn dán"
        />
      </div>

      {/* Section 2: Storage & Utilities */}
      <div className="mt-2 bg-white">
        <div onClick={onOpenCloudDrawer}>
          <ProfileMenuRow
            icon={IoFolderOpenOutline}
            iconClassName="bg-sky-50 text-[#0088FF]"
            title="My Documents"
            subtitle="Lưu trữ tin nhắn, hình ảnh và tài liệu sao lưu"
          />
        </div>
        <ProfileMenuRow
          icon={IoServerOutline}
          iconClassName="bg-emerald-50 text-emerald-600"
          title="Dữ liệu trên máy"
          subtitle="Quản lý bộ nhớ và cache"
        />
        <ProfileMenuRow
          icon={IoQrCodeOutline}
          iconClassName="bg-purple-50 text-purple-600"
          title="Ví QR"
          subtitle="Mã QR nhận tiền và kết nối nhanh"
        />
      </div>

      {/* Section 3: Security & Privacy */}
      <div className="mt-2 mb-4 bg-white">
        <ProfileMenuRow
          icon={IoLockClosedOutline}
          iconClassName="bg-rose-50 text-rose-600"
          title="Tài khoản và bảo mật"
          subtitle="Mật khẩu, xác thực hai lớp"
        />
        <ProfileMenuRow
          icon={IoShieldOutline}
          iconClassName="bg-amber-50 text-amber-600"
          title="Quyền riêng tư"
          subtitle="Cài đặt quyền riêng tư và bảo mật"
        />
      </div>

      {/* Universal evidence pop-up on long-press */}
      {evidenceItem && (
        <MessagingEvidenceSheet
          isOpen={Boolean(evidenceItem)}
          title={evidenceItem.title}
          subtitle={evidenceItem.subtitle}
          evidenceSnippet={evidenceItem.snippet}
          suspectToTag={evidenceItem.suspectTag}
          onPinEvidence={(name: string) => {
            onTagSuspect?.(name);
            setEvidenceItem(null);
          }}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const ZolaProfileView = MessagingProfileView;
export default MessagingProfileView;
