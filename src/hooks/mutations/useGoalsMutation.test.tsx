import { describe, it, vi, expect, beforeEach } from "vitest";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));
import { useGoalsMutation } from "./useGoalsMutation";

vi.mock("../../services/CRUDService", () => ({
  goalsService: {
    create: vi.fn().mockResolvedValue({ id: 1, goal: "Save", targetAmount: 10000, savedAmount: 0, targetDate: "2030-01-01", value: 0, user: "Sasankh", createdAt: "", updatedAt: "" }),
    update: vi.fn().mockResolvedValue({ id: 1, goal: "Save", targetAmount: 20000, savedAmount: 0, targetDate: "2030-01-01", value: 0, user: "Sasankh", createdAt: "", updatedAt: "" }),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
  loginService: { create: vi.fn() },
  salaryService: { create: vi.fn(), update: vi.fn() },
  mutualFundsService: { create: vi.fn(), update: vi.fn() },
  mutualFundsDashboardService: {},
  stocksService: { create: vi.fn(), update: vi.fn() },
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

const mockCreateDTO = { goal: "House", targetAmount: 5000000, savedAmount: 0, targetDate: "2030-01-01", user: "Sasankh", value: 0 };

describe("useGoalsMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createGoal mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createGoal.mutate({ data: mockCreateDTO }); });
    await waitFor(() => expect(result.current.createGoal.isSuccess).toBe(true));
  });

  it("createGoal triggers onError on failure", async () => {
    const { goalsService } = await import("../../services/CRUDService");
    (goalsService.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createGoal.mutate({ data: mockCreateDTO }); });
    await waitFor(() => expect(result.current.createGoal.isError).toBe(true));
  });

  it("updateGoal mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateGoal.mutate({ id: 1, data: mockCreateDTO }); });
    await waitFor(() => expect(result.current.updateGoal.isSuccess).toBe(true));
  });

  it("updateGoal triggers onError on failure", async () => {
    const { goalsService } = await import("../../services/CRUDService");
    (goalsService.update as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateGoal.mutate({ id: 1, data: mockCreateDTO }); });
    await waitFor(() => expect(result.current.updateGoal.isError).toBe(true));
  });

  it("deleteGoal mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.deleteGoal.mutate({ id: 1 }); });
    await waitFor(() => expect(result.current.deleteGoal.isSuccess).toBe(true));
  });

  it("deleteGoal triggers onError on failure", async () => {
    const { goalsService } = await import("../../services/CRUDService");
    (goalsService.delete as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Failed"));
    const { result } = renderHook(() => useGoalsMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.deleteGoal.mutate({ id: 1 }); });
    await waitFor(() => expect(result.current.deleteGoal.isError).toBe(true));
  });
});
