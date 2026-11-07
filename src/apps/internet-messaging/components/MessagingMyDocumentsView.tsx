import { useMotionState } from '../../../shared/motion/useMotionState';
import React, { useState } from 'react';
import { IoCheckmark, IoChevronBack, IoChevronForward, IoClose, IoEllipsisHorizontal, IoFolderOpenOutline, IoHappyOutline, IoHeart, IoHeartOutline, IoImageOutline, IoLinkOutline, IoListOutline, IoMicOutline, IoSearchOutline, IoShareSocialOutline } from 'react-icons/io5';
import { MessagingCloudDocument } from '../types';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../../features/investigation';

interface MessagingMyDocumentsViewProps {
  documents: MessagingCloudDocument[];
  onBack: () => void;
  onTagSuspect: (suspectName: string) => void;
}

type CategoryTab = 'all' | 'photos' | 'files' | 'links' | 'notes' | 'collections';

export const MessagingMyDocumentsView: React.FC<MessagingMyDocumentsViewProps> = ({
  documents,
  onBack,
  onTagSuspect,
}) => {
  const [activeCategory, setActiveCategory] = useMotionState<CategoryTab>('all', 'fade');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useMotionState(false, 'fade');
  const [likedDocIds, setLikedDocIds] = useState<Record<string, boolean>>({});
  const [evidenceSheetDoc, setEvidenceSheetDoc] = useMotionState<MessagingCloudDocument | null>(null, 'sheet');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const swipeHandlers = useSwipeBack({ onBack });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const toggleHeart = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setLikedDocIds((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  // Filter documents by category tab and search query
  const filteredDocuments = documents.filter((doc) => {
    // 1. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = doc.fileName?.toLowerCase().includes(q);
      const matchDesc = doc.description?.toLowerCase().includes(q);
      const matchText = doc.textMessage?.toLowerCase().includes(q);
      const matchSender = doc.senderName?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchText && !matchSender) {
        return false;
      }
    }

    // 2. Tab category filter
    switch (activeCategory) {
      case 'photos':
        return doc.fileType === 'jpg' || doc.fileType === 'png';
      case 'files':
        return (
          doc.fileType === 'pdf' ||
          doc.fileType === 'doc' ||
          doc.fileType === 'xlsx'
        );
      case 'links':
        return doc.fileType === 'link';
      case 'notes':
        return doc.fileType === 'text' || Boolean(doc.textMessage);
      case 'collections':
      case 'all':
      default:
        return true;
    }
  });

  // Group items by date for chat separators
  const dateGroups: { [date: string]: MessagingCloudDocument[] } = {};
  filteredDocuments.forEach((doc) => {
    const key = doc.fullDate || doc.date || 'Hôm nay';
    if (!dateGroups[key]) {
      dateGroups[key] = [];
    }
    dateGroups[key].push(doc);
  });

  return (
    <div
      {...swipeHandlers}
      data-detail-layer
      className="absolute inset-0 z-20 flex flex-col h-full w-full bg-[#E5ECEF] text-[#0F172A] select-none font-sans overflow-hidden shadow-2xl"
    >
      {/* 1. Header (Electric Blue #0088FF) */}
      <header className="h-14 bg-[#0088FF] text-white flex items-center justify-between px-2 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg"
            aria-label="Quay lại"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="font-bold text-ios-headline text-white tracking-tight truncate">
              My Documents
            </h1>
            <div
              className="w-4 h-4 rounded-full bg-amber-400 border border-amber-300 flex items-center justify-center text-white shrink-0 shadow-xs"
              title="Tài liệu bảo mật đã xác minh"
            >
              <IoCheckmark className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg"
            aria-label="Tìm kiếm tài liệu"
          >
            <IoSearchOutline className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => showToast('Đang hiển thị chế độ danh mục chi tiết')}
            className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg"
            aria-label="Danh sách tài liệu"
          >
            <IoListOutline className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Input Bar (when expanded) */}
      {showSearch && (
        <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center gap-2 animate-fadeIn shrink-0">
          <IoSearchOutline className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu, hình ảnh trong Cloud..."
            className="flex-1 text-ios-subheadline bg-transparent outline-none text-[#0F172A] placeholder-slate-400"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label="Xoá tìm kiếm"
            >
              <IoClose className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. Horizontal Filter Tabs Bar */}
      <nav
        className="bg-white border-b border-slate-200 flex items-center overflow-x-auto no-scrollbar px-2 shrink-0 z-10 shadow-xs"
        aria-label="Phân loại tài liệu Cloud"
      >
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all relative ${
            activeCategory === 'all'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tất cả
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('photos')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all relative flex items-center gap-1 ${
            activeCategory === 'photos'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Ảnh</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('files')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all ${
            activeCategory === 'files'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          File
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('links')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all ${
            activeCategory === 'links'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Link
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('notes')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all ${
            activeCategory === 'notes'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Văn bản
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('collections')}
          className={`py-2.5 px-3 whitespace-nowrap text-ios-footnote sm:text-ios-subheadline font-semibold transition-all ${
            activeCategory === 'collections'
              ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bộ sưu tập
        </button>
      </nav>

      {/* 3. Feed Canvas (Chat Stream UI) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 pb-24">
        {/* Collections Tab Special View */}
        {activeCategory === 'collections' ? (
          <div className="space-y-3 py-2">
            <div
              onClick={() => setActiveCategory('files')}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <IoFolderOpenOutline className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-ios-subheadline font-bold text-[#0F172A]">
                    Hồ Sơ Căn Hộ Mini Chùa Láng
                  </h4>
                  <p className="text-ios-footnote text-[#64748B] mt-0.5">
                    2 tệp tài liệu • Cập nhật 14/10/2026
                  </p>
                </div>
              </div>
              <IoChevronForward className="w-5 h-5 text-slate-400 shrink-0" />
            </div>

            <div
              onClick={() => setActiveCategory('files')}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0088FF] flex items-center justify-center shrink-0">
                  <IoFolderOpenOutline className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-ios-subheadline font-bold text-[#0F172A]">
                    Tài Liệu Doanh Nghiệp Technosoft
                  </h4>
                  <p className="text-ios-footnote text-[#64748B] mt-0.5">
                    1 tệp bảng lương • Cập nhật 05/10/2026
                  </p>
                </div>
              </div>
              <IoChevronForward className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
              <IoLinkOutline className="w-6 h-6" />
            </div>
            <p className="text-ios-subheadline font-semibold text-slate-600">
              {activeCategory === 'links'
                ? 'Chưa có liên kết web nào được lưu vào Cloud'
                : 'Không tìm thấy tài liệu phù hợp'}
            </p>
            <p className="text-ios-footnote text-slate-400">
              Các tài liệu và tin nhắn bí mật sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          /* Grouped Chat Feed Stream */
          Object.entries(dateGroups).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date separator pill */}
              <div className="flex justify-center my-2">
                <span className="px-3 py-0.5 rounded-full bg-slate-400/60 text-white text-ios-caption-2 font-medium shadow-xs">
                  {dateLabel}
                </span>
              </div>

              {items.map((doc) => {
                const isPhoto = doc.fileType === 'jpg' || doc.fileType === 'png';
                const isText = doc.fileType === 'text' || Boolean(doc.textMessage);
                const isHearted = Boolean(likedDocIds[doc.id]);

                // 1. Photo Message Card (like 4x6.jpg or Bien_nhan_coc_can_ho_mini.jpg)
                if (isPhoto) {
                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col items-start space-y-1"
                    >
                      <StoryEvidenceTarget
                        item={{
                          title: doc.fileName,
                          subtitle: `Tài liệu Cloud • ${doc.fileSize}`,
                          snippet: doc.description || doc.fileName,
                          suspectToTag:
                            doc.suspectTag ||
                            `Cloud của tôi (${doc.fileName})`,
                        }}
                        onTriggerEvidence={() => setEvidenceSheetDoc(doc)}
                        className="relative max-w-[85%] rounded-2xl overflow-hidden shadow-sm border border-slate-300/80 cursor-pointer active:scale-[0.99] transition-all bg-slate-900 group"
                      >
                        <div
                          onClick={() => showToast('Nhấn giữ ảnh để ghim vào Sổ tay')}
                          className="w-full h-full"
                        >
                          {/* Photo Graphic Canvas */}
                          {doc.fileName === '4x6.jpg' ? (
                            /* Simulated UCLA red sweater photo as in user screenshot */
                            <div className="w-[260px] h-[190px] bg-[#C1121F] relative flex flex-col items-center justify-end overflow-hidden">
                              {/* Inner collar */}
                              <div className="w-16 h-8 bg-slate-100 rounded-b-full border border-slate-300 absolute top-0" />
                              {/* Ribbed crewneck */}
                              <div className="w-20 h-6 border-b-4 border-rose-900 rounded-b-2xl absolute top-3" />
                              {/* UCLA Arched Lettering */}
                              <div className="mb-10 text-center select-none">
                                <span className="text-2xl font-black tracking-wider text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-serif">
                                  UCLA
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Receipt / Apartment Photo Graphic */
                            <div className="w-[260px] h-[190px] bg-gradient-to-br from-amber-50 to-orange-100 p-3 flex flex-col justify-between border-b border-amber-200">
                              <div className="flex justify-between items-start">
                                <div className="text-ios-caption-2 font-bold text-amber-900 uppercase tracking-wider">
                                  GIẤY ĐẶT CỌC THUÊ PHÒNG
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-ios-caption-2 font-bold">
                                  ĐÃ THU TIỀN
                                </span>
                              </div>
                              <div className="my-auto text-center space-y-0.5">
                                <div className="text-ios-footnote font-bold text-[#0F172A]">
                                  Căn Hộ Mini 402 - Chùa Láng
                                </div>
                                <div className="text-ios-subheadline font-extrabold text-rose-600 font-mono">
                                  5.000.000 VNĐ
                                </div>
                                <div className="text-ios-caption-2 text-slate-500">
                                  Người nộp: Nguyễn Huy Hoàng
                                </div>
                              </div>
                              <div className="text-ios-caption-2 text-slate-400 flex justify-between">
                                <span>Ban Quản Lý Toà Nhà</span>
                                <span>P.402 Chùa Láng</span>
                              </div>
                            </div>
                          )}

                          {/* Bottom Dark Gradient Overlay */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded bg-emerald-500/90 text-white flex items-center justify-center shrink-0">
                                <IoImageOutline className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-ios-subheadline leading-tight truncate">
                                  {doc.fileName}
                                </div>
                                <div className="text-ios-caption-2 text-slate-300">
                                  {doc.fileSize}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </StoryEvidenceTarget>

                      {/* Photo Bottom Bar: Timestamp and Heart Reaction */}
                      <div className="flex items-center gap-2 pl-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-400/50 text-white text-ios-caption-2 font-medium">
                          {doc.time || '10:46'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleHeart(doc.id, e)}
                          className={`w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center transition-all active:scale-90 ${
                            isHearted ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          aria-label="Thích"
                        >
                          {isHearted ? <IoHeart className="w-3.5 h-3.5 text-rose-500" /> : <IoHeartOutline className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                }

                // 2. Forwarded Text Message Bubble
                if (isText) {
                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col items-end space-y-1"
                    >
                      <StoryEvidenceTarget
                        item={{
                          title: doc.senderName
                            ? `Tin nhắn từ ${doc.senderName}`
                            : 'Tin nhắn Cloud',
                          subtitle: `Thời gian: ${doc.time || '16:17'}`,
                          snippet: doc.textMessage || doc.description || '',
                          suspectToTag:
                            doc.suspectTag ||
                            doc.senderName ||
                            'Cloud của tôi (Tin nhắn)',
                        }}
                        onTriggerEvidence={() => setEvidenceSheetDoc(doc)}
                        className="max-w-[80%]"
                      >
                        <div
                          onClick={() => showToast('Nhấn giữ tin nhắn để ghim vào Sổ tay')}
                          className="w-full bg-[#D8EBFD] rounded-2xl p-2.5 shadow-xs border border-sky-200/80 cursor-pointer active:scale-[0.99] transition-all"
                        >
                          {/* Forward Sender line */}
                          <div className="flex items-center gap-1.5 text-ios-caption-1 text-slate-600 mb-1">
                            <span>Từ</span>
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-ios-caption-2 font-bold text-white flex items-center justify-center shrink-0">
                              {doc.senderName ? doc.senderName.charAt(0) : 'N'}
                            </div>
                            <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                              {doc.senderName || 'Người gửi'}
                            </span>
                            <IoChevronForward className="w-3 h-3 text-slate-400 shrink-0" />
                          </div>

                          {/* Content */}
                          <div className="text-ios-body text-[#0F172A] leading-relaxed select-text">
                            {doc.textMessage || doc.description}
                          </div>

                          {/* Timestamp */}
                          <div className="text-ios-caption-1 text-slate-400 text-right mt-1 font-medium">
                            {doc.time || '16:17'}
                          </div>
                        </div>
                      </StoryEvidenceTarget>
                    </div>
                  );
                }

                // 3. Document Card (DOCX / PDF / XLSX)
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col items-end space-y-1.5"
                  >
                    <StoryEvidenceTarget
                      item={{
                        title:
                          doc.previewTitle ||
                          (doc.clueRefId ? 'HỢP ĐỒNG THUÊ PHÒNG TRỌ' : doc.fileName),
                        subtitle: `${doc.fileType.toUpperCase()} • ${doc.fileSize}`,
                        snippet:
                          doc.previewSnippet ||
                          doc.description ||
                          doc.fileName,
                        suspectToTag:
                          doc.suspectTag ||
                          `Cloud của tôi (${doc.fileName})`,
                      }}
                      onTriggerEvidence={() => setEvidenceSheetDoc(doc)}
                      className="w-full max-w-[88%]"
                    >
                      <div
                        onClick={() => showToast('Nhấn giữ tài liệu để ghim vào Sổ tay')}
                        className="w-full bg-[#EAF4FE] rounded-2xl p-2.5 shadow-xs border border-sky-200/80 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        {/* Forward Sender line */}
                        <div className="flex items-center gap-1.5 text-ios-footnote text-slate-600 mb-2">
                          <span>Từ</span>
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-ios-caption-2 font-bold text-white flex items-center justify-center shrink-0">
                            {doc.senderName ? doc.senderName.charAt(0) : 'N'}
                          </div>
                          <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                            {doc.senderName || 'Người gửi'}
                          </span>
                          <IoChevronForward className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>

                        {/* White Document Preview Sheet */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs space-y-1.5">
                          <div className="text-center font-bold text-ios-caption-2 tracking-wider text-slate-800 uppercase">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </div>
                          <div className="text-center text-ios-caption-2 font-medium text-slate-600">
                            Độc lập - tự do - hạnh phúc
                          </div>
                          <div className="w-12 h-[1px] bg-slate-300 mx-auto my-1" />

                          <div className="text-center font-bold text-ios-subheadline text-slate-900 mt-1 uppercase">
                            {doc.previewTitle || (doc.clueRefId ? 'HỢP ĐỒNG THUÊ PHÒNG TRỌ' : doc.fileName)}
                          </div>

                          <div className="text-center text-ios-footnote text-slate-500 italic">
                            {doc.previewSubtitle || doc.description}
                          </div>

                          {/* Content snippet */}
                          <div className="text-ios-footnote text-slate-700 space-y-0.5 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                            {doc.previewSnippet || (
                              doc.clueRefId === 'CLUE-ZOLA-07' ? (
                                <>
                                  <div><strong>1. BÊN A (Cho thuê):</strong> BÙI QUANG BÁCH (Chủ nhà)</div>
                                  <div><strong>2. BÊN B (Bên thuê):</strong> NGUYỄN HUY HOÀNG</div>
                                  <div><strong>3. Địa chỉ:</strong> Phòng 402, Ngõ 85 Chùa Láng, Đống Đa</div>
                                  <div><strong>4. Giá thuê:</strong> 6.500.000 đ/tháng • Cọc: 5.000.000 đ</div>
                                </>
                              ) : (
                                doc.description
                              )
                            )}
                          </div>
                        </div>

                        {/* Document Attachment Strip */}
                        <div className="bg-[#E3F2FD] rounded-xl p-2.5 flex items-center gap-2.5 mt-2 border border-sky-100">
                          {/* File Type Icon */}
                          {doc.fileType === 'pdf' ? (
                            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-black flex items-center justify-center text-ios-caption-2 tracking-tighter shadow-xs shrink-0">
                              PDF
                            </div>
                          ) : doc.fileType === 'xlsx' ? (
                            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-ios-caption-2 shadow-xs shrink-0">
                              XLS
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#0088FF] text-white font-black flex items-center justify-center text-ios-caption-1 shadow-xs shrink-0">
                              W
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-ios-subheadline text-[#0F172A] truncate">
                              {doc.fileName}
                            </div>
                            <div className="text-ios-footnote text-slate-500 font-medium mt-0.5">
                              {doc.fileType.toUpperCase()} • {doc.fileSize}
                            </div>
                          </div>
                        </div>
                      </div>
                    </StoryEvidenceTarget>

                    {/* Exterior Actions & Status Controls */}
                    <div className="flex items-center gap-2 pr-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Nhấn giữ tài liệu để ghim vào Sổ tay');
                        }}
                        className="w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-90 transition-all"
                        aria-label="Chia sẻ / Ghim bằng chứng"
                        title="Nhấn giữ tài liệu để ghim vào Sổ tay"
                      >
                        <IoShareSocialOutline className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-2 py-0.5 rounded-full bg-slate-400/50 text-white text-ios-caption-2 font-medium">
                        {doc.time || '17:07'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => toggleHeart(doc.id, e)}
                        className={`w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center transition-all active:scale-90 ${
                          isHearted ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        aria-label="Thích"
                      >
                        {isHearted ? <IoHeart className="w-3.5 h-3.5 text-rose-500" /> : <IoHeartOutline className="w-3.5 h-3.5" />}
                      </button>

                      <span className="px-2 py-0.5 rounded-full bg-slate-400/60 text-white text-ios-caption-2 font-medium flex items-center gap-1 shadow-xs">
                        <IoCheckmark className="w-2.5 h-2.5" />
                        <span>Đã gửi</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </main>

      {/* 4. Bottom Chat Input Bar */}
      <footer className="h-[52px] bg-white border-t border-slate-200 px-2 flex items-center gap-1 shrink-0 select-none shadow-sm z-10">
        <button
          type="button"
          onClick={() => showToast('Biểu cảm chỉ hỗ trợ trong cuộc trò chuyện')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-95 transition-all rounded-lg"
          aria-label="Biểu cảm"
        >
          <IoHappyOutline className="w-6 h-6" />
        </button>

        <div
          onClick={() => showToast('Cloud cá nhân: Nhấn giữ tài liệu để ghim vào Sổ Tay')}
          className="flex-1 h-9 px-3.5 bg-slate-100 hover:bg-slate-200/70 rounded-full flex items-center text-ios-subheadline text-slate-400 select-none border border-slate-200/80 cursor-text transition-all"
        >
          <span>Tin nhắn</span>
        </div>

        <button
          type="button"
          onClick={() => showToast('Tuỳ chọn Cloud: Tự động sao lưu đang bật')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-95 transition-all rounded-lg"
          aria-label="Thêm tuỳ chọn"
        >
          <IoEllipsisHorizontal className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => showToast('Ghi âm không khả dụng trong Cloud')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-95 transition-all rounded-lg"
          aria-label="Tin nhắn thoại"
        >
          <IoMicOutline className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('photos')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-95 transition-all rounded-lg"
          aria-label="Xem ảnh Cloud"
        >
          <IoImageOutline className="w-5 h-5" />
        </button>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 inset-x-4 z-50 flex justify-center pointer-events-none">
          <div className="px-3.5 py-1.5 bg-slate-900/90 text-white text-ios-footnote font-semibold rounded-full shadow-lg backdrop-blur-xs animate-fadeIn">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Evidence Sheet (CLUE-ZOLA-07 Pinning to Notebook) */}
      {evidenceSheetDoc && (
        <MessagingEvidenceSheet
          isOpen={Boolean(evidenceSheetDoc)}
          title={evidenceSheetDoc.fileName}
          subtitle={`Tài liệu Cloud • ${evidenceSheetDoc.fileSize}`}
          evidenceSnippet={
            evidenceSheetDoc.previewSnippet ||
            evidenceSheetDoc.description ||
            evidenceSheetDoc.textMessage ||
            'Tài liệu lưu trữ bí mật trong Cloud cá nhân'
          }
          suspectToTag={
            evidenceSheetDoc.suspectTag ||
            `Cloud của tôi (${evidenceSheetDoc.fileName})`
          }
          onPinEvidence={(suspectName) => onTagSuspect(suspectName)}
          onClose={() => setEvidenceSheetDoc(null)}
        />
      )}
    </div>
  );
};

export const ZolaMyDocumentsView = MessagingMyDocumentsView;
export default MessagingMyDocumentsView;
