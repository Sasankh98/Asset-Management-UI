import { FC } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";

const ALLOCATION_DATA = [
  { name: "Mutual Funds", value: 29, color: "#1976d2" },
  { name: "Real Estate", value: 26, color: "#f9a825" },
  { name: "Stocks", value: 21, color: "#388e3c" },
  { name: "PF + LIC", value: 13, color: "#d32f2f" },
  { name: "Cash + FD + Gold", value: 11, color: "#757575" },
];

const NET_WORTH_TREND = [
  { month: "Jun", value: 62 },
  { month: "Jul", value: 64 },
  { month: "Aug", value: 63 },
  { month: "Sep", value: 67 },
  { month: "Oct", value: 70 },
  { month: "Nov", value: 71 },
  { month: "Dec", value: 73 },
  { month: "Jan", value: 76 },
  { month: "Feb", value: 75 },
  { month: "Mar", value: 79 },
  { month: "Apr", value: 82 },
  { month: "May", value: 84.7 },
];

const Dashboard: FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }} data-testid="dashboard-container">
      {/* Hero — net worth + monthly change */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 1, textTransform: "uppercase" }}
            >
              Total Net Worth
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.1, mt: 0.5 }}>
              ₹ 84,72,150
            </Typography>
          </Box>
          <Chip label="▲ +1.4% this month" color="success" size="small" sx={{ mt: 1 }} />
        </Box>
      </Paper>

      {/* Allocation donut + legend */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Asset Allocation
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ALLOCATION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ALLOCATION_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Allocation"]} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ flex: 1, minWidth: 160 }}>
            {ALLOCATION_DATA.map((item, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "2px",
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                  {item.value}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* 12-month net worth trend */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Net Worth · 12 Months
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={NET_WORTH_TREND}
            margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}L`}
              domain={["auto", "auto"]}
            />
            <Tooltip formatter={(value) => [`₹${value}L`, "Net Worth"]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={theme.palette.success.main}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Summary: Assets / Liabilities / Savings Rate */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AccountBalanceIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 0.8, textTransform: "uppercase" }}
            >
              Assets
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>
            ₹84.7L
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <TrendingDownIcon sx={{ fontSize: 18, color: "error.main" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 0.8, textTransform: "uppercase" }}
            >
              Liabilities
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="error.main">
            ₹38.4L
          </Typography>
        </Paper>
        <Paper
          elevation={2}
          sx={{ p: 2.5, borderRadius: 2, bgcolor: "success.light" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <SavingsIcon sx={{ fontSize: 18, color: "success.dark" }} />
            <Typography
              variant="caption"
              sx={{ color: "success.dark", letterSpacing: 0.8, textTransform: "uppercase" }}
            >
              Savings Rate
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="success.dark">
            32%
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
