import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Liabilities from "./Liabilities";

describe("Liabilities", () => {
  afterEach(() => cleanup());

  it("renders the container", () => {
    render(<Liabilities />);
    expect(screen.getByTestId("liabilities-container")).toBeInTheDocument();
  });

  it("renders page heading", () => {
    render(<Liabilities />);
    expect(screen.getByText("Loans & EMIs")).toBeInTheDocument();
  });

  it("renders KPI: Total Debt", () => {
    render(<Liabilities />);
    expect(screen.getByText("Total Debt")).toBeInTheDocument();
    expect(screen.getByText("₹38.4L")).toBeInTheDocument();
  });

  it("renders KPI: Paid Off", () => {
    render(<Liabilities />);
    expect(screen.getByText("Paid Off")).toBeInTheDocument();
    expect(screen.getByText("₹12.1L")).toBeInTheDocument();
  });

  it("renders KPI: Monthly EMI", () => {
    render(<Liabilities />);
    expect(screen.getByText("Monthly EMI")).toBeInTheDocument();
    expect(screen.getByText("₹57.9k")).toBeInTheDocument();
  });

  it("renders all four loan cards", () => {
    render(<Liabilities />);
    expect(screen.getByText("Home Loan · HDFC")).toBeInTheDocument();
    expect(screen.getByText("Vehicle · SUV")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 EMI")).toBeInTheDocument();
    expect(screen.getByText("Personal Loan")).toBeInTheDocument();
  });

  it("renders tenure information for each loan", () => {
    render(<Liabilities />);
    expect(screen.getByText("14y left")).toBeInTheDocument();
    expect(screen.getByText("2y 3m left")).toBeInTheDocument();
    expect(screen.getByText("6m left")).toBeInTheDocument();
    expect(screen.getAllByText("5m left").length).toBeGreaterThan(0);
  });

  it("renders Prepay chips", () => {
    render(<Liabilities />);
    const chips = screen.getAllByText("Prepay");
    expect(chips.length).toBe(4);
  });

  it("renders Add Loan button", () => {
    render(<Liabilities />);
    expect(screen.getByRole("button", { name: /add loan/i })).toBeInTheDocument();
  });

  it("renders progress bars for each loan", () => {
    render(<Liabilities />);
    const progressBars = document.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBe(4);
  });

  it("renders paid/total amounts for Home Loan", () => {
    render(<Liabilities />);
    expect(screen.getByText("₹8.4L paid")).toBeInTheDocument();
    expect(screen.getByText("₹32L total")).toBeInTheDocument();
  });
});
