import { describe, it, expect } from "vitest";
import { fmtInr, inrNum } from "./formatCurrency";

describe("fmtInr", () => {
  it('returns "—" for null', () => {
    expect(fmtInr(null)).toBe("—");
  });

  it('returns "—" for undefined', () => {
    expect(fmtInr(undefined)).toBe("—");
  });

  it('returns "—" for NaN', () => {
    expect(fmtInr(NaN)).toBe("—");
  });

  it("returns ₹0 for 0", () => {
    expect(fmtInr(0)).toBe("₹0");
  });

  it("returns no decimal places for amounts < 1L", () => {
    expect(fmtInr(50000)).toBe("₹50,000");
  });

  it('returns "₹1.50L" for 150000', () => {
    expect(fmtInr(150000)).toBe("₹1.50L");
  });

  it('returns "₹1.00Cr" for 10000000', () => {
    expect(fmtInr(10000000)).toBe("₹1.00Cr");
  });

  it('returns "-₹2.00L" for -200000', () => {
    expect(fmtInr(-200000)).toBe("-₹2.00L");
  });

  it('returns "₹2.50Cr" for 25000000', () => {
    expect(fmtInr(25000000)).toBe("₹2.50Cr");
  });
});

describe("inrNum", () => {
  it('returns "—" for null', () => {
    expect(inrNum(null)).toBe("—");
  });

  it('returns "—" for undefined', () => {
    expect(inrNum(undefined)).toBe("—");
  });

  it('returns "—" for NaN', () => {
    expect(inrNum(NaN)).toBe("—");
  });

  it("returns a string containing 1,000.00 for 1000", () => {
    const result = inrNum(1000);
    expect(result).toContain("1,000.00");
  });
});
