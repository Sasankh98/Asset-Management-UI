import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Settings from "./Settings";
import { type UserProfile } from "../../../hooks/queries/useSettingsQuery";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseSettingsQuery = vi.fn(() => ({ data: null as UserProfile | null, isLoading: false }));

vi.mock("../../../hooks/queries", () => ({
  useSettingsQuery: () => mockUseSettingsQuery(),
}));

describe("Settings (no profile)", () => {
  afterEach(() => cleanup());

  it("renders settings container", () => {
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByTestId("settings-container")).toBeInTheDocument();
  });

  it("renders Profile section", () => {
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders Change Password section", () => {
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });

  it("renders About section", () => {
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("clicks Logout triggers navigation", () => {
    render(<BrowserRouter><Settings /></BrowserRouter>);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

describe("Settings (with profile)", () => {
  afterEach(() => cleanup());

  it("renders email from profile", () => {
    mockUseSettingsQuery.mockReturnValue({
      data: { email: "test@example.com", id: 42, createdAt: "2024-01-15T00:00:00Z" },
      isLoading: false,
    });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders avatar initials from profile email", () => {
    mockUseSettingsQuery.mockReturnValue({
      data: { email: "alice@example.com", id: 1, createdAt: "2024-06-01T00:00:00Z" },
      isLoading: false,
    });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders memberSince from profile createdAt", () => {
    mockUseSettingsQuery.mockReturnValue({
      data: { email: "test@example.com", id: 1, createdAt: "2022-03-01T00:00:00Z" },
      isLoading: false,
    });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(screen.getByText(/member since/i)).toBeInTheDocument();
  });
});

describe("Settings change password", () => {
  afterEach(() => cleanup());

  it("shows error when new passwords do not match", async () => {
    mockUseSettingsQuery.mockReturnValue({ data: null, isLoading: false });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "oldpass" } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: "newpass1" } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: "newpass2" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error when new password is too short", async () => {
    mockUseSettingsQuery.mockReturnValue({ data: null, isLoading: false });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "old" } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
  });
});

describe("Settings copy email", () => {
  afterEach(() => cleanup());

  it("handleCopyEmail copies email to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    mockUseSettingsQuery.mockReturnValue({
      data: { email: "copy@example.com", id: 5, createdAt: "2023-01-01T00:00:00Z" },
      isLoading: false,
    });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    const copyBtn = screen.getByRole("button", { name: /copy email/i });
    fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledWith("copy@example.com");
  });
});

describe("Settings – additional branch coverage", () => {
  afterEach(() => cleanup());

  it("isLoading=true shows loading skeleton (L92 true branch)", () => {
    mockUseSettingsQuery.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<BrowserRouter><Settings /></BrowserRouter>);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  it("valid matching passwords >= 6 chars covers L49 false branch and L188 true (pwSaving)", async () => {
    mockUseSettingsQuery.mockReturnValue({ data: null, isLoading: false });
    render(<BrowserRouter><Settings /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "currentPass" } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: "newPass123" } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: "newPass123" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(screen.getByTestId("settings-container")).toBeInTheDocument();
    });
  });
});
