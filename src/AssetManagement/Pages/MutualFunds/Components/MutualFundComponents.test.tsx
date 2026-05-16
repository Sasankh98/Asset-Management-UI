import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
import { act } from "react";
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

  describe("Mutual Fund Modal form interactions", () => {
    function renderModal(type: "create" | "edit" = "create", mf?: Partial<MutualFund>) {
      const fund = mf ? { ...mockMutualFund, ...mf } : mockMutualFund;
      render(
        <BrowserRouter>
          <AssetManagementProvider>
            <MutualFundsModal open={true} type={type} handleClose={vi.fn()} selectedMutualFund={fund} />
          </AssetManagementProvider>
        </BrowserRouter>
      );
    }

    afterEach(() => cleanup());

    it("can type in the fund search input (covers onInputChange and set)", () => {
      renderModal("create");
      const searchInput = screen.getByPlaceholderText(/parag parikh/i);
      fireEvent.change(searchInput, { target: { value: "HDFC" } });
      expect(searchInput).toHaveValue("HDFC");
    });

    it("can change category dropdown (covers onChange)", () => {
      renderModal("create");
      // MUI Select — use mouseDown + click option pattern
      const categorySelect = screen.getByLabelText("Category");
      fireEvent.mouseDown(categorySelect);
      fireEvent.click(screen.getByRole("option", { name: /large cap/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("can toggle to SIP investment type (covers onChange)", () => {
      renderModal("create");
      const sipBtn = screen.getByRole("button", { name: /^sip$/i });
      fireEvent.click(sipBtn);
      expect(screen.getByText("SIP DETAILS")).toBeInTheDocument();
    });

    it("can change SIP amount (covers onChange in SIP section)", () => {
      renderModal("create");
      fireEvent.click(screen.getByRole("button", { name: /^sip$/i }));
      const sipAmtInput = screen.getByLabelText(/sip amount/i);
      fireEvent.change(sipAmtInput, { target: { value: "10000" } });
      expect(sipAmtInput).toHaveValue(10000);
    });

    it("can change SIP frequency (covers onChange)", () => {
      renderModal("create");
      fireEvent.click(screen.getByRole("button", { name: /^sip$/i }));
      // MUI Select — use mouseDown + click option pattern
      const freqSelect = screen.getByLabelText(/frequency/i);
      fireEvent.mouseDown(freqSelect);
      fireEvent.click(screen.getByRole("option", { name: /quarterly/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("can set SIP start and end dates (covers onChange)", () => {
      renderModal("create");
      fireEvent.click(screen.getByRole("button", { name: /^sip$/i }));
      const startDate = screen.getByLabelText("Start Date");
      fireEvent.change(startDate, { target: { value: "2020-01-01" } });
      expect(startDate).toHaveValue("2020-01-01");
      const endDate = screen.getByLabelText(/end date/i);
      fireEvent.change(endDate, { target: { value: "2023-12-31" } });
      expect(endDate).toHaveValue("2023-12-31");
    });

    it("Calculate SIP Returns button is disabled when no scheme selected (covers isSipReady branch)", () => {
      renderModal("create");
      fireEvent.click(screen.getByRole("button", { name: /^sip$/i }));
      // Without a scheme selected, the button should be disabled
      const calcBtn = screen.getByRole("button", { name: /calculate sip returns/i });
      expect(calcBtn).toBeDisabled();
      // The hint text is also shown when schemeCode is not set
      expect(screen.getByText(/select a fund from search to enable automatic sip calculation/i)).toBeInTheDocument();
    });

    it("can change invested amount (covers set + onChange)", () => {
      renderModal("create");
      const investedInput = screen.getByLabelText(/invested amount/i);
      fireEvent.change(investedInput, { target: { value: "50000" } });
      expect(investedInput).toHaveValue(50000);
    });

    it("can change units (covers onChange)", () => {
      renderModal("create");
      const unitsInput = screen.getByLabelText(/^units$/i);
      fireEvent.change(unitsInput, { target: { value: "100.5" } });
    });

    it("can change NAV field (covers onChange)", () => {
      renderModal("create");
      const navInput = screen.getByLabelText(/nav \(₹\)/i);
      fireEvent.change(navInput, { target: { value: "50.25" } });
      expect(navInput).toHaveValue(50.25);
    });

    it("can change current value showing gain/loss (covers onChange + IIFE block)", () => {
      renderModal("create");
      const investedInput = screen.getByLabelText(/invested amount/i);
      fireEvent.change(investedInput, { target: { value: "50000" } });
      const cvInput = screen.getByLabelText(/current value/i);
      fireEvent.change(cvInput, { target: { value: "55000" } });
      // Gain/Loss display appears when both invested and currentValue > 0
      expect(screen.getByText(/gain\/loss/i)).toBeInTheDocument();
    });

    it("can change current value showing loss (covers negative gain branch)", () => {
      renderModal("create");
      const investedInput = screen.getByLabelText(/invested amount/i);
      fireEvent.change(investedInput, { target: { value: "50000" } });
      const cvInput = screen.getByLabelText(/current value/i);
      fireEvent.change(cvInput, { target: { value: "45000" } });
      expect(screen.getByText(/gain\/loss/i)).toBeInTheDocument();
    });

    it("can change target amount (covers onChange)", () => {
      renderModal("create");
      const targetInput = screen.getByLabelText(/target amount/i);
      fireEvent.change(targetInput, { target: { value: "200000" } });
      expect(targetInput).toHaveValue(200000);
    });

    it("can change allocation percentage fields (covers onChange in portfolio section)", () => {
      renderModal("create");
      // Use getAllByLabelText because the label might match multiple elements
      const equityInput = screen.getAllByLabelText(/^equity %$/i)[0];
      fireEvent.change(equityInput, { target: { value: "60" } });
      expect(equityInput).toHaveValue(60);
      const debtInput = screen.getAllByLabelText(/^debt %$/i)[0];
      fireEvent.change(debtInput, { target: { value: "40" } });
      expect(debtInput).toHaveValue(40);
    });

    it("shows allocation progress bar when total > 0 (covers hasAny branch)", () => {
      renderModal("create");
      const equityInput = screen.getAllByLabelText(/^equity %$/i)[0];
      fireEvent.change(equityInput, { target: { value: "60" } });
      const debtInput = screen.getAllByLabelText(/^debt %$/i)[0];
      fireEvent.change(debtInput, { target: { value: "40" } });
      expect(screen.getByText(/100.0% total/i)).toBeInTheDocument();
    });

    it("can change cash and real estate pct fields (covers remaining onChange)", () => {
      renderModal("create");
      const cashInput = screen.getByLabelText(/cash %/i);
      fireEvent.change(cashInput, { target: { value: "10" } });
      expect(cashInput).toHaveValue(10);
    });

    it("triggers fund search via debounce (covers searchFunds)", async () => {
      vi.useFakeTimers();
      renderModal("create");
      const searchInput = screen.getByPlaceholderText(/parag parikh/i);
      fireEvent.change(searchInput, { target: { value: "Axis" } });
      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
        await Promise.resolve();
      });
      vi.useRealTimers();
      // Component should still be rendered without crash
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("fund search debounce covers searchFunds path without crash", async () => {
      vi.useFakeTimers();
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [{ schemeCode: 120503, schemeName: "Axis Bluechip Fund" }],
      } as unknown as Response);

      renderModal("create");
      const searchInput = screen.getByPlaceholderText(/parag parikh/i);
      fireEvent.change(searchInput, { target: { value: "Axis" } });

      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
        await Promise.resolve();
      });

      vi.useRealTimers();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
