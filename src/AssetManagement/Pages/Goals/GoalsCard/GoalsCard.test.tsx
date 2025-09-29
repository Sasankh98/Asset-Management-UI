import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import GoalsCard from "./GoalsCard";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../../ContextProvider/ContextProvider";
import { Goals } from "../../../../../server/types";
import { httpService } from "../../../../services/axiosConnection";
import { Dispatch, SetStateAction } from "react";
const mockGoals: Goals = {
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
};

const mockSetGoalsOpen = vi.fn() as Dispatch<SetStateAction<boolean>>;
const mockSetType = vi.fn() as Dispatch<SetStateAction<"" | "edit" | "create">>;

vi.mock("../../../../Services/axiosConnection", () => ({
  httpService: {
    patch: vi.fn(),
  },
  baseURL: "example.com",
}));

const props = {
  goal: mockGoals,
  setGoalsOpen: mockSetGoalsOpen,
  setType: mockSetType,
  setSelectedGoal: vi.fn(),
  loading: false,
};
describe("Goals Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(httpService.patch).mockResolvedValue(mockGoals);
  });

  afterEach(() => {
    cleanup();
  });

  it("clicking on edit goal button renders goal form", async () => {
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <GoalsCard {...props} />
        </AssetManagementProvider>
      </BrowserRouter>
    );
    const button = await screen.getByTestId("edit-button");
    fireEvent.click(button);

    expect(screen.getByTestId("edit-button"));
  });
  it("rendering skeleton loaders when loading is true", async () => {
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <GoalsCard {...props} loading={true} />
        </AssetManagementProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId("loading-true"));
  });
});
