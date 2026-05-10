import { describe, expect, vi, it, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "../axiosConnection";
import { LicPolicy, CreateLicPolicyDTO } from "../../../server/types";
import LicService from "./LicService";

vi.mock("../axiosConnection");

const mockPolicy: LicPolicy = {
  id: 1,
  name: "My Life Policy",
  policyNumber: "LIC123456",
  startDate: "2020-01-01",
  policyTerm: 20,
  premiumPayTerm: 15,
  premiumFreq: "yearly",
  premium: 25000,
  sumAssured: 1000000,
  returnType: "endowment",
  returnAmount: 1500000,
  maturityBonus: 200000,
  user: "Sasankh",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const mockCreateDto: CreateLicPolicyDTO = {
  name: "My Life Policy",
  policyNumber: "LIC123456",
  startDate: "2020-01-01",
  policyTerm: 20,
  premiumPayTerm: 15,
  premiumFreq: "yearly",
  premium: 25000,
  sumAssured: 1000000,
  returnType: "endowment",
  returnAmount: 1500000,
  maturityBonus: 200000,
  user: "Sasankh",
};

describe("LIC Service", () => {
  const service = LicService();

  const mockedGet = httpService.get as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost = httpService.post as unknown as MockedFunction<typeof httpService.post>;
  const mockedPatch = httpService.patch as unknown as MockedFunction<typeof httpService.patch>;
  const mockedDel = httpService.del as unknown as MockedFunction<typeof httpService.del>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPolicies", () => {
    it("calls GET /lic and returns the policy array on success", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [mockPolicy] });
      const result = await service.getPolicies();
      expect(result).toEqual([mockPolicy]);
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/lic`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to fetch LIC policies");
      mockedGet.mockRejectedValue(mockError);
      await expect(service.getPolicies()).rejects.toThrow("Failed to fetch LIC policies");
    });
  });

  describe("createPolicy", () => {
    it("calls POST /lic and returns the created policy on success", async () => {
      mockedPost.mockResolvedValue({ status: "success", data: mockPolicy });
      const result = await service.createPolicy(mockCreateDto);
      expect(result).toEqual(mockPolicy);
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/lic`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to create LIC policy");
      mockedPost.mockRejectedValue(mockError);
      await expect(service.createPolicy(mockCreateDto)).rejects.toThrow("Failed to create LIC policy");
    });
  });

  describe("updatePolicy", () => {
    it("calls PATCH /lic?id=1 and resolves on success", async () => {
      mockedPatch.mockResolvedValue(undefined);
      await service.updatePolicy(1, mockCreateDto);
      expect(httpService.patch).toHaveBeenCalledWith(`${baseURL}/lic?id=1`, mockCreateDto);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to update LIC policy");
      mockedPatch.mockRejectedValue(mockError);
      await expect(service.updatePolicy(1, mockCreateDto)).rejects.toThrow("Failed to update LIC policy");
    });
  });

  describe("deletePolicy", () => {
    it("calls DEL /lic/1 and resolves on success", async () => {
      mockedDel.mockResolvedValue(null);
      await service.deletePolicy(1);
      expect(httpService.del).toHaveBeenCalledWith(`${baseURL}/lic/1`);
    });

    it("rejects with an error on failure", async () => {
      const mockError = new Error("Failed to delete LIC policy");
      mockedDel.mockRejectedValue(mockError);
      await expect(service.deletePolicy(1)).rejects.toThrow("Failed to delete LIC policy");
    });
  });
});
