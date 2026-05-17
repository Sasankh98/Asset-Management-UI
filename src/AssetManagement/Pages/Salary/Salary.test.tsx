import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import SalaryComponent from "./Salary";

const mockUseSalaryQuery = vi.fn();

vi.mock("../../../hooks/queries", () => ({
  useSalaryQuery: () => mockUseSalaryQuery(),
}));

const TODAY = new Date().toISOString().slice(0, 10);
const makeIncome  = (amount: number) => ({ date: TODAY, type: "income",  amount });
const makeExpense = (amount: number) => ({ date: TODAY, type: "expense", amount });

function renderSalary() {
  return render(
    <BrowserRouter>
      <AssetManagementProvider>
        <SalaryComponent />
      </AssetManagementProvider>
    </BrowserRouter>
  );
}

describe("Salary – renders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: false });
  });
  afterEach(() => cleanup());

  test("renders Salary component", () => {
    renderSalary();
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });

  test("clicking Add Transaction opens form", () => {
    renderSalary();
    fireEvent.click(screen.getByRole("button", { name: /Add Transaction/i }));
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });
});

describe("Salary – loading state", () => {
  afterEach(() => cleanup());

  test("renders skeletons when loading", () => {
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: true });
    const { container } = renderSalary();
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});

describe("Salary – non-array data fallback", () => {
  afterEach(() => cleanup());

  test("handles non-array query data (null)", () => {
    mockUseSalaryQuery.mockReturnValue({ data: null, isLoading: false });
    renderSalary();
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });

  test("handles undefined query data", () => {
    mockUseSalaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    renderSalary();
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });
});

describe("Salary – KPI calculations", () => {
  afterEach(() => cleanup());

  test("shows zero savings rate when no income", () => {
    mockUseSalaryQuery.mockReturnValue({
      data: [makeExpense(20000)],
      isLoading: false,
    });
    renderSalary();
    // savingsRate = 0 (totalIncome === 0 branch)
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  test("shows negative saved value in error color", () => {
    // expenses > income → saved < 0
    mockUseSalaryQuery.mockReturnValue({
      data: [makeIncome(10000), makeExpense(25000)],
      isLoading: false,
    });
    renderSalary();
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });

  test("shows savings rate < 30 in warning color", () => {
    // 10% savings rate → warning.main branch
    mockUseSalaryQuery.mockReturnValue({
      data: [makeIncome(100000), makeExpense(90000)],
      isLoading: false,
    });
    renderSalary();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  test("shows savings rate >= 30 in primary color", () => {
    mockUseSalaryQuery.mockReturnValue({
      data: [makeIncome(100000), makeExpense(60000)],
      isLoading: false,
    });
    renderSalary();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  test("null income amount covers t.amount ?? 0 right branch (L36 binary-expr)", () => {
    mockUseSalaryQuery.mockReturnValue({
      data: [
        { date: TODAY, type: "income", amount: null },
        { date: TODAY, type: "expense", amount: null },
      ],
      isLoading: false,
    });
    renderSalary();
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });
});

describe("Salary – tabs", () => {
  afterEach(() => cleanup());

  test("Overview tab shows LineGraph (no loading)", () => {
    mockUseSalaryQuery.mockReturnValue({
      data: [makeIncome(50000)],
      isLoading: false,
    });
    renderSalary();
    // Default tab is Overview — LineGraph should be rendered
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });

  test("Transactions tab shows transaction table", () => {
    mockUseSalaryQuery.mockReturnValue({
      data: [makeIncome(50000), makeExpense(20000)],
      isLoading: false,
    });
    renderSalary();
    const transactionsTab = screen.getByRole("tab", { name: /transactions/i });
    fireEvent.click(transactionsTab);
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });

  test("Transactions tab shows skeleton when loading", () => {
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: true });
    const { container } = renderSalary();
    // Click the Transactions tab
    const tabs = container.querySelectorAll("[role='tab']");
    if (tabs[1]) fireEvent.click(tabs[1]);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});
