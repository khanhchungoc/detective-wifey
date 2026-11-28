import React from 'react';
import { IoAddCircleOutline, IoClose, IoPhonePortraitOutline, IoShareSocialOutline } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import type { usePwa } from '../usePwa';

interface PwaGuideSheetProps {
  pwa: ReturnType<typeof usePwa>;
  onClose: () => void;
  onPreviewFullscreen: () => void;
  isIOS?: boolean;
}

export const PwaGuideSheet: React.FC<PwaGuideSheetProps> = ({
  pwa,
  onClose,
  onPreviewFullscreen,
  isIOS = false,
}) => {
  const swipeHandlers = useSwipeBack({ onBack: onClose });

  return (
    <div
      className="glass-scrim absolute inset-0 z-50 flex items-end animate-fadeIn select-none font-sans"
      onClick={onClose}
    >
      <div
        {...swipeHandlers}
        className="ios-sheet glass-elevated border-x-0 border-b-0 w-full max-h-[85%] overflow-y-auto rounded-t-3xl p-4 space-y-3.5 animate-slideUp text-white"
        style={isIOS ? { paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-slate-600 rounded-full mx-auto cursor-pointer"
          onClick={onClose}
        />

        <div className="flex justify-between items-start pb-2 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              CHƠI NHƯ ỨNG DỤNG THẬT (PWA)
            </h2>
            <p className="text-xs text-slate-400">
              {isIOS ? 'Mở từ Màn hình chính để ẩn thanh công cụ Safari. Thanh trạng thái iOS vẫn hiển thị.' : 'Mở từ Màn hình chính để chơi trong cửa sổ độc lập.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
            aria-label="Đóng"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>

        {pwa.installed && <p role="status" className="text-sm text-emerald-300">Ứng dụng đang chạy ở chế độ độc lập.</p>}
        {pwa.canInstall && !pwa.installed && <button type="button" disabled={pwa.busy} onClick={() => void pwa.install()} className="w-full min-h-[44px] rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold disabled:opacity-50">{pwa.busy ? 'Đang cài đặt…' : 'Cài đặt ứng dụng'}</button>}
        {pwa.error && <p role="alert" className="text-sm text-rose-300">Không thể mở cài đặt. Hãy dùng trình đơn của trình duyệt.</p>}
        <p className="text-xs text-slate-300">Chơi ngoại tuyến sau khi tải và lưu đầy đủ lần đầu. Phiên bản mới sẽ áp dụng sau khi đóng mọi cửa sổ trò chơi rồi mở lại.</p>
        {!pwa.installed && <>
        {/* 3 Step Boxes */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <p className="leading-relaxed">
              Trên <strong>iOS Safari</strong>: Chạm nút <strong>Chia sẻ</strong> (<IoShareSocialOutline className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />) ở thanh dưới.<br />
              Trên <strong>Android Chrome</strong>: Chạm dấu ba chấm ở góc trên.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <p className="leading-relaxed">
              Cuộn xuống chọn mục <strong>"Thêm vào Màn hình chính"</strong> (<IoAddCircleOutline className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> Add to Home Screen).
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <p className="leading-relaxed">
              Mở game từ icon ngoài màn hình: ứng dụng sẽ khởi động chế độ độc lập <IoPhonePortraitOutline className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" /> với 0 thanh duyệt web!
            </p>
          </div>
        </div>
        </>}

        <button
          type="button"
          onClick={() => {
            onClose();
            if (!isIOS) onPreviewFullscreen();
          }}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md text-center"
        >
          {isIOS ? 'ĐÃ HIỂU' : 'ĐÃ HIỂU • XEM THỬ CHẾ ĐỘ TOÀN MÀN HÌNH'}
        </button>
      </div>
    </div>
  );
};

