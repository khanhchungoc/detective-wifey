import { useState, useMemo } from 'react';
import { IoArrowDownOutline, IoArrowUpOutline } from 'react-icons/io5';
import { StoryEvidenceTarget } from '../../../features/investigation';
import type { UniversalEvidenceItem } from '../../../features/investigation';
import type { AppCaseContext } from '../../../shared/contracts/app-contracts';
import { filterTransactions } from '../bankingData';
import { transactionEvidence } from '../bankingEvidence';
import type { BankingTransaction, TransactionFilter } from '../types';

interface BankingHistoryProps {
  caseData: AppCaseContext;
  transactions: BankingTransaction[];
  filter: TransactionFilter;
  onFilter: (filter: TransactionFilter) => void;
  onOpen: (transaction: BankingTransaction) => void;
  onEvidence: (item: UniversalEvidenceItem) => void;
}

const directionalFilters: { value: TransactionFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'inflow', label: 'Tiền vào (+)' },
  { value: 'outflow', label: 'Tiền ra (-)' },
];

const periodFilters = [
  { id: '7d', label: '7 ngày trước' },
  { id: '30d', label: '30 ngày trước' },
  { id: '60d', label: '60 ngày trước' },
];

const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function formatDateGroup(dateStr: string): string {
  const lower = dateStr.trim().toLowerCase();
  if (lower === 'hôm qua' || lower.includes('hôm qua')) return 'Hôm qua';
  if (lower === 'hôm nay' || lower.includes('hôm nay')) return 'Hôm nay';

  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const dateObj = new Date(year, month - 1, day);
    const dayName = VIETNAMESE_DAYS[dateObj.getDay()] || 'Thứ';
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    return `${dayName}, ${dd} Thg ${mm}, ${year}`;
  }
  return dateStr;
}

function extractDateKey(timestamp: string): string {
  const match = timestamp.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (match) return match[1];
  const lower = timestamp.toLowerCase();
  if (lower.includes('hôm qua')) return 'Hôm qua';
  if (lower.includes('hôm nay')) return 'Hôm nay';
  return timestamp.split(' ')[0] || timestamp;
}

export function BankingHistory({ caseData, transactions, filter, onFilter, onOpen, onEvidence }: BankingHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const visible = filterTransactions(transactions, filter);

  // Group transactions chronologically by date
  const groupedTransactions = useMemo(() => {
    const groups: { dateKey: string; displayDate: string; items: BankingTransaction[] }[] = [];
    let currentKey = '';
    let currentGroup: { dateKey: string; displayDate: string; items: BankingTransaction[] } | null = null;

    for (const tx of visible) {
      const key = extractDateKey(tx.timestamp);
      if (key !== currentKey) {
        currentKey = key;
        currentGroup = {
          dateKey: key,
          displayDate: formatDateGroup(key),
          items: [],
        };
        groups.push(currentGroup);
      }
      currentGroup?.items.push(tx);
    }
    return groups;
  }, [visible]);

  return (
    <section aria-label="Lịch sử giao dịch" className="flex flex-col min-h-full bg-white p-4 pb-12">
      {/* 1. Header & Title */}
      <div className="pb-3">
        <h2 className="text-2xl font-bold tracking-tight text-[#000000]">Hoạt động gần đây</h2>
      </div>

      {/* 2. Time Period Quick-Filter Pills */}
      <div aria-label="Bộ lọc thời gian" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {periodFilters.map(period => {
          const isActive = selectedPeriod === period.id;
          return (
            <button
              key={period.id}
              type="button"
              onClick={() => setSelectedPeriod(period.id)}
              aria-pressed={isActive}
              className={`bank-control rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-[#E5E7EB] hover:bg-neutral-50'
              }`}
            >
              {period.label}
            </button>
          );
        })}
      </div>

      {/* Directional Layer Filters */}
      <div aria-label="Bộ lọc giao dịch" className="mt-1 flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#F3F4F6] scrollbar-none">
        {directionalFilters.map(({ value, label }) => {
          const isActive = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onFilter(value)}
              aria-pressed={isActive}
              className={`bank-control rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F5F6F8] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Transaction Feed Grouped by Date */}
      <div className="flex-1 space-y-4 pt-2">
        {groupedTransactions.map(group => (
          <div key={group.dateKey} className="space-y-1">
            {/* Date Section Header */}
            <div className="pt-3 pb-1 px-1 text-ios-footnote font-normal text-[#8E8E93]">
              {group.displayDate}
            </div>

            {/* Transaction Rows */}
            <div className="divide-y divide-[#F3F4F6]">
              {group.items.map(transaction => (
                <StoryEvidenceTarget
                  key={transaction.id}
                  item={transactionEvidence(caseData, transaction)}
                  onTriggerEvidence={onEvidence}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(transaction)}
                    className="bank-control w-full min-h-[48px] py-3 px-1 text-left hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Directional Badge + Counterparty + Subtitle Memo */}
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                            transaction.direction === 'inflow'
                              ? 'border-[#00A86B] text-[#00A86B]'
                              : 'border-[#111827] text-[#111827]'
                          }`}
                        >
                          {transaction.direction === 'inflow' ? (
                            <IoArrowDownOutline className="h-4 w-4 rotate-45" />
                          ) : (
                            <IoArrowUpOutline className="h-4 w-4 rotate-45" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="uppercase break-words text-base font-bold leading-tight text-[#111827]">
                            {transaction.counterpartyName}
                          </p>
                          <p className="mt-0.5 truncate text-ios-footnote text-[#6B7280]">
                            {transaction.memo || transaction.timestamp}
                          </p>
                        </div>
                      </div>

                      {/* Right: Tabular Amount */}
                      <div className="shrink-0 text-right">
                        <p
                          className={`bank-amount text-base font-bold leading-tight ${
                            transaction.direction === 'inflow' ? 'text-[#00A86B]' : 'text-[#111827]'
                          }`}
                        >
                          {transaction.formattedAmount}
                        </p>
                        <p className="mt-0.5 text-ios-caption-2 text-[#8E8E93]">
                          {transaction.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                </StoryEvidenceTarget>
              ))}
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <p role="status" className="py-12 text-center text-base text-[#6B7280]">
            {transactions.length ? 'Không có giao dịch phù hợp.' : 'Chưa có giao dịch.'}
          </p>
        )}
      </div>

      {/* 5. Floating Support Tooltip */}
      <div className="sticky bottom-2 flex justify-end px-2 pointer-events-none mt-6">
        <button
          type="button"
          onClick={() => {}}
          aria-label="Không tìm thấy giao dịch?"
          className="pointer-events-auto rounded-2xl bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#007AFF] shadow-lg border border-[#E5E7EB] hover:bg-[#F5F6F8] active:scale-95 transition-all"
        >
          Không tìm thấy<br />giao dịch?
        </button>
      </div>
    </section>
  );
}
