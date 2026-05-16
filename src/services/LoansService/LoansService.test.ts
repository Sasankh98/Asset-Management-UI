import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { Loan, CreateLoanDTO } from "../../../server/types";
import LoansService from "./LoansService";

vi.mock("../axiosConnection");

const mockLoan: Loan = {
  id: 1,
  name: "Home Loan",
  kind: "home",
  totalAmt: 5000000,
  paidAmt: 500000,
  emi: 45000,
  interestRate: 8.5,
  dueDate: "2040-01-01",
  tenureLeft: "15 years",
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockCreateDto: CreateLoanDTO = {
  name: "Home Loan",
  kind: "home",
  totalAmt: 5000000,
  paidAmt: 500000,
  emi: 45000,
  interestRate: 8.5,
  dueDate: "2040-01-01",
  tenureLeft: "15 years",
  user: "Sasankh",
};

describe("Loans Service", () => {
  const service = LoansService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost = httpService.post as unknown as MockedFunction<typeof httpService.post>;
  const mockedPatch = httpService.patch as unknown as MockedFunction<typeof httpService.patch>;
  const mockedDel = httpService.del as unknown as MockedFunction<typeof httpService.del>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLoans", () => {
    it("calls GET /loans and returns the loan array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockLoan] });
      const result = await service.getLoans();
      expect(result).toEqual([mockLoan]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/loans`);
    });

    it("returns empty array when response has no data", async () => {
      mockedGet.mockResolvedValue(null);
      const result = await service.getLoans();
      expect(result).toEqual([]);
    });

    it("rejects with an error on failure", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));
      await expect(service.getLoans()).rejects.toThrow("Network error");
    });
  });

  describe("createLoan", () => {
    it("calls POST /loans and returns the created loan on success", async () => {
      mockedPost.mockResolvedValue({ status: "success", data: mockLoan });
      const result = await service.createLoan(mockCreateDto);
      expect(result).toEqual(mockLoan);
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/loans`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      mockedPost.mockRejectedValue(new Error("Failed to create loan"));
      await expect(service.createLoan(mockCreateDto)).rejects.toThrow("Failed to create loan");
    });
  });

  describe("updateLoan", () => {
    it("calls PATCH /loans?id=1 on success", async () => {
      mockedPatch.mockResolvedValue(undefined);
      await service.updateLoan(1, mockCreateDto);
      expect(httpService.patch).toHaveBeenCalledWith(`${baseURL}/loans?id=1`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      mockedPatch.mockRejectedValue(new Error("Failed to update loan"));
      await expect(service.updateLoan(1, mockCreateDto)).rejects.toThrow("Failed to update loan");
    });
  });

  describe("deleteLoan", () => {
    it("calls DEL /loans/1 on success", async () => {
      mockedDel.mockResolvedValue(null);
      await service.deleteLoan(1);
      expect(httpService.del).toHaveBeenCalledWith(`${baseURL}/loans/1`);
    });

    it("rejects with an error on failure", async () => {
      mockedDel.mockRejectedValue(new Error("Failed to delete loan"));
      await expect(service.deleteLoan(1)).rejects.toThrow("Failed to delete loan");
    });
  });
});
