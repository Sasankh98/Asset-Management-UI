import { describe, it, expect } from "vitest";
import { formatCurrency } from "./currencyConverter";

describe("formatCurrency", () => {
  it("returns empty string for null", () => {
    expect(formatCurrency(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatCurrency(undefined)).toBe("");
  });

  it("returns a string containing '1,000.00' and '₹' for 1000", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1,000.00");
    expect(result).toContain("₹");
  });

  it("returns a string containing '0.00' for 0", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });

  it("returns a string containing '-' and '500.00' for -500", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("-");
    expect(result).toContain("500.00");
  });
});
