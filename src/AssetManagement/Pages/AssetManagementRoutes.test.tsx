import { describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AssetManagement from "./AssetManagement";
import { BrowserRouter } from "react-router-dom";
import type * as RouterTypes from "react-router";
import { DisplayContentEnum } from "../../shared/Constants";

// Mock every page so the router test stays fast and isolated
vi.mock("./Dashboard/Dashboard",       () => ({ default: () => <div data-testid="mock-dashboard">Dashboard</div> }));
vi.mock("./Salary/Salary",             () => ({ default: () => <div data-testid="mock-salary">Salary</div> }));
vi.mock("./Goals/Goals",               () => ({ default: () => <div data-testid="mock-goals">Goals</div> }));
vi.mock("./MutualFunds/MutualFunds",   () => ({ default: () => <div data-testid="mock-mf">MF</div> }));
vi.mock("./Liabilities/Loans",         () => ({ default: () => <div data-testid="mock-loans">Loans</div> }));
vi.mock("./Liabilities/EMIs",          () => ({ default: () => <div data-testid="mock-emis">EMIs</div> }));
vi.mock("./Reports/Reports",           () => ({ default: () => <div data-testid="mock-reports">Reports</div> }));
vi.mock("./Calculator/Calculator",     () => ({ default: () => <div data-testid="mock-calc">Calc</div> }));
vi.mock("./LIC/LIC",                   () => ({ default: () => <div data-testid="mock-lic">LIC</div> }));
vi.mock("./ProvidentFund/ProvidentFund", () => ({ default: () => <div data-testid="mock-pf">PF</div> }));
vi.mock("./Stocks/Stocks",             () => ({ default: () => <div data-testid="mock-stocks">Stocks</div> }));
vi.mock("./Settings/Settings",         () => ({ default: () => <div data-testid="mock-settings">Settings</div> }));
vi.mock("./Projections/Projections",   () => ({ default: () => <div data-testid="mock-projections">Projections</div> }));
vi.mock("./Stages/Stages",             () => ({ default: () => <div data-testid="mock-stages">Stages</div> }));

const mockUseParams = vi.fn(() => ({ displayContent: DisplayContentEnum.dashboard as string }));

vi.mock("react-router", async (importOriginal) => {
  const original = await importOriginal<typeof RouterTypes>();
  return { ...original, useParams: () => mockUseParams() };
});

function renderAm() {
  return render(
    <BrowserRouter>
      <AssetManagement />
    </BrowserRouter>
  );
}

describe("AssetManagement routing", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  test("renders dashboard for 'dashboard'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.dashboard });
    renderAm();
    expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
  });

  test("renders dashboard for 'netWorth'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.netWorth });
    renderAm();
    expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
  });

  test("renders Stocks for 'stocks'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.stocks });
    renderAm();
    expect(screen.getByTestId("mock-stocks")).toBeInTheDocument();
  });

  test("renders Salary for 'salary'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.salary });
    renderAm();
    expect(screen.getByTestId("mock-salary")).toBeInTheDocument();
  });

  test("renders MutualFunds for 'mutualFunds'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.mutualFunds });
    renderAm();
    expect(screen.getByTestId("mock-mf")).toBeInTheDocument();
  });

  test("renders ProvidentFund for 'providentFund'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.providentFund });
    renderAm();
    expect(screen.getByTestId("mock-pf")).toBeInTheDocument();
  });

  test("renders LIC for 'lic'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.lic });
    renderAm();
    expect(screen.getByTestId("mock-lic")).toBeInTheDocument();
  });

  test("renders Calculator for 'calculator'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.calculator });
    renderAm();
    expect(screen.getByTestId("mock-calc")).toBeInTheDocument();
  });

  test("renders Goals for 'goals'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.goals });
    renderAm();
    expect(screen.getByTestId("mock-goals")).toBeInTheDocument();
  });

  test("renders Loans for 'loans'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.loans });
    renderAm();
    expect(screen.getByTestId("mock-loans")).toBeInTheDocument();
  });

  test("renders EMIs for 'emis'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.emis });
    renderAm();
    expect(screen.getByTestId("mock-emis")).toBeInTheDocument();
  });

  test("renders Reports for 'reports'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.reports });
    renderAm();
    expect(screen.getByTestId("mock-reports")).toBeInTheDocument();
  });

  test("renders Settings for 'settings'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.settings });
    renderAm();
    expect(screen.getByTestId("mock-settings")).toBeInTheDocument();
  });

  test("renders Projections for 'projections'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.projections });
    renderAm();
    expect(screen.getByTestId("mock-projections")).toBeInTheDocument();
  });

  test("renders Stages for 'stages'", () => {
    mockUseParams.mockReturnValue({ displayContent: DisplayContentEnum.stages });
    renderAm();
    expect(screen.getByTestId("mock-stages")).toBeInTheDocument();
  });

  test("renders nothing for unknown route", () => {
    mockUseParams.mockReturnValue({ displayContent: "unknownRoute" });
    renderAm();
    expect(screen.getByTestId("asset-management-container")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-dashboard")).not.toBeInTheDocument();
  });
});
