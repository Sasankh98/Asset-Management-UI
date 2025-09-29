import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";

import { StocksDTO, CreateStocksDTO } from "../../../server/types";
import StocksService from "./StocksService";

vi.mock("../axiosConnection");
const mockResponse: StocksDTO = {
  status: "success",
  data: [
    {
      id: 1,
      stockName: "string",
      avg: 1,
      quantity: 1,
      totalInvested: 1,
      buyDate: "2025-07-21",
      status: "Active",
      currentValue: 1,
      marketPrice: 1,
      sellPrice: 1,
      totalReturns: 1,
      profitLoss: 1,
      dividends: 1,
      buyTax: 1,
      sellTax: 1,
      netreturn: 1,
      netProfitLoss: 1,
      netProfitLossPercent: 1,
      sellDate: "2025-07-26",
      user: "Sasankh",
      updatedAt: "2025-07-26T14:40:56.785Z",
      createdAt: "2025-07-26T14:40:56.785Z",
    },
  ],
};

const mockRequest: CreateStocksDTO = {
  stockName: "string",
  avg: 1,
  quantity: 1,
  user: "sasankh",
  buyTax: 1,
  buyDate: "string",
  status: "string",
};
describe("Stocks Service", () => {
  const service = StocksService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;
  const mockedPatch = httpService.patch as unknown as MockedFunction<
    typeof httpService.patch
  >;
  it("Should call Stocks get service when called", async () => {
    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getStocksDetails();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/stocks`);
  });

  it("should handle errors in fetching stocks", async () => {
    const mockError = new Error("Failed to fetch stocks details");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getStocksDetails()).rejects.toThrow(
      "Failed to fetch stocks details"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/stocks`);
  });
  it("Should call Income post service when called", async () => {
    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.postStockDetails(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/stocks`,
      mockRequest
    );
  });

  it("should handle errors in post stocks", async () => {
    const mockError = new Error("Failed to fetch stocks details");

    mockedPost.mockRejectedValue(mockError);

    await expect(service.postStockDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch stocks details"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/stocks`,
      mockRequest
    );
  });

  it("Should call transaction update service when called", async () => {
    const id = 1;
    mockedPatch.mockResolvedValue(mockResponse);

    const result = await service.updateStockDetails(id, mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/stocks?id=${id}`,
      mockRequest
    );
  });

  it("should handle errors in updating transaction details", async () => {
    const mockError = new Error("Failed to update transaction details");
    const id = 1;
    mockedPatch.mockRejectedValue(mockError);

    await expect(service.updateStockDetails(id, mockRequest)).rejects.toThrow(
      "Failed to update transaction details"
    );
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/stocks?id=${id}`,
      mockRequest
    );
  });
});
