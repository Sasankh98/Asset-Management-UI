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
  currentValue: number;
  marketPrice: number;
  sellPrice: number;
  totalReturns: number;
  profitLoss: number;
  dividends: number;
  buyTax: string;
  sellTax: string;
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
}

/**
 * @Goals has the structure for user goals information.
 * @GoalsDTO has the structure for the goals data response.
 */
export interface Goals {
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

export interface GoalsDTO {
  status: string;
  data: Goals[];
}

export interface CreateGoalsDTO {
  goal: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  user: string;
  value: number;
}
