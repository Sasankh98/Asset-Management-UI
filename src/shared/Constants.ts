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
  projections: "projections",
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
  // ── Equity ────────────────────────────────────────────────
  { name: "Large Cap", value: "Large Cap" },
  { name: "Mid Cap", value: "Mid Cap" },
  { name: "Small Cap", value: "Small Cap" },
  { name: "Multi Cap", value: "Multi Cap" },
  { name: "Flexi Cap", value: "Flexi Cap" },
  { name: "ELSS (Tax Saving)", value: "ELSS" },
  { name: "Index Fund", value: "Index Fund" },
  { name: "ETF (Equity)", value: "ETF" },
  { name: "Sectoral / Thematic", value: "Sectoral" },
  { name: "Hybrid / Balanced", value: "Hybrid" },
  { name: "Balanced Advantage", value: "Balanced Advantage" },
  { name: "International / FOF", value: "International" },
  // ── Debt & Liquid ─────────────────────────────────────────
  { name: "Debt", value: "Debt" },
  { name: "Liquid", value: "Liquid" },
  { name: "Arbitrage", value: "Arbitrage" },
  // ── Commodities ───────────────────────────────────────────
  { name: "Gold ETF / Fund", value: "Gold" },
  { name: "Silver ETF / Fund", value: "Silver" },
  // ── Real Estate ───────────────────────────────────────────
  { name: "Real Estate / REIT", value: "Real Estate" },
  // ── Bonds ─────────────────────────────────────────────────
  { name: "Bond / Gilt", value: "Bond" },
  // ── Emergency Fund ────────────────────────────────────────
  { name: "Emergency Fund", value: "Emergency Fund" },
  // ── Other ─────────────────────────────────────────────────
  { name: "Other", value: "Other" },
];

export const StockCategories = [
  { name: "Large Cap", value: "Large Cap" },
  { name: "Mid Cap",   value: "Mid Cap"   },
  { name: "Small Cap", value: "Small Cap" },
  { name: "Other",     value: "Other"     },
];

/** Maps a MF category string → top-level asset allocation bucket */
export type AssetBucket =
  | "Equity"
  | "Debt/Liquid"
  | "Commodities"
  | "Real Estate"
  | "Bonds"
  | "Emergency Fund"
  | "Cash/Other";

export const MF_TO_ASSET_BUCKET: Record<string, AssetBucket> = {
  "Large Cap":          "Equity",
  "Mid Cap":            "Equity",
  "Small Cap":          "Equity",
  "Multi Cap":          "Equity",
  "Flexi Cap":          "Equity",
  "ELSS":               "Equity",
  "Index Fund":         "Equity",
  "ETF":                "Equity",
  "Sectoral":           "Equity",
  "Hybrid":             "Equity",
  "Balanced Advantage": "Equity",
  "International":      "Equity",
  "Debt":               "Debt/Liquid",
  "Liquid":             "Debt/Liquid",
  "Arbitrage":          "Debt/Liquid",
  "Gold":               "Commodities",
  "Silver":             "Commodities",
  "Real Estate":        "Real Estate",
  "Bond":               "Bonds",
  "Emergency Fund":     "Emergency Fund",
  "Other":              "Cash/Other",
};

/** Maps a MF category → equity sub-bucket (only relevant when bucket === "Equity") */
export type EquitySubBucket = "Large Cap" | "Mid Cap" | "Small Cap" | "Diversified" | "International";

export const MF_TO_EQUITY_SUB: Record<string, EquitySubBucket> = {
  "Large Cap":          "Large Cap",
  "Index Fund":         "Large Cap",
  "ETF":                "Large Cap",
  "Mid Cap":            "Mid Cap",
  "Small Cap":          "Small Cap",
  "Multi Cap":          "Diversified",
  "Flexi Cap":          "Diversified",
  "ELSS":               "Diversified",
  "Sectoral":           "Diversified",
  "Hybrid":             "Diversified",
  "Balanced Advantage": "Diversified",
  "International":      "International",
};

export const enum ModalTypes {
  create = "create",
  edit = "edit",
}
