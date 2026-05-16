import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "./queryClients";

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
