import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appDefinition } from '../apps/banking';
import { BankingApp } from '../apps/banking/BankingApp';
import { bankingAppChallenge, bankingVaultChallenge, filterTransactions, readBankingData } from '../apps/banking/bankingData';
import { bankingEvidence, transactionEvidence } from '../apps/banking/bankingEvidence';
import { BankingHistory } from '../apps/banking/components/BankingHistory';
import { BankingReceipt } from '../apps/banking/components/BankingReceipt';
import { BankingVaults, BankingVaultDetail } from '../apps/banking/components/BankingVaults';
import { loadCase } from '../features/case-runtime';
import { LocalStorageAdapter } from '../features/session';
import { getAppBrand, getAppDisplayName } from '../shared/branding';
import type { VirtualAppProps } from '../shared/contracts/app-contracts';
import type { ActiveSessionState } from '../features/session';
import type { CaseConfig } from '../shared/contracts/case-schema';

import { useCaseFixtures } from './helpers/caseFixtures';

afterEach(() => vi.unstubAllGlobals());

function props(caseData: CaseConfig = loadCase('case_01')): VirtualAppProps {
  return { caseData, onTagSuspect: vi.fn(), onReturnHome: vi.fn(), onRequestUnlock: vi.fn(), unlockedChallenges: new Set() };
}

