import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ModalTypes } from "../../../shared/Constants";

const GoalFormTitle = ({ modalType }: { modalType: ModalTypes }) => {
  return (
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
        {modalType === ModalTypes.edit ? "Edit Goal" : "Create New Goal"}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.5,
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {modalType === ModalTypes.edit
          ? "Update your goal details"
          : "Set up a new savings goal"}
      </Typography>
    </Box>
  );
};

export default GoalFormTitle;
