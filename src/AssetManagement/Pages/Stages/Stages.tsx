import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import FlagIcon from "@mui/icons-material/Flag";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SavingsIcon from "@mui/icons-material/Savings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useTheme } from "@mui/material/styles";

import {
  useDashboardQuery,
  useSalaryQuery,
  useProvidentFundQuery,
} from "../../../hooks/queries";
import { fmtInr } from "../../../utils/formatCurrency";

// ── math helpers ───────────────────────────────────────────────────────────────

function salaryGrowth(age: number): number {
  if (age < 30) return 0.15;
  if (age < 40) return 0.12;
  if (age < 50) return 0.06;
  return 0.04;
}

function savingRate(age: number): number {
  if (age < 35) return 0.10;
  if (age < 40) return 0.15;
  if (age < 45) return 0.20;
  if (age < 50) return 0.25;
  return 0.30;
}

function needWantSave(age: number): [number, number, number] {
  if (age < 30) return [70, 20, 10];
  if (age < 35) return [60, 30, 10];
  if (age < 40) return [55, 30, 15];
  if (age < 45) return [55, 25, 20];
  if (age < 50) return [50, 25, 25];
  if (age < 55) return [50, 20, 30];
  return [40, 30, 30];
}

function targetCorpus(
  currentExpense: number,
  inflation: number,
  yearsToRetire: number,
  multiplier: number,
): number {
  const inflatedExpense = currentExpense * Math.pow(1 + inflation, yearsToRetire);
  return inflatedExpense * multiplier;
}

interface SimRow {
  age: number;
  salary: number;
  saving: number;
  corpus: number;
  savePct: number;
}

interface SimOpts {
  age0: number;
  salary0: number;
  corpus0: number;
  corpusRate: number;
  retireAt: number;
}

function simulate(opts: SimOpts): SimRow[] {
  const { age0, salary0, corpus0, corpusRate, retireAt } = opts;
  let salary = salary0;
  let corpus = corpus0;
  const rows: SimRow[] = [];
  const saving = salary * savingRate(age0);
  rows.push({ age: age0, salary, saving, corpus, savePct: savingRate(age0) });
  for (let age = age0 + 1; age <= retireAt; age++) {
    salary = salary * (1 + salaryGrowth(age));
    const s = salary * savingRate(age);
    corpus = corpus * (1 + corpusRate) + s;
    rows.push({ age, salary, saving: s, corpus, savePct: savingRate(age) });
  }
  return rows;
}

function salaryAt20(age0: number, salary0: number): number {
  let s = salary0;
  for (let age = age0; age > 20; age--) {
    s = s / (1 + salaryGrowth(age));
  }
  return s;
}

function expectedSim(s: SimInputs, retireAt: number): SimRow[] {
  return simulate({
    age0: 20,
    salary0: salaryAt20(s.age0, s.salary0),
    corpus0: 0,
    corpusRate: s.corpusRate,
    retireAt,
  });
}

function stageName(age: number): string {
  if (age < 30) return "Foundation";
  if (age < 35) return "Ramp-up";
  if (age < 40) return "Build";
  if (age < 45) return "Compound";
  if (age < 50) return "Peak earn";
  if (age < 55) return "Acceler.";
  if (age < 60) return "De-risk";
  return "Retire";
}

// ── types ──────────────────────────────────────────────────────────────────────

interface SimInputs {
  age0: number;
  salary0: number;
  expense0: number;
  corpus0: number;
  inflation: number;
  corpusRate: number;
}

const RETIRE_AT = 60;

const SYSTEM_DEFAULTS: SimInputs = {
  age0: 28,
  salary0: 924000,
  expense0: 600000,
  corpus0: 1432000,
  inflation: 0.06,
  corpusRate: 0.10,
};

// ── InputBar ───────────────────────────────────────────────────────────────────

