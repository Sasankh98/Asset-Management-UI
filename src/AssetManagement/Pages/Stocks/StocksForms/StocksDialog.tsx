import { useEffect, useMemo, useState } from "react";
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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { type Stock } from "../../../../../server/types";
import StocksService from "../../../../services/StocksService/StocksService";
import { useAssetManagementContext } from "../../../ContextProvider/ContextProvider";
import { StockCategories } from "../../../../shared/Constants";

const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;

interface StockOption {
  symbol: string;
  name: string;
  exchange: string;
}

async function searchStocks(query: string): Promise<StockOption[]> {
  if (!AV_KEY || query.length < 2) return [];
  const res = await fetch(
    `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${AV_KEY}`
  );
  const json = await res.json() as { bestMatches?: Record<string, string>[] };
  if (!json.bestMatches) return [];

  const results = json.bestMatches.map((m) => {
    const symbol = m["1. symbol"];
    const exchange = symbol.endsWith(".NSE") ? "NSE"
      : symbol.endsWith(".BSE") ? "BSE"
      : m["4. region"] ?? "";
    return { symbol, name: m["2. name"], exchange };
  });

  // NSE first, BSE second, rest after
  const rank = (e: string) => e === "NSE" ? 0 : e === "BSE" ? 1 : 2;
  return results.sort((a, b) => rank(a.exchange) - rank(b.exchange));
}

const STATUS_OPTIONS = ["active", "sold", "archived"];
type InvestType = "lumpsum" | "sip";
type SipFreq    = "monthly" | "quarterly" | "yearly";

function addPeriod(d: Date, freq: SipFreq): Date {
  const n = new Date(d);
  if (freq === "monthly")    n.setMonth(n.getMonth() + 1);
  else if (freq === "quarterly") n.setMonth(n.getMonth() + 3);
  else n.setFullYear(n.getFullYear() + 1);
  return n;
}

function countInstallments(start: string, end: string, freq: SipFreq): number {
  if (!start) return 0;
  let cur = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  let count = 0;
  while (cur <= endDate) { count++; cur = addPeriod(cur, freq); }
  return count;
}

interface Props {
  open: boolean;
  type: "create" | "edit";
  selectedStock?: Stock;
  handleClose: () => void;
}

const EMPTY_FORM = {
  stockName:        "",
  avg:              0,
  quantity:         0,
  buyTax:           0,
  buyDate:          "",
  status:           "active",
  category:         "Large Cap",
  marketPrice:      0,
  sellPrice:        0,
  sellTax:          0,
  dividends:        0,
  sellDate:         "",
};

