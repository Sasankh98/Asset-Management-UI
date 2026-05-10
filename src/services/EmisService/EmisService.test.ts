import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { Emi, CreateEmiDTO } from "../../../server/types";
import EmisService from "./EmisService";

vi.mock("../axiosConnection");

const mockEmi: Emi = {
  id: 1,
  name: "Car Loan",
  kind: "loan",
  totalAmt: 500000,
  emiAmount: 12000,
  totalInstallments: 48,
  paidInstallments: 12,
  nextDueDay: 5,
  startDate: "2024-01-01",
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockCreateDto: CreateEmiDTO = {
  name: "Car Loan",
  kind: "loan",
  totalAmt: 500000,
  emiAmount: 12000,
  totalInstallments: 48,
  paidInstallments: 12,
  nextDueDay: 5,
  startDate: "2024-01-01",
  user: "Sasankh",
};

describe("EMIs Service", () => {
  const service = EmisService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost = httpService.post as unknown as MockedFunction<typeof httpService.post>;
  const mockedPatch = httpService.patch as unknown as MockedFunction<typeof httpService.patch>;
  const mockedDel = httpService.del as unknown as MockedFunction<typeof httpService.del>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmis", () => {
    it("calls GET /emis and returns the EMI array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockEmi] });
      const result = await service.getEmis();
      expect(result).toEqual([mockEmi]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/emis`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch EMIs");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getEmis()).rejects.toThrow("Failed to fetch EMIs");
    });
  });

  describe("createEmi", () => {
    it("calls POST /emis and returns the created EMI on success", async () => {
      mockedPost.mockResolvedValue({ status: "success", data: mockEmi });
      const result = await service.createEmi(mockCreateDto);
      expect(result).toEqual(mockEmi);
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/emis`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to create EMI");
      mockedPost.mockRejectedValue(mockError);
      await expect(service.createEmi(mockCreateDto)).rejects.toThrow("Failed to create EMI");
    });
  });

  describe("updateEmi", () => {
    it("calls PATCH /emis?id=1 and resolves on success", async () => {
      mockedPatch.mockResolvedValue(undefined);
      await service.updateEmi(1, mockCreateDto);
      expect(httpService.patch).toHaveBeenCalledWith(`${baseURL}/emis?id=1`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to update EMI");
      mockedPatch.mockRejectedValue(mockError);
      await expect(service.updateEmi(1, mockCreateDto)).rejects.toThrow("Failed to update EMI");
    });
  });

  describe("deleteEmi", () => {
    it("calls DEL /emis/1 and resolves on success", async () => {
      mockedDel.mockResolvedValue(null);
      await service.deleteEmi(1);
      expect(httpService.del).toHaveBeenCalledWith(`${baseURL}/emis/1`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to delete EMI");
      mockedDel.mockRejectedValue(mockError);
      await expect(service.deleteEmi(1)).rejects.toThrow("Failed to delete EMI");
    });
  });
});
