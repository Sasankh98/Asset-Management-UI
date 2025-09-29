import { describe, expect, vi, it, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";

import { UserLoginDTO, UserInfoDTO } from "../../../server/types";
import LoginService from "./loginService";

vi.mock("../axiosConnection");

describe("Login Service", () => {
  const service = LoginService();
  const mockedPost = httpService.post as unknown as MockedFunction<
    typeof httpService.post
  >;

  it("Should call login post service when called", async () => {
    const mockResponse: UserInfoDTO = {
      status: "success",
      data: { email: "sasankh" },
      token: "wqdvdwj",
    };

    const mockRequest: UserLoginDTO = {
      email: "sasankh",
     password:"bhjbh"
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await service.login(mockRequest);
    expect(result).toEqual(mockResponse);
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/login`,
      mockRequest
    );
  });

  it("should handle errors in post goals", async () => {
    const mockError = new Error("Failed to fetch user details");
   const mockRequest: UserLoginDTO = {
      email: "sasankh",
     password:"bhjbh"
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(service.login(mockRequest)).rejects.toThrow(
      "Failed to fetch user details"
    );
    expect(httpService.post).toHaveBeenCalledWith(
      `${baseURL}/login`,
      mockRequest
    );
  });
});
