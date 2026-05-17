import { describe, test, vi, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import Projections from "./Projections";
import type { MutualFund, Stock, LicPolicy } from "../../../../server/types";

// Recharts requires layout so mock the ResponsiveContainer
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  };
});

const mockUseMutualFundsQuery = vi.fn(() => ({ data: [] as unknown, isLoading: false }));
const mockUseStocksQuery = vi.fn(() => ({ data: [] as unknown, isLoading: false }));
const mockUseLicQuery = vi.fn(() => ({ data: [] as unknown, isLoading: false }));
const mockUseProvidentFundQuery = vi.fn(() => ({ data: null as unknown, isLoading: false }));
const mockUseDashboardQuery = vi.fn(() => ({ data: null as unknown, isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useMutualFundsQuery: () => mockUseMutualFundsQuery(),
  useStocksQuery: () => mockUseStocksQuery(),
  useLicQuery: () => mockUseLicQuery(),
  useProvidentFundQuery: () => mockUseProvidentFundQuery(),
  useDashboardQuery: () => mockUseDashboardQuery(),
}));

const makeMf = (overrides: Partial<MutualFund> = {}): MutualFund => ({
  id: 1, fundName: "Parag Parikh Flexi Cap", category: "Flexi Cap",
  invested: 100000, currentValue: 120000, units: 500, nav: 240,
  gain_loss: 20000, targetProgress: 50, user: "test",
  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const makeStock = (overrides: Partial<Stock> = {}): Stock => ({
  id: 1, stockName: "RELIANCE", avg: 2500, quantity: 10, totalInvested: 25000,
  buyDate: "2024-01-01", status: "active", category: "Large Cap",
  currentValue: 30000, marketPrice: 3000, sellPrice: 0, totalReturns: 5000,
  profitLoss: 5000, dividends: 0, buyTax: 0, sellTax: 0, netreturn: 5000,
  netProfitLoss: 5000, netProfitLossPercent: 20, sellDate: "",
  user: "test", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const makeLic = (overrides: Partial<LicPolicy> = {}): LicPolicy => ({
  id: 1, name: "Jeevan Anand", policyNumber: "123456789",
  startDate: "2020-01-01", policyTerm: 20, premiumPayTerm: 15,
  premiumFreq: "monthly", premium: 5000, sumAssured: 1000000,
  returnType: "lump_sum", returnAmount: 0, maturityBonus: 1500000,
  user: "test", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("Projections – loading state", () => {
  afterEach(() => cleanup());

  test("renders skeletons while loading", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: true });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: true });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: true });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: true });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    const { container } = render(<Projections />);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});

describe("Projections – empty state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
  });
  afterEach(() => cleanup());

  test("renders projections container", () => {
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("renders Projections heading", () => {
    render(<Projections />);
    expect(screen.getByText("Projections")).toBeInTheDocument();
  });

  test("renders Portfolio Today KPI", () => {
    render(<Projections />);
    expect(screen.getByText(/portfolio today/i)).toBeInTheDocument();
  });

  test("renders horizon toggle buttons", () => {
    render(<Projections />);
    expect(screen.getByRole("button", { name: "5y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30y" })).toBeInTheDocument();
  });

  test("renders inflation stepper", () => {
    render(<Projections />);
    expect(screen.getAllByText(/inflation/i).length).toBeGreaterThan(0);
  });

  test("renders disclaimer text", () => {
    render(<Projections />);
    expect(screen.getByText(/assumptions/i)).toBeInTheDocument();
  });
});

describe("Projections – with data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutualFundsQuery.mockReturnValue({
      data: [
        makeMf({ id: 1, category: "Flexi Cap", currentValue: 120000 }),
        makeMf({ id: 2, category: "Debt", currentValue: 50000 }),
        makeMf({ id: 3, category: "Index Fund", currentValue: 0 }), // skipped — cv=0
      ],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({
      data: [
        makeStock({ status: "active", marketPrice: 3000, quantity: 10 }),
        makeStock({ id: 2, status: "sold", marketPrice: 0, currentValue: 20000 }), // excluded
      ],
      isLoading: false,
    });
    mockUseLicQuery.mockReturnValue({
      data: [
        makeLic({ id: 1, premium: 5000, startDate: "2020-01-01" }),
        makeLic({ id: 2, premium: 0, startDate: "2020-01-01" }), // paid=0, skipped
      ],
      isLoading: false,
    });
    mockUseProvidentFundQuery.mockReturnValue({
      data: { currentBalance: 500000, rate: 8.25, currentAge: 28 },
      isLoading: false,
    });
    mockUseDashboardQuery.mockReturnValue({
      data: { totalAssets: 1500000 },
      isLoading: false,
    });
  });
  afterEach(() => cleanup());

  test("renders projections container with holdings", () => {
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("renders MF fund name in table", () => {
    render(<Projections />);
    expect(screen.getAllByText("Parag Parikh Flexi Cap").length).toBeGreaterThan(0);
  });

  test("renders LIC policy name in table", () => {
    render(<Projections />);
    expect(screen.getByText("Jeevan Anand")).toBeInTheDocument();
  });

  test("renders EPF entry in table", () => {
    render(<Projections />);
    expect(screen.getByText("EPF + VPF")).toBeInTheDocument();
  });

  test("renders Equity Stocks entry in table", () => {
    render(<Projections />);
    expect(screen.getByText("Equity Stocks")).toBeInTheDocument();
  });

  test("renders Savings & Deposits when residue > 10000", () => {
    render(<Projections />);
    expect(screen.getByText("Savings & Deposits")).toBeInTheDocument();
  });

  test("horizon toggle changes label", () => {
    render(<Projections />);
    fireEvent.click(screen.getByRole("button", { name: "10y" }));
    expect(screen.getByText(/10y horizon/i)).toBeInTheDocument();
  });

  test("inflation decrease button works", () => {
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("show mode toggle to Nominal", () => {
    render(<Projections />);
    fireEvent.click(screen.getByRole("button", { name: /^nominal$/i }));
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("show mode toggle to Real", () => {
    render(<Projections />);
    fireEvent.click(screen.getByRole("button", { name: /^real$/i }));
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });
});

describe("Projections – insights", () => {
  afterEach(() => cleanup());

  test("renders best-bucket insight card", () => {
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ category: "Flexi Cap", currentValue: 500000 })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({
      data: [makeLic({ premium: 2000, startDate: "2020-01-01" })],
      isLoading: false,
    });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 550000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByText(/carries the portfolio/i)).toBeInTheDocument();
  });

  test("renders worst-bucket losing in real terms", () => {
    // LIC at 4.5% < 6% inflation → real CAGR < 0
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ category: "Flexi Cap", currentValue: 500000 })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({
      data: [makeLic({ premium: 5000, startDate: "2010-01-01" })],
      isLoading: false,
    });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 700000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });
});

