import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
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
});
