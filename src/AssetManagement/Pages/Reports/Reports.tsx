import { useState } from "react";
import { type NetWorthSnapshot } from "../../../../server/types";
import { useNetWorthTrendQuery, useAllocationQuery, useStatementsQuery } from "../../../hooks/queries";
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
import Skeleton from "@mui/material/Skeleton";

const PERIODS = ["1M", "3M", "1Y", "5Y", "All"] as const;
type Period = (typeof PERIODS)[number];


const ALLOCATION_LEGEND = [
  { label: "Mutual Funds", color: "#1976d2", key: "mf" },
  { label: "Stocks", color: "#388e3c", key: "stocks" },
  { label: "Real Estate", color: "#f9a825", key: "re" },
  { label: "PF + LIC", color: "#d32f2f", key: "pf" },
  { label: "Other", color: "#757575", key: "other" },
];

// Option C — insight cards
const INSIGHTS = [
  {
    icon: <CheckCircleOutlineIcon />,
    title: "Best month yet",
    desc: "May 2026 added ₹2.0L to net worth — your highest single-month gain.",
    color: "success.main",
    action: "View",
  },
  {
    icon: <WarningAmberIcon />,
    title: "SBI Small Cap dragging",
    desc: "Down 3.4% over 6 months while peers gained 8%+. Review or exit?",
    color: "warning.main",
    action: "Review",
  },
  {
    icon: <EmojiEventsOutlinedIcon />,
    title: "Crossed ₹50L liquid",
    desc: "Excluding real estate, your liquid net worth is now ₹62L.",
    color: "primary.main",
    action: "Share",
  },
  {
    icon: <BarChartIcon />,
    title: "Top mover: Parag Parikh",
    desc: "+18.4% YTD. Single-handedly contributed ₹2.4L to gains.",
    color: "success.main",
    action: "Open",
  },
  {
    icon: <WarningAmberIcon />,
    title: "Cash sitting idle",
    desc: "₹4.2L in savings >2 months. Consider sweep-FD or liquid fund.",
    color: "error.main",
    action: "Move",
  },
];

function toL(val: number) { return (Number(val) / 1e5).toFixed(1); }

function snapshotsToTrend(snaps: NetWorthSnapshot[]) {
  return snaps.map((s) => ({
    m: new Date(s.snapshotDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    value: parseFloat(toL(Number(s.totalNetWorth))),
  }));
}

function snapshotsToAlloc(snaps: NetWorthSnapshot[]) {
  return snaps.map((s) => ({
    m: new Date(s.snapshotDate).toLocaleDateString("en-IN", { month: "short" }),
    mf: parseFloat(toL(Number(s.mutualFunds))),
    stocks: parseFloat(toL(Number(s.stocks))),
    re: parseFloat(toL(Number(s.realEstate))),
    pf: parseFloat(toL(Number(s.pfAndLic))),
    other: parseFloat(toL(Number(s.other))),
  }));
}

export default function Reports() {
  const [period, setPeriod] = useState<Period>("1Y");
  const theme = useTheme();

  const trendQuery      = useNetWorthTrendQuery(period);
  const allocQuery      = useAllocationQuery();
  const statementsQuery = useStatementsQuery(12);

  const trendRaw   = trendQuery.data ?? [];
  const allocRaw   = allocQuery.data ?? [];
  const statements = statementsQuery.data ?? [];

  const trendData = trendRaw.length > 0 ? snapshotsToTrend(trendRaw) : [];
  const allocData = allocRaw.length > 0 ? snapshotsToAlloc(allocRaw) : [];

  if (trendQuery.isLoading) {
    return (
      <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Skeleton variant="text" width={160} height={36} />
          <Box sx={{ display: "flex", gap: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={40} height={28} />
            ))}
          </Box>
        </Box>
        {/* KPI boxes */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
        {/* Charts */}
        <Skeleton variant="rounded" height={260} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={260} sx={{ mb: 2 }} />
        {/* Statements table */}
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

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
        {trendData.length < 2 ? (
          <Box sx={{ py: 3, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.15, display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
              <BarChartIcon sx={{ color: "primary.main", opacity: 10 }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Start tracking your journey</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: "auto", mb: 2, lineHeight: 1.6 }}>
              Snapshots are point-in-time photos of your net worth. Enable auto-snapshots so this chart fills in automatically each month.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
              <Button size="small" variant="contained" startIcon={<BarChartIcon />}>Take Snapshot Now</Button>
              <Button size="small" variant="outlined">Enable Auto-Snapshot</Button>
            </Box>
          </Box>
        ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={trendData}
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
        )}
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
        {allocData.length < 2 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center", fontStyle: "italic" }}>
            Take at least 2 monthly snapshots to see allocation shift over time.
          </Typography>
        ) : (
        <>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={allocData}
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
        </>
        )}
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
        {statements.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No statements yet. Record monthly snapshots to see your history here.
          </Typography>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "120px repeat(5, 1fr)", px: 2, py: 1, bgcolor: "action.hover", borderBottom: `1px solid ${theme.palette.divider}` }}>
              {["MONTH", "NET WORTH", "MFs", "STOCKS", "PF+LIC", "LIABILITIES"].map((col) => (
                <Typography key={col} variant="caption" fontFamily="monospace" color="text.secondary" align={col === "MONTH" ? "left" : "right"}>{col}</Typography>
              ))}
            </Box>
            {statements.map((s, i) => (
              <Box key={s.id} sx={{ display: "grid", gridTemplateColumns: "120px repeat(5, 1fr)", px: 2, py: 1.5, borderBottom: i < statements.length - 1 ? `1px solid ${theme.palette.divider}` : "none", "&:hover": { bgcolor: "action.hover" } }}>
                <Typography variant="body2">{new Date(s.snapshotDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}</Typography>
                {[s.totalNetWorth, s.mutualFunds, s.stocks, s.pfAndLic, s.totalLiabilities].map((val, j) => (
                  <Typography key={j} variant="body2" fontFamily="monospace" align="right" fontWeight={j === 0 ? 600 : 400}>{toL(Number(val))}L</Typography>
                ))}
              </Box>
            ))}
            {statements.length >= 2 && (() => {
              const first = Number(statements[0].totalNetWorth);
              const last  = Number(statements[statements.length - 1].totalNetWorth);
              const diff  = last - first;
              const pct   = first ? ((diff / first) * 100).toFixed(1) : "0";
              return (
                <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, py: 1.5, borderTop: `2px solid ${theme.palette.divider}`, bgcolor: "action.hover" }}>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">{statements.length}-MONTH CHANGE</Typography>
                  <Typography variant="body2" fontFamily="monospace" color={diff >= 0 ? "success.main" : "error.main"} fontWeight={600}>
                    {diff >= 0 ? "+" : ""}₹{toL(Math.abs(diff))}L ({diff >= 0 ? "+" : ""}{pct}%)
                  </Typography>
                </Box>
              );
            })()}
          </>
        )}
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
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: "4px solid",
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
