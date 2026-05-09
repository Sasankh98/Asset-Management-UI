import { beforeEach, describe, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/Asset-Management-UI/"]}>
      <Routes>
        <Route
          path="/Asset-Management-UI/"
          element={
            <AssetManagementProvider>
              <Login />
            </AssetManagementProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderLogin();
  });

  test("renders Login component", () => {
    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
  });
});
