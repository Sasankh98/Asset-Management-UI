import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import Goals from "./Goals";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import { DialogProvider } from "../../ContextProvider/DialogContextProvider";
import * as queryHook from "../../../hooks/queries/useGoalsQuery";
import { UseQueryResult } from "@tanstack/react-query";
import { GoalsDTO } from "../../../../server/types";

describe("Goals Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useGoalsQuery to return sample data
    vi.spyOn(queryHook, "useGoalsQuery").mockReturnValue({
      data: [
        {
          id: 1,
          goal: "test",
          description: "test goal",
          targetAmount: 1000,
          savedAmount: 500,
          targetDate: "2025-12-31",
          value: 0,
          user: "user1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      status: "success",
      isPending: false,
      isSuccess: true,
      fetchStatus: "idle",
      dataUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      isFetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
    } as unknown as UseQueryResult<GoalsDTO[], Error>);

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