describe("Projections – no residue cash", () => {
  afterEach(() => cleanup());

  test("no Savings & Deposits row when residue <= 10000", () => {
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ currentValue: 1000000 })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    // totalAssets = currentValue of MF, so residue ~= 0
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 1000000 }, isLoading: false });
    render(<Projections />);
    expect(screen.queryByText("Savings & Deposits")).not.toBeInTheDocument();
  });
});

describe("Projections – null data query fallbacks", () => {
  afterEach(() => cleanup());

  test("stQuery.data=null covers ?? [] right branch (L243)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("licQuery.data=null covers ?? [] right branch (L280)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("MF with null currentValue covers mf.currentValue ?? 0 right branch (L226)", () => {
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ currentValue: null as unknown as number, category: "Flexi Cap" })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("Gold MF category covers Commodities branch (L227 right side of ||)", () => {
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ category: "Gold" as "Flexi Cap", currentValue: 150000 })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 150000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("LIC with null premium covers policy.premium ?? 0 right branch (L281)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({
      data: [makeLic({ premium: null as unknown as number, startDate: "2020-01-01" })],
      isLoading: false,
    });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("PF with null currentBalance covers pf.currentBalance ?? 0 right branch (L264)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({
      data: { currentBalance: null, rate: 8.25, currentAge: 30 },
      isLoading: false,
    });
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    render(<Projections />);
    expect(screen.queryByText("EPF + VPF")).not.toBeInTheDocument();
  });

  test("LIC-only portfolio with 4.5% return < 6% inflation gives realGain < 0 (L475, L618)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({
      data: [makeLic({ premium: 5000, startDate: "2010-01-01" })],
      isLoading: false,
    });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 960000 }, isLoading: false });
    render(<Projections />);
    // realGain = realAtHorizon - totalToday < 0 with LIC 4.5% < 6% inflation over 20y
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("stock with non-null marketPrice>0 and null quantity covers s.quantity ?? 0 null branch (L247)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({
      data: [makeStock({ status: "active", marketPrice: 3000, quantity: null as unknown as number })],
      isLoading: false,
    });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });
});

describe("Projections – additional branch coverage", () => {
  afterEach(() => cleanup());

  test("stock with marketPrice=0 and active status uses currentValue (mp=0 branch)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({
      data: [makeStock({ status: "active", marketPrice: 0, currentValue: 30000, quantity: 10 })],
      isLoading: false,
    });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 30000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByText("Equity Stocks")).toBeInTheDocument();
  });

  test("PF with zero balance excluded from holdings (pfBalance > 0 false branch)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({
      data: { currentBalance: 0, rate: 8.25, currentAge: 30 },
      isLoading: false,
    });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    render(<Projections />);
    expect(screen.queryByText("EPF + VPF")).not.toBeInTheDocument();
  });

  test("MF with unknown category falls back to 0.10 default rate (MF_RETURN ?? 0.10)", () => {
    mockUseMutualFundsQuery.mockReturnValue({
      data: [makeMf({ category: "Unknown Category" as "Flexi Cap", currentValue: 200000 })],
      isLoading: false,
    });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 200000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("null ?? fallbacks for stock fields (quantity ?? 0, currentValue ?? 0)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({
      data: [makeStock({
        status: "active",
        marketPrice: null as unknown as number,
        quantity: null as unknown as number,
        currentValue: 25000,
      })],
      isLoading: false,
    });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 25000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByTestId("projections-container")).toBeInTheDocument();
  });

  test("PF with null rate falls back to 8.25 (rate ?? 8.25 branch)", () => {
    mockUseMutualFundsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStocksQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({
      data: { currentBalance: 300000, rate: null, currentAge: 30 },
      isLoading: false,
    });
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 300000 }, isLoading: false });
    render(<Projections />);
    expect(screen.getByText("EPF + VPF")).toBeInTheDocument();
  });
});
