import { IoDownloadOutline, IoShareOutline } from 'react-icons/io5';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { StoryEvidenceTarget } from '../../../features/investigation';
import type { UniversalEvidenceItem } from '../../../features/investigation';
import type { AppCaseContext } from '../../../shared/contracts/app-contracts';
import { transactionEvidence } from '../bankingEvidence';
import type { BankingTransaction } from '../types';

const categoryLabels: Record<string, string> = {
  transfer: 'Chuyển tiền',
  salary: 'Lương',
  utility: 'Hóa đơn',
  dining: 'Ăn uống',
  hotel: 'Khách sạn',
};

interface BankingReceiptProps {
  caseData: AppCaseContext;
  transaction: BankingTransaction;
  onClose: () => void;
  onEvidence: (item: UniversalEvidenceItem) => void;
  evidenceOpen: boolean;
}

export function BankingReceipt({ caseData, transaction, onClose, onEvidence, evidenceOpen }: BankingReceiptProps) {
  const fields = [
    [transaction.direction === 'inflow' ? 'Người gửi' : 'Người nhận', transaction.counterpartyName],
    ['Ngân hàng đối tác', transaction.counterpartyBank],
    ['Số tài khoản đối tác', transaction.counterpartyAccount],
    ['Thời gian', transaction.timestamp],
    ['Mã giao dịch', transaction.reference],
    ['Loại giao dịch', transaction.category && (categoryLabels[transaction.category] || transaction.category)],
  ];

  const isOutflow = transaction.direction === 'outflow';

  return (
    <BottomSheet title="Biên lai giao dịch" onClose={onClose} suspended={evidenceOpen}>
      <StoryEvidenceTarget item={transactionEvidence(caseData, transaction)} onTriggerEvidence={onEvidence}>
        <div className="py-4 text-center">
          <p
            className={`bank-amount text-3xl font-bold tracking-tight ${
              isOutflow ? 'text-[#111827]' : 'text-[#00A86B]'
            }`}
          >
            {transaction.formattedAmount}
          </p>
          {transaction.status && (
            <div className="mt-2.5">
              <span className="inline-block rounded-full bg-[#00A86B]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#00A86B]">
                {transaction.status}
              </span>
            </div>
          )}
        </div>

        <dl className="space-y-3.5 border-y border-dashed border-[#E5E7EB] py-4 text-sm">
          {fields.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-ios-footnote text-[#6B7280]">{label}</dt>
              <dd className="bank-amount max-w-full break-words text-sm font-semibold text-[#111827]">
                {value || '-'}
              </dd>
            </div>
          ))}
        </dl>

        <div className="py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
            Lời nhắn (Nội dung CK)
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl bg-[#F5F6F8] p-4 text-sm italic leading-relaxed text-[#111827] border border-[#E5E7EB]">
            {transaction.memo || '-'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
          <button
            type="button"
            disabled
            aria-label="Chia sẻ biên lai"
            className="bank-control flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#111827] opacity-60 cursor-not-allowed shadow-sm"
          >
            <IoShareOutline className="h-4 w-4" /> Chia sẻ
          </button>
          <button
            type="button"
            disabled
            aria-label="Lưu ảnh biên lai"
            className="bank-control flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#111827] opacity-60 cursor-not-allowed shadow-sm"
          >
            <IoDownloadOutline className="h-4 w-4" /> Lưu ảnh
          </button>
        </div>
      </StoryEvidenceTarget>
    </BottomSheet>
  );
}
