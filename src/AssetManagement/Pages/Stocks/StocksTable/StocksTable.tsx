import { useEffect, useState } from "react";
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
import "./table.css";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { EditStocks, InfoStocks } from "../StocksForms";
import { Stock } from "../../../../../server/types";

type TableRow = (string | number)[];

export default function StocksTable(props: { stocksData: Stock[] }) {
  // Pagination
  const [tableBody, setTableBody] = useState([] as TableRow[]); //
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  // Modals
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [infoData, setInfoData] = useState<any>();
  const [editOpen, setEditOpen] = useState<boolean>(false);

  // Filtering
  // Sorting
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<number | undefined>(undefined);

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

  const handleInfoClick = (row: TableRow) => {
    setInfoOpen(true);
    setInfoData(row);
  };
  const handleInfoClose = () => {
    setInfoOpen(false);
  };
  const handleEditClick = (row: TableRow) => {
    setEditOpen(true);
    setInfoData(row);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };

  useEffect(() => {
    const outerElement: TableRow[] = [];
    const key = Headers.dashboard.map((el) => el.colId);

    props.stocksData?.forEach((element) => {
      const innerElement: (string | number)[] = [];

      key.forEach((elements) => {
        innerElement.push(element[elements as keyof Stock]);
      });
      outerElement.push(innerElement);
    });
    setTableBody(outerElement);
  }, [props.stocksData]);

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
        paddingTop: "2rem",
      }}
    >
      {infoOpen && (
        <InfoStocks
          data={infoData}
          open={infoOpen}
          handleClose={handleInfoClose}
        />
      )}
      {editOpen && (
        <EditStocks
          data={infoData}
          open={editOpen}
          handleClose={handleEditClose}
        />
      )}

      <Grid justifyContent="center">
        <Paper
          sx={{ width: "95%", mb: 2, marginLeft: "2.5%", marginTop: "1.5%" }}
        >
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  {Headers.dashboard.map((row) => (
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
                    {rows.map((row: string | number, index: number) => {
                      return (
                        <>
                          {index === 7 ? (
                            <TableCell key={index}>
                              <IconButton
                                onClick={() => handleInfoClick(rows)}
                                aria-label="info"
                              >
                                <InfoOutlinedIcon />
                              </IconButton>
                            </TableCell>
                          ) : (
                            <>
                              {index === 8 ? (
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
                              )}
                            </>
                          )}
                        </>
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
}
