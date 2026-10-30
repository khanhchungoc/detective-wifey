import { useMotionState } from '../../shared/motion/useMotionState';
import { useMemo, type ComponentType } from 'react';
import {
  IoCard,
  IoCardOutline,
  IoChevronBack,
  IoGiftOutline,
  IoLockClosedOutline,
  IoNotificationsOutline,
  IoPieChartOutline,
  IoSearchOutline,
  IoSwapHorizontalOutline,
} from 'react-icons/io5';
import type { AppDefinition, VirtualAppProps } from '../../shared/contracts/app-contracts';
import { UniversalEvidenceModal, type UniversalEvidenceItem } from '../../features/investigation';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { bankingAppChallenge, bankingVaultChallenge, readBankingData } from './bankingData';
import { BankingDashboard, BankingProfile, BankingTransferView } from './components/BankingDashboard';
import { BankingHistory } from './components/BankingHistory';
import { BankingReceipt } from './components/BankingReceipt';
import { BankingVaultDetail, BankingVaults } from './components/BankingVaults';
import type { BankingTab, BankingTransaction, BankingVault, TransactionFilter } from './types';
import './banking.css';
import bankingLogo from './assets/banking-logo.svg';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('banking');

function TechcornHomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 12L9 7L11 9L8 12L11 15L9 17L4 12Z" />
      <path d="M20 12L15 7L13 9L16 12L13 15L15 17L20 12Z" />
    </svg>
  );
}

const tabs: { id: BankingTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Trang chủ', icon: TechcornHomeIcon },
  { id: 'history', label: 'Tài khoản & Thẻ', icon: IoCardOutline },
  { id: 'transfer', label: 'Chuyển tiền & TT', icon: IoSwapHorizontalOutline },
  { id: 'profile', label: 'Techcornbank OneU', icon: IoGiftOutline },
  { id: 'vaults', label: 'Tổng quan tài sản', icon: IoPieChartOutline },
];

