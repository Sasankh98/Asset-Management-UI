import { describe, it, vi, expect, beforeEach } from "vitest";
import { get, post, patch, put, del, getUniqueParams } from "./axiosConnection";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeResponse(body: unknown, status = 200, ok = true) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  } as Response;
}

describe("getUniqueParams", () => {
  it("returns query string starting with ? when no existing params", () => {
    const result = getUniqueParams("http://example.com/api");
    expect(result).toMatch(/^\?timestamp=\d+/);
  });

  it("returns &timestamp= when path already has query params", () => {
    const result = getUniqueParams("http://example.com/api?foo=bar");
    expect(result).toMatch(/^&timestamp=\d+/);
  });
});

describe("get", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed JSON on 200 success", async () => {
    mockFetch.mockResolvedValue(makeResponse({ data: "ok" }));
    const result = await get<{ data: string }>("http://example.com/api");
    expect(result).toEqual({ data: "ok" });
  });

  it("returns null on 204 No Content", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, 204));
    const result = await get("http://example.com/api");
    expect(result).toBeNull();
  });

  it("rejects when response is not ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("Not Found", 404, false));
    await expect(get("http://example.com/api")).rejects.toBeDefined();
  });

  it("throws when fetch itself rejects", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    await expect(get("http://example.com/api")).rejects.toThrow("Network error");
  });
});

describe("post", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeResponse({ id: 1 }));
    const result = await post("http://example.com/api", { name: "test" });
    expect(result).toEqual({ id: 1 });
  });

  it("returns null on 204", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, 204));
    const result = await post("http://example.com/api", {});
    expect(result).toBeNull();
  });

  it("rejects when response is not ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("Bad Request", 400, false));
    await expect(post("http://example.com/api", {})).rejects.toBeDefined();
  });

  it("throws when fetch rejects", async () => {
    mockFetch.mockRejectedValue(new Error("timeout"));
    await expect(post("http://example.com/api", {})).rejects.toThrow("timeout");
  });
});

describe("patch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeResponse({ updated: true }));
    const result = await patch("http://example.com/api", { field: "val" });
    expect(result).toEqual({ updated: true });
  });

  it("returns null on 204", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, 204));
    const result = await patch("http://example.com/api", {});
    expect(result).toBeNull();
  });

  it("rejects when response is not ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("Server Error", 500, false));
    await expect(patch("http://example.com/api", {})).rejects.toBeDefined();
  });
});

describe("put", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeResponse({ ok: true }));
    const result = await put("http://example.com/api", { x: 1 });
    expect(result).toEqual({ ok: true });
  });

  it("returns null on 204", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, 204));
    const result = await put("http://example.com/api", {});
    expect(result).toBeNull();
  });

  it("rejects when response is not ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("error", 422, false));
    await expect(put("http://example.com/api", {})).rejects.toBeDefined();
  });
});

describe("del", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeResponse({ deleted: true }));
    const result = await del("http://example.com/api");
    expect(result).toEqual({ deleted: true });
  });

  it("returns null on 204", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, 204));
    const result = await del("http://example.com/api");
    expect(result).toBeNull();
  });

  it("rejects when response is not ok", async () => {
    mockFetch.mockResolvedValue(makeResponse("Not Found", 404, false));
    await expect(del("http://example.com/api")).rejects.toBeDefined();
  });

  it("throws when fetch rejects", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));
    await expect(del("http://example.com/api")).rejects.toThrow("network down");
  });
});
