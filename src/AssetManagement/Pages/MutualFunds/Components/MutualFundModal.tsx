import { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateMutualFundsDTO, MutualFund } from "../../../../../server/types";
import {
  RefreshDataProps,
  useAssetManagementContext,
} from "../../../ContextProvider/ContextProvider";
import MutualFundService from "../../../../services/MutualFunds/MutualFundsService";
import { MutualFundTypes } from "../../../../shared/Constants";
import {
  GlassInputLabel,
  GlassMenuItem,
  GlassTextField,
  GlassSelect,
  MenuProps,
} from "../../../../core/MUI/styles";
import GlassModalShell from "../../../../core/MUI/GlassModalShell";

interface MutualFundModalProps {
  open: boolean;
  type: "create" | "edit" | undefined;
  handleClose: () => void;
  setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
  selectedMutualFund?: MutualFund;
}

const MutualFundModal = ({
  open,
  type,
  handleClose,
  selectedMutualFund,
  setRefreshData,
}: MutualFundModalProps) => {
  const [mutualFundData, setMutualFundData] = useState<CreateMutualFundsDTO>({
    fundName: "",
    category: "",
    invested: 0,
    currentValue: 0,
    units: 0,
    nav: 0,
    targetProgress: 0,
    user: "Sasankh",
  });

  const { setSnackBarOptions } = useAssetManagementContext();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMutualFundData({ ...mutualFundData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    if (name) {
      setMutualFundData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMutualFund = async () => {
    if (type === "create") {
      if (
        !mutualFundData.fundName ||
        !mutualFundData.invested ||
        !mutualFundData.units ||
        !mutualFundData.category
      ) {
        alert("Please fill all fields");
        return;
      }
      const response =
        await MutualFundService().postMutualFundDetails(mutualFundData);
      if (response) {
        handleClose();
        setSnackBarOptions({
          open: true,
          message: "Mutual fund created successfully",
          severity: "success",
        });
        setRefreshData((prev) => ({ ...prev, refreshMutualFunds: true }));
      }
    } else if (type === "edit" && mutualFundData) {
      const response = await MutualFundService().updateMutualFundDetails(
        selectedMutualFund?.id,
        mutualFundData
      );
      if (response) {
        handleClose();
        setRefreshData((prev) => ({ ...prev, refreshMutualFunds: true }));
      }
    }
  };

  useEffect(() => {
    if (type === "edit" && selectedMutualFund) {
      setMutualFundData({
        fundName: selectedMutualFund?.fundName || "",
        category: selectedMutualFund?.category || "",
        invested: selectedMutualFund?.invested || 0,
        currentValue: selectedMutualFund?.currentValue || 0,
        units: selectedMutualFund?.units || 0,
        nav: selectedMutualFund?.nav || 0,
        targetProgress: selectedMutualFund?.targetProgress || 0,
        user: "Sasankh",
      });
    } else if (type === "create") {
      setMutualFundData({
        fundName: "",
        category: "",
        invested: 0,
        currentValue: 0,
        units: 0,
        nav: 0,
        targetProgress: 0,
        user: "Sasankh",
      });
    }
  }, [type, selectedMutualFund]);

  return (
    <GlassModalShell
      open={open}
      onClose={handleClose}
      title={type === "edit" ? "Edit Mutual Fund" : "Add Mutual Fund"}
      subtitle={
        type === "edit"
          ? "Update your fund details"
          : "Add a new mutual fund to your portfolio"
      }
      confirmLabel={
        type === "edit" ? "Update Mutual Fund" : "Create Mutual Fund"
      }
      onConfirm={handleMutualFund}
      confirmTestId="handle-mutual-fund-button"
    >
      <FormControl fullWidth>
        <GlassInputLabel id="category-label">
          Select Mutual Fund Category
        </GlassInputLabel>
        <GlassSelect
          labelId="category-label"
          value={mutualFundData?.category || ""}
          onChange={handleSelectChange}
          label="category"
          name="category"
          MenuProps={MenuProps}
        >
          {MutualFundTypes.map((enumTypes) => (
            <GlassMenuItem value={enumTypes.value} key={enumTypes.value}>
              {enumTypes.name}
            </GlassMenuItem>
          ))}
        </GlassSelect>
      </FormControl>

      <Grid container spacing={2}>
        <Grid size={12}>
          <GlassTextField
            fullWidth
            label="Mutual Fund Name"
            placeholder="e.g., HDFC Equity Fund"
            value={mutualFundData?.fundName || ""}
            onChange={handleInputChange}
            name="fundName"
            type="text"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={6}>
          <GlassTextField
            fullWidth
            label="Invested Amount"
            placeholder="0"
            value={mutualFundData?.invested || 0}
            onChange={handleInputChange}
            name="invested"
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
            label="Current Value"
            value={mutualFundData?.currentValue || 0}
            onChange={handleInputChange}
            name="currentValue"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={6}>
          <GlassTextField
            fullWidth
            label="NAV"
            placeholder="0"
            value={mutualFundData?.nav || 0}
            onChange={handleInputChange}
            name="nav"
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
            label="Units Purchased"
            value={mutualFundData?.units || 0}
            onChange={handleInputChange}
            name="units"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={6}>
          <GlassTextField
            fullWidth
            label="Target Amount"
            placeholder="0"
            value={mutualFundData?.targetProgress || 0}
            onChange={handleInputChange}
            name="targetProgress"
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
            label="User"
            value={mutualFundData?.user || ""}
            onChange={handleInputChange}
            name="user"
            type="text"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </GlassModalShell>
  );
};

export default MutualFundModal;
