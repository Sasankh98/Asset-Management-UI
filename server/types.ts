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
 */

export interface Income {
  id: number;
  incomeType: string;
  amount: number | string;
  date: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeDTO {
  status: string;
  data: Income[];
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
  currentValue: number | null;
  marketPrice: number | null;
  sellPrice: number | null;
  totalReturns: number | null;
  profitLoss: number | null;
  dividends: number | null;
  buyTax: string | null;
  sellTax: string | null;
  netreturn: number | null;
  netProfitLoss: number | null;
  netProfitLossPercent: number | null;
  sellDate: string | null;
  user: string;
  createdAt: string;
  updatedAt: string;
}
export interface StockDTO {
  status: string;
  data: Stock[];
}