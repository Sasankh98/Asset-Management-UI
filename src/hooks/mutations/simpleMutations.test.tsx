/**
 * Tests for mutation hooks that do NOT require AssetManagementContext:
 * useEmisMutation, useLicMutation, useLoansMutation,
 * useLoginMutation, useProvidentFundMutation
 */
import { describe, it, vi, expect, beforeEach } from "vitest";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

vi.mock("@tanstack/react-query", async () => await vi.importActual("@tanstack/react-query"));

import { useEmisMutation } from "./useEmisMutation";
import { useLicMutation } from "./useLicMutation";
import { useLoansMutation } from "./useLoansMutation";
import { useLoginMutation } from "./useLoginMutation";
import { useProvidentFundMutation } from "./useProvidentFundMutation";

vi.mock("../../services/EmisService/EmisService", () => ({
  default: vi.fn(() => ({
    createEmi: vi.fn().mockResolvedValue({ id: 1 }),
    updateEmi: vi.fn().mockResolvedValue(undefined),
    deleteEmi: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../services/LicService/LicService", () => ({
  default: vi.fn(() => ({
    createPolicy: vi.fn().mockResolvedValue({ id: 1 }),
    updatePolicy: vi.fn().mockResolvedValue(undefined),
    deletePolicy: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../services/LoansService/LoansService", () => ({
  default: vi.fn(() => ({
    createLoan: vi.fn().mockResolvedValue({ id: 1 }),
    updateLoan: vi.fn().mockResolvedValue(undefined),
    deleteLoan: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../services/CRUDService", () => ({
  loginService: { create: vi.fn().mockResolvedValue({ token: "abc" }) },
  goalsService: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  salaryService: { create: vi.fn(), update: vi.fn() },
  mutualFundsService: { create: vi.fn(), update: vi.fn() },
  mutualFundsDashboardService: {},
  stocksService: { create: vi.fn(), update: vi.fn() },
}));

vi.mock("../../services/ProvidentFundService/ProvidentFundService", () => ({
  default: vi.fn(() => ({
    upsert: vi.fn().mockResolvedValue({ id: 1 }),
    getConfig: vi.fn().mockResolvedValue(null),
  })),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const mockEmiDTO = {
  name: "Car", kind: "loan", totalAmt: 100000, emiAmount: 5000,
  totalInstallments: 24, paidInstallments: 6, nextDueDay: 5,
  startDate: "2024-01-01", user: "Sasankh",
};

const mockLicDTO = {
  policyName: "LIC Jeevan", premiumAmount: 5000, sumAssured: 500000,
  startDate: "2020-01-01", maturityDate: "2040-01-01", premiumTerm: 20,
  returnType: "Endowment", user: "Sasankh",
};

const mockLoanDTO = {
  name: "Home", kind: "home", totalAmt: 5000000, paidAmt: 500000,
  emi: 45000, interestRate: 8.5, dueDate: "2040-01-01",
  tenureLeft: "15 years", user: "Sasankh",
};

const mockPfDTO = {
  monthlyBasic: 50000, empPct: 12, erPct: 12, rate: 8.5,
  yearsWorked: 5, currentAge: 30, retirementAge: 58,
  currentBalance: 300000, vpfPct: 0, salaryIncrementPct: 10,
  joiningMonth: 1, user: "Sasankh",
};

describe("useEmisMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createEmi mutates successfully", async () => {
    const { result } = renderHook(() => useEmisMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createEmi.mutate(mockEmiDTO); });
    await waitFor(() => expect(result.current.createEmi.isSuccess).toBe(true));
  });

  it("updateEmi mutates successfully", async () => {
    const { result } = renderHook(() => useEmisMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateEmi.mutate({ id: 1, data: mockEmiDTO }); });
    await waitFor(() => expect(result.current.updateEmi.isSuccess).toBe(true));
  });

  it("deleteEmi mutates successfully", async () => {
    const { result } = renderHook(() => useEmisMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.deleteEmi.mutate(1); });
    await waitFor(() => expect(result.current.deleteEmi.isSuccess).toBe(true));
  });
});

describe("useLicMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createPolicy mutates successfully", async () => {
    const { result } = renderHook(() => useLicMutation(), { wrapper: makeWrapper() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await act(async () => { result.current.createPolicy.mutate(mockLicDTO as any); });
    await waitFor(() => expect(result.current.createPolicy.isSuccess).toBe(true));
  });

  it("updatePolicy mutates successfully", async () => {
    const { result } = renderHook(() => useLicMutation(), { wrapper: makeWrapper() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await act(async () => { result.current.updatePolicy.mutate({ id: 1, data: mockLicDTO as any }); });
    await waitFor(() => expect(result.current.updatePolicy.isSuccess).toBe(true));
  });

  it("deletePolicy mutates successfully", async () => {
    const { result } = renderHook(() => useLicMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.deletePolicy.mutate(1); });
    await waitFor(() => expect(result.current.deletePolicy.isSuccess).toBe(true));
  });
});

describe("useLoansMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createLoan mutates successfully", async () => {
    const { result } = renderHook(() => useLoansMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createLoan.mutate(mockLoanDTO); });
    await waitFor(() => expect(result.current.createLoan.isSuccess).toBe(true));
  });

  it("updateLoan mutates successfully", async () => {
    const { result } = renderHook(() => useLoansMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.updateLoan.mutate({ id: 1, data: mockLoanDTO }); });
    await waitFor(() => expect(result.current.updateLoan.isSuccess).toBe(true));
  });

  it("deleteLoan mutates successfully", async () => {
    const { result } = renderHook(() => useLoansMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.deleteLoan.mutate(1); });
    await waitFor(() => expect(result.current.deleteLoan.isSuccess).toBe(true));
  });
});

describe("useLoginMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createToken mutates successfully", async () => {
    const { result } = renderHook(() => useLoginMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createToken.mutate({ data: { email: "a@b.com", password: "pass" } }); });
    await waitFor(() => expect(result.current.createToken.isSuccess).toBe(true));
  });

  it("createToken handles error", async () => {
    const { loginService } = await import("../../services/CRUDService");
    (loginService.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Unauthorized"));
    const { result } = renderHook(() => useLoginMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.createToken.mutate({ data: { email: "bad@b.com", password: "wrong" } }); });
    await waitFor(() => expect(result.current.createToken.isError).toBe(true));
  });
});

describe("useProvidentFundMutation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upsertConfig mutates successfully", async () => {
    const { result } = renderHook(() => useProvidentFundMutation(), { wrapper: makeWrapper() });
    await act(async () => { result.current.upsertConfig.mutate(mockPfDTO); });
    await waitFor(() => expect(result.current.upsertConfig.isSuccess).toBe(true));
  });
});
