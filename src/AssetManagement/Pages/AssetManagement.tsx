import { useParams } from "react-router";
import Dashboard from "./Dashboard/Dashboard";
import { DisplayContentEnum } from "../../shared/Constants";
import MiniDrawer from "../../components/Sidebar/Sidebar";
import Stocks from "./Stocks/Stocks";

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
