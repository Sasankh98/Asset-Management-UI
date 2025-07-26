import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { useParams } from "react-router";

export interface AssetManagementContextProps {
  displayContent: string | undefined;
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

  const contextValue = useMemo(
    () => ({
      displayContent,
      // setDisplayContent: (val: string) => setDisplayContent(val),
    }),
    [displayContent]
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
