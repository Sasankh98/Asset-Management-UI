import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TransactionTable from "./TransactionTable";
import { Salary } from "../../../../../server/types";

const makeSalary = (overrides: Partial<Salary> = {}): Salary => ({
  id: 1,
  transactionType: "Salary",
  amount: 50000,
  date: "2024-05-01T00:00:00Z",
  user: "Sasankh",
  type: "income",
  createdAt: "2024-05-01T00:00:00Z",
  updatedAt: "2024-05-01T00:00:00Z",
  ...overrides,
});

function renderTable(
  data: Salary[],
  setFormOpen = vi.fn(),
  setType = vi.fn(),
  setSelected = vi.fn()
) {
  return render(
    <BrowserRouter>
      <TransactionTable
        transactionData={data}
        setTransactionFormOpen={setFormOpen}
        setType={setType}
        setSelectedTransaction={setSelected}
      />
    </BrowserRouter>
  );
}

describe("TransactionTable", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it("renders column headers", () => {
    renderTable([]);
    expect(screen.getByText("Transaction Type")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Income/Expense")).toBeInTheDocument();
  });

  it("renders a transaction row", () => {
    renderTable([makeSalary({ transactionType: "Salary", amount: 50000 })]);
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("formats amount as currency", () => {
    renderTable([makeSalary({ amount: 50000 })]);
    expect(screen.getByText(/50,000|50000/)).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    renderTable([makeSalary({ date: "2024-05-01T00:00:00Z" })]);
    expect(screen.getByText(/May|05/)).toBeInTheDocument();
  });

  it("renders edit button for each row", () => {
    renderTable([makeSalary(), makeSalary({ id: 2, transactionType: "Rent" })]);
    const editBtns = screen.getAllByLabelText("edit");
    expect(editBtns.length).toBe(2);
  });

  it("calls setType, setTransactionFormOpen, and setSelectedTransaction on edit click", () => {
    const setFormOpen = vi.fn();
    const setType = vi.fn();
    const setSelected = vi.fn();
    const tx = makeSalary({ id: 42, transactionType: "Bonus" });
    renderTable([tx], setFormOpen, setType, setSelected);

    const editBtn = screen.getByLabelText("edit");
    fireEvent.click(editBtn);

    expect(setType).toHaveBeenCalledWith("edit");
    expect(setFormOpen).toHaveBeenCalledWith(true);
    expect(setSelected).toHaveBeenCalledWith(tx);
  });

  it("renders multiple rows", () => {
    const data = [
      makeSalary({ id: 1, transactionType: "Salary" }),
      makeSalary({ id: 2, transactionType: "Freelance" }),
      makeSalary({ id: 3, transactionType: "Rent", type: "expense" }),
    ];
    renderTable(data);
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
  });

  it("renders empty table without crashing", () => {
    renderTable([]);
    expect(screen.getByText("Transaction Type")).toBeInTheDocument();
  });

  it("updates rows when transactionData changes", () => {
    const { rerender } = renderTable([makeSalary({ transactionType: "Old" })]);
    expect(screen.getByText("Old")).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <TransactionTable
          transactionData={[makeSalary({ transactionType: "Updated" })]}
          setTransactionFormOpen={vi.fn()}
          setType={vi.fn()}
          setSelectedTransaction={vi.fn()}
        />
      </BrowserRouter>
    );
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});
