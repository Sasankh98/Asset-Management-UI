import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../hooks/mutations/useLoginMutation", () => ({
  useLoginMutation: () => ({
    createToken: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  }),
}));

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
    mockMutateAsync.mockResolvedValue({ status: "success", token: "test-token" });
  });

  afterEach(() => cleanup());

  test("renders Login component", () => {
    renderLogin();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  test("renders sign-in and create account tabs", () => {
    renderLogin();
    expect(screen.getByRole("tab", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /create account/i })).toBeInTheDocument();
  });

  test("renders email input", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("renders password input", () => {
    renderLogin();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("renders Sign in submit button", () => {
    renderLogin();
    expect(screen.getByTestId("sign-in-btn")).toBeInTheDocument();
  });

  test("updates email field on change", () => {
    renderLogin();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  test("updates password field on change", () => {
    renderLogin();
    const pwdInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    fireEvent.change(pwdInput, { target: { value: "secret123" } });
    expect(pwdInput).toHaveValue("secret123");
  });

  test("password input has type password", () => {
    renderLogin();
    const pwdInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(pwdInput).toHaveAttribute("type", "password");
  });

  test("navigates to dashboard on successful login", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("sign-in-btn"));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test("clicking sign-in button submits the form", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    const signInBtn = screen.getByTestId("sign-in-btn");
    expect(signInBtn).not.toBeDisabled();
    fireEvent.click(signInBtn);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});
