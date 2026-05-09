import { type ReactNode } from "react";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import Grid from "@mui/material/Grid";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useState } from "react";
import { useTableSort, type TableRow as DataRow } from "../../hooks/useTableSort";

export interface ColumnDef {
  name: string;
  colId: string;
  id?: number;
}

interface SortableDataTableProps {
  columns: ColumnDef[];
  rows: DataRow[];
  /**
   * Return a ReactNode to override the default text cell for a given column index.
   * Return undefined to fall back to the default centered text cell.
   */
  renderCell?: (
    value: string | number,
    colIndex: number,
    row: DataRow
  ) => ReactNode | undefined;
}

export default function SortableDataTable({
  columns,
  rows,
  renderCell,
}: SortableDataTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const { order, orderBy, handleSortRequest, sortRows } = useTableSort();

  const sortedRows = sortRows(rows);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <Grid justifyContent="center">
        <Paper
          sx={{ width: "95%", mb: 2, marginLeft: "2.5%", marginTop: "1.5%" }}
        >
          <TableContainer component={Paper}>
            <Table aria-label="data table">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      className="table-headers"
                      sx={{ color: "white" }}
                      key={col.colId}
                      align="center"
                    >
                      <TableSortLabel
                        active={col.id !== undefined && orderBy === col.id}
                        direction={
                          col.id !== undefined && orderBy === col.id
                            ? order
                            : "asc"
                        }
                        onClick={() => handleSortRequest(col.id)}
                        sx={{
                          "&.Mui-active": { color: "white" },
                          "&.Mui-active .MuiTableSortLabel-icon": {
                            color: "whitesmoke",
                          },
                        }}
                      >
                        {col.name}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, rowIndex) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      key={rowIndex}
                    >
                      {row.map((cell, colIndex) => {
                        const custom = renderCell?.(cell, colIndex, row);
                        if (custom !== undefined) {
                          return <TableCell key={colIndex}>{custom}</TableCell>;
                        }
                        return (
                          <TableCell align="center" key={colIndex}>
                            {cell}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </div>
  );
}
