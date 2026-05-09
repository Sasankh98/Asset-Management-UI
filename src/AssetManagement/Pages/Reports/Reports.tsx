import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";

const PERIODS = ["1M", "3M", "1Y", "5Y", "All"] as const;
type Period = (typeof PERIODS)[number];

const NET_WORTH_DATA: Record<Period, { m: string; value: number }[]> = {
  "1M": [
    { m: "Apr 26", value: 82 },
    { m: "May 26", value: 84.7 },
  ],
  "3M": [
    { m: "Mar 26", value: 79 },
    { m: "Apr 26", value: 82 },
    { m: "May 26", value: 84.7 },
  ],
  "1Y": [
    { m: "Jun", value: 62 },
    { m: "Jul", value: 64 },
    { m: "Aug", value: 63 },
    { m: "Sep", value: 67 },
    { m: "Oct", value: 70 },
    { m: "Nov", value: 71 },
    { m: "Dec", value: 73 },
    { m: "Jan", value: 76 },
    { m: "Feb", value: 75 },
    { m: "Mar", value: 79 },
    { m: "Apr", value: 82 },
    { m: "May", value: 84.7 },
  ],
  "5Y": [
    { m: "2022", value: 40 },
    { m: "2023", value: 52 },
    { m: "2024", value: 68 },
    { m: "2025", value: 76 },
    { m: "2026", value: 84.7 },
  ],
  All: [
    { m: "2020", value: 18 },
    { m: "2021", value: 28 },
    { m: "2022", value: 40 },
    { m: "2023", value: 52 },
    { m: "2024", value: 68 },
    { m: "2025", value: 76 },
    { m: "2026", value: 84.7 },
  ],
};

const ALLOCATION_HISTORY = [
  { m: "Jun", mf: 20, stocks: 16, re: 22, pf: 10, other: 8 },
  { m: "Aug", mf: 21, stocks: 17, re: 22, pf: 10, other: 8 },
  { m: "Oct", mf: 22, stocks: 18, re: 22, pf: 11, other: 9 },
  { m: "Dec", mf: 23, stocks: 18, re: 22, pf: 11, other: 9 },
  { m: "Feb", mf: 24, stocks: 19, re: 22, pf: 11, other: 9 },
  { m: "Apr", mf: 24.5, stocks: 18.2, re: 22, pf: 11.3, other: 8.7 },
];

const ALLOCATION_LEGEND = [
  { label: "Mutual Funds", color: "#1976d2", key: "mf" },
  { label: "Stocks", color: "#388e3c", key: "stocks" },
  { label: "Real Estate", color: "#f9a825", key: "re" },
  { label: "PF + LIC", color: "#d32f2f", key: "pf" },
  { label: "Other", color: "#757575", key: "other" },
];

// Option B — monthly statements
const MONTHS = ["Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26"];
const STATEMENT_ROWS = [
  [62.0, 8.4, 18.2, 22.0, 11.0],
  [64.2, 9.1, 18.9, 22.0, 11.2],
  [63.8, 9.6, 17.8, 22.0, 11.4],
  [67.3, 10.8, 19.4, 22.5, 11.6],
  [70.1, 11.5, 20.8, 22.5, 11.8],
  [84.7, 12.5, 24.5, 22.5, 11.9],
];
const STATEMENT_COLS = ["Net Worth", "MFs", "Stocks", "Real Estate", "Other"];

// Option C — insight cards
const INSIGHTS = [
  {
    icon: <CheckCircleOutlineIcon />,
    title: "Best month yet",
    desc: "May 2026 added ₹2.0L to net worth — your highest single-month gain.",
    color: "success.main",
    bgcolor: "success.light",
    action: "View",
  },
  {
    icon: <WarningAmberIcon />,
    title: "SBI Small Cap dragging",
    desc: "Down 3.4% over 6 months while peers gained 8%+. Review or exit?",
    color: "warning.main",
    bgcolor: "warning.light",
    action: "Review",
  },
  {
    icon: <EmojiEventsOutlinedIcon />,
    title: "Crossed ₹50L liquid",
    desc: "Excluding real estate, your liquid net worth is now ₹62L.",
    color: "primary.main",
    bgcolor: "primary.light",
    action: "Share",
  },
  {
    icon: <BarChartIcon />,
    title: "Top mover: Parag Parikh",
    desc: "+18.4% YTD. Single-handedly contributed ₹2.4L to gains.",
    color: "success.main",
    bgcolor: "success.light",
    action: "Open",
  },
  {
    icon: <WarningAmberIcon />,
    title: "Cash sitting idle",
    desc: "₹4.2L in savings >2 months. Consider sweep-FD or liquid fund.",
    color: "error.main",
    bgcolor: "error.light",
    action: "Move",
  },
];

