import { useParams } from "react-router";
import Dashboard from "./Dashboard/Dashboard";
import { DisplayContentEnum } from "../../shared/Constants";
import MiniDrawer from "../../components/Sidebar/Sidebar";
import Salary from "./Salary/Salary";
import Goals from "./Goals/Goals";
import MutualFunds from "./MutualFunds/MutualFunds";
import Loans from "./Liabilities/Loans";
import EMIs from "./Liabilities/EMIs";
import Reports from "./Reports/Reports";
import Calculator from "./Calculator/Calculator";
import LIC from "./LIC/LIC";
import ProvidentFund from "./ProvidentFund/ProvidentFund";
import Stocks from "./Stocks/Stocks";
import Settings from "./Settings/Settings";
import Projections from "./Projections/Projections";
import { DialogProvider } from "../ContextProvider/DialogContextProvider";

const AssetManagement = () => {
  const { displayContent } = useParams();
  return (
    <div data-testid="asset-management-container">
      <DialogProvider>
      <MiniDrawer>
        <div>
          {(() => {
            switch (displayContent) {
              case DisplayContentEnum.netWorth:
              case DisplayContentEnum.dashboard:
                return <Dashboard />;
              case DisplayContentEnum.stocks:
                return <Stocks />;
              case DisplayContentEnum.salary:
                return <Salary />;
              case DisplayContentEnum.mutualFunds:
                return <MutualFunds />;
              case DisplayContentEnum.providentFund:
                return <ProvidentFund />;
              case DisplayContentEnum.lic:
                return <LIC />;
              case DisplayContentEnum.calculator:
                return <Calculator />;
              case DisplayContentEnum.goals:
                return <Goals />;
              case DisplayContentEnum.loans:
                return <Loans />;
              case DisplayContentEnum.emis:
                return <EMIs />;
              case DisplayContentEnum.reports:
                return <Reports />;
              case DisplayContentEnum.settings:
                return <Settings />;
              case DisplayContentEnum.projections:
                return <Projections />;
              default:
                return null;
            }
          })()}
        </div>
      </MiniDrawer>
      </DialogProvider>
    </div>
  );
};

export default AssetManagement;
