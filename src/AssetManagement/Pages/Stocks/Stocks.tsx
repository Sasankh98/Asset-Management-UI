import { useEffect, useState } from "react";
import StocksTable from "./StocksTable/StocksTable";
import { callAPI } from "../../../services/apiServices";
import { ConfigMethod, ConfigUrl } from "../../../config/ConfigAPI";
import CustomButton from "../../../core/CustomButton/CustomButton";
// import { CreateStocks } from "./StocksForms";
import Details from "./Overview/Details";
import StocksModal from "./StocksForms/StocksModal";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import StocksService from "../../../services/StocksService/StocksService";

const Stocks = () => {
  const [stocksData, setStocksData] = useState([]);
  const [addStocksOpen, setAddStocksOpen] = useState(false);
  const [type, setType] = useState<"create" | "edit" | "info" | "">("")
  const {setRefreshData} = useAssetManagementContext();

  useEffect(() => {
    callAPI(ConfigUrl.Stocks, ConfigMethod.getMethod).then((res) => {
      setStocksData(res?.data);
    });
  }, []);

  useEffect(()=>{
    StocksService().getDailyStocksDetails("BPCL.BSE").then((res)=>{
      console.log("Daily Stock Data:", res)
    })
  },[])

  const handleAddStocksOpen = () => {
    setAddStocksOpen(true);
    setType("create")
  };
  const handleAddStocksClose = () => {
    setAddStocksOpen(false);
  };

  return (
    <div data-testid="stocks-wrapper">
      <Details />
      {addStocksOpen ? (
        // <CreateStocks open={addStocksOpen} handleClose={handleAddStocksClose} />
        <StocksModal open={addStocksOpen} handleClose={handleAddStocksClose} type={type} setRefreshData={setRefreshData}/>
      ) : null}

      <div>
        <CustomButton
          text={"Add Stocks"}
          customClass={"login-btn"}
          handleClick={handleAddStocksOpen}
        />
      </div>
      <StocksTable stocksData={stocksData} />
    </div>
  );
};

export default Stocks;
