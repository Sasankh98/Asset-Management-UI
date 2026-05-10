import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import { type CreateMutualFundsDTO, type MutualFund } from "../../../../../server/types";
import { type RefreshDataProps, useAssetManagementContext } from "../../../ContextProvider/ContextProvider";
import MutualFundService from "../../../../services/MutualFunds/MutualFundsService";
import { MutualFundTypes } from "../../../../shared/Constants";

// ── MFAPI helpers ────────────────────────────────────────────────────────────

interface MfOption { schemeCode: number; schemeName: string; }
interface NavEntry { date: Date; nav: number; }

async function searchFunds(query: string): Promise<MfOption[]> {
  if (query.length < 2) return [];
  const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
  const json = await res.json() as MfOption[];
  return Array.isArray(json) ? json.slice(0, 20) : [];
}

async function fetchNavHistory(schemeCode: number): Promise<{ sorted: NavEntry[]; latest: number }> {
  const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
  const json = await res.json() as { data?: { date: string; nav: string }[] };
  const raw = json.data ?? [];
  const latest = parseFloat(raw[0]?.nav ?? "0");
  // MFAPI date format: "DD-MM-YYYY" → convert & sort oldest-first
  const sorted: NavEntry[] = raw
    .map((d) => {
      const [dd, mm, yyyy] = d.date.split("-").map(Number);
      return { date: new Date(yyyy, mm - 1, dd), nav: parseFloat(d.nav) };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return { sorted, latest };
}

function navOnOrAfter(sorted: NavEntry[], target: Date): number | null {
  for (const e of sorted) {
    if (e.date >= target) return e.nav;
  }
  return null;
}

function addPeriod(d: Date, freq: string): Date {
  const n = new Date(d);
  if (freq === "monthly")    n.setMonth(n.getMonth() + 1);
  else if (freq === "quarterly") n.setMonth(n.getMonth() + 3);
  else n.setFullYear(n.getFullYear() + 1);
  return n;
}

interface SipResult {
  totalInvested: number;
  totalUnits: number;
  avgNav: number;
  currentNav: number;
  currentValue: number;
  installments: number;
  absReturn: number;
  absReturnPct: number;
}

async function computeSip(
  schemeCode: number,
  sipAmount: number,
  freq: string,
  startDate: string,
  endDate: string,
): Promise<SipResult> {
  const { sorted, latest } = await fetchNavHistory(schemeCode);
  const end = endDate ? new Date(endDate) : new Date();
  let cur = new Date(startDate);
  let totalInvested = 0;
  let totalUnits = 0;
  let installments = 0;

  while (cur <= end) {
    const nav = navOnOrAfter(sorted, cur);
    if (nav !== null) {
      totalInvested += sipAmount;
      totalUnits += sipAmount / nav;
      installments++;
    }
    cur = addPeriod(cur, freq);
  }

  const avgNav = totalUnits > 0 ? totalInvested / totalUnits : 0;
  const currentValue = totalUnits * latest;
  const absReturn = currentValue - totalInvested;
  const absReturnPct = totalInvested > 0 ? (absReturn / totalInvested) * 100 : 0;

  return { totalInvested, totalUnits, avgNav, currentNav: latest, currentValue, installments, absReturn, absReturnPct };
}

async function fetchLatestNav(schemeCode: number): Promise<number | null> {
  try {
    const { latest } = await fetchNavHistory(schemeCode);
    return latest > 0 ? latest : null;
  } catch { return null; }
}

// ── Component ────────────────────────────────────────────────────────────────

type InvestType = "lumpsum" | "sip";
type SipFreq = "monthly" | "quarterly" | "yearly";

interface Props {
  open: boolean;
  type: "create" | "edit" | undefined;
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  selectedMutualFund?: MutualFund;
}

const EMPTY: CreateMutualFundsDTO = {
  fundName: "", category: "", invested: 0,
  currentValue: 0, units: 0, nav: 0, targetAmount: 0, user: "Sasankh",
  equityPct: undefined, debtPct: undefined, cashPct: undefined,
  realEstatePct: undefined, hedgedEquityPct: undefined,
};

const MutualFundModal = ({ open, type, handleClose, setRefreshData, selectedMutualFund }: Props) => {
  const [form, setForm]           = useState<CreateMutualFundsDTO>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [options, setOptions]     = useState<MfOption[]>([]);
  const [inputVal, setInputVal]   = useState("");
  const [searching, setSearching] = useState(false);
  const [navFetching, setNavFetching] = useState(false);
  const [schemeCode, setSchemeCode]   = useState<number | null>(null);
  const [navSource, setNavSource]     = useState<"mfapi" | "manual">("manual");

  // SIP state
  const [investType, setInvestType] = useState<InvestType>("lumpsum");
  const [sipAmount, setSipAmount]   = useState(5000);
  const [sipFreq, setSipFreq]       = useState<SipFreq>("monthly");
  const [sipStart, setSipStart]     = useState("");
  const [sipEnd, setSipEnd]         = useState("");
  const [sipResult, setSipResult]   = useState<SipResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError]   = useState("");

  const { setSnackBarOptions } = useAssetManagementContext();

  useEffect(() => {
    if (type === "edit" && selectedMutualFund) {
      setForm({
        fundName:        selectedMutualFund.fundName        ?? "",
        category:        selectedMutualFund.category        ?? "",
        invested:        selectedMutualFund.invested        ?? 0,
        currentValue:    selectedMutualFund.currentValue    ?? 0,
        units:           selectedMutualFund.units           ?? 0,
        nav:             selectedMutualFund.nav             ?? 0,
        targetAmount:    selectedMutualFund.targetProgress  ?? 0,
        user:            "Sasankh",
        equityPct:       selectedMutualFund.equityPct       ?? undefined,
        debtPct:         selectedMutualFund.debtPct         ?? undefined,
        cashPct:         selectedMutualFund.cashPct         ?? undefined,
        realEstatePct:   selectedMutualFund.realEstatePct   ?? undefined,
        hedgedEquityPct: selectedMutualFund.hedgedEquityPct ?? undefined,
      });
      setInputVal(selectedMutualFund.fundName ?? "");
    } else {
      setForm(EMPTY);
      setInputVal("");
      setOptions([]);
    }
    setSchemeCode(null);
    setNavSource("manual");
    setInvestType("lumpsum");
    setSipResult(null);
    setCalcError("");
  }, [type, selectedMutualFund, open]);

  // Debounced MFAPI search
  useEffect(() => {
    if (inputVal.length < 2) { setOptions([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setOptions(await searchFunds(inputVal)); }
      catch { /* ignore */ }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [inputVal]);

  // Auto-compute currentValue in lumpsum mode when nav/units change
  useEffect(() => {
    if (investType === "lumpsum" && navSource === "mfapi" && form.nav > 0 && form.units > 0) {
      setForm((f) => ({ ...f, currentValue: parseFloat((f.nav * f.units).toFixed(2)) }));
    }
  }, [form.nav, form.units, navSource, investType]);

  const set = <K extends keyof CreateMutualFundsDTO>(k: K, v: CreateMutualFundsDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFundSelect = async (opt: MfOption) => {
    set("fundName", opt.schemeName);
    setInputVal(opt.schemeName);
    setSchemeCode(opt.schemeCode);
    setSipResult(null);
    setNavFetching(true);
    const nav = await fetchLatestNav(opt.schemeCode);
    setNavFetching(false);
    if (nav !== null) {
      setNavSource("mfapi");
      setForm((f) => ({
        ...f,
        fundName: opt.schemeName,
        nav,
        currentValue: f.units > 0 ? parseFloat((nav * f.units).toFixed(2)) : f.currentValue,
      }));
    }
  };

  const handleCalculateSip = async () => {
    if (!schemeCode) { setCalcError("Select a fund from the search to calculate SIP."); return; }
    if (!sipStart)   { setCalcError("Set a SIP start date."); return; }
    setCalcError("");
    setCalculating(true);
    try {
      const result = await computeSip(schemeCode, sipAmount, sipFreq, sipStart, sipEnd);
      setSipResult(result);
      // Populate form with calculated values
      setForm((f) => ({
        ...f,
        invested: parseFloat(result.totalInvested.toFixed(2)),
        units: parseFloat(result.totalUnits.toFixed(4)),
        nav: parseFloat(result.currentNav.toFixed(4)),
        currentValue: parseFloat(result.currentValue.toFixed(2)),
      }));
    } catch {
      setCalcError("Failed to fetch NAV history. Try again.");
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.fundName || !form.invested || !form.units || !form.category) {
      setSnackBarOptions({ open: true, message: "Fund name, category, invested and units are required", severity: "error" });
      return;
    }
    setSaving(true);
    try {
      if (type === "create") {
        await MutualFundService().postMutualFundDetails(form);
        setSnackBarOptions({ open: true, message: "Mutual fund added successfully", severity: "success" });
      } else {
        await MutualFundService().updateMutualFundDetails(selectedMutualFund?.id, form);
        setSnackBarOptions({ open: true, message: "Mutual fund updated successfully", severity: "success" });
      }
      setRefreshData((prev) => ({ ...prev, refreshMutualFunds: !prev.refreshMutualFunds }));
      handleClose();
    } catch {
      setSnackBarOptions({ open: true, message: "Failed to save fund", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const isSipReady = investType === "sip" && !!schemeCode && !!sipStart;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {type === "create" ? "Add Mutual Fund" : "Edit Mutual Fund"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

          {/* Fund search */}
          <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(opt) => typeof opt === "string" ? opt : opt.schemeName}
            filterOptions={(x) => x}
            inputValue={inputVal}
            onInputChange={(_, val) => { setInputVal(val); set("fundName", val); if (!val) setSchemeCode(null); }}
            onChange={(_, val) => { if (val && typeof val !== "string") handleFundSelect(val); }}
            loading={searching}
            renderOption={(props, opt) => (
              <Box component="li" {...props} key={opt.schemeCode}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>{opt.schemeName}</Typography>
                  <Typography variant="caption" color="text.secondary">Code: {opt.schemeCode}</Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Fund Name"
                size="small"
                placeholder="e.g. Parag Parikh, HDFC Mid Cap"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />

          {/* Category */}
          <TextField select label="Category" value={form.category}
            onChange={(e) => set("category", e.target.value)} size="small">
            {MutualFundTypes.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.name}</MenuItem>
            ))}
          </TextField>

          {/* Investment type toggle */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Investment Type
            </Typography>
            <ToggleButtonGroup
              value={investType}
              exclusive
              onChange={(_, v) => { if (v) { setInvestType(v as InvestType); setSipResult(null); setCalcError(""); } }}
              size="small"
            >
              <ToggleButton value="lumpsum" sx={{ px: 3 }}>Lumpsum</ToggleButton>
              <ToggleButton value="sip" sx={{ px: 3 }}>SIP</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* ── SIP section ───────────────────────────────────────────────── */}
          {investType === "sip" && (
            <>
              <Divider>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>SIP DETAILS</Typography>
              </Divider>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                  label="SIP Amount (₹)"
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  size="small"
                  slotProps={{ input: { inputProps: { min: 100 } } }}
                />
                <TextField select label="Frequency" value={sipFreq}
                  onChange={(e) => setSipFreq(e.target.value as SipFreq)} size="small">
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField label="Start Date" type="date" value={sipStart}
                  onChange={(e) => setSipStart(e.target.value)} size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="End Date (blank = today)" type="date" value={sipEnd}
                  onChange={(e) => setSipEnd(e.target.value)} size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Box>

              {calcError && <Alert severity="warning" sx={{ py: 0 }}>{calcError}</Alert>}

              <Button
                variant="outlined"
                onClick={handleCalculateSip}
                disabled={calculating || !isSipReady}
                startIcon={undefined}
              >
                {calculating ? "Calculating SIP returns…" : "Calculate SIP Returns"}
              </Button>

              {!schemeCode && (
                <Typography variant="caption" color="text.secondary">
                  Select a fund from search to enable automatic SIP calculation using historical NAVs.
                </Typography>
              )}

              {sipResult && (
                <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  {[
                    { label: "Installments",  value: String(sipResult.installments) },
                    { label: "Total Invested", value: sipResult.totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) },
                    { label: "Total Units",    value: sipResult.totalUnits.toFixed(3) },
                    { label: "Avg NAV",        value: sipResult.avgNav.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) },
                    { label: "Current NAV",    value: sipResult.currentNav.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) },
                    { label: "Current Value",  value: sipResult.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) },
                  ].map((r) => (
                    <Box key={r.label}>
                      <Typography variant="caption" color="text.secondary">{r.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{r.value}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Chip
                      label={`${sipResult.absReturn >= 0 ? "+" : ""}${sipResult.absReturn.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" })} (${sipResult.absReturnPct >= 0 ? "+" : ""}${sipResult.absReturnPct.toFixed(2)}%) absolute return`}
                      color={sipResult.absReturn >= 0 ? "success" : "error"}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* ── Lumpsum / review section ──────────────────────────────────── */}
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              {investType === "sip" ? "CALCULATED VALUES (EDITABLE)" : "INVESTMENT DETAILS"}
            </Typography>
          </Divider>

          {navSource === "mfapi" && investType === "lumpsum" && (
            <Chip label={`NAV live: ₹${form.nav}`} size="small" color="success" variant="outlined" sx={{ alignSelf: "flex-start" }} />
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Invested Amount (₹)" type="number" value={form.invested || ""}
              onChange={(e) => set("invested", Number(e.target.value))} size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }} />
            <TextField label="Units" type="number" value={form.units || ""}
              onChange={(e) => set("units", Number(e.target.value))} size="small"
              slotProps={{ input: { inputProps: { min: 0, step: 0.001 } } }} />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label={navSource === "mfapi" ? "NAV (₹) — live" : "NAV (₹)"}
              type="number" value={form.nav || ""}
              onChange={(e) => { set("nav", Number(e.target.value)); setNavSource("manual"); }}
              size="small" slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }} />
            <TextField
              label="Current Value (₹)"
              type="number" value={form.currentValue || ""}
              onChange={(e) => { set("currentValue", Number(e.target.value)); setNavSource("manual"); }}
              size="small" slotProps={{ input: { inputProps: { min: 0 } } }}
              helperText={navSource === "mfapi" && investType === "lumpsum" ? "Auto: units × NAV" : undefined} />
          </Box>

          {form.invested > 0 && form.currentValue > 0 && (
            <Box sx={{ px: 0.5 }}>
              {(() => {
                const gl = form.currentValue - form.invested;
                const pct = form.invested > 0 ? (gl / form.invested) * 100 : 0;
                return (
                  <Typography variant="caption" color={gl >= 0 ? "success.main" : "error.main"}>
                    Gain/Loss: <b>₹{Math.round(gl).toLocaleString("en-IN")} ({gl >= 0 ? "+" : ""}{pct.toFixed(2)}%)</b>
                  </Typography>
                );
              })()}
            </Box>
          )}

          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>GOAL</Typography>
          </Divider>

          <TextField label="Target Amount (₹)" type="number" value={form.targetAmount || ""}
            onChange={(e) => set("targetAmount", Number(e.target.value))} size="small"
            helperText="Your goal corpus for this fund"
            slotProps={{ input: { inputProps: { min: 0 } } }} />

          {/* ── Portfolio Allocation ──────────────────────────────────────── */}
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              PORTFOLIO ALLOCATION
            </Typography>
          </Divider>

          <Typography variant="caption" color="text.secondary">
            Updated monthly by the fund house — enter the % breakdown of this fund's holdings.
            Leave blank to use category-based allocation in the dashboard.
          </Typography>

          {(() => {
            const fields: { key: keyof CreateMutualFundsDTO; label: string; help: string }[] = [
              { key: "equityPct",       label: "Equity %",        help: "Pure equity (long only)" },
              { key: "hedgedEquityPct", label: "Hedged Equity %", help: "Equity with downside hedges" },
              { key: "debtPct",         label: "Debt %",          help: "Bonds, NCDs, T-bills" },
              { key: "cashPct",         label: "Cash %",          help: "Cash, money market, liquid funds" },
              { key: "realEstatePct",   label: "Real Estate %",   help: "REITs, InvITs, direct RE" },
            ];
            const total = fields.reduce((s, f) => s + Number(form[f.key] ?? 0), 0);
            const isGood = Math.abs(total - 100) < 1;
            const hasAny = total > 0;

            return (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                  {fields.slice(0, 3).map(({ key, label, help }) => (
                    <Tooltip title={help} placement="top" key={key}>
                      <TextField
                        label={label}
                        type="number"
                        value={form[key] ?? ""}
                        onChange={(e) => set(key, e.target.value === "" ? undefined : Number(e.target.value))}
                        size="small"
                        slotProps={{ input: { inputProps: { min: 0, max: 100, step: 0.1 } } }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {fields.slice(3).map(({ key, label, help }) => (
                    <Tooltip title={help} placement="top" key={key}>
                      <TextField
                        label={label}
                        type="number"
                        value={form[key] ?? ""}
                        onChange={(e) => set(key, e.target.value === "" ? undefined : Number(e.target.value))}
                        size="small"
                        slotProps={{ input: { inputProps: { min: 0, max: 100, step: 0.1 } } }}
                      />
                    </Tooltip>
                  ))}
                </Box>

                {hasAny && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(total, 100)}
                      color={isGood ? "success" : total > 100 ? "error" : "warning"}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={isGood ? "success.main" : total > 100 ? "error.main" : "warning.main"}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {total.toFixed(1)}% total
                      {!isGood && total <= 100 && ` · ${(100 - total).toFixed(1)}% unallocated`}
                    </Typography>
                  </Box>
                )}
              </>
            );
          })()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          data-testid="handle-mutual-fund-button"
        >
          {saving ? "Saving…" : type === "create" ? "Add Fund" : "Update Fund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MutualFundModal;
