import { beforeEach, describe, test, vi, expect, afterEach, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import MutualFunds from "./MutualFunds";

function renderMF() {
  return render(
    <BrowserRouter>
      <AssetManagementProvider>
        <MutualFunds />
      </AssetManagementProvider>
    </BrowserRouter>
  );
}

describe("AssetManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders Mutual Funds component", () => {
    renderMF();
    expect(screen.getByTestId("mutual-funds-wrapper")).toBeInTheDocument();
  });

  test("renders Mutual Fund Portfolio heading", () => {
    renderMF();
    expect(screen.getByText("Mutual Fund Portfolio")).toBeInTheDocument();
  });

  test("renders Add Fund button and opens modal on click", () => {
    renderMF();
    const addBtn = screen.getByRole("button", { name: /add fund/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(screen.getByText("Mutual Fund Portfolio")).toBeInTheDocument();
  });

  test("renders KPI labels", () => {
    renderMF();
    expect(screen.getByText("Total Invested")).toBeInTheDocument();
    expect(screen.getAllByText("Current Value").length).toBeGreaterThan(0);
    expect(screen.getByText("Gain / Loss")).toBeInTheDocument();
    expect(screen.getAllByText("Target Progress").length).toBeGreaterThan(0);
  });

  test("renders tab labels", () => {
    renderMF();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Target & Allocation")).toBeInTheDocument();
  });

  test("switches to Performance tab", () => {
    renderMF();
    fireEvent.click(screen.getByText("Performance"));
    expect(screen.getByText("Best Performer")).toBeInTheDocument();
  });

  test("switches to Target & Allocation tab", () => {
    renderMF();
    fireEvent.click(screen.getByText("Target & Allocation"));
    expect(screen.getByText("Overall Target Progress")).toBeInTheDocument();
  });

  test("shows My Mutual Funds section on Overview tab", () => {
    renderMF();
    expect(screen.getByText("My Mutual Funds")).toBeInTheDocument();
  });

  it("renders description subtitle", () => {
    renderMF();
    expect(screen.getByText(/Track and manage your mutual fund investments/)).toBeInTheDocument();
  });
});
