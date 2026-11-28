import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { loadCase } from '../../features/case-runtime';
import { StoryEvidenceTarget } from '../../features/investigation';
import { readBankingData } from './bankingData';
import { BankingVaults, BankingVaultDetail } from './components/BankingVaults';

it('loads two online savings and exposes their full terms through the existing evidence target', () => {
  const caseData = loadCase('case_01');
  const vaults = readBankingData(caseData.appsData.banking)!.vaults;
  expect(vaults).toHaveLength(2);
  const list = renderToStaticMarkup(createElement(BankingVaults, { caseData, vaults, unlockedChallenges: new Set<string>(), onSelect: vi.fn(), onEvidence: vi.fn() }));
  expect(list).toContain('Tiết kiệm');
  for (const vault of vaults) {
    const detail = BankingVaultDetail({ caseData, vault, onEvidence: vi.fn() });
    const target = detail.props.children[0];
    expect(target.type).toBe(StoryEvidenceTarget);
    expect(target.props.item.source.recordId).toBe(vault.id);
    expect(target.props.item.snippet).toContain(vault.details);
    expect(target.props.item.suspectToTag).toBe(caseData.husband.shortName);
    const html = renderToStaticMarkup(detail);
    expect(html).toContain(vault.currentAmount);
    expect(html).toContain('Ngày đáo hạn:');
    expect(html).not.toContain('Mục tiêu:');
    expect(html).not.toContain('>Ghim');
  }
});
