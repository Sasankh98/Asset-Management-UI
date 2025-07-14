import { useEffect, useState } from "react";
import IncomeTable from "./IncomeTable/IncomeTable";
import IncomeService from "../../../services/IncomeService/IncomeService";
import { Income as IncomeType } from "../../../../server/types";

const Income = () => {
    const [incomeData, setIncomeData] = useState([] as IncomeType[]);
  useEffect(() => {
    IncomeService().getIncomeDetails()
    .then((res) => {
      setIncomeData(res?.data || [] );
    });
  }, []);
  return <div>
    <IncomeTable incomeData={incomeData}/>
  </div>;
};

export default Income;
