import { FC, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
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
import { type DashboardData, type NetWorthSnapshot } from "../../../../server/types";
import DashboardService from "../../../services/DashboardService/DashboardService";
import ReportsService from "../../../services/ReportsService/ReportsService";

function fmtInr(val: number): string {
  if (Math.abs(val) >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
  if (Math.abs(val) >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const COLORS = ["#1976d2", "#388e3c", "#7b1fa2", "#d32f2f", "#757575"];

const Dashboard: FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [trend, setTrend] = useState<NetWorthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      DashboardService().getDashboard(),
      ReportsService().getNetWorthTrend("1Y"),
    ]).then(([dash, snapshots]) => {
      setData(dash);
      setTrend(snapshots);
    }).finally(() => setLoading(false));
  }, []);

  const alloc = data?.allocation;
  const totalAllocated = alloc
    ? (alloc.mutualFunds + alloc.stocks + alloc.pfAndLic + alloc.liabilities) || 1
    : 1;

  const allocSlices = alloc
    ? [
        { name: "Mutual Funds", value: alloc.mutualFunds, color: COLORS[0] },
        { name: "Stocks",       value: alloc.stocks,      color: COLORS[1] },
        { name: "PF + LIC",     value: alloc.pfAndLic,    color: COLORS[2] },
        { name: "Liabilities",  value: alloc.liabilities, color: COLORS[3] },
      ].filter((s) => s.value > 0)
    : [];

  const trendData = trend.map((s) => ({
    month: new Date(s.snapshotDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    value: parseFloat(String(s.totalNetWorth)) / 1e5,
  }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }} data-testid="dashboard-container">
      {/* Hero */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
              Total Net Worth
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.1, mt: 0.5 }}>
              {data ? fmtInr(Number(data.totalNetWorth)) : "—"}
            </Typography>
          </Box>
          {data && (
            <Chip
              label={`Monthly EMI: ${fmtInr(Number(data.totalMonthlyEmi))}`}
              color="default"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Paper>

      {/* Allocation donut */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}>
          Asset Allocation
        </Typography>
        {allocSlices.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No allocation data yet — add stocks, mutual funds, or loans to see breakdown.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocSlices} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                    {allocSlices.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [fmtInr(value), "Value"]} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ flex: 1, minWidth: 160 }}>
              {allocSlices.map((item, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: item.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{item.name}</Typography>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                    {((item.value / totalAllocated) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Net worth trend */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}>
          Net Worth · 12 Months
        </Typography>
        {trendData.length < 2 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No snapshot history yet — snapshots recorded from the Reports page will appear here.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}L`} domain={["auto", "auto"]} />
              <Tooltip formatter={(value: number) => [`₹${value.toFixed(1)}L`, "Net Worth"]} />
              <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Summary KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AccountBalanceIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.8, textTransform: "uppercase" }}>Assets</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>{data ? fmtInr(Number(data.totalAssets)) : "—"}</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <TrendingDownIcon sx={{ fontSize: 18, color: "error.main" }} />
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.8, textTransform: "uppercase" }}>Liabilities</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="error.main">
            {data ? fmtInr(Number(data.totalLiabilities)) : "—"}
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, bgcolor: "success.light" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <SavingsIcon sx={{ fontSize: 18, color: "success.dark" }} />
            <Typography variant="caption" sx={{ color: "success.dark", letterSpacing: 0.8, textTransform: "uppercase" }}>Savings Rate</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="success.dark">
            {data ? `${data.savingsRate}%` : "—"}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
