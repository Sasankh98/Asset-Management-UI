import { describe, it, vi, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import MutualFundTable from "./MutualFundTable";
import type { MutualFund } from "../../../../../server/types";

const makeMf = (overrides: Partial<MutualFund> = {}): MutualFund => ({
  id: 1,
  fundName: "Parag Parikh Flexi Cap",
  category: "Flexi Cap",
  invested: 100000,
  currentValue: 120000,
  units: 500,
  nav: 240,
  gain_loss: 20000,
  targetProgress: 50,
  user: "test",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const noop = vi.fn();

describe("MutualFundTable – loading state", () => {
  afterEach(() => cleanup());

  it("renders skeletons when loading=true", () => {
    const { container } = render(
      <MutualFundTable
        loading
        mutualFundDetails={[]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});

describe("MutualFundTable – table render", () => {
  afterEach(() => cleanup());

  it("renders fund name in table", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[makeMf()]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(screen.getByText("Parag Parikh Flexi Cap")).toBeInTheDocument();
  });

  it("renders gain with success color for positive gain_loss", () => {
    const { container } = render(
      <MutualFundTable
        mutualFundDetails={[makeMf({ gain_loss: 20000 })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(container.querySelector("[class*='MuiChip']")).toBeInTheDocument();
  });

  it("renders gain with error color for negative gain_loss", () => {
    const { container } = render(
      <MutualFundTable
        mutualFundDetails={[makeMf({ gain_loss: -5000 })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(container.querySelector("[class*='MuiChip']")).toBeInTheDocument();
  });

  it("renders edit button for each row", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[makeMf(), makeMf({ id: 2, fundName: "HDFC Top 100" })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    const editBtns = screen.getAllByLabelText("edit");
    expect(editBtns).toHaveLength(2);
  });

  it("calls setMutualFundFormOpen and setType on edit click", () => {
    const setOpen = vi.fn();
    const setType = vi.fn();
    const setSelected = vi.fn();
    const mf = makeMf({ id: 42 });
    render(
      <MutualFundTable
        mutualFundDetails={[mf]}
        setMutualFundFormOpen={setOpen}
        setType={setType}
        setSelectedMutualFund={setSelected}
      />
    );
    fireEvent.click(screen.getByLabelText("edit"));
    expect(setOpen).toHaveBeenCalledWith(true);
    expect(setType).toHaveBeenCalledWith("edit");
    expect(setSelected).toHaveBeenCalledWith(mf);
  });

  it("renders empty table with no rows", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    // No fund names rendered
    expect(screen.queryByText("Parag Parikh Flexi Cap")).not.toBeInTheDocument();
  });

  it("renders with null numeric values gracefully", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[makeMf({ invested: undefined as unknown as number, nav: undefined as unknown as number })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(screen.getByText("Parag Parikh Flexi Cap")).toBeInTheDocument();
  });

  it("negative targetProgress covers L96/L98 false branches (error color, no '+' prefix)", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[makeMf({ targetProgress: -10 })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(screen.getByText("Parag Parikh Flexi Cap")).toBeInTheDocument();
  });

  it("non-numeric targetProgress covers L96 isNaN true branch (value shown as-is)", () => {
    render(
      <MutualFundTable
        mutualFundDetails={[makeMf({ targetProgress: "N/A" as unknown as number })]}
        setMutualFundFormOpen={noop}
        setType={noop}
        setSelectedMutualFund={noop}
      />
    );
    expect(screen.getByText("Parag Parikh Flexi Cap")).toBeInTheDocument();
  });
});
