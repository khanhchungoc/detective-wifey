import { useMotionState } from '../../../shared/motion/useMotionState';
import React, { useState } from 'react';
import { IoBookOutline, IoChevronForward, IoPersonAddOutline, IoPersonOutline, IoSearchOutline } from 'react-icons/io5';
import { MessagingContact } from '../types';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';
import { StoryEvidenceTarget } from '../../../features/investigation';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';
import type { EvidenceSource } from '../../../shared/contracts/evidence';
import { contactEvidence } from '../contactEvidence';

interface MessagingContactsViewProps {
  caseId: string;
  contacts: MessagingContact[];
  onTagSuspect: (suspectName: string, source?: EvidenceSource) => void;
  onReturnHome: () => void;
}

export const MessagingContactsView: React.FC<MessagingContactsViewProps> = ({
  caseId,
  contacts,
  onTagSuspect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useMotionState<'all' | 'friends' | 'oa'>('all', 'fade');
  const [evidenceSheetContact, setEvidenceSheetContact] = useMotionState<MessagingContact | null>(null, 'sheet');

  // Filter contacts by query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  });

  // Group contacts by section
  const sections = Array.from(new Set(filteredContacts.map((c) => c.section))).sort();
  const contactSource = evidenceSheetContact ? contactEvidence(caseId, evidenceSheetContact) : undefined;

  return (
    <div className="flex flex-col h-full w-full bg-[#FFFFFF] text-[#0F172A] select-none font-sans overflow-hidden">
      {/* Search Header */}
      <header className="h-14 px-3 bg-[#0088FF] flex items-center gap-2 shrink-0 shadow-sm z-10">
        <div className="flex-1 h-9 bg-white/20 rounded-lg flex items-center px-2.5 gap-2 text-white">
          <IoSearchOutline className="w-4 h-4 text-white/80 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bạn bè, danh bạ..."
            className="w-full bg-transparent text-ios-subheadline text-white placeholder-white/70 outline-hidden"
          />
        </div>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg shrink-0"
          aria-label="Thêm liên hệ mới"
        >
          <IoPersonAddOutline className="w-5 h-5" />
        </button>
      </header>

      {/* Main List */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Quick Contacts Actions */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer min-h-[44px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0088FF] flex items-center justify-center shrink-0">
                <IoPersonOutline className="w-5 h-5" />
              </div>
              <span className="text-ios-subheadline font-semibold text-[#0F172A]">
                Lời mời kết bạn
              </span>
            </div>
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-ios-caption-2 font-bold flex items-center justify-center">
              1
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer min-h-[44px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <IoBookOutline className="w-5 h-5" />
              </div>
              <span className="text-ios-subheadline font-semibold text-[#0F172A]">
                Danh bạ máy (Đồng bộ)
              </span>
            </div>
            <span className="text-ios-footnote text-[#52525B]">(342 số)</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-ios-footnote font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-[#E4E6EB] text-[#050505]'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('friends')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-ios-footnote font-bold transition-all ${
              selectedFilter === 'friends'
                ? 'bg-[#E4E6EB] text-[#050505]'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            Bạn bè
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('oa')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-ios-footnote font-bold transition-all ${
              selectedFilter === 'oa'
                ? 'bg-[#E4E6EB] text-[#050505]'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            OA
          </button>
        </div>

        {/* Grouped Contacts List */}
        {sections.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-[#52525B]">
            Không tìm thấy liên hệ phù hợp.
          </div>
        ) : (
          sections.map((section) => (
            <div key={section} className="border-b border-slate-100">
              <div className="px-3 py-1 bg-[#F0F2F5] text-ios-caption-1 font-bold text-[#64748B]">
                {section}
              </div>
              <div className="divide-y divide-slate-100">
                {filteredContacts
                  .filter((c) => c.section === section)
                  .map((contact) => (
                    <StoryEvidenceTarget
                      key={contact.id}
                      item={{
                        title: contact.name,
                        subtitle: contact.department || (contact.phone ? `SĐT: ${contact.phone}` : undefined),
                        snippet: `${contact.name}${contact.department ? ` • ${contact.department}` : ''}${
                          contact.phone ? ` • SĐT: ${contact.phone}` : ''
                        }${contact.isBlocked ? ' (Đã bị ẩn/chặn)' : ''}`,
                        suspectToTag: contact.name,
                      }}
                      onTriggerEvidence={() => setEvidenceSheetContact(contact)}
                    >
                      <div className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-all cursor-pointer min-h-[60px]">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <ContactAvatar name={contact.name} size={40} />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-ios-headline font-bold text-[#0F172A] truncate">
                              {contact.name}
                            </h4>
                            {(contact.phone || contact.department) && (
                              <p className="text-ios-footnote text-[#64748B] truncate mt-0.5">
                                {contact.phone && `SĐT: ${contact.phone}`}
                                {contact.phone && contact.department && ' • '}
                                {contact.department}
                              </p>
                            )}
                            {contact.isBlocked && (
                              <span className="text-ios-caption-1 text-rose-500 font-semibold block mt-0.5">
                                Đã bị ẩn / chặn liên lạc
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <IoChevronForward className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </StoryEvidenceTarget>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Action Sheet on Contact */}
      {evidenceSheetContact && (
        <MessagingEvidenceSheet
          isOpen={Boolean(evidenceSheetContact)}
          title={`Hồ sơ danh bạ: ${evidenceSheetContact.name}`}
          subtitle={
            evidenceSheetContact.phone
              ? `SĐT: ${evidenceSheetContact.phone} • ${
                  evidenceSheetContact.department || ''
                }`
              : evidenceSheetContact.department
          }
          evidenceSnippet={`Liên hệ: ${evidenceSheetContact.name}${
            evidenceSheetContact.phone ? ` | SĐT: ${evidenceSheetContact.phone}` : ''
          }${
            evidenceSheetContact.department
              ? ` | Phòng: ${evidenceSheetContact.department}`
              : ''
          }`}
          suspectToTag={evidenceSheetContact.name}
          source={contactSource}
          onPinEvidence={(name) => onTagSuspect(name, contactSource)}
          onClose={() => setEvidenceSheetContact(null)}
        />
      )}
    </div>
  );
};

export const ZolaContactsView = MessagingContactsView;
export default MessagingContactsView;
