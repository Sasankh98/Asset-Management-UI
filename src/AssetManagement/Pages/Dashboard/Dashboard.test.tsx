import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { type Stock, type MutualFund } from "../../../../server/types";

vi.mock("../../../services/DashboardService/DashboardService", () => ({
  default: () => ({
    getDashboard: vi.fn().mockResolvedValue({
      totalNetWorth: 1000000,
      totalAssets: 1200000,
      totalLiabilities: 200000,
      totalMonthlyEmi: 15000,
      savingsRate: 40,
      allocation: { mutualFunds: 500000, stocks: 400000, pfAndLic: 100000, liabilities: 200000 },
    }),
  }),
}));

vi.mock("../../../services/ReportsService/ReportsService", () => ({
  default: () => ({
    getNetWorthTrend: vi.fn().mockResolvedValue([]),
  }),
}));

const makeStock = (overrides: Partial<Stock> = {}): Stock => ({
  id: 1, stockName: "RELIANCE", avg: 2500, quantity: 10, totalInvested: 25000,
  buyDate: "2024-01-01", status: "active", category: "Large Cap",
  currentValue: 30000, marketPrice: 3000, sellPrice: 0, totalReturns: 5000,
  profitLoss: 5000, dividends: 0, buyTax: 0, sellTax: 0, netreturn: 5000,
  netProfitLoss: 5000, netProfitLossPercent: 20, sellDate: "",
  user: "Sasankh", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const makeMf = (overrides: Partial<MutualFund> = {}): MutualFund => ({
  id: 1, fundName: "Parag Parikh Flexi Cap", category: "Flexi Cap",
  invested: 100000, currentValue: 120000, units: 500, nav: 240,
  gain_loss: 20000, targetProgress: 50, user: "Sasankh",
  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockUseDashboardQuery = vi.fn(() => ({ data: null as unknown, isLoading: false }));
const mockUseNetWorthTrendQuery = vi.fn(() => ({ data: [] as unknown[], isLoading: false }));
const mockUseStocksQuery = vi.fn(() => ({ data: [] as Stock[], isLoading: false }));
const mockUseMutualFundsQuery = vi.fn(() => ({ data: [] as MutualFund[], isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useDashboardQuery: () => mockUseDashboardQuery(),
  useNetWorthTrendQuery: () => mockUseNetWorthTrendQuery(),
  useStocksQuery: () => mockUseStocksQuery(),
  useMutualFundsQuery: () => mockUseMutualFundsQuery(),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
  });
  afterEach(() => cleanup());

  test("renders Dashboard component", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByTestId("dashboard-container")).toBeInTheDocument()
    );
  });

  test("renders Total Net Worth label", () => {
    render(<Dashboard />);
    expect(screen.getByText(/total net worth/i)).toBeInTheDocument();
  });

  test("renders Asset Allocation section", () => {
    render(<Dashboard />);
    expect(screen.getByText(/asset allocation/i)).toBeInTheDocument();
  });

  test("renders Equity Allocation section", () => {
    render(<Dashboard />);
    expect(screen.getByText(/equity allocation/i)).toBeInTheDocument();
  });

  test("renders Assets KPI", () => {
    mockUseDashboardQuery.mockReturnValue({
      data: { totalNetWorth: 1000000, totalAssets: 1200000, totalLiabilities: 200000, totalMonthlyEmi: 15000, savingsRate: 40, allocation: {} },
      isLoading: false,
    });
    render(<Dashboard />);
    expect(screen.getByText("Assets")).toBeInTheDocument();
  });

  test("renders Liabilities KPI", () => {
    mockUseDashboardQuery.mockReturnValue({
      data: { totalNetWorth: 1000000, totalAssets: 1200000, totalLiabilities: 200000, totalMonthlyEmi: 15000, savingsRate: 40, allocation: {} },
      isLoading: false,
    });
    render(<Dashboard />);
    expect(screen.getByText("Liabilities")).toBeInTheDocument();
  });
});

describe("Dashboard Component (with stock and MF data)", () => {
  afterEach(() => cleanup());

  test("renders allocation slices when stocks are provided", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [makeStock()], isLoading: false });
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);
    expect(screen.getByTestId("dashboard-container")).toBeInTheDocument();
  });

  test("renders allocation with MF data", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseMutualFundsQuery.mockReturnValue({ data: [makeMf()], isLoading: false });
    render(<Dashboard />);
    expect(screen.getByTestId("dashboard-container")).toBeInTheDocument();
  });

  test("renders allocation with MF having explicit allocation percentages", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ equityPct: 65, debtPct: 20, cashPct: 10, realEstatePct: 5 })],
      isLoading: false,
    });
    render(<Dashboard />);
    expect(screen.getByTestId("dashboard-container")).toBeInTheDocument();
  });

  test("renders with sold stocks (should be excluded from equity)", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({
      data: [makeStock({ status: "sold" })],
      isLoading: false,
    });
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);
    expect(screen.getByTestId("dashboard-container")).toBeInTheDocument();
  });
});
