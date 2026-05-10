import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AddIcon from "@mui/icons-material/Add";
import TransactionTable from "./TransactionTable/TransactionTable";
import { type Salary } from "../../../../server/types";
import { useSalaryQuery } from "../../../hooks/queries";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import TransactionForm from "./TransactionForm/TransactionForm";
import LineGraph from "../../../components/LineGraph/LineGraph";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";
import { fmtInr } from "../../../utils/formatCurrency";

const SalaryComponent = () => {
  const { snackBarOptions } = useAssetManagementContext();
  const [tab, setTab] = useState(0);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [type, setType] = useState<"create" | "edit" | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<Salary>();


  const transactionQuery = useSalaryQuery();
  const transactionData = useMemo(() => Array.isArray(transactionQuery.data) ? transactionQuery.data : [], [transactionQuery.data])
  const loading = transactionQuery.isLoading;
  const handleOpenCreate = () => { setType("create"); setTransactionFormOpen(true); };

  const kpis = useMemo(() => {
    const totalIncome = transactionData
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const totalExpenses = transactionData
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const net = totalIncome - totalExpenses;
    const now = new Date();
    const thisMonthIncome = transactionData
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === "income" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, t) => s + Number(t.amount ?? 0), 0);
    return { totalIncome, totalExpenses, net, thisMonthIncome };
  }, [transactionData]);

  const incomeCount   = transactionData.filter((t) => t.type === "income").length;
  const expenseCount  = transactionData.filter((t) => t.type === "expense").length;

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }} data-testid="salary-container">
      {snackBarOptions.open && <CustomSnackbar />}

      <TransactionForm
        selectedTransaction={selectedTransaction}
        type={type}
        handleClose={() => setTransactionFormOpen(false)}
        open={transactionFormOpen}
      />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Income & Expenses</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your income, expenses, and monthly cash flow.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Transaction
        </Button>
      </Box>

      {/* KPI strip */}
      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Paper key={i} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="55%" />
              <Skeleton variant="text" width="75%" height={36} sx={{ mt: 0.5 }} />
            </Paper>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
          {[
            { label: "Total Income",      value: fmtInr(kpis.totalIncome),    color: "success.main", sub: `${incomeCount} credits` },
            { label: "Total Expenses",    value: fmtInr(kpis.totalExpenses),  color: "error.main",   sub: `${expenseCount} debits` },
            { label: "Net Balance",       value: fmtInr(kpis.net),            color: kpis.net >= 0 ? "success.main" : "error.main" },
            { label: "This Month Income", value: fmtInr(kpis.thisMonthIncome), color: "primary.main" },
          ].map((k) => (
            <Paper key={k.label} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                {k.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} color={k.color} sx={{ mt: 0.5 }}>
                {k.value}
              </Typography>
              {k.sub && (
                <Typography variant="caption" color="text.secondary">{k.sub}</Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Overview" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Transactions
                {!loading && (
                  <Chip label={transactionData.length} size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />
                )}
              </Box>
            }
          />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ py: 2 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mx: 2 }} />
            ) : (
              <LineGraph monthlyData={transactionData} />
            )}
          </Box>
        )}

        {tab === 1 && (
          loading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Skeleton variant="text" width="10%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="15%" />
                  <Skeleton variant="text" width="12%" />
                  <Skeleton variant="rounded" width={70} height={22} />
                </Box>
              ))}
            </Box>
          ) : (
            <TransactionTable
              transactionData={transactionData}
              setTransactionFormOpen={setTransactionFormOpen}
              setType={setType}
              setSelectedTransaction={setSelectedTransaction}
            />
          )
        )}
      </Paper>
    </Box>
  );
};

export default SalaryComponent;
