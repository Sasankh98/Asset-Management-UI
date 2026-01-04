import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";

import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useState, forwardRef } from "react";
import { Theme } from "../../../../core/MUI/Theme";
import { CreateGoalsDTO, GoalsDTO } from "../../../../../server/types";
import { ModalTypes } from "../../../../shared/Constants";
// import GoalsService from "../../../../services/GoalsService/GoalsService";

interface GoalsFormProps {
  open: boolean;
  modalType: ModalTypes;
  handleClose: () => void;
  goals?: GoalsDTO;
}

export interface GoalsFormRef {
  getFormData: () => CreateGoalsDTO;
}

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

const GoalsForm = forwardRef<GoalsFormRef, GoalsFormProps>((
  {
    modalType,
    goals,
  },
  ref
) => {
  const [goalsData, setGoalsData] = useState<CreateGoalsDTO>({
    goal: "",
    targetAmount: 0,
    savedAmount: 0,
    targetDate: "",
    value: 0,
    user: "Sasankh",
  });

  const handleGoalsData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGoalsData({ ...goalsData, [name]: value });
  };

  // Expose form data through ref
  useEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = {
        getFormData: () => goalsData,
      };
    }
  }, [goalsData, ref]);

  useEffect(() => {
    if (modalType === ModalTypes.edit && goals) {
      setGoalsData({
        goal: goals?.goal || "",
        targetAmount: goals?.targetAmount || 0,
        savedAmount: goals?.savedAmount || 0,
        targetDate: goals?.targetDate || "",
        value: goals?.value || 0,
        user: goals?.user || "Sasankh",
      });
    } else if (modalType === ModalTypes.create) {
      setGoalsData({
        goal: "",
        targetAmount: 0,
        savedAmount: 0,
        targetDate: "",
        value: 0,
        user: "Sasankh",
      });
    }
  }, [modalType, goals]);

  return (
    <ThemeProvider theme={Theme}>
          {/* Progress Indicator for Edit Mode */}
          {modalType === ModalTypes.edit && goalsData?.targetAmount > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Current Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(goalsData?.savedAmount / goalsData?.targetAmount) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    background:
                      "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                  },
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                {(
                  (goalsData?.savedAmount / goalsData?.targetAmount) *
                  100
                ).toFixed(1)}
                % complete
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <GlassTextField
              fullWidth
              label="Goal Name"
              placeholder="e.g., Dream Vacation, New Car"
              value={goalsData?.goal || ""}
              onChange={handleGoalsData}
              name="goal"
              variant="outlined"
            />

            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Target Amount"
                  placeholder="0"
                  value={goalsData?.targetAmount || ""}
                  onChange={handleGoalsData}
                  name="targetAmount"
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
                  label="Current Savings"
                  placeholder="0"
                  value={goalsData?.savedAmount || ""}
                  onChange={handleGoalsData}
                  name="savedAmount"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Target Date"
                  value={goalsData.targetDate || ""}
                  onChange={handleGoalsData}
                  name="targetDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={6}>
                <GlassTextField
                  fullWidth
                  label="Full Value"
                  placeholder="e.g., expected final expenditure"
                  value={goalsData.value || ""}
                  onChange={handleGoalsData}
                  name="value"
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
            </Grid>
          </Box>
    </ThemeProvider>
  );
});

GoalsForm.displayName = "GoalsForm";

export default GoalsForm;
