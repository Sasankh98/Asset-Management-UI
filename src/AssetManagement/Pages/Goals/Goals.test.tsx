import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import {
  render,
  cleanup,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import Goals from "./Goals";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import { GoalsDTO } from "../../../../server/types";
import { httpService } from "../../../Services/axiosConnection";
const mockGoals: GoalsDTO = {
  status: "success",
  data: [
    {
      id: 1,
      goal: "Marriage",
      description: "",
      targetAmount: 20000,
      savedAmount: 34,
      targetDate: "2026-12-31",
      value: 400000,
      user: "Sasankh",
      updatedAt: "2025-07-26T14:40:56.785Z",
      createdAt: "2025-07-26T14:40:56.785Z",
    },
    {
      id: 2,
      goal: "Dog",
      description: "",
      targetAmount: 20000,
      savedAmount: 34,
      targetDate: "2026-12-31",
      value: 400000,
      user: "Sasankh",
      updatedAt: "2025-07-26T14:40:56.785Z",
      createdAt: "2025-07-26T14:40:56.785Z",
    },
  ],
};

vi.mock("../../../Services/axiosConnection", () => ({
  httpService: {
    get: vi.fn(),
  },
  baseURL: "example.com",
}));
describe("Goals Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(httpService.get).mockResolvedValue(mockGoals);
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <Goals />
        </AssetManagementProvider>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders goals component", async () => {
    expect(screen.getByTestId("goals-container")).toBeInTheDocument();
    await waitFor(() => {
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  it("clicking on add goal button renders goal form", async () => {
    const button = await screen.findByText(/Add Goal/);
    fireEvent.click(button);

    expect(screen.findAllByText(/Create New Goal/));
  });
});
