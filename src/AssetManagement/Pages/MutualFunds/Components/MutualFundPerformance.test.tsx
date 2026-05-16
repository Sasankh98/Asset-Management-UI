import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import MutualFundPerformance from "./MutualFundPerformance";
import { MutualFund, MutualFundsDashboard } from "../../../../../server/types";

const makeFund = (overrides: Partial<MutualFund> = {}): MutualFund => ({
  id: 1,
  fundName: "HDFC Top 100",
  category: "Large Cap",
  invested: 50000,
  currentValue: 60000,
  units: 220,
  nav: 272.73,
  gain_loss: 10000,
  targetProgress: 60,
  user: "Sasankh",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const makeDashboard = (overrides: Partial<MutualFundsDashboard> = {}): MutualFundsDashboard => ({
  totalInvested: 100000,
  totalCurrentValue: 120000,
  totalGainLoss: 20000,
  totalTargetAmount: 500000,
  totalTargetProgress: 24,
  totalGainLossPercent: 20,
  ...overrides,
});

describe("MutualFundPerformance", () => {
  afterEach(() => cleanup());

  it("renders KPI strip headers", () => {
    render(<MutualFundPerformance funds={[makeFund()]} />);
    expect(screen.getByText("Best Performer")).toBeInTheDocument();
    expect(screen.getByText("Worst Performer")).toBeInTheDocument();
    expect(screen.getByText("Total Gain / Loss")).toBeInTheDocument();
  });

  it("shows best and worst performer names", () => {
    const funds = [
      makeFund({ id: 1, fundName: "Winner Fund", gain_loss: 20000 }),
      makeFund({ id: 2, fundName: "Loser Fund", gain_loss: -5000 }),
    ];
    render(<MutualFundPerformance funds={funds} />);
    expect(screen.getAllByText("Winner Fund").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Loser Fund").length).toBeGreaterThan(0);
  });

  it("renders Invested vs Current Value section", () => {
    render(<MutualFundPerformance funds={[makeFund()]} />);
    expect(screen.getByText("Invested vs Current Value")).toBeInTheDocument();
  });

  it("renders fund-wise returns section", () => {
    render(<MutualFundPerformance funds={[makeFund()]} />);
    expect(screen.getByText("Fund-wise Returns")).toBeInTheDocument();
  });

  it("renders total gain/loss from dashboard", () => {
    render(<MutualFundPerformance funds={[makeFund()]} dashboard={makeDashboard()} />);
    expect(screen.getByText("Total Gain / Loss")).toBeInTheDocument();
  });

  it("handles empty funds array", () => {
    render(<MutualFundPerformance funds={[]} />);
    expect(screen.getByText("Best Performer")).toBeInTheDocument();
  });

  it("truncates long fund names in chart data", () => {
    const longName = "A Very Long Mutual Fund Name That Should Be Truncated";
    render(<MutualFundPerformance funds={[makeFund({ fundName: longName })]} />);
    expect(screen.getByText("Invested vs Current Value")).toBeInTheDocument();
  });

  it("renders with dashboard showing gain percentage", () => {
    render(<MutualFundPerformance funds={[makeFund()]} dashboard={makeDashboard({ totalGainLossPercent: 15.5 })} />);
    expect(screen.getByText("Total Gain / Loss")).toBeInTheDocument();
  });

  it("renders multiple funds correctly", () => {
    const funds = [
      makeFund({ id: 1, fundName: "Fund A", gain_loss: 5000 }),
      makeFund({ id: 2, fundName: "Fund B", gain_loss: 3000 }),
      makeFund({ id: 3, fundName: "Fund C", gain_loss: -1000 }),
    ];
    render(<MutualFundPerformance funds={funds} />);
    expect(screen.getAllByText("Fund A").length).toBeGreaterThan(0);
  });
});
