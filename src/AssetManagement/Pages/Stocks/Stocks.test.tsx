// import { describe, it, expect, afterEach, vi } from "vitest";
// import { render, screen, cleanup } from "@testing-library/react";
// import { BrowserRouter } from "react-router-dom";
// import AssetManagementProvider from "../../ContextProvider/ContextProvider";
// import Stocks from "./Stocks";

// vi.mock("../../../hooks/queries", () => ({
//   useStocksQuery: () => ({ data: [], isLoading: false }),
// }));

// vi.mock("../../../hooks/mutations", () => ({
//   useStocksMutation: () => ({
//     createStock: { mutateAsync: vi.fn() },
//     updateStock: { mutateAsync: vi.fn() },
//   }),
// }));

// function renderStocks() {
//   return render(
//     <BrowserRouter>
//       <AssetManagementProvider>
//         <Stocks />
//       </AssetManagementProvider>
//     </BrowserRouter>
//   );
// }

// describe("Stocks", () => {
//   afterEach(() => cleanup());

//   it("renders stocks wrapper", () => {
//     renderStocks();
//     expect(screen.getByTestId("stocks-wrapper")).toBeInTheDocument();
//   });

//   it("renders Stock Portfolio heading", () => {
//     renderStocks();
//     expect(screen.getByText("Stock Portfolio")).toBeInTheDocument();
//   });

//   it("renders Add Stock button", () => {
//     renderStocks();
//     expect(screen.getByRole("button", { name: /add stock/i })).toBeInTheDocument();
//   });

//   it("renders KPI labels", () => {
//     renderStocks();
//     expect(screen.getByText("Total Invested")).toBeInTheDocument();
//     expect(screen.getByText("Current Value")).toBeInTheDocument();
//     expect(screen.getByText("Total P&L")).toBeInTheDocument();
//   });
// });
