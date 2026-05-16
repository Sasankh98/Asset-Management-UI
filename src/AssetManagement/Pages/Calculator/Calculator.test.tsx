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
    expect(screen.getByText(/Add Alternative/i)).toBeInTheDocument();
  });

  it("clicking Add Alternative adds a new card with Custom Option text", () => {
    const addBtn = screen.getByText(/Add Alternative/i);
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

  it("switches to Pay in Full mode hiding EMI sliders", () => {
    const payFullChip = screen.getByText("Pay in Full");
    fireEvent.click(payFullChip);
    // Section A's EMI-specific "Interest: X% p.a." disappears when switching to Pay in Full
    expect(screen.queryByText(/interest:/i)).not.toBeInTheDocument();
  });

  it("switching back to EMI mode shows tenure sliders", () => {
    // Start in EMI mode, switch to full, then back to EMI
    fireEvent.click(screen.getByText("Pay in Full"));
    // Now click EMI chip (the second Chip in Section A financing)
    const emiChips = screen.getAllByText("EMI");
    fireEvent.click(emiChips[0]);
    expect(screen.getAllByText(/tenure:/i).length).toBeGreaterThan(0);
  });

  it("can change the model name in Section A", () => {
    const modelInput = screen.getByLabelText("Model");
    fireEvent.change(modelInput, { target: { value: "Honda Activa 6G" } });
    expect(modelInput).toHaveValue("Honda Activa 6G");
  });

  it("can change the sticker price in Section A", () => {
    const stickerInput = screen.getByLabelText("Sticker price (₹)");
    fireEvent.change(stickerInput, { target: { value: "85000" } });
    expect(stickerInput).toHaveValue(85000);
  });

  it("can update a running cost amount in Section A", () => {
    const spinButtons = screen.getAllByRole("spinbutton");
    // first spinbutton in the first RunningCostEditor is the petrol cost
    fireEvent.change(spinButtons[0], { target: { value: "3000" } });
    expect(spinButtons[0]).toHaveValue(3000);
  });

  it("clicking Add cost adds a row to running costs in Section A", () => {
    const addCostBtns = screen.getAllByText(/add cost/i);
    const countBefore = screen.getAllByRole("spinbutton").length;
    fireEvent.click(addCostBtns[0]);
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(countBefore);
  });

  it("switches category in Section A to Car updates model to Maruti Brezza", () => {
    const carChips = screen.getAllByText("Car");
    fireEvent.click(carChips[0]); // first is Section A
    expect(screen.getByLabelText("Model")).toHaveValue("Maruti Brezza");
  });

  it("switches category in Section B without crashing", () => {
    const carChips = screen.getAllByText("Car");
    fireEvent.click(carChips[1]); // second is Section B
    expect(screen.getByTestId("calculator-container")).toBeInTheDocument();
  });

  it("can edit an alternative name in Section C", () => {
    const altNameInputs = screen.getAllByDisplayValue(/Royal Enfield/i);
    fireEvent.change(altNameInputs[0], { target: { value: "Custom Bike" } });
    expect(screen.getAllByDisplayValue("Custom Bike").length).toBeGreaterThan(0);
  });

  it("can edit the sticker price of an alternative in Section C", () => {
    const altStickerInputs = screen.getAllByLabelText(/sticker \(₹\)/i);
    fireEvent.change(altStickerInputs[0], { target: { value: "95000" } });
    expect(altStickerInputs[0]).toHaveValue(95000);
  });

  it("can cycle the verdict chip on an alternative in Section C", () => {
    const verdictChips = screen.getAllByText(/MAYBE|BEST|GOOD/);
    const initialText = verdictChips[0].textContent;
    fireEvent.click(verdictChips[0]);
    // After cycling, the first card's verdict changes
    expect(screen.getByTestId("calculator-container")).toBeInTheDocument();
    // Verdict should have changed from initial
    const updatedChips = screen.getAllByText(/MAYBE|BEST|GOOD/);
    expect(updatedChips[0].textContent).not.toEqual(initialText);
  });

  it("can delete an alternative in Section C", () => {
    const deleteButtons = screen.getAllByTitle("Remove");
    const countBefore = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryAllByTitle("Remove").length).toBeLessThan(countBefore);
  });

  it("can toggle expand running costs on an alternative in Section C", () => {
    const editBtns = screen.getAllByText(/▼ Edit/);
    fireEvent.click(editBtns[0]);
    expect(screen.getAllByText(/▲ Hide/).length).toBeGreaterThan(0);
  });

  it("can edit alternative sub-title in Section C", () => {
    // sub-title is the second standard variant TextField per card
    const subInputs = screen.getAllByDisplayValue(/EMI ~|No asset|Subscription/i);
    if (subInputs.length > 0) {
      fireEvent.change(subInputs[0], { target: { value: "New subtitle" } });
      expect(screen.getAllByDisplayValue("New subtitle").length).toBeGreaterThan(0);
    }
  });
});
