import { RouteObject } from "react-router-dom";
import AssetManagement from "../../AssetManagement/Pages/AssetManagement";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";
import Login from "../../AssetManagement/Pages/Login/Login";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

const ProtectedAssetManagement = (
  <AssetManagementProvider>
    <ProtectedRoute>
      <AssetManagement />
    </ProtectedRoute>
  </AssetManagementProvider>
);

const routes: RouteObject[] = [
  {
    path: "Asset-Management-UI/",
    element: (
      <AssetManagementProvider>
        <Login />
      </AssetManagementProvider>
    ),
  },
  {
    path: "Asset-Management-UI/:displayContent",
    element: ProtectedAssetManagement,
  },
  {
    path: "Asset-Management-UI/investments/:displayContent",
    element: ProtectedAssetManagement,
  },
  {
    path: "Asset-Management-UI/salary/:displayContent",
    element: ProtectedAssetManagement,
  },
  {
    path: "Asset-Management-UI/liabilities/:displayContent",
    element: ProtectedAssetManagement,
  },
];

export default routes;
