import CustomButton from "../../../../../core/CustomButton/CustomButton";
import { useEffect, useState } from "react";
import { Box, Grid, Modal, ThemeProvider } from "@mui/material";
import { Theme } from "../../../../../core/MUI/Theme";
import { callAPI } from "../../../../../services/apiServices";
import { ConfigMethod, ConfigUrl } from "../../../../../config/ConfigAPI";

interface InfoStocksProps {
  open: boolean;
  handleClose: () => void;
  data: any[];
}
const InfoStocks = (props: InfoStocksProps) => {
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    callAPI(ConfigUrl.StocksById, ConfigMethod.postMethod, {
      id: props.data[0],
    }).then((res) => {
      // setIdData(res.data[0])
      setStockData((prev) => ({
        ...prev,
        ...res.data[0],
      }));
    });
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
            <h2>Stock Details </h2>

            <Grid container item xs={12} spacing={2}>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}></Grid>
            </Grid>
            <Grid container item xs={12} spacing={2}>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}></Grid>
            </Grid>
            <Grid container item xs={12} spacing={2} sx={{ marginTop: 0 }}>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}></Grid>
            </Grid>

            <>
              <Grid container item xs={12} spacing={2} sx={{ marginTop: 0 }}>
                <Grid item xs={4}></Grid>

                <Grid item xs={4}></Grid>
                <Grid item xs={4}></Grid>
              </Grid>
              <Grid container item xs={12} spacing={2} sx={{ marginTop: 0 }}>
                <Grid item xs={6}></Grid>
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