function InputBar({
  s,
  set,
  onReset,
}: {
  s: SimInputs;
  set: (patch: Partial<SimInputs>) => void;
  onReset: () => void;
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        mt: 1.5,
        borderRadius: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr) auto" },
        gap: 2,
        alignItems: "end",
      }}
    >
      {/* Current age */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6, textTransform: "uppercase", display: "block", mb: 0.5 }}>
          Current age · {s.age0}
        </Typography>
        <Slider
          min={20} max={55} value={s.age0}
          onChange={(_, v) => set({ age0: v as number })}
          size="small"
          sx={{ color: "primary.main" }}
        />
      </Box>

      {/* Annual salary */}
      <FormControl size="small" fullWidth>
        <InputLabel>Annual salary</InputLabel>
        <OutlinedInput
          label="Annual salary"
          type="number"
          value={s.salary0}
          onChange={(e) => set({ salary0: +e.target.value })}
          startAdornment={<InputAdornment position="start">₹</InputAdornment>}
          inputProps={{ step: 10000 }}
        />
      </FormControl>

      {/* Annual expenses */}
      <FormControl size="small" fullWidth>
        <InputLabel>Annual expenses</InputLabel>
        <OutlinedInput
          label="Annual expenses"
          type="number"
          value={s.expense0}
          onChange={(e) => set({ expense0: +e.target.value })}
          startAdornment={<InputAdornment position="start">₹</InputAdornment>}
          inputProps={{ step: 10000 }}
        />
      </FormControl>

      {/* Current corpus */}
      <FormControl size="small" fullWidth>
        <InputLabel>Current corpus</InputLabel>
        <OutlinedInput
          label="Current corpus"
          type="number"
          value={s.corpus0}
          onChange={(e) => set({ corpus0: +e.target.value })}
          startAdornment={<InputAdornment position="start">₹</InputAdornment>}
          inputProps={{ step: 10000 }}
        />
      </FormControl>

      {/* Inflation + corpus return sliders */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6, textTransform: "uppercase", display: "block", mb: 0.5 }}>
          Inflation {(s.inflation * 100).toFixed(1)}% · Return {(s.corpusRate * 100).toFixed(1)}%
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Slider
            min={3} max={9} step={0.5} value={s.inflation * 100}
            onChange={(_, v) => set({ inflation: (v as number) / 100 })}
            size="small"
            sx={{ color: "warning.main", flex: 1 }}
          />
          <Slider
            min={6} max={14} step={0.5} value={s.corpusRate * 100}
            onChange={(_, v) => set({ corpusRate: (v as number) / 100 })}
            size="small"
            sx={{ color: "success.main", flex: 1 }}
          />
        </Box>
      </Box>

      {/* Reset */}
      <Box sx={{ display: "flex", alignItems: "flex-end", pb: 0.5 }}>
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
          onClick={onReset}
          sx={{ color: "text.secondary", fontSize: 11 }}
        >
          Reset
        </Button>
      </Box>
    </Paper>
  );
}

// ── Gauge SVG ─────────────────────────────────────────────────────────────────

