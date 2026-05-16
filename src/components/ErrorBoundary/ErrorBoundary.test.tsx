import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const ThrowError = ({ message = "Test error" }: { message?: string }) => {
  throw new Error(message);
};

const ThrowNoMessage = () => {
  throw new Error();
};

describe("ErrorBoundary", () => {
  afterEach(() => cleanup());

  it("catches errors and displays component-level fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something Went Wrong/)).toBeInTheDocument();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">OK</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders custom fallback when provided (fallback prop left side)", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error UI</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.queryByText(/Something Went Wrong/)).not.toBeInTheDocument();
  });

  it("calls onError callback when error is caught", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="callback test" />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "callback test" }),
      expect.anything()
    );
  });

  it("shows error message from error object", () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Specific error msg" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Specific error msg")).toBeInTheDocument();
  });

  it("shows fallback message when error has no message (error?.message || fallback)", () => {
    render(
      <ErrorBoundary>
        <ThrowNoMessage />
      </ErrorBoundary>
    );
    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });

  it("renders global level fallback with Application Error title", () => {
    render(
      <ErrorBoundary level="global">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Application Error/)).toBeInTheDocument();
  });

  it("global level shows Reload Application button (not Try Again)", () => {
    render(
      <ErrorBoundary level="global">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Reload Application")).toBeInTheDocument();
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("global level shows persistent contact support message", () => {
    render(
      <ErrorBoundary level="global">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
  });

  it("component level shows Try Again button (not Reload Application)", () => {
    render(
      <ErrorBoundary level="component">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.queryByText("Reload Application")).not.toBeInTheDocument();
  });

  it("feature level shows Try Again button and no contact support message", () => {
    render(
      <ErrorBoundary level="feature">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.queryByText(/contact support/i)).not.toBeInTheDocument();
  });

  it("clicking Try Again resets error state and re-renders children", () => {
    let shouldThrow = true;
    const MaybeThrow = () => {
      if (shouldThrow) throw new Error("reset test");
      return <div data-testid="recovered">Recovered</div>;
    };

    render(
      <ErrorBoundary level="component">
        <MaybeThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Try Again")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));
    expect(screen.getByTestId("recovered")).toBeInTheDocument();
  });
});