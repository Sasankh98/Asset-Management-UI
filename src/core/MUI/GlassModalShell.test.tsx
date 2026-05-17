import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GlassModalShell from "./GlassModalShell";

const noop = vi.fn();

describe("GlassModalShell", () => {
  afterEach(() => cleanup());

  it("renders title and subtitle", () => {
    render(
      <GlassModalShell
        open={true}
        onClose={noop}
        title="Test Modal"
        subtitle="Test subtitle"
        confirmLabel="Save"
        onConfirm={noop}
        onRecurringChange={noop}
        recurring={true}
      >
        <div>Content</div>
      </GlassModalShell>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Test subtitle")).toBeInTheDocument();
  });

  it("renders confirmLabel on button when not loading", () => {
    render(
      <GlassModalShell
        open={true}
        onClose={noop}
        title="T"
        subtitle="S"
        confirmLabel="Confirm"
        onConfirm={noop}
        onRecurringChange={noop}
        recurring={false}
      >
        <div />
      </GlassModalShell>
    );
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("shows Processing... when isLoading=true (L138 true branch)", () => {
    render(
      <GlassModalShell
        open={true}
        onClose={noop}
        title="T"
        subtitle="S"
        confirmLabel="Save"
        onConfirm={noop}
        isLoading={true}
        onRecurringChange={noop}
        recurring={false}
      >
        <div />
      </GlassModalShell>
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("renders Box placeholder when onRecurringChange=null (L85 false branch)", () => {
    render(
      <GlassModalShell
        open={true}
        onClose={noop}
        title="T"
        subtitle="S"
        confirmLabel="Save"
        onConfirm={noop}
      >
        <div>Child</div>
      </GlassModalShell>
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("recurring=undefined covers recurring ?? false right branch (L89)", () => {
    render(
      <GlassModalShell
        open={true}
        onClose={noop}
        title="T"
        subtitle="S"
        confirmLabel="Save"
        onConfirm={noop}
        onRecurringChange={noop}
      >
        <div />
      </GlassModalShell>
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
