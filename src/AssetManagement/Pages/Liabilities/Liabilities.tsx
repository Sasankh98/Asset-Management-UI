import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { type ReactNode } from "react";

interface Loan {
  name: string;
  icon: ReactNode;
  totalAmt: number;
  paidAmt: number;
  emi: number;
  dueDate: string;
  tenureLeft: string;
  color: string;
}

const LOANS: Loan[] = [
  {
    name: "Home Loan · HDFC",
    icon: <HomeIcon />,
    totalAmt: 32.0,
    paidAmt: 8.4,
    emi: 28400,
    dueDate: "5 Jun",
    tenureLeft: "14y left",
    color: "#1976d2",
  },
  {
    name: "Vehicle · SUV",
    icon: <DirectionsCarIcon />,
    totalAmt: 5.4,
    paidAmt: 2.1,
    emi: 12200,
    dueDate: "7 Jun",
    tenureLeft: "2y 3m left",
    color: "#f9a825",
  },
  {
    name: "iPhone 15 EMI",
    icon: <PhoneAndroidIcon />,
    totalAmt: 0.92,
    paidAmt: 0.46,
    emi: 7800,
    dueDate: "12 Jun",
    tenureLeft: "6m left",
    color: "#757575",
  },
  {
    name: "Personal Loan",
    icon: <PersonIcon />,
    totalAmt: 1.5,
    paidAmt: 1.1,
    emi: 9500,
    dueDate: "15 Jun",
    tenureLeft: "5m left",
    color: "#757575",
  },
];

export default function Liabilities() {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }} data-testid="liabilities-container">
      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Loans & EMIs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your outstanding liabilities and repayment progress.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Loan
        </Button>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            Total Debt
          </Typography>
          <Typography variant="h5" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
            ₹38.4L
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            Paid Off
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
            ₹12.1L
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            Monthly EMI
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
            ₹57.9k
          </Typography>
        </Paper>
      </Box>

      {/* Loan cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {LOANS.map((loan, i) => {
          const paidPct = Math.round((loan.paidAmt / loan.totalAmt) * 100);
          return (
            <Paper key={i} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ color: loan.color }}>{loan.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {loan.name}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {loan.tenureLeft}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  ₹{loan.paidAmt}L paid
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={paidPct}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "success.main",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  ₹{loan.totalAmt}L total
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  EMI {loan.emi.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" })} · due {loan.dueDate}
                </Typography>
                <Chip label="Prepay" size="small" variant="outlined" />
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