export function BankingApp({ caseData, onTagSuspect, onReturnHome, onRequestUnlock, unlockedChallenges }: VirtualAppProps) {
  const rawData: unknown = caseData.appsData?.banking;
  const data = useMemo(() => readBankingData(rawData), [rawData]);
  const [activeTab, setActiveTab] = useMotionState<BankingTab>('home', 'fade');
  const [filter, setFilter] = useMotionState<TransactionFilter>('all', 'fade');
  const [selectedTx, setSelectedTx] = useMotionState<BankingTransaction | null>(null, 'sheet');
  const [selectedVaultId, setSelectedVaultId] = useMotionState<string | null>(null, 'navigation');
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const rootChallenge = data ? bankingAppChallenge(caseData, data) : undefined;
  const appLocked = caseData.levelNumber > 1 && Boolean(rootChallenge || data?.isAppLocked) && (!rootChallenge || !unlockedChallenges.has(rootChallenge.challengeId));
  const candidate = data?.vaults.find(vault => vault.id === selectedVaultId);
  const vaultChallenge = candidate ? bankingVaultChallenge(caseData, candidate) : undefined;
  const vaultLocked = caseData.levelNumber > 1 && Boolean(candidate?.lockChallengeId || vaultChallenge) && (!vaultChallenge || !unlockedChallenges.has(vaultChallenge.challengeId));
  const selectedVault = !vaultLocked ? candidate : undefined;

  const navigate = (tab: BankingTab) => {
    setActiveTab(tab);
    setSelectedVaultId(null);
    setSelectedTx(null);
    setEvidenceItem(null);
  };

  const handleBack = () => {
    if (evidenceItem) setEvidenceItem(null);
    else if (selectedTx) setSelectedTx(null);
    else if (selectedVaultId) setSelectedVaultId(null);
    else if (activeTab !== 'home') navigate('home');
    else onReturnHome();
  };

  const swipe = useSwipeBack({ onBack: handleBack, enabled: !selectedTx && !evidenceItem && !selectedVault });
  const vaultSwipe = useSwipeBack({ onBack: () => setSelectedVaultId(null), enabled: Boolean(selectedVault) });

  const selectVault = (vault: BankingVault) => {
    setSelectedVaultId(vault.id);
    const challenge = bankingVaultChallenge(caseData, vault);
    if (challenge && !unlockedChallenges.has(challenge.challengeId)) onRequestUnlock?.(challenge.challengeId);
  };

  const title = appLocked || activeTab === 'home' ? 'Ngân hàng'
    : selectedVault ? 'Chi tiết hũ quỹ' : tabs.find(tab => tab.id === activeTab)?.label || 'Ngân hàng';

  const initials = caseData.husbandName
    ? caseData.husbandName.split(' ').filter(Boolean).slice(-2).map(p => p[0]).join('').toUpperCase()
    : 'PB';

  const tier = data?.tier ? data.tier.charAt(0).toUpperCase() + data.tier.slice(1) : 'Inspire';

  return (
    <div
      {...swipe}
      className="app-banking relative flex h-full min-h-0 w-full flex-col overflow-hidden select-none font-sans bg-[#F5F6F8]"
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); handleBack(); } }}
      onKeyDownCapture={event => { if (event.key === 'Escape' && evidenceItem) { event.stopPropagation(); setEvidenceItem(null); } }}
    >
      <div
        className="relative flex h-full min-h-0 w-full flex-col overflow-hidden"
        inert={Boolean(selectedVault)}
        aria-hidden={Boolean(selectedVault)}
      >
        {/* Top Header */}
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] bg-white px-3 py-1.5 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={activeTab === 'home' || appLocked ? 'Về màn hình chính' : 'Quay lại'}
              onClick={handleBack}
              className="bank-control flex shrink-0 items-center justify-center text-[#111827] hover:bg-neutral-100"
            >
              <IoChevronBack aria-hidden="true" className="h-6 w-6" />
            </button>

            {/* Left User Avatar + Tier (On Home view) */}
            {activeTab === 'home' && !appLocked && (
              <button
                type="button"
                onClick={() => navigate('profile')}
                aria-label={`Hồ sơ ${caseData.husbandName || 'Pham Quoc Bao'}, Hạng ${tier}`}
                className="bank-control flex items-center gap-1.5 rounded-full p-1 hover:bg-neutral-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ED1C24] text-xs font-bold text-white shadow-xs">
                  {initials}
                </span>
                <span className="rounded-full bg-[#ED1C24]/10 px-2 py-0.5 text-ios-caption-2 font-semibold text-[#ED1C24]">
                  {tier}
                </span>
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-2">
            <img src={bankingLogo} alt="" aria-hidden="true" draggable={false} className="h-7 w-7 shrink-0" />
            <h1 className="min-w-0 truncate text-center text-base font-bold tracking-tight text-[#111827]">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              aria-label="Tìm kiếm giao dịch"
              className="bank-control flex shrink-0 items-center justify-center text-[#6B7280] opacity-60"
            >
              <IoSearchOutline aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled
              aria-label={`Thông báo${data?.unreadCount ? `: ${data.unreadCount}` : ''}`}
              className="bank-control relative flex shrink-0 items-center justify-center text-[#6B7280]"
            >
              <IoNotificationsOutline aria-hidden="true" className="h-5 w-5" />
              {!!data?.unreadCount && (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ED1C24] px-1 text-ios-caption-2 font-bold text-white shadow-xs"
                >
                  {data.unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main key={activeTab} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!data ? (
            <p role="status" className="p-8 text-center text-base text-[#6B7280]">
              {BRAND.emptyStateMessage ?? `Chưa có dữ liệu ${BRAND.brandName} cho màn này.`}
            </p>
          ) : appLocked ? (
            <section className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#B71C1C]/10 text-[#B71C1C]">
                <IoLockClosedOutline aria-hidden="true" className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-[#111827]">
                {BRAND.lockedMessage ?? `${BRAND.brandName} đang khóa`}
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Vui lòng xác thực mã PIN bảo mật để truy cập ứng dụng {BRAND.brandName}.
              </p>
              <button
                type="button"
                disabled={!rootChallenge || !onRequestUnlock}
                onClick={() => rootChallenge && onRequestUnlock?.(rootChallenge.challengeId)}
                className="bank-control inline-flex items-center justify-center rounded-xl bg-[#ED1C24] px-6 text-sm font-semibold text-white shadow-md hover:bg-[#B71C1C] transition-colors disabled:opacity-40"
              >
                Mở khóa {BRAND.brandName}
              </button>
              {!rootChallenge && (
                <p role="status" className="text-ios-footnote text-[#6B7280]">
                  Chưa có cấu hình mở khóa.
                </p>
              )}
            </section>
          ) : (
            <>
              {activeTab === 'home' && (
                <BankingDashboard
                  data={data}
                  onOpenHistory={() => navigate('history')}
                  onOpenVaults={() => navigate('vaults')}
                />
              )}
              {activeTab === 'history' && (
                <BankingHistory
                  caseData={caseData}
                  transactions={data.transactions}
                  filter={filter}
                  onFilter={setFilter}
                  onOpen={setSelectedTx}
                  onEvidence={setEvidenceItem}
                />
              )}
              {activeTab === 'transfer' && (
                <BankingTransferView onOpenHistory={() => navigate('history')} />
              )}
              {activeTab === 'vaults' && (
                <>
                  <BankingVaults
                    caseData={caseData}
                    vaults={data.vaults}
                    unlockedChallenges={unlockedChallenges}
                    onSelect={selectVault}
                    onEvidence={setEvidenceItem}
                  />
                  {vaultLocked && (
                    <p role="status" className="px-4 text-center text-ios-footnote text-[#6B7280]">
                      Hũ tiết kiệm đang khóa.
                    </p>
                  )}
                </>
              )}
              {activeTab === 'profile' && (
                <BankingProfile data={data} husbandName={caseData.husbandName} />
              )}
            </>
          )}
        </main>

        {/* 5-Tab Sticky Bottom Navigation Bar */}
        {!appLocked && (
          <nav
            aria-label={`Điều hướng ${BRAND.brandName}`}
            className="app-bottom-nav grid grid-cols-5 border-t border-[#E5E7EB] bg-white px-1 py-1 shadow-lg"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => navigate(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`bank-control flex min-w-0 flex-col items-center justify-center gap-1 text-center transition-colors ${
                    isActive ? 'text-[#ED1C24]' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={`max-w-full truncate text-ios-caption-2 leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Dimmed Scrim Overlay */}
        {selectedVault && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40 z-10 pointer-events-none transition-opacity duration-200"
          />
        )}
      </div>

      {/* Top Layer: Vault Detail View */}
      {selectedVault && (
        <div
          {...vaultSwipe}
          data-detail-layer
          className="absolute inset-0 z-20 flex flex-col h-full w-full bg-white shadow-2xl overflow-hidden"
        >
          <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] bg-white px-3 py-1.5 shadow-xs">
            <button
              type="button"
              aria-label="Quay lại danh sách hũ"
              onClick={() => setSelectedVaultId(null)}
              className="bank-control flex shrink-0 items-center justify-center text-[#111827] hover:bg-neutral-100"
            >
              <IoChevronBack aria-hidden="true" className="h-6 w-6" />
            </button>
            <div className="flex min-w-0 items-center justify-center gap-2">
              <img src={bankingLogo} alt="" aria-hidden="true" draggable={false} className="h-7 w-7 shrink-0" />
              <h1 className="min-w-0 truncate text-center text-base font-bold tracking-tight text-[#111827]">
                Chi tiết hũ quỹ
              </h1>
            </div>
            <div className="w-10" />
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#F5F6F8]">
            <BankingVaultDetail caseData={caseData} vault={selectedVault} onEvidence={setEvidenceItem} />
          </main>
        </div>
      )}

      {!appLocked && selectedTx && (
        <BankingReceipt
          caseData={caseData}
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onEvidence={setEvidenceItem}
          evidenceOpen={Boolean(evidenceItem)}
        />
      )}
      {!appLocked && evidenceItem && (
        <UniversalEvidenceModal
          isOpen
          item={evidenceItem}
          onPinEvidence={suspect => onTagSuspect(suspect, 'banking', evidenceItem.source)}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
}

export const appDefinition: AppDefinition = {
  dataKeys: ['banking'],
  appId: 'banking',
  displayName: BRAND.brandName,
  icon: IoCard,
  iconAsset: bankingLogo,
  themeGradient: 'from-[#ED1C24] to-[#B71C1C]',
  themeColor: '#ED1C24',
  bottomBarColor: '#FFFFFF',
  notificationBadgeCount: 1,
  isLocked: false,
  component: BankingApp,
};

export default BankingApp;
