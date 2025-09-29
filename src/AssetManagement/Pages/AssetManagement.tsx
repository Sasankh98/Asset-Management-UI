import { useParams } from "react-router";
import Dashboard from "./Dashboard/Dashboard";
import { DisplayContentEnum } from "../../shared/Constants";
import MiniDrawer from "../../components/Sidebar/Sidebar";
// import Stocks from "./Stocks/Stocks";
import Salary from "./Salary/Salary";
import Goals from "./Goals/Goals";
import MutualFunds from "./MutualFunds/MutualFunds";

const AssetManagement = () => {
  const { displayContent } = useParams();
  return (
    <div data-testid="asset-management-container">
      <MiniDrawer>
        <div>
          {(() => {
            switch (displayContent) {
              case DisplayContentEnum.dashboard:
                return <Dashboard />;
              case DisplayContentEnum.stocks:
                return null;
              case DisplayContentEnum.salary:
                return <Salary />;
              case DisplayContentEnum.mutualFunds:
                return <MutualFunds />;
              case DisplayContentEnum.providentFund:
                return null;
              case DisplayContentEnum.lic:
                return null;
              case DisplayContentEnum.calculator:
                return <Dashboard />;
              case DisplayContentEnum.goals:
                return <Goals />;
              default:
                return null;
            }
          })()}
        </div>
      </MiniDrawer>
    </div>
  );
};

export default AssetManagement;
