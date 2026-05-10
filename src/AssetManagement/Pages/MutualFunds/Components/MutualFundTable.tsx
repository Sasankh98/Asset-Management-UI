import { type MutualFund } from "../../../../../server/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Headers } from "../../../../config/config";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatCurrency } from "../../../../utils/currencyConverter";
import SortableDataTable from "../../../../components/SortableDataTable/SortableDataTable";
import { type TableRow } from "../../../../hooks/useTableSort";

interface MutualFundTableProps {
  loading?: boolean;
  mutualFundDetails: MutualFund[];
  setMutualFundFormOpen: Dispatch<SetStateAction<boolean>>;
  setType: React.Dispatch<React.SetStateAction<"create" | "edit" | undefined>>;
  setSelectedMutualFund: Dispatch<SetStateAction<MutualFund | undefined>>;
}

const CURRENCY_COLS = new Set(["invested", "currentValue", "nav", "gain_loss"]);

const MutualFundTable = ({
  loading = false,
  mutualFundDetails,
  setMutualFundFormOpen,
  setType,
  setSelectedMutualFund,
}: MutualFundTableProps) => {
  const [tableBody, setTableBody] = useState<TableRow[]>([]);

  const handleEditClick = (row: TableRow) => {
    setType("edit");
    setMutualFundFormOpen(true);
    setSelectedMutualFund(mutualFundDetails.find((mf) => mf.id === row[0]));
  };

  useEffect(() => {
    const keys = Headers.MutualFundTable.map((h) => h.colId);
    setTableBody(
      mutualFundDetails.map((f) =>
        keys.map((col) =>
          CURRENCY_COLS.has(col)
            ? formatCurrency(f[col as keyof MutualFund] as number)
            : f[col as keyof MutualFund]
        )
      )
    );
  }, [mutualFundDetails]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="12%" />
            <Skeleton variant="text" width="10%" />
            <Skeleton variant="text" width="12%" />
            <Skeleton variant="text" width="12%" />
            <Skeleton variant="text" width="10%" />
            <Skeleton variant="circular" width={28} height={28} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <SortableDataTable
      columns={Headers.MutualFundTable}
      rows={tableBody}
      renderCell={(value, colIndex, row) => {
        // Edit button (last col)
        if (colIndex === 9) {
          return (
            <IconButton size="small" onClick={() => handleEditClick(row)} aria-label="edit">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          );
        }
        // Gain/Loss (col 7)
        if (colIndex === 7) {
          const isNeg = String(value).includes("-");
          return (
            <Box component="span" sx={{ color: isNeg ? "error.dark" : "success.dark", fontWeight: 600 }}>
              {value}
            </Box>
          );
        }
        // Gain % (col 8)
        if (colIndex === 8) {
          const num = parseFloat(String(value));
          return (
            <Chip
              label={`${num >= 0 ? "+" : ""}${isNaN(num) ? value : num.toFixed(2)}%`}
              size="small"
              color={num >= 0 ? "success" : "error"}
              sx={{ fontWeight: 700 }}
            />
          );
        }
        return undefined;
      }}
    />
  );
};

export default MutualFundTable;
