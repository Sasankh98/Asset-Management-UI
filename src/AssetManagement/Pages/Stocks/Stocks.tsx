import { useEffect, useState } from "react";
import StocksTable from "./StocksTable/StocksTable";
import CustomButton from "../../../core/CustomButton/CustomButton";
import StocksModal from "./StocksForms/StocksModal";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import StocksService from "../../../Services/StocksService/StocksService";
import { Stock } from "../../../../server/types";

const Stocks = () => {
  const [stocksData, setStocksData] = useState<Stock[] | undefined>([]);
  const [addStocksOpen, setAddStocksOpen] = useState(false);
  const [type, setType] = useState<"create" | "edit" | "info" | "">("");
  const { setRefreshData } = useAssetManagementContext();

  useEffect(() => {
    (async () => {
      try {
        const res: any = await StocksService().getStocksDetails();
        setStocksData(res?.data);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res: any =
          await StocksService().getDailyStocksDetails("BPCL.BSE");
        console.log("Daily Stock Data:", res);
      } catch (err) {
        console.error("Failed to fetch daily stock data:", err);
      }
    })();
  }, []);

  const handleAddStocksOpen = () => {
    setAddStocksOpen(true);
    setType("create");
  };
  const handleAddStocksClose = () => {
    setAddStocksOpen(false);
  };

  return (
    <div data-testid="stocks-wrapper">
      {/* <Details /> */}
      {addStocksOpen ? (
        // <CreateStocks open={addStocksOpen} handleClose={handleAddStocksClose} />
        <StocksModal
          open={addStocksOpen}
          handleClose={handleAddStocksClose}
          type={type}
          setRefreshData={setRefreshData}
        />
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
