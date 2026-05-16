import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import LineGraph from "./LineGraph";

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
