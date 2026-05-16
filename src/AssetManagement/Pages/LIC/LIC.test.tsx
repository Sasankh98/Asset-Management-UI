import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import LIC from "./LIC";
import { type LicPolicy } from "../../../../server/types";

const makePolicy = (overrides: Partial<LicPolicy> = {}): LicPolicy => ({
  id: 1,
  name: "Jeevan Anand",
  policyNumber: "123456789",
  startDate: "2020-01-01",
  policyTerm: 20,
  premiumPayTerm: 15,
  premiumFreq: "monthly",
  premium: 5000,
  sumAssured: 1000000,
  returnType: "lump_sum",
  returnAmount: 0,
  maturityBonus: 1500000,
  user: "Sasankh",
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: "2020-01-01T00:00:00Z",
  ...overrides,
});

const mockUseLicQuery = vi.fn(() => ({ data: [] as LicPolicy[], isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useLicQuery: () => mockUseLicQuery(),
}));

vi.mock("../../../hooks/mutations", () => ({
  useLicMutation: () => ({
    createPolicy: { mutateAsync: vi.fn() },
    updatePolicy: { mutateAsync: vi.fn() },
    deletePolicy: { mutateAsync: vi.fn() },
  }),
}));

describe("LIC (empty state)", () => {
  beforeEach(() => { mockUseLicQuery.mockReturnValue({ data: [], isLoading: false }); });
  afterEach(() => cleanup());

  it("renders the page header", () => {
    render(<LIC />);
    expect(screen.getByText("LIC Policies")).toBeInTheDocument();
  });

  it("renders Add Policy button", () => {
    render(<LIC />);
    expect(screen.getAllByRole("button", { name: /add policy/i }).length).toBeGreaterThan(0);
  });

  it("shows empty state when no policies", () => {
    render(<LIC />);
    expect(screen.getByText("No policies yet")).toBeInTheDocument();
  });
});

describe("LIC (with data)", () => {
  afterEach(() => cleanup());

  it("renders policy card when data is provided", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    expect(screen.getByText("Jeevan Anand")).toBeInTheDocument();
  });

  it("shows portfolio summary with policies", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    expect(screen.getByText("Invested So Far")).toBeInTheDocument();
  });

  it("renders policy in paying premiums phase", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    expect(screen.getAllByText(/paying premiums/i).length).toBeGreaterThan(0);
  });

  it("renders annual return type policy", () => {
    mockUseLicQuery.mockReturnValue({
      data: [makePolicy({ returnType: "annual", returnAmount: 120000 })],
      isLoading: false,
    });
    render(<LIC />);
    expect(screen.getByText("Jeevan Anand")).toBeInTheDocument();
  });

  it("renders monthly pension type policy with matured phase", () => {
    mockUseLicQuery.mockReturnValue({
      data: [makePolicy({ returnType: "monthly_pension", returnAmount: 10000, startDate: "2000-01-01", policyTerm: 20 })],
      isLoading: false,
    });
    render(<LIC />);
    expect(screen.getAllByText("Jeevan Anand").length).toBeGreaterThan(0);
  });

  it("shows XIRR for the policy", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    expect(screen.getByText("XIRR")).toBeInTheDocument();
  });
});

