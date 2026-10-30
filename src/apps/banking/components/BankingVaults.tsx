import { IoChevronForward, IoLockClosedOutline, IoWalletOutline } from 'react-icons/io5';
import { StoryEvidenceTarget } from '../../../features/investigation';
import type { UniversalEvidenceItem } from '../../../features/investigation';
import type { AppCaseContext } from '../../../shared/contracts/app-contracts';
import { bankingEvidence } from '../bankingEvidence';
import { bankingVaultChallenge } from '../bankingData';
import type { BankingVault } from '../types';

interface BankingVaultsProps {
  caseData: AppCaseContext;
  vaults: BankingVault[];
  unlockedChallenges: ReadonlySet<string>;
  onSelect: (vault: BankingVault) => void;
  onEvidence: (item: UniversalEvidenceItem) => void;
}

export function BankingVaults({ caseData, vaults, unlockedChallenges, onSelect, onEvidence }: BankingVaultsProps) {
  const unlockedVaults = vaults.filter(vault => {
    const challenge = bankingVaultChallenge(caseData, vault);
    const locked = caseData.levelNumber > 1 && Boolean(vault.lockChallengeId || challenge) && (!challenge || !unlockedChallenges.has(challenge.challengeId));
    return !locked;
  });

  const totalAccumulated = unlockedVaults.reduce(
    (sum, v) => sum + (parseInt(v.currentAmount.replace(/[^\d]/g, ''), 10) || 0),
    0
  );

  return (
    <section aria-label="Tiết kiệm" className="space-y-4 p-4 pb-12">
      {/* Tổng tích lũy Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121212] via-[#1E242E] to-[#2B3240] p-5 text-white shadow-md">
        <p className="text-ios-footnote font-medium text-neutral-400">Tổng tích lũy</p>
        <p className="bank-amount mt-1.5 text-2xl font-bold tracking-tight text-white">
          {unlockedVaults.length > 0
            ? `${totalAccumulated.toLocaleString('vi-VN')} đ`
            : vaults.length > 0
            ? '•••••••• đ'
            : '0 đ'}
        </p>
      </div>

      <div>
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Hũ đang hoạt động
        </h3>
      </div>

      <div className="space-y-3">
        {vaults.map(vault => {
          const challenge = bankingVaultChallenge(caseData, vault);
          const locked = caseData.levelNumber > 1 && Boolean(vault.lockChallengeId || challenge) && (!challenge || !unlockedChallenges.has(challenge.challengeId));

          const card = (
            <button
              type="button"
              onClick={() => onSelect(vault)}
              className="bank-control flex w-full items-start gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm hover:border-[#ED1C24]/40 transition-colors"
            >
              {locked ? (
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[#6B7280]">
                  <IoLockClosedOutline aria-hidden="true" className="h-5 w-5" />
                </div>
              ) : (
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ED1C24]/10 text-[#ED1C24]">
                  <IoWalletOutline aria-hidden="true" className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="break-words text-base font-bold text-[#111827]">
                  {locked ? 'Hũ tiết kiệm được bảo vệ' : vault.name}
                </h2>
                {locked ? (
                  <p className="mt-1 text-ios-footnote text-[#6B7280]">Nhập mã PIN để xem</p>
                ) : (
                  <>
                    <p className="bank-amount mt-2 text-sm font-semibold text-[#111827]">
                      Số tiền gửi: {vault.currentAmount}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-ios-footnote text-[#6B7280]">
                      {vault.details || `Mục tiêu: ${vault.targetAmount}`}
                    </p>
                  </>
                )}
              </div>
              <IoChevronForward aria-hidden="true" className="mt-2 h-5 w-5 shrink-0 text-[#8E8E93]" />
            </button>
          );

          return locked ? (
            <div key={vault.id}>{card}</div>
          ) : (
            <StoryEvidenceTarget
              key={vault.id}
              item={bankingEvidence(caseData, vault, vault.name, `Số tiền gửi: ${vault.currentAmount}\n${vault.details || `Mục tiêu: ${vault.targetAmount}`}`)}
              onTriggerEvidence={onEvidence}
            >
              {card}
            </StoryEvidenceTarget>
          );
        })}
      </div>

      {!vaults.length && (
        <p role="status" className="py-12 text-center text-base text-[#6B7280]">
          Chưa có hũ tiết kiệm.
        </p>
      )}
    </section>
  );
}

export function BankingVaultDetail({
  caseData,
  vault,
  onEvidence,
}: {
  caseData: AppCaseContext;
  vault: BankingVault;
  onEvidence: (item: UniversalEvidenceItem) => void;
}) {
  return (
    <section aria-label="Chi tiết tiết kiệm" className="space-y-4 p-4 pb-12">
      {/* Hero Vault Card */}
      <StoryEvidenceTarget
        item={bankingEvidence(caseData, vault, vault.name, `Số tiền gửi: ${vault.currentAmount}\n${vault.details || `Mục tiêu: ${vault.targetAmount}`}`)}
        onTriggerEvidence={onEvidence}
      >
        <div className="rounded-2xl bg-gradient-to-br from-[#121212] via-[#1E242E] to-[#2B3240] p-5 text-white shadow-md">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-ios-caption-2 font-semibold text-[#FFA07A]">
            Hũ tiết kiệm mục tiêu
          </span>
          <h2 className="mt-3 break-words text-xl font-bold">{vault.name}</h2>
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-ios-caption-2 text-neutral-400">Số tiền gửi</p>
            <p className="bank-amount mt-1 text-2xl font-bold tracking-tight text-white">{vault.currentAmount}</p>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-ios-footnote text-neutral-300">
            {vault.details || `Mục tiêu: ${vault.targetAmount}`}
          </p>
        </div>
      </StoryEvidenceTarget>

      <div>
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Lịch sử nộp tiền
        </h3>
      </div>

      <div className="space-y-2.5">
        {vault.deposits.map(deposit => (
          <StoryEvidenceTarget
            key={deposit.id}
            item={bankingEvidence(
              caseData,
              {
                ...deposit,
                suspectName: deposit.suspectName || vault.suspectName,
                suspectId: deposit.suspectId || vault.suspectId,
                clueRefId: deposit.clueRefId || vault.clueRefId,
              },
              vault.name,
              `${deposit.amount}\n${deposit.note}`,
              deposit.date ? `Thời gian: ${deposit.date}` : undefined,
            )}
            onTriggerEvidence={onEvidence}
          >
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="break-words text-ios-footnote text-[#8E8E93]">{deposit.date}</p>
                <p className="bank-amount text-sm font-bold text-[#00A86B]">+{deposit.amount}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#111827]">
                {deposit.note || '-'}
              </p>
            </div>
          </StoryEvidenceTarget>
        ))}

        {!vault.deposits.length && (
          <p role="status" className="py-8 text-center text-sm text-[#6B7280]">
            Chưa có lịch sử nộp tiền.
          </p>
        )}
      </div>
    </section>
  );
}
