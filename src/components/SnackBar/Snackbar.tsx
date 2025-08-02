import { SyntheticEvent } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useAssetManagementContext } from "../../AssetManagement/ContextProvider/ContextProvider";

export default function CustomSnackbar() {
  const { snackBarOptions, setSnackBarOptions } = useAssetManagementContext();

  const handleClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOptions({ ...snackBarOptions, open: false });
  };

  return (
    <div>
      <Snackbar
      anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
        open={snackBarOptions.open}
        autoHideDuration={3500}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackBarOptions.severity}
          
          sx={{ width: "100%" }}
        >
          {snackBarOptions.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
