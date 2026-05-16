import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { DashboardData } from "../../../server/types";
import DashboardService from "./DashboardService";

vi.mock("../axiosConnection");

const mockDashboard: DashboardData = {
  totalNetWorth: 2500000,
  totalAssets: 3000000,
  totalLiabilities: 500000,
  totalMonthlyEmi: 45000,
  savingsRate: 40,
  allocation: {
    mutualFunds: 40,
    stocks: 30,
    pfAndLic: 20,
    liabilities: 10,
  },
};

describe("Dashboard Service", () => {
  const service = DashboardService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboard", () => {
    it("calls GET /dashboard and returns dashboard data on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: mockDashboard });
      const result = await service.getDashboard();
      expect(result).toEqual(mockDashboard);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/dashboard`);
    });

    it("returns null when response is null", async () => {
      mockedGet.mockResolvedValue(null);
      const result = await service.getDashboard();
      expect(result).toBeNull();
    });

    it("rejects with an error on failure", async () => {
      mockedGet.mockRejectedValue(new Error("Failed to fetch dashboard"));
      await expect(service.getDashboard()).rejects.toThrow("Failed to fetch dashboard");
    });
  });
});
