import { describe, it, vi, expect, beforeEach } from "vitest";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));
import { useSalaryMutation } from "./useSalaryMutation";

vi.mock("../../services/SalaryService/SalaryService", () => ({
  default: vi.fn(() => ({
    postSalaryDetails: vi.fn().mockResolvedValue({ id: 1 }),
    updateSalaryDetails: vi.fn().mockResolvedValue(undefined),
    getSalaryDetails: vi.fn().mockResolvedValue({ data: [] }),
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

const mockSalaryDTO = {
  transactionType: "Salary", type: "income", amount: 80000,
  date: "2025-01-01", description: "Monthly salary", user: "Sasankh",
};

describe("useSalaryMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createTransaction mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useSalaryMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createTransaction.mutate(mockSalaryDTO); });
    await waitFor(() => expect(result.current.createTransaction.isSuccess).toBe(true));
  });

  it("createTransaction triggers onError on failure", async () => {
    const SalaryService = (await import("../../services/SalaryService/SalaryService")).default;
    (SalaryService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      postSalaryDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useSalaryMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createTransaction.mutate(mockSalaryDTO); });
    await waitFor(() => expect(result.current.createTransaction.isError).toBe(true));
  });

  it("updateTransaction mutates successfully and triggers onSuccess (invalidate)", async () => {
    const { result } = renderHook(() => useSalaryMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateTransaction.mutate({ id: 1, data: mockSalaryDTO }); });
    await waitFor(() => expect(result.current.updateTransaction.isSuccess).toBe(true));
  });

  it("updateTransaction triggers onError on failure", async () => {
    const SalaryService = (await import("../../services/SalaryService/SalaryService")).default;
    (SalaryService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      updateSalaryDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useSalaryMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateTransaction.mutate({ id: 1, data: mockSalaryDTO }); });
    await waitFor(() => expect(result.current.updateTransaction.isError).toBe(true));
  });
});
