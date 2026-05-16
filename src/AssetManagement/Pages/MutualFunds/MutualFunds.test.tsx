import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import MutualFunds from "./MutualFunds";

describe("AssetManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <MutualFunds />
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  test("renders Mutual Funds component", () => {
    expect(screen.getByTestId("mutual-funds-wrapper")).toBeInTheDocument();
  });

  test("renders Mutual Fund Portfolio heading", () => {
    expect(screen.getByText("Mutual Fund Portfolio")).toBeInTheDocument();
  });

  test("renders Add Fund button and opens modal on click", () => {
    const addBtn = screen.getByRole("button", { name: /add fund/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    // modal opens — title should appear
    expect(screen.getByText("Mutual Fund Portfolio")).toBeInTheDocument();
  });
});