export default function StocksDialog({ open, type, selectedStock, handleClose }: Props) {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [options, setOptions]       = useState<StockOption[]>([]);
  const [inputVal, setInputVal]     = useState("");
  const [searching, setSearching]   = useState(false);

  // SIP state
  const [investType, setInvestType] = useState<InvestType>("lumpsum");
  const [sipAmount, setSipAmount]   = useState(5000);
  const [sipFreq, setSipFreq]       = useState<SipFreq>("monthly");
  const [sipStart, setSipStart]     = useState("");
  const [sipEnd, setSipEnd]         = useState("");
  const [sipBrokPerInstall, setSipBrokPerInstall] = useState(0);

  const { setRefreshData, showSnackbar } = useAssetManagementContext();

  // Reset / populate form when dialog opens
  useEffect(() => {
    if (type === "edit" && selectedStock) {
      setForm({
        stockName:   selectedStock.stockName   ?? "",
        avg:         selectedStock.avg          ?? 0,
        quantity:    selectedStock.quantity     ?? 0,
        buyTax:      selectedStock.buyTax       ?? 0,
        buyDate:     selectedStock.buyDate?.slice(0, 10) ?? "",
        status:      selectedStock.status       ?? "active",
        category:    selectedStock.category     ?? "Large Cap",
        marketPrice: selectedStock.marketPrice  ?? 0,
        sellPrice:   selectedStock.sellPrice    ?? 0,
        sellTax:     selectedStock.sellTax      ?? 0,
        dividends:   selectedStock.dividends    ?? 0,
        sellDate:    selectedStock.sellDate?.slice(0, 10) ?? "",
      });
      setInputVal(selectedStock.stockName ?? "");
    } else {
      setForm(EMPTY_FORM);
      setInputVal("");
      setOptions([]);
    }
    setInvestType("lumpsum");
    setSipStart(""); setSipEnd("");
  }, [type, selectedStock, open]);

  // Debounced Alpha Vantage symbol search
  useEffect(() => {
    if (inputVal.length < 2) { setOptions([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setOptions(await searchStocks(inputVal));
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [inputVal]);

  const set = (k: keyof typeof EMPTY_FORM, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  // SIP-derived values (real-time)
  const sipCalc = useMemo(() => {
    if (investType !== "sip" || !sipStart) return null;
    const installments = countInstallments(sipStart, sipEnd, sipFreq);
    const totalInvested = sipAmount * installments;
    const totalBrok = sipBrokPerInstall * installments;
    const avgPrice = form.quantity > 0 ? totalInvested / form.quantity : 0;
    return { installments, totalInvested, totalBrok, avgPrice };
  }, [investType, sipAmount, sipFreq, sipStart, sipEnd, sipBrokPerInstall, form.quantity]);

  // Push SIP calc into main form fields whenever it updates
  useEffect(() => {
    if (!sipCalc) return;
    setForm((f) => ({
      ...f,
      avg:    parseFloat(sipCalc.avgPrice.toFixed(2)),
      buyTax: parseFloat(sipCalc.totalBrok.toFixed(2)),
      buyDate: sipStart,
    }));
  }, [sipCalc, sipStart]);

  const handleSubmit = async () => {
    if (!form.stockName || !form.buyDate) {
      showSnackbar("Stock name and buy date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const base = {
        stockName:   form.stockName,
        avg:         form.avg,
        quantity:    form.quantity,
        buyTax:      form.buyTax,
        buyDate:     form.buyDate,
        status:      form.status,
        category:    form.category,
        marketPrice: form.marketPrice || undefined,
        user:        "Sasankh",
      };
      if (type === "create") {
        await StocksService().postStockDetails(base);
        showSnackbar("Stock added successfully", "success");
      } else {
        const updatePayload = {
          ...base,
          sellPrice: form.sellPrice || undefined,
          sellTax:   form.sellTax   || undefined,
          dividends: form.dividends || undefined,
          sellDate:  form.sellDate  || undefined,
        };
        await StocksService().updateStockDetails(selectedStock?.id, updatePayload);
        showSnackbar("Stock updated successfully", "success");
      }
      setRefreshData((prev) => ({ ...prev, refreshStocks: !prev.refreshStocks }));
      handleClose();
    } catch {
      showSnackbar("Failed to save stock", "error");
    } finally {
      setSaving(false);
    }
  };

  const isSold = form.status === "sold";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {type === "create" ? "Add Stock" : "Edit Stock"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

          {/* ── Stock symbol search ─────────────────────────────────────── */}
          <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(opt) =>
              typeof opt === "string" ? opt : `${opt.symbol} — ${opt.name}`
            }
            filterOptions={(x) => x}
            inputValue={inputVal}
            onInputChange={(_, val) => {
              setInputVal(val);
              set("stockName", val);
            }}
            onChange={(_, val) => {
              if (val && typeof val !== "string") {
                set("stockName", val.symbol);
                setInputVal(val.symbol);
              }
            }}
            loading={searching}
            renderOption={(props, opt) => (
              <Box component="li" {...props} key={opt.symbol}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography variant="body2" fontWeight={700}>{opt.symbol}</Typography>
                    <Chip
                      label={opt.exchange}
                      size="small"
                      color={opt.exchange === "NSE" ? "primary" : opt.exchange === "BSE" ? "default" : "default"}
                      sx={{ height: 16, fontSize: 10, px: 0.5 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{opt.name}</Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Stock / Symbol"
                size="small"
                placeholder="e.g. RELIANCE, TCS, INFY"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searching && <CircularProgress size={14} sx={{ mr: 1 }} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Status + Category */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField select label="Status" value={form.status}
              onChange={(e) => set("status", e.target.value)} size="small">
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Market Cap Category" value={form.category}
              onChange={(e) => set("category", e.target.value)} size="small">
              {StockCategories.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Investment type */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Investment Type
            </Typography>
            <ToggleButtonGroup
              value={investType} exclusive size="small"
              onChange={(_, v) => { if (v) setInvestType(v as InvestType); }}
            >
              <ToggleButton value="lumpsum" sx={{ px: 3 }}>Lumpsum</ToggleButton>
              <ToggleButton value="sip" sx={{ px: 3 }}>SIP</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* ── SIP inputs ──────────────────────────────────────────────── */}
          {investType === "sip" && (
            <>
              <Divider>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>SIP DETAILS</Typography>
              </Divider>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField label="SIP Amount (₹)" type="number" value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))} size="small"
                  slotProps={{ input: { inputProps: { min: 1 } } }} />
                <TextField select label="Frequency" value={sipFreq}
                  onChange={(e) => setSipFreq(e.target.value as SipFreq)} size="small">
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField label="SIP Start Date" type="date" value={sipStart}
                  onChange={(e) => setSipStart(e.target.value)} size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="End Date (blank = today)" type="date" value={sipEnd}
                  onChange={(e) => setSipEnd(e.target.value)} size="small"
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField label="Total Shares Accumulated" type="number" value={form.quantity || ""}
                  onChange={(e) => set("quantity", Number(e.target.value))} size="small"
                  slotProps={{ input: { inputProps: { min: 0 } } }} />
                <TextField label="Brokerage / SIP (₹)" type="number" value={sipBrokPerInstall}
                  onChange={(e) => setSipBrokPerInstall(Number(e.target.value))} size="small"
                  slotProps={{ input: { inputProps: { min: 0 } } }} />
              </Box>
              {sipCalc && (
                <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                  {[
                    { label: "Installments",    value: String(sipCalc.installments) },
                    { label: "Total Invested",  value: sipCalc.totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) },
                    { label: "Avg Buy Price",   value: sipCalc.avgPrice > 0 ? sipCalc.avgPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" }) : "—" },
                  ].map((r) => (
                    <Box key={r.label}>
                      <Typography variant="caption" color="text.secondary">{r.label}</Typography>
                      <Typography variant="body2" fontWeight={700}>{r.value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* ── Buy details ─────────────────────────────────────────────── */}
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              {investType === "sip" ? "CALCULATED VALUES (EDITABLE)" : "BUY DETAILS"}
            </Typography>
          </Divider>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField
              label="Avg Buy Price (₹)"
              type="number"
              value={form.avg}
              onChange={(e) => set("avg", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => set("quantity", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
            <TextField
              label="Brokerage (₹)"
              type="number"
              value={form.buyTax}
              onChange={(e) => set("buyTax", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Box>

          <TextField
            label="Buy Date"
            type="date"
            value={form.buyDate}
            onChange={(e) => set("buyDate", e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Invested preview */}
          {form.avg > 0 && form.quantity > 0 && (
            <Box sx={{ display: "flex", gap: 2, px: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Total Invested:&nbsp;
                <b>{(form.avg * form.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" })}</b>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (incl. brokerage: {(form.avg * form.quantity + form.buyTax).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "INR" })})
              </Typography>
            </Box>
          )}

          {/* ── Market price ────────────────────────────────────────────── */}
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              CURRENT MARKET PRICE
            </Typography>
          </Divider>

          <TextField
            label="Market Price (₹)"
            type="number"
            value={form.marketPrice || ""}
            onChange={(e) => set("marketPrice", Number(e.target.value))}
            size="small"
            fullWidth
            slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
            helperText={
              form.marketPrice > 0 && form.avg > 0 && form.quantity > 0
                ? (() => {
                    const pl = (form.marketPrice - form.avg) * form.quantity;
                    const pct = ((form.marketPrice - form.avg) / form.avg) * 100;
                    return `P&L: ₹${Math.round(pl).toLocaleString("en-IN")} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%)`;
                  })()
                : "Used to compute current value and P&L"
            }
            FormHelperTextProps={{
              sx: {
                color:
                  form.marketPrice > 0 && form.avg > 0
                    ? form.marketPrice >= form.avg
                      ? "success.main"
                      : "error.main"
                    : "text.secondary",
              },
            }}
          />

          {/* ── Sell details (conditional) ──────────────────────────────── */}
          {isSold && (
            <>
              <Divider>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  SELL DETAILS
                </Typography>
              </Divider>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                <TextField
                  label="Sell Price (₹)"
                  type="number"
                  value={form.sellPrice}
                  onChange={(e) => set("sellPrice", Number(e.target.value))}
                  size="small"
                  slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
                />
                <TextField
                  label="Sell Tax (₹)"
                  type="number"
                  value={form.sellTax}
                  onChange={(e) => set("sellTax", Number(e.target.value))}
                  size="small"
                  slotProps={{ input: { inputProps: { min: 0 } } }}
                />
                <TextField
                  label="Dividends (₹)"
                  type="number"
                  value={form.dividends}
                  onChange={(e) => set("dividends", Number(e.target.value))}
                  size="small"
                  slotProps={{ input: { inputProps: { min: 0 } } }}
                />
              </Box>

              <TextField
                label="Sell Date"
                type="date"
                value={form.sellDate}
                onChange={(e) => set("sellDate", e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* P&L preview */}
              {form.sellPrice > 0 && form.quantity > 0 && (
                <Box sx={{ px: 0.5 }}>
                  {(() => {
                    const pl = (form.sellPrice - form.avg) * form.quantity - form.buyTax - form.sellTax + form.dividends;
                    const pct = form.avg > 0 ? ((form.sellPrice - form.avg) / form.avg * 100) : 0;
                    return (
                      <Typography variant="caption" color={pl >= 0 ? "success.main" : "error.main"}>
                        Estimated P&L:&nbsp;
                        <b>₹{Math.round(pl).toLocaleString("en-IN")} ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)</b>
                      </Typography>
                    );
                  })()}
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : type === "create" ? "Add Stock" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