export default function Reports() {
  const [period, setPeriod] = useState<Period>("1Y");
  const theme = useTheme();

  return (
    <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }} data-testid="reports-container">
      {/* ── Option A: Chart-Heavy ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Performance
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {PERIODS.map((p) => (
            <Chip
              key={p}
              label={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? "filled" : "outlined"}
              color={period === p ? "primary" : "default"}
              size="small"
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Box>

      {/* KPI boxes */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            Returns · 1Y
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
            +11.4%
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            XIRR
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
            13.2%
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 1, textTransform: "uppercase" }}
            >
              vs NIFTY 50
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
            +2.1%
          </Typography>
        </Paper>
      </Box>

      {/* Net worth trend line */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Net Worth · {period}
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={NET_WORTH_DATA[period]}
            margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
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

      {/* Allocation shift stacked bar chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 2, letterSpacing: 1, textTransform: "uppercase" }}
        >
          Allocation Shift (₹L)
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={ALLOCATION_HISTORY}
            margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}L`}
            />
            <Tooltip formatter={(value, name) => [`₹${value}L`, name]} />
            <Bar dataKey="mf" stackId="a" fill="#1976d2" name="Mutual Funds" />
            <Bar dataKey="stocks" stackId="a" fill="#388e3c" name="Stocks" />
            <Bar dataKey="re" stackId="a" fill="#f9a825" name="Real Estate" />
            <Bar dataKey="pf" stackId="a" fill="#d32f2f" name="PF + LIC" />
            <Bar dataKey="other" stackId="a" fill="#757575" name="Other" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
          {ALLOCATION_LEGEND.map((item) => (
            <Box key={item.key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: item.color }} />
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* ── Option B: Monthly Statements ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Monthly Statements
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
            CSV
          </Button>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
            PDF
          </Button>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "100px repeat(5, 1fr)",
            px: 2,
            py: 1,
            bgcolor: "action.hover",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" fontFamily="monospace" color="text.secondary">
            MONTH
          </Typography>
          {STATEMENT_COLS.map((col) => (
            <Typography
              key={col}
              variant="caption"
              fontFamily="monospace"
              color="text.secondary"
              align="right"
            >
              {col.toUpperCase()}
            </Typography>
          ))}
        </Box>

        {MONTHS.map((month, i) => (
          <Box
            key={month}
            sx={{
              display: "grid",
              gridTemplateColumns: "100px repeat(5, 1fr)",
              px: 2,
              py: 1.5,
              borderBottom:
                i < MONTHS.length - 1
                  ? `1px solid ${theme.palette.divider}`
                  : "none",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="body2">{month}</Typography>
            {STATEMENT_ROWS[i].map((val, j) => (
              <Typography
                key={j}
                variant="body2"
                fontFamily="monospace"
                align="right"
                fontWeight={j === 0 ? 600 : 400}
              >
                {val}L
              </Typography>
            ))}
          </Box>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderTop: `2px solid ${theme.palette.divider}`,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="body2" color="text.secondary" fontFamily="monospace">
            6-MONTH CHANGE
          </Typography>
          <Typography variant="body2" fontFamily="monospace" color="success.main" fontWeight={600}>
            + ₹22.7L (+36.6%)
          </Typography>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* ── Option C: Insight Cards ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Insights · May 2026
        </Typography>
        <Button size="small" variant="text">
          Refresh
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        5 insights this month · sorted by impact
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {INSIGHTS.map((ins, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: ins.bgcolor,
              border: `1px solid`,
              borderColor: ins.color,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box sx={{ color: ins.color, mt: 0.25 }}>{ins.icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {ins.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {ins.desc}
              </Typography>
            </Box>
            <Button size="small" variant="outlined" sx={{ whiteSpace: "nowrap", alignSelf: "center" }}>
              {ins.action}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
