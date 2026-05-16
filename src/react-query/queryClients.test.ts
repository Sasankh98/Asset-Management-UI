import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "./queryClients";

// Extract the retry function from client config for direct unit testing
function getRetryFn() {
  const client = createQueryClient();
  return client.getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown
  ) => boolean;
}

function getRetryDelay() {
  const client = createQueryClient();
  return client.getDefaultOptions().queries?.retryDelay as (
    attempt: number
  ) => number;
}

describe("createQueryClient", () => {
  it("returns a QueryClient instance", () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it("creates a new QueryClient each time", () => {
    const c1 = createQueryClient();
    const c2 = createQueryClient();
    expect(c1).not.toBe(c2);
  });
});

describe("createQueryClient – retry logic", () => {
  it("returns false for 4xx client errors", () => {
    const retry = getRetryFn();
    expect(retry(0, { status: 400 })).toBe(false);
    expect(retry(0, { status: 404 })).toBe(false);
    expect(retry(0, { status: 499 })).toBe(false);
  });

  it("retries for 5xx server errors when failureCount < 3", () => {
    const retry = getRetryFn();
    expect(retry(0, { status: 500 })).toBe(true);
    expect(retry(2, { status: 503 })).toBe(true);
  });

  it("stops retrying at failureCount >= 3 even for server errors", () => {
    const retry = getRetryFn();
    expect(retry(3, { status: 500 })).toBe(false);
  });

  it("retries for non-object errors (string, null) up to 3 times", () => {
    const retry = getRetryFn();
    expect(retry(0, "network failure")).toBe(true);
    expect(retry(0, null)).toBe(true);
    expect(retry(2, null)).toBe(true);
    expect(retry(3, null)).toBe(false);
  });

  it("retries for object errors without a status property", () => {
    const retry = getRetryFn();
    expect(retry(0, { message: "unknown error" })).toBe(true);
    expect(retry(2, { message: "unknown error" })).toBe(true);
  });
});

describe("createQueryClient – retryDelay", () => {
  it("returns exponential delay capped at 30000ms", () => {
    const retryDelay = getRetryDelay();
    expect(retryDelay(0)).toBe(1000);   // 1000 * 2^0 = 1000
    expect(retryDelay(1)).toBe(2000);   // 1000 * 2^1 = 2000
    expect(retryDelay(2)).toBe(4000);   // 1000 * 2^2 = 4000
    expect(retryDelay(10)).toBe(30000); // capped
  });
});
