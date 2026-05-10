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

  it("returns Indian locale format for 0", () => {
    const result = fmtInr(0);
    expect(result).toContain("₹");
    expect(result).toContain("0.00");
  });

  it("returns Indian comma format for 50000", () => {
    const result = fmtInr(50000);
    expect(result).toBe("₹50,000.00");
  });

  it('returns "₹1.50 L" for 150000', () => {
    expect(fmtInr(150000)).toBe("₹1.50 L");
  });

  it('returns "₹1.00 Cr" for 10000000', () => {
    expect(fmtInr(10000000)).toBe("₹1.00 Cr");
  });

  it('returns "-₹2.00 L" for -200000', () => {
    expect(fmtInr(-200000)).toBe("-₹2.00 L");
  });

  it('returns "₹2.50 Cr" for 25000000', () => {
    expect(fmtInr(25000000)).toBe("₹2.50 Cr");
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
