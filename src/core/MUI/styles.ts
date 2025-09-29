import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

export const StyledModal = styled(Modal)({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
});
export const GlassTextField = styled(TextField)(({ theme }) => ({
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
export const GlassSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "rgba(255, 255, 255, 0.9) !important",
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover": {
    background: "rgba(255, 255, 255, 0.15)",
  },
  "&.Mui-focused": {
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
  },
  "& .MuiSelect-icon": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
}));
// Add this styled component for the Menu
export const GlassMenuItem = styled(MenuItem)(() => ({
  color: "rgba(255, 255, 255, 0.9) !important", // Force the text color
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1) !important",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.15) !important",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2) !important",
    },
  },
}));

export const GlassInputLabel = styled(InputLabel)(() => ({
  color: "rgba(255, 255, 255, 0.7)",
  "&.Mui-focused": {
    color: "rgba(255, 255, 255, 0.9)",
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    sx: {
      // Change 'style' to 'sx' for better MUI styling
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      bgcolor: "rgba(30, 30, 30, 0.9)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 2,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      "& .MuiMenuItem-root": {
        color: "rgba(255, 255, 255, 0.9)",
      },
    },
  },
};
