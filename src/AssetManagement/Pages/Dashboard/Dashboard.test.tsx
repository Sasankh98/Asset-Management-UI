import { beforeEach, describe, test, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";

vi.mock("../../../services/DashboardService/DashboardService", () => ({
  default: () => ({
    getDashboard: vi.fn().mockResolvedValue({
      totalNetWorth: 1000000,
      totalAssets: 1200000,
      totalLiabilities: 200000,
      totalMonthlyEmi: 15000,
      savingsRate: 40,
      allocation: { mutualFunds: 500000, stocks: 400000, pfAndLic: 100000, liabilities: 200000 },
    }),
  }),
}));

vi.mock("../../../services/ReportsService/ReportsService", () => ({
  default: () => ({
    getNetWorthTrend: vi.fn().mockResolvedValue([]),
  }),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Dashboard />);
  });

  test("renders Dashboard component", async () => {
    await waitFor(() =>
      expect(screen.getByTestId("dashboard-container")).toBeInTheDocument()
    );
  });
});
