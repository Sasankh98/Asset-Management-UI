import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { SyntheticEvent } from "react";
import { styled } from "@mui/material/styles";

const CustomTabs = styled(Tabs)(({ theme }) => ({
  padding: "0.2rem",
  borderRadius: "3rem",
  backgroundColor: theme.palette.action.selected,
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
    width: "99%",
    minHeight: "1.5rem",
    boxShadow: theme.shadows[1],
  },
  "&:focus": {
    outline: "none",
    boxShadow: "none",
  },
}));

interface MutualFundTabsProps {
  value: number;
  setValue: (value:number)=> void;
}
const CenterTabs = ({value, setValue}: MutualFundTabsProps) => {

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
      <CustomTabs
        value={value}
        onChange={handleChange}
        centered
        textColor="inherit"
      >
        <CustomTab
          label="Overview"
        />
        <CustomTab
          label="Performance"
        />
        <CustomTab
          label="Target & Allocation"
        />
      </CustomTabs>
    </Box>
  );
};
export default CenterTabs;
