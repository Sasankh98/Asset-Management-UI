import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ProgressTracker from "./ProgressTracker";

describe("ProgressTracker", () => {
  afterEach(() => {
    cleanup();
  });

  it("displays 50.0% for half-complete progress", () => {
    render(<ProgressTracker currentValue={50} targetValue={100} />);
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("displays 0.0% when currentValue is 0", () => {
    render(<ProgressTracker currentValue={0} targetValue={100} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("displays 100.0% when fully achieved", () => {
    render(<ProgressTracker currentValue={200} targetValue={200} />);
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("displays a decimal percentage correctly", () => {
    render(<ProgressTracker currentValue={1} targetValue={3} />);
    expect(screen.getByText("33.3%")).toBeInTheDocument();
  });
});
