import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type Stock } from "../../../../server/types";
import { fmtInr } from "../../../utils/formatCurrency";

interface Props {
  stocks: Stock[];
}

function stockPL(s: Stock) {
  const mp  = Number(s.marketPrice ?? 0);
  const avg = Number(s.avg         ?? 0);
  const qty = Number(s.quantity    ?? 0);
  const tax = Number(s.buyTax      ?? 0);
  return mp > 0 ? (mp - avg) * qty - tax : Number(s.netProfitLoss ?? 0);
}

function stockInvested(s: Stock) {
  return Number(s.totalInvested ?? 0);
}

function stockCurrent(s: Stock) {
  const mp  = Number(s.marketPrice ?? 0);
  const qty = Number(s.quantity    ?? 0);
  return mp > 0 ? mp * qty : Number(s.currentValue ?? 0);
}

function gainPct(s: Stock) {
  const inv = stockInvested(s);
  return inv ? (stockPL(s) / inv) * 100 : 0;
}

export default function StocksPerformance({ stocks }: Props) {
  const active = stocks.filter((s) => s.status === "active");
  const sorted = [...active].sort((a, b) => gainPct(b) - gainPct(a));
  const best  = sorted[0];
  const worst = sorted[sorted.length - 1];

  const totalPL = active.reduce((s, x) => s + stockPL(x), 0);
  const totalInvested = active.reduce((s, x) => s + stockInvested(x), 0);
  const totalReturn = totalInvested ? (totalPL / totalInvested) * 100 : 0;

  const chartData = active.slice(0, 10).map((s) => ({
    name: s.stockName.length > 12 ? s.stockName.slice(0, 11) + "…" : s.stockName,
    Invested: stockInvested(s),
    "Current Value": stockCurrent(s),
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Total P&amp;L
          </Typography>
          <Typography variant="h6" fontWeight={700} color={totalPL >= 0 ? "success.main" : "error.main"} sx={{ mt: 0.5 }}>
            {fmtInr(totalPL)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}% overall
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Best Performer
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, wordBreak: "break-word" }}>
            {best?.stockName ?? "—"}
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {best ? `+${gainPct(best).toFixed(1)}%` : ""}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Worst Performer
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, wordBreak: "break-word" }}>
            {worst?.stockName ?? "—"}
          </Typography>
          <Typography variant="body2" color={worst && gainPct(worst) >= 0 ? "success.main" : "error.main"} fontWeight={600}>
            {worst ? `${gainPct(worst) >= 0 ? "+" : ""}${gainPct(worst).toFixed(1)}%` : ""}
          </Typography>
        </Paper>
      </Box>

      {/* Invested vs Current Value bar chart */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Invested vs Current Value
        </Typography>
        {active.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No active holdings to display.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmtInr(v as number)} />
              <Legend />
              <Bar dataKey="Invested" fill="#90caf9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current Value" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Per-stock returns list */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Stock-wise Returns
        </Typography>
        {active.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No active stocks yet.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {sorted.map((s) => {
              const pct = gainPct(s);
              const positive = pct >= 0;
              return (
                <Box
                  key={s.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {s.stockName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.category} · {s.quantity} qty @ avg {fmtInr(Number(s.avg))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {fmtInr(stockCurrent(s))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        invested {fmtInr(stockInvested(s))}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${positive ? "+" : ""}${pct.toFixed(1)}%`}
                      size="small"
                      color={positive ? "success" : "error"}
                      sx={{ fontWeight: 700, minWidth: 72 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
