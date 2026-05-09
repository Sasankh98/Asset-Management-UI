import { SelectChangeEvent } from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateSalaryDTO, Salary } from "../../../../../server/types";
import {
  RefreshDataProps,
  useAssetManagementContext,
} from "../../../ContextProvider/ContextProvider";
import SalaryService from "../../../../services/SalaryService/SalaryService";
import { TransactionTypesEnum, TypeEnum } from "../../../../shared/Constants";
import {
  GlassInputLabel,
  GlassMenuItem,
  GlassTextField,
  GlassSelect,
  MenuProps,
} from "../../../../core/MUI/styles";
import GlassModalShell from "../../../../core/MUI/GlassModalShell";

interface SalaryFormProps {
  open: boolean;
  type: "create" | "edit" | undefined;
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  selectedTransaction?: Salary;
}

const SalaryForm = ({
  open,
  type,
  handleClose,
  selectedTransaction,
  setRefreshData,
}: SalaryFormProps) => {
  const [transactionData, setTransactionData] = useState<CreateSalaryDTO>({
    transactionType: "",
    amount: 0,
    date: "",
    type: "",
    user: "Sasankh",
  });

  const { setSnackBarOptions } = useAssetManagementContext();

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

  const handleIncome = async () => {
    if (type === "create") {
      if (
        !transactionData.transactionType ||
        !transactionData.amount ||
        !transactionData.date
      ) {
        alert("Please fill all fields");
        return;
      }
      const response = await SalaryService().postSalaryDetails(transactionData);
      if (response) {
        handleClose();
        setSnackBarOptions({
          open: true,
          message: "Created transaction successfully",
          severity: "success",
        });
        setRefreshData((prev) => ({ ...prev, refreshSalary: true }));
      }
    } else if (type === "edit" && transactionData) {
      const response = await SalaryService().updateSalaryDetails(
        selectedTransaction?.id,
        transactionData
      );
      if (response) {
        handleClose();
        setRefreshData((prev) => ({ ...prev, refreshSalary: true }));
      }
    }
  };

  useEffect(() => {
    if (type === "edit" && selectedTransaction) {
      setTransactionData({
        transactionType: selectedTransaction?.transactionType || "",
        amount: selectedTransaction?.amount || 0,
        date: selectedTransaction?.date || "",
        type: selectedTransaction?.type || "",
        user: selectedTransaction?.user || "Sasankh",
      });
    } else if (type === "create") {
      setTransactionData({
        transactionType: "",
        amount: 0,
        date: "",
        type: "",
        user: "Sasankh",
      });
    }
  }, [type, selectedTransaction]);

  return (
    <GlassModalShell
      open={open}
      onClose={handleClose}
      title={
        type === "edit"
          ? "Edit Transaction Details"
          : "Create New Transaction"
      }
      subtitle={
        type === "edit"
          ? "Update your transaction details"
          : "Set up a new transaction"
      }
      confirmLabel={
        type === "edit" ? "Update Transaction" : "Create Transaction"
      }
      onConfirm={handleIncome}
      confirmTestId="handle-salary-button"
    >
      <FormControl fullWidth sx={{ mb: 2 }}>
        <GlassInputLabel id="type-label">Select Salary Type</GlassInputLabel>
        <GlassSelect
          labelId="type-label"
          value={transactionData?.type || ""}
          onChange={handleSelectChange}
          label="Type"
          name="type"
          MenuProps={MenuProps}
        >
          {TypeEnum.map((enumTypes) => (
            <GlassMenuItem value={enumTypes.value} key={enumTypes.value}>
              {enumTypes.name}
            </GlassMenuItem>
          ))}
        </GlassSelect>
      </FormControl>

      <Grid container spacing={2}>
        <Grid size={6}>
          <GlassTextField
            fullWidth
            label="Amount"
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
        </Grid>
        <Grid size={6}>
          <GlassTextField
            fullWidth
            label="Credited Date"
            value={transactionData?.date || ""}
            onChange={handleTransactionData}
            name="date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <GlassInputLabel id="transaction-type-label">
          Select Transaction Type
        </GlassInputLabel>
        <GlassSelect
          labelId="transaction-type-label"
          value={transactionData?.transactionType || ""}
          onChange={handleSelectChange}
          label="Select Transaction Type"
          name="transactionType"
          MenuProps={MenuProps}
        >
          {TransactionTypesEnum.map((enumTypes) => (
            <GlassMenuItem value={enumTypes.name} key={enumTypes.name}>
              {enumTypes.name}
            </GlassMenuItem>
          ))}
        </GlassSelect>
      </FormControl>
    </GlassModalShell>
  );
};

export default SalaryForm;
