import { describe, expect, vi, it,MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";

import { IncomeDTO } from "../../../server/types";
import IncomeService from "./IncomeService";

vi.mock("../axiosConnection");

describe("Income Service", () => {
  const service = IncomeService();
const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;

  it("Should call Goals get service when called", async () => {
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
//   it("Should call Goals post service when called", async () => {
//     const mockResponse: GoalsDTO = {
//       status: "success",
//       data: [
//         {
//           id: 1,
//           goal: "Marriage",
//           description: "",
//           targetAmount: 20000,
//           savedAmount: 34,
//           targetDate: "2026-12-31",
//           value: 400000,
//           user: "Sasankh",
//           updatedAt: "2025-07-26T14:40:56.785Z",
//           createdAt: "2025-07-26T14:40:56.785Z",
//         },
//       ],
//     };

//     const mockRequest: CreateGoalsDTO = {
//       goal: "string",
//       targetAmount: 100,
//       savedAmount: 10,
//       targetDate: "2026-12-31",
//       user: "Sasankh",
//       value: 1000,
//     };
//     (httpService.post as any).mockResolvedValue(mockResponse);

//     const result = await service.postGoalsDetails(mockRequest);
//     expect(result).toEqual(mockResponse);
//     expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/goals`,mockRequest);
//   });

//   it("should handle errors in post goals", async () => {
//     const mockError = new Error("Failed to fetch goals");
//     const mockRequest: CreateGoalsDTO = {
//       goal: "string",
//       targetAmount: 100,
//       savedAmount: 10,
//       targetDate: "2026-12-31",
//       user: "Sasankh",
//       value: 1000,
//     };
//     (httpService.post as any).mockRejectedValue(mockError);

//     await expect(service.postGoalsDetails(mockRequest)).rejects.toThrow(
//       "Failed to fetch goals"
//     );
//     expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/goals`,mockRequest);
//   });

});
