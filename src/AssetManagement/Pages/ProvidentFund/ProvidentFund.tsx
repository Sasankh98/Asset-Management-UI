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
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import ProvidentFundService from "../../../services/ProvidentFundService/ProvidentFundService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtInr(val: number): string {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

// EPF interest rate for the current year
const EPF_RATE = 8.25;

// ── seed data ─────────────────────────────────────────────────────────────────

interface YearRecord {
  year: number;
  empContrib: number;
  empContribTotal: number;
  erContrib: number;
  erContribTotal: number;
  interest: number;
  balance: number;
}

function buildHistory(
  startYear: number,
  monthlyBasic: number,
  empPct: number,
  erPct: number,
  rate: number,
  years: number
): YearRecord[] {
  const records: YearRecord[] = [];
  let balance = 0;
  let empTotal = 0;
  let erTotal = 0;
  for (let i = 0; i < years; i++) {
    const emp = Math.round(monthlyBasic * (empPct / 100) * 12);
    const er = Math.round(monthlyBasic * (erPct / 100) * 12);
    const interest = Math.round((balance + emp / 2 + er / 2) * (rate / 100));
    balance += emp + er + interest;
    empTotal += emp;
    erTotal += er;
    records.push({
      year: startYear + i,
      empContrib: emp,
      empContribTotal: empTotal,
      erContrib: er,
      erContribTotal: erTotal,
      interest,
      balance,
    });
  }
  return records;
}

// ── projection ────────────────────────────────────────────────────────────────

function projectCorpus(
  currentBalance: number,
  monthlyEmp: number,
  monthlyEr: number,
  rate: number,
  yearsLeft: number
): number {
  let bal = currentBalance;
  for (let y = 0; y < yearsLeft; y++) {
    const annual = (monthlyEmp + monthlyEr) * 12;
    bal = bal * (1 + rate / 100) + annual;
  }
  return bal;
}

// ── main ──────────────────────────────────────────────────────────────────────

const USER = "Sasankh";

