import type { MessagingDiscoverData } from '../types';
import React from 'react';
import {
  IoCardOutline,
  IoChevronForward,
  IoGameControllerOutline,
  IoPartlySunnyOutline,
  IoReceiptOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';

interface MessagingDiscoverViewProps {
  discoverData?: MessagingDiscoverData;
  onTagSuspect?: (name: string) => void;
}

const DEFAULT_PROMO = {
  tag: 'Ví điện tử',
  badge: 'Miễn phí 100%',
  title: 'Chuyển tiền nhanh trong khung chat',
  subtitle: 'Chuyển khoản Napas 24/7 bảo mật, không cần số tài khoản.',
};

const DEFAULT_MINI_APPS = [
  { id: 'app_ewallet', name: 'Ví điện tử', icon: 'CreditCard', color: 'blue' },
  { id: 'app_bill', name: 'Hoá đơn', icon: 'Receipt', color: 'purple' },
  { id: 'app_weather', name: 'Thời tiết', icon: 'CloudSun', color: 'amber' },
  { id: 'app_games', name: 'Game Vui', icon: 'Gamepad2', color: 'rose' },
];

const DEFAULT_OA = [
  {
    id: 'oa_evn',
    name: 'Điện lực Hà Nội',
    category: 'Tra cứu tiền điện sinh hoạt',
    badge: 'EVN',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'oa_viettel',
    name: 'Viettel CSKH',
    category: 'Ưu đãi gói cước di động 5G',
    badge: 'VTL',
    color: 'bg-red-100 text-red-700',
  },
];

export const MessagingDiscoverView: React.FC<MessagingDiscoverViewProps> = ({
  discoverData,
}) => {
  const promo = discoverData?.promoBanner || DEFAULT_PROMO;
  const miniApps = discoverData?.miniApps || DEFAULT_MINI_APPS;
  const officialAccounts = discoverData?.officialAccounts || DEFAULT_OA;

  const getMiniAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <IoCardOutline className="w-6 h-6 text-[#0088FF]" />;
      case 'Receipt':
        return <IoReceiptOutline className="w-6 h-6 text-purple-600" />;
      case 'CloudSun':
        return <IoPartlySunnyOutline className="w-6 h-6 text-amber-600" />;
      case 'Gamepad2':
        return <IoGameControllerOutline className="w-6 h-6 text-rose-600" />;
      default:
        return <IoPartlySunnyOutline className="w-6 h-6 text-blue-500" />;
    }
  };

  const getMiniAppBg = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50';
      case 'purple':
        return 'bg-purple-50';
      case 'amber':
        return 'bg-amber-50';
      case 'rose':
        return 'bg-rose-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F2F5] text-[#0F172A] select-none font-sans overflow-y-auto pb-24">
      {/* Search Header */}
      <header className="h-14 px-3 bg-[#0088FF] text-white flex items-center gap-2 shrink-0 shadow-sm">
        <div className="flex-1 h-9 bg-white/20 rounded-lg flex items-center px-2.5 gap-2 text-white">
          <IoSearchOutline className="w-4 h-4 text-white/80 shrink-0" />
          <input
            type="text"
            readOnly
            placeholder="Tìm kiếm mini app, tiện ích..."
            className="w-full bg-transparent text-ios-subheadline text-white placeholder-white/80 outline-hidden"
          />
        </div>
      </header>

      {/* Promo Banner (Standard app structure - zero long-press overlay) */}
      <div className="m-3 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-1 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-ios-caption-2 font-bold">
            {promo.tag}
          </span>
          <span className="text-ios-caption-2 text-white/80">{promo.badge}</span>
        </div>
        <h3 className="text-ios-headline font-bold pt-1">{promo.title}</h3>
        <p className="text-ios-footnote text-white/80">{promo.subtitle}</p>
      </div>

      {/* Mini App Services Grid (Standard app utility shortcuts - zero long-press overlay) */}
      <div className="mx-3 bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
        <h4 className="text-ios-caption-1 font-bold text-[#64748B] uppercase tracking-wider mb-3">
          Tiện ích gợi ý cho bạn
        </h4>
        <div className="grid grid-cols-4 gap-3 text-center">
          {miniApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${getMiniAppBg(
                  app.color
                )} flex items-center justify-center shadow-xs`}
              >
                {getMiniAppIcon(app.icon)}
              </div>
              <span className="text-ios-caption-1 font-medium text-[#0F172A] leading-tight">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Accounts & Channels (Standard directories - zero long-press overlay) */}
      <div className="m-3 bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2">
        <h4 className="text-ios-caption-1 font-bold text-[#64748B] uppercase tracking-wider mb-2">
          Kênh thông tin Official Account
        </h4>

        {officialAccounts.map((oa, index) => (
          <div
            key={oa.id}
            className={`flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 transition-all ${
              index < officialAccounts.length - 1
                ? 'border-b border-slate-100'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${
                  oa.color || 'bg-slate-100 text-slate-700'
                } flex items-center justify-center font-bold text-ios-caption-1 shrink-0`}
              >
                {oa.badge}
              </div>
              <div>
                <h5 className="text-ios-subheadline font-bold text-[#0F172A]">{oa.name}</h5>
                <p className="text-ios-footnote text-[#64748B]">{oa.category}</p>
              </div>
            </div>
            <IoChevronForward className="w-4 h-4 text-slate-400" />
          </div>
        ))}
      </div>

      <div className="p-4 text-center text-ios-footnote text-[#52525B] flex items-center justify-center gap-1.5">
        <IoShieldCheckmarkOutline className="w-3.5 h-3.5 text-emerald-500" />
        <span>Hệ sinh thái dịch vụ số được mã hoá đầu cuối</span>
      </div>
    </div>
  );
};

export const ZolaDiscoverView = MessagingDiscoverView;
export default MessagingDiscoverView;
