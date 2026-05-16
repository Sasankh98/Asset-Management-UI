import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GoalsForm from "./GoalsModal";
import { ModalTypes } from "../../../../shared/Constants";

describe("GoalsForm", () => {
  afterEach(() => cleanup());

  const renderGoalsForm = (modalType = ModalTypes.create) =>
    render(
      <BrowserRouter>
        <GoalsForm
          open={true}
          modalType={modalType}
          handleClose={vi.fn()}
        />
      </BrowserRouter>
    );

  it("renders goal field", () => {
    renderGoalsForm();
    expect(screen.getByRole("textbox", { name: /goal/i })).toBeInTheDocument();
  });

  it("renders target amount field", () => {
    renderGoalsForm();
    expect(screen.getByRole("spinbutton", { name: /target amount/i })).toBeInTheDocument();
  });

  it("renders with edit modal type", () => {
    const goals = {
      id: 1, goal: "Car", targetAmount: 500000, savedAmount: 100000,
      targetDate: "2026-12-31", value: 100000, user: "Sasankh",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
      description: "",
    };
    render(
      <BrowserRouter>
        <GoalsForm
          open={true}
          modalType={ModalTypes.edit}
          handleClose={vi.fn()}
          goals={goals}
        />
      </BrowserRouter>
    );
    expect(screen.getByDisplayValue("Car")).toBeInTheDocument();
  });
});
