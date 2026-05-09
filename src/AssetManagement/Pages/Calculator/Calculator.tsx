import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LaptopIcon from "@mui/icons-material/Laptop";
import HomeIcon from "@mui/icons-material/Home";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import SchoolIcon from "@mui/icons-material/School";
import FlightIcon from "@mui/icons-material/Flight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import { type ReactNode } from "react";

// ── Types & helpers ───────────────────────────────────────────────────────────

type CatId = "bike" | "car" | "phone" | "laptop" | "home" | "appl" | "course" | "trip";
type Period = "mo" | "yr" | "once" | "2yr" | "3yr";

interface RunItem {
  label: string;
  amount: number;
  period: Period;
}

const PERIOD_LABEL: Record<Period, string> = {
  mo: "/month",
  yr: "/year",
  once: "one-time",
  "2yr": "/2 years",
  "3yr": "/3 years",
};

function toMonthly(amount: number, period: Period, horizonMonths = 60): number {
  switch (period) {
    case "mo":   return amount;
    case "yr":   return amount / 12;
    case "once": return amount / horizonMonths;
    case "2yr":  return amount / 24;
    case "3yr":  return amount / 36;
  }
}

function calc5yRunning(items: RunItem[]): number {
  return items.reduce((sum, r) => sum + toMonthly(r.amount, r.period) * 60, 0);
}

