import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import ProvidentFund from "./ProvidentFund";

vi.mock("../../../services/ProvidentFundService/ProvidentFundService", () => ({
  default: () => ({
    getConfig: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue({ id: 1 }),
  }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
}));

describe("ProvidentFund Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without crashing and shows the Provident Fund heading", async () => {
    render(<ProvidentFund />);
    await waitFor(() => {
      expect(screen.getByText(/Provident Fund/i)).toBeInTheDocument();
    });
  });

  it("shows Settings panel after data loads", async () => {
    render(<ProvidentFund />);
    await waitFor(() => {
      const elements = screen.getAllByText(/Settings/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("shows Retirement Projection panel after data loads", async () => {
    render(<ProvidentFund />);
    await waitFor(() => {
      const elements = screen.getAllByText(/Retirement Projection/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("Save button is present after data loads", async () => {
    render(<ProvidentFund />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    });
  });

  // it("shows Year-by-year section and toggling Show reveals the table", async () => {
  //   render(<ProvidentFund />);
  //   await waitFor(() => {
  //     expect(screen.getByText(/Year-by-year/i)).toBeInTheDocument();
  //   });
  //   const showBtn = screen.getByRole("button", { name: /Show/i });
  //   fireEvent.click(showBtn);
  //   await waitFor(() => {
  //     expect(screen.getByText(/Hide/i)).toBeInTheDocument();
  //   });
  // });
});
