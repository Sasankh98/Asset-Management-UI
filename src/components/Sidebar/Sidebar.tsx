import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

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
import TimelineIcon from "@mui/icons-material/Timeline";
import RetirementIcon from "@mui/icons-material/Stairs";
import SettingsIcon from "@mui/icons-material/Settings";
import SavingsIcon from "@mui/icons-material/Savings";
import LogoutIcon from "@mui/icons-material/Logout";

import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

// ── helpers ────────────────────────────────────────────────────────────────────

function getEmailFromToken(): string {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? payload.sub ?? "";
  } catch {
    return "";
  }
}

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

// ── navigation ─────────────────────────────────────────────────────────────────

const NAVIGATION: Navigation = [
  {
    segment: "Asset-Management-UI/netWorth",
    title: "Net Worth",
    icon: <AccountBalanceWalletIcon />,
  },
  {
    segment: "Asset-Management-UI/reports",
    title: "Reports",
    icon: <AssessmentIcon />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Portfolios",
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
    kind: "divider",
  },
  {
    kind: "header",
    title: "Cash Flow",
  },
  {
    segment: "Asset-Management-UI/salary",
    title: "Income & Expenses",
    icon: <MoneyIcon />,
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
        title: "EMIs",
        icon: <PaymentIcon />,
      },
    ],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Planning",
  },
  {
    segment: "Asset-Management-UI/goals",
    title: "Goals",
    icon: <FlagCircleIcon />,
  },
  {
    segment: "Asset-Management-UI/calculator",
    title: "Affordability",
    icon: <CalculateIcon />,
  },
  {
    segment: "Asset-Management-UI/projections",
    title: "Projections",
    icon: <TimelineIcon />,
  },
  {
    segment: "Asset-Management-UI/stages",
    title: "Stages",
    icon: <RetirementIcon />,
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

// ── theme ──────────────────────────────────────────────────────────────────────

const sidebarTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});

// ── toolbar actions ────────────────────────────────────────────────────────────

function ToolbarActions() {
  const email = getEmailFromToken();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/Asset-Management-UI/";
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
      {email && (
        <Chip
          avatar={
            <Avatar sx={{ bgcolor: "primary.main", fontSize: 11, fontWeight: 700 }}>
              {initials(email)}
            </Avatar>
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {email}
            </Typography>
          }
          variant="outlined"
          size="small"
          sx={{ maxWidth: 220 }}
        />
      )}
      <Tooltip title="Logout">
        <IconButton size="small" onClick={handleLogout} color="inherit">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ── component ──────────────────────────────────────────────────────────────────

export default function MiniDrawer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const email = getEmailFromToken();

  const session = {
    user: {
      name: email.split("@")[0] ?? "User",
      email,
      image: "",
    },
  };

  const router = {
    push: (path: string) => navigate(path),
    navigate: (url: string | URL) =>
      navigate(typeof url === "string" ? url : url.pathname + url.search),
    currentPath: location.pathname,
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
  };

  return (
    <div data-testid="side-bar-component">
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={sidebarTheme}
        session={session}
        branding={{
          title: "Asset Manager",
          logo: (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
          ),
        }}
      >
        <DashboardLayout
          slots={{
            toolbarActions: ToolbarActions,
          }}
        >
          {children}
        </DashboardLayout>
      </AppProvider>
    </div>
  );
}
