import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import SalaryComponent from "./Salary";
// Mock child components to isolate the test

describe("AssetManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <SalaryComponent />
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  test("renders Salary component", () => {
    expect(screen.getByTestId("salary-container")).toBeInTheDocument();
  });
});
