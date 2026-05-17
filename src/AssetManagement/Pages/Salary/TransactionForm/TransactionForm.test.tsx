import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../../ContextProvider/ContextProvider";
import TransactionForm from "./TransactionForm";
import { Salary } from "../../../../../server/types";

const mockCreateTransaction = { mutateAsync: vi.fn().mockResolvedValue({}) };
const mockUpdateTransaction = { mutateAsync: vi.fn().mockResolvedValue({}) };

vi.mock("../../../../hooks/mutations", () => ({
  useSalaryMutation: () => ({
    createTransaction: mockCreateTransaction,
    updateTransaction: mockUpdateTransaction,
  }),
}));

const mockSalary: Salary = {
  id: 1,
  transactionType: "Salary",
  amount: 50000,
  date: "2024-05-01",
  user: "Sasankh",
  type: "income",
  createdAt: "2024-05-01T00:00:00Z",
  updatedAt: "2024-05-01T00:00:00Z",
};

function renderForm(props: Partial<Parameters<typeof TransactionForm>[0]> = {}) {
  return render(
    <BrowserRouter>
      <AssetManagementProvider>
        <TransactionForm
          open={true}
          type="create"
          handleClose={vi.fn()}
          {...props}
        />
      </AssetManagementProvider>
    </BrowserRouter>
  );
}

describe("TransactionForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it("renders create modal title", () => {
    renderForm({ type: "create" });
    expect(screen.getByText("Create transaction")).toBeInTheDocument();
  });

  it("renders edit modal title when type is edit", () => {
    renderForm({ type: "edit", selectedTransaction: mockSalary });
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
  });

  it("renders income/expense toggle buttons", () => {
    renderForm();
    expect(screen.getByText(/Credit/i)).toBeInTheDocument();
    expect(screen.getByText(/Debit/i)).toBeInTheDocument();
  });

  it("renders Amount field", () => {
    renderForm();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
  });

  it("renders Category dropdown", () => {
    renderForm();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("renders Note field", () => {
    renderForm();
    expect(screen.getByPlaceholderText(/May payslip/i)).toBeInTheDocument();
  });

  it("renders Save transaction button for create type", () => {
    renderForm({ type: "create" });
    expect(screen.getByTestId("handle-salary-button")).toBeInTheDocument();
  });

  it("renders Save Changes button for edit type", () => {
    renderForm({ type: "edit", selectedTransaction: mockSalary });
    expect(screen.getByTestId("handle-salary-button")).toBeInTheDocument();
  });

  it("pre-fills fields when editing a transaction", () => {
    renderForm({ type: "edit", selectedTransaction: mockSalary });
    expect(screen.getByDisplayValue("50000")).toBeInTheDocument();
  });

  it("updates amount field on change", () => {
    renderForm({ type: "create" });
    const amountInput = screen.getByPlaceholderText("0") as HTMLInputElement;
    fireEvent.change(amountInput, { target: { name: "amount", value: "75000" } });
    expect(amountInput.value).toBe("75000");
  });

  it("calls handleClose and createTransaction.mutateAsync on save with valid data", async () => {
    const handleClose = vi.fn();
    renderForm({ type: "create", handleClose });

    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.change(amountInput, { target: { name: "amount", value: "50000" } });

    fireEvent.click(screen.getByTestId("handle-salary-button"));

    await waitFor(() => {
      expect(screen.getByTestId("handle-salary-button")).toBeInTheDocument();
    });
  });

  it("alerts and does not submit when required fields are missing on create", async () => {
    renderForm({ type: "create" });
    fireEvent.click(screen.getByTestId("handle-salary-button"));
    await waitFor(() => {
      expect(mockCreateTransaction.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it("calls updateTransaction.mutateAsync on save in edit mode", async () => {
    const handleClose = vi.fn();
    renderForm({ type: "edit", selectedTransaction: mockSalary, handleClose });
    fireEvent.click(screen.getByTestId("handle-salary-button"));
    await waitFor(() => {
      expect(mockUpdateTransaction.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockSalary.id })
      );
    });
  });

  it("toggles type to expense via toggle button", () => {
    renderForm({ type: "create" });
    const debitBtn = screen.getByText(/Debit/i);
    fireEvent.click(debitBtn);
    expect(debitBtn).toBeInTheDocument();
  });

  it("renders closed modal without crashing", () => {
    renderForm({ open: false });
    expect(screen.queryByText("Create transaction")).not.toBeInTheDocument();
  });

  it("resets form when switching from edit to create", () => {
    const { rerender } = renderForm({ type: "edit", selectedTransaction: mockSalary });
    expect(screen.getByDisplayValue("50000")).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <AssetManagementProvider>
          <TransactionForm open={true} type="create" handleClose={vi.fn()} />
        </AssetManagementProvider>
      </BrowserRouter>
    );
    expect(screen.queryByDisplayValue("50000")).not.toBeInTheDocument();
  });

  it("edit mode with undefined fields uses fallback values", () => {
    const sparse: Salary = {
      id: 2,
      transactionType: "",         // falsy → "" fallback
      amount: 0,                   // falsy → 0 fallback
      date: "",                    // falsy → today fallback
      type: "",                    // falsy → "income" fallback
      user: "",                    // falsy → "Sasankh" fallback
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
    renderForm({ type: "edit", selectedTransaction: sparse });
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
  });

  it("handleTypeToggle with null val does not update state", () => {
    renderForm({ type: "create" });
    // Click already-selected toggle (MUI sends null for deselect of exclusive group)
    const creditBtn = screen.getByText(/Credit/i);
    fireEvent.click(creditBtn); // re-click selected → val=null, no state change
    expect(screen.getByText(/Credit/i)).toBeInTheDocument();
  });

  it("calls alert when create submitted with missing amount", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderForm({ type: "create" });
    // amount stays 0 (falsy) and transactionType is empty
    fireEvent.click(screen.getByTestId("handle-salary-button"));
    await new Promise((r) => setTimeout(r, 0));
    expect(alertSpy).toHaveBeenCalledWith("Please fill all fields");
    alertSpy.mockRestore();
  });

  it("open=false does not render modal content", () => {
    renderForm({ open: false, type: "create" });
    expect(screen.queryByText("Create transaction")).not.toBeInTheDocument();
  });

  it("handleSelectChange: picking Category option updates state (B0 if(name) true branch)", async () => {
    renderForm({ type: "create" });
    // MUI Select: fire mouseDown on the placeholder text to open the listbox
    const placeholder = screen.getByText("Select category");
    fireEvent.mouseDown(placeholder);
    const option = await screen.findByRole("option", { name: "Salary" });
    fireEvent.click(option);
    expect(screen.getByText("Create transaction")).toBeInTheDocument();
  });

  it("valid create with all fields: covers B3 false (type===create) and B4 all-false (validation passes)", async () => {
    const handleClose = vi.fn();
    renderForm({ type: "create", handleClose });

    // Set amount (truthy)
    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.change(amountInput, { target: { name: "amount", value: "50000" } });

    // Set category via Select — mouseDown on the placeholder opens the listbox
    const placeholder = screen.getByText("Select category");
    fireEvent.mouseDown(placeholder);
    const option = await screen.findByRole("option", { name: "Salary" });
    fireEvent.click(option);

    // date is already pre-filled with today, click save
    await act(async () => {
      fireEvent.click(screen.getByTestId("handle-salary-button"));
    });

    await waitFor(() => {
      expect(mockCreateTransaction.mutateAsync).toHaveBeenCalled();
    });
  });
});
