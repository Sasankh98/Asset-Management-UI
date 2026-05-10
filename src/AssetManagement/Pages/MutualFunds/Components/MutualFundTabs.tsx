import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { SyntheticEvent } from "react";
import { styled } from "@mui/material/styles";

const CustomTabs = styled(Tabs)(({ theme }) => ({
  padding: "0.2rem",
  borderRadius: "3rem",
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[300],
  display: "flex",
  minHeight: "1rem",
  height: "3rem",
  justifyContent: "space-around",
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  borderRadius: "3rem",
  display: "flex",
  flex: 1,
  minHeight: "1.5rem",
  outline: "none",
  boxShadow: "none",
  color: theme.palette.text.secondary,
  "&.Mui-focusVisible": {
    outline: "none",
    boxShadow: "none",
  },
  "&.Mui-selected": {
    outline: "none",
    boxShadow: "none",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 700,
    width: "99%",
    minHeight: "1.5rem",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "none",
  },
}));

interface CenterTabsProps {
  value: number;
  setValue: (value: number) => void;
  labels?: [string, string, string];
}

const CenterTabs = ({
  value,
  setValue,
  labels = ["Overview", "Performance", "Target & Allocation"],
}: CenterTabsProps) => {
  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "95%",
        bgcolor: "background.paper",
        marginLeft: "2.5%",
        borderRadius: "3rem",
      }}
    >
      <CustomTabs value={value} onChange={handleChange} centered textColor="inherit">
        <CustomTab label={labels[0]} />
        <CustomTab label={labels[1]} />
        <CustomTab label={labels[2]} />
      </CustomTabs>
    </Box>
  );
};

export default CenterTabs;
