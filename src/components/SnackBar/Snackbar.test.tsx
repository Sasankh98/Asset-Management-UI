import { describe, it, vi, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

  it("handleClose with reason='clickaway' returns early without closing (B0 L13 true branch)", () => {
    const setSnackBarOptions = vi.fn();
    render(
      <BrowserRouter>
        <AssetManagementContext.Provider
          value={{
            displayContent: undefined,
            refreshData: { refreshGoals: false, refreshSalary: false },
            setRefreshData: vi.fn(),
            snackBarOptions: { open: true, message: "Test message", severity: "info" },
            setSnackBarOptions,
            showSnackbar: vi.fn(),
          }}
        >
          <CustomSnackbar />
        </AssetManagementContext.Provider>
      </BrowserRouter>
    );
    // MUI ClickAwayListener uses 'mousedown' to detect clicks outside the snackbar.
    // Firing mousedown on document triggers the clickaway handler with reason="clickaway".
    fireEvent.mouseDown(document);
    // handleClose with reason="clickaway" returns early — setSnackBarOptions not called
    expect(setSnackBarOptions).not.toHaveBeenCalled();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });
});
