import { describe, it, vi, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function renderWithRouter(token: string | null) {
  if (token) {
    sessionStorage.setItem("token", token);
  } else {
    sessionStorage.removeItem("token");
  }

  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Secret Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Asset-Management-UI/"
          element={<div data-testid="login-page">Login</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("renders children when a token is present", () => {
    // Build a minimal JWT with exp 1 hour from now so isTokenValid passes
    const payload = btoa(JSON.stringify({ sub: "user", exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeJwt = `header.${payload}.signature`;
    renderWithRouter(fakeJwt);
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Secret Page")).toBeInTheDocument();
  });

  it("redirects to login when no token is present", () => {
    renderWithRouter(null);
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("does not render children when token is absent", () => {
    renderWithRouter(null);
    expect(screen.queryByText("Secret Page")).not.toBeInTheDocument();
  });
});
