import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTimeStamp, dateFormat, getTimeAgo } from "./dateTime";

describe("getTimeStamp", () => {
  it("returns a positive number", () => {
    const ts = getTimeStamp();
    expect(typeof ts).toBe("number");
    expect(ts).toBeGreaterThan(0);
  });
});

describe("dateFormat", () => {
  it("returns correct dateOnly format DD Mon YYYY for a known ISO date", () => {
    const { dateOnly } = dateFormat("2024-03-15T10:30:00.000Z");
    // dateOnly should look like "15 Mar 2024"
    expect(dateOnly).toMatch(/^\d{2} [A-Za-z]{3} \d{4}$/);
    expect(dateOnly).toContain("Mar");
    expect(dateOnly).toContain("2024");
  });

  it("includes AM or PM in the dateTime string", () => {
    const { dateTime } = dateFormat("2024-06-20T14:00:00.000Z");
    expect(dateTime).toMatch(/AM|PM/);
  });

  it("returns an object with dateTime and dateOnly keys", () => {
    const result = dateFormat("2023-01-01T00:00:00.000Z");
    expect(result).toHaveProperty("dateTime");
    expect(result).toHaveProperty("dateOnly");
  });
});

describe("getTimeAgo", () => {
  const NOW = new Date("2024-06-15T12:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for a date 30 seconds ago', () => {
    const date = new Date(NOW - 30 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("Just now");
  });

  it('returns "5 minutes ago" for a date 5 minutes ago', () => {
    const date = new Date(NOW - 5 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("5 minutes ago");
  });

  it('returns "1 minute ago" (singular) for a date 1 minute ago', () => {
    const date = new Date(NOW - 1 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("1 minute ago");
  });

  it('returns "2 hours ago" for a date 2 hours ago', () => {
    const date = new Date(NOW - 2 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("2 hours ago");
  });

  it('returns "1 hour ago" (singular) for a date 1 hour ago', () => {
    const date = new Date(NOW - 1 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("1 hour ago");
  });

  it('returns "3 days ago" for a date 3 days ago', () => {
    const date = new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("3 days ago");
  });

  it('returns "1 day ago" (singular) for a date 1 day ago', () => {
    const date = new Date(NOW - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("1 day ago");
  });

  it('returns "2 weeks ago" for a date 2 weeks ago', () => {
    const date = new Date(NOW - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("2 weeks ago");
  });

  it('returns "1 week ago" (singular) for a date 1 week ago', () => {
    const date = new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("1 week ago");
  });

  it('returns "2 months ago" for a date 2 months ago', () => {
    const date = new Date(NOW - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(date)).toBe("2 months ago");
  });
});
