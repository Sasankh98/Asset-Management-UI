import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import { useEffect, useState, useImperativeHandle } from "react";
import type React from "react";
import { CreateGoalsDTO, GoalsDTO } from "../../../../../server/types";
import { ModalTypes } from "../../../../shared/Constants";
import { GlassTextField } from "../../../../core/MUI/styles";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";

export interface GoalsFormRef {
  getFormData: () => CreateGoalsDTO;
}

interface GoalsFormProps {
  open: boolean;
  modalType: ModalTypes;
  handleClose: () => void;
  goals?: GoalsDTO;
  ref?: React.Ref<GoalsFormRef>;
}

const GoalsForm = ({ modalType, goals, ref }: GoalsFormProps) => {
    const { name: currentUserName } = useCurrentUser();
    const [goalsData, setGoalsData] = useState<CreateGoalsDTO>({
      goal: "",
      targetAmount: 0,
      savedAmount: 0,
      targetDate: "",
      value: 0,
      user: "",
    });

    const handleGoalsData = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setGoalsData({ ...goalsData, [name]: value });
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => goalsData,
    }), [goalsData]);

    useEffect(() => {
      if (modalType === ModalTypes.edit && goals) {
        setGoalsData({
          goal: goals?.goal || "",
          targetAmount: goals?.targetAmount || 0,
          savedAmount: goals?.savedAmount || 0,
          targetDate: goals?.targetDate || "",
          value: goals?.value || 0,
          user: goals?.user || currentUserName,
        });
      } else if (modalType === ModalTypes.create) {
        setGoalsData({
          goal: "",
          targetAmount: 0,
          savedAmount: 0,
          targetDate: "",
          value: 0,
          user: currentUserName,
        });
      }
    }, [modalType, goals, currentUserName]);

    return (
      <>
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
      </>
    );
};

export default GoalsForm;
