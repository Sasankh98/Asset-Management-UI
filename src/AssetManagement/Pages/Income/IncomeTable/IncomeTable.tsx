import { Income } from "../../../../../server/types";
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
} from "@mui/material";
import PaginationBlock from "../../../../core/Pagination/Pagination";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatCurrency } from "../../../../utils/currencyConverter";



const IncomeTable = ({ incomeData }: { incomeData: Income[] }) => {
  // Pagination
  const [tableBody, setTableBody] = useState([] as any[]); //
  const [activePage, setActivePage] = useState<number>(1); //
  const [incomeTypesToDisplayPages, setIncomeTypesToDisplayPages] = useState(
    [] as any[]
  ); //
  
  // Modals
  const [editRow, setEditRow] = useState();
  const [editOpen, setEditOpen] = useState(false);

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

  const getComparator = (order: "asc" | "desc", orderBy: number | undefined) => {
    return order === "desc"
      ? (a: any, b: any) => descendingComparator(a, b, orderBy)
      : (a: any, b: any) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a: any, b: any, orderBy: number | undefined) => {
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

  const handleEditClick = (row:any) => {
    setEditOpen(true);
    setEditRow(row);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };

  useEffect(() => {
    const outerElement = [] as any[];
    let key = Headers.IncomeTable.map((el) => el.colId);

    incomeData?.forEach((element) => {
      const innerElement = [] as any[];

      key.forEach((elements) => {
        if (elements === "amount") {
          innerElement.push(formatCurrency(element[elements] as number));
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
        paddingTop: "2rem",
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
        <TableContainer
          component={Paper}
          sx={{ width: "90%", marginLeft: "5%", marginTop: "1.5%" }}
        >
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
                      direction={row.id !== undefined && orderBy === row.id ? order : "asc"}
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
        <PaginationBlock
          activePage={activePage}
          itemsCountPerPage={6}
          totalItemsCount={
            incomeTypesToDisplay ? incomeTypesToDisplay.length : 10
          }
          pageRangeDisplayed={3}
          onChange={(value: number) => handlePageChange(value)}
          parentClassName={
            "outer-project-container pagination-container-client"
          }
        />
      </Grid>
    </div>
  );
};

export default IncomeTable;
