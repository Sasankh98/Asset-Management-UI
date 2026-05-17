import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import LineGraph, { CustomTooltip } from "./LineGraph";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("LineGraph", () => {
  afterEach(() => cleanup());

  it("renders the tracker heading", () => {
    render(<LineGraph monthlyData={[]} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("renders with income data", () => {
    const data = [
      { date: new Date().toISOString().slice(0, 10), amount: 80000, type: "income" },
    ];
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("renders with expense data", () => {
    const today = new Date().toISOString().slice(0, 10);
    const data = [
      { date: today, amount: 80000, type: "income" },
      { date: today, amount: 5000, type: "expense" },
    ];
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("handles transaction from previous month (falls back to default DataPoint)", () => {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevDate = prevMonthDate.toISOString().slice(0, 10);
    const data = [
      { date: prevDate, amount: 80000, type: "income" },
      { date: prevDate, amount: 5000, type: "expense" },
    ];
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("handles multiple expenses on same day (cumulative update)", () => {
    const today = new Date().toISOString().slice(0, 10);
    const data = [
      { date: today, amount: 100000, type: "income" },
      { date: today, amount: 10000, type: "expense" },
      { date: today, amount: 5000, type: "expense" },
    ];
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("renders with only expense data (no income)", () => {
    const today = new Date().toISOString().slice(0, 10);
    const data = [{ date: today, amount: 5000, type: "expense" }];
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });

  it("renders with many days of income data", () => {
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const data = dates.map((date) => ({ date, amount: 10000, type: "income" }));
    render(<LineGraph monthlyData={data} />);
    expect(screen.getByText(/monthly income/i)).toBeInTheDocument();
  });
});

describe("CustomTooltip", () => {
  afterEach(() => cleanup());

  it("returns null when active=false (B0 true branch)", () => {
    const { container } = render(
      <CustomTooltip active={false} payload={[{ name: "Income", value: 50000, color: "#4caf50" }]} label="2024-05-01" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when active=true but payload is empty (B1 right arm)", () => {
    const { container } = render(
      <CustomTooltip active={true} payload={[]} label="2024-05-01" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders tooltip when active=true with payload (B0 false branch)", () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: "Income", value: 50000, color: "#4caf50" }]}
        label="2024-05-01"
      />
    );
    expect(screen.getByText(/Income/)).toBeInTheDocument();
  });

  it("covers label ?? '' right branch when label is undefined", () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: "Expenses", value: 20000, color: "#ef5350" }]}
        label={undefined}
      />
    );
    expect(screen.getByText(/Expenses/)).toBeInTheDocument();
  });

  it("covers entry.value ?? 0 right branch when value is null", () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: "Balance", value: null as unknown as number, color: "#1976d2" }]}
        label="2024-05-15"
      />
    );
    expect(screen.getByText(/Balance/)).toBeInTheDocument();
  });
});
