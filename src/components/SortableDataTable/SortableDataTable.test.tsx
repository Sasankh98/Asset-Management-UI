import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import SortableDataTable from "./SortableDataTable";

const columns = [
  { name: "Name", colId: "name", id: 0 },
  { name: "Amount", colId: "amount", id: 1 },
  { name: "Status", colId: "status" },
];

const rows = [
  ["Alice", 3000, "active"],
  ["Bob", 1000, "sold"],
  ["Charlie", 2000, "active"],
];

describe("SortableDataTable", () => {
  afterEach(() => cleanup());

  it("renders column headers", () => {
    render(<SortableDataTable columns={columns} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(<SortableDataTable columns={columns} rows={rows} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders pagination", () => {
    render(<SortableDataTable columns={columns} rows={rows} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("handles empty rows", () => {
    render(<SortableDataTable columns={columns} rows={[]} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("handles page change", () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => [`Row${i}`, i * 100, "active"]);
    render(<SortableDataTable columns={columns} rows={manyRows} />);
    const nextBtn = screen.getByTitle("Go to next page");
    fireEvent.click(nextBtn);
    expect(screen.getByText("Row5")).toBeInTheDocument();
  });

  it("uses renderCell when provided", () => {
    render(
      <SortableDataTable
        columns={columns}
        rows={rows}
        renderCell={(value, colIndex) => {
          if (colIndex === 2) return <span data-testid="status-cell">{value}</span>;
          return undefined;
        }}
      />
    );
    expect(screen.getAllByTestId("status-cell").length).toBeGreaterThan(0);
  });
});
