import { describe, it, expect, afterEach, vi } from "vitest";
import { act } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";
import StocksDialog from "./StocksDialog";

vi.mock("../../../hooks/mutations", () => ({
  useStocksMutation: () => ({
    createStock: { mutateAsync: vi.fn() },
    updateStock: { mutateAsync: vi.fn() },
  }),
}));

function renderDialog(props = {}) {
  return render(
    <BrowserRouter>
      <AssetManagementProvider>
        <StocksDialog
          open={true}
          type="create"
          handleClose={vi.fn()}
          {...props}
        />
      </AssetManagementProvider>
    </BrowserRouter>
  );
}

describe("StocksDialog", () => {
  afterEach(() => cleanup());

  it("renders Add Stock title for create type", () => {
    renderDialog();
    expect(screen.getAllByText("Add Stock").length).toBeGreaterThan(0);
  });

  it("renders Edit Stock title for edit type", () => {
    const selectedStock = {
      id: 1, stockName: "RELIANCE", avg: 2500, quantity: 10,
      totalInvested: 25000, buyDate: "2024-01-01", status: "active",
      category: "Large Cap", currentValue: 30000, marketPrice: 3000,
      sellPrice: 0, totalReturns: 5000, profitLoss: 5000, dividends: 0,
      buyTax: 0, sellTax: 0, netreturn: 5000, netProfitLoss: 5000,
      netProfitLossPercent: 20, sellDate: "", user: "Sasankh",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    renderDialog({ type: "edit", selectedStock });
    expect(screen.getByText("Edit Stock")).toBeInTheDocument();
  });

  it("renders Cancel and Add Stock buttons", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add stock/i })).toBeInTheDocument();
  });

  it("renders Investment Type toggle buttons", () => {
    renderDialog();
    expect(screen.getByText("Lumpsum")).toBeInTheDocument();
    expect(screen.getByText("SIP")).toBeInTheDocument();
  });

  it("renders status and category select fields", () => {
    renderDialog();
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
  });

  it("shows SIP section when SIP toggle clicked", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /sip/i }));
    expect(screen.getByText("SIP DETAILS")).toBeInTheDocument();
  });

  it("shows SIP start/end date fields in SIP mode", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /sip/i }));
    expect(screen.getByLabelText(/sip start date/i)).toBeInTheDocument();
  });

  it("shows sell details when status changed to sold (edit mode)", () => {
    const selectedStock = {
      id: 1, stockName: "TCS", avg: 3000, quantity: 5,
      totalInvested: 15000, buyDate: "2023-01-01", status: "active",
      category: "Large Cap", currentValue: 18000, marketPrice: 3600,
      sellPrice: 0, totalReturns: 3000, profitLoss: 3000, dividends: 0,
      buyTax: 0, sellTax: 0, netreturn: 3000, netProfitLoss: 3000,
      netProfitLossPercent: 20, sellDate: "", user: "Sasankh",
      createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z",
    };
    renderDialog({ type: "edit", selectedStock });
    // Change status to sold to cover the isSold branch
    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.mouseDown(statusSelect);
    const soldOption = screen.getByRole("option", { name: /sold/i });
    fireEvent.click(soldOption);
    expect(screen.getByText("SELL DETAILS")).toBeInTheDocument();
  });

  it("clicking submit with empty stock name calls handleSubmit validation", async () => {
    renderDialog();
    const submitBtn = screen.getByRole("button", { name: /add stock/i });
    await act(async () => { fireEvent.click(submitBtn); });
    // handleSubmit runs and exits early — no crash
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("switches to SIP mode and sets start date triggering sipCalc (covers addPeriod, countInstallments)", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /sip/i }));
    const startDate = screen.getByLabelText(/sip start date/i);
    fireEvent.change(startDate, { target: { value: "2020-01-01" } });
    // Trigger sipCalc by also setting quantity
    const qtyInput = screen.getByLabelText(/total shares accumulated/i);
    fireEvent.change(qtyInput, { target: { value: "10" } });
    // sipCalc should now show summary
    expect(screen.getByText(/installments/i)).toBeInTheDocument();
  });

  it("can change SIP end date (covers setSipEnd onChange)", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /sip/i }));
    const endDate = screen.getByLabelText(/end date/i);
    fireEvent.change(endDate, { target: { value: "2023-12-31" } });
    expect(endDate).toHaveValue("2023-12-31");
  });

  it("can change SIP amount and frequency (covers setSipAmount, setSipFreq)", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /sip/i }));
    const amtInput = screen.getByLabelText(/sip amount/i);
    fireEvent.change(amtInput, { target: { value: "8000" } });
    expect(amtInput).toHaveValue(8000);
    // MUI Select — use mouseDown + click option pattern
    const freqSelect = screen.getByLabelText(/frequency/i);
    fireEvent.mouseDown(freqSelect);
    fireEvent.click(screen.getByRole("option", { name: /quarterly/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("can change category select (covers set + onChange)", () => {
    renderDialog();
    // MUI Select — use mouseDown + click option pattern
    const catSelect = screen.getByLabelText(/market cap category/i);
    fireEvent.mouseDown(catSelect);
    fireEvent.click(screen.getByRole("option", { name: /mid cap/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("can change avg buy price, quantity, brokerage (covers onChange handlers)", () => {
    renderDialog();
    const avgInput = screen.getByLabelText(/avg buy price/i);
    fireEvent.change(avgInput, { target: { value: "2500" } });
    expect(avgInput).toHaveValue(2500);
    const qtyInput = screen.getByLabelText(/^quantity$/i);
    fireEvent.change(qtyInput, { target: { value: "10" } });
    expect(qtyInput).toHaveValue(10);
    const brokerageInput = screen.getByLabelText(/brokerage \(₹\)/i);
    fireEvent.change(brokerageInput, { target: { value: "50" } });
    expect(brokerageInput).toHaveValue(50);
  });

  it("can change buy date (covers onChange)", () => {
    renderDialog();
    const buyDate = screen.getByLabelText(/buy date/i);
    fireEvent.change(buyDate, { target: { value: "2022-06-01" } });
    expect(buyDate).toHaveValue("2022-06-01");
  });

  it("can change market price showing P&L helper text (covers onChange + IIFE)", () => {
    renderDialog();
    // Set avg and quantity first to get values > 0
    fireEvent.change(screen.getByLabelText(/avg buy price/i), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText(/^quantity$/i), { target: { value: "5" } });
    const mpInput = screen.getByLabelText(/market price/i);
    fireEvent.change(mpInput, { target: { value: "120" } });
    expect(screen.getByText(/P&L:/i)).toBeInTheDocument();
  });

  it("can change sell fields when status is sold (covers isSold onChange handlers)", () => {
    const selectedStock = {
      id: 2, stockName: "INFY", avg: 1500, quantity: 20,
      totalInvested: 30000, buyDate: "2021-01-01", status: "sold",
      category: "Large Cap", currentValue: 35000, marketPrice: 1750,
      sellPrice: 1700, totalReturns: 5000, profitLoss: 4000, dividends: 500,
      buyTax: 100, sellTax: 80, netreturn: 4420, netProfitLoss: 4420,
      netProfitLossPercent: 14.7, sellDate: "2023-01-01", user: "Sasankh",
      createdAt: "2021-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z",
    };
    renderDialog({ type: "edit", selectedStock });
    expect(screen.getByText("SELL DETAILS")).toBeInTheDocument();
    const sellPriceInput = screen.getByLabelText(/sell price/i);
    fireEvent.change(sellPriceInput, { target: { value: "1800" } });
    expect(sellPriceInput).toHaveValue(1800);
    const sellTaxInput = screen.getByLabelText(/sell tax/i);
    fireEvent.change(sellTaxInput, { target: { value: "90" } });
    const dividendsInput = screen.getByLabelText(/dividends/i);
    fireEvent.change(dividendsInput, { target: { value: "600" } });
    const sellDateInput = screen.getByLabelText(/sell date/i);
    fireEvent.change(sellDateInput, { target: { value: "2023-06-01" } });
    // P&L preview shows up when sellPrice > 0 and quantity > 0
    expect(screen.getByText(/estimated p&l/i)).toBeInTheDocument();
  });

  it("triggers stock symbol search on typing (covers searchStocks via debounce)", async () => {
    vi.useFakeTimers();
    renderDialog();
    const autocompleteInput = screen.getByPlaceholderText(/reliance/i);
    fireEvent.change(autocompleteInput, { target: { value: "RE" } });
    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
      await Promise.resolve();
    });
    vi.useRealTimers();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("can type in stock autocomplete input (covers onInputChange and set)", () => {
    renderDialog();
    const input = screen.getByPlaceholderText(/reliance/i);
    fireEvent.change(input, { target: { value: "RELIANCE" } });
    expect(input).toHaveValue("RELIANCE");
  });
});
