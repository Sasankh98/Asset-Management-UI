import { describe, it, vi, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Use real react-query, not the global stub from vitest.setup.ts
vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));

import { useGoalsQuery } from "./useGoalsQuery";
import { useStocksQuery } from "./useStocksQuery";
import { useMutualFundsQuery, useMutualFundsDashboardQuery } from "./useMutualFundsQuery";
import { useDashboardQuery } from "./useDashboardQuery";
import { useSalaryQuery } from "./useSalaryQuery";
import { useEmisQuery } from "./useEmisQuery";
import { useLicQuery } from "./useLicQuery";
import { useLoansQuery } from "./useLoansQuery";
import { useProvidentFundQuery } from "./useProvidentFundQuery";
import { useNetWorthTrendQuery, useAllocationQuery, useStatementsQuery } from "./useReportsQuery";
import { useSettingsQuery } from "./useSettingsQuery";

vi.mock("../../services/CRUDService", () => ({
  goalsService: { list: vi.fn().mockResolvedValue({ data: [] }) },
}));
vi.mock("../../services/StocksService/StocksService", () => ({
  default: vi.fn(() => ({ getStocksDetails: vi.fn().mockResolvedValue({ data: [] }) })),
}));
vi.mock("../../services/MutualFunds/MutualFundsService", () => ({
  default: vi.fn(() => ({
    getMutualFundsDetails: vi.fn().mockResolvedValue({ data: [] }),
    getmutualFundsDashboardList: vi.fn().mockResolvedValue({ data: { totalPortfolioValue: 0, totalInvestment: 0, gainLoss: 0, targetProgress: 0 } }),
  })),
}));
vi.mock("../../services/DashboardService/DashboardService", () => ({
  default: vi.fn(() => ({ getDashboard: vi.fn().mockResolvedValue(null) })),
}));
vi.mock("../../services/SalaryService/SalaryService", () => ({
  default: vi.fn(() => ({ getSalaryDetails: vi.fn().mockResolvedValue({ data: [] }) })),
}));
vi.mock("../../services/EmisService/EmisService", () => ({
  default: vi.fn(() => ({ getEmis: vi.fn().mockResolvedValue([]) })),
}));
vi.mock("../../services/LicService/LicService", () => ({
  default: vi.fn(() => ({ getPolicies: vi.fn().mockResolvedValue([]) })),
}));
vi.mock("../../services/LoansService/LoansService", () => ({
  default: vi.fn(() => ({ getLoans: vi.fn().mockResolvedValue([]) })),
}));
vi.mock("../../services/ProvidentFundService/ProvidentFundService", () => ({
  default: vi.fn(() => ({ getConfig: vi.fn().mockResolvedValue(null) })),
}));
vi.mock("../../services/ReportsService/ReportsService", () => ({
  default: vi.fn(() => ({
    getNetWorthTrend: vi.fn().mockResolvedValue([]),
    getAllocationHistory: vi.fn().mockResolvedValue([]),
    getStatements: vi.fn().mockResolvedValue([]),
  })),
}));
vi.mock("../../services/axiosConnection", () => ({
  httpService: { get: vi.fn().mockResolvedValue({ data: { user: null } }) },
  baseURL: "http://test",
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("Query hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useGoalsQuery returns data", async () => {
    const { result } = renderHook(() => useGoalsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useStocksQuery returns data", async () => {
    const { result } = renderHook(() => useStocksQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useMutualFundsQuery returns data", async () => {
    const { result } = renderHook(() => useMutualFundsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useMutualFundsDashboardQuery returns data", async () => {
    const { result } = renderHook(() => useMutualFundsDashboardQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("useDashboardQuery returns data", async () => {
    const { result } = renderHook(() => useDashboardQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("useSalaryQuery returns data", async () => {
    const { result } = renderHook(() => useSalaryQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useEmisQuery returns data", async () => {
    const { result } = renderHook(() => useEmisQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useLicQuery returns data", async () => {
    const { result } = renderHook(() => useLicQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useLoansQuery returns data", async () => {
    const { result } = renderHook(() => useLoansQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useProvidentFundQuery returns data", async () => {
    const { result } = renderHook(() => useProvidentFundQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("useNetWorthTrendQuery returns data", async () => {
    const { result } = renderHook(() => useNetWorthTrendQuery("1Y"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useAllocationQuery returns data", async () => {
    const { result } = renderHook(() => useAllocationQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useStatementsQuery returns data", async () => {
    const { result } = renderHook(() => useStatementsQuery(12), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("useSettingsQuery returns data", async () => {
    const { result } = renderHook(() => useSettingsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
