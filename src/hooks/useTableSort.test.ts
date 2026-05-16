import { describe, it, expect } from "vitest";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useTableSort, TableRow } from "./useTableSort";

describe("useTableSort", () => {
  describe("initial state", () => {
    it("starts with ascending order and orderBy=0", () => {
      const { result } = renderHook(() => useTableSort());
      expect(result.current.order).toBe("asc");
      expect(result.current.orderBy).toBe(0);
    });
  });

  describe("handleSortRequest", () => {
    it("toggles to descending when same column is clicked twice", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(0); });
      expect(result.current.order).toBe("desc");
      expect(result.current.orderBy).toBe(0);
    });

    it("resets to ascending when switching to a different column", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(0); });
      await act(async () => { result.current.handleSortRequest(1); });
      expect(result.current.order).toBe("asc");
      expect(result.current.orderBy).toBe(1);
    });

    it("cycles asc → desc on repeated clicks of the same column", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(0); });
      expect(result.current.order).toBe("desc");
      await act(async () => { result.current.handleSortRequest(0); });
      expect(result.current.order).toBe("asc");
    });
  });

  describe("sortRows", () => {
    const rows: TableRow[] = [
      ["Banana", 30],
      ["Apple", 10],
      ["Cherry", 20],
    ];

    it("sorts rows ascending by column 0 (string)", () => {
      const { result } = renderHook(() => useTableSort());
      const sorted = result.current.sortRows(rows);
      expect(sorted.map((r) => r[0])).toEqual(["Apple", "Banana", "Cherry"]);
    });

    it("sorts rows descending by column 0 after toggle", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(0); });
      const sorted = result.current.sortRows(rows);
      expect(sorted.map((r) => r[0])).toEqual(["Cherry", "Banana", "Apple"]);
    });

    it("sorts rows ascending by column 1 (number)", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(1); });
      const sorted = result.current.sortRows(rows);
      expect(sorted.map((r) => r[1])).toEqual([10, 20, 30]);
    });

    it("sorts rows descending by column 1 after two toggles", async () => {
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(1); });
      await act(async () => { result.current.handleSortRequest(1); });
      const sorted = result.current.sortRows(rows);
      expect(sorted.map((r) => r[1])).toEqual([30, 20, 10]);
    });

    it("preserves original order for equal values (stable sort)", async () => {
      const tiedRows: TableRow[] = [
        ["X", 5],
        ["Y", 5],
        ["Z", 5],
      ];
      const { result } = renderHook(() => useTableSort());
      await act(async () => { result.current.handleSortRequest(1); });
      const sorted = result.current.sortRows(tiedRows);
      expect(sorted.map((r) => r[0])).toEqual(["X", "Y", "Z"]);
    });

    it("returns empty array unchanged", () => {
      const { result } = renderHook(() => useTableSort());
      expect(result.current.sortRows([])).toEqual([]);
    });
  });
});
