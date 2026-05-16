import { describe, it, vi, expect, beforeEach, MockedFunction } from "vitest";
import { httpService, baseURL } from "./axiosConnection";
import { createCRUDService } from "./CRUDService";

vi.mock("./axiosConnection");

interface TestItem { id: number; name: string }
interface CreateTestItem { name: string }

describe("createCRUDService", () => {
  const service = createCRUDService<TestItem, CreateTestItem>("/items");

  const mockedGet   = httpService.get   as unknown as MockedFunction<typeof httpService.get>;
  const mockedPost  = httpService.post  as unknown as MockedFunction<typeof httpService.post>;
  const mockedPatch = httpService.patch as unknown as MockedFunction<typeof httpService.patch>;
  const mockedDel   = httpService.del   as unknown as MockedFunction<typeof httpService.del>;

  beforeEach(() => vi.clearAllMocks());

  describe("list", () => {
    it("calls GET /items and returns the data array", async () => {
      mockedGet.mockResolvedValue({ status: "success", data: [{ id: 1, name: "A" }] });
      const result = await service.list();
      expect(result).toEqual({ data: [{ id: 1, name: "A" }] });
      expect(httpService.get).toHaveBeenCalledWith(`${baseURL}/items`);
    });

    it("rejects on failure", async () => {
      mockedGet.mockRejectedValue(new Error("fetch failed"));
      await expect(service.list()).rejects.toThrow("fetch failed");
    });
  });

  describe("create", () => {
    it("calls POST /items and returns the created item", async () => {
      mockedPost.mockResolvedValue({ id: 2, name: "B" });
      const result = await service.create({ name: "B" });
      expect(result).toEqual({ id: 2, name: "B" });
      expect(httpService.post).toHaveBeenCalledWith(`${baseURL}/items`, { name: "B" });
    });

    it("rejects on failure", async () => {
      mockedPost.mockRejectedValue(new Error("create failed"));
      await expect(service.create({ name: "X" })).rejects.toThrow("create failed");
    });
  });

  describe("update", () => {
    it("calls PATCH /items?id=5 and returns the updated item", async () => {
      mockedPatch.mockResolvedValue({ id: 5, name: "C" });
      const result = await service.update(5, { name: "C" });
      expect(result).toEqual({ id: 5, name: "C" });
      expect(httpService.patch).toHaveBeenCalledWith(`${baseURL}/items?id=5`, { name: "C" });
    });

    it("rejects on failure", async () => {
      mockedPatch.mockRejectedValue(new Error("update failed"));
      await expect(service.update(5, { name: "C" })).rejects.toThrow("update failed");
    });
  });

  describe("delete", () => {
    it("calls DEL /items/3 and resolves", async () => {
      mockedDel.mockResolvedValue(null);
      await service.delete(3);
      expect(httpService.del).toHaveBeenCalledWith(`${baseURL}/items/3`);
    });

    it("rejects on failure", async () => {
      mockedDel.mockRejectedValue(new Error("delete failed"));
      await expect(service.delete(3)).rejects.toThrow("delete failed");
    });
  });
});
