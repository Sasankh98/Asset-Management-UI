import { useState } from "react";

export type TableRow = (string | number)[];

function descendingComparator(
  a: TableRow,
  b: TableRow,
  orderBy: number | undefined
): number {
  if (b[orderBy as number] < a[orderBy as number]) return -1;
  if (b[orderBy as number] > a[orderBy as number]) return 1;
  return 0;
}

function stableSort(
  array: TableRow[],
  comparator: (a: TableRow, b: TableRow) => number
): TableRow[] {
  const stabilized: [TableRow, number][] = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order === 0 ? a[1] - b[1] : order;
  });
  return stabilized.map((el) => el[0]);
}

export function useTableSort() {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<number | undefined>(0);

  const handleSortRequest = (cellId: number | undefined) => {
    const isAsc = orderBy === cellId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(cellId);
  };

  const sortRows = (rows: TableRow[]): TableRow[] => {
    const comparator =
      order === "desc"
        ? (a: TableRow, b: TableRow) => descendingComparator(a, b, orderBy)
        : (a: TableRow, b: TableRow) => -descendingComparator(a, b, orderBy);
    return stableSort(rows, comparator);
  };

  return { order, orderBy, handleSortRequest, sortRows };
}
