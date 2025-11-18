import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import GoalsService from "./GoalsService";
import { GoalsResponseDTO, CreateGoalsDTO } from "../../../server/types";

vi.mock("../axiosConnection");

describe("Goals Service", () => {
  const service = GoalsService();
  const mockedGet = httpService.get as unknown as MockedFunction<
    typeof httpService.get
  >;
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;
  const mockedPatch = httpService.patch as unknown as MockedFunction<
    typeof httpService.patch
  >;
  it("Should call Goals get service when called", async () => {
    const mockResponse: GoalsResponseDTO = {
      status: "success",
      data: [
        {
          id: 1,
          goal: "Marriage",
          description: "",
          targetAmount: 20000,
          savedAmount: 34,
          targetDate: "2026-12-31",
          value: 400000,
          user: "Sasankh",
          updatedAt: "2025-07-26T14:40:56.785Z",
          createdAt: "2025-07-26T14:40:56.785Z",
        },
      ],
    };

    mockedGet.mockResolvedValue(mockResponse);

    const result = await service.getGoalsDetails();
    expect(result).toEqual(mockResponse);
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/goals`);
  });

  it("should handle errors in fetching goals", async () => {
    const mockError = new Error("Failed to fetch goals");
    mockedGet.mockRejectedValue(mockError);

    await expect(service.getGoalsDetails()).rejects.toThrow(
      "Failed to fetch goals"
    );
    expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/goals`);
  });
  it("Should call Goals post service when called", async () => {
    const mockResponse: GoalsResponseDTO = {
      status: "success",
      data: [
        {
          id: 1,
          goal: "Marriage",
          description: "",
          targetAmount: 20000,
          savedAmount: 34,
          targetDate: "2026-12-31",
          value: 400000,
          user: "Sasankh",
          updatedAt: "2025-07-26T14:40:56.785Z",
          createdAt: "2025-07-26T14:40:56.785Z",
        },
      ],
    };

    const mockRequest: CreateGoalsDTO = {
      goal: "string",
      targetAmount: 100,
      savedAmount: 10,
      targetDate: "2026-12-31",
      user: "Sasankh",
      value: 1000,
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.postGoalsDetails(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/goals`,
      mockRequest
    );
  });

  it("should handle errors in post goals", async () => {
    const mockError = new Error("Failed to fetch goals");
    const mockRequest: CreateGoalsDTO = {
      goal: "string",
      targetAmount: 100,
      savedAmount: 10,
      targetDate: "2026-12-31",
      user: "Sasankh",
      value: 1000,
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(service.postGoalsDetails(mockRequest)).rejects.toThrow(
      "Failed to fetch goals"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/goals`,
      mockRequest
    );
  });
  it("Should call Goals update service when called", async () => {
    const mockResponse: GoalsResponseDTO = {
      status: "success",
      data: [
        {
          id: 1,
          goal: "Marriage",
          description: "",
          targetAmount: 20000,
          savedAmount: 34,
          targetDate: "2026-12-31",
          value: 400000,
          user: "Sasankh",
          updatedAt: "2025-07-26T14:40:56.785Z",
          createdAt: "2025-07-26T14:40:56.785Z",
        },
      ],
    };

    const mockRequest: CreateGoalsDTO = {
      goal: "string",
      targetAmount: 100,
      savedAmount: 10,
      targetDate: "2026-12-31",
      user: "Sasankh",
      value: 1000,
    };
    const id = 1;
    mockedPatch.mockResolvedValue(mockResponse);

    const result = await service.updateGoalsDetails(id, mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/goals?id=${id}`,
      mockRequest
    );
  });

  it("should handle errors in fetching goals", async () => {
    const mockError = new Error("Failed to fetch goals");
    const mockRequest: CreateGoalsDTO = {
      goal: "string",
      targetAmount: 100,
      savedAmount: 10,
      targetDate: "2026-12-31",
      user: "Sasankh",
      value: 1000,
    };
    const id = 1;
    mockedPatch.mockRejectedValue(mockError);

    await expect(service.updateGoalsDetails(id, mockRequest)).rejects.toThrow(
      "Failed to fetch goals"
    );
    expect(httpService.patch).toHaveBeenCalledWith(
      `${baseURL}/goals?id=${id}`,
      mockRequest
    );
  });
});
