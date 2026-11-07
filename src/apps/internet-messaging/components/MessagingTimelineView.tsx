import { useMotionState } from '../../../shared/motion/useMotionState';
import React from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoHeart,
  IoImageOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import { MessagingTimelinePost } from '../types';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';
import { StoryEvidenceTarget } from '../../../features/investigation';

interface MessagingTimelineViewProps {
  timelinePosts?: MessagingTimelinePost[];
  onTagSuspect?: (name: string) => void;
}

export type ZolaTimelineViewProps = MessagingTimelineViewProps;

export const MessagingTimelineView: React.FC<MessagingTimelineViewProps> = ({
  timelinePosts,
  onTagSuspect,
}) => {
  const [evidenceItem, setEvidenceItem] = useMotionState<{
    title: string;
    snippet: string;
    suspectTag: string;
    subtitle?: string;
    profileName?: string;
  } | null>(null, 'sheet');

  const posts = timelinePosts || [
    {
      id: 'p1',
      author: 'Lan Anh Kế Toán',
      avatarGradient: 'from-pink-400 to-rose-600',
      avatarInitials: 'L',
      timestamp: '15 phút trước',
      content:
        'Hôm nay team OT cật lực chốt sổ cuối quý, sếp hứa bao trà sữa mà chưa thấy tăm hơi đâu nhé! Cần lắm một sự tiếp tế năng lượng...',
      likesCount: 4,
      commentsCount: 2,
    },
    {
      id: 'p2',
      author: 'Tiệm Hoa Tươi Mimosa',
      avatarGradient: 'from-amber-400 to-orange-500',
      avatarInitials: 'TH',
      timestamp: '3 giờ trước',
      content:
        'Mẫu bó hoa hồng sáp đỏ 99 bông rực rỡ tượng trưng cho tình yêu vĩnh cửu vừa được giao đến tay khách hàng VIP chiều nay. Chúc hai bạn trăm năm hạnh phúc!',
      likesCount: 18,
      commentsCount: 5,
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F2F5] text-[#0F172A] select-none font-sans overflow-y-auto pb-24">
      {/* Header */}
      <header className="h-14 px-4 bg-[#0088FF] text-white flex items-center justify-between shrink-0 shadow-sm">
        <h2 className="text-ios-headline font-bold tracking-tight">Nhật ký</h2>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg"
          aria-label="Đăng ảnh mới"
        >
          <IoImageOutline className="w-5 h-5" />
        </button>
      </header>

      {/* Status Composer Bar */}
      <div className="bg-white p-3.5 mb-2.5 flex items-center gap-3 shadow-xs border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-bold text-ios-subheadline shadow-xs shrink-0">
          H
        </div>
        <div className="flex-1 px-3 py-2 rounded-full bg-slate-100 text-ios-subheadline text-[#64748B]">
          Hôm nay bạn thế nào?
        </div>
        <IoImageOutline className="w-6 h-6 text-emerald-500 shrink-0" />
      </div>

      {/* Timeline Feed Stream */}
      <div className="space-y-2.5 pb-6">
        {posts.map((post) => (
          <StoryEvidenceTarget
            key={post.id}
            item={{
              title: `Nhật ký: ${post.author}`,
              profileName: post.author,
              snippet: post.content,
              suspectToTag: post.suspectTag || post.author,
              subtitle: post.timestamp,
            }}
            onTriggerEvidence={(item) =>
              setEvidenceItem({
                title: item.title,
                snippet: item.snippet,
                suspectTag: item.suspectToTag,
                subtitle: item.subtitle,
                profileName: item.profileName,
              })
            }
          >
            <div className="bg-white p-4 shadow-xs border-y border-slate-100 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-tr ${
                    post.avatarGradient || 'from-sky-400 to-blue-600'
                  } text-white flex items-center justify-center font-bold text-ios-caption-1 shadow-xs`}
                >
                  {post.avatarInitials || post.author.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-ios-subheadline font-bold text-[#0F172A]">{post.author}</h4>
                  <span className="text-ios-caption-2 text-[#94A3B8]">{post.timestamp}</span>
                </div>
              </div>

              <p className="text-ios-subheadline text-[#1E293B] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-50 text-ios-footnote text-[#64748B]">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-rose-500 transition-colors min-h-[44px] min-w-[44px]"
                >
                  <IoHeart className="w-5 h-5 text-rose-500" />
                  <span>{post.likesCount}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px]"
                >
                  <IoChatbubbleEllipsesOutline className="w-5 h-5" />
                  <span>{post.commentsCount}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-blue-500 transition-colors ml-auto min-h-[44px] min-w-[44px]"
                >
                  <IoShareSocialOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </StoryEvidenceTarget>
        ))}
      </div>

      {/* Evidence Sheet on long-press */}
      {evidenceItem && (
        <MessagingEvidenceSheet
          isOpen={Boolean(evidenceItem)}
          title={evidenceItem.title}
          profileName={evidenceItem.profileName}
          subtitle={evidenceItem.subtitle}
          evidenceSnippet={evidenceItem.snippet}
          suspectToTag={evidenceItem.suspectTag}
          onPinEvidence={(name) => {
            onTagSuspect?.(name);
            setEvidenceItem(null);
          }}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const ZolaTimelineView = MessagingTimelineView;
export default MessagingTimelineView;
