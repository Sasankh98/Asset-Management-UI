import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type Stock } from "../../../../server/types";
import { fmtInr } from "../../../utils/formatCurrency";

const PALETTE = ["#1976d2", "#f9a825", "#43a047", "#e53935", "#8e24aa", "#00acc1", "#fb8c00"];

interface Props {
  stocks: Stock[];
}

function stockCurrent(s: Stock) {
  const mp  = Number(s.marketPrice ?? 0);
  const qty = Number(s.quantity    ?? 0);
  return mp > 0 ? mp * qty : Number(s.currentValue ?? 0);
}

export default function StocksAllocation({ stocks }: Props) {
  const active = stocks.filter((s) => s.status === "active");
  const totalCurrent = active.reduce((s, x) => s + stockCurrent(x), 0);

  const byCat: Record<string, number> = {};
  active.forEach((s) => {
    const cat = s.category || "Other";
    byCat[cat] = (byCat[cat] ?? 0) + stockCurrent(s);
  });
  const pieData = Object.entries(byCat).map(([name, value]) => ({ name, value }));

  const sortedByWeight = [...active].sort((a, b) => stockCurrent(b) - stockCurrent(a));

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        {/* Market cap donut */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Market Cap Allocation
          </Typography>
          {pieData.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 8, textAlign: "center" }}>
              No active holdings
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtInr(v as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Per-stock portfolio weight */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Portfolio Weight
          </Typography>
          {active.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No active stocks yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortedByWeight.map((s) => {
                const curr = stockCurrent(s);
                const pct = totalCurrent ? (curr / totalCurrent) * 100 : 0;
                const barColor = pct >= 20 ? "primary.main" : pct >= 10 ? "warning.main" : "success.main";
                return (
                  <Box key={s.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "72%" }}>
                        {s.stockName}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={barColor}>
                        {pct.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, pct)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 4 },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {s.category} · {fmtInr(curr)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
