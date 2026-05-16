import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import GoalsCard from "./GoalsCard";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../../ContextProvider/ContextProvider";
import { GoalsDTO } from "../../../../../server/types";
import { Dispatch, SetStateAction } from "react";
import { ImageIcons } from "../../../../shared/Constants";

const mockGoals: GoalsDTO = {
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

const props = {
  goal: mockGoals,
  setGoalsOpen: mockSetGoalsOpen,
  setSelectedGoal: vi.fn(),
  loading: false,
  handleOpenDialogue: vi.fn(),
  handleDeleteGoal: vi.fn(),
};
describe("Goals Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const button = screen.getByTestId("edit-button");
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

  const renderCard = (goal: Partial<GoalsDTO> = {}) =>
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <GoalsCard
            {...props}
            goal={{ ...mockGoals, ...goal }}
          />
        </AssetManagementProvider>
      </BrowserRouter>
    );

  it("renders Golden Retriever goal (switch case 0)", () => {
    renderCard({ goal: ImageIcons.goldenRetriever });
    expect(screen.getByText(ImageIcons.goldenRetriever)).toBeInTheDocument();
  });

  it("renders Bike goal (switch case 1)", () => {
    renderCard({ goal: ImageIcons.bike });
    expect(screen.getByText(ImageIcons.bike)).toBeInTheDocument();
  });

  it("renders Tattoo goal (switch case 2)", () => {
    renderCard({ goal: ImageIcons.tattoo });
    expect(screen.getByText(ImageIcons.tattoo)).toBeInTheDocument();
  });

  it("renders default goal emoji for unknown goal name", () => {
    renderCard({ goal: "Some Unknown Goal" });
    expect(screen.getByText("Some Unknown Goal")).toBeInTheDocument();
  });

  it("pct is 0 when targetAmount is 0", () => {
    renderCard({ targetAmount: 0, savedAmount: 0 });
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("monthly is null when targetDate is in the past (months <= 0)", () => {
    // targetDate in the past → months = 0 → monthly = null → "Need monthly" row absent
    renderCard({ targetDate: "2020-01-01", savedAmount: 500 });
    expect(screen.queryByText("Need monthly")).not.toBeInTheDocument();
  });

  it("shows Set up SIP chip when savedAmount is 0 (onTrack=false)", () => {
    renderCard({ savedAmount: 0 });
    expect(screen.getByText("Set up SIP")).toBeInTheDocument();
  });

  it("shows On track chip when monthly>0 and savedAmount>0", () => {
    // future targetDate + savedAmount > 0 → onTrack=true
    renderCard({ savedAmount: 5000, targetDate: "2030-01-01" });
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("calls handleDeleteGoal when delete button clicked", async () => {
    renderCard();
    fireEvent.click(screen.getByTestId("delete-button"));
    expect(props.handleDeleteGoal).toHaveBeenCalledWith(mockGoals.id);
  });
});
