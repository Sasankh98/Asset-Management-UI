import { Income } from "../../../../../server/types";
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
import { dateFormat } from "../../../../utils/dateTime";

interface IncomeTableProps {
  incomeData: Income[];
  setIncomeFormOpen: Dispatch<SetStateAction<boolean>>;
  setType: React.Dispatch<React.SetStateAction<"create" | "edit" | "">>;
  setSelectedIncome: Dispatch<SetStateAction<Income | undefined>>;
}

const IncomeTable = ({
  incomeData,
  setIncomeFormOpen,
  setType,
  setSelectedIncome,
}: IncomeTableProps) => {
  // Pagination
  const [tableBody, setTableBody] = useState([] as Income[]); //
  const [activePage, setActivePage] = useState<number>(1); //
  const [incomeTypesToDisplayPages, setIncomeTypesToDisplayPages] = useState(
    [] as Income[]
  ); //

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

  const stableSort = (array: any[], comparator: (a: any, b: any) => number) => {
    const stabilizeThis = array.map((el, index) => [el, index]);
    stabilizeThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order === 0 ? a[1] - b[1] : order;
    });
    return stabilizeThis.map((el) => el[0]);
  };

  const getComparator = (
    order: "asc" | "desc",
    orderBy: number | undefined
  ) => {
    return order === "desc"
      ? (a: any, b: any) => descendingComparator(a, b, orderBy)
      : (a: any, b: any) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (
    a: any,
    b: any,
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

  const sortedData = stableSort(
    incomeTypesToDisplayPages,
    getComparator(order, orderBy)
  );

  const handleEditClick = (row: Income) => {
    setType("edit");
    setIncomeFormOpen(true);
    // setSelectedIncome(row);
    setSelectedIncome(incomeData.find((income) => income.id === row[0]));
  };

  useEffect(() => {
    const outerElement = [] as any[];
    let key = Headers.IncomeTable.map((el) => el.colId);

    incomeData?.forEach((element) => {
      const innerElement = [] as any[];

      key.forEach((elements) => {
        if (elements === "amount") {
          innerElement.push(formatCurrency(element[elements] as number));
        } else if (elements === "date") {
          innerElement.push(dateFormat(element[elements] as string).dateOnly);
        } else {
          innerElement.push(element[elements as keyof Income]);
        }
      });
      outerElement.push(innerElement);
    });
    setTableBody(outerElement);
    setIncomeTypesToDisplayPages(outerElement.slice(0, 6));
  }, [incomeData]);

  const incomeTypesToDisplay = tableBody;
  const handlePageChange = (pageNumber: number) => {
    const startIdx = (pageNumber - 1) * 6;
    const endIdx = pageNumber * 6;

    setIncomeTypesToDisplayPages(incomeTypesToDisplay.slice(startIdx, endIdx));
    setActivePage(pageNumber);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      {/* {editOpen && (
        <EditStocks
          data={infoData}
          open={editOpen}
          handleClose={handleEditClose}
        />
      )} */}
  

      <Grid justifyContent="center">
        {/* <Box> */}
        <Paper
          sx={{ width: "95%", mb: 2, marginLeft: "2.5%", marginTop: "1.5%" }}
        >
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  {Headers.IncomeTable.map((row) => (
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
                {sortedData?.map((rows, index) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    key={index}
                  >
                    {rows.map((row: any, index: number) =>
                      index === 5 ? (
                        <TableCell key={index}>
                          <IconButton
                            onClick={() => handleEditClick(rows)}
                            aria-label="info"
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        </TableCell>
                      ) : (
                        <TableCell align="center" key={index}>
                          {row}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={incomeTypesToDisplay ? incomeTypesToDisplay.length : 10}
            rowsPerPage={5}
            page={activePage - 1}
            onPageChange={(event: unknown, value: number) =>
              handlePageChange(value)
            }
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement>
            ) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </Grid>
    </div>
  );
};

export default IncomeTable;