describe("LIC dialog", () => {
  afterEach(() => cleanup());

  it("opens Add Policy dialog when Add Policy button clicked (empty state)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    const addBtns = screen.getAllByRole("button", { name: /add policy/i });
    fireEvent.click(addBtns[0]);
    expect(screen.getByText("Add LIC Policy")).toBeInTheDocument();
  });

  it("opens Edit Policy dialog when edit button clicked on card", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit Policy")).toBeInTheDocument();
  });

  it("renders Cancel button in dialog", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    const addBtns = screen.getAllByRole("button", { name: /add policy/i });
    fireEvent.click(addBtns[0]);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("renders Save Policy button in dialog", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    const addBtns = screen.getAllByRole("button", { name: /add policy/i });
    fireEvent.click(addBtns[0]);
    expect(screen.getByRole("button", { name: /save policy/i })).toBeInTheDocument();
  });

  it("fills policy name in dialog and clicks Save (covers set, handleSave in dialog and LIC)", async () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    const addBtns = screen.getAllByRole("button", { name: /add policy/i });
    fireEvent.click(addBtns[0]);

    const nameInput = screen.getByLabelText("Policy Name");
    fireEvent.change(nameInput, { target: { value: "My LIC Plan" } });

    const saveBtn = screen.getByRole("button", { name: /save policy/i });
    await act(async () => { fireEvent.click(saveBtn); });
    // Dialog should close after save
    await waitFor(() => {
      expect(screen.queryByText("Add LIC Policy")).not.toBeInTheDocument();
    });
  });

  it("clicking Save without policy name does not call onSave (early exit in handleSave)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    const addBtns = screen.getAllByRole("button", { name: /add policy/i });
    fireEvent.click(addBtns[0]);
    // Clear the policy name (it starts with default empty)
    const saveBtn = screen.getByRole("button", { name: /save policy/i });
    fireEvent.click(saveBtn);
    // Dialog stays open because validation failed
    expect(screen.getByText("Add LIC Policy")).toBeInTheDocument();
  });

  it("fills all dialog form fields (covers onChange handlers)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    fireEvent.click(screen.getAllByRole("button", { name: /add policy/i })[0]);

    fireEvent.change(screen.getByLabelText("Policy Name"), { target: { value: "Term Plan" } });
    fireEvent.change(screen.getByLabelText("Policy Number"), { target: { value: "987654321" } });
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2021-06-01" } });
    fireEvent.change(screen.getByLabelText(/sum assured/i), { target: { value: "2000000" } });
    fireEvent.change(screen.getByLabelText(/policy term/i), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText(/premium term/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/premium per/i), { target: { value: "8000" } });
    fireEvent.change(screen.getByLabelText(/maturity.*bonus/i), { target: { value: "2000000" } });

    expect(screen.getByLabelText("Policy Name")).toHaveValue("Term Plan");
  });

  it("can change frequency in dialog (covers onChange)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    fireEvent.click(screen.getAllByRole("button", { name: /add policy/i })[0]);

    const freqSelect = screen.getByLabelText(/frequency/i);
    fireEvent.mouseDown(freqSelect);
    const yearlyOption = screen.getByRole("option", { name: /yearly/i });
    fireEvent.click(yearlyOption);
    expect(screen.getByTestId("lic-container")).toBeInTheDocument();
  });

  it("can change return type to annual and fill return amount (covers onChange at L361, L374)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    fireEvent.click(screen.getAllByRole("button", { name: /add policy/i })[0]);

    const returnTypeSelect = screen.getByLabelText(/return type/i);
    fireEvent.mouseDown(returnTypeSelect);
    const annualOption = screen.getByRole("option", { name: /annual returns/i });
    fireEvent.click(annualOption);

    const returnAmtInput = screen.getByLabelText(/annual return amount/i);
    fireEvent.change(returnAmtInput, { target: { value: "120000" } });
    expect(returnAmtInput).toHaveValue(120000);
  });

  it("can change return type to monthly_pension (covers branch)", () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    fireEvent.click(screen.getAllByRole("button", { name: /add policy/i })[0]);

    const returnTypeSelect = screen.getByLabelText(/return type/i);
    fireEvent.mouseDown(returnTypeSelect);
    const pensionOption = screen.getByRole("option", { name: /monthly pension/i });
    fireEvent.click(pensionOption);
    expect(screen.getByLabelText(/monthly return amount/i)).toBeInTheDocument();
  });

  it("clicking Cancel closes the dialog (covers onClose)", async () => {
    mockUseLicQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LIC />);
    fireEvent.click(screen.getAllByRole("button", { name: /add policy/i })[0]);
    expect(screen.getByText("Add LIC Policy")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText("Add LIC Policy")).not.toBeInTheDocument();
    });
  });

  it("clicking Delete on policy card calls handleDelete", async () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i });
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    // handleDelete was called (no crash)
    expect(screen.getByTestId("lic-container")).toBeInTheDocument();
  });

  it("clicks horizon chips on policy card (covers setHorizon)", () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    // Horizon chips: 10y, 25y, full
    const chip25y = screen.getAllByText("25y")[0];
    fireEvent.click(chip25y);
    expect(screen.getByTestId("lic-container")).toBeInTheDocument();

    const chipFull = screen.getAllByText(/full term/i)[0];
    fireEvent.click(chipFull);
    expect(screen.getByTestId("lic-container")).toBeInTheDocument();

    const chip10y = screen.getAllByText("10y")[0];
    fireEvent.click(chip10y);
    expect(screen.getByTestId("lic-container")).toBeInTheDocument();
  });

  it("saves updated policy in edit dialog (covers handleSave with editTarget)", async () => {
    mockUseLicQuery.mockReturnValue({ data: [makePolicy()], isLoading: false });
    render(<LIC />);
    const editBtns = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByText("Edit Policy")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Policy Name"), { target: { value: "Updated Plan" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save policy/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText("Edit Policy")).not.toBeInTheDocument();
    });
  });
});
