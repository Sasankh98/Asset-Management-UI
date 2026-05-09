import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { type Stock } from "../../../../../server/types";
import StocksService from "../../../../services/StocksService/StocksService";
import { useAssetManagementContext } from "../../../ContextProvider/ContextProvider";

const STATUS_OPTIONS = ["active", "sold", "archived"];

interface Props {
  open: boolean;
  type: "create" | "edit";
  selectedStock?: Stock;
  handleClose: () => void;
}

const EMPTY_FORM = {
  stockName: "",
  avg: 0,
  quantity: 0,
  buyTax: 0,
  buyDate: "",
  status: "active",
  sellPrice: 0,
  sellTax: 0,
  dividends: 0,
  sellDate: "",
};

export default function StocksDialog({ open, type, selectedStock, handleClose }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { setRefreshData, showSnackbar } = useAssetManagementContext();

  useEffect(() => {
    if (type === "edit" && selectedStock) {
      setForm({
        stockName: selectedStock.stockName ?? "",
        avg: selectedStock.avg ?? 0,
        quantity: selectedStock.quantity ?? 0,
        buyTax: selectedStock.buyTax ?? 0,
        buyDate: selectedStock.buyDate?.slice(0, 10) ?? "",
        status: selectedStock.status ?? "active",
        sellPrice: selectedStock.sellPrice ?? 0,
        sellTax: selectedStock.sellTax ?? 0,
        dividends: selectedStock.dividends ?? 0,
        sellDate: selectedStock.sellDate?.slice(0, 10) ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [type, selectedStock, open]);

  const set = (k: keyof typeof EMPTY_FORM, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.stockName || !form.buyDate) {
      showSnackbar("Stock name and buy date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        stockName: form.stockName,
        avg: form.avg,
        quantity: form.quantity,
        buyTax: form.buyTax,
        buyDate: form.buyDate,
        status: form.status,
        user: "Sasankh",
      };
      if (type === "create") {
        await StocksService().postStockDetails(payload);
        showSnackbar("Stock added successfully", "success");
      } else {
        await StocksService().updateStockDetails(selectedStock?.id, payload);
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
      <DialogTitle>{type === "create" ? "Add Stock" : "Edit Stock"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Stock Name"
              value={form.stockName}
              onChange={(e) => set("stockName", e.target.value)}
              size="small"
              placeholder="e.g. RELIANCE.BSE"
            />
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
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField
              label="Avg Buy Price (₹)"
              type="number"
              value={form.avg}
              onChange={(e) => set("avg", Number(e.target.value))}
              size="small"
              slotProps={{ input: { inputProps: { min: 0 } } }}
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
              label="Buy Tax / Brokerage (₹)"
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

          {isSold && (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                <TextField
                  label="Sell Price (₹)"
                  type="number"
                  value={form.sellPrice}
                  onChange={(e) => set("sellPrice", Number(e.target.value))}
                  size="small"
                  slotProps={{ input: { inputProps: { min: 0 } } }}
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
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : type === "create" ? "Add Stock" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
