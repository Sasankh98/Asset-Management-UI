import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import Goals from "./Goals";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import { DialogProvider } from "../../ContextProvider/DialogContextProvider";

describe("Goals Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <DialogProvider>
            <Goals />
          </DialogProvider>
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders goals component", async () => {
    expect(screen.getByTestId("goals-container")).toBeInTheDocument();
  });

  it("clicking on add goal button renders goal form", async () => {
    const button = await screen.findByText(/Add Goal/);
    fireEvent.click(button);

    expect(screen.findAllByText(/Create New Goal/));
  });
});
