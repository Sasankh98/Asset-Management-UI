import { describe, it, expect } from "vitest";
import { cardDetails } from "./cardDetails";

describe("cardDetails", () => {
  it("exports an array of 4 card objects", () => {
    expect(Array.isArray(cardDetails)).toBe(true);
    expect(cardDetails).toHaveLength(4);
  });

  it("each card has a header property", () => {
    cardDetails.forEach((card) => {
      expect(card).toHaveProperty("header");
    });
  });

  it("includes Current Value card", () => {
    expect(cardDetails.some((c) => c.header === "Current Value")).toBe(true);
  });

  it("includes Total Investment card", () => {
    expect(cardDetails.some((c) => c.header === "Total Investment")).toBe(true);
  });
});
