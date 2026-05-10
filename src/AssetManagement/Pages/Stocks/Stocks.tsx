import { useEffect, useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type Stock } from "../../../../server/types";
import StocksService from "../../../services/StocksService/StocksService";
import SortableDataTable from "../../../components/SortableDataTable/SortableDataTable";
import { type TableRow } from "../../../hooks/useTableSort";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";
import StocksDialog from "./StocksForms/StocksDialog";
import { fmtInr } from "../../../utils/formatCurrency";

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
  return COL_IDS.map((col) => {
    if (col === "edit") return "";
    const val = s[col as keyof Stock];
    return val ?? "";
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Stocks() {
  const [stocks, setStocks]             = useState<Stock[]>([]);
  const [rows, setRows]                 = useState<TableRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [dialogType, setDialogType]     = useState<"create" | "edit">("create");
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [filter, setFilter]             = useState<"all" | "active" | "sold">("all");

  const { refreshData, snackBarOptions } = useAssetManagementContext();

  useEffect(() => {
    setLoading(true);
    StocksService()
      .getStocksDetails()
      .then((res) => { if (res?.data) setStocks(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshData.refreshStocks]);

  const filtered = filter === "all" ? stocks : stocks.filter((s) => s.status === filter);

  useEffect(() => {
    setRows(filtered.map(buildRow));
  }, [filtered]);

  // ── KPIs ────────────────────────────────────────────────────────────────────

  const active = stocks.filter((s) => s.status === "active");
  const totalInvested   = active.reduce((s, x) => s + (x.totalInvested ?? 0), 0);
  const totalCurrent    = active.reduce((s, x) => s + (x.currentValue   ?? 0), 0);
  const totalPL         = active.reduce((s, x) => s + (x.netProfitLoss  ?? 0), 0);
  const returnPct       = totalInvested ? (totalPL / totalInvested) * 100 : 0;

  // ── Chart data ───────────────────────────────────────────────────────────────

  const chartData = active.slice(0, 10).map((s) => ({
    name: s.stockName.length > 12 ? s.stockName.slice(0, 11) + "…" : s.stockName,
    Invested: s.totalInvested ?? 0,
    "Current Value": s.currentValue ?? 0,
  }));

  // ── handlers ─────────────────────────────────────────────────────────────────

  const openAdd  = () => { setDialogType("create"); setSelectedStock(undefined); setDialogOpen(true); };
  const openEdit = (row: TableRow) => {
    const stock = stocks.find((s) => s.stockName === row[0] && String(s.avg) === String(row[1]));
    if (stock) { setSelectedStock(stock); setDialogType("edit"); setDialogOpen(true); }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box><Skeleton variant="text" width={180} height={36} /><Skeleton variant="text" width={260} height={20} /></Box>
          <Skeleton variant="rounded" width={120} height={36} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
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
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }} data-testid="stocks-wrapper">
      {snackBarOptions.open && <CustomSnackbar />}

      <StocksDialog
        open={dialogOpen}
        type={dialogType}
        selectedStock={selectedStock}
        handleClose={() => setDialogOpen(false)}
      />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Stock Portfolio</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your equity investments, returns, and P&amp;L.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Stock
        </Button>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {[
          { label: "Total Invested",  value: fmtInr(totalInvested), color: "text.primary"  },
          { label: "Current Value",   value: fmtInr(totalCurrent),  color: "primary.main"  },
          { label: "Total P&L",       value: fmtInr(totalPL),       color: totalPL >= 0 ? "success.main" : "error.main" },
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

      {/* Chart */}
      {active.length > 0 && (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Invested vs Current Value (Active Holdings)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip formatter={(v: number) => fmtInr(v)} />
              <Legend />
              <Bar dataKey="Invested" fill="#90caf9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current Value" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Filter chips + table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mr: 1 }}>Holdings</Typography>
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
            // P&L column (index 6)
            if (colIndex === 6) {
              const num = Number(value);
              return (
                <span style={{ color: num >= 0 ? "#2e7d32" : "#c62828", fontWeight: 600 }}>
                  {fmtInr(num)}
                </span>
              );
            }
            // P&L % column (index 7)
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
            // Status chip (index 8)
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
            // Edit button (last col)
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
    </Box>
  );
}
