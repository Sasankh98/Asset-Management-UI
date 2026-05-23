/**
 * This file contains TypeScript interfaces for the server-side types.
 * These interfaces are used to define the structure of data exchanged between the client and server.
 */

/**
 * @UserLoginDTO has the structure for user login credentials.
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserRegisterDTO {
  name: string;
  email: string;
  password: string;
}

interface user {
  email: string;
}

/**
 * @UserInfoDTO has the structure for user information.
 */
export interface UserInfoDTO {
  data: user;
  status: string;
  token: string;
}

/**
 * @Income has the structure for user income information.
 * @IncomeDTO has the structure for the income data response.
 * @CreateIncomeDTO has the structure for creating new income entries.
 * These interfaces are used in the IncomeService to manage income-related operations.
 */

export interface Salary {
  id: number;
  transactionType: string;
  amount: number;
  date: string;
  user: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryDTO {
  status: string;
  data: Salary[];
}

export interface CreateSalaryDTO {
  transactionType: string;
  amount: number;
  date: string;
  user: string;
  type: string;
}

/**
 * @Stock has the structure for user stock information.
 * @StockDTO has the structure for the stock data response.
 */

export interface Stock {
  id: number;
  stockName: string;
  avg: number;
  quantity: number;
  totalInvested: number;
  buyDate: string;
  status: string;
  category: string;
  currentValue: number;
  marketPrice: number;
  sellPrice: number;
  totalReturns: number;
  profitLoss: number;
  dividends: number;
  buyTax: number;
  sellTax: number;
  netreturn: number;
  netProfitLoss: number;
  netProfitLossPercent: number;
  sellDate: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
export interface StocksDTO {
  status: string;
  data: Stock[];
}

export interface CreateStocksDTO {
  stockName: string;
  avg: number;
  quantity: number;
  user: string;
  buyTax: number;
  buyDate: string;
  status: string;
  category?: string;
  marketPrice?: number;
  sellPrice?: number;
  sellTax?: number;
  dividends?: number;
  sellDate?: string;
}

/**
 * @Goals has the structure for user goals information.
 * @GoalsDTO has the structure for the goals data response.
 */
export interface GoalsDTO {
  id: number;
  goal: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  value: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalsDTO {
  goal: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  user: string;
  value: number;
}

export interface MutualFund {
  id: number;
  fundName: string;
  category: string;
  invested: number;
  currentValue: number;
  units: number;
  nav: number;
  gain_loss: number;
  targetProgress: number;
  user: string;
  createdAt: string;
  updatedAt: string;
  // Portfolio allocation breakdown (set monthly by the fund house, optional)
  equityPct?: number;
  largeCapPct?: number;
  midCapPct?: number;
  smallCapPct?: number;
  hedgedEquityPct?: number;
  debtPct?: number;
  cashPct?: number;
  realEstatePct?: number;
  allocationUpdatedAt?: string;
}

export interface MutualFundsDTO {
  status: string;
  data: MutualFund[];
}

export interface MutualFundsDashboard {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalTargetAmount: number;
  totalTargetProgress: number;
  totalGainLossPercent: number;
}
export interface MutualFundsDashboardDTO {
  status: string;
  data: MutualFundsDashboard;
}

export interface CreateMutualFundsDTO {
  fundName: string;
  category: string;
  invested: number;
  currentValue: number;
  units: number;
  nav: number;
  targetAmount: number;
  user: string;
  equityPct?: number;
  largeCapPct?: number;
  midCapPct?: number;
  smallCapPct?: number;
  hedgedEquityPct?: number;
  debtPct?: number;
  cashPct?: number;
  realEstatePct?: number;
}

// ── Loans ─────────────────────────────────────────────────────────────────────

export interface Loan {
  id: number;
  name: string;
  kind: string;
  totalAmt: number;
  paidAmt: number;
  emi: number;
  interestRate: number;
  dueDate: string;
  tenureLeft: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanDTO {
  name: string;
  kind: string;
  totalAmt: number;
  paidAmt: number;
  emi: number;
  interestRate: number;
  dueDate: string;
  tenureLeft: string;
  user: string;
}

// ── EMIs ──────────────────────────────────────────────────────────────────────

export interface Emi {
  id: number;
  name: string;
  kind: string;
  totalAmt: number;
  emiAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDay: number;
  startDate: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmiDTO {
  name: string;
  kind: string;
  totalAmt: number;
  emiAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDay: number;
  startDate: string;
  user: string;
}

// ── LIC ───────────────────────────────────────────────────────────────────────

export interface LicPolicy {
  id: number;
  name: string;
  policyNumber: string;
  startDate: string;
  policyTerm: number;
  premiumPayTerm: number;
  premiumFreq: string;
  premium: number;
  sumAssured: number;
  returnType: string;
  returnAmount: number;
  maturityBonus: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicPolicyDTO {
  name: string;
  policyNumber: string;
  startDate: string;
  policyTerm: number;
  premiumPayTerm: number;
  premiumFreq: string;
  premium: number;
  sumAssured: number;
  returnType: string;
  returnAmount: number;
  maturityBonus: number;
  user: string;
}

// ── Provident Fund ────────────────────────────────────────────────────────────

export interface PfConfig {
  id: number;
  monthlyBasic: number;
  empPct: number;
  erPct: number;
  rate: number;
  yearsWorked: number;
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  vpfPct: number;
  salaryIncrementPct: number;
  joiningMonth: number;
  physicalGoldValue: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePfConfigDTO {
  monthlyBasic: number;
  empPct: number;
  erPct: number;
  rate: number;
  yearsWorked: number;
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  vpfPct: number;
  salaryIncrementPct: number;
  joiningMonth: number;
  physicalGoldValue?: number;
  user: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalMonthlyEmi: number;
  savingsRate: number;
  allocation: {
    mutualFunds: number;
    stocks: number;
    pfAndLic: number;
    liabilities: number;
  };
}

// ── Reports / Snapshots ───────────────────────────────────────────────────────

export interface NetWorthSnapshot {
  id: number;
  snapshotDate: string;
  totalNetWorth: number;
  mutualFunds: number;
  stocks: number;
  realEstate: number;
  pfAndLic: number;
  other: number;
  totalLiabilities: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnapshotDTO {
  snapshotDate: string;
  totalNetWorth: number;
  mutualFunds: number;
  stocks: number;
  realEstate: number;
  pfAndLic: number;
  other: number;
  totalLiabilities: number;
  user: string;
}
