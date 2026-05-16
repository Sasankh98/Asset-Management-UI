import { describe, it, vi, expect, beforeEach } from "vitest";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));
import { useMutualFundsMutation } from "./useMutualFundsMutation";

vi.mock("../../services/MutualFunds/MutualFundsService", () => ({
  default: vi.fn(() => ({
    postMutualFundDetails: vi.fn().mockResolvedValue({ id: 1 }),
    updateMutualFundDetails: vi.fn().mockResolvedValue({ id: 1 }),
    getMutualFundsDetails: vi.fn().mockResolvedValue({ data: [] }),
    getmutualFundsDashboardList: vi.fn().mockResolvedValue({ data: undefined }),
  })),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AssetManagementProvider>{children}</AssetManagementProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const mockMfDTO = {
  fundName: "Parag Parikh", category: "Flexi Cap", invested: 50000,
  currentValue: 60000, units: 100, nav: 600, targetAmount: 200000, user: "Sasankh",
};

describe("useMutualFundsMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createFund mutates successfully and triggers onSuccess (invalidate)", async () => {
    const { result } = renderHook(() => useMutualFundsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createFund.mutate(mockMfDTO); });
    await waitFor(() => expect(result.current.createFund.isSuccess).toBe(true));
  });

  it("createFund triggers onError on failure", async () => {
    const MFService = (await import("../../services/MutualFunds/MutualFundsService")).default;
    (MFService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      postMutualFundDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useMutualFundsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createFund.mutate(mockMfDTO); });
    await waitFor(() => expect(result.current.createFund.isError).toBe(true));
  });

  it("updateFund mutates successfully and triggers onSuccess (invalidate)", async () => {
    const { result } = renderHook(() => useMutualFundsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateFund.mutate({ id: 1, data: mockMfDTO }); });
    await waitFor(() => expect(result.current.updateFund.isSuccess).toBe(true));
  });

  it("updateFund triggers onError on failure", async () => {
    const MFService = (await import("../../services/MutualFunds/MutualFundsService")).default;
    (MFService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      updateMutualFundDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useMutualFundsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateFund.mutate({ id: 1, data: mockMfDTO }); });
    await waitFor(() => expect(result.current.updateFund.isError).toBe(true));
  });
});
