import React from 'react';
import {
  IoChevronForward,
  IoCloudOutline,
  IoCloseOutline,
  IoLocationSharp,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';

interface PhotoInfoDrawerProps {
  photo: PhotoItem;
  caseId: string;
  husbandName: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGrid: () => void;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast: (message: string) => void;
}

function formatVietnameseDate(photo: PhotoItem): string {
  const raw = photo.timestamp || photo.date || '';

  // If already full Vietnamese string, return as-is
  if (raw.toLowerCase().includes('lúc') || raw.toLowerCase().includes('ngày')) {
    return raw;
  }

  // Check if matches DD/MM or DD/MM/YYYY
  const parts = raw.split('/');
  if (parts.length >= 2) {
    const day = parts[0];
    const month = parts[1];
    const year = parts[2] ? parts[2].split(' ')[0] : '2026';
    const timeMatch = raw.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : '18:37';
    return `Lúc ${time} Thứ Năm, ngày ${day} tháng ${month}, ${year}`;
  }

  return `Lúc 18:37 Thứ Năm, ngày 22 tháng 10, 2026`;
}

export const PhotoInfoDrawer: React.FC<PhotoInfoDrawerProps> = ({
  photo,
  caseId,
  husbandName,
  isOpen,
  onClose,
  onNavigateToGrid,
  onTriggerEvidence,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const { exif } = photo;
  const formattedDate = formatVietnameseDate(photo);
  const streetLabels = exif.streetLabels && exif.streetLabels.length >= 3
    ? exif.streetLabels
    : ['P. Nghĩa Đô', 'HỒ TÙNG MẬU', 'QL.32'];

  const evidenceItem: UniversalEvidenceItem = {
    title: photo.title,
    subtitle: `${formattedDate} • ${exif.locationName}`,
    snippet: `EXIF [${exif.device}] ${formattedDate} tại ${exif.locationName}. Thông số: ISO ${exif.iso}, tiêu cự ${exif.focalLength}mm, ${exif.aperture}, ${exif.shutterSpeed}.`,
    suspectToTag: photo.suspectName || husbandName,
    source: {
      caseId,
      recordId: `exif_${photo.id}`,
      clueRefId: photo.clueRefId,
      title: `EXIF: ${photo.title}`,
      snippet: `Thời gian chụp: ${formattedDate}. Địa điểm: ${exif.locationName}. Thiết bị: ${exif.device}.`,
      kind: 'photo',
    },
  };

  return (
    <div
      className="absolute inset-x-0 bottom-0 max-h-[85%] z-40 bg-[#000000] text-white rounded-t-3xl shadow-2xl border-t border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
    >
      {/* Top Grab Handle */}
      <div className="pt-2.5 pb-1 flex justify-center items-center relative">
        <div className="w-10 h-1 bg-white/20 rounded-full" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-2 w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-slate-400 hover:text-white"
          aria-label="Đóng bảng thông tin"
        >
          <IoCloseOutline className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Top Cropped Photo Preview */}
        <div className="h-28 w-full rounded-2xl overflow-hidden relative border border-white/10 shrink-0">
          <PhotoPreview photo={photo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-xs font-semibold text-white truncate">{photo.title}</span>
          </div>
        </div>

        {/* Caption Header */}
        <div className="border-b border-white/10 pb-3">
          <p className="text-ios-subheadline text-slate-300">
            {photo.caption || photo.description || 'Thêm chú thích'}
          </p>
        </div>

        {/* Date, Time & Filename */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-ios-subheadline font-semibold text-white">{formattedDate}</p>
            <button
              type="button"
              onClick={() => onShowToast('Không khả dụng trong chế độ điều tra')}
              className="text-ios-subheadline text-[#2979FF] font-medium hover:underline min-h-[32px] px-1"
            >
              Điều chỉnh
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-ios-caption-1 text-slate-400">
            <IoCloudOutline className="w-4 h-4 text-[#2979FF]" />
            <span>{exif.filename}</span>
          </div>
        </div>

        {/* Camera & Hardware EXIF Card */}
        <StoryEvidenceTarget
          item={evidenceItem}
          onTriggerEvidence={onTriggerEvidence}
        >
          <div className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-white/10 space-y-2 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-ios-subheadline font-bold text-white">{exif.device}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-ios-caption-2 font-semibold tracking-wider">
                {exif.format}
              </span>
            </div>
            <p className="text-ios-caption-1 text-slate-300">{exif.lens}</p>
            <p className="text-ios-caption-2 text-slate-400">{exif.resolution}</p>

            {/* 5-Column Exposure Metrics Divider Row */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-5 gap-1 text-center text-ios-caption-2 text-slate-300">
              <div className="border-r border-white/10 last:border-0 pr-1">
                <span className="block font-medium">ISO {exif.iso}</span>
              </div>
              <div className="border-r border-white/10 last:border-0 pr-1">
                <span className="block font-medium">{exif.focalLength} mm</span>
              </div>
              <div className="border-r border-white/10 last:border-0 pr-1">
                <span className="block font-medium">{exif.ev} ev</span>
              </div>
              <div className="border-r border-white/10 last:border-0 pr-1">
                <span className="block font-medium">{exif.aperture}</span>
              </div>
              <div>
                <span className="block font-medium">{exif.shutterSpeed}</span>
              </div>
            </div>
          </div>
        </StoryEvidenceTarget>

        {/* Geotag Map Card */}
        <StoryEvidenceTarget
          item={evidenceItem}
          onTriggerEvidence={onTriggerEvidence}
        >
          <div className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-white/10 space-y-3 cursor-pointer hover:bg-white/5 transition-colors">
            {/* Vector Map Preview */}
            <div className="h-28 rounded-xl bg-[#2C2C2E] relative overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Stylized Street Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#8E8E93" strokeWidth="4" />
                <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#8E8E93" strokeWidth="6" />
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#8E8E93" strokeWidth="5" />
                <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#8E8E93" strokeWidth="3" />
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#636366" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Street Labels */}
              <span className="absolute top-2 left-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                {streetLabels[0]}
              </span>
              <span className="absolute bottom-2 left-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                {streetLabels[1]}
              </span>
              <span className="absolute top-2 right-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                {streetLabels[2]}
              </span>

              {/* Custom Marker Pin with Thumbnail */}
              <div className="relative flex flex-col items-center drop-shadow-lg z-10">
                <div className="w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-black shadow-lg">
                  <PhotoPreview photo={photo} className="w-full h-full object-cover" />
                </div>
                <IoLocationSharp className="w-5 h-5 text-rose-500 -mt-1.5" />
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-center justify-between text-ios-subheadline">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-white truncate">{exif.locationName}</span>
                <IoChevronForward className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <button
                type="button"
                onClick={() => onShowToast('Không khả dụng trong chế độ điều tra')}
                className="text-[#2979FF] font-medium hover:underline shrink-0 min-h-[32px] px-1"
              >
                Điều chỉnh
              </button>
            </div>
          </div>
        </StoryEvidenceTarget>

        {/* View in All Photos Full-Width Action */}
        <button
          type="button"
          onClick={onNavigateToGrid}
          className="w-full py-3.5 rounded-2xl bg-[#1C1C1E] hover:bg-white/10 border border-white/10 text-[#2979FF] font-semibold text-ios-subheadline text-center transition-all active:scale-[0.99] min-h-[44px]"
        >
          Xem trong Tất cả ảnh
        </button>
      </div>
    </div>
  );
};
