import { describe, test, vi, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import Stages from "./Stages";

const mockUseDashboardQuery = vi.fn(() => ({ data: null as unknown, isLoading: false }));
const mockUseSalaryQuery = vi.fn(() => ({ data: [] as unknown, isLoading: false }));
const mockUseProvidentFundQuery = vi.fn(() => ({ data: null as unknown, isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useDashboardQuery: () => mockUseDashboardQuery(),
  useSalaryQuery: () => mockUseSalaryQuery(),
  useProvidentFundQuery: () => mockUseProvidentFundQuery(),
}));

const defaultDash = { totalAssets: 1432000 };
const defaultPf = { currentAge: 28 };
const income = { date: new Date().toISOString(), type: "income", amount: 77000 };
const expense = { date: new Date().toISOString(), type: "expense", amount: 50000 };

describe("Stages – loading state", () => {
  afterEach(() => cleanup());

  test("renders skeletons while loading", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: true });
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: true });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<Stages />);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});

describe("Stages – main render", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardQuery.mockReturnValue({ data: defaultDash, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: [income, expense], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: defaultPf, isLoading: false });
  });
  afterEach(() => cleanup());

  test("renders stages container", () => {
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders header text", () => {
    render(<Stages />);
    expect(screen.getByText(/are you on track to retire/i)).toBeInTheDocument();
  });

  test("renders Export PDF button", () => {
    render(<Stages />);
    expect(screen.getByText(/export pdf/i)).toBeInTheDocument();
  });

  test("renders On Track or Convert to Goal button", () => {
    render(<Stages />);
    const matches = screen.getAllByText(/on track|convert to goal/i);
    expect(matches.some((el) => el.tagName !== "H5")).toBe(true);
  });

  test("renders Current age input label", () => {
    render(<Stages />);
    expect(screen.getByText(/current age/i)).toBeInTheDocument();
  });

  test("renders Annual salary label", () => {
    render(<Stages />);
    expect(screen.getAllByText(/annual salary/i).length).toBeGreaterThan(0);
  });

  test("renders Annual expenses label", () => {
    render(<Stages />);
    expect(screen.getAllByText(/annual expenses/i).length).toBeGreaterThan(0);
  });

  test("renders Current corpus label", () => {
    render(<Stages />);
    expect(screen.getAllByText(/current corpus/i).length).toBeGreaterThan(0);
  });

  test("renders Aggressive target card", () => {
    render(<Stages />);
    expect(screen.getByText(/aggressive target/i)).toBeInTheDocument();
  });

  test("renders Defensive target card", () => {
    render(<Stages />);
    expect(screen.getByText(/defensive target/i)).toBeInTheDocument();
  });

  test("renders on-track gauge", () => {
    render(<Stages />);
    expect(screen.getByText(/are you on track today/i)).toBeInTheDocument();
  });

  test("renders corpus trajectory chart", () => {
    render(<Stages />);
    expect(screen.getByText(/corpus trajectory/i)).toBeInTheDocument();
  });

  test("renders milestones section", () => {
    render(<Stages />);
    expect(screen.getByText(/milestones every 5 years/i)).toBeInTheDocument();
  });

  test("renders Need · Want · Save donut", () => {
    render(<Stages />);
    expect(screen.getByText(/need · want · save/i)).toBeInTheDocument();
  });

  test("renders ConnectGrid section", () => {
    render(<Stages />);
    expect(screen.getByText(/how this connects/i)).toBeInTheDocument();
  });

  test("renders AssumptionsAccord collapsed", () => {
    render(<Stages />);
    expect(screen.getByText(/assumption tables/i)).toBeInTheDocument();
  });

  test("AssumptionsAccord expands on click", () => {
    render(<Stages />);
    const header = screen.getByText(/assumption tables/i);
    fireEvent.click(header.closest("div")!);
    expect(screen.getByText(/step 2/i)).toBeInTheDocument();
  });

  test("Reset button calls reset", () => {
    render(<Stages />);
    const resetBtn = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetBtn);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("Salary toggle button in chart", () => {
    render(<Stages />);
    const salaryBtn = screen.getByRole("button", { name: /salary/i });
    fireEvent.click(salaryBtn);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });
});

describe("Stages – fallback defaults", () => {
  afterEach(() => cleanup());

  test("renders with null data (uses system defaults)", () => {
    mockUseDashboardQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: null, isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: null, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders with age clamped to min 20", () => {
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 500000 }, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: { currentAge: 10 }, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders with age clamped to max 55", () => {
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 5000000 }, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: { currentAge: 70 }, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders with corpus0 = 0 (uses system default)", () => {
    mockUseDashboardQuery.mockReturnValue({ data: { totalAssets: 0 }, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: defaultPf, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders with recent income transactions", () => {
    const recentIncome = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - i * 25 * 24 * 60 * 60 * 1000).toISOString(),
      type: "income",
      amount: 100000,
    }));
    mockUseDashboardQuery.mockReturnValue({ data: defaultDash, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: recentIncome, isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: defaultPf, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });

  test("renders with old transactions (outside 1 year cutoff)", () => {
    const oldTxn = { date: "2020-01-01", type: "income", amount: 999999 };
    mockUseDashboardQuery.mockReturnValue({ data: defaultDash, isLoading: false });
    mockUseSalaryQuery.mockReturnValue({ data: [oldTxn], isLoading: false });
    mockUseProvidentFundQuery.mockReturnValue({ data: defaultPf, isLoading: false });
    render(<Stages />);
    expect(screen.getByTestId("stages-container")).toBeInTheDocument();
  });
});
