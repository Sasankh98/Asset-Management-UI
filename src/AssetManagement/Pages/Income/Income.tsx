import { useEffect, useState } from "react";
import IncomeTable from "./IncomeTable/IncomeTable";
import IncomeService from "../../../services/IncomeService/IncomeService";
import { Income as IncomeType } from "../../../../server/types";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import IncomeForm from "./IncomeForm/IncomeForm";
import CustomButton from "../../../core/CustomButton/CustomButton";

const Income = () => {
  const { refreshData,setRefreshData } = useAssetManagementContext();
  const [incomeData, setIncomeData] = useState([] as IncomeType[]);
  const [incomeFormOpen, setIncomeFormOpen] = useState<boolean>(false);
  const [type, setType] = useState<"create" | "edit" | "">("");
   const [selectedIncome, setSelectedIncome] = useState<IncomeType>();

  // Modals
  // const [editRow, setEditRow] = useState();
  // const [editOpen, setEditOpen] = useState(false);

  // handles for modals
  const handleOpenIncomeCreate = () => {
    setIncomeFormOpen(true);
    setType("create");
  };
  const handleCloseIncomeForm = () => {
    setIncomeFormOpen(false);
  };

  // Fetch Income Data
  useEffect(() => {
    IncomeService()
      .getIncomeDetails()
      .then((res) => {
        setIncomeData(res?.data || []);
      });
  }, [refreshData.refreshIncome]);

  return (
    <div>
      {incomeFormOpen && (
        <IncomeForm
        selectedIncome={selectedIncome}
        type = {type}
        handleClose = {handleCloseIncomeForm}
        open = {incomeFormOpen}
        setRefreshData = {setRefreshData}
        />
      )}
          <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "1rem",
          justifyContent: "center",
        }}
        data-testid="income-button-container"
      >
        <CustomButton
          handleClick={() => handleOpenIncomeCreate()}
          text="Add Income"
          customClass=""
        />
      </div>
      <IncomeTable
        incomeData={incomeData}
        setIncomeFormOpen={setIncomeFormOpen}
        setType={setType}
        setSelectedIncome = {setSelectedIncome}
      />
    </div>
  );
};

export default Income;
