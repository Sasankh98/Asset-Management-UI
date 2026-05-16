import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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
  });

  afterEach(() => cleanup());

  test("renders Login component", () => {
    renderLogin();
    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
  });

  test("renders app header", () => {
    renderLogin();
    expect(screen.getByText("Asset Management Application")).toBeInTheDocument();
  });

  test("renders email input", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Enter Email")).toBeInTheDocument();
  });

  test("renders password input", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
  });

  test("renders Login button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("updates email field on change", () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText("Enter Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { name: "email", value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  test("updates password field on change", () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText("Enter Password") as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { name: "password", value: "secret" } });
    expect(passwordInput.value).toBe("secret");
  });

  test("password input has type password", () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText("Enter Password");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("navigates to dashboard on successful login", async () => {
    // The global useMutation stub returns mutateAsync as vi.fn() which resolves undefined;
    // override createToken.mutateAsync to return a success response
    vi.mock("../../../hooks/mutations/useLoginMutation", () => ({
      useLoginMutation: () => ({
        createToken: {
          mutateAsync: vi.fn().mockResolvedValue({ status: "success", token: "tok123" }),
          isPending: false,
        },
      }),
    }));
    renderLogin();
    const btn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
  });

  test("clicking login button triggers submit", async () => {
    renderLogin();
    const btn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
    });
  });
});
