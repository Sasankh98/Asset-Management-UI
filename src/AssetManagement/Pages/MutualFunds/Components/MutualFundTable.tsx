import { MutualFund } from "../../../../../server/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Headers } from "../../../../config/config";
import IconButton from "@mui/material/IconButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Typography from "@mui/material/Typography";
import { formatCurrency } from "../../../../utils/currencyConverter";
import SortableDataTable from "../../../../components/SortableDataTable/SortableDataTable";
import { type TableRow } from "../../../../hooks/useTableSort";

interface MutualFundTableProps {
  mutualFundDetails: MutualFund[];
  setMutualFundFormOpen: Dispatch<SetStateAction<boolean>>;
  setType: React.Dispatch<React.SetStateAction<"create" | "edit" | undefined>>;
  setSelectedMutualFund: Dispatch<SetStateAction<MutualFund | undefined>>;
}

const MutualFundTable = ({
  mutualFundDetails,
  setMutualFundFormOpen,
  setType,
  setSelectedMutualFund,
}: MutualFundTableProps) => {
  const [tableBody, setTableBody] = useState<TableRow[]>([]);

  const handleEditClick = (row: TableRow) => {
    setType("edit");
    setMutualFundFormOpen(true);
    setSelectedMutualFund(
      mutualFundDetails.find((mutualFund) => mutualFund.id === row[0])
    );
  };

  useEffect(() => {
    const key = Headers.MutualFundTable.map((el) => el.colId);
    const outerElement: TableRow[] = mutualFundDetails?.map((element) => {
      return key.map((col) => {
        if (
          col === "invested" ||
          col === "currentValue" ||
          col === "nav" ||
          col === "gain_loss"
        ) {
          return formatCurrency(element[col as keyof MutualFund] as number);
        }
        return element[col as keyof MutualFund];
      });
    });
    setTableBody(outerElement);
  }, [mutualFundDetails]);

  return (
    <SortableDataTable
      columns={Headers.MutualFundTable}
      rows={tableBody}
      renderCell={(value, colIndex, row) => {
        if (colIndex === 9) {
          return (
            <IconButton onClick={() => handleEditClick(row)} aria-label="edit">
              <EditOutlinedIcon />
            </IconButton>
          );
        }
        if (colIndex === 7) {
          return (
            <span style={value.toString().includes("-") ? { color: "red" } : { color: "#22BB33" }}>
              {value}
            </span>
          );
        }
        if (colIndex === 8) {
          return <Typography variant="body2">{value} %</Typography>;
        }
        return undefined;
      }}
    />
  );
};

export default MutualFundTable;
