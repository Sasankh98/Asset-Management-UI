import { describe, it, vi, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));

import { useStagesDefaultsQuery } from "./useStagesDefaultsQuery";

const mockGetDashboard = vi.fn();
const mockGetSalaryDetails = vi.fn();
const mockGetConfig = vi.fn();

vi.mock("../../services/DashboardService/DashboardService", () => ({
  default: () => ({ getDashboard: mockGetDashboard }),
}));
vi.mock("../../services/SalaryService/SalaryService", () => ({
  default: () => ({ getSalaryDetails: mockGetSalaryDetails }),
}));
vi.mock("../../services/ProvidentFundService/ProvidentFundService", () => ({
  default: () => ({ getConfig: mockGetConfig }),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useStagesDefaultsQuery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns data from live sources when all succeed", async () => {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    mockGetDashboard.mockResolvedValue({ totalAssets: 2000000 });
    mockGetSalaryDetails.mockResolvedValue({
      data: [
        { date: recentDate, type: "income", amount: 80000 },
        { date: recentDate, type: "expense", amount: 50000 },
        { date: "2019-01-01", type: "income", amount: 999999 }, // too old
      ],
    });
    mockGetConfig.mockResolvedValue({ currentAge: 30 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.corpus0).toBe(2000000);
    expect(result.current.data?.age0).toBe(30);
    expect(result.current.data?.salary0).toBe(80000);
    expect(result.current.data?.expense0).toBe(50000);
  });

  it("falls back to FALLBACKS when all services reject", async () => {
    mockGetDashboard.mockRejectedValue(new Error("network error"));
    mockGetSalaryDetails.mockRejectedValue(new Error("network error"));
    mockGetConfig.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.age0).toBe(28);
    expect(result.current.data?.salary0).toBe(924000);
    expect(result.current.data?.expense0).toBe(600000);
    expect(result.current.data?.corpus0).toBe(1432000);
  });

  it("falls back to FALLBACK corpus when totalAssets is 0", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 0 });
    mockGetSalaryDetails.mockResolvedValue({ data: [] });
    mockGetConfig.mockResolvedValue({ currentAge: 35 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.corpus0).toBe(1432000);
    expect(result.current.data?.age0).toBe(35);
  });

  it("clamps age0 to [20, 55]", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 500000 });
    mockGetSalaryDetails.mockResolvedValue({ data: [] });
    mockGetConfig.mockResolvedValue({ currentAge: 70 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.age0).toBe(55);
  });

  it("clamps age0 minimum to 20", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 500000 });
    mockGetSalaryDetails.mockResolvedValue({ data: [] });
    mockGetConfig.mockResolvedValue({ currentAge: 15 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.age0).toBe(20);
  });

  it("falls back to FALLBACK salary when no recent income transactions", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 1000000 });
    mockGetSalaryDetails.mockResolvedValue({
      data: [{ date: "2019-06-01", type: "income", amount: 99999 }], // older than 1 year
    });
    mockGetConfig.mockResolvedValue({ currentAge: 30 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.salary0).toBe(924000);
  });

  it("handles salary response with undefined data property", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 1000000 });
    mockGetSalaryDetails.mockResolvedValue(undefined);
    mockGetConfig.mockResolvedValue({ currentAge: 28 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.salary0).toBe(924000);
  });

  it("handles config with no currentAge field", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: 1000000 });
    mockGetSalaryDetails.mockResolvedValue({ data: [] });
    mockGetConfig.mockResolvedValue({});

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.age0).toBe(28);
  });

  it("totalAssets=null covers dash.value.totalAssets ?? 0 right branch (B3 L33)", async () => {
    mockGetDashboard.mockResolvedValue({ totalAssets: null });
    mockGetSalaryDetails.mockResolvedValue({ data: [] });
    mockGetConfig.mockResolvedValue({ currentAge: 30 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // totalAssets ?? 0 → 0, corpus0 > 0 is false → fallback
    expect(result.current.data?.corpus0).toBe(1432000);
  });

  it("null amount on income/expense covers t.amount ?? 0 right branches (B8 L48, B9 L51)", async () => {
    const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    mockGetDashboard.mockResolvedValue({ totalAssets: 500000 });
    mockGetSalaryDetails.mockResolvedValue({
      data: [
        { date: recentDate, type: "income", amount: null },
        { date: recentDate, type: "expense", amount: null },
      ],
    });
    mockGetConfig.mockResolvedValue({ currentAge: 30 });

    const { result } = renderHook(() => useStagesDefaultsQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // null amount ?? 0 → 0 for both income and expense → fallbacks used
    expect(result.current.data?.salary0).toBe(924000);
    expect(result.current.data?.expense0).toBe(600000);
  });
});
