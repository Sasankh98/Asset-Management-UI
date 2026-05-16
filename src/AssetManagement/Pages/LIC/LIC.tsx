import { useState, useMemo } from "react";
import { useLicQuery } from "../../../hooks/queries";
import { useLicMutation } from "../../../hooks/mutations";
import type { LicPolicy as ApiLicPolicy } from "../../../../server/types";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Skeleton from "@mui/material/Skeleton";
import { fmtInr } from "../../../utils/formatCurrency";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReturnType = "lump_sum" | "annual" | "monthly_pension";
type PremiumFreq = "monthly" | "yearly";

interface LicPolicy {
  id: number;
  name: string;
  policyNumber: string;
  startDate: string; // YYYY-MM-DD
  policyTerm: number; // years
  premiumPayTerm: number; // years
  premiumFreq: PremiumFreq;
  premium: number;
  sumAssured: number;
  returnType: ReturnType;
  returnAmount: number; // annual or monthly return after premium term
  maturityBonus: number; // lump sum at maturity
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function addYears(date: Date, n: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}


function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function monthsDiff(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// ── Cash-flow generator ───────────────────────────────────────────────────────

function generateCashflows(p: LicPolicy): { date: Date; amount: number }[] {
  const flows: { date: Date; amount: number }[] = [];
  const start = new Date(p.startDate);

  // 1) Premium outflows
  const premiumEnd = addYears(start, p.premiumPayTerm);
  if (p.premiumFreq === "monthly") {
    let d = new Date(start);
    while (d < premiumEnd) {
      flows.push({ date: new Date(d), amount: -p.premium });
      d = addMonths(d, 1);
    }
  } else {
    let d = new Date(start);
    while (d < premiumEnd) {
      flows.push({ date: new Date(d), amount: -p.premium });
      d = addYears(d, 1);
    }
  }

  // 2) Return inflows (after premium term, during remaining policy period)
  const maturityDate = addYears(start, p.policyTerm);
  if (p.returnType === "monthly_pension" && p.returnAmount > 0) {
    let d = new Date(premiumEnd);
    while (d <= maturityDate) {
      flows.push({ date: new Date(d), amount: p.returnAmount });
      d = addMonths(d, 1);
    }
  } else if (p.returnType === "annual" && p.returnAmount > 0) {
    let d = new Date(premiumEnd);
    while (d <= maturityDate) {
      flows.push({ date: new Date(d), amount: p.returnAmount });
      d = addYears(d, 1);
    }
  }

  // 3) Maturity bonus (lump sum at end)
  if (p.maturityBonus > 0) {
    flows.push({ date: maturityDate, amount: p.maturityBonus });
  }

  return flows.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ── XIRR (Newton-Raphson) ─────────────────────────────────────────────────────

function computeXirr(flows: { date: Date; amount: number }[]): number | null {
  if (flows.length < 2) return null;
  if (!flows.some((f) => f.amount < 0) || !flows.some((f) => f.amount > 0)) return null;

  const d0 = flows[0].date.getTime();
  const msPerYear = 365.25 * 24 * 3600 * 1000;

  const npv = (r: number) =>
    flows.reduce((s, f) => {
      const t = (f.date.getTime() - d0) / msPerYear;
      return s + f.amount / Math.pow(1 + r, t);
    }, 0);

  const dnpv = (r: number) =>
    flows.reduce((s, f) => {
      const t = (f.date.getTime() - d0) / msPerYear;
      return s - (t * f.amount) / Math.pow(1 + r, t + 1);
    }, 0);

  let r = 0.08; // initial guess 8%
  for (let i = 0; i < 300; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-12) break;
    const rNew = r - f / df;
    if (!isFinite(rNew) || isNaN(rNew)) break;
    const clamped = Math.max(-0.99, Math.min(50, rNew));
    if (Math.abs(clamped - r) < 1e-9) return clamped;
    r = clamped;
  }
  return r;
}

// ── Derived policy stats ──────────────────────────────────────────────────────

function policyStats(p: LicPolicy) {
  const today = new Date();
  const start = new Date(p.startDate);
  const premiumEnd = addYears(start, p.premiumPayTerm);
  const maturityDate = addYears(start, p.policyTerm);

  const totalMonths = p.policyTerm * 12;
  const elapsedMonths = Math.max(0, Math.min(totalMonths, monthsDiff(start, today)));
  const progressPct = (elapsedMonths / totalMonths) * 100;

  const phase: "paying" | "receiving" | "matured" =
    today >= maturityDate ? "matured" : today >= premiumEnd ? "receiving" : "paying";

  // Premiums paid so far
  let investedSoFar = 0;
  if (p.premiumFreq === "monthly") {
    const paidMonths = Math.max(0, Math.min(p.premiumPayTerm * 12, elapsedMonths));
    investedSoFar = paidMonths * p.premium;
  } else {
    const paidYears = Math.max(0, Math.min(p.premiumPayTerm, Math.floor(elapsedMonths / 12)));
    investedSoFar = paidYears * p.premium;
  }

  const totalInvested =
    p.premiumFreq === "monthly" ? p.premiumPayTerm * 12 * p.premium : p.premiumPayTerm * p.premium;

  // Expected total returns
  const returnPeriodMonths = (p.policyTerm - p.premiumPayTerm) * 12;
  const totalReturns =
    p.returnType === "monthly_pension"
      ? returnPeriodMonths * p.returnAmount
      : p.returnType === "annual"
      ? (returnPeriodMonths / 12) * p.returnAmount
      : 0;
  const totalReceivable = totalReturns + p.maturityBonus;

  const flows = generateCashflows(p);
  const xirr = computeXirr(flows);

  return {
    start,
    premiumEnd,
    maturityDate,
    elapsedMonths,
    progressPct,
    phase,
    investedSoFar,
    totalInvested,
    totalReceivable,
    xirr,
  };
}

// ── Chart data: yearly cash flows ─────────────────────────────────────────────

function yearlyChartData(p: LicPolicy) {
  const flows = generateCashflows(p);
  const map = new Map<number, number>();
  for (const f of flows) {
    const yr = f.date.getFullYear();
    map.set(yr, (map.get(yr) ?? 0) + f.amount);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([yr, amount]) => ({ yr: String(yr), amount: Math.round(amount / 1000) })); // in ₹k
}

// ── Default form values ───────────────────────────────────────────────────────

const EMPTY_POLICY: Omit<LicPolicy, "id"> = {
  name: "",
  policyNumber: "",
  startDate: new Date().toISOString().slice(0, 10),
  policyTerm: 20,
  premiumPayTerm: 15,
  premiumFreq: "monthly",
  premium: 5000,
  sumAssured: 1000000,
  returnType: "lump_sum",
  returnAmount: 0,
  maturityBonus: 1500000,
};

const USER = "Sasankh";

// ── Add / Edit Dialog ─────────────────────────────────────────────────────────

function PolicyDialog({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: Omit<LicPolicy, "id">;
  onSave: (p: Omit<LicPolicy, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<LicPolicy, "id">>(initial);

  const set = (key: keyof Omit<LicPolicy, "id">, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name || !form.startDate) return;
    onSave(form);
  };

  // reset when dialog opens with new initial
  useMemo(() => setForm(initial), [initial]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial.name ? "Edit Policy" : "Add LIC Policy"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Policy Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Policy Number"
              value={form.policyNumber}
              onChange={(e) => set("policyNumber", e.target.value)}
              size="small"
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Sum Assured (₹)"
              type="number"
              value={form.sumAssured}
              onChange={(e) => set("sumAssured", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField
              label="Policy Term (yrs)"
              type="number"
              value={form.policyTerm}
              onChange={(e) => set("policyTerm", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 1, max: 50 } } }}
            />
            <TextField
              label="Premium Term (yrs)"
              type="number"
              value={form.premiumPayTerm}
              onChange={(e) => set("premiumPayTerm", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 1 } } }}
            />
            <TextField
              select
              label="Frequency"
              value={form.premiumFreq}
              onChange={(e) => set("premiumFreq", e.target.value as PremiumFreq)}
              size="small"
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Box>

          <TextField
            label={`Premium per ${form.premiumFreq === "monthly" ? "month" : "year"} (₹)`}
            type="number"
            value={form.premium}
            onChange={(e) => set("premium", Number(e.target.value))}
            size="small"
            slotProps={{ input: { inputProps: { min: 0 } } }}
          />

          <Divider />

          <TextField
            select
            label="Return Type"
            value={form.returnType}
            onChange={(e) => set("returnType", e.target.value as ReturnType)}
            size="small"
          >
            <MenuItem value="lump_sum">Lump Sum at Maturity Only</MenuItem>
            <MenuItem value="annual">Annual Returns + Maturity Bonus</MenuItem>
            <MenuItem value="monthly_pension">Monthly Pension + Maturity Bonus</MenuItem>
          </TextField>

          {form.returnType !== "lump_sum" && (
            <TextField
              label={`${form.returnType === "monthly_pension" ? "Monthly" : "Annual"} Return Amount (₹)`}
              type="number"
              value={form.returnAmount}
              onChange={(e) => set("returnAmount", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          )}

          <TextField
            label="Maturity / Bonus Amount (₹)"
            type="number"
            value={form.maturityBonus}
            onChange={(e) => set("maturityBonus", Number(e.target.value))}
            size="small"
            slotProps={{ input: { inputProps: { min: 0 } } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Policy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type ChartHorizon = "10y" | "25y" | "full";

// ── Policy Card ───────────────────────────────────────────────────────────────

function PolicyCard({
  policy,
  onEdit,
  onDelete,
}: {
  policy: LicPolicy;
  onEdit: (p: LicPolicy) => void;
  onDelete: (id: number) => void;
}) {
  const theme = useTheme();
  const [horizon, setHorizon] = useState<ChartHorizon>("10y");
  const s = policyStats(policy);
  const allChartData = yearlyChartData(policy);

  const chartData = (() => {
    if (horizon === "full") return allChartData;
    const startYear = new Date(policy.startDate).getFullYear();
    const cutoff = horizon === "10y" ? startYear + 10 : startYear + 25;
    return allChartData.filter((d) => Number(d.yr) <= cutoff);
  })();

  const phaseColor =
    s.phase === "paying" ? "primary" : s.phase === "receiving" ? "success" : "default";
  const phaseLabel =
    s.phase === "paying"
      ? "Paying premiums"
      : s.phase === "receiving"
      ? "Receiving returns"
      : "Matured";

  const xirrDisplay =
    s.xirr !== null && isFinite(s.xirr)
      ? `${(s.xirr * 100).toFixed(2)}%`
      : "—";

  const xirrColor =
    s.xirr !== null && s.xirr > 0.06 ? "success.main" : s.xirr !== null && s.xirr > 0 ? "warning.main" : "error.main";

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {policy.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
            #{policy.policyNumber || "—"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={phaseLabel} color={phaseColor} size="small" />
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(policy)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(policy.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">INVESTED SO FAR</Typography>
          <Typography variant="body1" fontWeight={700}>{fmtInr(s.investedSoFar)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">TOTAL INVESTED</Typography>
          <Typography variant="body1" fontWeight={600}>{fmtInr(s.totalInvested)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">EXPECTED RETURNS</Typography>
          <Typography variant="body1" fontWeight={600} color="success.main">
            {fmtInr(s.totalReceivable)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            XIRR
            <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
              (as of {fmtDate(new Date())})
            </Typography>
          </Typography>
          <Typography variant="body1" fontWeight={700} color={xirrColor}>
            {xirrDisplay}
          </Typography>
        </Box>
      </Box>

      {/* Timeline progress */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Started {fmtDate(s.start)} · matures {fmtDate(s.maturityDate)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {Math.floor(s.elapsedMonths / 12)}y {s.elapsedMonths % 12}m of {policy.policyTerm}y
          </Typography>
        </Box>
        <Box sx={{ position: "relative" }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, s.progressPct)}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                bgcolor: s.phase === "paying" ? "primary.main" : "success.main",
              },
            }}
          />
          {/* Premium-pay-term marker */}
          {policy.premiumPayTerm < policy.policyTerm && (
            <Tooltip title={`Premium ends ${fmtDate(s.premiumEnd)}`}>
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  left: `${(policy.premiumPayTerm / policy.policyTerm) * 100}%`,
                  width: 2,
                  height: 14,
                  bgcolor: "warning.main",
                  borderRadius: 1,
                  cursor: "help",
                }}
              />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Premium: {fmtInr(policy.premium)}/{policy.premiumFreq === "monthly" ? "mo" : "yr"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SA: {fmtInr(policy.sumAssured)}
          </Typography>
        </Box>
      </Box>

      {/* Cash-flow bar chart */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            Cash Flows by Year (₹k)
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {(["10y", "25y", "full"] as ChartHorizon[]).map((h) => (
              <Chip
                key={h}
                label={h === "full" ? "Full term" : h}
                size="small"
                variant={horizon === h ? "filled" : "outlined"}
                color={horizon === h ? "primary" : "default"}
                onClick={() => setHorizon(h)}
                sx={{ cursor: "pointer", fontSize: 10, height: 22 }}
              />
            ))}
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis
              dataKey="yr"
              tick={{ fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}k`} />
            <RechartTooltip
              formatter={(v) => [`₹${Math.abs(v as number)}k`, (v as number) < 0 ? "Premium" : "Return"]}
            />
            <ReferenceLine y={0} stroke={theme.palette.divider} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.amount < 0 ? theme.palette.error.main : theme.palette.success.main}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "error.main", opacity: 0.8 }} />
            <Typography variant="caption">Premiums paid out</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "success.main", opacity: 0.8 }} />
            <Typography variant="caption">Returns received</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ── Portfolio summary ─────────────────────────────────────────────────────────

function PortfolioSummary({ policies }: { policies: LicPolicy[] }) {
  const totalInvested = policies.reduce((s, p) => s + policyStats(p).totalInvested, 0);
  const investedSoFar = policies.reduce((s, p) => s + policyStats(p).investedSoFar, 0);
  const totalReceivable = policies.reduce((s, p) => s + policyStats(p).totalReceivable, 0);

  // Weighted XIRR across all policies (weight by total invested)
  const weightedXirr = useMemo(() => {
    const pairs = policies.map((p) => {
      const st = policyStats(p);
      return { xirr: st.xirr, weight: st.totalInvested };
    });
    const totalW = pairs.reduce((s, x) => s + x.weight, 0);
    if (totalW === 0) return null;
    const weighted = pairs.reduce((s, x) => s + (x.xirr ?? 0) * x.weight, 0);
    return weighted / totalW;
  }, [policies]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <AccountBalanceIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            Invested So Far
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700}>{fmtInr(investedSoFar)}</Typography>
      </Paper>
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 0.5 }}>
          Total Committed
        </Typography>
        <Typography variant="h6" fontWeight={700}>{fmtInr(totalInvested)}</Typography>
      </Paper>
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 16, color: "success.main" }} />
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            Expected Returns
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700} color="success.main">{fmtInr(totalReceivable)}</Typography>
      </Paper>
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 0.5 }}>
          Portfolio XIRR
          <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
            as of {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </Typography>
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          color={weightedXirr !== null && weightedXirr > 0.05 ? "success.main" : "warning.main"}
        >
          {weightedXirr !== null ? `${(weightedXirr * 100).toFixed(2)}%` : "—"}
        </Typography>
      </Paper>
    </Box>
  );
}

// ── Main LIC page ─────────────────────────────────────────────────────────────

function coerce(p: ApiLicPolicy): LicPolicy {
  return {
    ...p,
    premiumFreq: p.premiumFreq as PremiumFreq,
    returnType: p.returnType as ReturnType,
    policyTerm: Number(p.policyTerm),
    premiumPayTerm: Number(p.premiumPayTerm),
    premium: Number(p.premium),
    sumAssured: Number(p.sumAssured),
    returnAmount: Number(p.returnAmount),
    maturityBonus: Number(p.maturityBonus),
  };
}

export default function LIC() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LicPolicy | null>(null);

  const { data: rawPolicies, isLoading } = useLicQuery();
  const { createPolicy, updatePolicy, deletePolicy } = useLicMutation();

  const policies: LicPolicy[] = (rawPolicies ?? []).map(coerce);

  const handleAdd = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEdit = (p: LicPolicy) => {
    setEditTarget(p);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deletePolicy.mutateAsync(id);
  };

  const handleSave = async (form: Omit<LicPolicy, "id">) => {
    const payload = { ...form, user: USER };
    if (editTarget) {
      await updatePolicy.mutateAsync({ id: editTarget.id, data: payload as never });
    } else {
      await createPolicy.mutateAsync(payload as never);
    }
    setDialogOpen(false);
  };

  const dialogInitial: Omit<LicPolicy, "id"> = editTarget
    ? { ...editTarget }
    : EMPTY_POLICY;

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={160} height={36} />
            <Skeleton variant="text" width={300} height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={110} height={36} />
        </Box>
        {/* Portfolio summary */}
        <Skeleton variant="rounded" height={100} sx={{ mb: 3 }} />
        {/* Policy cards */}
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={200} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }} data-testid="lic-container">
      {/* Page header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            LIC Policies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track premiums, returns, and XIRR across all your LIC policies.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Policy
        </Button>
      </Box>

      {policies.length > 0 && <PortfolioSummary policies={policies} />}

      {policies.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "action.hover",
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No policies yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first LIC policy to track premiums and projected XIRR.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Policy
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {policies.map((p) => (
            <PolicyCard key={p.id} policy={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </Box>
      )}

      <PolicyDialog
        open={dialogOpen}
        initial={dialogInitial}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
