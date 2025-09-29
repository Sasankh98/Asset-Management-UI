import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import GoalsModal from "./GoalsModal";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider, {
  RefreshDataProps,
} from "../../../ContextProvider/ContextProvider";
import { Goals } from "../../../../../server/types";
import { httpService } from "../../../../Services/axiosConnection";
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

const mockSetRefreshData = vi.fn() as Dispatch<
  SetStateAction<RefreshDataProps>
>;

vi.mock("../../../../Services/axiosConnection", () => ({
  httpService: {
    patch: vi.fn(),
    post: vi.fn(),
  },
  baseURL: "example.com",
}));

const props = {
  open: true,
  type: "",
  setRefreshData: mockSetRefreshData,
  goals: mockGoals,
  handleClose: vi.fn(),
};
describe("Goals Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(httpService.patch).mockResolvedValue(mockGoals);
    vi.mocked(httpService.post).mockResolvedValue(mockGoals);
  });

  afterEach(() => {
    cleanup();
  });

  it("rendering create content when type is create", async () => {
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <GoalsModal {...props} type="create" />
        </AssetManagementProvider>
      </BrowserRouter>
    );
    const button = await screen.getByTestId("handle-goals-button");
    fireEvent.click(button);

    expect(screen.getByTestId("handle-goals-button"));
  });
  it("rendering edit content when type is edit", async () => {
    render(
      <BrowserRouter>
        <AssetManagementProvider>
          <GoalsModal {...props} type="edit" />
        </AssetManagementProvider>
      </BrowserRouter>
    );
    const button = await screen.getByTestId("handle-goals-button");
    fireEvent.click(button);

    expect(screen.getByTestId("handle-goals-button"));
  });
});
