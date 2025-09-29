import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import Stocks from "./Stocks";
// Mock child components to isolate the test

describe("AssetManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <Stocks />
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  test("renders Stocks component", () => {
    expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
  });
});
