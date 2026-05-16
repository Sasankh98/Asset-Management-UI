import { beforeEach, describe, test, vi, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AssetManagementProvider from "../../ContextProvider/ContextProvider";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
let mockIsPending = false;

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
      isPending: mockIsPending,
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
    mockIsPending = false;
    mockMutateAsync.mockResolvedValue({ status: "success", token: "test-token" });
    sessionStorage.clear();
  });

  afterEach(() => cleanup());

  // ─── Existing tests ────────────────────────────────────────────────────────

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

  // ─── Brand panel ───────────────────────────────────────────────────────────

  describe("BrandPanel", () => {
    test("renders brand tagline", () => {
      renderLogin();
      expect(screen.getByText(/watch every rupee/i)).toBeInTheDocument();
    });

    test("renders portfolio preview section", () => {
      renderLogin();
      expect(screen.getByText(/your net worth/i)).toBeInTheDocument();
    });

    test("renders Encrypted trust badge", () => {
      renderLogin();
      expect(screen.getByText(/encrypted, on-device first/i)).toBeInTheDocument();
    });

    test("renders Never asks for bank passwords trust badge", () => {
      renderLogin();
      expect(screen.getByText(/never asks for bank passwords/i)).toBeInTheDocument();
    });

    test("renders Built for Indian investors trust badge", () => {
      renderLogin();
      expect(screen.getByText(/built for indian investors/i)).toBeInTheDocument();
    });
  });

  // ─── Mode switching ────────────────────────────────────────────────────────

  describe("Mode switching", () => {
    test("clicking Create account tab shows register heading", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /create account/i }));
      expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    test("clicking Sign in tab from register returns to sign-in heading", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /create account/i }));
      fireEvent.click(screen.getByRole("tab", { name: /sign in/i }));
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
    });

    test('"Create an account →" link switches to register mode', () => {
      renderLogin();
      fireEvent.click(screen.getByRole("link", { name: /create an account/i }));
      expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    test('"Already have one? Sign in →" link switches back to sign in', () => {
      renderLogin();
      fireEvent.click(screen.getByRole("link", { name: /create an account/i }));
      fireEvent.click(screen.getByRole("link", { name: /^sign in/i }));
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
    });
  });

  // ─── Method tabs ───────────────────────────────────────────────────────────

  describe("Method tabs", () => {
    test("email method is selected by default", () => {
      renderLogin();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    test("switching to phone method shows phone input", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    });

    test("switching back to email from phone shows email input", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.click(screen.getByRole("tab", { name: /email/i }));
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });
  });

  // ─── Phone OTP flow ────────────────────────────────────────────────────────

  describe("Phone sign-in flow", () => {
    test("Send code button disabled with incomplete phone number", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      expect(screen.getByRole("button", { name: /send code/i })).toBeDisabled();
    });

    test("Send code button enabled with 10-digit phone number", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      expect(screen.getByRole("button", { name: /send code/i })).not.toBeDisabled();
    });

    test("clicking Send code shows OTP entry", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      expect(screen.getByText(/6-digit code/i)).toBeInTheDocument();
    });

    test("Change link in OTP entry returns to phone input", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      fireEvent.click(screen.getByText("Change"));
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    });

    test("Verify & sign in button disabled when OTP not filled", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      expect(screen.getByRole("button", { name: /verify/i })).toBeDisabled();
    });

    test("Auto-fill from SMS enables the verify button", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      fireEvent.click(screen.getByRole("button", { name: /auto-fill/i }));
      expect(screen.getByRole("button", { name: /verify/i })).not.toBeDisabled();
    });

    test("OTP digit key presses fill slots and enable verify button", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      const otpInput = document.querySelector(".lp-otp-real-input") as HTMLInputElement;
      ["4", "8", "2", "7", "1", "6"].forEach((digit) => {
        fireEvent.keyDown(otpInput, { key: digit });
      });
      expect(screen.getByRole("button", { name: /verify/i })).not.toBeDisabled();
    });

    test("resend timer shows initial countdown text", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      fireEvent.change(screen.getByLabelText("Mobile number"), {
        target: { value: "9876543210" },
      });
      fireEvent.click(screen.getByRole("button", { name: /send code/i }));
      expect(screen.getByText(/resend in/i)).toBeInTheDocument();
    });
  });

  // ─── Email sign-in form behaviour ─────────────────────────────────────────

  describe("Email sign-in form", () => {
    test("Sign in button disabled when email and password are empty", () => {
      renderLogin();
      expect(screen.getByTestId("sign-in-btn")).toBeDisabled();
    });

    test("Sign in button disabled when password is shorter than 6 characters", () => {
      renderLogin();
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "12345" },
      });
      expect(screen.getByTestId("sign-in-btn")).toBeDisabled();
    });

    test("clicking the visibility icon toggles password to text", () => {
      renderLogin();
      const pwdInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggle = pwdInput.closest(".lp-ctrl")!.querySelector(".right-ic")!;
      fireEvent.click(toggle);
      expect(pwdInput.type).toBe("text");
    });

    test("clicking the visibility icon twice returns password to hidden", () => {
      renderLogin();
      const pwdInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggle = pwdInput.closest(".lp-ctrl")!.querySelector(".right-ic")!;
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(pwdInput.type).toBe("password");
    });

    test("trust device checkbox is present and checked by default", () => {
      renderLogin();
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    test("Sign in button shows Signing in… and is disabled when isPending", () => {
      mockIsPending = true;
      renderLogin();
      const btn = screen.getByTestId("sign-in-btn");
      expect(btn).toHaveTextContent(/signing in/i);
      expect(btn).toBeDisabled();
    });
  });

  // ─── Error and success handling ────────────────────────────────────────────

  describe("Error and success handling", () => {
    test("shows inline error message when login fails", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Unauthorized"));
      renderLogin();
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByTestId("sign-in-btn"));
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    test("saves token to sessionStorage on successful login", async () => {
      renderLogin();
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByTestId("sign-in-btn"));
      await waitFor(() => {
        expect(sessionStorage.getItem("token")).toBe("test-token");
      });
    });
  });

  // ─── Register form ─────────────────────────────────────────────────────────

  describe("Register form", () => {
    beforeEach(() => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /create account/i }));
    });

    test("shows name input", () => {
      expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    });

    test("shows email input in email method", () => {
      expect(screen.getAllByLabelText("Email").length).toBeGreaterThan(0);
    });

    test("shows phone input after switching to phone method", () => {
      fireEvent.click(screen.getByRole("tab", { name: /phone/i }));
      expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    });

    test("shows free forever notice", () => {
      expect(screen.getByText(/free forever/i)).toBeInTheDocument();
    });

    test("agree to terms checkbox is present", () => {
      expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    });

    test("Create account button is disabled when name is empty", () => {
      expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
    });

    test("password strength label appears after typing a password", () => {
      const pwdInput = document.getElementById("lp-r-pwd") as HTMLInputElement;
      fireEvent.change(pwdInput, { target: { value: "Secure@123" } });
      expect(screen.getByText(/strong|excellent|okay/i)).toBeInTheDocument();
    });

    test("Create account button enabled when all required fields are filled", () => {
      fireEvent.change(screen.getByLabelText("Your name"), {
        target: { value: "Vikram" },
      });
      fireEvent.change(screen.getAllByLabelText("Email")[0], {
        target: { value: "vikram@example.com" },
      });
      const pwdInput = document.getElementById("lp-r-pwd") as HTMLInputElement;
      fireEvent.change(pwdInput, { target: { value: "Secure@123" } });
      expect(screen.getByRole("button", { name: /create account/i })).not.toBeDisabled();
    });
  });

  // ─── Google sign-in ────────────────────────────────────────────────────────

  describe("Google sign-in button", () => {
    test("Sign in with Google button present in sign-in mode", () => {
      renderLogin();
      expect(
        screen.getByRole("button", { name: /sign in with google/i })
      ).toBeInTheDocument();
    });

    test("Continue with Google button shown in register mode", () => {
      renderLogin();
      fireEvent.click(screen.getByRole("tab", { name: /create account/i }));
      expect(
        screen.getByRole("button", { name: /continue with google/i })
      ).toBeInTheDocument();
    });
  });
});
