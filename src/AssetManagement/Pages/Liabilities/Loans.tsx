import { useState } from "react";
import { useLoansQuery } from "../../../hooks/queries";
import { useLoansMutation } from "../../../hooks/mutations";
import type { Loan as ApiLoan } from "../../../../server/types";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { type ReactNode } from "react";
import Skeleton from "@mui/material/Skeleton";
import { fmtInr } from "../../../utils/formatCurrency";

// ── Types ─────────────────────────────────────────────────────────────────────

type LoanKind = "home" | "vehicle" | "personal" | "business";

interface Loan {
  id: number;
  name: string;
  kind: LoanKind;
  totalAmt: number;
  paidAmt: number;
  emi: number;
  dueDate: string;
  tenureLeft: string;
  interestRate: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_META: Record<LoanKind, { icon: ReactNode; color: string; label: string }> = {
  home:     { icon: <HomeIcon />,         color: "#1976d2", label: "Home Loan" },
  vehicle:  { icon: <DirectionsCarIcon />, color: "#f9a825", label: "Vehicle Loan" },
  personal: { icon: <PersonIcon />,        color: "#757575", label: "Personal Loan" },
  business: { icon: <BusinessIcon />,      color: "#7b1fa2", label: "Business Loan" },
};

const EMPTY_LOAN: Omit<Loan, "id"> = {
  name: "", kind: "home", totalAmt: 0, paidAmt: 0,
  emi: 0, dueDate: "", tenureLeft: "", interestRate: 0,
};

const USER = "Sasankh";

// ── Loan Dialog ───────────────────────────────────────────────────────────────

function LoanDialog({
  open, initial, onSave, onClose,
}: {
  open: boolean;
  initial: Omit<Loan, "id">;
  onSave: (l: Omit<Loan, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Omit<Loan, "id">, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial.name ? "Edit Loan" : "Add Loan"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Loan Name" value={form.name} onChange={(e) => set("name", e.target.value)} size="small" />
            <TextField select label="Type" value={form.kind} onChange={(e) => set("kind", e.target.value)} size="small">
              {Object.entries(KIND_META).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField label="Total Loan (₹)" type="number" value={form.totalAmt} onChange={(e) => set("totalAmt", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
            <TextField label="Amount Paid (₹)" type="number" value={form.paidAmt} onChange={(e) => set("paidAmt", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
            <TextField label="Monthly EMI (₹)" type="number" value={form.emi} onChange={(e) => set("emi", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0 } } }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField label="Interest Rate (%)" type="number" value={form.interestRate} onChange={(e) => set("interestRate", Number(e.target.value))} size="small" slotProps={{ input: { inputProps: { min: 0, step: 0.1 } } }} />
            <TextField label="Next Due Date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} size="small" placeholder="e.g. 5 Jun" />
            <TextField label="Tenure Remaining" value={form.tenureLeft} onChange={(e) => set("tenureLeft", e.target.value)} size="small" placeholder="e.g. 14y left" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onSave(form); }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Loan Card ─────────────────────────────────────────────────────────────────

function LoanCard({ loan, onEdit, onDelete }: { loan: Loan; onEdit: () => void; onDelete: () => void }) {
  const meta = KIND_META[loan.kind];
  const paidPct = Math.min(100, Math.round((loan.paidAmt / loan.totalAmt) * 100));
  const outstanding = loan.totalAmt - loan.paidAmt;

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ color: meta.color }}>{meta.icon}</Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>{loan.name}</Typography>
            <Typography variant="caption" color="text.secondary">{meta.label} · {loan.interestRate}% p.a.</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>{loan.tenureLeft}</Typography>
          <Tooltip title="Edit"><IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {fmtInr(loan.paidAmt)} paid
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={paidPct}
            sx={{
              height: 10, borderRadius: 5, bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": { bgcolor: "success.main", borderRadius: 5 },
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {fmtInr(loan.totalAmt)} total
        </Typography>
      </Box>

      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">OUTSTANDING</Typography>
          <Typography variant="body2" fontWeight={700} color="error.main">{fmtInr(outstanding)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">PAID</Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">{paidPct}%</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">MONTHLY EMI</Typography>
          <Typography variant="body2" fontWeight={700}>{fmtInr(loan.emi)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">DUE DATE</Typography>
          <Typography variant="body2" fontWeight={700}>{loan.dueDate}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Prepaying ₹1L saves ~{fmtInr(loan.interestRate * 1000 * 0.6)} in interest
        </Typography>
        <Chip label="Prepay" size="small" variant="outlined" color="primary" />
      </Box>
    </Paper>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function coerce(l: ApiLoan): Loan {
  return {
    ...l,
    kind: l.kind as LoanKind,
    totalAmt: Number(l.totalAmt),
    paidAmt: Number(l.paidAmt),
    emi: Number(l.emi),
    interestRate: Number(l.interestRate),
  };
}

export default function Loans() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Loan | null>(null);

  const { data: rawLoans, isLoading } = useLoansQuery();
  const { createLoan, updateLoan, deleteLoan } = useLoansMutation();

  const loans: Loan[] = (rawLoans ?? []).map(coerce);

  const totalDebt    = loans.reduce((s, l) => s + l.totalAmt, 0);
  const totalPaid    = loans.reduce((s, l) => s + l.paidAmt, 0);
  const monthlyEmi   = loans.reduce((s, l) => s + l.emi, 0);
  const outstanding  = totalDebt - totalPaid;

  const openAdd  = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (l: Loan) => { setEditTarget(l); setDialogOpen(true); };

  const handleDelete = async (id: number) => {
    await deleteLoan.mutateAsync(id);
  };

  const handleSave = async (form: Omit<Loan, "id">) => {
    const payload = { ...form, user: USER };
    if (editTarget) {
      await updateLoan.mutateAsync({ id: editTarget.id, data: payload as never });
    } else {
      await createLoan.mutateAsync(payload as never);
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={120} height={36} />
            <Skeleton variant="text" width={280} height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
        {/* KPI strip */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
        {/* Loan cards */}
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={160} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 960 }, mx: "auto" }} data-testid="loans-container">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Loans</Typography>
          <Typography variant="body2" color="text.secondary">
            Home, vehicle and personal loans with repayment progress.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Loan</Button>
      </Box>

      {loans.length === 0 ? (
        /* Empty state — no loans yet */
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 2,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              opacity: 0.15,
            }}
          >
            <HomeIcon sx={{ fontSize: 28, color: "common.white" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>No loans tracked yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 3, lineHeight: 1.7 }}>
            Add a home, vehicle, education or personal loan to see EMI schedules, amortization, prepayment scenarios, and total interest impact on your net worth.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add Loan
          </Button>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", mt: 2.5 }}>
            {["Home loan", "Vehicle", "Education", "Personal"].map((l) => (
              <Chip key={l} label={l} size="small" variant="outlined" />
            ))}
          </Box>
        </Paper>
      ) : (
        <>
          {/* KPI strip — only when there are loans */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            {[
              { label: "Total Debt",    value: fmtInr(totalDebt),   color: "error.main" },
              { label: "Outstanding",   value: fmtInr(outstanding),  color: "warning.main" },
              { label: "Paid Off",      value: fmtInr(totalPaid),    color: "success.main" },
              { label: "Monthly EMI",   value: fmtInr(monthlyEmi),   color: "text.primary" },
            ].map((k) => (
              <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
                  {k.label}
                </Typography>
                <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>{k.value}</Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {loans.map((l) => (
              <LoanCard key={l.id} loan={l} onEdit={() => openEdit(l)} onDelete={() => handleDelete(l.id)} />
            ))}
          </Box>
        </>
      )}

      <LoanDialog
        open={dialogOpen}
        initial={editTarget ?? EMPTY_LOAN}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
