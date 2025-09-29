import CustomButton from "../../../../../core/CustomButton/CustomButton";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import { ThemeProvider } from "@mui/material/styles";

import { Theme } from "../../../../../core/MUI/Theme";
import StocksService from "../../../../../services/StocksService/StocksService";
import { Stock } from "../../../../../../server/types";

interface InfoStocksProps {
  open: boolean;
  handleClose: () => void;
  data: any[];
}
const InfoStocks = (props: InfoStocksProps) => {
  const [stockData, setStockData] = useState<Stock | undefined>(undefined);

  useEffect(() => {
      (async () => {
    try {
      const res: any = await StocksService().getStocksByIdDetails(props.data[0]);
      setStockData(res?.data[0]);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    }
  })();
  }, [props.data]);

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
            {stockData && <h2>Stock Details </h2>}

            <Grid container spacing={2}>
              <Grid size={6}></Grid>
              <Grid size={6}></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}></Grid>
              <Grid size={4}></Grid>
              <Grid size={4}></Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 0 }}>
              <Grid size={6}></Grid>
              <Grid size={6}></Grid>
            </Grid>

            <>
              <Grid container spacing={2} sx={{ marginTop: 0 }}>
                <Grid size={4}></Grid>

                <Grid size={4}></Grid>
                <Grid size={4}></Grid>
              </Grid>
              <Grid container spacing={2} sx={{ marginTop: 0 }}>
                <Grid size={6}></Grid>
              </Grid>
            </>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 3,
              }}
            >
              {/* <div>
              <CustomButton
                text={"Submit"}
                customClass={"submit-btn"}
                handleClick={handleSubmit}
              />
            </div> */}
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

export default InfoStocks;
