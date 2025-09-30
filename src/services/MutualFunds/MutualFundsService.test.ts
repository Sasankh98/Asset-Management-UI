import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import MutualFundsService from "./MutualFundsService";
import { CreateMutualFundsDTO, MutualFundsDTO } from "../../../server/types";

vi.mock("../axiosConnection");

const mockRequest: CreateMutualFundsDTO = {
  fundName: "ABC Growth Fund",
  category: "Equity",
  invested: 10000,
  currentValue: 10000,
  nav: 10000,
  units: 10000,
  targetProgress: 100000,
  user: "sasankh",
};

const mockResponse: MutualFundsDTO = {
  status: "success",
  data: [
    {
      id: 1,
      fundName: "ABC Growth Fund",
      category: "Equity",
      invested: 10000.0,
      currentValue: 10000.0,
      nav: 10000.0,
      units: 10000,
      user: "sasankh",
      updatedAt: "2025-09-28T09:17:48.296Z",
      createdAt: "2025-09-28T09:17:48.296Z",
      gain_loss: 3000,
      targetProgress: 9,
    },
  ],
};

describe("Mutual Funds Service", () => {
  const service = MutualFundsService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;
  const mockedPatch = httpService.patch as unknown as MockedFunction<
    typeof httpService.patch
  >;
  it("Should call mutual funds get service when called", async () => {
    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getMutualFundsDetails();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/mutualFunds`);
  });

  it("should handle errors in fetching mutual funds", async () => {
    const mockError = new Error("Failed to fetch goals");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getMutualFundsDetails()).rejects.toThrow(
      "Failed to fetch goals"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/mutualFunds`);
  });
  it("Should call mutual funds Dashboard get service when called", async () => {
    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getmutualFundsDashboardList();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/mutualFunds/dashboard`);
  });

  it("should handle errors in fetching mutual funds dashboard", async () => {
    const mockError = new Error("Failed to fetch mutual funds dashboard");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getmutualFundsDashboardList()).rejects.toThrow(
      "Failed to fetch mutual funds dashboard"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/mutualFunds/dashboard`);
  });
  it("Should call mutual funds post service when called", async () => {

    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.postMutualFundDetails(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/mutualFunds`,
      mockRequest
    );
  });

  it("should handle errors in post mutual funds", async () => {
    const mockError = new Error("Failed to fetch mutual funds");

    mockedPost.mockRejectedValue(mockError);

    await expect(service.postMutualFundDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch mutual funds"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/mutualFunds`,
      mockRequest
    );
  });
  it("Should call mutual funds update service when called", async () => {

    const id = 1;
    mockedPatch.mockResolvedValue(mockResponse);

    const result = await service.updateMutualFundDetails(id, mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/mutualFunds?id=${id}`,
      mockRequest
    );
  });

  it("should handle errors in updating mutual funds", async () => {
    const mockError = new Error("Failed to updating mutual funds");

    const id = 1;
    mockedPatch.mockRejectedValue(mockError);

    await expect(service.updateMutualFundDetails(id, mockRequest)).rejects.toThrow(
      "Failed to updating mutual funds"
    );
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/mutualFunds?id=${id}`,
      mockRequest
    );
  });
});
