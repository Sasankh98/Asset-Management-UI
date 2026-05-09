export const DisplayContentEnum = {
  netWorth: "netWorth",
  dashboard: "dashboard",
  income: "income",
  expenses: "expenses",
  salary: "salary",
  stocks: "stocks",
  lic: "lic",
  mutualFunds: "mutualFunds",
  providentFund: "providentFund",
  calculator: "calculator",
  goals: "goals",
  loans: "loans",
  emis: "emis",
  reports: "reports",
  settings: "settings",
} as const;

export type DisplayContent =
  (typeof DisplayContentEnum)[keyof typeof DisplayContentEnum];

export const TransactionTypesEnum = [
  { name: "Salary" },
  { name: "Investment" },
  { name: "Emergency Fund" },
  { name: "Profits" },
  { name: "Interest" },
  { name: "Dividend" },
  { name: "Rent" },
  { name: "Cigarettes" },
  { name: "Alcohol" },
  { name: "Lunch" },
  { name: "Utilities" },
  { name: "Groceries" },
  { name: "Dinner" },
  { name: "Fuel" },
  { name: "Bus Fare" },
  { name: "Train Fare" },
  { name: "Gambling" },
  { name: "Others" },
];

export const TypeEnum = [
  { name: "Income", value: "income" },
  { name: "Expense", value: "expense" },
];

export const ImageIcons = {
  goldenRetriever: "Golden Retriever",
  bike: "Triumph Street Triple 765 RS",
  marriage: "Marriage",
  tattoo: "Tattoo",
};

export const mutualFundsDashboard = {
  currentValue: "Current Value",
  totalInvestment: "Total Investment",
  gainLoss: "Gain/Loss",
  targetProgress: "Target Progress",
  tpv: "Total Portfolio value",
  amountinvested: "Amount Invested",
  target: "Target:",
};

export const enum Icons {
  symbol = "symbol",
  chart = "chart",
  tracking = "tracking",
}

export const MutualFundTypes = [
  { name: "Large Cap", value: "Large Cap" },
  { name: "Mid Cap", value: "Mid Cap" },
  { name: "Small Cap", value: "Small Cap" },
  { name: "Multi Cap", value: "Multi Cap" },
  { name: "Flexi Cap", value: "Flexi Cap" },
  { name: "ELSS (Tax Saving)", value: "ELSS" },
  { name: "Index Fund", value: "Index Fund" },
  { name: "ETF", value: "ETF" },
  { name: "Sectoral / Thematic", value: "Sectoral" },
  { name: "Hybrid / Balanced", value: "Hybrid" },
  { name: "Balanced Advantage", value: "Balanced Advantage" },
  { name: "Arbitrage", value: "Arbitrage" },
  { name: "Debt", value: "Debt" },
  { name: "Liquid", value: "Liquid" },
  { name: "International / FOF", value: "International" },
  { name: "Other", value: "Other" },
];

export const enum ModalTypes {
  create = "create",
  edit = "edit",
}
