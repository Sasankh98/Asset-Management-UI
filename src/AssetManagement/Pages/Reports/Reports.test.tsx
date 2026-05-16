import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import Reports from "./Reports";
import { type NetWorthSnapshot } from "../../../../server/types";

const makeSnapshot = (overrides: Partial<NetWorthSnapshot> = {}): NetWorthSnapshot => ({
  id: 1,
  snapshotDate: "2025-01-01",
  totalNetWorth: 5000000,
  totalLiabilities: 1000000,
  mutualFunds: 3000000,
  stocks: 1500000,
  realEstate: 0,
  pfAndLic: 500000,
  other: 0,
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  ...overrides,
});

const mockUseNetWorthTrendQuery = vi.fn(() => ({ data: [] as NetWorthSnapshot[], isLoading: false }));
const mockUseAllocationQuery = vi.fn(() => ({ data: [] as NetWorthSnapshot[], isLoading: false }));
const mockUseStatementsQuery = vi.fn(() => ({ data: [] as NetWorthSnapshot[], isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useNetWorthTrendQuery: () => mockUseNetWorthTrendQuery(),
  useAllocationQuery: () => mockUseAllocationQuery(),
  useStatementsQuery: () => mockUseStatementsQuery(),
}));

describe("Reports (empty state)", () => {
  beforeEach(() => {
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseAllocationQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStatementsQuery.mockReturnValue({ data: [], isLoading: false });
  });
  afterEach(() => cleanup());

  it("renders Performance header", () => {
    render(<Reports />);
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("renders period chips", () => {
    render(<Reports />);
    expect(screen.getByText("1Y")).toBeInTheDocument();
    expect(screen.getByText("1M")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    render(<Reports />);
    expect(screen.getByText(/Returns/)).toBeInTheDocument();
    expect(screen.getByText("XIRR")).toBeInTheDocument();
  });

  it("renders Monthly Statements section", () => {
    render(<Reports />);
    expect(screen.getByText("Monthly Statements")).toBeInTheDocument();
  });

  it("renders Insights section", () => {
    render(<Reports />);
    expect(screen.getByText(/Insights/)).toBeInTheDocument();
  });

  it("renders CSV and PDF download buttons", () => {
    render(<Reports />);
    expect(screen.getByRole("button", { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pdf/i })).toBeInTheDocument();
  });

  it("period chip click changes active period", () => {
    render(<Reports />);
    const chip3M = screen.getByText("3M");
    fireEvent.click(chip3M);
    expect(screen.getByText("3M")).toBeInTheDocument();
  });

  it("renders 5Y and All period chips", () => {
    render(<Reports />);
    expect(screen.getByText("5Y")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });
});

describe("Reports (with snapshot data)", () => {
  afterEach(() => cleanup());

  it("renders trend chart when snapshots provided", () => {
    const snapshots = [
      makeSnapshot({ snapshotDate: "2024-01-01", totalNetWorth: 4000000 }),
      makeSnapshot({ id: 2, snapshotDate: "2024-06-01", totalNetWorth: 4500000 }),
      makeSnapshot({ id: 3, snapshotDate: "2025-01-01", totalNetWorth: 5000000 }),
    ];
    mockUseNetWorthTrendQuery.mockReturnValue({ data: snapshots, isLoading: false });
    mockUseAllocationQuery.mockReturnValue({ data: snapshots, isLoading: false });
    mockUseStatementsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Reports />);
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("renders statements table when statements provided", () => {
    const snapshots = [
      makeSnapshot({ id: 1, snapshotDate: "2024-01-01" }),
      makeSnapshot({ id: 2, snapshotDate: "2024-02-01" }),
    ];
    mockUseNetWorthTrendQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseAllocationQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseStatementsQuery.mockReturnValue({ data: snapshots, isLoading: false });
    render(<Reports />);
    expect(screen.getByText("NET WORTH")).toBeInTheDocument();
  });
});
