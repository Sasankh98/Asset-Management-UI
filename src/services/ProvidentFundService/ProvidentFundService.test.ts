import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { PfConfig, CreatePfConfigDTO } from "../../../server/types";
import ProvidentFundService from "./ProvidentFundService";

vi.mock("../axiosConnection");

const mockPfConfig: PfConfig = {
  id: 1,
  monthlyBasic: 60000,
  empPct: 12,
  erPct: 12,
  rate: 8.25,
  yearsWorked: 5,
  currentAge: 30,
  retirementAge: 60,
  currentBalance: 200000,
  vpfPct: 0,
  salaryIncrementPct: 10,
  joiningMonth: 1,
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockCreateDto: CreatePfConfigDTO = {
  monthlyBasic: 60000,
  empPct: 12,
  erPct: 12,
  rate: 8.25,
  yearsWorked: 5,
  currentAge: 30,
  retirementAge: 60,
  currentBalance: 200000,
  vpfPct: 0,
  salaryIncrementPct: 10,
  joiningMonth: 1,
  user: "Sasankh",
};

describe("ProvidentFund Service", () => {
  const service = ProvidentFundService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost = httpService.post as unknown as MockedFunction<typeof httpService.post>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    it("calls the correct URL without query string when no user is given", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: mockPfConfig });
      await service.getConfig();
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/providentFund`);
    });

    it('calls the correct URL with ?user=Sasankh when user is "Sasankh"', async () => {
      mockedGet.mockResolvedValue({ status: "success", data: mockPfConfig });
      await service.getConfig("Sasankh");
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/providentFund?user=Sasankh`);
    });

    it("returns null when the API returns null data", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: null });
      const result = await service.getConfig();
      expect(result).toBeNull();
    });

    it("returns the PfConfig object on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: mockPfConfig });
      const result = await service.getConfig();
      expect(result).toEqual(mockPfConfig);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch PF config");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getConfig()).rejects.toThrow("Failed to fetch PF config");
    });
  });

  describe("upsert", () => {
    it("calls POST and returns the created PfConfig on success", async () => {
      mockedPost.mockResolvedValue({ status: "success", data: mockPfConfig });
      const result = await service.upsert(mockCreateDto);
      expect(result).toEqual(mockPfConfig);
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/providentFund`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to upsert PF config");
      mockedPost.mockRejectedValue(mockError);
      await expect(service.upsert(mockCreateDto)).rejects.toThrow("Failed to upsert PF config");
    });
  });
});
