import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import EMIs from "./EMIs";
import { type Emi } from "../../../../server/types";

const makeEmi = (overrides: Partial<Emi> = {}): Emi => ({
  id: 1,
  name: "iPhone 16",
  kind: "phone",
  totalAmt: 120000,
  emiAmount: 5000,
  totalInstallments: 24,
  paidInstallments: 6,
  nextDueDay: 15,
  startDate: "2024-01-01",
  user: "Sasankh",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockUseEmisQuery = vi.fn(() => ({ data: [] as Emi[], isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useEmisQuery: () => mockUseEmisQuery(),
}));

vi.mock("../../../hooks/mutations", () => ({
  useEmisMutation: () => ({
    createEmi: { mutateAsync: vi.fn() },
    updateEmi: { mutateAsync: vi.fn() },
    deleteEmi: { mutateAsync: vi.fn() },
  }),
}));

describe("EMIs (empty state)", () => {
  beforeEach(() => { mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false }); });
  afterEach(() => cleanup());

  it("renders the page header", () => {
    render(<EMIs />);
    expect(screen.getByText("EMIs & Installments")).toBeInTheDocument();
  });

  it("renders Add EMI button", () => {
    render(<EMIs />);
    expect(screen.getByRole("button", { name: /add emi/i })).toBeInTheDocument();
  });

  it("renders Active EMIs KPI label", () => {
    render(<EMIs />);
    expect(screen.getByText("Active EMIs")).toBeInTheDocument();
  });

  it("renders Monthly Outflow KPI label", () => {
    render(<EMIs />);
    expect(screen.getByText("Monthly Outflow")).toBeInTheDocument();
  });

  it("renders Total Remaining KPI label", () => {
    render(<EMIs />);
    expect(screen.getByText("Total Remaining")).toBeInTheDocument();
  });

  it("renders Active section label", () => {
    render(<EMIs />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

describe("EMIs (with data)", () => {
  afterEach(() => cleanup());

  it("renders emi card with active emi", () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    expect(screen.getAllByText("iPhone 16").length).toBeGreaterThan(0);
  });

  it("shows payment calendar with active emis", () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    expect(screen.getAllByText(/payment calendar/i).length).toBeGreaterThan(0);
  });

  it("shows upcoming payments with active emis", () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    expect(screen.getByText("Upcoming Payments")).toBeInTheDocument();
  });

  it("renders completed section for fully paid emis", () => {
    mockUseEmisQuery.mockReturnValue({
      data: [makeEmi({ paidInstallments: 24, totalInstallments: 24 })],
      isLoading: false,
    });
    render(<EMIs />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

describe("EMIs dialog", () => {
  afterEach(() => cleanup());

  it("opens Add EMI dialog when Add EMI button clicked", () => {
    mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false });
    render(<EMIs />);
    fireEvent.click(screen.getByRole("button", { name: /add emi/i }));
    expect(screen.getByText("Add EMI / Installment")).toBeInTheDocument();
  });

  it("opens Edit EMI dialog when edit button clicked on card", () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit EMI")).toBeInTheDocument();
  });

  it("renders Cancel button in dialog", () => {
    mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false });
    render(<EMIs />);
    fireEvent.click(screen.getByRole("button", { name: /add emi/i }));
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("renders Save button in dialog", () => {
    mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false });
    render(<EMIs />);
    fireEvent.click(screen.getByRole("button", { name: /add emi/i }));
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });

  it("fills EMI dialog fields and saves (covers set, handleSave, onClose)", async () => {
    mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false });
    render(<EMIs />);
    fireEvent.click(screen.getByRole("button", { name: /add emi/i }));

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: "MacBook Pro" } });
    // MUI Select for category — use mouseDown + click pattern
    const catSelect = screen.getByLabelText(/category/i);
    fireEvent.mouseDown(catSelect);
    fireEvent.click(screen.getByRole("option", { name: /laptop/i }));
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: "180000" } });
    fireEvent.change(screen.getByLabelText(/emi amount/i), { target: { value: "15000" } });
    fireEvent.change(screen.getByLabelText(/total installments/i), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText(/paid so far/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/due day/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: "2024-01-01" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText("Add EMI / Installment")).not.toBeInTheDocument();
    });
  });

  it("clicks Cancel in dialog to close it (covers onClose)", async () => {
    mockUseEmisQuery.mockReturnValue({ data: [], isLoading: false });
    render(<EMIs />);
    fireEvent.click(screen.getByRole("button", { name: /add emi/i }));
    expect(screen.getByText("Add EMI / Installment")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText("Add EMI / Installment")).not.toBeInTheDocument();
    });
  });

  it("clicks Delete on an active EMI card (covers onDelete at active EMI, handleDelete)", async () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i });
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    expect(screen.getByTestId("emis-container")).toBeInTheDocument();
  });

  it("clicks Edit on completed EMI card (covers onEdit in completed section)", () => {
    mockUseEmisQuery.mockReturnValue({
      data: [makeEmi({ paidInstallments: 24, totalInstallments: 24 })],
      isLoading: false,
    });
    render(<EMIs />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit EMI")).toBeInTheDocument();
  });

  it("clicks Delete on completed EMI card (covers onDelete in completed section)", async () => {
    mockUseEmisQuery.mockReturnValue({
      data: [makeEmi({ paidInstallments: 24, totalInstallments: 24 })],
      isLoading: false,
    });
    render(<EMIs />);
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i });
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    expect(screen.getByTestId("emis-container")).toBeInTheDocument();
  });

  it("opens edit dialog from active card and saves (covers handleSave with editTarget)", async () => {
    mockUseEmisQuery.mockReturnValue({ data: [makeEmi()], isLoading: false });
    render(<EMIs />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit EMI")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText("Edit EMI")).not.toBeInTheDocument();
    });
  });
});
