import { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { ThemeProvider } from "@mui/material/styles";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Theme } from "../../../../core/MUI/Theme";
import { CreateMutualFundsDTO, MutualFund } from "../../../../../server/types";
import {
  RefreshDataProps,
  useAssetManagementContext,
} from "../../../ContextProvider/ContextProvider";
import MutualFundService from "../../../../services/MutualFunds/MutualFundsService";
import {
  MutualFundTypes,
} from "../../../../shared/Constants";
import {
  GlassInputLabel,
  GlassMenuItem,
  StyledModal,
  GlassTextField,
  GlassSelect,
  MenuProps,
} from "../../../../core/MUI/styles";

interface SalaryFormProps {
  open: boolean;
  type: "create" | "edit" | "";
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  selectedMutualFund?: MutualFund | undefined;
}

const MutualFundModal = ({
  open,
  type,
  handleClose,
  selectedMutualFund,
  setRefreshData,
}: SalaryFormProps) => {
  const [mutualFundData, setMutualFundData] = useState<CreateMutualFundsDTO>({
    fundName: "",
    category: "",
    invested: 0,
    currentValue: 0,
    units: 0,
    nav: 0,
    targetProgress: 0,
    user: "Sasankh",
  });

  const { setSnackBarOptions } = useAssetManagementContext();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMutualFundData({ ...mutualFundData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    if (name) {
      setMutualFundData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMutualFund = async () => {
    if (type === "create") {
      if (
        !mutualFundData.fundName ||
        !mutualFundData.invested ||
        !mutualFundData.units ||
        !mutualFundData.category
      ) {
        alert("Please fill all fields");
        return;
      }
      const response =
        await MutualFundService().postMutualFundDetails(mutualFundData);
      if (response) {
        handleClose();
        setSnackBarOptions({
          open: true,
          message: "Created Transaction details Successfully",
          severity: "success",
        });
        setRefreshData((prev) => ({
          ...prev,
          refreshMutualFunds: true,
        }));
      }
    } else if (type === "edit" && mutualFundData) {
      const response = await MutualFundService().updateMutualFundDetails(
        selectedMutualFund?.id,
        mutualFundData
      );
      if (response) {
        handleClose();
        setRefreshData((prev) => ({
          ...prev,
          refreshMutualFunds: true,
        }));
      }
    }
  };

  useEffect(() => {
    if (type === "edit" && selectedMutualFund) {
      setMutualFundData({
        fundName: selectedMutualFund?.fundName || "",
        category: selectedMutualFund?.category || "",
        invested: selectedMutualFund?.invested || 0,
        currentValue: selectedMutualFund?.currentValue || 0,
        units: selectedMutualFund?.units || 0,
        nav: selectedMutualFund?.nav || 0,
        targetProgress: selectedMutualFund?.targetProgress || 0,
        user: "Sasankh",
      });
    } else if (type === "create") {
      setMutualFundData({
        fundName: "",
        category: "",
        invested: 0,
        currentValue: 0,
        units: 0,
        nav: 0,
        targetProgress: 0,
        user: "Sasankh",
      });
    }
  }, [type, selectedMutualFund]);
  return (
    <ThemeProvider theme={Theme}>
      <StyledModal open={open} onClose={handleClose}>
        <Box
          sx={{
            // Glassmorphism effect
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)", // Safari support
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,

            // Enhanced shadow for depth
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 6px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,

            // Position and size
            width: { xs: "90%", sm: 600, md: 700 },
            maxHeight: "100vh",
            overflowY: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            // Subtle inner glow
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 4,
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              pointerEvents: "none",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              mb: 3,
              pb: 2,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              mx: -2,
              px: 2,
              pt: 1,
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="600"
              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              {type === "edit"
                ? "Edit Transaction Details"
                : "Create New Transaction Details"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              {type === "edit"
                ? "Update your Transaction details"
                : "Set up a new Transaction source"}
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <FormControl fullWidth>
              <GlassInputLabel id="customer-id-label">
                Select Mutual Fund Category
              </GlassInputLabel>

              <GlassSelect
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                defaultValue={mutualFundData?.category || ""}
                value={mutualFundData?.category || ""}
                onChange={handleSelectChange}
                label="category"
                name="category"
                MenuProps={MenuProps}
              >
                {MutualFundTypes.map((enumTypes) => (
                  <GlassMenuItem value={enumTypes.value} key={enumTypes.value}>
                    {enumTypes.name}
                  </GlassMenuItem>
                ))}
              </GlassSelect>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={12}>
                <GlassTextField
                  fullWidth
                  label="Mutual Fund Name"
                  placeholder="e.g., HDFC Equity Fund"
                  value={mutualFundData?.fundName || ""}
                  onChange={handleInputChange}
                  name="fundName"
                  type="text"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Invested Amount"
                  placeholder="0"
                  value={mutualFundData?.invested || 0}
                  onChange={handleInputChange}
                  name="invested"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Current Value"
                  value={mutualFundData?.currentValue || 0}
                  onChange={handleInputChange}
                  name="currentValue"
                  type="number"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="NAV"
                  placeholder="0"
                  value={mutualFundData?.nav || 0}
                  onChange={handleInputChange}
                  name="nav"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Units Purchased"
                  value={mutualFundData?.units || 0}
                  onChange={handleInputChange}
                  name="units"
                  type="number"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Target Amount"
                  placeholder="0"
                  value={mutualFundData?.targetProgress || 0}
                  onChange={handleInputChange}
                  name="targetProgress"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="User"
                  value={mutualFundData?.user || ""}
                  onChange={handleInputChange}
                  name="user"
                  type="text"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              data-testid="handle-mutual-fund-button"
              onClick={handleMutualFund}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              {type === "edit" ? "Update Mutual Fund" : "Create Mutual Fund"}
            </Button>
          </Box>
        </Box>
      </StyledModal>
    </ThemeProvider>
  );
};

export default MutualFundModal;
