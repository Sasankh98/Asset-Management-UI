import { describe, it, vi, expect, beforeEach } from "vitest";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));
import { useStocksMutation } from "./useStocksMutation";

vi.mock("../../services/StocksService/StocksService", () => ({
  default: vi.fn(() => ({
    postStockDetails: vi.fn().mockResolvedValue({ id: 1 }),
    updateStockDetails: vi.fn().mockResolvedValue({ id: 1 }),
    getStocksDetails: vi.fn().mockResolvedValue({ data: [] }),
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

const mockStockDTO = {
  stockName: "Infosys", avg: 1000, quantity: 10, user: "Sasankh",
  buyTax: 50, buyDate: "2024-01-01", status: "active", category: "Large Cap",
};

describe("useStocksMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createStock mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useStocksMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createStock.mutate(mockStockDTO); });
    await waitFor(() => expect(result.current.createStock.isSuccess).toBe(true));
  });

  it("createStock triggers onError on failure", async () => {
    const StocksService = (await import("../../services/StocksService/StocksService")).default;
    (StocksService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      postStockDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useStocksMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createStock.mutate(mockStockDTO); });
    await waitFor(() => expect(result.current.createStock.isError).toBe(true));
  });

  it("updateStock mutates successfully and triggers onSuccess", async () => {
    const { result } = renderHook(() => useStocksMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateStock.mutate({ id: 1, data: mockStockDTO }); });
    await waitFor(() => expect(result.current.updateStock.isSuccess).toBe(true));
  });

  it("updateStock triggers onError on failure", async () => {
    const StocksService = (await import("../../services/StocksService/StocksService")).default;
    (StocksService as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      updateStockDetails: vi.fn().mockRejectedValue(new Error("Failed")),
    }));
    const { result } = renderHook(() => useStocksMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateStock.mutate({ id: 1, data: mockStockDTO }); });
    await waitFor(() => expect(result.current.updateStock.isError).toBe(true));
  });
});
