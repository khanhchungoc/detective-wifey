---
type: App Features Specification
app_id: techcornbank
app_name: Techcornbank
status: approved
description: "Comprehensive functional features, clue integrations, mundane clutter, read-only case appearance, and declarative schemas for Techcornbank."
tags: [app-features, techcornbank, clues, schema, functional-spec, customization]
timestamp: "2026-10-15T21:05:00+07:00"
---

# Techcornbank - Functional Features & Clue Integration Specification

---

## 1. Functional Overview

The dashboard shortcut and bottom tab are labeled **Tiết kiệm**. Thịnh Level 1 includes two read-only online savings deposits: 30.000.000 đ for 6 months and 50.000.000 đ for 12 months. Case-defined `vaults[].details` provides term, annual rate, opening date, maturity date, and interest payout text. Savings cards and opening deposit records use the existing 380 ms long-press evidence flow; pinned savings retain the displayed terms and source record ID.

Techcornbank acts as the financial forensic epicenter. In viral Vietnamese relationship scandals, bank transfer memo fields are famously repurposed as secret chat rooms when blocked on messaging apps. It also exposes secret allowances (*Sugar Mommy*), dining receipts, and hidden stashes (*"quỹ đen"*).

---

## 2. In-App Features & User Interactions

### 2.1. Account Balance & Eyeball Privacy Toggle
* Default view masks current balance (`•••••••• đ`). Tapping the eyeball icon toggles balance visibility (`14.850.000 đ`).

### 2.2. Separate Transaction History & Filtering
* Home shows the account summary and shortcuts only, without recent transactions, memo previews, or transaction filters. Open **Tài khoản & lịch sử** or the **Lịch sử** tab to inspect the transaction history.
* Filter chips: *Tất cả*, *Tiền vào (+)*, *Tiền ra (-)*.
* Chronological listing displaying counterparty, timestamp, amount, and memo snippet.

### 2.3. Digital Bank Receipt Modal
* Tapping any transaction opens an authentic receipt drawer detailing beneficiary name, bank, reference number, exact timestamp, and the full un-truncated `Lời nhắn`.
* Hold case-loaded receipt narrative or a memo for **380 ms** to open the shared evidence overlay and use its notebook action. There is no permanent pin/notebook shortcut in the receipt, and opening a receipt does not automatically tag a suspect.

### 2.4. Piggy Bank Sub-Vaults ("Hũ Tiết Kiệm / Quỹ Đen")
* Displays dedicated sub-vaults with custom goal names, balances, and deposit histories.

### 2.5. PIN Authentication Gate
* Locks app launch or vault access on Level 2/3. PIN clue is discoverable in Notes (`CLUE-NOTE-01`) or SMS.

### 2.6. Read-Only Membership & Case Appearance
* Membership styling (`Standard`, `Inspire`, `Priority`, `Private`) and any existing wallpaper or feng-shui appearance are supplied by the case and displayed read-only.
* The player cannot change membership tier, theme, wallpaper, feng-shui color, or zodiac appearance. No customization drawer or save-theme action exists in the delivered app.
* Any appearance used for narrative corroboration remains the case-authored appearance, not a player-generated selection.

### 2.7. Configuration-Driven Quick Action Bar
* Four shortcut positions appear directly below the account summary, in case-configured order.
* The default non-theme actions are **Chuyển tiền**, **Quét QR**, **Hũ quỹ đen**, and **Hóa đơn**. There is no **Tùy biến** action or player shortcut editor.
* **Hũ quỹ đen** opens vault inspection. Transfer, QR, and bill-payment controls remain unavailable in this inspection-only scope; their payment or camera workflows are not defined here.

---

## 3. Clue Mapping & Interactive Evidence

| Clue ID | Feature Component | User Action & Forensic Reveal | Truth Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-BANK-01` | `TechcornbankHistoryView` • Micro-Transfers | Review feed -> Consecutive 1.000 VNĐ transfers sent at midnight form a desperate apology chat log. | Cheating | Easy |
| `CLUE-BANK-02` | `TechcornbankHistoryView` • Sugar Allowance | Filter "Tiền vào" -> Credit inflows of +10M to +20M VNĐ with sugar mommy memos (*"Thuong cho chuot con"*). | Sugar Relationship | Medium |
| `CLUE-BANK-03` | `TechcornbankTransactionModal` • Receipt Drawer | Tap 1.500.000 VNĐ debit -> Categorized as hotel/fine dining, debunking claimed 35k pho. | Cheating | Easy |
| `CLUE-BANK-04` | `TechcornbankVaultView` • Secret Sub-Vault | Open vault tab -> Sub-vault *"Tiet Kiem Mua Nhan Kim Cuong Cho Vo"* reveals husband's innocent surprise. | Innocent (Anniversary) | Hard |
| `CLUE-BANK-05` | `TechcornbankTransactionModal` • Bill Split | Tap transfer -> Memo reads *"Campuchia tien an toi 50/50"* with suspect female account. | Cheating | Medium |

---

## 4. Benign Mundane Clutter (Filler Content)

* **Monthly Salary**: `+ 25.000.000 đ` from "CTY CP CONG NGHE & TRUYEN THONG".
* **Utility Bills**: `- 1.450.000 đ` EVN Hanoi electricity; `- 280.000 đ` VNPT fiber internet.
* **Grocery Purchase**: `- 620.000 đ` at "WINMART VINCOM".

---

## 5. Declarative Data Contract

```typescript
export interface TechcornbankData {
  accountNumber: string;
  maskedBalance: string;
  actualBalance: string;
  isAppLocked?: boolean;
  lockChallengeId?: string;
  // Read-only appearance supplied by the case; no player theme editor
  tier?: 'standard' | 'inspire' | 'priority' | 'private';
  customWallpaper?: string;
  fengShuiColor?: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  quickActions?: Array<'transfer' | 'qr_pay' | 'vaults' | 'bills'>;
  vaults: Array<{
    vaultId: string;
    vaultName: string;
    targetAmount: string;
    currentAmount: string;
    depositHistory: Array<{ date: string; amount: string; note: string }>;
    clueRefId?: string;
  }>;
  transactions: Array<{
    transactionId: string;
    type: 'inflow' | 'outflow';
    amount: number;
    formattedAmount: string;
    timestamp: string;
    counterpartyName: string;
    counterpartyBank?: string;
    memo: string;
    category: 'transfer' | 'salary' | 'utility' | 'dining' | 'hotel';
    clueRefId?: string;
  }>;
}
```
