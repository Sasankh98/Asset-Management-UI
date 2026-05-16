import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GoalsActions from "./GoalsActions";
import { ModalTypes } from "../../../shared/Constants";

describe("GoalsActions", () => {
  const handleClose = vi.fn();
  const handleGoals = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders "Create Goal" button in create mode', () => {
    render(
      <GoalsActions
        modalType={ModalTypes.create}
        handleClose={handleClose}
        handleGoals={handleGoals}
      />
    );
    expect(screen.getByText("Create Goal")).toBeInTheDocument();
  });

  it('renders "Update Goal" button in edit mode', () => {
    render(
      <GoalsActions
        modalType={ModalTypes.edit}
        handleClose={handleClose}
        handleGoals={handleGoals}
      />
    );
    expect(screen.getByText("Update Goal")).toBeInTheDocument();
  });

  it('renders "Processing..." when isLoading is true', () => {
    render(
      <GoalsActions
        modalType={ModalTypes.create}
        handleClose={handleClose}
        handleGoals={handleGoals}
        isLoading={true}
      />
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("disables the submit button when isLoading is true", () => {
    render(
      <GoalsActions
        modalType={ModalTypes.create}
        handleClose={handleClose}
        handleGoals={handleGoals}
        isLoading={true}
      />
    );
    expect(screen.getByTestId("handle-goals-button")).toBeDisabled();
  });

  it("calls handleClose when Cancel is clicked", () => {
    render(
      <GoalsActions
        modalType={ModalTypes.create}
        handleClose={handleClose}
        handleGoals={handleGoals}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls handleGoals when the submit button is clicked", () => {
    render(
      <GoalsActions
        modalType={ModalTypes.create}
        handleClose={handleClose}
        handleGoals={handleGoals}
      />
    );
    fireEvent.click(screen.getByTestId("handle-goals-button"));
    expect(handleGoals).toHaveBeenCalledTimes(1);
  });
});
