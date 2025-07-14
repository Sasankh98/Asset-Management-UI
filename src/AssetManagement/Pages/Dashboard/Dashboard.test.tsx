import { beforeEach, describe, test,  vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Dashboard />);
  });

  test("renders Dashboard component", () => {
    expect(screen.getByTestId("dashboard-container")).toBeInTheDocument();
  });

});
