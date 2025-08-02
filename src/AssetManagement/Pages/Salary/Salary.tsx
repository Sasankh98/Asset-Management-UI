import { useEffect, useState } from "react";
import TransactionTable from "./TransactionTable/TransactionTable";
import SalaryService from "../../../services/SalaryService/SalaryService";
import { Salary } from "../../../../server/types";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import TransactionForm from "./TransactionForm/TransactionForm";
import CustomButton from "../../../core/CustomButton/CustomButton";
import LineGraph from "../../../components/LineGraph/LineGraph";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";

const SalaryComponent = () => {
  const { refreshData, setRefreshData, snackBarOptions, setSnackBarOptions } =
    useAssetManagementContext();
  const [transactionData, setTransactionData] = useState([] as Salary[]);
  const [transactionFormOpen, setTransactionFormOpen] =
    useState<boolean>(false);
  const [type, setType] = useState<"create" | "edit" | "">("");
  const [selectedTransaction, setSelectedTransaction] = useState<Salary>();

  // handles for modals
  const handleOpenTransactionCreate = () => {
    setTransactionFormOpen(true);
    setType("create");
  };
  const handleCloseTransactionForm = () => {
    setTransactionFormOpen(false);
  };

  // Fetch Transaction Data
  useEffect(() => {
    SalaryService()
      .getSalaryDetails()
      .then((res) => {
        setTransactionData(res?.data || []);
        setSnackBarOptions({
          open: true,
          message: "Fetched salary details Successfully",
          severity: "success",
        });
      });
  }, [refreshData.refreshSalary]);

  return (
    <div data-testid="salary-container">
      {snackBarOptions.open && <CustomSnackbar />}
      {transactionFormOpen && (
        <TransactionForm
          selectedTransaction={selectedTransaction}
          type={type}
          handleClose={handleCloseTransactionForm}
          open={transactionFormOpen}
          setRefreshData={setRefreshData}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "1rem 0rem",
          justifyContent: "center",
        }}
        data-testid="income-button-container"
      >
        <CustomButton
          handleClick={() => handleOpenTransactionCreate()}
          text="Add Transaction"
          customClass=""
        />
      </div>
      <div>
        <LineGraph monthlyData={transactionData} />
      </div>
      <TransactionTable
        transactionData={transactionData}
        setTransactionFormOpen={setTransactionFormOpen}
        setType={setType}
        setSelectedTransaction={setSelectedTransaction}
      />
    </div>
  );
};

export default SalaryComponent;
