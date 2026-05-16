import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SyncIcon from "@mui/icons-material/Sync";
import { type Stock } from "../../../../server/types";
import { useStocksQuery } from "../../../hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../react-query";
import StocksService from "../../../services/StocksService/StocksService";
import SortableDataTable from "../../../components/SortableDataTable/SortableDataTable";
import { type TableRow } from "../../../hooks/useTableSort";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";
import StocksDialog from "./StocksDialog";
import { fmtInr } from "../../../utils/formatCurrency";
import CenterTabs from "../MutualFunds/Components/MutualFundTabs";
import StocksPerformance from "./StocksPerformance";
import StocksAllocation from "./StocksAllocation";

const TABLE_COLS = [
  { name: "Stock",        colId: "stockName",          id: 0 },
  { name: "Avg Price",    colId: "avg",                id: 1 },
  { name: "Qty",          colId: "quantity",           id: 2 },
  { name: "Invested",     colId: "totalInvested",      id: 3 },
  { name: "Mkt Price",    colId: "marketPrice",        id: 4 },
  { name: "Curr Value",   colId: "currentValue",       id: 5 },
  { name: "P&L",          colId: "netProfitLoss",      id: 6 },
  { name: "P&L %",        colId: "netProfitLossPercent", id: 7 },
  { name: "Status",       colId: "status",             id: 8 },
  { name: "Edit",         colId: "edit" },
];

const COL_IDS = TABLE_COLS.map((c) => c.colId);

