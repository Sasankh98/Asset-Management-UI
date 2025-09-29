import { useEffect, useState } from "react";
import StocksTable from "./StocksTable/StocksTable";
import CustomButton from "../../../core/CustomButton/CustomButton";
import StocksModal from "./StocksForms/StocksModal";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import StocksService from "../../../services/StocksService/StocksService";
import { Stock } from "../../../../server/types";

const Stocks = () => {
  const [stocksData, setStocksData] = useState<Stock[] | undefined>([]);
  const [addStocksOpen, setAddStocksOpen] = useState(false);
  const [type, setType] = useState<"create" | "edit" | "info" | "">("")
  const {setRefreshData} = useAssetManagementContext();

  useEffect(() => {
    StocksService().getStocksDetails().then((res) => {
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
      {/* <Details /> */}
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
