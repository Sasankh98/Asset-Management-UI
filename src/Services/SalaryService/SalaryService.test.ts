import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";

import { SalaryDTO, CreateSalaryDTO } from "../../../server/types";
import SalaryService from "./SalaryService";

vi.mock("../axiosConnection");

describe("Salary Service", () => {
  const service = SalaryService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;
  const mockedPatch = httpService.patch as unknown as MockedFunction<
    typeof httpService.patch
  >;
  it("Should call Income get service when called", async () => {
    const mockResponse: SalaryDTO = {
      status: "success",
      data: [
        {
          id: 1,
          transactionType: "salary",
          amount: 34,
          date: "2026-12-31",
          user: "Sasankh",
          type: "income",
          updatedAt: "2025-07-26T14:40:56.785Z",
          createdAt: "2025-07-26T14:40:56.785Z",
        },
      ],
    };
    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getSalaryDetails();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/salary`);
  });

  it("should handle errors in fetching goals", async () => {
    const mockError = new Error("Failed to fetch salary details");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getSalaryDetails()).rejects.toThrow(
      "Failed to fetch salary details"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/salary`);
  });
  it("Should call Income post service when called", async () => {
    const mockResponse: SalaryDTO = {
      status: "success",
      data: [
        {
          id: 1,
          transactionType: "salary",
          amount: 23443.43,
          date: "2025-12-02",
          user: "sasankh",
          type: "income",
          updatedAt: "2025-07-31T16:35:39.713Z",
          createdAt: "2025-07-31T16:35:39.713Z",
        },
      ],
    };

    const mockRequest: CreateSalaryDTO = {
      transactionType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
      type: "income",
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.postSalaryDetails(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/salary`,
      mockRequest
    );
  });

  it("should handle errors in post salary", async () => {
    const mockError = new Error("Failed to fetch salary details");
    const mockRequest: CreateSalaryDTO = {
      transactionType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
      type: "income",
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(service.postSalaryDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch salary details"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/salary`,
      mockRequest
    );
  });

  it("Should call transaction update service when called", async () => {
    const mockResponse: SalaryDTO = {
      status: "success",
      data: [
        {
          id: 1,
          transactionType: "salary",
          amount: 23443.43,
          date: "2025-12-02",
          user: "sasankh",
          type: "income",
          updatedAt: "2025-07-31T16:35:39.713Z",
          createdAt: "2025-07-31T16:35:39.713Z",
        },
      ],
    };

    const mockRequest: CreateSalaryDTO = {
      transactionType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
      type: "income",
    };
    const id = 1;
    mockedPatch.mockResolvedValue(mockResponse);

    const result = await service.updateSalaryDetails(id, mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/salary?id=${id}`,
      mockRequest
    );
  });

  it("should handle errors in updating transaction details", async () => {
    const mockError = new Error("Failed to update transaction details");
    const mockRequest: CreateSalaryDTO = {
      transactionType: "salary",
      amount: 23443.43,
      date: "2025-12-02",
      user: "sasankh",
      type: "income",
    };
    const id = 1;
    mockedPatch.mockRejectedValue(mockError);

    await expect(service.updateSalaryDetails(id, mockRequest)).rejects.toThrow(
      "Failed to update transaction details"
    );
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/salary?id=${id}`,
      mockRequest
    );
  });

});