function GaugeSvg({ trackPct }: { trackPct: number }) {
  const cx = 110, cy = 100, r = 80;
  const angle = Math.PI * (trackPct / 200);
  const arc = (start: number, end: number) => {
    const x1 = cx - r * Math.cos(start), y1 = cy - r * Math.sin(start);
    const x2 = cx - r * Math.cos(end), y2 = cy - r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 220 110" style={{ width: 220, height: 110 }}>
      <path d={arc(0, Math.PI)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={arc(0, Math.PI * 0.5)} fill="none" stroke="#ef5350" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      <path d={arc(Math.PI * 0.5, Math.PI * 0.8)} fill="none" stroke="#ffa726" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      <path d={arc(Math.PI * 0.8, Math.PI)} fill="none" stroke="#4caf50" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      <line
        x1={cx} y1={cy}
        x2={cx - (r - 12) * Math.cos(angle)} y2={cy - (r - 12) * Math.sin(angle)}
        stroke="white" strokeWidth="3" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="white" />
    </svg>
  );
}

// ── HeroCards ─────────────────────────────────────────────────────────────────

function HeroCards({
  s,
  sim,
  retireAt,
}: {
  s: SimInputs;
  sim: SimRow[];
  retireAt: number;
}) {
  const yearsToRetire = retireAt - s.age0;
  const aggressive = targetCorpus(s.expense0, s.inflation, yearsToRetire, 25);
  const defensive = targetCorpus(s.expense0, s.inflation, yearsToRetire, 33);
  const projected = sim[sim.length - 1].corpus;

  const exp = expectedSim(s, retireAt);
  const expectedNow = s.age0 <= 20 ? 0 : exp[s.age0 - 20].corpus;

  const trackRatio = s.corpus0 / Math.max(expectedNow, 1);
  const trackPct = Math.min(200, Math.max(0, trackRatio * 100));
  const isAhead = trackRatio >= 1;
  const onTrackVsAggressive = projected / aggressive;
  const onTrackVsDefensive = projected / defensive;

  return (
    <Box
      sx={{
        mt: 1.5,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1.1fr" },
        gap: 1.5,
      }}
    >
      {/* Aggressive target */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          borderRadius: 2,
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(160deg, rgba(79,195,247,0.06), transparent 60%)"
              : "linear-gradient(160deg, rgba(25,118,210,0.05), transparent 60%)",
          border: "1px solid",
          borderColor: "rgba(79,195,247,0.4)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
            Aggressive target · 25× expenses
          </Typography>
          <Chip label="4% rule" size="small" color="primary" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
        </Box>
        <Typography variant="h4" fontFamily="monospace" fontWeight={700} sx={{ mt: 1, letterSpacing: -1 }}>
          {fmtInr(aggressive)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", lineHeight: 1.5 }}>
          Withdraw <strong>4%/year</strong> to cover{" "}
          {fmtInr(s.expense0 * Math.pow(1 + s.inflation, yearsToRetire))} of inflation-adjusted annual expenses at {retireAt}.
        </Typography>
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">Projected at {retireAt}</Typography>
          <Typography
            variant="caption"
            fontFamily="monospace"
            fontWeight={600}
            color={projected >= aggressive ? "success.main" : "warning.main"}
          >
            {fmtInr(projected)} · {(onTrackVsAggressive * 100).toFixed(0)}%
          </Typography>
        </Box>
      </Paper>

      {/* Defensive target */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          borderRadius: 2,
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(160deg, rgba(76,175,80,0.06), transparent 60%)"
              : "linear-gradient(160deg, rgba(56,142,60,0.05), transparent 60%)",
          border: "1px solid",
          borderColor: "rgba(76,175,80,0.4)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
            Defensive target · 33× expenses
          </Typography>
          <Chip label="3% rule" size="small" color="success" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
        </Box>
        <Typography variant="h4" fontFamily="monospace" fontWeight={700} sx={{ mt: 1, letterSpacing: -1 }}>
          {fmtInr(defensive)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", lineHeight: 1.5 }}>
          Withdraw <strong>3%/year</strong> — safer for early retirement, sequence-of-returns risk, or 30+ year horizons.
        </Typography>
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">Projected at {retireAt}</Typography>
          <Typography
            variant="caption"
            fontFamily="monospace"
            fontWeight={600}
            color={projected >= defensive ? "success.main" : "warning.main"}
          >
            {fmtInr(projected)} · {(onTrackVsDefensive * 100).toFixed(0)}%
          </Typography>
        </Box>
      </Paper>

      {/* On-track gauge */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
            Are you on track today?
          </Typography>
          <Chip
            label={isAhead ? "Ahead" : "Behind"}
            size="small"
            sx={{
              fontSize: 10,
              height: 20,
              bgcolor: isAhead ? "rgba(76,175,80,0.14)" : "rgba(255,167,38,0.14)",
              color: isAhead ? "success.main" : "warning.main",
              border: "1px solid",
              borderColor: isAhead ? "rgba(76,175,80,0.3)" : "rgba(255,167,38,0.3)",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1, position: "relative" }}>
          <GaugeSvg trackPct={trackPct} />
          <Box sx={{ position: "absolute", bottom: 0, textAlign: "center" }}>
            <Typography variant="h6" fontFamily="monospace" fontWeight={700} sx={{ lineHeight: 1 }}>
              {trackPct.toFixed(0)}<Typography component="span" variant="caption" color="text.secondary">%</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>
              of expected at {s.age0}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 0.75, fontSize: 12 }}>
          {[
            { label: `Expected corpus at ${s.age0}`, value: fmtInr(expectedNow) },
            { label: "You have", value: fmtInr(s.corpus0) },
            {
              label: isAhead ? "Ahead by" : "Behind by",
              value: (isAhead ? "+" : "−") + fmtInr(Math.abs(s.corpus0 - expectedNow)),
              color: isAhead ? "success.main" : "error.main",
            },
          ].map((row) => (
            <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">{row.label}</Typography>
              <Typography variant="caption" fontFamily="monospace" color={row.color ?? "text.primary"} fontWeight={row.color ? 600 : 400}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

// ── TrajectoryChart ────────────────────────────────────────────────────────────

function TrajectoryChart({
  sim,
  s,
  retireAt,
}: {
  sim: SimRow[];
  s: SimInputs;
  retireAt: number;
}) {
  const [showSalary, setShowSalary] = useState(false);
  const theme = useTheme();

  const yearsToRetire = retireAt - s.age0;
  const aggressive = targetCorpus(s.expense0, s.inflation, yearsToRetire, 25);
  const defensive = targetCorpus(s.expense0, s.inflation, yearsToRetire, 33);

  const exp = useMemo(() => expectedSim(s, retireAt), [s, retireAt]);
  const expectedAtToday = s.age0 <= 20 ? 0 : exp[s.age0 - 20].corpus;
  const expectedAtEnd = exp[exp.length - 1].corpus;
  const yourAtEnd = sim[sim.length - 1].corpus;
  const ahead = s.corpus0 >= expectedAtToday;

  const W = 900, H = 280;
  const PAD_L = 64, PAD_R = 80, PAD_T = 24, PAD_B = 44;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const ageMin = 20, ageMax = retireAt;
  const xToPx = (age: number) => PAD_L + ((age - ageMin) / (ageMax - ageMin)) * plotW;
  const yMax = Math.max(aggressive, defensive, yourAtEnd, expectedAtEnd) * 1.05;
  const yToPx = (v: number) => PAD_T + plotH - (v / yMax) * plotH;

  const expPts = exp.map((r) => `${xToPx(r.age)},${yToPx(r.corpus)}`).join(" ");
  const yourPts = sim.map((r) => `${xToPx(r.age)},${yToPx(r.corpus)}`).join(" ");
  const maxSalary = exp[exp.length - 1].salary;
  const ySalary = (v: number) => PAD_T + plotH - (v / (maxSalary * 1.1)) * plotH;
  const salaryPts = exp.map((r) => `${xToPx(r.age)},${ySalary(r.salary)}`).join(" ");
  const yTickVals = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];
  const textFill = theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const gridStroke = theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <Paper elevation={2} sx={{ p: 2.5, mt: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>Corpus trajectory · expected vs your path</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Cyan line is yours from today. Purple dashed line is the model's expected path from age 20 with ₹0.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "inline-flex",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: "3px",
          }}
        >
          <Box
            component="button"
            onClick={() => setShowSalary(!showSalary)}
            sx={{
              background: showSalary ? "action.selected" : "transparent",
              bgcolor: showSalary ? "action.selected" : "transparent",
              border: "none",
              color: showSalary ? "text.primary" : "text.secondary",
              px: 1.25, py: 0.5,
              borderRadius: 0.75,
              fontSize: 11, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 0.5,
              fontFamily: "inherit",
            }}
          >
            Salary
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: (t) => t.palette.mode === "dark" ? "#0a0b0b" : "#f9fafb", borderRadius: 1.25, border: "1px solid", borderColor: "divider", p: 1.5, overflow: "hidden" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <g stroke={gridStroke}>
            {yTickVals.map((v, i) => (
              <line key={i} x1={PAD_L} x2={W - PAD_R} y1={yToPx(v)} y2={yToPx(v)} strokeDasharray="2 4" />
            ))}
          </g>

          {/* Y labels left */}
          <g fontFamily="monospace" fontSize="10" fill={textFill} textAnchor="end">
            {yTickVals.map((v, i) => (
              <text key={i} x={PAD_L - 8} y={yToPx(v) + 3}>{fmtInr(v, )}</text>
            ))}
          </g>

          {/* Y salary labels right */}
          {showSalary && (
            <g fontFamily="monospace" fontSize="10" fill="#9575cd" textAnchor="start">
              {[0, maxSalary * 0.5, maxSalary].map((v, i) => (
                <text key={i} x={W - PAD_R + 8} y={ySalary(v) + 3}>{fmtInr(v)}</text>
              ))}
            </g>
          )}

          {/* Target lines */}
          <line x1={PAD_L} x2={W - PAD_R} y1={yToPx(aggressive)} y2={yToPx(aggressive)}
            stroke="#4FC3F7" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.65" />
          <text x={W - PAD_R - 4} y={yToPx(aggressive) - 5} textAnchor="end" fill="#4FC3F7" fontSize="10" fontWeight="600">
            25× · {fmtInr(aggressive)}
          </text>
          <line x1={PAD_L} x2={W - PAD_R} y1={yToPx(defensive)} y2={yToPx(defensive)}
            stroke="#4caf50" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.65" />
          <text x={W - PAD_R - 4} y={yToPx(defensive) - 5} textAnchor="end" fill="#4caf50" fontSize="10" fontWeight="600">
            33× · {fmtInr(defensive)}
          </text>

          {/* Today guide */}
          <line x1={xToPx(s.age0)} x2={xToPx(s.age0)} y1={PAD_T} y2={H - PAD_B}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 4" />
          <text x={xToPx(s.age0)} y={PAD_T - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={textFill}>
            today
          </text>

          {/* Expected path — dashed purple */}
          <polyline fill="none" stroke="#9575cd" strokeWidth="2" strokeDasharray="5 4" points={expPts} opacity="0.85" />

          {/* Your path */}
          <defs>
            <linearGradient id="stagesYouGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4FC3F7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon fill="url(#stagesYouGrad)"
            points={`${xToPx(s.age0)},${PAD_T + plotH} ${yourPts} ${xToPx(retireAt)},${PAD_T + plotH}`} />
          <polyline fill="none" stroke="#4FC3F7" strokeWidth="2.8" points={yourPts} />

          {/* Salary overlay */}
          {showSalary && (
            <polyline fill="none" stroke="#7e57c2" strokeWidth="1.4" strokeDasharray="2 4" opacity="0.55" points={salaryPts} />
          )}

          {/* X axis labels */}
          <g fontFamily="monospace" fontSize="10" fill={textFill} textAnchor="middle">
            {[20, 25, 30, 35, 40, 45, 50, 55, 60].filter((a) => a >= ageMin && a <= ageMax).map((a) => (
              <text key={a} x={xToPx(a)} y={H - PAD_B + 18}>{a}</text>
            ))}
            <text x={(PAD_L + W - PAD_R) / 2} y={H - PAD_B + 34} fontSize="9" fill={textFill} opacity="0.7">age</text>
          </g>

          {/* Markers */}
          <circle cx={xToPx(s.age0)} cy={yToPx(expectedAtToday)} r="4" fill="#9575cd" stroke="#0a0b0b" strokeWidth="2" />
          <circle cx={xToPx(s.age0)} cy={yToPx(s.corpus0)} r="5" fill="#4FC3F7" stroke="white" strokeWidth="2" />
          <circle cx={xToPx(retireAt)} cy={yToPx(yourAtEnd)} r="5" fill="#4FC3F7" stroke="white" strokeWidth="2" />
          <circle cx={xToPx(retireAt)} cy={yToPx(expectedAtEnd)} r="4" fill="#9575cd" stroke="#0a0b0b" strokeWidth="2" />

          {/* Gap callout */}
          {s.age0 > 20 && (
            <g>
              <line
                x1={xToPx(s.age0) + 7} x2={xToPx(s.age0) + 7}
                y1={yToPx(Math.min(s.corpus0, expectedAtToday))}
                y2={yToPx(Math.max(s.corpus0, expectedAtToday))}
                stroke={ahead ? "#4caf50" : "#ef5350"} strokeWidth="1.5" strokeDasharray="2 2"
              />
              <text x={xToPx(s.age0) + 12} y={yToPx((s.corpus0 + expectedAtToday) / 2) + 3}
                fontSize="10" fontFamily="monospace" fontWeight="600"
                fill={ahead ? "#4caf50" : "#ef5350"}>
                {ahead ? "+" : "−"}{fmtInr(Math.abs(s.corpus0 - expectedAtToday))}
              </text>
            </g>
          )}

          {/* End labels */}
          <text x={xToPx(retireAt) - 6} y={yToPx(yourAtEnd) - 8} fontSize="10" fill="#4FC3F7" fontWeight="700" textAnchor="end">
            you at {retireAt} · {fmtInr(yourAtEnd)}
          </text>
          <text x={xToPx(retireAt) - 6} y={yToPx(expectedAtEnd) + 14} fontSize="10" fill="#9575cd" fontWeight="600" textAnchor="end">
            expected · {fmtInr(expectedAtEnd)}
          </text>
        </svg>

        {/* Legend */}
        <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
          {[
            { color: "#4FC3F7", style: "solid", label: "Your path · from today" },
            { color: "#9575cd", style: "dashed", label: "Expected path · from age 20" },
            { color: "#4FC3F7", style: "dashed", label: "25× target" },
            { color: "#4caf50", style: "dashed", label: "33× target" },
            ...(showSalary ? [{ color: "#7e57c2", style: "dashed", label: "Annual salary" }] : []),
          ].map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {item.style === "solid" ? (
                <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: item.color, flexShrink: 0 }} />
              ) : (
                <Box component="span" sx={{ display: "inline-block", width: 16, height: 0, borderTop: `2px dashed ${item.color}`, verticalAlign: "middle", flexShrink: 0 }} />
              )}
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ── StagesTimeline ─────────────────────────────────────────────────────────────

function StagesTimeline({
  sim,
  s,
  retireAt,
}: {
  sim: SimRow[];
  s: SimInputs;
  retireAt: number;
}) {
  const start = Math.floor(s.age0 / 5) * 5;
  const stops: number[] = [];
  for (let a = start; a <= retireAt; a += 5) stops.push(a);
  while (stops.length < 8 && stops[0] - 5 >= 20) stops.unshift(stops[0] - 5);

  const stageRows = stops.map((age) => {
    if (age < s.age0) {
      return { age, corpus: 0, salary: 0, savePct: savingRate(age), placeholder: true };
    }
    const idx = age - s.age0;
    return { ...(sim[idx] ?? sim[sim.length - 1]), placeholder: false };
  });

  return (
    <Paper elevation={2} sx={{ p: 2.5, mt: 1.5, borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Milestones every 5 years</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Where you should be by each life stage. The colored bar shows the expected Need/Want/Save split at that age.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)", md: `repeat(${Math.min(stops.length, 8)}, 1fr)` },
          gap: 1,
          position: "relative",
        }}
      >
        {stageRows.map((r) => {
          const isCurrent =
            r.age === Math.ceil(s.age0 / 5) * 5 || (r.age === stops[0] && s.age0 === r.age);
          const isRetire = r.age === retireAt;
          const [nd, wt, sv] = needWantSave(r.age);
          return (
            <Paper
              key={r.age}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 1.25,
                border: "1px solid",
                borderColor: isCurrent ? "primary.main" : "divider",
                bgcolor: isCurrent ? "rgba(79,195,247,0.04)" : "action.hover",
              }}
            >
              <Typography
                variant="caption"
                fontFamily="monospace"
                sx={{ fontSize: 11, color: "text.secondary" }}
              >
                <Box component="strong" sx={{ color: isCurrent ? "primary.main" : "text.primary" }}>
                  Age {r.age}
                </Box>{" "}
                {isRetire && "🏁"}
              </Typography>

              <Typography
                variant="body1"
                fontFamily="monospace"
                fontWeight={700}
                sx={{
                  mt: 0.75,
                  fontSize: 17,
                  letterSpacing: -0.4,
                  color: r.placeholder ? "text.disabled" : isRetire ? "success.main" : "text.primary",
                }}
              >
                {r.placeholder ? "—" : fmtInr(r.corpus)}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: 10 }}>
                {r.placeholder ? "before start" : <>Salary {fmtInr(r.salary)}</>}
              </Typography>

              {/* Need/Want/Save bar */}
              <Box
                title={`Need ${nd}% · Want ${wt}% · Save ${sv}%`}
                sx={{ display: "flex", height: 4, borderRadius: 1, mt: 1.25, overflow: "hidden", bgcolor: "action.selected" }}
              >
                <Box sx={{ width: `${nd}%`, bgcolor: "#9575cd" }} />
                <Box sx={{ width: `${wt}%`, bgcolor: "#ffa726" }} />
                <Box sx={{ width: `${sv}%`, bgcolor: "#4caf50" }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                {[nd, wt, sv].map((v, i) => (
                  <Typography key={i} sx={{ fontSize: 9, fontFamily: "monospace", color: "text.disabled" }}>{v}</Typography>
                ))}
              </Box>

              <Typography sx={{ mt: 1, fontSize: 9, color: "text.disabled", textTransform: "uppercase", letterSpacing: 0.6 }}>
                {stageName(r.age)}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

// ── BudgetDonut ────────────────────────────────────────────────────────────────

function BudgetDonut({ s }: { s: SimInputs }) {
  const [nd, wt, sv] = needWantSave(s.age0);
  const monthlySalary = s.salary0 / 12;
  const cx = 100, cy = 100, r = 75, c = 2 * Math.PI * r;
  const dasharray = (p: number) => `${(p / 100) * c} ${c}`;
  const dashoffset = (off: number) => -((off / 100) * c);

  const rows = [
    {
      pct: nd,
      color: "#9575cd",
      label: "Needs",
      monthly: (monthlySalary * nd) / 100,
      desc: "Rent · EMIs · groceries · utilities · transport · insurance premiums · school fees.",
    },
    {
      pct: wt,
      color: "#ffa726",
      label: "Wants",
      monthly: (monthlySalary * wt) / 100,
      desc: "Eating out · OTT · travel · hobbies · upgrades. Discretionary, can be paused.",
    },
    {
      pct: sv,
      color: "#4caf50",
      label: "Save & invest",
      monthly: (monthlySalary * sv) / 100,
      desc: "SIPs · EPF/VPF · emergency fund · retirement corpus contributions.",
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={700}>Need · Want · Save — age {s.age0}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, mb: 2, lineHeight: 1.5 }}>
        The benchmark cash-flow split for your age band. Use this as a savings target in the Income screen.
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ width: 180, height: 180, position: "relative", flexShrink: 0 }}>
          <svg viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="22" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9575cd" strokeWidth="22"
              strokeDasharray={dasharray(nd)} strokeDashoffset={dashoffset(0)} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffa726" strokeWidth="22"
              strokeDasharray={dasharray(wt)} strokeDashoffset={dashoffset(nd)} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4caf50" strokeWidth="22"
              strokeDasharray={dasharray(sv)} strokeDashoffset={dashoffset(nd + wt)} />
          </svg>
          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10 }}>
              Age {s.age0}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1 }}>
              {stageName(s.age0)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 1.75 }}>
          {rows.map((row) => (
            <Box key={row.label} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box sx={{ width: 8, height: 38, borderRadius: "2px", bgcolor: row.color, flexShrink: 0, mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography variant="body2" fontWeight={500}>{row.label}</Typography>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                    {row.pct}%{" "}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                      {fmtInr(row.monthly)}/mo
                    </Typography>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block", mt: 0.25 }}>
                  {row.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ── ConnectGrid ────────────────────────────────────────────────────────────────

const CONNECT_ITEMS = [
  {
    icon: <SavingsIcon sx={{ fontSize: 14 }} />,
    title: "Net Worth → today's corpus",
    desc: '"Current corpus" auto-fills from your tracked assets minus liabilities.',
  },
  {
    icon: <ReceiptLongIcon sx={{ fontSize: 14 }} />,
    title: "Income → salary & expense baseline",
    desc: '"Annual salary" defaults to last 12 months of credits. "Annual expenses" sums all debit transactions.',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 14 }} />,
    title: "Projections → per-holding nominal",
    desc: "Stages projects a total corpus; Projections breaks today's holdings into nominal + real per-MF, PF, LIC.",
  },
  {
    icon: <FlagIcon sx={{ fontSize: 14 }} />,
    title: 'Goals → "Retire by 60"',
    desc: "Convert the gap into a Goal: if you're below 25×, a recurring SIP equal to deficit ÷ months remaining is suggested.",
  },
];

function ConnectGrid() {
  return (
    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={700}>How this connects to the rest of your data</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, mb: 2, lineHeight: 1.5 }}>
        Stages is the goal-setter. Other screens are the live ledger. Recurring SIPs you set here can pre-fill Income; today's corpus is read from Net Worth.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 1,
        }}
      >
        {CONNECT_ITEMS.map((item) => (
          <Paper
            key={item.title}
            elevation={0}
            sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}
          >
            <Box
              sx={{
                width: 24, height: 24, borderRadius: 0.75,
                bgcolor: "rgba(79,195,247,0.12)", color: "primary.main",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                mb: 1,
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="caption" fontWeight={600} sx={{ display: "block", fontSize: 12 }}>{item.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.4 }}>{item.desc}</Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

// ── AssumptionsAccord ──────────────────────────────────────────────────────────

function AssumptionsAccord() {
  const [open, setOpen] = useState(false);
  return (
    <Paper elevation={2} sx={{ mt: 1.5, borderRadius: 2, overflow: "hidden" }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          p: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>Assumption tables · steps 2, 3 &amp; 4</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            The age-wise saving rate, salary growth and corpus return underpinning every number above.
          </Typography>
        </Box>
        <IconButton size="small" sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            p: 2.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr 0.6fr" },
            gap: 3,
          }}
        >
          {/* Step 2 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, display: "block", mb: 1 }}>
              Step 2 — Need / Want / Save by age
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["From age", "Need", "Want", "Save"].map((h) => (
                    <TableCell key={h} align={h === "From age" ? "left" : "right"} sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, py: 0.75 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  [20, 70, 20, 10], [30, 60, 30, 10], [35, 55, 30, 15],
                  [40, 55, 25, 20], [45, 50, 25, 25], [50, 50, 20, 30],
                  [55, 40, 30, 30], [60, 40, 30, 30],
                ].map(([age, nd, wt, sv]) => (
                  <TableRow key={age}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5 }}>{age}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5 }}>{nd}%</TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5 }}>{wt}%</TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5, color: "success.main" }}>{sv}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Step 3 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, display: "block", mb: 1 }}>
              Step 3 — Salary growth by decade
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Decade", "YoY growth"].map((h) => (
                    <TableCell key={h} align={h === "Decade" ? "left" : "right"} sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, py: 0.75 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[["20s", "15%"], ["30s", "12%"], ["40s", "6%"], ["50s", "4%"]].map(([decade, growth]) => (
                  <TableRow key={decade}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5 }}>{decade}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5, color: "primary.main" }}>{growth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Step 4 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, display: "block", mb: 1 }}>
              Step 4 — Corpus return
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Type", "Rate"].map((h) => (
                    <TableCell key={h} align={h === "Type" ? "left" : "right"} sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, py: 0.75 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5 }}>Blended</TableCell>
                  <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12, py: 0.5, color: "success.main" }}>10%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1, lineHeight: 1.5, fontSize: 10 }}>
              Single weighted rate covering equity (12%), debt/PF (8%), insurance (4%) and cash (5.5%) in typical proportions.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Stages() {
  const dashQuery = useDashboardQuery();
  const salaryQuery = useSalaryQuery();
  const pfQuery = useProvidentFundQuery();

  const isLoading = dashQuery.isLoading || salaryQuery.isLoading || pfQuery.isLoading;

  // Derive defaults from live data
  const liveDefaults = useMemo<SimInputs>(() => {
    const corpus0 = Number(dashQuery.data?.totalAssets ?? SYSTEM_DEFAULTS.corpus0);
    const transactions = salaryQuery.data ?? [];
    const now = new Date();
    const cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const recent = transactions.filter((t) => new Date(t.date) >= cutoff);
    const salary0 = recent
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0) || SYSTEM_DEFAULTS.salary0;
    const expense0 = recent
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0) || SYSTEM_DEFAULTS.expense0;
    const age0 = pfQuery.data?.currentAge ?? SYSTEM_DEFAULTS.age0;
    return {
      age0: Math.min(Math.max(age0, 20), 55),
      salary0: salary0 > 0 ? salary0 : SYSTEM_DEFAULTS.salary0,
      expense0: expense0 > 0 ? expense0 : SYSTEM_DEFAULTS.expense0,
      corpus0: corpus0 > 0 ? corpus0 : SYSTEM_DEFAULTS.corpus0,
      inflation: SYSTEM_DEFAULTS.inflation,
      corpusRate: SYSTEM_DEFAULTS.corpusRate,
    };
  }, [dashQuery.data, salaryQuery.data, pfQuery.data]);

  const [s, setS] = useState<SimInputs | null>(null);
  const effectiveInputs = s ?? liveDefaults;
  const set = (patch: Partial<SimInputs>) => setS((p) => ({ ...(p ?? liveDefaults), ...patch }));
  const reset = () => setS(null);

  const sim = useMemo(
    () =>
      simulate({
        age0: effectiveInputs.age0,
        salary0: effectiveInputs.salary0,
        corpus0: effectiveInputs.corpus0,
        corpusRate: effectiveInputs.corpusRate,
        retireAt: RETIRE_AT,
      }),
    [effectiveInputs],
  );

  const yearsToRetire = RETIRE_AT - effectiveInputs.age0;
  const aggressive = targetCorpus(effectiveInputs.expense0, effectiveInputs.inflation, yearsToRetire, 25);
  const projected = sim[sim.length - 1].corpus;
  const belowTarget = projected < aggressive;

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 1340 }, mx: "auto" }}>
        <Skeleton variant="text" width={320} height={40} />
        <Skeleton variant="text" width={480} height={20} sx={{ mt: 0.5 }} />
        <Skeleton variant="rounded" height={88} sx={{ mt: 1.5, borderRadius: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr", gap: 1.5, mt: 1.5 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 2 }} />)}
        </Box>
        <Skeleton variant="rounded" height={320} sx={{ mt: 1.5, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 1.5, borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 1340 }, mx: "auto" }}
      data-testid="stages-container"
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
            Stages · are you on track to retire at {RETIRE_AT}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 620, lineHeight: 1.6 }}>
            Maps the "Corpus Stage by Age" calculator into a live screen. Inputs come from your real data;
            the milestone targets show where you should be at every 5-year mark.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            sx={{ fontSize: 12 }}
          >
            Export PDF
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<FlagIcon sx={{ fontSize: 14 }} />}
            disabled={!belowTarget}
            sx={{ fontSize: 12 }}
            title={belowTarget ? "Create a retirement SIP goal to close the gap" : "You're already projected to hit the 25× target"}
          >
            {belowTarget ? "Convert to Goal" : "On Track"}
          </Button>
        </Box>
      </Box>

      <InputBar s={effectiveInputs} set={set} onReset={reset} />
      <HeroCards s={effectiveInputs} sim={sim} retireAt={RETIRE_AT} />
      <TrajectoryChart sim={sim} s={effectiveInputs} retireAt={RETIRE_AT} />
      <StagesTimeline sim={sim} s={effectiveInputs} retireAt={RETIRE_AT} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          gap: 1.5,
          mt: 1.5,
        }}
      >
        <BudgetDonut s={effectiveInputs} />
        <ConnectGrid />
      </Box>

      <AssumptionsAccord />
    </Box>
  );
}
