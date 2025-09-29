import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { ConfigMethod, ConfigUrl } from "../../../../../config/ConfigAPI";
import CustomButton from "../../../../../core/CustomButton/CustomButton";
import { Theme } from "../../../../../core/MUI/Theme";
import React, { useEffect, useState } from "react";
import { callAPI } from "../../../../../services/apiServices";
import "./editStocks.css";

interface EditStocksProps {
  open: boolean;
  handleClose: () => void;
  data: any[];
}
const EditStocks = (props: EditStocksProps) => {
  // const [loader,setLoader] = useState(false)
  const [stocksData, setStocksData] = useState({
    id: "",
    stockName: "",
    avg: "",
    quantity: "",
    buyTax: "",
    marketPrice: "",
    sellPrice: "",
    dividends: "",
    sellTax: "",
    sellDate: "",
    status: "",
    buyDate:""
  });

  const handleEditStocks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setStocksData({ ...stocksData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
  // event.target.value is the new value.
  // MUI's Select target may not have exact HTMLInputElement typing for .name,
  // so cast to access name safely:
  const target = event.target as HTMLInputElement & { name?: string };
  const name = target.name;
  const value = event.target.value;
  if (!name) return;
  setStocksData((prev) => ({ ...prev, [name]: value }));
};

  useEffect(() => {
    callAPI(ConfigUrl.StocksById, ConfigMethod.postMethod, {
      id: props.data[0],
    }).then((res) => {
      // setIdData(res.data[0])
      setStocksData((prev) => ({
        ...prev,
        ...res.data[0],
      }));
    });
  }, [props.data]);

  const handleSubmit = async () => {
    // setLoader(true)
    console.log(stocksData);
    try {
      const response = await callAPI(
        `${ConfigUrl.Stocks}/?id=${stocksData?.id}&stockName=${stocksData?.stockName}`,
        ConfigMethod.patchMethod,
        stocksData
      );
      if (response) props.handleClose();
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <ThemeProvider theme={Theme}>
        <Modal open={props.open} onClose={props.handleClose}>
          <Box
            sx={{
              bgcolor: "background.paper",
              width: 700,
              boxShadow: 24,
              p: 4,
              position: "absolute",
              borderRadius: "2%",
              top: "20%",
              left: "28%",
              //   transform:"translate(-50%,-50%)"
            }}
          >
            <h2>Update Existing Stocks</h2>

            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="customer-id-label" shrink>
                    Stock Status
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={stocksData.status || "NA"}
                    onChange={handleSelectChange}
                    label="Status"
                    name="status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="sold">Sold</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Stock Name"
                  fullWidth
                  disabled
                  placeholder="Enter Share Name"
                  onChange={handleEditStocks}
                  // defaultValue={stocksData.stockName}
                  value={stocksData.stockName}
                  name="stockName"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField
                  label="Average Price"
                  placeholder="Enter Average Price"
                  value={stocksData.avg}
                  // defaultValue={stocksData.avg}
                  onChange={handleEditStocks}
                  name="avg"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Stock Quantity"
                  placeholder="Enter Stock Quantity"
                  value={stocksData.quantity}
                  onChange={handleEditStocks}
                  name="quantity"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Buying Tax"
                  placeholder="Enter Buying Tax"
                  value={stocksData.buyTax}
                  onChange={handleEditStocks}
                  name="buyTax"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 0 }}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  type="date"
                  placeholder="Buy Date"
                  value={stocksData.buyDate}
                  onChange={handleEditStocks}
                  name="buyDate"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  disabled
                  value="sasankh"
                  //   placeholder="Enter Stock Quantity"
                  //   onChange={handleEditStocks}
                  name="user"
                />
              </Grid>
            </Grid>

            <>
              <Grid container spacing={2} sx={{ marginTop: 0 }}>
                <Grid size={4}>
                  <TextField
                    placeholder="Enter Sell Price"
                    value={stocksData.sellPrice}
                    onChange={handleEditStocks}
                    name="sellPrice"
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    placeholder="Enter Selling Tax"
                    value={stocksData.sellTax}
                    onChange={handleEditStocks}
                    name="sellTax"
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    placeholder="Enter Dividends"
                    value={stocksData.dividends}
                    onChange={handleEditStocks}
                    name="dividends"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ marginTop: 0 }}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="date"
                    value={stocksData.sellDate}
                    onChange={handleEditStocks}
                    name="sellDate"
                    placeholder="Sell Date"
                  />
                </Grid>
              </Grid>
            </>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 3,
              }}
            >
              <div>
                <CustomButton
                  text={"Submit"}
                  customClass={"submit-btn"}
                  handleClick={handleSubmit}
                />
              </div>
              <div>
                <CustomButton
                  text={"Close"}
                  customClass={"close-btn"}
                  handleClick={props.handleClose}
                />
              </div>
            </Box>
          </Box>
        </Modal>
      </ThemeProvider>
    </div>
  );
};

export default EditStocks;
