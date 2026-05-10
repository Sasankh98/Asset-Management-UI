import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { NetWorthSnapshot, CreateSnapshotDTO } from "../../../server/types";
import ReportsService from "./ReportsService";

vi.mock("../axiosConnection");

const mockNetWorthSnapshot: NetWorthSnapshot = {
  id: 1,
  snapshotDate: "2024-01-01",
  totalNetWorth: 1800000,
  mutualFunds: 500000,
  stocks: 12000,
  realEstate: 48,
  pfAndLic: 12,
  other: 5,
  totalLiabilities: 100000,
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockCreateDto: CreateSnapshotDTO = {
  snapshotDate: "2024-01-01",
  totalNetWorth: 1800000,
  mutualFunds: 500000,
  stocks: 12000,
  realEstate: 48,
  pfAndLic: 12,
  other: 5,
  totalLiabilities: 100000,
  user: "Sasankh",
};

describe("Reports Service", () => {
  const service = ReportsService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost = httpService.post as unknown as MockedFunction<typeof httpService.post>;
  const mockedDel = httpService.del as unknown as MockedFunction<typeof httpService.del>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNetWorthTrend", () => {
    it("calls GET /reports/netWorth and returns the net worth array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockNetWorthSnapshot] });
      const result = await service.getNetWorthTrend();
      expect(result).toEqual([mockNetWorthSnapshot]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/reports/netWorth`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch net worth trend");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getNetWorthTrend()).rejects.toThrow("Failed to fetch net worth trend");
    });
  });
  describe("getAllocationHistory", () => {
    it("calls GET /reports/allocation and returns the allocation array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockNetWorthSnapshot] });
      const result = await service.getAllocationHistory();
      expect(result).toEqual([mockNetWorthSnapshot]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/reports/allocation`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch allocation history");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getAllocationHistory()).rejects.toThrow("Failed to fetch allocation history");
    });
  });
  describe("getStatements", () => {
    it("calls GET /reports/statements and returns the statements array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockNetWorthSnapshot] });
      const result = await service.getStatements();
      expect(result).toEqual([mockNetWorthSnapshot]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/reports/statements?limit=12`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch statements");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getStatements()).rejects.toThrow("Failed to fetch statements");
    });
  });

  describe("createSnapshot", () => {
    it("calls POST /snapshot and returns the created snapshot on success", async () => {
      mockedPost.mockResolvedValue({ status: "success", data: mockNetWorthSnapshot });
      const result = await service.createSnapshot(mockCreateDto);
      expect(result).toEqual(mockNetWorthSnapshot);
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/reports/snapshots`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to create snapshot");
      mockedPost.mockRejectedValue(mockError);
      await expect(service.createSnapshot(mockCreateDto)).rejects.toThrow("Failed to create snapshot");
    });
  });

  describe("deleteSnapshot", () => {
    it("calls DEL /snapshot/1 and resolves on success", async () => {
      mockedDel.mockResolvedValue(null);
      await service.deleteSnapshot(1);
      expect(httpService.del).toHaveBeenCalledWith(`${baseURL}/reports/snapshots/1`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to delete snapshot");
      mockedDel.mockRejectedValue(mockError);
      await expect(service.deleteSnapshot(1)).rejects.toThrow("Failed to delete snapshot");
    });
  });
});
