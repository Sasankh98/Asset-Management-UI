import { useEffect, useState } from "react";
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
import { type Stock } from "../../../../../server/types";
import StocksService from "../../../../services/StocksService/StocksService";
import { useAssetManagementContext } from "../../../ContextProvider/ContextProvider";

const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;

interface StockOption {
  symbol: string;
  name: string;
  region: string;
}

async function searchStocks(query: string): Promise<StockOption[]> {
  if (!AV_KEY || query.length < 2) return [];
  const res = await fetch(
    `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${AV_KEY}`
  );
  const json = await res.json() as { bestMatches?: Record<string, string>[] };
  if (!json.bestMatches) return [];
  return json.bestMatches.map((m) => ({
    symbol: m["1. symbol"],
    name:   m["2. name"],
    region: m["4. region"],
  }));
}

const STATUS_OPTIONS = ["active", "sold", "archived"];

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

  const { setRefreshData, showSnackbar } = useAssetManagementContext();

  // Reset / populate form when dialog opens
  useEffect(() => {
    if (type === "edit" && selectedStock) {
      setForm({
        stockName:  selectedStock.stockName ?? "",
        avg:        selectedStock.avg        ?? 0,
        quantity:   selectedStock.quantity   ?? 0,
        buyTax:     selectedStock.buyTax     ?? 0,
        buyDate:    selectedStock.buyDate?.slice(0, 10) ?? "",
        status:     selectedStock.status     ?? "active",
        sellPrice:  selectedStock.sellPrice  ?? 0,
        sellTax:    selectedStock.sellTax    ?? 0,
        dividends:  selectedStock.dividends  ?? 0,
        sellDate:   selectedStock.sellDate?.slice(0, 10) ?? "",
      });
      setInputVal(selectedStock.stockName ?? "");
    } else {
      setForm(EMPTY_FORM);
      setInputVal("");
      setOptions([]);
    }
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

  const handleSubmit = async () => {
    if (!form.stockName || !form.buyDate) {
      showSnackbar("Stock name and buy date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const base = {
        stockName: form.stockName,
        avg:       form.avg,
        quantity:  form.quantity,
        buyTax:    form.buyTax,
        buyDate:   form.buyDate,
        status:    form.status,
        user:      "Sasankh",
      };
      if (type === "create") {
        await StocksService().postStockDetails(base);
        showSnackbar("Stock added successfully", "success");
      } else {
        const updatePayload = {
          ...base,
          sellPrice: form.sellPrice,
          sellTax:   form.sellTax,
          dividends: form.dividends,
          sellDate:  form.sellDate || undefined,
        };
        await StocksService().updateStockDetails(selectedStock?.id, updatePayload as Parameters<ReturnType<typeof StocksService>["updateStockDetails"]>[1]);
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
                      label={opt.region.split("/")[0]?.trim() ?? opt.region}
                      size="small"
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

          {/* Status */}
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            size="small"
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
            ))}
          </TextField>

          {/* ── Buy details ─────────────────────────────────────────────── */}
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              BUY DETAILS
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
                <b>₹{(form.avg * form.quantity).toLocaleString("en-IN")}</b>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (incl. brokerage: ₹{(form.avg * form.quantity + form.buyTax).toLocaleString("en-IN")})
              </Typography>
            </Box>
          )}

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
