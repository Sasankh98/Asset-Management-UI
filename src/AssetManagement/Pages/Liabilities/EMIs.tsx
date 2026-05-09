import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LaptopIcon from "@mui/icons-material/Laptop";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EmiKind = "phone" | "laptop" | "tv" | "appliance" | "credit_card" | "other";

interface Emi {
  id: number;
  name: string;
  kind: EmiKind;
  totalAmt: number;
  emiAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDay: number; // day of month
  startDate: string; // YYYY-MM-DD
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtInr(val: number): string {
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const KIND_META: Record<EmiKind, { icon: ReactNode; color: string; label: string }> = {
  phone:       { icon: <PhoneAndroidIcon />, color: "#1976d2", label: "Phone" },
  laptop:      { icon: <LaptopIcon />,       color: "#7b1fa2", label: "Laptop" },
  tv:          { icon: <TvIcon />,           color: "#0288d1", label: "TV" },
  appliance:   { icon: <KitchenIcon />,      color: "#388e3c", label: "Appliance" },
  credit_card: { icon: <CreditCardIcon />,   color: "#d32f2f", label: "Credit Card" },
  other:       { icon: <ShoppingBagIcon />,  color: "#757575", label: "Other" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function nextDueLabel(emi: Emi): string {
  const today = new Date();
  const thisMonth = today.getDate() <= emi.nextDueDay
    ? new Date(today.getFullYear(), today.getMonth(), emi.nextDueDay)
    : new Date(today.getFullYear(), today.getMonth() + 1, emi.nextDueDay);
  return `${emi.nextDueDay} ${MONTHS[thisMonth.getMonth()]}`;
}

function daysUntilDue(emi: Emi): number {
  const today = new Date();
  const thisMonth = today.getDate() <= emi.nextDueDay
    ? new Date(today.getFullYear(), today.getMonth(), emi.nextDueDay)
    : new Date(today.getFullYear(), today.getMonth() + 1, emi.nextDueDay);
  return Math.ceil((thisMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const EMPTY_EMI: Omit<Emi, "id"> = {
  name: "", kind: "phone", totalAmt: 0, emiAmount: 0,
  totalInstallments: 12, paidInstallments: 0, nextDueDay: 1,
  startDate: new Date().toISOString().slice(0, 10),
};

const SEED_EMIS: Emi[] = [
  { id: 1, name: "iPhone 15 Pro",       kind: "phone",     totalAmt: 92000,  emiAmount: 7800,  totalInstallments: 12, paidInstallments: 6,  nextDueDay: 12, startDate: "2024-11-01" },
  { id: 2, name: "MacBook Air M3",       kind: "laptop",    totalAmt: 130000, emiAmount: 10900, totalInstallments: 12, paidInstallments: 3,  nextDueDay: 5,  startDate: "2025-02-01" },
  { id: 3, name: "Samsung OLED TV 55\"", kind: "tv",        totalAmt: 85000,  emiAmount: 4250,  totalInstallments: 20, paidInstallments: 14, nextDueDay: 20, startDate: "2023-10-01" },
  { id: 4, name: "HDFC Credit Card",     kind: "credit_card", totalAmt: 45000, emiAmount: 9000, totalInstallments: 5,  paidInstallments: 2,  nextDueDay: 25, startDate: "2025-01-01" },
];

let nextId = SEED_EMIS.length + 1;

// ── Calendar view ─────────────────────────────────────────────────────────────

function PaymentCalendar({ emis }: { emis: Emi[] }) {
  const theme = useTheme();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map of day → EMIs due that day
  const byDay = new Map<number, Emi[]>();
  emis.forEach((e) => {
    if (!byDay.has(e.nextDueDay)) byDay.set(e.nextDueDay, []);
    byDay.get(e.nextDueDay)!.push(e);
  });

  // Start day of month (0=Sun)
  const startDow = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDow });
  const totalOutflow = emis.reduce((s, e) => s + e.emiAmount, 0);

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {MONTHS[month]} {year} · Payment Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emis.length} active EMI{emis.length !== 1 ? "s" : ""} due this month
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">MONTHLY OUTFLOW</Typography>
          <Typography variant="h6" fontWeight={700} color="error.main">{fmtInr(totalOutflow)}</Typography>
        </Box>
      </Box>

      {/* Day-of-week headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <Typography key={d} variant="caption" color="text.secondary" align="center" fontWeight={600}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
        {blanks.map((_, i) => <Box key={`b${i}`} />)}
        {days.map((day) => {
          const dayEmis = byDay.get(day) ?? [];
          const isToday = day === today.getDate();
          const hasDue = dayEmis.length > 0;
          return (
            <Box
              key={day}
              sx={{
                minHeight: 52,
                borderRadius: 1,
                border: "1px solid",
                borderColor: isToday ? "primary.main" : hasDue ? "error.light" : "divider",
                bgcolor: hasDue ? "error.light" : isToday ? "primary.light" : "transparent",
                p: 0.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={isToday ? 700 : 400}
                color={isToday ? "primary.main" : "text.secondary"}
              >
                {day}
              </Typography>
              {dayEmis.map((e) => (
                <Tooltip key={e.id} title={`${e.name}: ${fmtInr(e.emiAmount)}`}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="error.main"
                    sx={{ fontSize: "0.6rem", lineHeight: 1.2 }}
                  >
                    {fmtInr(e.emiAmount)}
                  </Typography>
                </Tooltip>
              ))}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ── Upcoming payments list ────────────────────────────────────────────────────

function UpcomingPayments({ emis }: { emis: Emi[] }) {
  const sorted = [...emis].sort((a, b) => daysUntilDue(a) - daysUntilDue(b));

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Upcoming Payments
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {sorted.map((e, i) => {
          const days = daysUntilDue(e);
          const urgency = days <= 3 ? "error" : days <= 7 ? "warning" : "default";
          return (
            <Box key={e.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: urgency === "error" ? "error.light" : urgency === "warning" ? "warning.light" : "action.hover",
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color={`${urgency}.main`} sx={{ lineHeight: 1 }}>
                    {nextDueLabel(e).split(" ")[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                    {nextDueLabel(e).split(" ")[1]}
                  </Typography>
                </Paper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{e.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {days === 0 ? "Due today" : `Due in ${days} day${days !== 1 ? "s" : ""}`}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700}>{fmtInr(e.emiAmount)}</Typography>
                <Chip label="Pay" size="small" color={urgency === "error" ? "error" : "primary"} variant="outlined" />
              </Box>
              {i < sorted.length - 1 && <Divider />}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ── EMI Dialog ────────────────────────────────────────────────────────────────

function EmiDialog({
  open, initial, onSave, onClose,
}: {
  open: boolean;
  initial: Omit<Emi, "id">;
  onSave: (e: Omit<Emi, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Omit<Emi, "id">, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial.name ? "Edit EMI" : "Add EMI / Installment"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Item Name" value={form.name} onChange={(e) => set("name", e.target.value)} size="small" />
            <TextField select label="Category" value={form.kind} onChange={(e) => set("kind", e.target.value)} size="small">
              {Object.entries(KIND_META).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Total Cost (₹)" type="number" value={form.totalAmt} onChange={(e) => set("totalAmt", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
            <TextField label="EMI Amount (₹)" type="number" value={form.emiAmount} onChange={(e) => set("emiAmount", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField label="Total Installments" type="number" value={form.totalInstallments} onChange={(e) => set("totalInstallments", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 1 } } }} />
            <TextField label="Paid So Far" type="number" value={form.paidInstallments} onChange={(e) => set("paidInstallments", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
            <TextField label="Due Day of Month" type="number" value={form.nextDueDay} onChange={(e) => set("nextDueDay", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 1, max: 31 } } }} />
          </Box>
          <TextField label="Start Date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onSave(form); }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── EMI card ──────────────────────────────────────────────────────────────────

function EmiCard({ emi, onEdit, onDelete }: { emi: Emi; onEdit: () => void; onDelete: () => void }) {
  const meta = KIND_META[emi.kind];
  const remaining = emi.totalInstallments - emi.paidInstallments;
  const paidPct = Math.round((emi.paidInstallments / emi.totalInstallments) * 100);
  const totalRemaining = remaining * emi.emiAmount;
  const days = daysUntilDue(emi);
  const isUrgent = days <= 3;
  const isDone = remaining === 0;

  return (
    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, opacity: isDone ? 0.7 : 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ color: meta.color }}>{meta.icon}</Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>{emi.name}</Typography>
            <Typography variant="caption" color="text.secondary">{meta.label}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {isDone && <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />}
          {!isDone && (
            <Chip
              label={isUrgent ? `Due in ${days}d` : `Due ${nextDueLabel(emi)}`}
              size="small"
              color={isUrgent ? "error" : "default"}
              variant={isUrgent ? "filled" : "outlined"}
            />
          )}
          <Tooltip title="Edit"><IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {emi.paidInstallments} of {emi.totalInstallments} paid
          </Typography>
          <Typography variant="caption" color="text.secondary">{paidPct}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={paidPct}
          sx={{
            height: 8, borderRadius: 4, bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: isDone ? "success.main" : isUrgent ? "error.main" : "primary.main",
            },
          }}
        />
      </Box>

      {/* Bottom row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">EMI</Typography>
            <Typography variant="body2" fontWeight={700}>{fmtInr(emi.emiAmount)}/mo</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">REMAINING</Typography>
            <Typography variant="body2" fontWeight={700} color={isDone ? "success.main" : "text.primary"}>
              {isDone ? "Done!" : `${remaining} mos · ${fmtInr(totalRemaining)}`}
            </Typography>
          </Box>
        </Box>
        {!isDone && <Chip label="Pay Now" size="small" color={isUrgent ? "error" : "primary"} />}
      </Box>
    </Paper>
  );
}

// ── Main EMIs page ────────────────────────────────────────────────────────────

export default function EMIs() {
  const [emis, setEmis] = useState<Emi[]>(SEED_EMIS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Emi | null>(null);

  const activeEmis = emis.filter((e) => e.paidInstallments < e.totalInstallments);
  const completedEmis = emis.filter((e) => e.paidInstallments >= e.totalInstallments);
  const totalMonthlyOut = activeEmis.reduce((s, e) => s + e.emiAmount, 0);
  const totalRemaining  = activeEmis.reduce((s, e) => s + (e.totalInstallments - e.paidInstallments) * e.emiAmount, 0);

  const openAdd  = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (e: Emi) => { setEditTarget(e); setDialogOpen(true); };
  const handleDelete = (id: number) => setEmis((p) => p.filter((e) => e.id !== id));
  const handleSave = (form: Omit<Emi, "id">) => {
    if (editTarget) {
      setEmis((p) => p.map((e) => e.id === editTarget.id ? { ...form, id: e.id } : e));
    } else {
      setEmis((p) => [...p, { ...form, id: nextId++ }]);
    }
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 960, mx: "auto" }} data-testid="emis-container">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>EMIs & Installments</Typography>
          <Typography variant="body2" color="text.secondary">
            Electronics, credit card, and short-term installments — with payment calendar.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add EMI</Button>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
        {[
          { label: "Active EMIs",      value: String(activeEmis.length),  color: "primary.main" },
          { label: "Monthly Outflow",  value: fmtInr(totalMonthlyOut),    color: "error.main" },
          { label: "Total Remaining",  value: fmtInr(totalRemaining),     color: "warning.main" },
        ].map((k) => (
          <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
              {k.label}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>{k.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Calendar */}
      {activeEmis.length > 0 && <PaymentCalendar emis={activeEmis} />}

      {/* Upcoming payments */}
      {activeEmis.length > 0 && <UpcomingPayments emis={activeEmis} />}

      {/* EMI cards */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Active</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {activeEmis.map((e) => (
          <EmiCard key={e.id} emi={e} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} />
        ))}
      </Box>

      {completedEmis.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
            Completed
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {completedEmis.map((e) => (
              <EmiCard key={e.id} emi={e} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} />
            ))}
          </Box>
        </>
      )}

      <EmiDialog
        open={dialogOpen}
        initial={editTarget ?? EMPTY_EMI}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
