import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import {
  useMutualFundsQuery,
  useStocksQuery,
  useLicQuery,
  useProvidentFundQuery,
  useDashboardQuery,
} from "../../../hooks/queries";
import { fmtInr } from "../../../utils/formatCurrency";
import { MF_TO_ASSET_BUCKET } from "../../../shared/Constants";

// ── types ─────────────────────────────────────────────────────────────────────

type ShowMode = "both" | "nominal" | "real";

interface Holding {
  id: string;
  name: string;
  subLabel: string;
  bucket: "mfEquity" | "pf" | "lic" | "stocks" | "other";
  currentValue: number;
  returnRate: number;
  color: string;
}

interface ChartPoint {
  year: string;
  mfEquity: number;
  pf: number;
  lic: number;
  stocks: number;
  other: number;
  nominalTotal: number;
  realTotal: number;
}

// ── constants ─────────────────────────────────────────────────────────────────

const HORIZONS = [5, 10, 15, 20, 30] as const;

const MF_RETURN: Record<string, number> = {
  "Large Cap": 0.11,
  "Mid Cap": 0.12,
  "Small Cap": 0.13,
  "Multi Cap": 0.12,
  "Flexi Cap": 0.12,
  "ELSS": 0.12,
  "Index Fund": 0.11,
  "ETF": 0.11,
  "Sectoral": 0.12,
  "Hybrid": 0.10,
  "Balanced Advantage": 0.10,
  "International": 0.10,
  "Debt": 0.065,
  "Liquid": 0.065,
  "Arbitrage": 0.065,
  "Gold": 0.08,
  "Silver": 0.08,
  "Real Estate": 0.07,
  "Bond": 0.075,
  "Emergency Fund": 0.065,
  "Other": 0.065,
};

const BUCKET_COLOR: Record<Holding["bucket"], string> = {
  mfEquity: "#4FC3F7",
  stocks:   "#ffa726",
  pf:       "#4caf50",
  lic:      "#9575cd",
  other:    "#78909c",
};

const BUCKET_LABEL: Record<Holding["bucket"], string> = {
  mfEquity: "Mutual Funds",
  stocks:   "Stocks",
  pf:       "Provident Fund",
  lic:      "Insurance (LIC)",
  other:    "Cash & Debt",
};

// ── math helpers ──────────────────────────────────────────────────────────────

function fv(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + rate, years);
}

function realFv(pv: number, rate: number, years: number, inflation: number) {
  return fv(pv, rate, years) / Math.pow(1 + inflation, years);
}

function realCagr(rate: number, inflation: number) {
  return (1 + rate) / (1 + inflation) - 1;
}

function toL(v: number) {
  return Math.round(v / 1000) / 100;
}

// ── chart data builder ────────────────────────────────────────────────────────

function buildChartData(holdings: Holding[], horizonYears: number, inflation: number): ChartPoint[] {
  const steps = Math.min(horizonYears, 10);
  const yearStep = Math.max(1, Math.floor(horizonYears / steps));
  const years: number[] = [0];
  for (let y = yearStep; y <= horizonYears; y += yearStep) {
    years.push(y);
  }
  if (years[years.length - 1] !== horizonYears) years.push(horizonYears);

  return years.map((y) => {
    let mfEquity = 0, pf = 0, lic = 0, stocks = 0, other = 0;
    for (const h of holdings) {
      const projected = fv(h.currentValue, h.returnRate, y);
      switch (h.bucket) {
        case "mfEquity": mfEquity += projected; break;
        case "pf":       pf += projected; break;
        case "lic":      lic += projected; break;
        case "stocks":   stocks += projected; break;
        default:         other += projected; break;
      }
    }
    const nominalTotal = mfEquity + pf + lic + stocks + other;
    const realTotal = nominalTotal / Math.pow(1 + inflation, y);
    return {
      year: y === 0 ? "Now" : `+${y}y`,
      mfEquity: toL(mfEquity),
      pf: toL(pf),
      lic: toL(lic),
      stocks: toL(stocks),
      other: toL(other),
      nominalTotal: toL(nominalTotal),
      realTotal: toL(realTotal),
    };
  });
}

// ── sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ rate, inflation, color }: { rate: number; inflation: number; color: string }) {
  const pts = [0, 5, 10, 15, 20].map((y) => fv(1, rate, y));
  const realPts = [0, 5, 10, 15, 20].map((y) => realFv(1, rate, y, inflation));
  const maxV = Math.max(...pts);
  const normalize = (v: number) => 20 - (v / maxV) * 18;
  const nomPath = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * 17 + 2} ${normalize(v)}`).join(" ");
  const realColor = realCagr(rate, inflation) >= 0 ? "#4caf50" : "#ef5350";
  const realPath = realPts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * 17 + 2} ${normalize(v)}`).join(" ");
  return (
    <svg width="72" height="22" viewBox="0 0 72 22">
      <path d={nomPath} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={realPath} fill="none" stroke={realColor} strokeWidth="1.2" strokeDasharray="3 2" />
    </svg>
  );
}

// ── inflation stepper ─────────────────────────────────────────────────────────

function InflationStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <IconButton size="small" onClick={() => onChange(Math.max(0.01, value - 0.005))} sx={{ borderRadius: 0, p: "4px" }}>
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography variant="caption" fontFamily="monospace" sx={{ px: 1, minWidth: 44, textAlign: "center" }}>
        {(value * 100).toFixed(1)}%
      </Typography>
      <IconButton size="small" onClick={() => onChange(Math.min(0.15, value + 0.005))} sx={{ borderRadius: 0, p: "4px" }}>
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function Projections() {
  const theme = useTheme();
  const [horizon, setHorizon] = useState(20);
  const [inflation, setInflation] = useState(0.06);
  const [showMode, setShowMode] = useState<ShowMode>("both");

  const mfQuery  = useMutualFundsQuery();
  const stQuery  = useStocksQuery();
  const licQuery = useLicQuery();
  const pfQuery  = useProvidentFundQuery();
  const dashQ    = useDashboardQuery();

  const isLoading = mfQuery.isLoading || stQuery.isLoading || licQuery.isLoading || pfQuery.isLoading;

  // ── build holdings list from live data ──────────────────────────────────────

  const holdings = useMemo<Holding[]>(() => {
    const result: Holding[] = [];

    // Mutual Funds — one row per fund
    for (const mf of mfQuery.data ?? []) {
      const cv = Number(mf.currentValue ?? 0);
      if (cv <= 0) continue;
      const bucket = MF_TO_ASSET_BUCKET[mf.category];
      const isEquity = bucket === "Equity" || bucket === "Commodities";
      result.push({
        id: `mf-${mf.id}`,
        name: mf.fundName,
        subLabel: `${mf.category} · MF`,
        bucket: isEquity ? "mfEquity" : "other",
        currentValue: cv,
        returnRate: MF_RETURN[mf.category] ?? 0.10,
        color: BUCKET_COLOR[isEquity ? "mfEquity" : "other"],
      });
    }

    // Stocks — aggregate all active into one row
    const stocksTotal = (stQuery.data ?? [])
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const mp = Number(s.marketPrice ?? 0);
        return sum + (mp > 0 ? mp * Number(s.quantity ?? 0) : Number(s.currentValue ?? 0));
      }, 0);
    if (stocksTotal > 0) {
      result.push({
        id: "stocks",
        name: "Equity Stocks",
        subLabel: `${(stQuery.data ?? []).filter((s) => s.status === "active").length} holdings · blended`,
        bucket: "stocks",
        currentValue: stocksTotal,
        returnRate: 0.12,
        color: BUCKET_COLOR.stocks,
      });
    }

    // Provident Fund — EPF balance at current rate
    const pf = pfQuery.data;
    if (pf) {
      const pfBalance = Number(pf.currentBalance ?? 0);
      const pfRate = Number(pf.rate ?? 8.25) / 100;
      if (pfBalance > 0) {
        result.push({
          id: "pf",
          name: "EPF + VPF",
          subLabel: `${(pfRate * 100).toFixed(2)}% p.a. (statutory)`,
          bucket: "pf",
          currentValue: pfBalance,
          returnRate: pfRate,
          color: BUCKET_COLOR.pf,
        });
      }
    }

    // LIC — one row per policy at estimated 4.5% IRR
    for (const policy of licQuery.data ?? []) {
      const paid = Number(policy.premium ?? 0) * 12 * Math.max(
        0,
        (new Date().getFullYear() - new Date(policy.startDate).getFullYear()),
      );
      if (paid <= 0) continue;
      result.push({
        id: `lic-${policy.id}`,
        name: policy.name,
        subLabel: `Sum Assured ${fmtInr(Number(policy.sumAssured))} · est. 4.5% IRR`,
        bucket: "lic",
        currentValue: paid,
        returnRate: 0.045,
        color: BUCKET_COLOR.lic,
      });
    }

    // Cash/Other from dashboard (total - MF - stocks - PF - LIC)
    const dashTotal = Number(dashQ.data?.totalAssets ?? 0);
    const accounted = result.reduce((s, h) => s + h.currentValue, 0);
    const cashResidue = dashTotal - accounted;
    if (cashResidue > 10000) {
      result.push({
        id: "cash",
        name: "Savings & Deposits",
        subLabel: "Savings / FD · est. 5.5%",
        bucket: "other",
        currentValue: cashResidue,
        returnRate: 0.055,
        color: BUCKET_COLOR.other,
      });
    }

    return result;
  }, [mfQuery.data, stQuery.data, licQuery.data, pfQuery.data, dashQ.data]);

  const totalToday = useMemo(() => holdings.reduce((s, h) => s + h.currentValue, 0), [holdings]);
  const nominalAtHorizon = useMemo(() => holdings.reduce((s, h) => s + fv(h.currentValue, h.returnRate, horizon), 0), [holdings, horizon]);
  const realAtHorizon = useMemo(() => nominalAtHorizon / Math.pow(1 + inflation, horizon), [nominalAtHorizon, inflation, horizon]);
  const realGain = realAtHorizon - totalToday;
  const blendedRate = useMemo(() => {
    if (totalToday === 0) return 0;
    return holdings.reduce((s, h) => s + (h.currentValue / totalToday) * h.returnRate, 0);
  }, [holdings, totalToday]);

  const chartData = useMemo(
    () => buildChartData(holdings, horizon, inflation),
    [holdings, horizon, inflation],
  );

  // group holdings by bucket for table
  const bucketOrder: Holding["bucket"][] = ["mfEquity", "stocks", "pf", "lic", "other"];
  const holdingsByBucket = useMemo(() => {
    const map: Partial<Record<Holding["bucket"], Holding[]>> = {};
    for (const h of holdings) {
      if (!map[h.bucket]) map[h.bucket] = [];
      map[h.bucket]!.push(h);
    }
    return map;
  }, [holdings]);

  // insights
  const insights = useMemo(() => {
    const byBucket = bucketOrder.map((b) => {
      const hs = holdingsByBucket[b] ?? [];
      const today = hs.reduce((s, h) => s + h.currentValue, 0);
      const nomFv = hs.reduce((s, h) => s + fv(h.currentValue, h.returnRate, horizon), 0);
      const realFvTotal = nomFv / Math.pow(1 + inflation, horizon);
      const realGainBucket = realFvTotal - today;
      const blended = today > 0 ? hs.reduce((s, h) => s + (h.currentValue / today) * h.returnRate, 0) : 0;
      return { bucket: b, today, nomFv, realFvTotal, realGainBucket, blended };
    }).filter((b) => b.today > 0);

    const best = [...byBucket].sort((a, b) => b.realGainBucket - a.realGainBucket)[0];
    const worst = [...byBucket].sort((a, b) => a.realGainBucket - b.realGainBucket)[0];
    const cashBucket = byBucket.find((b) => b.bucket === "other");

    return { best, worst, cashBucket, byBucket };
  }, [holdingsByBucket, horizon, inflation]);

  // ── loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Skeleton variant="text" width={200} height={36} />
          <Box sx={{ display: "flex", gap: 1 }}>
            {HORIZONS.map((h) => <Skeleton key={h} variant="rounded" width={40} height={30} />)}
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={90} />
        </Box>
        <Skeleton variant="rounded" height={320} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={280} />
      </Box>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }} data-testid="projections-container">

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>Projections</Typography>
            <Chip
              label={`${horizon}y horizon · ${(inflation * 100).toFixed(1)}% inflation`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Nominal and inflation-adjusted future value of every holding.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <ToggleButtonGroup
            value={horizon}
            exclusive
            size="small"
            onChange={(_, v) => v && setHorizon(v)}
          >
            {HORIZONS.map((h) => (
              <ToggleButton key={h} value={h} sx={{ px: 1.5, py: 0.5, fontSize: 12, fontFamily: "monospace" }}>
                {h}y
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Toolbar ── */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Inflation
          </Typography>
          <InflationStepper value={inflation} onChange={setInflation} />
          <Typography variant="caption" color="text.disabled" fontFamily="monospace">
            India 10y avg 5.8%
          </Typography>
        </Box>
        <Box sx={{ width: 1, height: 20, borderLeft: "1px solid", borderColor: "divider" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Show
          </Typography>
          <ToggleButtonGroup value={showMode} exclusive size="small" onChange={(_, v) => v && setShowMode(v)}>
            <ToggleButton value="both" sx={{ px: 1.5, py: 0.5, fontSize: 11 }}>Both</ToggleButton>
            <ToggleButton value="nominal" sx={{ px: 1.5, py: 0.5, fontSize: 11 }}>Nominal</ToggleButton>
            <ToggleButton value="real" sx={{ px: 1.5, py: 0.5, fontSize: 11 }}>Real</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* ── Hero KPIs ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr 1fr" }, gap: 2, mb: 2 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            Portfolio Today
          </Typography>
          <Typography variant="h4" fontWeight={700} fontFamily="monospace" sx={{ mt: 0.5, letterSpacing: -1 }}>
            {fmtInr(totalToday)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            blended return est. {(blendedRate * 100).toFixed(1)}% p.a.
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            In {horizon}y · Nominal
          </Typography>
          <Typography variant="h5" fontWeight={700} fontFamily="monospace" color="primary" sx={{ mt: 0.5, letterSpacing: -0.5 }}>
            {fmtInr(nominalAtHorizon)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
            +{fmtInr(nominalAtHorizon - totalToday)} gain
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            In {horizon}y · Real (today ₹)
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            fontFamily="monospace"
            color={realGain >= 0 ? "success.main" : "error.main"}
            sx={{ mt: 0.5, letterSpacing: -0.5 }}
          >
            {fmtInr(realAtHorizon)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
            inflation drag −{fmtInr(nominalAtHorizon - realAtHorizon)}
          </Typography>
        </Paper>
      </Box>

      {/* ── Stacked Area Chart ── */}
      <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            Portfolio Projection · {horizon} years (₹ Lakhs)
          </Typography>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
            <Tooltip formatter={(value, name) => [`₹${value}L`, name as string]} />
            {(showMode === "both" || showMode === "nominal") && (
              <>
                <Area type="monotone" dataKey="mfEquity" stackId="a" stroke={BUCKET_COLOR.mfEquity} fill={BUCKET_COLOR.mfEquity} fillOpacity={0.5} name="Mutual Funds" />
                <Area type="monotone" dataKey="stocks"   stackId="a" stroke={BUCKET_COLOR.stocks}   fill={BUCKET_COLOR.stocks}   fillOpacity={0.5} name="Stocks" />
                <Area type="monotone" dataKey="pf"       stackId="a" stroke={BUCKET_COLOR.pf}       fill={BUCKET_COLOR.pf}       fillOpacity={0.55} name="Provident Fund" />
                <Area type="monotone" dataKey="lic"      stackId="a" stroke={BUCKET_COLOR.lic}      fill={BUCKET_COLOR.lic}      fillOpacity={0.5} name="Insurance" />
                <Area type="monotone" dataKey="other"    stackId="a" stroke={BUCKET_COLOR.other}    fill={BUCKET_COLOR.other}    fillOpacity={0.35} name="Cash & Debt" />
                <Line type="monotone" dataKey="nominalTotal" stroke={BUCKET_COLOR.mfEquity} strokeWidth={2} dot={{ r: 3, fill: BUCKET_COLOR.mfEquity }} name="Nominal Total" />
              </>
            )}
            {(showMode === "both" || showMode === "real") && (
              <Line type="monotone" dataKey="realTotal" stroke="#4caf50" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "#4caf50" }} name="Real Total (today ₹)" />
            )}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      {/* ── Per-holding Table ── */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>Holding</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>Today</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>Est. Return</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>+{horizon}y Nominal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>+{horizon}y Real</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", py: 1.5 }}>Real CAGR</TableCell>
              <TableCell sx={{ py: 1.5, width: 80 }}>Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bucketOrder.map((bucket) => {
              const hs = holdingsByBucket[bucket] ?? [];
              if (hs.length === 0) return null;
              const bucketToday = hs.reduce((s, h) => s + h.currentValue, 0);
              const bucketNom = hs.reduce((s, h) => s + fv(h.currentValue, h.returnRate, horizon), 0);
              const bucketReal = bucketNom / Math.pow(1 + inflation, horizon);
              return [
                // group header row
                <TableRow key={`grp-${bucket}`} sx={{ bgcolor: "action.hover" }}>
                  <TableCell colSpan={7} sx={{ py: 0.75, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "text.secondary" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: BUCKET_COLOR[bucket], flexShrink: 0 }} />
                      {BUCKET_LABEL[bucket]} · {fmtInr(bucketToday)} → {fmtInr(bucketNom)} nominal / {fmtInr(bucketReal)} real
                    </Box>
                  </TableCell>
                </TableRow>,
                // individual holdings
                ...hs.map((h) => {
                  const nomHorizon = fv(h.currentValue, h.returnRate, horizon);
                  const realHorizon = realFv(h.currentValue, h.returnRate, horizon, inflation);
                  const rc = realCagr(h.returnRate, inflation);
                  const realGainH = realHorizon - h.currentValue;
                  return (
                    <TableRow key={h.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 4, height: 28, borderRadius: "2px", bgcolor: h.color, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.3 }}>{h.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{h.subLabel}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace" fontWeight={500}>{fmtInr(h.currentValue)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          color={h.returnRate > inflation ? "success.main" : "error.main"}
                        >
                          {(h.returnRate * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace" fontWeight={500}>{fmtInr(nomHorizon)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight={500}
                          color={realGainH >= 0 ? "success.main" : "error.main"}
                        >
                          {fmtInr(realHorizon)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace" sx={{ display: "block" }}>
                          {realGainH >= 0 ? "+" : ""}{fmtInr(realGainH)} real
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight={600}
                          color={rc > 0.01 ? "success.main" : rc < -0.005 ? "error.main" : "warning.main"}
                        >
                          {rc >= 0 ? "+" : ""}{(rc * 100).toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Sparkline rate={h.returnRate} inflation={inflation} color={h.color} />
                      </TableCell>
                    </TableRow>
                  );
                }),
              ];
            })}
            {/* Total footer */}
            <TableRow sx={{ bgcolor: "action.selected", borderTop: "2px solid", borderColor: "divider" }}>
              <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Total</TableCell>
              <TableCell align="right"><Typography variant="body2" fontFamily="monospace" fontWeight={700}>{fmtInr(totalToday)}</Typography></TableCell>
              <TableCell align="right"><Typography variant="body2" fontFamily="monospace" color="text.secondary">{(blendedRate * 100).toFixed(1)}% blended</Typography></TableCell>
              <TableCell align="right"><Typography variant="body2" fontFamily="monospace" fontWeight={700} color="primary">{fmtInr(nominalAtHorizon)}</Typography></TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontFamily="monospace" fontWeight={700} color={realGain >= 0 ? "success.main" : "error.main"}>{fmtInr(realAtHorizon)}</Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">inflation drag −{fmtInr(nominalAtHorizon - realAtHorizon)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontFamily="monospace" fontWeight={700} color={realCagr(blendedRate, inflation) >= 0 ? "success.main" : "error.main"}>
                  {realCagr(blendedRate, inflation) >= 0 ? "+" : ""}{(realCagr(blendedRate, inflation) * 100).toFixed(2)}%
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* ── Insights ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
        {insights.best && (
          <Paper
            elevation={2}
            sx={{ p: 2, borderRadius: 2, borderLeft: "4px solid", borderColor: "success.main" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <TrendingUpIcon sx={{ color: "success.main", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {BUCKET_LABEL[insights.best.bucket]} carries the portfolio
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {fmtInr(insights.best.today)} today grows to {fmtInr(insights.best.realFvTotal)} in real terms — contributing the most to your real future wealth.
              {insights.best.realGainBucket > 0 && ` (+${fmtInr(insights.best.realGainBucket)} real gain)`}
            </Typography>
          </Paper>
        )}
        {insights.worst && insights.worst.realGainBucket < 0 && (
          <Paper
            elevation={2}
            sx={{ p: 2, borderRadius: 2, borderLeft: "4px solid", borderColor: "error.main" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <TrendingDownIcon sx={{ color: "error.main", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {BUCKET_LABEL[insights.worst.bucket]} loses in real terms
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              At {(insights.worst.blended * 100).toFixed(1)}% vs {(inflation * 100).toFixed(1)}% inflation, the real CAGR is{" "}
              <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
                {(realCagr(insights.worst.blended, inflation) * 100).toFixed(2)}%
              </Box>
              . {fmtInr(Math.abs(insights.worst.realGainBucket))} of purchasing power lost.
            </Typography>
          </Paper>
        )}
        {insights.cashBucket && (
          <Paper
            elevation={2}
            sx={{
              p: 2, borderRadius: 2, borderLeft: "4px solid",
              borderColor: realCagr(insights.cashBucket.blended, inflation) < 0 ? "warning.main" : "primary.main",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <TrendingFlatIcon sx={{ color: realCagr(insights.cashBucket.blended, inflation) < 0 ? "warning.main" : "primary.main", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Cash & deposits
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {fmtInr(insights.cashBucket.today)} at {(insights.cashBucket.blended * 100).toFixed(1)}% p.a.{" "}
              {realCagr(insights.cashBucket.blended, inflation) < 0
                ? "loses purchasing power. Keep only 3–6 months expenses; move the rest to liquid funds."
                : "roughly tracks inflation. Fine as emergency fund."
              }
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ── Disclaimer ── */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          <strong>Assumptions:</strong> Returns are category averages (AMFI / Value Research). LIC IRR estimated at 4.5%.
          PF uses the statutory rate from your settings. All projections compound annually with no tax, exit loads, or stamp duty.
          Real values = Nominal ÷ (1 + inflation)<sup>n</sup>. Adjust inflation to stress-test.{" "}
          <em>Past performance does not guarantee future returns.</em>
        </Typography>
      </Paper>
    </Box>
  );
}
