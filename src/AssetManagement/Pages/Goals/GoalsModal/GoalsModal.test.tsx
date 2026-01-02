// import { describe, vi, it, beforeEach, afterEach, expect } from "vitest";
// import { render, cleanup, screen, fireEvent } from "@testing-library/react";
// import GoalsModal from "./GoalsModal";
// import { BrowserRouter } from "react-router-dom";
// import AssetManagementProvider, {
//   RefreshDataProps,
// } from "../../../ContextProvider/ContextProvider";
// import { GoalsDTO } from "../../../../../server/types";
// import { Dispatch, SetStateAction } from "react";
// import { ModalTypes } from "../../../../shared/Constants";
// const mockGoals: GoalsDTO = {
//   id: 1,
//   goal: "Marriage",
//   description: "",
//   targetAmount: 20000,
//   savedAmount: 34,
//   targetDate: "2026-12-31",
//   value: 400000,
//   user: "Sasankh",
//   updatedAt: "2025-07-26T14:40:56.785Z",
//   createdAt: "2025-07-26T14:40:56.785Z",
// };

// const mockSetRefreshData = vi.fn() as Dispatch<
//   SetStateAction<RefreshDataProps>
// >;

// const props = {
//   open: true,
//   modalType: ModalTypes.create,
//   setRefreshData: mockSetRefreshData,
//   goals: mockGoals,
//   handleClose: vi.fn(),
// };
// describe("Goals Card Component", () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   afterEach(() => {
//     cleanup();
//   });

//   it("rendering create content when modalType is create", async () => {
//     render(
//       <BrowserRouter>
//         <AssetManagementProvider>
//           <GoalsModal {...props} />
//         </AssetManagementProvider>
//       </BrowserRouter>
//     );
//     const button = screen.getByTestId("handle-goals-button");
//     fireEvent.click(button);

//     expect(screen.getByTestId("handle-goals-button"));
//   });
//   it("rendering edit content when modalType is edit", async () => {
//     render(
//       <BrowserRouter>
//         <AssetManagementProvider>
//           <GoalsModal {...props} modalType={ModalTypes.edit} />
//         </AssetManagementProvider>
//       </BrowserRouter>
//     );
//     const button = screen.getByTestId("handle-goals-button");
//     fireEvent.click(button);

//     expect(screen.getByTestId("handle-goals-button"));
//   });
// });
