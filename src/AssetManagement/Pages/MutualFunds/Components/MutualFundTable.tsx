import { MutualFund } from "../../../../../server/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Headers } from "../../../../config/config";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TableSortLabel,
  IconButton,
  TablePagination,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatCurrency } from "../../../../utils/currencyConverter";

interface IncomeTableProps {
  mutualFundDetails: MutualFund[];
  setTransactionFormOpen?: Dispatch<SetStateAction<boolean>>;
  setType?: React.Dispatch<React.SetStateAction<"create" | "edit" | "">>;
  setSelectedTransaction?: Dispatch<SetStateAction<MutualFund | undefined>>;
}
type TableRow = (string | number)[];

const MutualFundTable = ({
  mutualFundDetails,
  //   setTransactionFormOpen,
  //   setType,
  //   setSelectedTransaction,
}: IncomeTableProps) => {
  // Pagination
  const [tableBody, setTableBody] = useState([] as TableRow[]); //
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  // Filtering
  // Sorting
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<number | undefined>(0);

  const handleSortRequest = (cellId: number | undefined) => {
    const isAsc = orderBy === cellId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(cellId);
  };

  const stableSort = (
    array: TableRow[],
    comparator: (a: TableRow, b: TableRow) => number
  ) => {
    const stabilizeThis: [TableRow, number][] = array.map((el, index) => [
      el,
      index,
    ]);
    stabilizeThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order === 0 ? a[1] - b[1] : order;
    });
    return stabilizeThis.map((el) => el[0]);
  };

  const getComparator = (
    order: "asc" | "desc",
    orderBy: number | undefined
  ): ((a: TableRow, b: TableRow) => number) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (
    a: TableRow,
    b: TableRow,
    orderBy: number | undefined
  ) => {
    if (b[orderBy as number] < a[orderBy as number]) {
      return -1;
    }
    if (b[orderBy as number] > a[orderBy as number]) {
      return 1;
    }
    return 0;
  };

  const sortedData = stableSort(tableBody, getComparator(order, orderBy));

  //   const handleEditClick = (row: TableRow) => {
  //     setType("edit");
  //     setTransactionFormOpen(true);
  //     // setSelectedTransaction(row);
  //     setSelectedTransaction(
  //       mutualFundDetails.find((income) => income.id === row[0])
  //     );
  //   };

  useEffect(() => {
    const outerElement: TableRow[] = [];
    const key = Headers.MutualFundTable.map((el) => el.colId);

    mutualFundDetails?.forEach((element) => {
      const innerElement: (string | number)[] = [];

      key.forEach((elements) => {
        if (
          elements === "invested" ||
          elements === "currentValue" ||
          elements === "nav" ||
          elements === "gain_loss"
        ) {
          innerElement.push(formatCurrency(element[elements] as number));
        } else {
          innerElement.push(element[elements as keyof MutualFund]);
        }
      });
      outerElement.push(innerElement);
    });
    setTableBody(outerElement);
  }, [mutualFundDetails]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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
        {/* <Box> */}
        <Paper sx={{ width: "100%", mb: 2 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  {Headers.MutualFundTable.map((row) => (
                    <TableCell
                      className="table-headers"
                      sx={{ color: "white" }}
                      key={row.colId}
                      align="center"
                    >
                      <TableSortLabel
                        active={row.id !== undefined && orderBy === row.id}
                        direction={
                          row.id !== undefined && orderBy === row.id
                            ? order
                            : "asc"
                        }
                        onClick={() => handleSortRequest(row.id)}
                        sx={{
                          "&.Mui-active": {
                            color: "white", // Change this to your desired color
                          },
                          "&.Mui-active .MuiTableSortLabel-icon": {
                            color: "whitesmoke", // Change color of the arrow
                          },
                        }}
                      >
                        {row.name}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rows: TableRow, index: number) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      key={index}
                    >
                      {rows.map((row: string | number, index: number) =>
                        index === 8 ? (
                          <TableCell key={index}>
                            <IconButton
                              //   onClick={() => handleEditClick(rows)}
                              aria-label="info"
                            >
                              <EditOutlinedIcon />
                            </IconButton>
                          </TableCell>
                        ) : index === 6 ? (
                          <TableCell
                            align="center"
                            key={index}
                            style={
                              row.toString().includes("-")
                                ? { color: "red" }
                                : { color: "green" }
                            }
                          >
                            {row}
                          </TableCell>
                        ) : (
                          <TableCell align="center" key={index}>
                            {row}
                          </TableCell>
                        )
                      )}
                      {/* ))} */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tableBody.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </div>
  );
};

export default MutualFundTable;
