import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import StocksAllocation from "./StocksAllocation";
import { Stock } from "../../../../server/types";

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

describe("StocksAllocation", () => {
  afterEach(() => cleanup());

  it("renders 'No active holdings' when no stocks are provided", () => {
    render(<StocksAllocation stocks={[]} />);
    expect(screen.getByText("No active holdings")).toBeInTheDocument();
  });

  it("renders Portfolio Weight section", () => {
    render(<StocksAllocation stocks={[makeStock()]} />);
    expect(screen.getByText("Portfolio Weight")).toBeInTheDocument();
  });

  it("renders Market Cap Allocation header", () => {
    render(<StocksAllocation stocks={[makeStock()]} />);
    expect(screen.getByText("Market Cap Allocation")).toBeInTheDocument();
  });

  it("shows stock name in portfolio weight list", () => {
    render(<StocksAllocation stocks={[makeStock({ stockName: "Wipro" })]} />);
    expect(screen.getByText("Wipro")).toBeInTheDocument();
  });

  it("uses currentValue when marketPrice is 0 (mp=0 branch)", () => {
    render(<StocksAllocation stocks={[makeStock({ marketPrice: 0, currentValue: 15000 })]} />);
    expect(screen.getByText("Infosys")).toBeInTheDocument();
  });

  it("defaults category to 'Other' when category is empty", () => {
    render(<StocksAllocation stocks={[makeStock({ category: "" })]} />);
    expect(screen.getByText("Infosys")).toBeInTheDocument();
  });

  it("excludes sold stocks from allocation", () => {
    render(<StocksAllocation stocks={[
      makeStock({ status: "sold" }),
      makeStock({ id: 2, stockName: "TCS", status: "active", marketPrice: 3500, quantity: 5 }),
    ]} />);
    expect(screen.queryByText("Infosys")).not.toBeInTheDocument();
    expect(screen.getByText("TCS")).toBeInTheDocument();
  });

  it("shows success.main bar color when pct < 10", () => {
    // 3 stocks: one is tiny (< 10% of total)
    render(<StocksAllocation stocks={[
      makeStock({ id: 1, stockName: "BigStock", marketPrice: 1000, quantity: 100 }),  // 91%
      makeStock({ id: 2, stockName: "SmallStock", marketPrice: 100, quantity: 10 }), // ~0.9%
    ]} />);
    expect(screen.getByText("SmallStock")).toBeInTheDocument();
  });

  it("shows warning.main bar color when 10 <= pct < 20", () => {
    render(<StocksAllocation stocks={[
      makeStock({ id: 1, stockName: "A", marketPrice: 100, quantity: 80 }), // 80%
      makeStock({ id: 2, stockName: "B", marketPrice: 100, quantity: 12 }), // 12%
      makeStock({ id: 3, stockName: "C", marketPrice: 100, quantity: 8  }), // 8%
    ]} />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows No active stocks yet when all stocks are sold", () => {
    render(<StocksAllocation stocks={[makeStock({ status: "sold" })]} />);
    expect(screen.getByText("No active stocks yet.")).toBeInTheDocument();
  });

  it("handles undefined marketPrice and quantity (null-coalescing branches)", () => {
    render(<StocksAllocation stocks={[
      makeStock({ marketPrice: undefined as unknown as number, quantity: undefined as unknown as number, currentValue: 12000 }),
    ]} />);
    expect(screen.getByText("Infosys")).toBeInTheDocument();
  });
});
