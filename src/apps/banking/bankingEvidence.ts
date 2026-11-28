import type { AppCaseContext } from '../../shared/contracts/app-contracts';
import type { UniversalEvidenceItem } from '../../features/investigation';
import type { BankingNarrative, BankingTransaction } from './types';

export function bankingEvidence(
  caseData: AppCaseContext,
  record: BankingNarrative,
  title: string,
  snippet: string,
  subtitle?: string,
  accountParty: string = caseData.husband.shortName,
): UniversalEvidenceItem {
  const suspect = caseData.suspectPool.find(suspect => suspect.suspectId === record.suspectId);
  return {
    title,
    snippet,
    subtitle,
    suspectToTag: record.suspectName || suspect?.displayName || accountParty,
    source: {
      caseId: caseData.caseId,
      recordId: record.id,
      clueRefId: record.clueRefId,
      title,
      snippet,
      subtitle,
    },
  };
}

export function transactionEvidence(caseData: AppCaseContext, transaction: BankingTransaction): UniversalEvidenceItem {
  const item = bankingEvidence(
    caseData,
    transaction,
    `Giao dịch: ${transaction.counterpartyName}`,
    [transaction.formattedAmount, transaction.memo, transaction.reference && `Mã giao dịch: ${transaction.reference}`].filter(Boolean).join('\n'),
    transaction.timestamp ? `Thời gian: ${transaction.timestamp}` : undefined,
    transaction.counterpartyName === '-' ? '' : transaction.counterpartyName,
  );
  item.kind = 'transaction';
  item.direction = transaction.direction;
  item.rawTimestamp = transaction.timestamp;
  if (item.source) {
    item.source.kind = 'transaction';
    item.source.direction = transaction.direction;
    item.source.rawTimestamp = transaction.timestamp;
  }
  return item;
}
