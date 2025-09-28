import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import MutualFunds from "./MutualFunds";
// Mock child components to isolate the test

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
});
