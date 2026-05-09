import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createTheme } from "@mui/material/styles";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import WaterfallChartIcon from "@mui/icons-material/WaterfallChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import CalculateIcon from "@mui/icons-material/Calculate";
import MoneyIcon from "@mui/icons-material/Money";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HomeIcon from "@mui/icons-material/Home";
import PaymentIcon from "@mui/icons-material/Payment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import SavingsIcon from "@mui/icons-material/Savings";
import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

const NAVIGATION: Navigation = [
  {
    segment: "Asset-Management-UI/netWorth",
    title: "Net Worth",
    icon: <AccountBalanceWalletIcon />,
  },
  {
    segment: "Asset-Management-UI/investments",
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
        icon: <SavingsIcon />,
      },
      {
        segment: "lic",
        title: "LIC",
        icon: <ReceiptIcon />,
      },
    ],
  },
  {
    segment: "Asset-Management-UI/liabilities",
    title: "Liabilities",
    icon: <HomeIcon />,
    children: [
      {
        segment: "loans",
        title: "Loans",
        icon: <AccountBalanceIcon />,
      },
      {
        segment: "emis",
        title: "EMIs & Installments",
        icon: <PaymentIcon />,
      },
    ],
  },
  {
    segment: "Asset-Management-UI/calculator",
    title: "Calculator",
    icon: <CalculateIcon />,
  },
  {
    segment: "Asset-Management-UI/goals",
    title: "Goals",
    icon: <FlagCircleIcon />,
  },
  {
    segment: "Asset-Management-UI/reports",
    title: "Reports",
    icon: <AssessmentIcon />,
  },
  {
    segment: "Asset-Management-UI/salary",
    title: "Salary",
    icon: <MoneyIcon />,
  },
  {
    kind: "divider",
  },
  {
    segment: "Asset-Management-UI/settings",
    title: "Settings",
    icon: <SettingsIcon />,
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

const session = {
  user: {
    name: "Sasankh",
    email: "sasankh1805@gmail.com",
  },
};

export default function DashboardLayoutCustomPageItems({
  children,
}: {
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const router = {
    push: (path: string) => {
      navigate(path);
    },
   navigate: (url: string | URL) => {
      navigate(typeof url === 'string' ? url : url.pathname + url.search);
    },
    currentPath: location.pathname,
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
  };
  return (
    <div data-testid="side-bar-component">
      <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme} session={session}>
        <DashboardLayout>{children}</DashboardLayout>
      </AppProvider>
    </div>
  );
}
