import { describe, it, vi, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FeatureErrorFallback } from "./FeatureErrorFallback";

describe("FeatureErrorFallback", () => {
  afterEach(() => cleanup());

  it("displays the feature name in the heading", () => {
    render(
      <FeatureErrorFallback
        featureName="Dashboard"
        error={null}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText("Dashboard Failed to Load")).toBeInTheDocument();
  });

  it("displays the error message when an error is provided", () => {
    render(
      <FeatureErrorFallback
        featureName="Goals"
        error={new Error("Network timeout")}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  it("displays fallback text when error is null", () => {
    render(
      <FeatureErrorFallback
        featureName="Goals"
        error={null}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });

  it("calls onReset when Retry button is clicked", () => {
    const onReset = vi.fn();
    render(
      <FeatureErrorFallback featureName="Test" error={null} onReset={onReset} />
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
