import { styled } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { ThemeProvider } from "@mui/material/styles";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Theme } from "../../../../core/MUI/Theme";
import { CreateIncomeDTO, Income } from "../../../../../server/types";
import { RefreshDataProps } from "../../../ContextProvider/ContextProvider";
import IncomeService from "../../../../services/IncomeService/IncomeService";

interface IncomeFormProps {
  open: boolean;
  type: "create" | "edit" | "";
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  selectedIncome?: Income | undefined;
}
const StyledModal = styled(Modal)({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
});
const GlassTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "rgba(255, 255, 255, 0.9)",
    "& fieldset": {
      border: "none",
    },
    "&:hover": {
      background: "rgba(255, 255, 255, 0.15)",
    },
    "&.Mui-focused": {
      background: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-focused": {
      color: "rgba(255, 255, 255, 0.9)",
    },
  },
}));

const IncomeForm = ({
  open,
  type,
  handleClose,
  selectedIncome,
  setRefreshData,
}: IncomeFormProps) => {
  const [incomeData, setIncomeData] = useState<CreateIncomeDTO>({
    incomeType: "",
    amount: 0,
    date: "",
    user: "Sasankh",
  });

  const handleIncomeData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIncomeData({ ...incomeData, [name]: value });
  };

  const handleIncome = async () => {
    if (type === "create") {

      if (!incomeData.incomeType || !incomeData.amount || !incomeData.date) {
        alert("Please fill all fields");
        return;
      }
      const response = await IncomeService().postIncomeDetails(incomeData);
      if (response) {
        handleClose();
        setRefreshData((prev) => ({
          ...prev,
          refreshIncome: true,
        }));
      }
    } else if (type === "edit" && incomeData) {
      const response = await IncomeService().updateIncomeDetails(
        selectedIncome?.id,
        incomeData
      );
      if (response) {
        handleClose();
        setRefreshData((prev) => ({
          ...prev,
          refreshGoals: true,
        }));
      }
    }
  };

  useEffect(() => {
    if (type === "edit" && selectedIncome) {
console.log(selectedIncome,"........",selectedIncome?.incomeType,type)

      setIncomeData({
        incomeType: selectedIncome?.incomeType || "",
        amount: selectedIncome?.amount || 0,
        date: selectedIncome?.date || "",
        user: selectedIncome?.user || "Sasankh",
      });
    } else if (type === "create") {
console.log(selectedIncome,"........",type)

      setIncomeData({
        incomeType: "",
        amount: 0,
        date: "",
        user: "Sasankh",
      });
    }
  }, [type, selectedIncome]);
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
            maxHeight: "90vh",
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
              {type === "edit" ? "Edit Income Details" : "Create New Income Details"}
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
                ? "Update your income details"
                : "Set up a new income source"}
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <GlassTextField
              fullWidth
              label="Income Type"
              placeholder="e.g., Salary, Interest"
              value={incomeData?.incomeType || ""}
              onChange={handleIncomeData}
              name="incomeType"
              variant="outlined"
            />

            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Amount"
                  placeholder="0"
                  value={incomeData?.amount || ""}
                  onChange={handleIncomeData}
                  name="amount"
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
                  label="Credited Date"
                  value={incomeData?.date || ""}
                  onChange={handleIncomeData}
                  name="date"
                  type="date"
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
              data-testid="handle-goals-button"
              onClick={handleIncome}
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
              {type === "edit" ? "Update Income" : "Create Income"}
            </Button>
          </Box>
        </Box>
      </StyledModal>
    </ThemeProvider>
  );
};

export default IncomeForm;
