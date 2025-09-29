import {
  styled,
} from "@mui/material/styles";
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { ThemeProvider } from '@mui/material/styles';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Theme } from "../../../../core/MUI/Theme";
import { CreateGoalsDTO, Goals } from "../../../../../server/types";
import GoalsService from "../../../../services/GoalsService/GoalsService";
import { RefreshDataProps } from "../../../ContextProvider/ContextProvider";

interface GoalsFormProps {
  open: boolean;
  type: "create" | "edit" | "";
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  goals?: Goals | undefined;
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

const GoalsForm = ({
  open,
  type,
  handleClose,
  goals,
  setRefreshData,
}: GoalsFormProps) => {
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

  const handleGoals = async () => {
    if (type === "create") {
      const response = await GoalsService().postGoalsDetails(goalsData);
      if (response) {
        handleClose();
        setRefreshData((prev) => ({
          ...prev,
          refreshGoals: true,
        }));
      }
    } else if (type === "edit" && goals) {
      const response = await GoalsService().updateGoalsDetails(
        goals?.id,
        goalsData
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
    if (type === "edit" && goals) {
      setGoalsData({
        goal: goals?.goal || "",
        targetAmount: goals?.targetAmount || 0,
        savedAmount: goals?.savedAmount || 0,
        targetDate: goals?.targetDate || "",
        value: goals?.value || 0,
        user: goals?.user || "Sasankh",
      });
    } else if (type === "create") {
      setGoalsData({
        goal: "",
        targetAmount: 0,
        savedAmount: 0,
        targetDate: "",
        value: 0,
        user: "Sasankh",
      });
    }
  }, [type, goals]);

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
              {type === "edit" ? "Edit Goal" : "Create New Goal"}
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
                ? "Update your goal details"
                : "Set up a new savings goal"}
            </Typography>
          </Box>

          {/* Progress Indicator for Edit Mode */}
          {type === "edit" && goalsData?.targetAmount > 0 && (
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
              onClick={handleGoals}
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
              {type === "edit" ? "Update Goal" : "Create Goal"}
            </Button>
          </Box>
        </Box>
      </StyledModal>
    </ThemeProvider>
  );
};

export default GoalsForm;
