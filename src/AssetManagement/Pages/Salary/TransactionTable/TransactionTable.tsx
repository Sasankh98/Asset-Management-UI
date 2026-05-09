import { Salary } from "../../../../../server/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Headers } from "../../../../config/config";
import IconButton from "@mui/material/IconButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatCurrency } from "../../../../utils/currencyConverter";
import { dateFormat } from "../../../../utils/dateTime";
import SortableDataTable from "../../../../components/SortableDataTable/SortableDataTable";
import { type TableRow } from "../../../../hooks/useTableSort";

interface IncomeTableProps {
  transactionData: Salary[];
  setTransactionFormOpen: Dispatch<SetStateAction<boolean>>;
  setType: React.Dispatch<React.SetStateAction<"create" | "edit" | undefined>>;
  setSelectedTransaction: Dispatch<SetStateAction<Salary | undefined>>;
}

const TransactionTable = ({
  transactionData,
  setTransactionFormOpen,
  setType,
  setSelectedTransaction,
}: IncomeTableProps) => {
  const [tableBody, setTableBody] = useState<TableRow[]>([]);

  const handleEditClick = (row: TableRow) => {
    setType("edit");
    setTransactionFormOpen(true);
    setSelectedTransaction(transactionData.find((income) => income.id === row[0]));
  };

  useEffect(() => {
    const key = Headers.IncomeTable.map((el) => el.colId);
    const outerElement: TableRow[] = transactionData?.map((element) => {
      return key.map((col) => {
        if (col === "amount") return formatCurrency(element[col] as number);
        if (col === "date") return dateFormat(element[col] as string).dateOnly;
        return element[col as keyof Salary];
      });
    });
    setTableBody(outerElement);
  }, [transactionData]);

  return (
    <SortableDataTable
      columns={Headers.IncomeTable}
      rows={tableBody}
      renderCell={(_, colIndex, row) => {
        if (colIndex === 5) {
          return (
            <IconButton onClick={() => handleEditClick(row)} aria-label="edit">
              <EditOutlinedIcon />
            </IconButton>
          );
        }
        return undefined;
      }}
    />
  );
};

export default TransactionTable;
