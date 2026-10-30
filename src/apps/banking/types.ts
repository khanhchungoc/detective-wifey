export type BankingTab = 'home' | 'history' | 'transfer' | 'vaults' | 'profile';
export type TransactionDirection = 'inflow' | 'outflow';
export type TransactionFilter = 'all' | TransactionDirection;
export type BankingQuickAction = 'transfer' | 'qr_pay' | 'vaults' | 'bills' | 'growth' | 'other';
export type MembershipTier = 'standard' | 'inspire' | 'priority' | 'private';

export interface BankingNarrative {
  id: string;
  suspectName?: string;
  suspectId?: string;
  clueRefId?: string;
}

export interface BankingTransaction extends BankingNarrative {
  direction: TransactionDirection;
  formattedAmount: string;
  timestamp: string;
  sortTime: number;
  counterpartyName: string;
  counterpartyBank?: string;
  counterpartyAccount?: string;
  reference?: string;
  status?: string;
  memo: string;
  category?: string;
}

export interface BankingDeposit extends BankingNarrative {
  date: string;
  amount: string;
  note: string;
}

export interface BankingVault extends BankingNarrative {
  name: string;
  currentAmount: string;
  targetAmount: string;
  details?: string;
  lockChallengeId?: string;
  deposits: BankingDeposit[];
}

export interface BankingData {
  accountNumber: string;
  maskedBalance: string;
  actualBalance: string;
  tier?: MembershipTier;
  unreadCount: number;
  isAppLocked: boolean;
  lockChallengeId?: string;
  quickActions: BankingQuickAction[];
  transactions: BankingTransaction[];
  vaults: BankingVault[];
}
