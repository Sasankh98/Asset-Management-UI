import  { useEffect, useState } from "react";
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
import "./table.css";
import PaginationBlock from "../../../../core/Pagination/Pagination";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { EditStocks, InfoStocks } from "../StocksForms";

interface StocksTableProps {
  stocksData: any[];
}
export default function StocksTable(props:StocksTableProps) {
  // Pagination
  const [tableBody, setTableBody] = useState([]); //
  const [activePage, setActivePage] = useState(1); //
  const [stocksToDisplayPages, setStocksToDisplayPages] = useState([]); //

  // Modals
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState();
  const [editOpen, setEditOpen] = useState(false);

  // Filtering
  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(0);

  const handleSortRequest = (cellId) => {
    const isAsc = orderBy === cellId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(cellId);
  };

  const stableSort = (array, comparator) => {
    const stabilizeThis = array.map((el, index) => [el, index]);
    stabilizeThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      return order === 0 ? a[1] - b[1] : order;
    });
    return stabilizeThis.map((el) => el[0]);
  };

  const getComparator = (order:string, orderBy:string) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const sortedData = stableSort(
    stocksToDisplayPages,
    getComparator(order, orderBy)
  );

  const handleInfoClick = (row) => {
    setInfoOpen(true);
    setInfoData(row);
  };
  const handleInfoClose = () => {
    setInfoOpen(false);
  };
  const handleEditClick = (row) => {
    setEditOpen(true);
    setInfoData(row);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };

  useEffect(() => {
    const outerElement = [];
    let key = Headers.dashboard.map((el) => el.colId);

    props.stocksData?.forEach((element) => {
      const innerElement = [];

      key.forEach((elements) => {
        innerElement.push(element[elements]);
      });
      outerElement.push(innerElement);
    });
    setTableBody(outerElement);
    setStocksToDisplayPages(outerElement.slice(0, 6));
  }, [props.stocksData]);

  const stocksToDisplay = tableBody;
  const handlePageChange = (pageNumber: number) => {
    const startIdx = (pageNumber - 1) * 6;
    const endIdx = pageNumber * 6;

    setStocksToDisplayPages(stocksToDisplay.slice(startIdx, endIdx));
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
        <TableContainer
          component={Paper}
          sx={{ width: "90%", marginLeft: "5%", marginTop: "1.5%" }}
        >
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
                      active={orderBy === row.id}
                      direction={orderBy === row.id ? order : "asc"}
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
                  {rows.map((row, index) => {
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
        {/* {stocksToDisplayPages ? ( */}
        <PaginationBlock
          activePage={activePage}
          itemsCountPerPage={6}
          totalItemsCount={stocksToDisplay ? stocksToDisplay.length : 10}
          pageRangeDisplayed={3}
          onChange={(value) => handlePageChange(value)}
          parentClassName={
            "outer-project-container pagination-container-client"
          }
        />
        {/* ) : null} */}
      </Grid>
    </div>
  );
}
