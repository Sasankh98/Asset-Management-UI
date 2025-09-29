import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import MutualFundsService from "./MutualFundsService";
import { CreateMutualFundsDTO, MutualFundsDTO } from "../../../server/types";

vi.mock("../axiosConnection");

describe("Mutual Funds Service", () => {
  const service = MutualFundsService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;
  // const mockedPatch = httpService.patch as unknown as MockedFunction<
  //   typeof httpService.patch
  // >;
  it("Should call mutual funds get service when called", async () => {
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
  it("Should call mutual funds post service when called", async () => {
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

    const mockRequest: CreateMutualFundsDTO = {
      fundName: "ABC Growth Fund",
      category: "Equity",
      invested: 10000,
      currentValue: 10000,
      nav: 10000,
      units: 10000,
      user: "sasankh",
    };
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
    const mockRequest: CreateMutualFundsDTO = {
      fundName: "ABC Growth Fund",
      category: "Equity",
      invested: 10000,
      currentValue: 10000,
      nav: 10000,
      units: 10000,
      user: "sasankh",
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(service.postMutualFundDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch mutual funds"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/mutualFunds`,
      mockRequest
    );
  });
  // it("Should call mutual funds update service when called", async () => {
  //   const mockResponse: GoalsDTO = {
  //     status: "success",
  //     data: [
  //       {
  //         id: 1,
  //         goal: "Marriage",
  //         description: "",
  //         targetAmount: 20000,
  //         savedAmount: 34,
  //         targetDate: "2026-12-31",
  //         value: 400000,
  //         user: "Sasankh",
  //         updatedAt: "2025-07-26T14:40:56.785Z",
  //         createdAt: "2025-07-26T14:40:56.785Z",
  //       },
  //     ],
  //   };

  //   const mockRequest: CreateGoalsDTO = {
  //     goal: "string",
  //     targetAmount: 100,
  //     savedAmount: 10,
  //     targetDate: "2026-12-31",
  //     user: "Sasankh",
  //     value: 1000,
  //   };
  //   const id = 1;
  //   mockedPatch.mockResolvedValue(mockResponse);

  //   const result = await service.updateGoalsDetails(id, mockRequest);
  //   expect(result).toEqual(mockResponse);
  //   expect(httpService.patch).toHaveBeenCalledWith(
  //     `${baseURL}/goals?id=${id}`,
  //     mockRequest
  //   );
  // });

  // it("should handle errors in fetching goals", async () => {
  //   const mockError = new Error("Failed to fetch goals");
  //   const mockRequest: CreateGoalsDTO = {
  //     goal: "string",
  //     targetAmount: 100,
  //     savedAmount: 10,
  //     targetDate: "2026-12-31",
  //     user: "Sasankh",
  //     value: 1000,
  //   };
  //   const id = 1;
  //   mockedPatch.mockRejectedValue(mockError);

  //   await expect(service.updateGoalsDetails(id, mockRequest)).rejects.toThrow(
  //     "Failed to fetch goals"
  //   );
  //   expect(httpService.patch).toHaveBeenCalledWith(
  //     `${baseURL}/goals?id=${id}`,
  //     mockRequest
  //   );
  // });
});
