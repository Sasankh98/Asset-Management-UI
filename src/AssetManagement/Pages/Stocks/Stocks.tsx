import { useEffect, useState } from "react";
import StocksTable from "./StocksTable/StocksTable";
import { callAPI } from "../../../services/apiServices";
import { ConfigMethod, ConfigUrl } from "../../../config/ConfigAPI";
import CustomButton from "../../../core/CustomButton/CustomButton";
import { CreateStocks } from "./StocksForms";
import Details from "./Overview/Details";

const Stocks = () => {
  const [stocksData, setStocksData] = useState();
  const [addStocksOpen, setAddStocksOpen] = useState(false);

  useEffect(() => {
    callAPI(ConfigUrl.Stocks, ConfigMethod.getMethod).then((res) => {
      setStocksData(res?.data);
    });
  }, []);

  const handleAddStocksOpen = () => {
    setAddStocksOpen(true);
  };
  const handleAddStocksClose = () => {
    setAddStocksOpen(false);
  };

  return (
    <div>
      <Details />
      {addStocksOpen ? (
        <CreateStocks open={addStocksOpen} handleClose={handleAddStocksClose} />
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
