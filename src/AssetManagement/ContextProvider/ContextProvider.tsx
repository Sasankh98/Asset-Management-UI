import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router";

export interface RefreshDataProps {
  refreshGoals: boolean
}
export interface AssetManagementContextProps {
  displayContent: string | undefined;
  refreshData:RefreshDataProps,
  setRefreshData:React.Dispatch<React.SetStateAction<RefreshDataProps>>
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
  const [refreshData,setRefreshData] = useState<RefreshDataProps>({
    refreshGoals: false
  })

  const contextValue = useMemo(
    () => ({
      displayContent,
      refreshData,
      setRefreshData,
    }),
    [displayContent,refreshData]
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
