import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";

vi.mock("@toolpad/core/AppProvider", () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@toolpad/core/DashboardLayout", () => ({
  DashboardLayout: ({ children, slots }: { children: React.ReactNode; slots?: { toolbarActions?: React.ComponentType } }) => (
    <div>
      {slots?.toolbarActions && React.createElement(slots.toolbarActions)}
      {children}
    </div>
  ),
}));

import MiniDrawer from "./Sidebar";

function makeJwt(payload: object): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.sig`;
}

function renderSidebar(children?: React.ReactNode) {
  return render(
    <BrowserRouter>
      <MiniDrawer>{children}</MiniDrawer>
    </BrowserRouter>
  );
}

describe("Sidebar – getEmailFromToken branches", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { cleanup(); sessionStorage.clear(); });

  it("renders sidebar container", () => {
    renderSidebar();
    expect(screen.getByTestId("side-bar-component")).toBeInTheDocument();
  });

  it("no token → email chip not shown (email='' false branch)", () => {
    // sessionStorage is empty → getEmailFromToken returns ""
    renderSidebar();
    // No email chip should be rendered (email && false branch)
    expect(screen.queryByRole("button", { name: /logout/i })).toBeInTheDocument();
    // No chip with email text
    const chip = screen.queryByText(/@/);
    expect(chip).not.toBeInTheDocument();
  });

  it("token with payload.email → chip shows email", () => {
    sessionStorage.setItem("token", makeJwt({ email: "test@example.com" }));
    renderSidebar();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("token with payload.sub but no email → chip shows sub", () => {
    sessionStorage.setItem("token", makeJwt({ sub: "user@sub.com" }));
    renderSidebar();
    expect(screen.getByText("user@sub.com")).toBeInTheDocument();
  });

  it("token with neither email nor sub → returns '' (no chip)", () => {
    sessionStorage.setItem("token", makeJwt({ role: "admin" }));
    renderSidebar();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("invalid/malformed token → catch returns '' (no chip)", () => {
    sessionStorage.setItem("token", "not.a.valid.jwt.at.all");
    renderSidebar();
    // catch returns "" → no email chip
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("renders children inside layout", () => {
    renderSidebar(<div data-testid="child-content">Hello</div>);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
