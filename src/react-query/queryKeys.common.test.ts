import { describe, it, expect } from "vitest";
import { queryKeys } from "./queryKeys.common";

describe("queryKeys", () => {
  it("stocks.all returns ['stocks']", () => {
    expect(queryKeys.stocks.all()).toEqual(["stocks"]);
  });

  it("goals.all returns ['goals']", () => {
    expect(queryKeys.goals.all()).toEqual(["goals"]);
  });

  it("mutualFunds.all returns ['mutualFunds']", () => {
    expect(queryKeys.mutualFunds.all()).toEqual(["mutualFunds"]);
  });

  it("mutualFunds.dashboard returns ['mutualFunds', 'dashboard']", () => {
    expect(queryKeys.mutualFunds.dashboard()).toEqual(["mutualFunds", "dashboard"]);
  });

  it("dashboard.all returns ['dashboard']", () => {
    expect(queryKeys.dashboard.all()).toEqual(["dashboard"]);
  });

  it("salary.all returns ['salary']", () => {
    expect(queryKeys.salary.all()).toEqual(["salary"]);
  });

  it("settings.profile returns ['settings', 'profile']", () => {
    expect(queryKeys.settings.profile()).toEqual(["settings", "profile"]);
  });

  it("lic.all returns ['lic']", () => {
    expect(queryKeys.lic.all()).toEqual(["lic"]);
  });

  it("loans.all returns ['loans']", () => {
    expect(queryKeys.loans.all()).toEqual(["loans"]);
  });

  it("emis.all returns ['emis']", () => {
    expect(queryKeys.emis.all()).toEqual(["emis"]);
  });

  it("providentFund.config returns ['providentFund', user]", () => {
    expect(queryKeys.providentFund.config("Sasankh")).toEqual(["providentFund", "Sasankh"]);
  });

  it("reports.trend returns ['reports', 'trend', period]", () => {
    expect(queryKeys.reports.trend("1Y")).toEqual(["reports", "trend", "1Y"]);
  });

  it("reports.allocation returns ['reports', 'allocation']", () => {
    expect(queryKeys.reports.allocation()).toEqual(["reports", "allocation"]);
  });

  it("reports.statements returns ['reports', 'statements', limit]", () => {
    expect(queryKeys.reports.statements(12)).toEqual(["reports", "statements", 12]);
  });
});
