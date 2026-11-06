import { useState } from 'react';
import {
  IoCopyOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoGridOutline,
  IoLeafOutline,
  IoQrCodeOutline,
  IoReceiptOutline,
  IoTrendingUpOutline,
  IoWalletOutline,
  IoFingerPrintOutline,
  IoKeyOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import type { BankingData } from '../types';

const tierLabels = {
  standard: 'Standard',
  inspire: 'Inspire',
  priority: 'Priority',
  private: 'Private',
};

interface BankingDashboardProps {
  data: BankingData;
  onOpenHistory: () => void;
  onOpenVaults: () => void;
}

export function BankingDashboard({ data, onOpenHistory, onOpenVaults }: BankingDashboardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const copyAccount = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(data.accountNumber);
      setCopyMessage('Đã sao chép số tài khoản.');
    } catch {
      setCopyMessage('Không thể sao chép. Vui lòng sao chép số tài khoản thủ công.');
    }
  };

  return (
    <section aria-label="Tổng quan tài khoản" className="bank-dashboard-canvas flex min-h-full flex-col space-y-4 p-4 pb-8">
      {/* 3. Floating Account Hero Card ("Số dư hiện có") */}
      <div className="bank-card-elevated p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#374151]">Số dư hiện có</p>
          <button
            type="button"
            onClick={() => setShowBalance(visible => !visible)}
            aria-label={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
            aria-pressed={showBalance}
            className="bank-control flex items-center justify-center text-[#6B7280] hover:text-[#111827]"
          >
            {showBalance ? <IoEyeOffOutline aria-hidden="true" className="h-5 w-5" /> : <IoEyeOutline aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-1">
          <p className="bank-amount text-2xl font-bold tracking-tight text-[#111827]" aria-live="polite">
            {showBalance ? data.actualBalance : data.maskedBalance}
          </p>
        </div>

        {/* Tier Upgrade Sub-card */}
        <div className="mt-3 rounded-xl bg-[#F5F6F8] p-3 border border-[#E5E7EB]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#111827]">Lên hạng Inspire Max</p>
              <p className="mt-1 text-xs text-[#4B5563] leading-relaxed">
                Duy trì số dư tài khoản bình quân 3 tháng từ 30 triệu để lên hạng và tích điểm hoàn tới 25%.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={onOpenHistory}
              className="bank-control flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
            >
              Tài khoản &amp; lịch sử
            </button>
          </div>
        </div>

        {/* Account Number & Copy */}
        <div className="mt-3 flex items-center justify-between border-t border-[#F3F4F6] pt-2.5">
          <div className="min-w-0">
            <p className="text-ios-caption-2 text-[#6B7280]">Tài khoản thanh toán</p>
            <p className="bank-amount select-text break-words text-sm font-semibold text-[#111827]">
              {data.accountNumber || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={copyAccount}
            disabled={!data.accountNumber}
            aria-label="Sao chép số tài khoản"
            className="bank-control flex shrink-0 items-center justify-center text-[#6B7280] hover:text-[#111827] disabled:opacity-40"
          >
            <IoCopyOutline aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {copyMessage && <p role="status" className="text-center text-ios-footnote text-[#6B7280]">{copyMessage}</p>}

      {/* 4. Quick Action Grid (5 Columns) */}
      <div aria-label="Lối tắt tính năng" className="bank-quick-actions">
        {/* 1. Gửi tiết kiệm */}
        <button
          type="button"
          onClick={onOpenVaults}
          aria-label="Gửi tiết kiệm"
          className="bank-control flex flex-col items-center gap-1.5 text-center group"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#ED1C24] shadow-sm group-hover:border-[#ED1C24] group-active:scale-95 transition-all">
            <IoWalletOutline aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="w-full text-center text-xs font-medium text-[#111827] leading-tight">
            Gửi tiết kiệm
          </span>
        </button>

        {/* 2. Thanh toán hóa đơn */}
        <button
          type="button"
          disabled
          aria-label="Thanh toán hóa đơn · Không khả dụng"
          className="bank-control flex flex-col items-center gap-1.5 text-center opacity-40 cursor-not-allowed"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm">
            <IoReceiptOutline aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="w-full text-center text-xs font-medium text-[#111827] leading-tight">
            Thanh toán
          </span>
        </button>

        {/* 3. Quét mã QR */}
        <button
          type="button"
          disabled
          aria-label="Quét mã QR · Không khả dụng"
          className="bank-control flex flex-col items-center gap-1.5 text-center opacity-40 cursor-not-allowed"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm">
            <IoQrCodeOutline aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="w-full text-center text-xs font-medium text-[#111827] leading-tight">
            Quét mã QR
          </span>
        </button>

        {/* 4. Sinh lời tự động */}
        <button
          type="button"
          onClick={onOpenVaults}
          aria-label="Sinh lời tự động"
          className="bank-control flex flex-col items-center gap-1.5 text-center group"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#00A86B] shadow-sm group-hover:border-[#00A86B] group-active:scale-95 transition-all">
            <IoTrendingUpOutline aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="w-full text-center text-xs font-medium text-[#111827] leading-tight">
            Sinh lời
          </span>
        </button>

        {/* 5. Tính năng khác */}
        <button
          type="button"
          disabled
          aria-label="Tính năng khác · Không khả dụng"
          className="bank-control flex flex-col items-center gap-1.5 text-center opacity-40 cursor-not-allowed"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm">
            <IoGridOutline aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="w-full text-center text-xs font-medium text-[#111827] leading-tight">
            Tính năng
          </span>
        </button>
      </div>

      {/* 6. "Dành cho bạn" Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-[#111827]">Dành cho bạn</h2>
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#E5E7EB] shadow-sm">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-sm font-bold text-[#111827]">Khoản gửi đầu tiên</p>
            <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
              Thêm 1.5%/năm lãi suất cho khoản tiền gửi mở mới trực tuyến qua Techcornbank OneU.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00A86B]/10 text-[#00A86B]">
            <IoLeafOutline aria-hidden="true" className="h-6 w-6" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BankingProfile({ data, husbandName = 'Pham Quoc Bao' }: { data: BankingData; husbandName?: string }) {
  const initials = husbandName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'PB';

  const tier = data.tier ? tierLabels[data.tier] : 'Inspire';

  return (
    <section aria-label="Thông tin tài khoản" className="space-y-4 p-4">
      {/* Profile Header */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ED1C24] text-lg font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#111827]">{husbandName}</h2>
            <p className="text-xs font-semibold text-[#ED1C24]">Hội viên {tier}</p>
            <p className="bank-amount mt-0.5 text-xs text-[#6B7280]">
              STK: {data.accountNumber || '1903 8888 6688'}
            </p>
          </div>
        </div>
      </div>

      {/* Membership Info */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">Thông tin hội viên</h3>
        <dl className="mt-3 divide-y divide-[#F3F4F6] text-sm">
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-[#6B7280]">Hạng hội viên hiện tại</dt>
            <dd className="font-semibold text-[#111827]">{tier} (Thành viên Triển vọng)</dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-[#6B7280]">Điểm thưởng Techcornbank OneU</dt>
            <dd className="bank-amount font-semibold text-[#111827]">1,250 điểm</dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-[#6B7280]">Hạn mức chuyển khoản ngày</dt>
            <dd className="bank-amount font-semibold text-[#111827]">500.000.000 đ</dd>
          </div>
        </dl>
      </div>

      {/* Security & Settings */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">Bảo mật &amp; Đăng nhập</h3>
        <ul className="mt-3 divide-y divide-[#F3F4F6] text-sm">
          <li className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2.5 text-[#111827]">
              <IoFingerPrintOutline className="h-5 w-5 text-[#6B7280]" />
              Khóa vân tay / Face ID
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#00A86B]">
              <IoCheckmarkCircleOutline className="h-4 w-4" /> Đang bật
            </span>
          </li>
          <li className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2.5 text-[#111827]">
              <IoKeyOutline className="h-5 w-5 text-[#6B7280]" />
              Mã PIN giao dịch (Smart OTP)
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#00A86B]">
              <IoCheckmarkCircleOutline className="h-4 w-4" /> Đã thiết lập
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
