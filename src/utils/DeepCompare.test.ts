import { describe, it, expect } from "vitest";
import { deepEqual } from "./DeepCompare";

describe("deepEqual", () => {
  describe("primitive values", () => {
    it("returns true for the same number", () => {
      expect(deepEqual(42, 42)).toBe(true);
    });

    it("returns true for the same string", () => {
      expect(deepEqual("a", "a")).toBe(true);
    });

    it("returns false for different numbers", () => {
      expect(deepEqual(1, 2)).toBe(false);
    });

    it("returns false for different strings", () => {
      expect(deepEqual("a", "b")).toBe(false);
    });
  });

  describe("null handling", () => {
    it("returns true for null === null", () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    it("returns false for null vs an object", () => {
      expect(deepEqual(null, {} as unknown as null)).toBe(false);
    });

    it("returns false for an object vs null", () => {
      expect(deepEqual({} as unknown as null, null)).toBe(false);
    });
  });

  describe("objects", () => {
    it("returns true for two empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("returns true for two objects with the same keys and values", () => {
      expect(deepEqual({ a: 1, b: "hello" }, { a: 1, b: "hello" })).toBe(true);
    });

    it("returns false for objects with different values", () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("returns false for objects with different keys", () => {
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });
  });

  describe("arrays", () => {
    it("returns true for [1,2,3] vs [1,2,3]", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it("returns false for [1,2] vs [1,2,3]", () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it("returns true for an array of deeply equal objects", () => {
      const a = [{ id: 1, name: "foo" }, { id: 2, name: "bar" }];
      const b = [{ id: 1, name: "foo" }, { id: 2, name: "bar" }];
      expect(deepEqual(a, b)).toBe(true);
    });

    it("returns false for an array of objects with different values", () => {
      const a = [{ id: 1 }];
      const b = [{ id: 2 }];
      expect(deepEqual(a, b)).toBe(false);
    });
  });

  describe("nested objects", () => {
    it("returns true for deeply nested equal objects", () => {
      const a = { x: { y: { z: 42 } } };
      const b = { x: { y: { z: 42 } } };
      expect(deepEqual(a, b)).toBe(true);
    });

    it("returns false for deeply nested unequal objects", () => {
      const a = { x: { y: { z: 42 } } };
      const b = { x: { y: { z: 99 } } };
      expect(deepEqual(a, b)).toBe(false);
    });
  });

  describe("Date objects", () => {
    it("returns true for two Dates with the same getTime()", () => {
      const ts = 1700000000000;
      expect(deepEqual(new Date(ts), new Date(ts))).toBe(true);
    });

    it("returns false for two Dates with different getTime()", () => {
      expect(deepEqual(new Date(1000), new Date(2000))).toBe(false);
    });
  });
});
