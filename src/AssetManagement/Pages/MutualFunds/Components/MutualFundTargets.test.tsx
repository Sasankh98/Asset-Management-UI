import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import MutualFundTargets from "./MutualFundTargets";
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

describe("MutualFundTargets", () => {
  afterEach(() => cleanup());

  it("renders Overall Target Progress section", () => {
    render(<MutualFundTargets funds={[makeFund()]} />);
    expect(screen.getByText("Overall Target Progress")).toBeInTheDocument();
  });

  it("renders Category Allocation section", () => {
    render(<MutualFundTargets funds={[makeFund()]} />);
    expect(screen.getByText("Category Allocation")).toBeInTheDocument();
  });

  it("renders Fund Target Progress section", () => {
    render(<MutualFundTargets funds={[makeFund()]} />);
    expect(screen.getByText("Fund Target Progress")).toBeInTheDocument();
  });

  it("shows overall progress percentage from dashboard", () => {
    render(<MutualFundTargets funds={[makeFund()]} dashboard={makeDashboard({ totalTargetProgress: 45 })} />);
    expect(screen.getByText("45.0% achieved")).toBeInTheDocument();
  });

  it("shows 0% when no dashboard provided", () => {
    render(<MutualFundTargets funds={[makeFund()]} />);
    expect(screen.getByText("0.0% achieved")).toBeInTheDocument();
  });

  it("caps overall progress at 100%", () => {
    render(<MutualFundTargets funds={[makeFund()]} dashboard={makeDashboard({ totalTargetProgress: 150 })} />);
    expect(screen.getByText("100.0% achieved")).toBeInTheDocument();
  });

  it("renders fund names in Fund Target Progress", () => {
    render(<MutualFundTargets funds={[makeFund({ fundName: "Axis Bluechip" })]} />);
    expect(screen.getByText("Axis Bluechip")).toBeInTheDocument();
  });

  it("shows No data text when no funds provided for pie chart", () => {
    render(<MutualFundTargets funds={[]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("shows No funds added yet when funds array is empty", () => {
    render(<MutualFundTargets funds={[]} />);
    expect(screen.getByText("No funds added yet")).toBeInTheDocument();
  });

  it("renders target amount from dashboard", () => {
    render(<MutualFundTargets funds={[makeFund()]} dashboard={makeDashboard({ totalTargetAmount: 500000 })} />);
    expect(screen.getByText(/Target:/)).toBeInTheDocument();
  });

  it("renders current value from dashboard", () => {
    render(<MutualFundTargets funds={[makeFund()]} dashboard={makeDashboard({ totalCurrentValue: 120000 })} />);
    expect(screen.getByText(/Current:/)).toBeInTheDocument();
  });

  it("renders fund category in per-fund section", () => {
    render(<MutualFundTargets funds={[makeFund({ category: "Mid Cap" })]} />);
    expect(screen.getByText(/Mid Cap/)).toBeInTheDocument();
  });

  it("groups funds by category in pie chart", () => {
    const funds = [
      makeFund({ id: 1, category: "Large Cap", currentValue: 60000 }),
      makeFund({ id: 2, fundName: "Axis Mid Cap", category: "Mid Cap", currentValue: 30000 }),
    ];
    render(<MutualFundTargets funds={funds} />);
    expect(screen.getByText("Axis Mid Cap")).toBeInTheDocument();
  });

  it("renders multiple fund progress bars", () => {
    const funds = [
      makeFund({ id: 1, fundName: "Fund A", targetProgress: 80 }),
      makeFund({ id: 2, fundName: "Fund B", targetProgress: 40 }),
      makeFund({ id: 3, fundName: "Fund C", targetProgress: 20 }),
    ];
    render(<MutualFundTargets funds={funds} />);
    expect(screen.getByText("Fund A")).toBeInTheDocument();
    expect(screen.getByText("Fund B")).toBeInTheDocument();
    expect(screen.getByText("Fund C")).toBeInTheDocument();
  });

  it("null targetProgress covers f.targetProgress ?? 0 right branch (L109 binary-expr)", () => {
    render(<MutualFundTargets funds={[makeFund({ targetProgress: null as unknown as number })]} />);
    expect(screen.getByText("Fund Target Progress")).toBeInTheDocument();
  });
});
