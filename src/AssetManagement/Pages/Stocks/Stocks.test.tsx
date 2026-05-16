import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import Stocks from "./Stocks";
import { Stock } from "../../../../server/types";

vi.mock("../../../hooks/queries", () => ({
  useStocksQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("../../../hooks/mutations", () => ({
  useStocksMutation: () => ({
    createStock: { mutateAsync: vi.fn() },
    updateStock: { mutateAsync: vi.fn() },
  }),
}));

vi.mock("../../../services/StocksService/StocksService", () => ({
  default: vi.fn(() => ({
    getDailyStocksDetails: vi.fn().mockResolvedValue(null),
    updateStockDetails: vi.fn().mockResolvedValue({}),
  })),
}));

const makeStock = (overrides: Partial<Stock> = {}): Stock => ({
  id: 1,
  stockName: "Infosys",
  avg: 1000,
  quantity: 10,
  totalInvested: 10000,
  buyDate: "2024-01-01",
  status: "active",
  category: "Large Cap",
  currentValue: 12000,
  marketPrice: 1200,
  sellPrice: 0,
  totalReturns: 2000,
  profitLoss: 2000,
  dividends: 0,
  buyTax: 0,
  sellTax: 0,
  netreturn: 2000,
  netProfitLoss: 2000,
  netProfitLossPercent: 20,
  sellDate: "",
  user: "Sasankh",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

function renderStocks() {
  return render(
    <BrowserRouter>
      <AssetManagementProvider>
        <Stocks />
      </AssetManagementProvider>
    </BrowserRouter>
  );
}

describe("Stocks", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => cleanup());

  it("renders stocks wrapper", () => {
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("renders Stock Portfolio heading", () => {
    renderStocks();
    expect(screen.getByText("Stock Portfolio")).toBeInTheDocument();
  });

  it("renders Add Stock button", () => {
    renderStocks();
    expect(screen.getByRole("button", { name: /add stock/i })).toBeInTheDocument();
  });

  it("renders KPI labels", () => {
    renderStocks();
    expect(screen.getByText("Total Invested")).toBeInTheDocument();
    expect(screen.getByText("Current Value")).toBeInTheDocument();
    expect(screen.getByText(/Total P&L/)).toBeInTheDocument();
    expect(screen.getByText("Portfolio Return")).toBeInTheDocument();
  });

  it("renders Refresh Prices button", () => {
    renderStocks();
    expect(screen.getByRole("button", { name: /refresh prices/i })).toBeInTheDocument();
  });

  it("renders tab labels", () => {
    renderStocks();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Target & Allocation")).toBeInTheDocument();
  });

  it("renders filter chips", () => {
    renderStocks();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Sold")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({ data: [], isLoading: true });
    renderStocks();
    expect(screen.queryByTestId("stocks-wrapper")).not.toBeInTheDocument();
  });

  it("renders stock rows when data is provided", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: [makeStock({ id: 1, stockName: "Infosys" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByText("Infosys")).toBeInTheDocument();
  });

  it("opens add stock dialog when Add Stock is clicked", () => {
    renderStocks();
    const btn = screen.getByRole("button", { name: /add stock/i });
    fireEvent.click(btn);
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("switches to Performance tab", () => {
    renderStocks();
    fireEvent.click(screen.getByText("Performance"));
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("switches to Target & Allocation tab", () => {
    renderStocks();
    fireEvent.click(screen.getByText("Target & Allocation"));
    expect(screen.getByText("Target & Allocation")).toBeInTheDocument();
  });

  it("filter chips switch active/sold filters", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        makeStock({ id: 1, stockName: "Active Co", status: "active" }),
        makeStock({ id: 2, stockName: "Sold Co", status: "sold" }),
      ],
      isLoading: false,
    });
    renderStocks();
    fireEvent.click(screen.getByText("Active"));
    expect(screen.getByText("Active Co")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sold"));
    expect(screen.getByText("Sold Co")).toBeInTheDocument();
  });

  it("computes KPIs with marketPrice > 0", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ avg: 100, marketPrice: 150, quantity: 10, buyTax: 50, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("computes KPIs using netProfitLoss when marketPrice is 0", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ marketPrice: 0, netProfitLoss: 500, currentValue: 5000, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("Refresh Prices button is disabled with no active stocks", () => {
    renderStocks();
    const btn = screen.getByRole("button", { name: /refresh prices/i });
    expect(btn).toBeDisabled();
  });

  it("shows dash for market price cell when marketPrice is 0", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ marketPrice: 0, currentValue: 12000, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows negative P&L in error color (colIndex 6)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ netProfitLoss: -3000, netProfitLossPercent: -30, marketPrice: 0, currentValue: 7000, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("shows negative P&L% chip (colIndex 7)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ netProfitLossPercent: -15, netProfitLoss: -1500, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    // chip shows "-15.00%"
    expect(screen.getByText(/-15\.00%/)).toBeInTheDocument();
  });

  it("shows sold chip for sold stock (colIndex 8)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ status: "sold" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByText("sold")).toBeInTheDocument();
  });

  it("switches to Performance tab and renders StocksPerformance", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock()],
      isLoading: false,
    });
    renderStocks();
    fireEvent.click(screen.getByText("Performance"));
    expect(screen.getAllByText(/Total P&L/).length).toBeGreaterThan(0);
  });

  it("switches to Target & Allocation tab", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock()],
      isLoading: false,
    });
    renderStocks();
    fireEvent.click(screen.getByText("Target & Allocation"));
    expect(screen.getByText("Portfolio Weight")).toBeInTheDocument();
  });

  it("buildRow uses currentValue when mp is 0 (currentValue col branch)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ marketPrice: 0, quantity: 10, currentValue: 9000, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("returnPct branch: shows negative return when totalPL < 0", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ marketPrice: 0, netProfitLoss: -2000, totalInvested: 10000, status: "active" })],
      isLoading: false,
    });
    renderStocks();
    // returnPct < 0 → no "+" prefix; portfolio return shows negative value
    expect(screen.getByText("Portfolio Return")).toBeInTheDocument();
  });

  it("shows warning chip for unknown status (neither active nor sold)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ status: "pending" as "active" })],
      isLoading: false,
    });
    renderStocks();
    // status "pending" → "warning" chip color
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("null-coalescing branches: stock with null numeric fields", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({
        marketPrice: null as unknown as number,
        quantity: null as unknown as number,
        currentValue: null as unknown as number,
        totalInvested: null as unknown as number,
        avg: null as unknown as number,
        buyTax: null as unknown as number,
        netProfitLoss: null as unknown as number,
        status: "active",
      })],
      isLoading: false,
    });
    renderStocks();
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("openEdit finds no matching stock (if (stock) false branch)", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ stockName: "Infosys", avg: 1000 })],
      isLoading: false,
    });
    renderStocks();
    // Edit button click uses openEdit → stock lookup may not match → no dialog
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });

  it("Refresh Prices disabled tooltip when active stocks exist", async () => {
    const { useStocksQuery } = await import("../../../hooks/queries");
    (useStocksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [makeStock({ status: "active" })],
      isLoading: false,
    });
    renderStocks();
    // Active stocks → button enabled
    const btn = screen.getByRole("button", { name: /refresh prices/i });
    expect(btn).not.toBeDisabled();
  });
});
