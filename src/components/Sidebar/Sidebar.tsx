import * as React from "react";
import { createTheme } from "@mui/material/styles";
import {
  Dashboard,
  AttachMoney,
  Receipt,
  Calculate,
  MoneyOff,
  AccountBalance,
  Money,
  CurrencyExchange,
  ShowChart,
  WaterfallChart,
  FlagCircle,
} from "@mui/icons-material";
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
    icon: <Dashboard />,
  },
  {
    segment: "investments",
    title: "Investments",
    icon: <ShowChart />,
    children: [
      {
        segment: "stocks",
        title: "Stocks",
        icon: <WaterfallChart />,
      },
      {
        segment: "mutualFunds",
        title: "Mutual Funds",
        icon: <CurrencyExchange />,
      },
      {
        segment: "providentFund",
        title: "Provident Fund",
        icon: <Money />,
      },
      {
        segment: "lic",
        title: "LIC",
        icon: <Receipt />,
      },
    ],
  },
  {
    segment: "calculator",
    title: "Calculator",
    icon: <Calculate />,
  },
  {
    segment: "salary",
    title: "Salary",
    icon: <AccountBalance />,
    children: [
      {
        segment: "income",
        title: "Income",
        icon: <AttachMoney />,
      },
      {
        segment: "expenses",
        title: "Expenses",
        icon: <MoneyOff />,
      },
    ],
  },{
    segment: "goals",
    title: "Goals",
    icon: <FlagCircle />,
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
      <AppProvider
        navigation={NAVIGATION}
        // router={router}
        theme={demoTheme}
      >
        <DashboardLayout>
         {children}
        </DashboardLayout>
      </AppProvider>
  );
}
