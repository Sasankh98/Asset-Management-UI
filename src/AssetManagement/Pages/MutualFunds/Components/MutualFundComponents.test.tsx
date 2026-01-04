import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import MutualFundsModal from "./MutualFundModal";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider, {
  RefreshDataProps,
} from "../../../ContextProvider/ContextProvider";
import { MutualFund } from "../../../../../server/types";
import { Dispatch, SetStateAction } from "react";

const mockMutualFund: MutualFund = {
  id: 1,
  fundName: "ABC Growth Fund",
  category: "Equity",
  invested: 10000.1,
  currentValue: 10000.1,
  nav: 10000.1,
  units: 10000,
  user: "sasankh",
  updatedAt: "2025-09-28T09:17:48.296Z",
  createdAt: "2025-09-28T09:17:48.296Z",
  gain_loss: 3000,
  targetProgress: 9,
};

const mockSetRefreshData = vi.fn() as Dispatch<
  SetStateAction<RefreshDataProps>
>;

const props = {
  open: true,
  type: "",
  setRefreshData: mockSetRefreshData,
  selectedMutualFund: mockMutualFund,
  handleClose: vi.fn(),
};
describe("Mutual funds Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
  describe("Mutual funds Modal", () => {
    it("rendering create content when type is create", async () => {
      render(
        <BrowserRouter>
          <AssetManagementProvider>
            <MutualFundsModal {...props} type="create" />
          </AssetManagementProvider>
        </BrowserRouter>
      );
      const button = await screen.getByTestId("handle-mutual-fund-button");
      fireEvent.click(button);

      expect(screen.getByTestId("handle-mutual-fund-button"));
    });
    it("rendering edit content when type is edit", async () => {
      render(
        <BrowserRouter>
          <AssetManagementProvider>
            <MutualFundsModal {...props} type="edit" />
          </AssetManagementProvider>
        </BrowserRouter>
      );
      const button = await screen.getByTestId("handle-mutual-fund-button");
      fireEvent.click(button);

      expect(screen.getByTestId("handle-mutual-fund-button"));
    });
  });
});