export default function ProvidentFund() {
  const currentYear = new Date().getFullYear();
  const [monthlyBasic, setMonthlyBasic] = useState(60000);
  const [empPct, setEmpPct] = useState(12);
  const [erPct, setErPct] = useState(12);
  const [rate, setRate] = useState(EPF_RATE);
  const [yearsWorked, setYearsWorked] = useState(5);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentAge, setCurrentAge] = useState(30);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    ProvidentFundService().getConfig(USER).then((cfg) => {
      if (cfg) {
        setMonthlyBasic(Number(cfg.monthlyBasic));
        setEmpPct(Number(cfg.empPct));
        setErPct(Number(cfg.erPct));
        setRate(Number(cfg.rate));
        setYearsWorked(Number(cfg.yearsWorked));
        setCurrentAge(Number(cfg.currentAge));
        setRetirementAge(Number(cfg.retirementAge));
      }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await ProvidentFundService().upsert({
      monthlyBasic, empPct, erPct, rate,
      yearsWorked, currentAge, retirementAge,
      currentBalance: 0,
      user: USER,
    }).catch(() => {});
    setSaving(false);
  }, [monthlyBasic, empPct, erPct, rate, yearsWorked, currentAge, retirementAge]);

  const history = useMemo(
    () => buildHistory(currentYear - yearsWorked, monthlyBasic, empPct, erPct, rate, yearsWorked),
    [currentYear, monthlyBasic, empPct, erPct, rate, yearsWorked]
  );

  const latest = history[history.length - 1];
  const totalBalance = latest?.balance ?? 0;
  const totalEmpContrib = latest?.empContribTotal ?? 0;
  const totalErContrib = latest?.erContribTotal ?? 0;
  const totalInterest = totalBalance - totalEmpContrib - totalErContrib;

  const yearsLeft = Math.max(0, retirementAge - currentAge - yearsWorked);
  const monthlyEmp = Math.round(monthlyBasic * (empPct / 100));
  const monthlyEr = Math.round(monthlyBasic * (erPct / 100));
  const projectedCorpus = projectCorpus(totalBalance, monthlyEmp, monthlyEr, rate, yearsLeft);

  const chartData = history.map((r) => ({
    year: String(r.year),
    "Employee": r.empContrib,
    "Employer": r.erContrib,
    "Interest": r.interest,
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
    <Box sx={{ p: 2, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Provident Fund</Typography>
          <Typography variant="body2" color="text.secondary">
            EPF balance, contributions, interest, and retirement projection.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip label={`EPF Rate: ${EPF_RATE}%`} color="primary" variant="outlined" />
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

      {/* KPI cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {[
          { label: "Total Balance",       value: fmtInr(totalBalance),    color: "primary.main" },
          { label: "Employee Contrib.",   value: fmtInr(totalEmpContrib), color: "text.primary" },
          { label: "Employer Contrib.",   value: fmtInr(totalErContrib),  color: "text.primary" },
          { label: "Interest Earned",     value: fmtInr(totalInterest),   color: "success.main" },
        ].map((k) => (
          <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              {k.label}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>
              {k.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Contribution breakdown progress */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
          Balance Breakdown
        </Typography>
        {[
          { label: "Employee", value: totalEmpContrib, color: "#1976d2" },
          { label: "Employer", value: totalErContrib,  color: "#f9a825" },
          { label: "Interest", value: totalInterest,   color: "#43a047" },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{fmtInr(item.value)}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={totalBalance ? (item.value / totalBalance) * 100 : 0}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 },
              }}
            />
          </Box>
        ))}
      </Paper>

      {/* Year-wise contribution chart */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Year-wise Contributions &amp; Interest
        </Typography>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => fmtInr(v)} />
            <Legend />
            <Bar dataKey="Employee" stackId="a" fill="#1976d2" />
            <Bar dataKey="Employer" stackId="a" fill="#f9a825" />
            <Bar dataKey="Interest" stackId="a" fill="#43a047" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Corpus growth line */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Corpus Growth
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={growthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v: number) => fmtInr(v)} width={80} />
            <Tooltip formatter={(v: number) => fmtInr(v)} />
            <ReferenceLine y={totalBalance} stroke="#1976d2" strokeDasharray="4 2" label={{ value: "Now", position: "insideTopRight", fontSize: 11 }} />
            <Bar dataKey="Balance" fill="#1976d2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Settings + projection */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {/* Inputs */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Contribution Settings
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Monthly Basic Salary (₹)"
              type="number"
              value={monthlyBasic}
              onChange={(e) => setMonthlyBasic(Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                Employee Contribution: <b>{empPct}%</b>
              </Typography>
              <Slider value={empPct} min={1} max={20} step={1} onChange={(_, v) => setEmpPct(v as number)} marks={[{ value: 12, label: "12%" }]} />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Employer Contribution: <b>{erPct}%</b>
              </Typography>
              <Slider value={erPct} min={1} max={20} step={1} onChange={(_, v) => setErPct(v as number)} marks={[{ value: 12, label: "12%" }]} />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Interest Rate: <b>{rate}%</b>
              </Typography>
              <Slider value={rate} min={5} max={12} step={0.25} onChange={(_, v) => setRate(v as number)} marks={[{ value: EPF_RATE, label: `${EPF_RATE}%` }]} />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Years Worked: <b>{yearsWorked}</b>
              </Typography>
              <Slider value={yearsWorked} min={1} max={35} step={1} onChange={(_, v) => setYearsWorked(v as number)} />
            </Box>
          </Box>
        </Paper>

        {/* Retirement projection */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Retirement Projection
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Current Age"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                size="small"
                slotProps={{ input: { inputProps: { min: 18, max: 65 } } }}
              />
              <TextField
                label="Retirement Age"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                size="small"
                slotProps={{ input: { inputProps: { min: 40, max: 75 } } }}
              />
            </Box>

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { label: "Current Balance",       value: fmtInr(totalBalance) },
                { label: "Monthly Contribution",  value: `${fmtInr(monthlyEmp)} + ${fmtInr(monthlyEr)} employer` },
                { label: "Years to Retirement",   value: `${yearsLeft} yr` },
              ].map((r) => (
                <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{r.value}</Typography>
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
                assuming {rate}% p.a. compounding
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={totalBalance && projectedCorpus ? Math.min(100, (totalBalance / projectedCorpus) * 100) : 0}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": { bgcolor: "success.main", borderRadius: 5 },
              }}
            />
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {fmtInr(totalBalance)} of {fmtInr(projectedCorpus)} ({projectedCorpus ? ((totalBalance / projectedCorpus) * 100).toFixed(1) : 0}% of goal)
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
