import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";

import { IncomeDTO, CreateIncomeDTO } from "../../../server/types";
import IncomeService from "./IncomeService";

vi.mock("../axiosConnection");

describe("Income Service", () => {
  const service = IncomeService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;

  it("Should call Income get service when called", async () => {
    const mockResponse: IncomeDTO = {
      status: "success",
      data: [
        {
          id: 1,
          incomeType: "salary",
          amount: 34,
          date: "2026-12-31",
          user: "Sasankh",
          updatedAt: "2025-07-26T14:40:56.785Z",
          createdAt: "2025-07-26T14:40:56.785Z",
        },
      ],
    };
    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getIncomeDetails();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/income`);
  });

  it("should handle errors in fetching goals", async () => {
    const mockError = new Error("Failed to fetch income details");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getIncomeDetails()).rejects.toThrow(
      "Failed to fetch income details"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/income`);
  });
  it("Should call Income post service when called", async () => {
    const mockResponse: IncomeDTO = {
      status: "success",
      data: [
        {
          id: 1,
          incomeType: "salary",
          amount: 23443.43,
          date: "2025-12-02",
          user: "sasankh",
          updatedAt: "2025-07-31T16:35:39.713Z",
          createdAt: "2025-07-31T16:35:39.713Z",
        },
      ],
    };

    const mockRequest: CreateIncomeDTO = {
      incomeType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.postIncomeDetails(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/income`,
      mockRequest
    );
  });

  it("should handle errors in post income", async () => {
    const mockError = new Error("Failed to fetch income details");
    const mockRequest: CreateIncomeDTO = {
      incomeType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(service.postIncomeDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch income details"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/income`,
      mockRequest
    );
  });
});
