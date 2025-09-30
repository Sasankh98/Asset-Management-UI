import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import CustomButton from "../../../core/CustomButton/CustomButton";
import MutualFundCard from "./Components/MutualFundCards";
import CenterTabs from "./Components/MutualFundTabs";
import MutualFundTable from "./Components/MutualFundTable";
import { MutualFund, MutualFundsDashboard } from "../../../../server/types";
import MutualFundsService from "../../../services/MutualFunds/MutualFundsService";
import { mutualFundsDashboard, Icons } from "../../../shared/Constants";
import "./MutualFunds.css";
import { formatCurrency } from "../../../utils/currencyConverter";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import MutualFundModal from "./Components/MutualFundModal";

const MutualFunds = () => {
  const [value, setValue] = useState(0);
  const [mutualFundDetails, setMutualFundDetails] = useState<MutualFund[]>([]);
  const [mutualFundDashboardDetails, setMutualFundDashboardDetails] = useState<
    MutualFundsDashboard | undefined
  >(undefined);
  const [mutualFundFormOpen, setMutualFundFormOpen] = useState<boolean>(false);
  const [type, setType] = useState<"create" | "edit" | "">("");
  const [selectedMutualFund, setSelectedMutualFund] = useState<MutualFund>();
  const { refreshData, setRefreshData, snackBarOptions, setSnackBarOptions } =
    useAssetManagementContext();

  // handles for modals
  const handleOpenMutualFundCreate = () => {
    setMutualFundFormOpen(true);
    setType("create");
  };
  const handleCloseMutualFundForm = () => {
    setMutualFundFormOpen(false);
  };

  useEffect(() => {
    MutualFundsService()
      .getMutualFundsDetails()
      .then((res) => {
        if (res && res.data) {
          setMutualFundDetails(res.data);
          setSnackBarOptions({
            open: true,
            message: "Fetched salary details Successfully",
            severity: "success",
          });
        }
      });

    MutualFundsService()
      .getmutualFundsDashboardList()
      .then((res) => {
        setMutualFundDashboardDetails(res?.data);
        setSnackBarOptions({
          open: true,
          message: "Fetched salary details Successfully",
          severity: "success",
        });
      });
  }, [refreshData.refreshMutualFunds]);

  return (
    <div className="MutualFundsWrapper" data-testid="mutual-funds-wrapper">
      {snackBarOptions.open && <CustomSnackbar />}
      {mutualFundFormOpen && (
        <MutualFundModal
          selectedMutualFund={selectedMutualFund}
          type={type}
          handleClose={handleCloseMutualFundForm}
          open={mutualFundFormOpen}
          setRefreshData={setRefreshData}
        />
      )}
      <div className="MutualFundsHeader">
        <div>
          <Typography variant="h4" className="mutualFundsTitle">
            Mutual Fund Portfolio Dashboard
          </Typography>
          <Typography variant="body1" className="mutualFundsSubTitle">
            Track and manage your mutual fund investments with ease.
          </Typography>
        </div>
        <div className="MutualFundsButton">
          <CustomButton
            handleClick={() => handleOpenMutualFundCreate()}
            text="+ Add Fund"
            customClass=""
          />
        </div>
      </div>
      <div className="MutualFundsCardsWrapper">
        <MutualFundCard
          header={mutualFundsDashboard.currentValue}
          value={formatCurrency(mutualFundDashboardDetails?.totalCurrentValue)}
          content={mutualFundsDashboard.tpv}
          icon={Icons.symbol}
        />
        <MutualFundCard
          header={mutualFundsDashboard.totalInvestment}
          value={formatCurrency(mutualFundDashboardDetails?.totalInvested)}
          content={mutualFundsDashboard.amountinvested}
          icon={Icons.symbol}
        />
        <MutualFundCard
          header={mutualFundsDashboard.gainLoss}
          value={formatCurrency(mutualFundDashboardDetails?.totalGainLoss)}
          content={`${mutualFundDashboardDetails?.totalGainLossPercent} %`}
          isColoured={true}
          icon={Icons.chart}
        />
        <MutualFundCard
          header={mutualFundsDashboard.targetProgress}
          value={`${mutualFundDashboardDetails?.totalTargetProgress} %`}
          content={`Target: ${formatCurrency(mutualFundDashboardDetails?.totalTargetAmount)}`}
          icon={Icons.tracking}
        />
      </div>
      <div>
        <CenterTabs setValue={setValue} value={value} />
      </div>
      {value === 0 && (
        <div className="MutualFundsTableWrapper">
          <Typography variant="h6">My Mutual Funds</Typography>
          <MutualFundTable
            mutualFundDetails={mutualFundDetails}
            setSelectedMutualFund={setSelectedMutualFund}
            setType={setType}
            setMutualFundFormOpen={setMutualFundFormOpen}
          />
        </div>
      )}
    </div>
  );
};

export default MutualFunds;
