import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { CreateSalaryDTO, Salary } from "../../../../../server/types";
import { useAssetManagementContext } from "../../../ContextProvider/ContextProvider";
import { useSalaryMutation } from "../../../../hooks/mutations";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { TransactionTypesEnum } from "../../../../shared/Constants";
import {
  GlassMenuItem,
  GlassTextField,
  GlassSelect,
  MenuProps,
} from "../../../../core/MUI/styles";
import GlassModalShell from "../../../../core/MUI/GlassModalShell";
import { SelectChangeEvent } from "@mui/material/Select";

interface SalaryFormProps {
  open: boolean;
  type: "create" | "edit" | undefined;
  handleClose: () => void;
  selectedTransaction?: Salary;
}

const SalaryForm = ({
  open,
  type,
  handleClose,
  selectedTransaction,
}: SalaryFormProps) => {
  const today = new Date().toISOString().slice(0, 10);

  const [transactionData, setTransactionData] = useState<CreateSalaryDTO>({
    transactionType: "",
    amount: 0,
    date: today,
    type: "income",
    user: "",
  });
  const [recurring, setRecurring] = useState(false);

  const { setSnackBarOptions } = useAssetManagementContext();
  const { createTransaction, updateTransaction } = useSalaryMutation();
  const { name: currentUserName } = useCurrentUser();

  const handleTransactionData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTransactionData({ ...transactionData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    if (name) {
      setTransactionData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeToggle = (_: React.MouseEvent<HTMLElement>, val: string | null) => {
    if (val) setTransactionData((prev) => ({ ...prev, type: val }));
  };

  const handleIncome = async () => {
    if (type === "create") {
      if (!transactionData.transactionType || !transactionData.amount || !transactionData.date) {
        alert("Please fill all fields");
        return;
      }
      await createTransaction.mutateAsync(transactionData);
      handleClose();
    } else if (type === "edit" && transactionData) {
      await updateTransaction.mutateAsync({
        id: selectedTransaction?.id,
        data: transactionData,
      });
      handleClose();
      setSnackBarOptions({ open: true, message: "Updated transaction successfully", severity: "success" });
    }
  };

  useEffect(() => {
    if (type === "edit" && selectedTransaction) {
      setTransactionData({
        transactionType: selectedTransaction?.transactionType || "",
        amount: selectedTransaction?.amount || 0,
        date: selectedTransaction?.date || today,
        type: selectedTransaction?.type || "income",
        user: selectedTransaction?.user || currentUserName,
      });
    } else if (type === "create") {
      setTransactionData({
        transactionType: "",
        amount: 0,
        date: today,
        type: "income",
        user: currentUserName,
      });
      setRecurring(false);
    }
  }, [type, selectedTransaction, currentUserName]);

  return (
    <GlassModalShell
      open={open}
      onClose={handleClose}
      title={type === "edit" ? "Edit Transaction" : "Create transaction"}
      subtitle={type === "edit" ? "Update your transaction details" : "Log income or an expense"}
      confirmLabel={type === "edit" ? "Save Changes" : "Save transaction"}
      onConfirm={handleIncome}
      confirmTestId="handle-salary-button"
      recurring={recurring}
      onRecurringChange={setRecurring}
    >
      {/* Credit / Debit toggle */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 0.75, fontWeight: 500 }}>
          Type
        </FormLabel>
        <ToggleButtonGroup
          value={transactionData.type}
          exclusive
          onChange={handleTypeToggle}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              flex: 1,
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              borderColor: "rgba(255,255,255,0.14)",
            },
            "& .MuiToggleButton-root.Mui-selected[value='income']": {
              background: "rgba(76,175,80,0.18)",
              color: "#4caf50",
              borderColor: "rgba(76,175,80,0.4)",
            },
            "& .MuiToggleButton-root.Mui-selected[value='expense']": {
              background: "rgba(239,83,80,0.18)",
              color: "#ef5350",
              borderColor: "rgba(239,83,80,0.4)",
            },
          }}
        >
          <ToggleButton value="income">Credit · income in</ToggleButton>
          <ToggleButton value="expense">Debit · expense out</ToggleButton>
        </ToggleButtonGroup>
      </FormControl>

      <Grid container spacing={2}>
        <Grid size={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 0.75, fontWeight: 500 }}>
              Amount <span style={{ color: "#ef5350" }}>*</span>
            </FormLabel>
            <GlassTextField
              fullWidth
              placeholder="0"
              value={transactionData?.amount || ""}
              onChange={handleTransactionData}
              name="amount"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 0.75, fontWeight: 500 }}>
              Date <span style={{ color: "#ef5350" }}>*</span>
            </FormLabel>
            <GlassTextField
              fullWidth
              value={transactionData?.date || ""}
              onChange={handleTransactionData}
              name="date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
        </Grid>
      </Grid>

      <FormControl fullWidth>
        <FormLabel sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 0.75, fontWeight: 500 }}>
          Category <span style={{ color: "#ef5350" }}>*</span>
        </FormLabel>
        <GlassSelect
          value={transactionData?.transactionType || ""}
          onChange={handleSelectChange}
          name="transactionType"
          MenuProps={MenuProps}
          displayEmpty
        >
          <GlassMenuItem value="" disabled>Select category</GlassMenuItem>
          {TransactionTypesEnum.map((enumTypes) => (
            <GlassMenuItem value={enumTypes.name} key={enumTypes.name}>
              {enumTypes.name}
            </GlassMenuItem>
          ))}
        </GlassSelect>
      </FormControl>

      <Box>
        <FormLabel sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", mb: 0.75, fontWeight: 500, display: "block" }}>
          Note <span style={{ color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>— optional</span>
        </FormLabel>
        <GlassTextField
          fullWidth
          placeholder="e.g. May payslip, bonus, reimbursement…"
          name="note"
          multiline
          rows={2}
        />
      </Box>
    </GlassModalShell>
  );
};

export default SalaryForm;
