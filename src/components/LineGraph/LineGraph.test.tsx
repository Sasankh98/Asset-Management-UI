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
});
