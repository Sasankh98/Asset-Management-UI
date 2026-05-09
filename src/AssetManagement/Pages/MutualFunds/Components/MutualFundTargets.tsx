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
import { type MutualFund, type MutualFundsDashboard } from "../../../../../server/types";
import { formatCurrency } from "../../../../utils/currencyConverter";

const PALETTE = ["#1976d2", "#f9a825", "#43a047", "#e53935", "#8e24aa", "#00acc1", "#fb8c00"];

interface Props {
  funds: MutualFund[];
  dashboard?: MutualFundsDashboard;
}

export default function MutualFundTargets({ funds, dashboard }: Props) {
  const byCat: Record<string, number> = {};
  funds.forEach((f) => {
    byCat[f.category] = (byCat[f.category] ?? 0) + f.currentValue;
  });
  const pieData = Object.entries(byCat).map(([name, value]) => ({ name, value }));

  const overallProgress = Math.min(100, dashboard?.totalTargetProgress ?? 0);

  return (
    <Box sx={{ p: 2 }}>
      {/* Overall target progress */}
      <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Overall Target Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Target: {formatCurrency(dashboard?.totalTargetAmount)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{
            height: 14,
            borderRadius: 7,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 7 },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75 }}>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {overallProgress.toFixed(1)}% achieved
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current: {formatCurrency(dashboard?.totalCurrentValue)}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {/* Allocation donut */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Category Allocation
          </Typography>
          {pieData.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 8, textAlign: "center" }}>
              No data
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
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Per-fund target progress bars */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Fund Target Progress
          </Typography>
          {funds.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No funds added yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {funds.map((f) => {
                const pct = Math.min(100, f.targetProgress ?? 0);
                const barColor =
                  pct >= 75 ? "success.main" : pct >= 40 ? "warning.main" : "primary.main";
                return (
                  <Box key={f.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "72%" }}>
                        {f.fundName}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={barColor}>
                        {pct.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 4 },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {f.category} · {formatCurrency(f.currentValue)} current
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
