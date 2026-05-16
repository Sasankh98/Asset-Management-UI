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
});
