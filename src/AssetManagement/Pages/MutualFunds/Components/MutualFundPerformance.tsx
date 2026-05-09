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
import { type MutualFund, type MutualFundsDashboard } from "../../../../../server/types";
import { formatCurrency } from "../../../../utils/currencyConverter";

interface Props {
  funds: MutualFund[];
  dashboard?: MutualFundsDashboard;
}

export default function MutualFundPerformance({ funds, dashboard }: Props) {
  const sorted = [...funds].sort((a, b) => b.gain_loss - a.gain_loss);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const chartData = funds.map((f) => ({
    name: f.fundName.length > 18 ? f.fundName.slice(0, 17) + "…" : f.fundName,
    Invested: f.invested,
    "Current Value": f.currentValue,
  }));

  const gainPct = (f: MutualFund) =>
    f.invested ? ((f.gain_loss / f.invested) * 100).toFixed(1) : "0.0";

  return (
    <Box sx={{ p: 2 }}>
      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Total Gain / Loss
          </Typography>
          <Typography variant="h6" fontWeight={700} color={(dashboard?.totalGainLoss ?? 0) >= 0 ? "success.main" : "error.main"} sx={{ mt: 0.5 }}>
            {formatCurrency(dashboard?.totalGainLoss)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Number(dashboard?.totalGainLossPercent ?? 0).toFixed(2)} % overall
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Best Performer
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, wordBreak: "break-word" }}>
            {best?.fundName ?? "—"}
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {best ? `+${gainPct(best)}%` : ""}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Worst Performer
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, wordBreak: "break-word" }}>
            {worst?.fundName ?? "—"}
          </Typography>
          <Typography variant="body2" color={(worst?.gain_loss ?? 0) >= 0 ? "success.main" : "error.main"} fontWeight={600}>
            {worst ? `${(worst.gain_loss ?? 0) >= 0 ? "+" : ""}${gainPct(worst)}%` : ""}
          </Typography>
        </Paper>
      </Box>

      {/* Invested vs Current Value bar chart */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Invested vs Current Value
        </Typography>
        {funds.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No fund data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Invested" fill="#90caf9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current Value" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Per-fund returns table */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Fund-wise Returns
        </Typography>
        {funds.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No funds added yet
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {sorted.map((f) => {
              const pct = parseFloat(gainPct(f));
              const positive = f.gain_loss >= 0;
              return (
                <Box
                  key={f.id}
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
                      {f.fundName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {f.category} · {f.units} units @ NAV {formatCurrency(f.nav)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(f.currentValue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        invested {formatCurrency(f.invested)}
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