function calcEmi(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fmtInr(val: number): string {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${Math.round(val)}`;
}

const MONTHLY_INCOME = 150000;

// ── Product categories ────────────────────────────────────────────────────────

interface Cat {
  id: CatId;
  label: string;
  icon: ReactNode;
  defaultSticker: number;
  defaultModel: string;
}

const PRODUCT_CATS: Cat[] = [
  { id: "bike",   label: "Bike",      icon: <TwoWheelerIcon fontSize="small" />,        defaultSticker: 210000,  defaultModel: "Royal Enfield Classic 350" },
  { id: "car",    label: "Car",       icon: <DirectionsCarIcon fontSize="small" />,      defaultSticker: 1400000, defaultModel: "Maruti Brezza" },
  { id: "phone",  label: "Phone",     icon: <PhoneAndroidIcon fontSize="small" />,       defaultSticker: 140000,  defaultModel: "iPhone 16 Pro" },
  { id: "laptop", label: "Laptop",    icon: <LaptopIcon fontSize="small" />,             defaultSticker: 130000,  defaultModel: "MacBook Air M3" },
  { id: "home",   label: "Home",      icon: <HomeIcon fontSize="small" />,               defaultSticker: 8000000, defaultModel: "2BHK Apartment" },
  { id: "appl",   label: "Appliance", icon: <ElectricalServicesIcon fontSize="small" />, defaultSticker: 45000,   defaultModel: "Samsung AC 1.5T" },
  { id: "course", label: "Course",    icon: <SchoolIcon fontSize="small" />,             defaultSticker: 80000,   defaultModel: "Data Science Bootcamp" },
  { id: "trip",   label: "Trip",      icon: <FlightIcon fontSize="small" />,             defaultSticker: 120000,  defaultModel: "Europe 10-day trip" },
];

// ── Running cost templates per category ───────────────────────────────────────

const RUN_COSTS_DEFAULT: Record<CatId, RunItem[]> = {
  bike: [
    { label: "Petrol",          amount: 2400,  period: "mo" },
    { label: "Service",         amount: 3000,  period: "yr" },
    { label: "Insurance",       amount: 4500,  period: "yr" },
    { label: "Tyres + spares",  amount: 6000,  period: "2yr" },
    { label: "Depreciation est",amount: 25000, period: "yr" },
  ],
  car: [
    { label: "Fuel / charging", amount: 8000,  period: "mo" },
    { label: "Service",         amount: 12000, period: "yr" },
    { label: "Insurance",       amount: 22000, period: "yr" },
    { label: "Tyres + spares",  amount: 25000, period: "3yr" },
    { label: "Parking",         amount: 2000,  period: "mo" },
    { label: "Depreciation est",amount: 150000,period: "yr" },
  ],
  phone: [
    { label: "Case + screen guard",   amount: 2500,  period: "once" },
    { label: "AppleCare / insurance", amount: 14000, period: "once" },
    { label: "Repair allowance",      amount: 6000,  period: "3yr" },
  ],
  laptop: [
    { label: "Accessories",    amount: 8000,  period: "once" },
    { label: "AppleCare",      amount: 22000, period: "once" },
    { label: "Software / SaaS",amount: 1200,  period: "mo" },
  ],
  home: [
    { label: "Society maintenance", amount: 4500,  period: "mo" },
    { label: "Property tax",        amount: 18000, period: "yr" },
    { label: "Repairs / paint",     amount: 40000, period: "3yr" },
    { label: "Insurance",           amount: 4000,  period: "yr" },
  ],
  appl: [
    { label: "Power",               amount: 600,  period: "mo" },
    { label: "AMC / service",       amount: 3500, period: "yr" },
    { label: "Repairs post-warranty",amount: 4000, period: "3yr" },
  ],
  course: [
    { label: "Materials / books", amount: 4000, period: "once" },
    { label: "Exam fees",         amount: 6500, period: "once" },
    { label: "Travel to class",   amount: 800,  period: "mo" },
  ],
  trip: [
    { label: "Visa + insurance",  amount: 8500, period: "once" },
    { label: "Local transport",   amount: 1200, period: "mo" },
    { label: "Buffer (10%)",      amount: 0,    period: "once" },
  ],
};

// ── Comparison alternatives per category ──────────────────────────────────────

interface AltOption {
  name: string;
  sub: string;
  sticker: number;
  runCosts: RunItem[];
  verdict: "BEST" | "GOOD" | "MAYBE";
}

const COMPARE_ALTS: Record<CatId, AltOption[]> = {
  bike: [
    {
      name: "Royal Enfield 350", sub: "EMI ~₹5.3k/mo", verdict: "MAYBE",
      sticker: 210000,
      runCosts: [
        { label: "Petrol", amount: 2400, period: "mo" },
        { label: "Service", amount: 3000, period: "yr" },
        { label: "Insurance", amount: 4500, period: "yr" },
        { label: "Spares + dep.", amount: 35000, period: "yr" },
      ],
    },
    {
      name: "Honda Activa 6G", sub: "EMI ~₹2.4k/mo", verdict: "BEST",
      sticker: 85000,
      runCosts: [
        { label: "Petrol", amount: 1200, period: "mo" },
        { label: "Service", amount: 1600, period: "yr" },
        { label: "Insurance", amount: 3000, period: "yr" },
        { label: "Spares + dep.", amount: 10000, period: "yr" },
      ],
    },
    {
      name: "Cab + Metro", sub: "No asset purchase", verdict: "GOOD",
      sticker: 0,
      runCosts: [
        { label: "Cab monthly", amount: 4500, period: "mo" },
        { label: "Metro pass", amount: 600, period: "mo" },
        { label: "Rentals (occ.)", amount: 4000, period: "yr" },
      ],
    },
  ],
  car: [
    {
      name: "Maruti Brezza", sub: "Mid-range SUV", verdict: "MAYBE",
      sticker: 1400000,
      runCosts: [
        { label: "Fuel", amount: 8000, period: "mo" },
        { label: "Service", amount: 12000, period: "yr" },
        { label: "Insurance", amount: 22000, period: "yr" },
        { label: "Spares + dep.", amount: 80000, period: "yr" },
      ],
    },
    {
      name: "Maruti Alto K10", sub: "Budget hatchback", verdict: "BEST",
      sticker: 550000,
      runCosts: [
        { label: "Fuel", amount: 5000, period: "mo" },
        { label: "Service", amount: 6000, period: "yr" },
        { label: "Insurance", amount: 10000, period: "yr" },
        { label: "Spares + dep.", amount: 30000, period: "yr" },
      ],
    },
    {
      name: "Leased / Subscription", sub: "Zoomcar / subscription", verdict: "GOOD",
      sticker: 0,
      runCosts: [
        { label: "Subscription fee", amount: 15000, period: "mo" },
        { label: "Insurance incl.", amount: 0, period: "once" },
      ],
    },
  ],
  phone: [
    { name: "iPhone 16 Pro", sub: "Premium flagship", verdict: "MAYBE", sticker: 140000, runCosts: [{ label: "AppleCare", amount: 14000, period: "once" }, { label: "Case + guard", amount: 2500, period: "once" }] },
    { name: "Samsung S24", sub: "Android flagship", verdict: "GOOD", sticker: 80000, runCosts: [{ label: "Insurance", amount: 8000, period: "once" }, { label: "Case + guard", amount: 1500, period: "once" }] },
    { name: "OnePlus 12R", sub: "Value flagship", verdict: "BEST", sticker: 42000, runCosts: [{ label: "Case + guard", amount: 1000, period: "once" }] },
  ],
  laptop: [
    { name: "MacBook Air M3", sub: "Apple silicon", verdict: "MAYBE", sticker: 130000, runCosts: [{ label: "AppleCare", amount: 22000, period: "once" }, { label: "Software", amount: 1200, period: "mo" }] },
    { name: "Dell XPS 15", sub: "Windows premium", verdict: "GOOD", sticker: 110000, runCosts: [{ label: "Warranty ext.", amount: 8000, period: "once" }, { label: "Software", amount: 800, period: "mo" }] },
    { name: "Lenovo IdeaPad 5", sub: "Budget workhorse", verdict: "BEST", sticker: 60000, runCosts: [{ label: "Accessories", amount: 5000, period: "once" }] },
  ],
  home: [
    { name: "2BHK Own Purchase", sub: "Loan + down payment", verdict: "MAYBE", sticker: 8000000, runCosts: [{ label: "Maintenance", amount: 4500, period: "mo" }, { label: "Property tax", amount: 18000, period: "yr" }, { label: "Repairs", amount: 40000, period: "3yr" }] },
    { name: "2BHK Rental", sub: "No asset", verdict: "GOOD", sticker: 0, runCosts: [{ label: "Rent", amount: 25000, period: "mo" }, { label: "Deposit (amort.)", amount: 75000, period: "once" }] },
    { name: "1BHK Own Purchase", sub: "Lower ticket size", verdict: "BEST", sticker: 5500000, runCosts: [{ label: "Maintenance", amount: 3500, period: "mo" }, { label: "Property tax", amount: 12000, period: "yr" }] },
  ],
  appl:   [
    { name: "Samsung AC 1.5T 5★", sub: "Premium efficiency", verdict: "GOOD", sticker: 55000, runCosts: [{ label: "Power", amount: 500, period: "mo" }, { label: "AMC", amount: 3000, period: "yr" }] },
    { name: "Voltas AC 1.5T 3★", sub: "Budget pick", verdict: "BEST", sticker: 35000, runCosts: [{ label: "Power", amount: 800, period: "mo" }, { label: "AMC", amount: 2500, period: "yr" }] },
    { name: "Window AC 1.5T", sub: "Oldest format", verdict: "MAYBE", sticker: 28000, runCosts: [{ label: "Power", amount: 1000, period: "mo" }, { label: "AMC", amount: 2000, period: "yr" }] },
  ],
  course: [
    { name: "Full Bootcamp", sub: "6-month intensive", verdict: "MAYBE", sticker: 150000, runCosts: [{ label: "Books", amount: 4000, period: "once" }, { label: "Travel", amount: 800, period: "mo" }] },
    { name: "Online Self-paced", sub: "Coursera / Udemy", verdict: "BEST", sticker: 12000, runCosts: [{ label: "Exam fees", amount: 6500, period: "once" }] },
    { name: "Part-time weekend", sub: "3-month programme", verdict: "GOOD", sticker: 50000, runCosts: [{ label: "Books", amount: 2000, period: "once" }, { label: "Travel", amount: 600, period: "mo" }] },
  ],
  trip: [
    { name: "Europe 10 days", sub: "Flights + hotels", verdict: "MAYBE", sticker: 180000, runCosts: [{ label: "Visa + insurance", amount: 8500, period: "once" }, { label: "Transport daily", amount: 1200, period: "mo" }] },
    { name: "South-East Asia", sub: "Budget destination", verdict: "BEST", sticker: 80000, runCosts: [{ label: "Visa", amount: 3000, period: "once" }, { label: "Transport daily", amount: 600, period: "mo" }] },
    { name: "Domestic Hill Stn", sub: "Manali / Coorg", verdict: "GOOD", sticker: 30000, runCosts: [{ label: "Road trip fuel", amount: 4000, period: "once" }] },
  ],
};

const VERDICT_COLORS = {
  BEST:  { color: "success.main", bgcolor: "success.light" },
  GOOD:  { color: "primary.main", bgcolor: "primary.light" },
  MAYBE: { color: "warning.main", bgcolor: "warning.light" },
};

// ── CategoryChips ─────────────────────────────────────────────────────────────

function CategoryChips({
  selected,
  onChange,
  size = "medium",
}: {
  selected: CatId;
  onChange: (id: CatId) => void;
  size?: "small" | "medium";
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {PRODUCT_CATS.map((c) => (
        <Chip
          key={c.id}
          icon={<Box sx={{ display: "flex" }}>{c.icon}</Box>}
          label={c.label}
          onClick={() => onChange(c.id)}
          variant={selected === c.id ? "filled" : "outlined"}
          color={selected === c.id ? "primary" : "default"}
          size={size}
          sx={{ cursor: "pointer" }}
        />
      ))}
    </Box>
  );
}

// ── RunningCostEditor ─────────────────────────────────────────────────────────

function RunningCostEditor({
  items,
  onChange,
}: {
  items: RunItem[];
  onChange: (items: RunItem[]) => void;
}) {
  const update = (i: number, amount: number) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, amount } : it));
    onChange(next);
  };
  const addRow = () =>
    onChange([...items, { label: "Custom cost", amount: 0, period: "mo" }]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((it, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }}>
            {it.label}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={it.amount}
            onChange={(e) => update(i, Number(e.target.value))}
            sx={{ width: 110 }}
            slotProps={{ input: { inputProps: { min: 0 } } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
            {PERIOD_LABEL[it.period]}
          </Typography>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addRow} sx={{ alignSelf: "flex-start" }}>
        Add cost
      </Button>
    </Box>
  );
}

// ── TCO stacked bar ───────────────────────────────────────────────────────────

const BAR_COLORS = ["#1c1c1c", "#1976d2", "#388e3c", "#f9a825", "#d32f2f", "#757575"];

function TcoBar({
  sticker,
  items,
  total,
}: {
  sticker: number;
  items: RunItem[];
  total: number;
}) {
  const segments = [
    { label: "Sticker", value: sticker },
    ...items.map((it) => ({
      label: it.label,
      value: toMonthly(it.amount, it.period) * 60,
    })),
  ].filter((s) => s.value > 0);

  return (
    <Box>
      <Box sx={{ display: "flex", height: 20, borderRadius: 1, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
        {segments.map((s, i) => (
          <Tooltip key={i} title={`${s.label}: ${fmtInr(s.value)}`} arrow>
            <Box
              sx={{
                width: `${(s.value / total) * 100}%`,
                bgcolor: BAR_COLORS[i % BAR_COLORS.length],
                minWidth: s.value > 0 ? 4 : 0,
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
        {segments.map((s, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: BAR_COLORS[i % BAR_COLORS.length] }} />
            <Typography variant="caption">{s.label} {Math.round((s.value / total) * 100)}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Section A: TCO Reveal ─────────────────────────────────────────────────────

function TcoReveal() {
  const [catId, setCatId] = useState<CatId>("bike");
  const [model, setModel] = useState("Royal Enfield Classic 350");
  const [sticker, setSticker] = useState(210000);
  const [runCosts, setRunCosts] = useState<RunItem[]>(RUN_COSTS_DEFAULT.bike);
  const [payHow, setPayHow] = useState<"full" | "emi">("emi");
  const [tenureMonths, setTenureMonths] = useState(36);
  const [rate, setRate] = useState(11.5);

  const handleCatChange = (id: CatId) => {
    const cat = PRODUCT_CATS.find((c) => c.id === id)!;
    setCatId(id);
    setModel(cat.defaultModel);
    setSticker(cat.defaultSticker);
    setRunCosts([...RUN_COSTS_DEFAULT[id]]);
  };

  const running5y = calc5yRunning(runCosts);
  const tco = sticker + running5y;
  const ratio = sticker > 0 ? (tco / sticker).toFixed(1) : "—";

  const principal = payHow === "emi" ? sticker * 0.8 : sticker;
  const emi = payHow === "emi" ? calcEmi(principal, rate, tenureMonths) : 0;
  const monthlyRunning = runCosts.reduce((s, r) => s + toMonthly(r.amount, r.period), 0);
  const trueMonthly = emi + monthlyRunning;
  const truePct = (trueMonthly / MONTHLY_INCOME) * 100;

  const verdict = truePct > 40 ? "NO" : truePct > 28 ? "MAYBE" : "YES";
  const verdictReason =
    verdict === "YES"
      ? "TCO + EMI fit comfortably within your income."
      : verdict === "NO"
      ? `True monthly cost (${fmtInr(trueMonthly)}) exceeds 40% of income.`
      : `Sticker fits, but TCO + EMI use ${truePct.toFixed(0)}% of income.`;

  const VerdictIcon = verdict === "YES" ? CheckCircleIcon : verdict === "NO" ? CancelIcon : HelpIcon;
  const verdictColor = verdict === "YES" ? "success" : verdict === "NO" ? "error" : "warning";

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Section A — TCO Reveal: sticker vs reality
      </Typography>

      {/* Category picker */}
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 1 }}>
        What are you buying?
      </Typography>
      <CategoryChips selected={catId} onChange={handleCatChange} />

      {/* Model + price */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 2, mt: 2 }}>
        <TextField label="Model" value={model} onChange={(e) => setModel(e.target.value)} size="small" />
        <TextField
          label="Sticker price (₹)"
          type="number"
          value={sticker}
          onChange={(e) => setSticker(Number(e.target.value))}
          size="small"
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
      </Box>

      {/* Financing */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Chip
          label="Pay in Full"
          variant={payHow === "full" ? "filled" : "outlined"}
          color={payHow === "full" ? "primary" : "default"}
          onClick={() => setPayHow("full")}
          sx={{ cursor: "pointer" }}
        />
        <Chip
          label="EMI"
          variant={payHow === "emi" ? "filled" : "outlined"}
          color={payHow === "emi" ? "primary" : "default"}
          onClick={() => setPayHow("emi")}
          sx={{ cursor: "pointer" }}
        />
      </Box>
      {payHow === "emi" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tenure: {tenureMonths} months
            </Typography>
            <Slider value={tenureMonths} onChange={(_, v) => setTenureMonths(v as number)} min={6} max={84} step={6} size="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Interest: {rate}% p.a.
            </Typography>
            <Slider value={rate} onChange={(_, v) => setRate(v as number)} min={6} max={24} step={0.25} size="small" color="warning" />
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Running costs editor */}
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 1.5 }}>
        You also pay (edit any value)
      </Typography>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
        <RunningCostEditor items={runCosts} onChange={setRunCosts} />
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* The big reveal */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">STICKER</Typography>
          <Typography variant="h5" fontWeight={600}>{fmtInr(sticker)}</Typography>
        </Box>
        <Typography variant="h5" color="text.secondary">→</Typography>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">REAL 5-YEAR COST</Typography>
          <Typography variant="h4" fontWeight={800} color="error.main">{fmtInr(tco)}</Typography>
          {sticker > 0 && (
            <Typography variant="caption" color="error.main">{ratio}× the sticker</Typography>
          )}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 1 }}>
        What makes up {fmtInr(tco)}
      </Typography>
      <TcoBar sticker={sticker} items={runCosts} total={tco} />

      <Divider sx={{ my: 2 }} />

      {/* Verdict */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: `${verdictColor}.main`,
          bgcolor: `${verdictColor}.light`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <VerdictIcon sx={{ fontSize: 36, color: `${verdictColor}.main` }} />
        <Box>
          <Typography variant="h5" fontWeight={800} color={`${verdictColor}.main`}>
            {verdict}
          </Typography>
          <Typography variant="body2">{verdictReason}</Typography>
          {payHow === "emi" && (
            <Typography variant="caption" color="text.secondary">
              EMI {fmtInr(emi)} + running {fmtInr(monthlyRunning)} = true monthly {fmtInr(trueMonthly)}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// ── Section B: Category-Aware EMI Sandbox ────────────────────────────────────

function CategorySandbox() {
  const theme = useTheme();
  const [catId, setCatId] = useState<CatId>("bike");
  const [loanAmt, setLoanAmt] = useState(210000);
  const [downPayPct, setDownPayPct] = useState(24);
  const [tenureYears, setTenureYears] = useState(3);
  const [rate, setRate] = useState(11.5);
  const [runCosts, setRunCosts] = useState<RunItem[]>(RUN_COSTS_DEFAULT.bike);

  const handleCatChange = (id: CatId) => {
    const cat = PRODUCT_CATS.find((c) => c.id === id)!;
    setCatId(id);
    setLoanAmt(cat.defaultSticker);
    setRunCosts([...RUN_COSTS_DEFAULT[id]]);
  };

  const principal = loanAmt * (1 - downPayPct / 100);
  const tenureMonths = tenureYears * 12;
  const emi = calcEmi(principal, rate, tenureMonths);
  const monthlyRunning = runCosts.reduce((s, r) => s + toMonthly(r.amount, r.period), 0);
  const trueMonthly = emi + monthlyRunning;
  const tco5y = loanAmt + calc5yRunning(runCosts);
  const fits = (trueMonthly / MONTHLY_INCOME) * 100 <= 40;

  const chartData = useMemo(() => {
    const points = [];
    for (let y = 0; y <= 5; y++) {
      points.push({
        year: `Y${y}`,
        sticker: y === 0 ? loanAmt : loanAmt,
        tco: loanAmt + calc5yRunning(runCosts) * (y / 5),
      });
    }
    return points;
  }, [loanAmt, runCosts]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Section B — Category-Aware Sandbox
      </Typography>

      <CategoryChips selected={catId} onChange={handleCatChange} size="small" />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 3 }}>
        {/* Left: financing sliders */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 2 }}>
            Financing
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Loan amount: {fmtInr(loanAmt)}
              </Typography>
              <Slider value={loanAmt} onChange={(_, v) => setLoanAmt(v as number)} min={10000} max={10000000} step={10000} size="small" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Down payment: {downPayPct}% ({fmtInr(loanAmt * downPayPct / 100)})
              </Typography>
              <Slider value={downPayPct} onChange={(_, v) => setDownPayPct(v as number)} min={0} max={80} step={5} size="small" color="success" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tenure: {tenureYears}y ({tenureMonths}mo)
              </Typography>
              <Slider value={tenureYears} onChange={(_, v) => setTenureYears(v as number)} min={1} max={30} step={1} size="small" color="info" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Interest rate: {rate}% p.a.
              </Typography>
              <Slider value={rate} onChange={(_, v) => setRate(v as number)} min={4} max={24} step={0.25} size="small" color="warning" />
            </Box>
          </Box>
        </Box>

        {/* Right: running costs */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
              Running costs — {PRODUCT_CATS.find((c) => c.id === catId)?.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
              auto-filled, editable
            </Typography>
          </Box>
          <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
            <RunningCostEditor items={runCosts} onChange={setRunCosts} />
          </Paper>
        </Box>
      </Box>

      {/* Live readout */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mt: 3 }}>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">EMI</Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{fmtInr(emi)}</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: "warning.light" }}>
          <Typography variant="caption" color="text.secondary">RUNNING/MO</Typography>
          <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>{fmtInr(monthlyRunning)}</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: "center", bgcolor: fits ? "success.light" : "error.light" }}>
          <Typography variant="caption" color="text.secondary">TRUE MONTHLY</Typography>
          <Typography variant="h6" fontWeight={700} color={fits ? "success.main" : "error.main"} sx={{ mt: 0.5 }}>
            {fmtInr(trueMonthly)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {((trueMonthly / MONTHLY_INCOME) * 100).toFixed(0)}% of income
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">5Y TCO</Typography>
          <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>{fmtInr(tco5y)}</Typography>
        </Paper>
      </Box>

      {/* Sticker vs TCO chart */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 1 }}>
          Cumulative cost · 5 years (sticker line vs real TCO line)
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtInr(v)} />
            <RechartTooltip formatter={(v: number) => fmtInr(v)} />
            <Legend />
            <Line type="monotone" dataKey="sticker" name="Sticker only" stroke={theme.palette.text.secondary} strokeWidth={2} strokeDasharray="5 4" dot={false} />
            <Line type="monotone" dataKey="tco" name="Real TCO" stroke={theme.palette.error.main} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

// ── Section C: Compare Alternatives ──────────────────────────────────────────

function CompareAlternatives() {
  const theme = useTheme();
  const [catId, setCatId] = useState<CatId>("bike");

  const handleCatChange = (id: CatId) => setCatId(id);

  const alts = COMPARE_ALTS[catId];

  const altData = alts.map((alt) => ({
    ...alt,
    running5y: calc5yRunning(alt.runCosts),
    tco: alt.sticker + calc5yRunning(alt.runCosts),
    trueMonthly: calcEmi(alt.sticker * 0.8, 11.5, 36) + alt.runCosts.reduce((s, r) => s + toMonthly(r.amount, r.period), 0),
  }));

  const chartData = [0, 1, 2, 3, 4, 5].map((y) => {
    const pt: Record<string, number | string> = { year: `Y${y}` };
    altData.forEach((alt, i) => {
      pt[`opt${i}`] = alt.sticker + calc5yRunning(alt.runCosts) * (y / 5);
    });
    return pt;
  });

  const lineColors = [theme.palette.warning.main, theme.palette.success.main, theme.palette.primary.main];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Section C — Compare Alternatives (with TCO)
      </Typography>

      <CategoryChips selected={catId} onChange={handleCatChange} size="small" />

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mt: 3 }}>
        {altData.map((alt, i) => {
          const vc = VERDICT_COLORS[alt.verdict];
          return (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: vc.bgcolor,
                border: "1px solid",
                borderColor: vc.color,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {alt.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {alt.sub}
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Chip label={alt.verdict} size="small" sx={{ bgcolor: vc.color, color: "#fff", fontWeight: 700 }} />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.8, textTransform: "uppercase", display: "block", mb: 1 }}>
                5-Year TCO Breakdown
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
                {alt.sticker > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption">Sticker</Typography>
                    <Typography variant="caption" fontFamily="monospace">{fmtInr(alt.sticker)}</Typography>
                  </Box>
                )}
                {alt.runCosts.map((r, j) => (
                  <Box key={j} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption">{r.label}</Typography>
                    <Typography variant="caption" fontFamily="monospace">
                      {fmtInr(toMonthly(r.amount, r.period) * 60)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">TOTAL TCO</Typography>
                  <Typography variant="body2" fontWeight={700} color={vc.color}>{fmtInr(alt.tco)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">True monthly</Typography>
                  <Typography variant="body2" fontFamily="monospace">{fmtInr(alt.trueMonthly)}</Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Cumulative cost chart */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase", display: "block", mb: 1 }}>
          Cumulative cost · all options · 5 years
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtInr(v)} />
            <RechartTooltip formatter={(v: number) => fmtInr(v)} />
            <Legend />
            {altData.map((alt, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`opt${i}`}
                name={alt.name}
                stroke={lineColors[i]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Calculator() {
  return (
    <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }} data-testid="calculator-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Affordability Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          See the real cost of ownership — not just the sticker price. Compare alternatives, simulate EMI, and make smarter purchase decisions.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <TcoReveal />
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <CategorySandbox />
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <CompareAlternatives />
      </Paper>
    </Box>
  );
}
