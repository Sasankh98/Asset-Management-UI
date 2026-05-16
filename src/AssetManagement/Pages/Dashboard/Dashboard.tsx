import { FC, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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
import {
  type Stock,
  type MutualFund,
} from "../../../../server/types";
import { useDashboardQuery, useNetWorthTrendQuery, useStocksQuery, useMutualFundsQuery } from "../../../hooks/queries";
import {
  MF_TO_ASSET_BUCKET,
  MF_TO_EQUITY_SUB,
  type AssetBucket,
  type EquitySubBucket,
} from "../../../shared/Constants";
import { fmtInr } from "../../../utils/formatCurrency";

// ── colour palettes ───────────────────────────────────────────────────────────

const ASSET_BUCKET_COLOR: Record<AssetBucket, string> = {
  "Equity":         "#1976d2",
  "Debt/Liquid":    "#388e3c",
  "Commodities":    "#f57c00",
  "Real Estate":    "#7b1fa2",
  "Bonds":          "#0097a7",
  "Emergency Fund": "#558b2f",
  "Cash/Other":     "#757575",
};

const EQUITY_SUB_COLOR: Record<EquitySubBucket, string> = {
  "Large Cap":    "#1976d2",
  "Mid Cap":      "#f57c00",
  "Small Cap":    "#d32f2f",
  "Diversified":  "#7b1fa2",
  "International":"#0097a7",
};

// ── allocation builders ───────────────────────────────────────────────────────

type ValueMode = "current" | "invested";

interface Slice { name: string; value: number; color: string; }

function mfValue(f: MutualFund, mode: ValueMode): number {
  return mode === "current" ? Number(f.currentValue ?? 0) : Number(f.invested ?? 0);
}

function stockValue(s: Stock, mode: ValueMode): number {
  if (mode === "current") {
    const mp = Number(s.marketPrice ?? 0);
    return mp > 0 ? mp * Number(s.quantity ?? 0) : Number(s.currentValue ?? 0);
  }
  return Number(s.totalInvested ?? 0);
}

function mfAllocPcts(f: MutualFund) {
  const eq  = Number(f.equityPct       ?? 0);
  const heq = Number(f.hedgedEquityPct ?? 0);
  const debt = Number(f.debtPct        ?? 0);
  const cash = Number(f.cashPct        ?? 0);
  const re   = Number(f.realEstatePct  ?? 0);
  const hasAlloc = eq + heq + debt + cash + re > 0;
  return { eq, heq, debt, cash, re, hasAlloc };
}

function buildAssetSlices(
  stocks: Stock[],
  mfs: MutualFund[],
  mode: ValueMode,
): Slice[] {
  const buckets: Partial<Record<AssetBucket, number>> = {};
  const add = (b: AssetBucket, v: number) => { if (v > 0) buckets[b] = (buckets[b] ?? 0) + v; };

  // Stocks → Equity (using live market price when available)
  stocks
    .filter((s) => s.status === "active")
    .forEach((s) => add("Equity", stockValue(s, mode)));

  // MFs — use per-fund allocation breakdown when present, else category mapping
  mfs.forEach((f) => {
    const val = mfValue(f, mode);
    if (val <= 0) return;
    const { eq, heq, debt, cash, re, hasAlloc } = mfAllocPcts(f);

    if (hasAlloc) {
      // Equity bucket = pure equity + hedged equity (both provide equity exposure)
      add("Equity",      val * (eq + heq) / 100);
      add("Debt/Liquid", val * debt        / 100);
      add("Cash/Other",  val * cash        / 100);
      add("Real Estate", val * re          / 100);
    } else {
      add(MF_TO_ASSET_BUCKET[f.category] ?? "Cash/Other", val);
    }
  });

  const ORDER: AssetBucket[] = [
    "Equity", "Debt/Liquid", "Commodities", "Real Estate",
    "Bonds", "Emergency Fund", "Cash/Other",
  ];

  return ORDER
    .filter((b) => (buckets[b] ?? 0) > 0)
    .map((b) => ({ name: b, value: buckets[b]!, color: ASSET_BUCKET_COLOR[b] }));
}

function buildEquitySubSlices(
  stocks: Stock[],
  mfs: MutualFund[],
  mode: ValueMode,
): Slice[] {
  const buckets: Partial<Record<EquitySubBucket, number>> = {};
  const add = (b: EquitySubBucket, v: number) => { if (v > 0) buckets[b] = (buckets[b] ?? 0) + v; };

  // Stocks categorised by market cap
  stocks
    .filter((s) => s.status === "active")
    .forEach((s) => {
      const sub = (s.category as EquitySubBucket) ?? "Large Cap";
      add(sub, stockValue(s, mode));
    });

  // MFs: extract only the equity portion
  mfs.forEach((f) => {
    const val = mfValue(f, mode);
    if (val <= 0) return;
    const { eq, heq, hasAlloc } = mfAllocPcts(f);

    let equityVal: number;
    if (hasAlloc) {
      equityVal = val * (eq + heq) / 100;
    } else {
      if (MF_TO_ASSET_BUCKET[f.category] !== "Equity") return;
      equityVal = val;
    }

    // Use explicit market-cap breakdown when provided
    const lc = Number(f.largeCapPct ?? 0);
    const mc = Number(f.midCapPct   ?? 0);
    const sc = Number(f.smallCapPct ?? 0);
    if (lc + mc + sc > 0) {
      if (lc > 0) add("Large Cap", val * lc / 100);
      if (mc > 0) add("Mid Cap",   val * mc / 100);
      if (sc > 0) add("Small Cap", val * sc / 100);
      // Remaining equity (hedged or uncategorised) goes to Diversified
      const tagged = val * (lc + mc + sc) / 100;
      if (equityVal - tagged > 0.01) add("Diversified", equityVal - tagged);
    } else {
      const sub = MF_TO_EQUITY_SUB[f.category] ?? "Diversified";
      add(sub, equityVal);
    }
  });

  const ORDER: EquitySubBucket[] = [
    "Large Cap", "Mid Cap", "Small Cap", "Diversified", "International",
  ];

  return ORDER
    .filter((b) => (buckets[b] ?? 0) > 0)
    .map((b) => ({ name: b, value: buckets[b]!, color: EQUITY_SUB_COLOR[b] }));
}

// ── sub-components ────────────────────────────────────────────────────────────

function DonutCard({
  title,
  slices,
  emptyMsg,
  mode,
  onModeChange,
}: {
  title: string;
  slices: Slice[];
  emptyMsg: string;
  mode: ValueMode;
  onModeChange: (m: ValueMode) => void;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
          {title}
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_, v) => { if (v) onModeChange(v as ValueMode); }}
        >
          <ToggleButton value="current" sx={{ px: 1.5, py: 0.25, fontSize: 11 }}>Current</ToggleButton>
          <ToggleButton value="invested" sx={{ px: 1.5, py: 0.25, fontSize: 11 }}>Invested</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {slices.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>{emptyMsg}</Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start", justifyContent: { xs: "center", sm: "flex-start" } }}>
          <Box sx={{ width: { xs: 160, sm: 200 }, height: { xs: 160, sm: 200 }, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {slices.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, props: { payload?: Slice }) => [
                    `${fmtInr(value as number)}  ·  ${total > 0 ? (((value as number) / total) * 100).toFixed(1) : 0}%`,
                    props.payload?.name ?? "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 0.75, pt: 0.5 }}>
            {slices.map((s, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: s.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ flex: 1 }}>{s.name}</Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {fmtInr(s.value)}
                </Typography>
                <Typography variant="caption" fontFamily="monospace" fontWeight={700} sx={{ minWidth: 38, textAlign: "right" }}>
                  {total > 0 ? `${((s.value / total) * 100).toFixed(1)}%` : "—"}
                </Typography>
              </Box>
            ))}
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary">
                Total ({mode}): <b>{fmtInr(total)}</b>
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const Dashboard: FC = () => {
  const theme = useTheme();
  const [assetMode, setAssetMode]   = useState<ValueMode>("current");
  const [equityMode, setEquityMode] = useState<ValueMode>("current");

  const dashQuery   = useDashboardQuery();
  const trendQuery  = useNetWorthTrendQuery("1Y");
  const stocksQuery = useStocksQuery();
  const mfsQuery    = useMutualFundsQuery();

  const data   = dashQuery.data ?? null;
  const trend  = useMemo(() => Array.isArray(trendQuery.data) ? trendQuery.data : [], [trendQuery.data]);
  const stocks = useMemo(() => Array.isArray(stocksQuery.data) ? stocksQuery.data : [], [stocksQuery.data]);
  const mfs    = useMemo(() => Array.isArray(mfsQuery.data)    ? mfsQuery.data    : [], [mfsQuery.data]);
  const loading = dashQuery.isLoading || trendQuery.isLoading || stocksQuery.isLoading || mfsQuery.isLoading;

  const assetSlices  = useMemo(() => buildAssetSlices(stocks, mfs, assetMode),  [stocks, mfs, assetMode]);
  const equitySlices = useMemo(() => buildEquitySubSlices(stocks, mfs, equityMode), [stocks, mfs, equityMode]);

  const trendData = trend.map((s) => ({
    month: new Date(s.snapshotDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    value: parseFloat(String(s.totalNetWorth)) / 1e5,
  }));

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }}>
        <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="25%" height={64} sx={{ mt: 1 }} />
        </Paper>
        {[0, 1].map((i) => (
          <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
            <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
            <Box sx={{ display: "flex", gap: 3 }}>
              <Skeleton variant="circular" width={200} height={200} />
              <Box sx={{ flex: 1 }}>
                {[...Array(5)].map((_, j) => <Skeleton key={j} variant="text" sx={{ mb: 0.75 }} />)}
              </Box>
            </Box>
          </Paper>
        ))}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
          <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }} data-testid="dashboard-container">

      {/* Hero */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: data ? 2 : 0 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
              Total Net Worth
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.1, mt: 0.5 }}>
              {data ? fmtInr(Number(data.totalNetWorth)) : "—"}
            </Typography>
            {data && (
              <Chip
                label={`Savings Rate: ${data.savingsRate}%`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
        {/* Assets − Liabilities = Net */}
        {data && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
                Assets
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.25, fontFamily: "monospace" }}>
                {fmtInr(Number(data.totalAssets))}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
                Liabilities
              </Typography>
              <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.25, fontFamily: "monospace" }}>
                −{fmtInr(Number(data.totalLiabilities))}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
                Net
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.25, fontFamily: "monospace" }}>
                {fmtInr(Number(data.totalNetWorth))}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Asset Allocation donut */}
      <DonutCard
        title="Asset Allocation"
        slices={assetSlices}
        emptyMsg="No allocation data yet — add stocks, mutual funds, or loans to see breakdown."
        mode={assetMode}
        onModeChange={setAssetMode}
      />

      {/* Equity sub-allocation donut */}
      <DonutCard
        title="Equity Allocation — Large / Mid / Small Cap"
        slices={equitySlices}
        emptyMsg="No equity holdings yet — add stocks or equity mutual funds."
        mode={equityMode}
        onModeChange={setEquityMode}
      />

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
              <Tooltip formatter={(value) => [`₹${(value as number).toFixed(1)}L`, "Net Worth"]} />
              <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

    </Box>
  );
};

export default Dashboard;