function buildRow(s: Stock): TableRow {
  const mp  = Number(s.marketPrice ?? 0);
  const qty = Number(s.quantity    ?? 0);
  return COL_IDS.map((col) => {
    if (col === "edit") return "";
    if (col === "currentValue") return mp > 0 ? mp * qty : Number(s.currentValue ?? 0);
    const val = s[col as keyof Stock];
    return val ?? "";
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Stocks() {
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [dialogType, setDialogType]     = useState<"create" | "edit">("create");
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [filter, setFilter]             = useState<"all" | "active" | "sold">("all");
  const [tab, setTab]                   = useState(0);
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  const { snackBarOptions, showSnackbar } = useAssetManagementContext();
  const queryClient = useQueryClient();

  const { data: stocks = [], isLoading: loading } = useStocksQuery();

  const filtered = filter === "all" ? stocks : stocks.filter((s) => s.status === filter);
  const rows = useMemo(() => filtered.map(buildRow), [filtered]);

  // ── KPIs ────────────────────────────────────────────────────────────────────

  const active = stocks.filter((s) => s.status === "active");
  const totalInvested = active.reduce((s, x) => s + Number(x.totalInvested ?? 0), 0);
  const totalCurrent  = active.reduce((s, x) => {
    const mp  = Number(x.marketPrice ?? 0);
    const qty = Number(x.quantity    ?? 0);
    return s + (mp > 0 ? mp * qty : Number(x.currentValue ?? 0));
  }, 0);
  const totalPL = active.reduce((s, x) => {
    const mp  = Number(x.marketPrice ?? 0);
    const avg = Number(x.avg         ?? 0);
    const qty = Number(x.quantity    ?? 0);
    const tax = Number(x.buyTax      ?? 0);
    return s + (mp > 0 ? (mp - avg) * qty - tax : Number(x.netProfitLoss ?? 0));
  }, 0);
  const returnPct = totalInvested ? (totalPL / totalInvested) * 100 : 0;

  // ── Batch price refresh ──────────────────────────────────────────────────────

  const refreshAllPrices = async () => {
    const targets = active.filter((s) => s.stockName && s.id);
    if (!targets.length) return;
    setRefreshingPrices(true);
    try {
      const priceResults = await Promise.allSettled(
        targets.map(async (s) => {
          const res = await StocksService().getDailyStocksDetails(s.stockName) as { price?: { close?: number } } | null;
          const close = res?.price?.close;
          if (!close) throw new Error("no price");
          return { stock: s, price: close };
        })
      );

      const fetched = priceResults
        .filter((r): r is PromiseFulfilledResult<{ stock: Stock; price: number }> => r.status === "fulfilled")
        .map((r) => r.value);

      await Promise.allSettled(
        fetched.map(({ stock, price }) =>
          StocksService().updateStockDetails(stock.id, {
            stockName:   stock.stockName,
            avg:         Number(stock.avg),
            quantity:    Number(stock.quantity),
            buyTax:      Number(stock.buyTax ?? 0),
            buyDate:     stock.buyDate ?? "",
            status:      stock.status,
            category:    stock.category ?? "Large Cap",
            marketPrice: price,
            user:        "Sasankh",
          })
        )
      );

      showSnackbar(
        `Refreshed ${fetched.length} of ${targets.length} stock prices`,
        fetched.length > 0 ? "success" : "warning"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all() });
    } catch {
      showSnackbar("Failed to refresh prices", "error");
    } finally {
      setRefreshingPrices(false);
    }
  };

  // ── handlers ─────────────────────────────────────────────────────────────────

  const openAdd  = () => { setDialogType("create"); setSelectedStock(undefined); setDialogOpen(true); };
  const openEdit = (row: TableRow) => {
    const stock = stocks.find((s) => s.stockName === row[0] && String(s.avg) === String(row[1]));
    if (stock) { setSelectedStock(stock); setDialogType("edit"); setDialogOpen(true); }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 1100 }, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Box><Skeleton variant="text" width={180} height={36} /><Skeleton variant="text" width={260} height={20} /></Box>
          <Skeleton variant="rounded" width={120} height={36} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="55%" />
              <Skeleton variant="text" width="75%" height={36} sx={{ mt: 0.5 }} />
            </Paper>
          ))}
        </Box>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Skeleton variant="text" width="20%" /><Skeleton variant="text" width="10%" />
              <Skeleton variant="text" width="8%" /><Skeleton variant="text" width="12%" />
              <Skeleton variant="text" width="12%" /><Skeleton variant="text" width="10%" />
              <Skeleton variant="rounded" width={60} height={22} />
            </Box>
          ))}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: "100%", md: 1100 }, mx: "auto" }} data-testid="stocks-wrapper">
      {snackBarOptions.open && <CustomSnackbar />}

      <StocksDialog
        open={dialogOpen}
        type={dialogType}
        selectedStock={selectedStock}
        handleClose={() => setDialogOpen(false)}
      />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Stock Portfolio</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your equity investments, returns, and P&amp;L.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title={active.length === 0 ? "No active stocks to refresh" : "Fetch latest market prices for all active stocks"}>
            <span>
              <Button
                variant="outlined"
                startIcon={refreshingPrices ? undefined : <SyncIcon />}
                onClick={refreshAllPrices}
                disabled={refreshingPrices || active.length === 0}
              >
                {refreshingPrices ? "Refreshing…" : "Refresh Prices"}
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add Stock
          </Button>
        </Box>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "Total Invested",   value: fmtInr(totalInvested), color: "text.primary"  },
          { label: "Current Value",    value: fmtInr(totalCurrent),  color: "primary.main"  },
          { label: "Total P&L",        value: fmtInr(totalPL),       color: totalPL >= 0 ? "success.main" : "error.main" },
          { label: "Portfolio Return", value: `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`, color: returnPct >= 0 ? "success.main" : "error.main" },
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

      {/* Tabs */}
      <CenterTabs value={tab} setValue={setTab} labels={["Overview", "Performance", "Target & Allocation"]} />

      <Box sx={{ mt: 2 }}>
        {/* Overview tab */}
        {tab === 0 && (
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, pt: 2, pb: 1 }}>
              {(["all", "active", "sold"] as const).map((f) => (
                <Chip
                  key={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  size="small"
                  variant={filter === f ? "filled" : "outlined"}
                  color={filter === f ? "primary" : "default"}
                  onClick={() => setFilter(f)}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {filtered.length} stock{filtered.length !== 1 ? "s" : ""}
              </Typography>
            </Box>

            <SortableDataTable
              columns={TABLE_COLS}
              rows={rows}
              renderCell={(value, colIndex, row) => {
                // Monetary: Avg Price (1), Invested (3), Curr Value (5)
                if (colIndex === 1 || colIndex === 3 || colIndex === 5) {
                  return <span>{fmtInr(Number(value))}</span>;
                }
                // Market Price (4) — show dash if zero
                if (colIndex === 4) {
                  const num = Number(value);
                  return <span>{num > 0 ? fmtInr(num) : "—"}</span>;
                }
                // P&L (6)
                if (colIndex === 6) {
                  const num = Number(value);
                  return (
                    <Box component="span" sx={{ color: num >= 0 ? "success.dark" : "error.dark", fontWeight: 600 }}>
                      {fmtInr(num)}
                    </Box>
                  );
                }
                // P&L % (7)
                if (colIndex === 7) {
                  const num = Number(value);
                  return (
                    <Chip
                      label={`${num >= 0 ? "+" : ""}${num.toFixed ? num.toFixed(2) : num}%`}
                      size="small"
                      color={num >= 0 ? "success" : "error"}
                      sx={{ fontWeight: 700 }}
                    />
                  );
                }
                // Status (8)
                if (colIndex === 8) {
                  return (
                    <Chip
                      label={String(value)}
                      size="small"
                      color={value === "active" ? "success" : value === "sold" ? "default" : "warning"}
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                  );
                }
                // Edit (last col)
                if (colIndex === TABLE_COLS.length - 1) {
                  return (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  );
                }
                return undefined;
              }}
            />
          </Paper>
        )}

        {/* Performance tab */}
        {tab === 1 && <StocksPerformance stocks={stocks} />}

        {/* Target & Allocation tab */}
        {tab === 2 && <StocksAllocation stocks={stocks} />}
      </Box>
    </Box>
  );
}
