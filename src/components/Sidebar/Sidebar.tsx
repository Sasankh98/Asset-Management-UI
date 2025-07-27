import * as React from "react";
import { createTheme } from "@mui/material/styles";
import FlagCircleIcon from '@mui/icons-material/FlagCircle'
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import CalculateIcon from '@mui/icons-material/Calculate'
import MoneyIcon from '@mui/icons-material/Money'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import {
  AppProvider,
  type Navigation,
} from "@toolpad/core/AppProvider";
import {
  DashboardLayout,
} from "@toolpad/core/DashboardLayout";

const NAVIGATION: Navigation = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "investments",
    title: "Investments",
    icon: <ShowChartIcon />,
    children: [
      {
        segment: "stocks",
        title: "Stocks",
        icon: <WaterfallChartIcon />,
      },
      {
        segment: "mutualFunds",
        title: "Mutual Funds",
        icon: <CurrencyExchangeIcon />,
      },
      {
        segment: "providentFund",
        title: "Provident Fund",
        icon: <MoneyIcon />,
      },
      {
        segment: "lic",
        title: "LIC",
        icon: <ReceiptIcon />,
      },
    ],
  },
  {
    segment: "calculator",
    title: "Calculator",
    icon: <CalculateIcon />,
  },
  {
    segment: "salary",
    title: "Salary",
    icon: <AccountBalanceIcon />,
    children: [
      {
        segment: "income",
        title: "Income",
        icon: <AttachMoneyIcon />,
      },
      {
        segment: "expenses",
        title: "Expenses",
        icon: <MoneyOffIcon />,
      },
    ],
  },{
    segment: "goals",
    title: "Goals",
    icon: <FlagCircleIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default function DashboardLayoutCustomPageItems({children}: {children?: React.ReactNode}) {

  return (
    <div data-testid = 'side-bar-component'>
      <AppProvider
        navigation={NAVIGATION}
        // router={router}
        theme={demoTheme}
      >
        <DashboardLayout>
         {children}
        </DashboardLayout>
      </AppProvider>
      </div>
  );
}
