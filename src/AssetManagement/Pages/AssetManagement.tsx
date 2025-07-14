import { useParams } from "react-router";
import Dashboard from "./Dashboard/Dashboard";
import { DisplayContentEnum } from "../../shared/Constants";
import MiniDrawer from "../../components/Sidebar/Sidebar";
import Stocks from "./Stocks/Stocks";
import Income from "./Income/Income";
import Expenses from "./Expenses/Expenses";

const AssetManagement = () => {
  const { displayContent } = useParams();
  return (
    <div>
      <MiniDrawer>
        <div>
          {(() => {
            switch (displayContent) {
              case DisplayContentEnum.dashboard:
                return <Dashboard />;
              case DisplayContentEnum.stocks:
                return <Stocks />;
              case DisplayContentEnum.income:
                return <Income />;
              case DisplayContentEnum.expenses:
                return <Expenses />;
              case DisplayContentEnum.mutualFunds:
                return <Stocks />;
              case DisplayContentEnum.providentFund:
                return <Stocks />;
              case DisplayContentEnum.lic:
                return <Stocks />;
              case DisplayContentEnum.calculator:
                return <Stocks />;
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
