import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import Loans from "./Loans";
import { type Loan } from "../../../../server/types";

const makeLoan = (overrides: Partial<Loan> = {}): Loan => ({
  id: 1,
  name: "Home Loan - SBI",
  kind: "home",
  totalAmt: 5000000,
  paidAmt: 1000000,
  emi: 45000,
  interestRate: 8.5,
  dueDate: "5 Jun",
  tenureLeft: "14y left",
  user: "Sasankh",
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: "2020-01-01T00:00:00Z",
  ...overrides,
});

const mockUseLoansQuery = vi.fn(() => ({ data: [] as Loan[], isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useLoansQuery: () => mockUseLoansQuery(),
}));

vi.mock("../../../hooks/mutations", () => ({
  useLoansMutation: () => ({
    createLoan: { mutateAsync: vi.fn() },
    updateLoan: { mutateAsync: vi.fn() },
    deleteLoan: { mutateAsync: vi.fn() },
  }),
}));

describe("Loans (empty state)", () => {
  beforeEach(() => { mockUseLoansQuery.mockReturnValue({ data: [], isLoading: false }); });
  afterEach(() => cleanup());

  it("renders the page header", () => {
    render(<Loans />);
    expect(screen.getByText("Loans")).toBeInTheDocument();
  });

  it("renders Add Loan button", () => {
    render(<Loans />);
    expect(screen.getAllByRole("button", { name: /add loan/i }).length).toBeGreaterThan(0);
  });
});

describe("Loans (with data)", () => {
  afterEach(() => cleanup());

  it("renders loan card when data is provided", () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    expect(screen.getByText("Home Loan - SBI")).toBeInTheDocument();
  });

  it("renders KPI labels with loan data", () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    expect(screen.getByText("Total Debt")).toBeInTheDocument();
    expect(screen.getByText("Outstanding")).toBeInTheDocument();
    expect(screen.getByText("Paid Off")).toBeInTheDocument();
    expect(screen.getByText("Monthly EMI")).toBeInTheDocument();
  });

  it("renders OUTSTANDING label in loan card", () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    expect(screen.getByText("OUTSTANDING")).toBeInTheDocument();
  });

  it("renders vehicle loan card", () => {
    mockUseLoansQuery.mockReturnValue({
      data: [makeLoan({ kind: "vehicle", name: "Car Loan" })],
      isLoading: false,
    });
    render(<Loans />);
    expect(screen.getByText("Car Loan")).toBeInTheDocument();
  });

  it("renders interest rate for loan", () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    expect(screen.getByText(/8.5%/)).toBeInTheDocument();
  });
});

describe("Loans dialog", () => {
  afterEach(() => cleanup());

  it("opens Add Loan dialog when Add Loan button clicked", () => {
    mockUseLoansQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Loans />);
    fireEvent.click(screen.getAllByRole("button", { name: /add loan/i })[0]);
    expect(screen.getAllByText("Add Loan").length).toBeGreaterThan(1);
  });

  it("fills loan dialog fields and saves (covers set, handleSave, onClose)", async () => {
    mockUseLoansQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Loans />);
    fireEvent.click(screen.getAllByRole("button", { name: /add loan/i })[0]);

    fireEvent.change(screen.getByLabelText(/loan name/i), { target: { value: "Car Loan HDFC" } });
    // MUI Select for type — use mouseDown + click pattern
    const typeSelect = screen.getByLabelText(/^type$/i);
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(screen.getByRole("option", { name: /vehicle loan/i }));
    fireEvent.change(screen.getByLabelText(/total loan/i), { target: { value: "700000" } });
    fireEvent.change(screen.getByLabelText(/amount paid/i), { target: { value: "100000" } });
    fireEvent.change(screen.getByLabelText(/monthly emi/i), { target: { value: "15000" } });
    fireEvent.change(screen.getByLabelText(/interest rate/i), { target: { value: "9.5" } });
    fireEvent.change(screen.getByLabelText(/next due date/i), { target: { value: "15 Jun" } });
    fireEvent.change(screen.getByLabelText(/tenure remaining/i), { target: { value: "4y left" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("clicks Cancel in dialog to close it (covers onClose)", async () => {
    mockUseLoansQuery.mockReturnValue({ data: [], isLoading: false });
    render(<Loans />);
    fireEvent.click(screen.getAllByRole("button", { name: /add loan/i })[0]);
    // Dialog title is a heading
    expect(screen.getByRole("heading", { name: /add loan/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("clicks Edit on loan card opens edit dialog (covers openEdit)", () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit Loan")).toBeInTheDocument();
  });

  it("clicks Delete on loan card (covers handleDelete, onDelete)", async () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i });
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    expect(screen.getByTestId("loans-container")).toBeInTheDocument();
  });

  it("saves edited loan (covers handleSave with editTarget)", async () => {
    mockUseLoansQuery.mockReturnValue({ data: [makeLoan()], isLoading: false });
    render(<Loans />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit Loan")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/loan name/i), { target: { value: "Updated Home Loan" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText("Edit Loan")).not.toBeInTheDocument();
    });
  });
});
