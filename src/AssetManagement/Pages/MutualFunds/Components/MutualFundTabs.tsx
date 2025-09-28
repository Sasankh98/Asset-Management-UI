import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { SyntheticEvent } from "react";
import { styled } from "@mui/material/styles";

const CustomTabs = styled(Tabs)({
  padding: "0.2rem 0rem",
  borderRadius: "3rem",
  backgroundColor: "#ada7a7ff",
  display: "flex",
  color: "#000",
  minHeight:"1rem",
  height:"3rem",
  justifyContent: "space-around",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const CustomTab = styled(Tab)({
  borderRadius: "3rem",
  display: "flex",
  flex: 1,
  minHeight:"1.5rem",
  outline: "none", // remove outline
  boxShadow: "none", // remove box-shadow
  "&.Mui-focusVisible": {
    outline: "none",
    boxShadow: "none",
  },
  "&.Mui-selected": {
    outline: "none",
    boxShadow: "none",
    backgroundColor: "#f3ececff",
    width:"99%",
    minHeight: "1.5rem",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "none",
  },
});

interface MutualFundTabsProps {
  value: number;
  setValue: (value:number)=> void;
}
const CenterTabs = ({value, setValue}: MutualFundTabsProps) => {

  const handleChange = (event: SyntheticEvent, newValue: number) => {
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
