import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import StocksPerformance from "./StocksPerformance";
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

describe("StocksPerformance", () => {
  afterEach(() => cleanup());

  it("renders KPI strip section headers", () => {
    const stocks = [makeStock()];
    render(<StocksPerformance stocks={stocks} />);
    expect(screen.getByText("Best Performer")).toBeInTheDocument();
    expect(screen.getByText("Worst Performer")).toBeInTheDocument();
    expect(screen.getByText("Total P&L")).toBeInTheDocument();
  });

  it("shows stock names when active stocks are present", () => {
    const stocks = [
      makeStock({ id: 1, stockName: "Infosys", avg: 1000, marketPrice: 1200, quantity: 10, buyTax: 0 }),
      makeStock({ id: 2, stockName: "Zomato", avg: 200, marketPrice: 150, quantity: 20, buyTax: 0 }),
    ];
    render(<StocksPerformance stocks={stocks} />);
    expect(screen.getAllByText("Infosys").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Zomato").length).toBeGreaterThan(0);
  });

  it("renders invested vs current value chart section", () => {
    render(<StocksPerformance stocks={[makeStock()]} />);
    expect(screen.getByText("Invested vs Current Value")).toBeInTheDocument();
  });

  it("renders stock-wise returns section", () => {
    render(<StocksPerformance stocks={[makeStock()]} />);
    expect(screen.getByText("Stock-wise Returns")).toBeInTheDocument();
  });

  it("does not show stock in stock list when it is sold", () => {
    const stocks = [
      makeStock({ id: 1, stockName: "ActiveStock", status: "active" }),
      makeStock({ id: 2, stockName: "SoldStock", status: "sold" }),
    ];
    render(<StocksPerformance stocks={stocks} />);
    expect(screen.getAllByText("ActiveStock").length).toBeGreaterThan(0);
    expect(screen.queryByText("SoldStock")).not.toBeInTheDocument();
  });
});
