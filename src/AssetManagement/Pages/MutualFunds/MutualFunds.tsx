import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import MutualFundModal from "./Components/MutualFundModal";
import CenterTabs from "./Components/MutualFundTabs";
import MutualFundTable from "./Components/MutualFundTable";
import MutualFundPerformance from "./Components/MutualFundPerformance";
import MutualFundTargets from "./Components/MutualFundTargets";
import { type MutualFund } from "../../../../server/types";
import { useMutualFundsQuery, useMutualFundsDashboardQuery } from "../../../hooks/queries";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import { fmtInr } from "../../../utils/formatCurrency";

function KpiSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
      {[...Array(4)].map((_, i) => (
        <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Skeleton variant="text" width="55%" height={16} />
          <Skeleton variant="text" width="75%" height={36} sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="45%" height={14} sx={{ mt: 0.5 }} />
        </Paper>
      ))}
    </Box>
  );
}

const MutualFunds = () => {
  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<"create" | "edit" | undefined>();
  const [selectedFund, setSelectedFund] = useState<MutualFund | undefined>();

  const { snackBarOptions } = useAssetManagementContext();

  const mutualFundsQuery = useMutualFundsQuery();
  const { data: dashboard, isLoading: dashLoading } = useMutualFundsDashboardQuery();
  const funds = useMemo(() => Array.isArray(mutualFundsQuery.data) ? mutualFundsQuery.data : [], [mutualFundsQuery.data]);
  const loading = mutualFundsQuery.isLoading || dashLoading;

  const openAdd = () => { setType("create"); setSelectedFund(undefined); setModalOpen(true); };

  const gainLoss = Number(dashboard?.totalGainLoss ?? 0);
  const gainPct  = Number(dashboard?.totalGainLossPercent ?? 0);

  const kpis = [
    { label: "Total Invested",    value: fmtInr(dashboard?.totalInvested),    color: "text.primary" },
    { label: "Current Value",     value: fmtInr(dashboard?.totalCurrentValue), color: "primary.main" },
    { label: "Gain / Loss",       value: fmtInr(gainLoss),                    color: gainLoss >= 0 ? "success.main" : "error.main",
      sub: `${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(2)}%` },
    { label: "Target Progress",   value: `${Number(dashboard?.totalTargetProgress ?? 0).toFixed(1)}%`,
      color: "text.primary", sub: `Target: ${fmtInr(dashboard?.totalTargetAmount)}` },
  ];

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }} data-testid="mutual-funds-wrapper">
      {snackBarOptions.open && <CustomSnackbar />}

      <MutualFundModal
        open={modalOpen}
        type={type}
        selectedMutualFund={selectedFund}
        handleClose={() => setModalOpen(false)}
      />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Mutual Fund Portfolio</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your mutual fund investments.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Fund
        </Button>
      </Box>

      {/* KPI strip */}
      {loading ? <KpiSkeleton /> : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
          {kpis.map((k) => (
            <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                {k.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>
                {k.value}
              </Typography>
              {k.sub && (
                <Typography variant="caption" color={k.color}>{k.sub}</Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <CenterTabs setValue={setTab} value={tab} />
      </Box>

      {/* Tab panels */}
      {tab === 0 && (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={600}>My Mutual Funds</Typography>
              {!loading && (
                <Chip label={`${funds.length} fund${funds.length !== 1 ? "s" : ""}`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
          <MutualFundTable
            loading={loading}
            mutualFundDetails={funds}
            setSelectedMutualFund={setSelectedFund}
            setType={setType}
            setMutualFundFormOpen={setModalOpen}
          />
        </Paper>
      )}

      {tab === 1 && (
        loading ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                  <Skeleton variant="text" width="55%" />
                  <Skeleton variant="text" width="70%" height={36} />
                </Paper>
              ))}
            </Box>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
            </Paper>
          </Box>
        ) : (
          <MutualFundPerformance funds={funds} dashboard={dashboard} />
        )
      )}

      {tab === 2 && (
        loading ? (
          <Box sx={{ p: 2 }}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Paper>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                <Skeleton variant="circular" width={190} height={190} sx={{ mx: "auto" }} />
              </Paper>
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                {[...Array(4)].map((_, i) => <Skeleton key={i} variant="text" height={24} sx={{ mb: 1 }} />)}
              </Paper>
            </Box>
          </Box>
        ) : (
          <MutualFundTargets funds={funds} dashboard={dashboard} />
        )
      )}
    </Box>
  );
};

export default MutualFunds;
