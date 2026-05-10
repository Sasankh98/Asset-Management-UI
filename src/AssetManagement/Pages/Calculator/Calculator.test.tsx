import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";
import Calculator from "./Calculator";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
}));

describe("Calculator Component", () => {
  beforeEach(() => {
    render(<Calculator />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the calculator container", () => {
    expect(screen.getByTestId("calculator-container")).toBeInTheDocument();
  });

  it("renders Section A heading", () => {
    expect(screen.getByText(/Section A/i)).toBeInTheDocument();
  });

  it("renders Section B heading", () => {
    expect(screen.getByText(/Section B/i)).toBeInTheDocument();
  });

  it("renders Section C heading", () => {
    expect(screen.getByText(/Section C/i)).toBeInTheDocument();
  });

  it("Section C shows Add Alternative button", () => {
    expect(screen.getByRole("button", { name: /Add Alternative/i })).toBeInTheDocument();
  });

  it("clicking Add Alternative adds a new card with Custom Option text", () => {
    const addBtn = screen.getByRole("button", { name: /Add Alternative/i });
    fireEvent.click(addBtn);
    const customOptions = screen.getAllByDisplayValue("Custom Option");
    expect(customOptions.length).toBeGreaterThan(0);
  });

  it("switching category in Section C resets alternatives", () => {
    // Section C starts with bike alternatives; switch to Car
    // getAllByText returns chips for all three sections (A, B, C)
    const carChips = screen.getAllByText("Car");
    // Click the last one which belongs to Section C
    fireEvent.click(carChips[carChips.length - 1]);
    // After switching to Car, "Maruti Brezza" should appear as an alternative name
    expect(screen.getAllByDisplayValue("Maruti Brezza").length).toBeGreaterThan(0);
  });
});
