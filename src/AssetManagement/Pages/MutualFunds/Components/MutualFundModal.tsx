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
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { type CreateMutualFundsDTO, type MutualFund } from "../../../../../server/types";
import { type RefreshDataProps, useAssetManagementContext } from "../../../ContextProvider/ContextProvider";
import MutualFundService from "../../../../services/MutualFunds/MutualFundsService";
import { MutualFundTypes } from "../../../../shared/Constants";

// ── MFAPI (free Indian mutual fund API) ─────────────────────────────────────

interface MfOption {
  schemeCode: number;
  schemeName: string;
}

async function searchFunds(query: string): Promise<MfOption[]> {
  if (query.length < 2) return [];
  const res = await fetch(
    `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
  );
  const json = await res.json() as MfOption[];
  return Array.isArray(json) ? json.slice(0, 20) : [];
}

async function fetchLatestNav(schemeCode: number): Promise<number | null> {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const json = await res.json() as { data?: { nav: string }[] };
    const nav = parseFloat(json.data?.[0]?.nav ?? "");
    return isNaN(nav) ? null : nav;
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

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
};

const MutualFundModal = ({ open, type, handleClose, setRefreshData, selectedMutualFund }: Props) => {
  const [form, setForm]           = useState<CreateMutualFundsDTO>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [options, setOptions]     = useState<MfOption[]>([]);
  const [inputVal, setInputVal]   = useState("");
  const [searching, setSearching] = useState(false);
  const [navFetching, setNavFetching] = useState(false);
  const [navSource, setNavSource] = useState<"mfapi" | "manual">("manual");

  const { setSnackBarOptions } = useAssetManagementContext();

  // Reset on open
  useEffect(() => {
    if (type === "edit" && selectedMutualFund) {
      setForm({
        fundName:     selectedMutualFund.fundName    ?? "",
        category:     selectedMutualFund.category    ?? "",
        invested:     selectedMutualFund.invested    ?? 0,
        currentValue: selectedMutualFund.currentValue?? 0,
        units:        selectedMutualFund.units       ?? 0,
        nav:          selectedMutualFund.nav         ?? 0,
        targetAmount: selectedMutualFund.targetProgress ?? 0,
        user:         "Sasankh",
      });
      setInputVal(selectedMutualFund.fundName ?? "");
      setNavSource("manual");
    } else {
      setForm(EMPTY);
      setInputVal("");
      setOptions([]);
      setNavSource("manual");
    }
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

  // Recompute currentValue when nav or units changes (if NAV came from MFAPI)
  useEffect(() => {
    if (navSource === "mfapi" && form.nav > 0 && form.units > 0) {
      setForm((f) => ({ ...f, currentValue: parseFloat((f.nav * f.units).toFixed(2)) }));
    }
  }, [form.nav, form.units, navSource]);

  const set = <K extends keyof CreateMutualFundsDTO>(k: K, v: CreateMutualFundsDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {type === "create" ? "Add Mutual Fund" : "Edit Mutual Fund"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

          {/* Fund name search via MFAPI */}
          <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(opt) => typeof opt === "string" ? opt : opt.schemeName}
            filterOptions={(x) => x}
            inputValue={inputVal}
            onInputChange={(_, val) => {
              setInputVal(val);
              set("fundName", val);
            }}
            onChange={async (_, val) => {
              if (val && typeof val !== "string") {
                set("fundName", val.schemeName);
                setInputVal(val.schemeName);
                // Auto-fetch latest NAV
                setNavFetching(true);
                const nav = await fetchLatestNav(val.schemeCode);
                setNavFetching(false);
                if (nav !== null) {
                  setForm((f) => ({
                    ...f,
                    fundName: val.schemeName,
                    nav,
                    currentValue: f.units > 0 ? parseFloat((nav * f.units).toFixed(2)) : f.currentValue,
                  }));
                  setNavSource("mfapi");
                }
              }
            }}
            loading={searching}
            renderOption={(props, opt) => (
              <Box component="li" {...props} key={opt.schemeCode}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                    {opt.schemeName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Code: {opt.schemeCode}
                  </Typography>
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
                  endAdornment: (
                    <>
                      {(searching || navFetching) && <CircularProgress size={14} sx={{ mr: 1 }} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {navSource === "mfapi" && form.nav > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label={`NAV auto-fetched: ₹${form.nav}`} size="small" color="success" variant="outlined" />
              <Typography variant="caption" color="text.secondary">Current value = units × NAV</Typography>
            </Box>
          )}

          {/* Category */}
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            size="small"
          >
            {MutualFundTypes.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.name}</MenuItem>
            ))}
          </TextField>

          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>INVESTMENT DETAILS</Typography>
          </Divider>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Invested Amount (₹)"
              type="number"
              value={form.invested || ""}
              onChange={(e) => set("invested", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
            <TextField
              label="Units"
              type="number"
              value={form.units || ""}
              onChange={(e) => set("units", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0, step: 0.001 } } }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label={`NAV (₹)${navSource === "mfapi" ? " — live" : ""}`}
              type="number"
              value={form.nav || ""}
              onChange={(e) => { set("nav", Number(e.target.value)); setNavSource("manual"); }}
              size="small"
              slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
            />
            <TextField
              label="Current Value (₹)"
              type="number"
              value={form.currentValue || ""}
              onChange={(e) => { set("currentValue", Number(e.target.value)); setNavSource("manual"); }}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
              helperText={navSource === "mfapi" ? "Auto: units × NAV" : undefined}
            />
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

          <TextField
            label="Target Amount (₹)"
            type="number"
            value={form.targetAmount || ""}
            onChange={(e) => set("targetAmount", Number(e.target.value))}
            size="small"
            helperText="Your goal corpus for this fund"
            slotProps={{ input: { inputProps: { min: 0 } } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : type === "create" ? "Add Fund" : "Update Fund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MutualFundModal;
