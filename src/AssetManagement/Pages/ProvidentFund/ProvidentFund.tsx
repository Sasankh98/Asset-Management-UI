import { useState, useMemo, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveIcon from "@mui/icons-material/Save";
import ProvidentFundService from "../../../services/ProvidentFundService/ProvidentFundService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fmtInr } from "../../../utils/formatCurrency";

// ── Historical EPF interest rates (financial year start) ──────────────────────

const EPF_RATES: Record<number, number> = {
  2012: 8.50, 2013: 8.75, 2014: 8.75, 2015: 8.80,
  2016: 8.65, 2017: 8.55, 2018: 8.65, 2019: 8.50,
  2020: 8.50, 2021: 8.10, 2022: 8.15, 2023: 8.25,
  2024: 8.25,
};

function rateForYear(year: number, futureRate: number): number {
  return EPF_RATES[year] ?? futureRate;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Year record ───────────────────────────────────────────────────────────────

interface YearRecord {
  year: number;
  months: number;           // months contributed this year (12 except first year)
  monthlyBasic: number;
  empContrib: number;
  erContrib: number;
  vpfContrib: number;
  interest: number;
  balance: number;
  rate: number;
  empCumul: number;
  erCumul: number;
  vpfCumul: number;
}

// ── Build history ─────────────────────────────────────────────────────────────
// monthlyBasic = CURRENT salary; we back-calculate starting salary from increment.

function buildHistory(
  currentYear: number,
  joiningMonth: number,       // 1=Jan … 12=Dec
  currentMonthlyBasic: number,
  empPct: number,
  erPct: number,
  vpfPct: number,
  salaryIncrementPct: number,
  futureRate: number,
  yearsWorked: number,
): YearRecord[] {
  if (yearsWorked <= 0) return [];

  // Derive starting basic: currentBasic = startBasic * (1 + inc)^yearsWorked
  const inc = salaryIncrementPct / 100;
  const startMonthlyBasic = currentMonthlyBasic / Math.pow(1 + inc, yearsWorked);
  const startYear = currentYear - yearsWorked;

  const records: YearRecord[] = [];
  let balance = 0;
  let empCumul = 0;
  let erCumul = 0;
  let vpfCumul = 0;

  for (let i = 0; i < yearsWorked; i++) {
    const year = startYear + i;
    // First year: only months from joiningMonth to December
    const months = i === 0 ? (12 - joiningMonth + 1) : 12;
    const basic = startMonthlyBasic * Math.pow(1 + inc, i);
    const rate  = rateForYear(year, futureRate);

    const emp = Math.round(basic * (empPct / 100) * months);
    const er  = Math.round(basic * (erPct  / 100) * months);
    const vpf = Math.round(basic * (vpfPct / 100) * months);

    // EPF interest: monthly compounding approximation
    // Interest = opening balance * rate + half-year of new contributions * rate
    const interest = Math.round((balance + (emp + er + vpf) / 2) * (rate / 100));

    balance  += emp + er + vpf + interest;
    empCumul += emp;
    erCumul  += er;
    vpfCumul += vpf;

    records.push({
      year, months, monthlyBasic: Math.round(basic),
      empContrib: emp, erContrib: er, vpfContrib: vpf,
      interest, balance, rate,
      empCumul, erCumul, vpfCumul,
    });
  }
  return records;
}

// ── Project corpus ────────────────────────────────────────────────────────────

function projectCorpus(
  currentBalance: number,
  currentMonthlyBasic: number,
  empPct: number,
  erPct: number,
  vpfPct: number,
  salaryIncrementPct: number,
  futureRate: number,
  yearsLeft: number,
): number {
  let bal = currentBalance;
  const inc = salaryIncrementPct / 100;
  for (let y = 0; y < yearsLeft; y++) {
    const basic  = currentMonthlyBasic * Math.pow(1 + inc, y);
    const annual = basic * (empPct + erPct + vpfPct) / 100 * 12;
    bal = bal * (1 + futureRate / 100) + annual;
  }
  return bal;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EPF_RATE = 8.25;
const USER = "Sasankh";

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProvidentFund() {
  const currentYear = new Date().getFullYear();

  const [monthlyBasic,      setMonthlyBasic]      = useState(60000);
  const [empPct,            setEmpPct]            = useState(12);
  const [erPct,             setErPct]             = useState(12);
  const [vpfPct,            setVpfPct]            = useState(0);
  const [rate,              setRate]              = useState(EPF_RATE);
  const [salaryIncrementPct,setSalaryIncrementPct]= useState(10);
  const [yearsWorked,       setYearsWorked]       = useState(5);
  const [joiningMonth,      setJoiningMonth]      = useState(1);
  const [currentAge,        setCurrentAge]        = useState(30);
  const [retirementAge,     setRetirementAge]     = useState(60);
  const [actualBalance,     setActualBalance]     = useState(0);
  const [saving,            setSaving]            = useState(false);
  const [loaded,            setLoaded]            = useState(false);

  useEffect(() => {
    ProvidentFundService().getConfig(USER).then((cfg) => {
      if (cfg) {
        setMonthlyBasic(Number(cfg.monthlyBasic));
        setEmpPct(Number(cfg.empPct));
        setErPct(Number(cfg.erPct));
        setVpfPct(Number(cfg.vpfPct ?? 0));
        setRate(Number(cfg.rate));
        setSalaryIncrementPct(Number(cfg.salaryIncrementPct ?? 10));
        setYearsWorked(Number(cfg.yearsWorked));
        setJoiningMonth(Number(cfg.joiningMonth ?? 1));
        setCurrentAge(Number(cfg.currentAge));
        setRetirementAge(Number(cfg.retirementAge));
        setActualBalance(Number(cfg.currentBalance ?? 0));
      }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await ProvidentFundService().upsert({
      monthlyBasic, empPct, erPct, rate, vpfPct,
      salaryIncrementPct, yearsWorked, joiningMonth,
      currentAge, retirementAge,
      currentBalance: actualBalance,
      user: USER,
    }).catch(() => {});
    setSaving(false);
  }, [monthlyBasic, empPct, erPct, rate, vpfPct, salaryIncrementPct,
      yearsWorked, joiningMonth, currentAge, retirementAge, actualBalance]);

  // ── Calculations ─────────────────────────────────────────────────────────────

  const history = useMemo(
    () => buildHistory(currentYear, joiningMonth, monthlyBasic, empPct, erPct, vpfPct, salaryIncrementPct, rate, yearsWorked),
    [currentYear, joiningMonth, monthlyBasic, empPct, erPct, vpfPct, salaryIncrementPct, rate, yearsWorked],
  );

  const latest = history[history.length - 1];
  const calcBalance    = latest?.balance    ?? 0;
  const totalEmpContrib = latest?.empCumul  ?? 0;
  const totalErContrib  = latest?.erCumul   ?? 0;
  const totalVpfContrib = latest?.vpfCumul  ?? 0;
  const totalInterest   = calcBalance - totalEmpContrib - totalErContrib - totalVpfContrib;

  // Use actual passbook balance if provided, else fall back to calculated
  const effectiveBalance = actualBalance > 0 ? actualBalance : calcBalance;

  const yearsLeft = Math.max(0, retirementAge - currentAge);
  const projectedCorpus = projectCorpus(
    effectiveBalance, monthlyBasic,
    empPct, erPct, vpfPct, salaryIncrementPct, rate, yearsLeft,
  );

  // Monthly contributions at current salary
  const monthlyEmp = Math.round(monthlyBasic * (empPct / 100));
  const monthlyEr  = Math.round(monthlyBasic * (erPct  / 100));
  const monthlyVpf = Math.round(monthlyBasic * (vpfPct / 100));

  // Chart data
  const chartData = history.map((r) => ({
    year: String(r.year),
    Employee: r.empContrib,
    Employer: r.erContrib,
    ...(vpfPct > 0 ? { VPF: r.vpfContrib } : {}),
    Interest: r.interest,
    "Rate %": r.rate,
  }));

  const growthData = history.map((r) => ({
    year: String(r.year),
    Balance: r.balance,
  }));

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1040, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Provident Fund</Typography>
          <Typography variant="body2" color="text.secondary">
            EPF + VPF tracker with year-wise rates, salary growth, and retirement projection.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip label={`EPF ${currentYear}: ${EPF_RATE}%`} color="primary" variant="outlined" />
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Box>

      {/* Actual balance banner */}
      {actualBalance > 0 && (
        <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: "success.light", border: "1px solid", borderColor: "success.main", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="success.dark" fontWeight={600}>
            Using passbook balance: <b>{fmtInr(actualBalance)}</b> — projections are based on your actual EPF balance.
          </Typography>
          <Tooltip title="The calculated balance is shown in the historical section for reference only.">
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "success.dark" }} />
          </Tooltip>
        </Paper>
      )}

      {/* KPI cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${vpfPct > 0 ? 5 : 4}, 1fr)`, gap: 2, mb: 3 }}>
        {[
          { label: "Current Balance",    value: fmtInr(effectiveBalance),  color: "primary.main", note: actualBalance > 0 ? "passbook" : "calculated" },
          { label: "Employee Contrib.",  value: fmtInr(totalEmpContrib),   color: "text.primary", note: null },
          { label: "Employer Contrib.",  value: fmtInr(totalErContrib),    color: "text.primary", note: null },
          ...(vpfPct > 0 ? [{ label: "VPF Contrib.", value: fmtInr(totalVpfContrib), color: "secondary.main", note: null }] : []),
          { label: "Interest Earned",    value: fmtInr(totalInterest),     color: "success.main", note: null },
        ].map((k) => (
          <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              {k.label}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>
              {k.value}
            </Typography>
            {k.note && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>{k.note}</Typography>
            )}
          </Paper>
        ))}
      </Box>

      {/* Balance breakdown */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Balance Breakdown</Typography>
        {[
          { label: "Employee (12%)",  value: totalEmpContrib,  color: "#1976d2" },
          { label: "Employer (12%)",  value: totalErContrib,   color: "#f9a825" },
          ...(vpfPct > 0 ? [{ label: `VPF (${vpfPct}%)`, value: totalVpfContrib, color: "#7b1fa2" }] : []),
          { label: "Interest",        value: totalInterest,    color: "#43a047" },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{fmtInr(item.value)}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calcBalance ? Math.min(100, (item.value / calcBalance) * 100) : 0}
              sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 } }}
            />
          </Box>
        ))}
      </Paper>

      {/* Year-wise contributions chart */}
      {history.length > 0 && (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Year-wise Contributions &amp; Interest</Typography>
            <Tooltip title="First year may show fewer months due to your joining month. Each bar uses the actual EPF rate for that financial year.">
              <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            </Tooltip>
          </Box>
          {/* Rate badges */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
            {history.map((r) => (
              <Chip
                key={r.year}
                label={`${r.year}: ${r.rate}%${r.months < 12 ? ` (${r.months}m)` : ""}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10, height: 20 }}
              />
            ))}
          </Box>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip
                formatter={(v: number, name: string) =>
                  name === "Rate %" ? [`${v}%`, "EPF Rate"] : [fmtInr(v), name]
                }
              />
              <Legend />
              <Bar dataKey="Employee" stackId="a" fill="#1976d2" />
              <Bar dataKey="Employer" stackId="a" fill="#f9a825" />
              {vpfPct > 0 && <Bar dataKey="VPF" stackId="a" fill="#7b1fa2" />}
              <Bar dataKey="Interest" stackId="a" fill="#43a047" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Corpus growth */}
      {history.length > 0 && (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Corpus Growth</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v: number) => fmtInr(v)} width={80} />
              <ChartTooltip formatter={(v: number) => fmtInr(v)} />
              <ReferenceLine
                y={effectiveBalance}
                stroke="#1976d2"
                strokeDasharray="4 2"
                label={{ value: actualBalance > 0 ? "Actual" : "Now", position: "insideTopRight", fontSize: 11 }}
              />
              <Bar dataKey="Balance" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Settings + projection */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>

        {/* Settings */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Settings</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <TextField
              label="Current Monthly Basic (₹)"
              type="number"
              value={monthlyBasic}
              onChange={(e) => setMonthlyBasic(Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Employee (EPF): <b>{empPct}%</b>
              </Typography>
              <Slider value={empPct} min={1} max={20} step={1}
                onChange={(_, v) => setEmpPct(v as number)}
                marks={[{ value: 12, label: "12%" }]} />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Employer (EPF): <b>{erPct}%</b>
              </Typography>
              <Slider value={erPct} min={1} max={20} step={1}
                onChange={(_, v) => setErPct(v as number)}
                marks={[{ value: 12, label: "12%" }]} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" gutterBottom>
                  VPF (voluntary): <b>{vpfPct}%</b>
                </Typography>
                <Tooltip title="VPF is contributed by employee only, above the mandatory 12%. It earns the same EPF interest rate and is tax-exempt under 80C.">
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", mb: 0.3 }} />
                </Tooltip>
              </Box>
              <Slider value={vpfPct} min={0} max={50} step={1}
                onChange={(_, v) => setVpfPct(v as number)}
                marks={[{ value: 0, label: "0%" }, { value: 50, label: "50%" }]} />
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" gutterBottom>
                Annual Salary Increment: <b>{salaryIncrementPct}%</b>
              </Typography>
              <Slider value={salaryIncrementPct} min={0} max={30} step={1}
                onChange={(_, v) => setSalaryIncrementPct(v as number)}
                marks={[{ value: 10, label: "10%" }]} />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Future EPF Rate: <b>{rate}%</b>
              </Typography>
              <Slider value={rate} min={5} max={12} step={0.25}
                onChange={(_, v) => setRate(v as number)}
                marks={[{ value: EPF_RATE, label: `${EPF_RATE}%` }]} />
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Years Worked: <b>{yearsWorked}</b>
                </Typography>
                <Slider value={yearsWorked} min={0} max={35} step={1}
                  onChange={(_, v) => setYearsWorked(v as number)} />
              </Box>
              <TextField
                select
                label="Joining Month"
                value={joiningMonth}
                onChange={(e) => setJoiningMonth(Number(e.target.value))}
                size="small"
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
                ))}
              </TextField>
            </Box>

          </Box>
        </Paper>

        {/* Retirement projection */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Retirement Projection</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="Current Age" type="number" value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))} size="small"
                slotProps={{ input: { inputProps: { min: 18, max: 65 } } }} />
              <TextField label="Retirement Age" type="number" value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))} size="small"
                slotProps={{ input: { inputProps: { min: 40, max: 75 } } }} />
            </Box>

            <TextField
              label="Actual EPF Balance (from passbook)"
              type="number"
              value={actualBalance || ""}
              onChange={(e) => setActualBalance(Number(e.target.value))}
              size="small"
              placeholder="0 = use calculated"
              helperText="Enter your EPFO passbook balance for accurate projections"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { label: "Current Balance",          value: fmtInr(effectiveBalance) },
                { label: "Monthly (Emp + Er + VPF)", value: `${fmtInr(monthlyEmp)} + ${fmtInr(monthlyEr)}${monthlyVpf > 0 ? ` + ${fmtInr(monthlyVpf)} VPF` : ""}` },
                { label: "Salary Increment",         value: `${salaryIncrementPct}% / yr` },
                { label: "Years to Retirement",      value: `${yearsLeft} yr` },
                { label: "First Year Months",        value: `${12 - joiningMonth + 1} months (joined ${MONTHS[joiningMonth - 1]})` },
              ].map((r) => (
                <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right", maxWidth: "55%" }}>{r.value}</Typography>
                </Box>
              ))}
            </Box>

            <Divider />

            <Box sx={{ textAlign: "center", py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Projected Corpus at {retirementAge}
              </Typography>
              <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 0.5 }}>
                {fmtInr(projectedCorpus)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {rate}% p.a. · {salaryIncrementPct}% annual increment · {vpfPct > 0 ? `+${vpfPct}% VPF` : "no VPF"}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={projectedCorpus ? Math.min(100, (effectiveBalance / projectedCorpus) * 100) : 0}
              sx={{ height: 10, borderRadius: 5, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: "success.main", borderRadius: 5 } }}
            />
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {fmtInr(effectiveBalance)} of {fmtInr(projectedCorpus)}&nbsp;
              ({projectedCorpus ? ((effectiveBalance / projectedCorpus) * 100).toFixed(1) : 0}% of goal)
            </Typography>

          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
