import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useParams } from "react-router";

export interface RefreshDataProps {
  refreshGoals: boolean;
  refreshSalary: boolean;
  refreshStocks?: boolean;
  refreshMutualFunds?: boolean;
  refreshProvidentFund?: boolean;
  refreshLic?: boolean;
}

export interface SnackBarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";

}
export interface AssetManagementContextProps {
  displayContent: string | undefined;
  refreshData: RefreshDataProps;
  setRefreshData: React.Dispatch<React.SetStateAction<RefreshDataProps>>;
  snackBarOptions: SnackBarProps;
  setSnackBarOptions: React.Dispatch<React.SetStateAction<SnackBarProps>>;
  // setDisplayContent: (val: string) => void;
}

interface AssetManagementProviderProps {
  children: ReactNode;
}
export const AssetManagementContext = createContext<
  AssetManagementContextProps | undefined
>(undefined);

const AssetManagementProvider = ({
  children,
}: AssetManagementProviderProps) => {
  const { displayContent } = useParams();
  const [refreshData, setRefreshData] = useState<RefreshDataProps>({
    refreshGoals: false,
    refreshSalary: false,
  });
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<number | undefined>(0);
  const [snackBarOptions, setSnackBarOptions] = useState<SnackBarProps>({
    open: false,
    message: "",
    severity: "success",
  });

  const contextValue = useMemo(
    () => ({
      displayContent,
      refreshData,
      setRefreshData,
      order,
      setOrder,
      orderBy,
      setOrderBy,
      snackBarOptions,
      setSnackBarOptions,
    }),
    [displayContent, refreshData, order, orderBy, snackBarOptions]
  );

  return (
    <AssetManagementContext.Provider value={contextValue}>
      {children}
    </AssetManagementContext.Provider>
  );
};

export default AssetManagementProvider;

export const useAssetManagementContext = () => {
  const context = useContext(AssetManagementContext);
  if (!context) {
    throw new Error(
      "useAssetManagementContext must be used within an AssetManagementProvider"
    );
  }
  return context;
};
