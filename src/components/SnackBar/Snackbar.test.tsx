import { describe, it, vi, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider, { AssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";
import CustomSnackbar from "./Snackbar";

describe("CustomSnackbar", () => {
  afterEach(() => cleanup());

  it("renders without crashing when snackbar is closed", () => {
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <CustomSnackbar />
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  it("shows the snackbar when open is true", () => {
    render(
      <BrowserRouter>
        <AssetManagementContext.Provider
          value={{
            displayContent: undefined,
            refreshData: { refreshGoals: false, refreshSalary: false },
            setRefreshData: vi.fn(),
            snackBarOptions: { open: true, message: "Operation successful", severity: "success" },
            setSnackBarOptions: vi.fn(),
            showSnackbar: vi.fn(),
          }}
        >
          <CustomSnackbar />
        </AssetManagementContext.Provider>
      </BrowserRouter>
    );
    expect(screen.getByText("Operation successful")).toBeInTheDocument();
  });
});