describe('US-004 banking inspection', () => {
  useCaseFixtures();
  it('launches with the approved brand, a masked balance, and no Home transaction feed', () => {
    const data = loadCase('case_01');
    const html = renderToStaticMarkup(createElement(BankingApp, props(data)));
    expect(appDefinition.displayName).toBe(getAppDisplayName('banking'));
    expect(appDefinition.themeColor).toBe('#ED1C24');
    expect(html).toContain('•••••••• đ');
    expect(html).toContain('Tài khoản &amp; lịch sử');
    expect(html).not.toContain('18.500.000');
    expect(html).not.toContain('Nguyen Thi Thu Huong');
    expect(html).not.toContain('Em gian anh');
    expect(html).not.toContain('Tiền vào (+)');
    expect(html).not.toContain('Tùy biến');
  });

  it('reads existing bundled records without changing case data or guessing receipt metadata', () => {
    const source: unknown = loadCase('case_01').appsData.banking;
    const snapshot = JSON.stringify(source);
    const data = readBankingData(source)!;
    expect(data.actualBalance).toBe('18.500.000 đ');
    expect(data.transactions.length).toBeGreaterThanOrEqual(60);
    expect(data.transactions.slice(0, 20).map(row => row.id)).toEqual([
      'tx_snack', 'tx_phone', 'tx_01', 'tx_lan_anh', 'tx_ngoc', 'tx_tuan_coc', 'tx_nam',
      'tx_breakfast', 'tx_refund', 'tx_water', 'tx_parking', 'tx_gym', 'tx_lunch',
      'tx_market', 'tx_ngoc_room', 'tx_fuel', 'tx_power', 'tx_net', 'tx_home', 'tx_salary',
    ]);
    expect(data.transactions.some(row => row.id === 'tx_02' || /huong/i.test(row.counterpartyName ?? ''))).toBe(false);
    expect(data.transactions.find(row => row.id === 'tx_01')).toMatchObject({
      direction: 'outflow', counterpartyName: 'COM NIEU PHO CO', memo: 'Thanh toan the', clueRefId: 'CLUE-BANK-07',
    });
    // Only the card payment is a clue; online transfers keep generic memos that the chats explain.
    expect(data.transactions.filter(row => row.clueRefId).map(row => row.id)).toEqual(['tx_01']);
    expect(data.transactions.find(row => row.id === 'tx_ngoc')).toMatchObject({ counterpartyName: 'NGUYEN BAO NGOC', memo: 'CK' });
    expect(data.transactions.find(row => row.id === 'tx_lan_anh')).toMatchObject({ counterpartyName: 'NGUYEN LAN ANH', memo: 'CK' });
    expect(data.transactions.find(row => row.id === 'tx_tuan_coc')).toMatchObject({ counterpartyName: 'TRAN VAN TUAN', memo: 'Coc' });
    expect(data.transactions[0].direction).toBe('outflow');
    expect(data.transactions[0].reference).toBeUndefined();
    expect(data.transactions[0].counterpartyBank).toBeUndefined();
    expect(data.transactions[0].status).toBe('Thành công');
    const sparse = readBankingData({ transactions: [{ id: 'sparse', amount: '-1000 đ' }] })!.transactions[0];
    expect(sparse.reference).toBeUndefined();
    expect(sparse.counterpartyBank).toBeUndefined();
    expect(sparse.status).toBeUndefined();
    expect(JSON.stringify(source)).toBe(snapshot);
  });

  it('sorts canonical timestamps and filters incoming/outgoing records without merging micro-transfers', () => {
    const data = readBankingData({ transactions: [
      { transactionId: 'first', type: 'outflow', amount: 1000, timestamp: '2026-10-13T23:45:00+07:00' },
      { transactionId: 'allowance', type: 'inflow', amount: 20000000, timestamp: '2026-10-13T10:15:00+07:00' },
      { transactionId: 'second', type: 'outflow', amount: 1000, timestamp: '2026-10-13T23:46:00+07:00' },
    ] })!;
    expect(data.transactions.map(row => row.id)).toEqual(['second', 'first', 'allowance']);
    expect(filterTransactions(data.transactions, 'outflow')).toHaveLength(2);
    expect(filterTransactions(data.transactions, 'inflow')[0].formattedAmount).toBe('+ 20.000.000 đ');
    expect(filterTransactions(data.transactions, 'all')).toHaveLength(3);
  });

  it('sorts legacy relative dates with times and rejects theme/unknown shortcut actions', () => {
    const data = readBankingData({ quickActions: ['theme', 'vaults', 'vaults', 'unknown'], transactions: [
      { id: 'older', date: 'Hôm qua', time: '23:59', amount: '-100 đ' },
      { id: 'late', date: 'Hôm nay', time: '23:50', amount: '-100 đ' },
      { id: 'early', date: 'Hôm nay', time: '01:00', amount: '+100 đ' },
    ] })!;
    expect(data.transactions.map(row => row.id)).toEqual(['late', 'early', 'older']);
    expect(data.quickActions).toEqual(['vaults', 'transfer', 'qr_pay', 'bills']);
    expect(new Set(data.quickActions).size).toBe(4);
  });

  it('renders complete receipt text and missing-field markers without a permanent pin button', () => {
    const memo = 'Nội dung kiểm thử đầy đủ. '.repeat(40) + 'DÒNG CUỐI';
    const row = readBankingData({ transactions: [{ id: 'receipt', amount: '-1000 đ', beneficiary: 'Đối tác từ dữ liệu', memo }] })!.transactions[0];
    const html = renderToStaticMarkup(createElement(BankingReceipt, { caseData: loadCase('case_01'), transaction: row, onClose: vi.fn(), onEvidence: vi.fn(), evidenceOpen: false }));
    expect(html).toContain('DÒNG CUỐI');
    expect(html).toContain('Người nhận');
    expect(html).toContain('-');
    expect(html).not.toContain('GIAO DỊCH THÀNH CÔNG');
    expect(html).not.toContain('Thêm vào Sổ Tay');
    expect(html).not.toContain('>Ghim');
  });

  it('hides all account and narrative content behind a configured Level 2 app gate', () => {
    const caseData = loadCase('case_02');
    const html = renderToStaticMarkup(createElement(BankingApp, props(caseData)));
    expect(html).toContain(getAppBrand('banking').lockedMessage ?? 'Techcornbank đang khóa');
    expect(html).not.toContain('125.000.000');
    expect(html).not.toContain('Tien tieu vat');
    expect(html).not.toContain(`Điều hướng ${getAppDisplayName('banking')}`);
    const unlocked = renderToStaticMarkup(createElement(BankingApp, { ...props(caseData), unlockedChallenges: new Set(['lock_banking']) }));
    expect(unlocked).toContain('Tài khoản &amp; lịch sử');
  });

  it('never creates a Level 1 gate and fails closed for a configured lock with no challenge', () => {
    const base = loadCase('case_01');
    const banking = readBankingData({ isAppLocked: true, lockChallengeId: 'absent' })!;
    expect(bankingAppChallenge(base, banking)).toBeUndefined();
    const caseData: CaseConfig = { ...base, levelNumber: 2, appsData: { banking: { isAppLocked: true } } };
    const html = renderToStaticMarkup(createElement(BankingApp, props(caseData)));
    expect(html).toContain('Chưa có cấu hình mở khóa.');
    expect(html).not.toContain('Tài khoản &amp; lịch sử');
  });

  it('does not reveal protected vault names, balances, or evidence before unlock', () => {
    const caseData: CaseConfig = { ...loadCase('case_02'), lockChallenges: [{ challengeId: 'vault-lock', targetType: 'vault', targetId: 'vault-1', lockType: 'numeric_pin', expectedAnswer: '0123', clueSourceApp: 'personal-notes' }] };
    const vaults = readBankingData({ vaults: [{ vaultId: 'vault-1', vaultName: 'TÊN ĐƯỢC BẢO VỆ', currentAmount: '123.456 đ', targetAmount: '999.999 đ' }] })!.vaults;
    expect(bankingVaultChallenge(caseData, vaults[0])?.challengeId).toBe('vault-lock');
    const locked = renderToStaticMarkup(createElement(BankingVaults, { caseData, vaults, unlockedChallenges: new Set<string>(), onSelect: vi.fn(), onEvidence: vi.fn() }));
    expect(locked).toContain('Hũ tiết kiệm được bảo vệ');
    expect(locked).not.toContain('TÊN ĐƯỢC BẢO VỆ');
    expect(locked).not.toContain('123.456');
    const unlocked = renderToStaticMarkup(createElement(BankingVaultDetail, { caseData, vault: vaults[0], onEvidence: vi.fn() }));
    expect(unlocked).toContain('TÊN ĐƯỢC BẢO VỆ');
    expect(unlocked).toContain('Chưa có lịch sử nộp tiền.');
  });

  it('retains source case, record, and clue identity with supplied attribution', () => {
    const caseData = loadCase('case_01');
    const row = readBankingData({ transactions: [{ id: 'test-source', amount: '-100 đ', beneficiary: 'Đối tác từ dữ liệu', memo: 'Lời nhắn được cung cấp', clueRefId: 'CLUE-BANK-05' }] })!.transactions[0];
    const evidence = transactionEvidence(caseData, row);
    expect(evidence.kind).toBe('transaction');
    expect(evidence.source?.kind).toBe('transaction');
    expect(evidence.suspectToTag).toBe('Đối tác từ dữ liệu');
    expect(evidence.source).toMatchObject({ caseId: caseData.caseId, recordId: 'test-source', clueRefId: 'CLUE-BANK-05' });
    expect(evidence.source?.snippet).toContain(row.memo);
    const vault = bankingEvidence(caseData, { id: 'vault' }, 'Hũ từ dữ liệu', 'Nội dung');
    expect(vault.suspectToTag).toBe(caseData.husbandName);
  });

  it('persists evidence source metadata through the existing repository', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
    const adapter = new LocalStorageAdapter();
    const evidence = transactionEvidence(loadCase('case_01'), readBankingData(loadCase('case_01').appsData.banking)!.transactions[0]).source;
    const session: ActiveSessionState = { schemaVersion: 1, gameId: 'test-banking', caseId: 'case_01', levelNumber: 1, activeApp: 'banking', suspicionStrikes: 5, taggedSuspects: [{ suspectId: 'tag', displayName: 'Từ dữ liệu', sourceApp: 'banking', timestamp: 1, evidence }], unlockedChallenges: [], elapsedSeconds: 0, lastSavedAt: 1 };
    await adapter.saveActiveSession(session);
    expect((await adapter.getActiveSession('test-banking'))?.taggedSuspects[0].evidence).toEqual(evidence);
  });

  it('puts transaction time in the subtitle while retaining reference, memo and source time', () => {
    const row = readBankingData(loadCase('case_01').appsData.banking)!.transactions[0];
    const item = transactionEvidence(loadCase('case_01'), { ...row, reference: 'REF-123', memo: 'Hẹn gặp 20:48' });
    expect(item.subtitle).toBe(`Thời gian: ${row.timestamp}`);
    expect(item.snippet).not.toContain(row.timestamp);
    expect(item.snippet).toContain('Mã giao dịch: REF-123');
    expect(item.snippet).toContain('Hẹn gặp 20:48');
    expect(item.source).toMatchObject({ rawTimestamp: row.timestamp, subtitle: item.subtitle, snippet: item.snippet });
  });

  it('shows the specified missing-data state instead of invented financial records', () => {
    expect(readBankingData(undefined)).toBeNull();
    expect(readBankingData([])).toBeNull();
    const caseData = { ...loadCase('case_01'), appsData: {} };
    const html = renderToStaticMarkup(createElement(BankingApp, props(caseData)));
    expect(html).toContain('Chưa có dữ liệu ngân hàng cho màn này.');
    expect(html).not.toContain('18.500.000');
  });

  it('renders a compact 2-column transaction history item with amount on the right', () => {
    const caseData = loadCase('case_01');
    const transactions = readBankingData({
      transactions: [
        { id: 'tx-1', amount: '-150.000 đ', beneficiary: 'Tiệm Cà Phê', memo: 'Cà phê sáng', date: '15/10/2026', time: '08:30' },
      ],
    })!.transactions;
    const html = renderToStaticMarkup(createElement(BankingHistory, {
      caseData,
      transactions,
      filter: 'all',
      onFilter: vi.fn(),
      onOpen: vi.fn(),
      onEvidence: vi.fn(),
    }));
    expect(html).toContain('Tiệm Cà Phê');
    expect(html).toContain('bank-amount text-base font-bold leading-tight');
    expect(html).toContain('shrink-0 text-right');
    expect(html).toContain('- 150.000 đ');
    expect(html).toContain('Cà phê sáng');
  });
});

