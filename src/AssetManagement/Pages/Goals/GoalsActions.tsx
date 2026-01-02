import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ModalTypes } from "../../../shared/Constants";

interface GoalsActionsProps {
  modalType:ModalTypes;
  handleClose: () => void;
  handleGoals?: () => void;
}
const GoalsActions = ({
  modalType,
  handleClose,
  handleGoals,
}: GoalsActionsProps) => {
  return (
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
          px: 2,
          py: 1,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {modalType === ModalTypes.edit ? "Update Goal" : "Create Goal"}
      </Button>
    </Box>
  );
};

export default GoalsActions;
