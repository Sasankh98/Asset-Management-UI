import { RouteObject } from "react-router-dom";
import AssetManagement from "../../AssetManagement/Pages/AssetManagement";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";
import Login from "../../AssetManagement/Pages/Login/Login";

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
    path: "Asset-Management-UI/:displayContent",  // Add explicit route for dashboard
    element: (
      <AssetManagementProvider>
        <AssetManagement />
      </AssetManagementProvider>
    ),
  },
  {
    path: "Asset-Management-UI/investments/:displayContent",  // Add explicit route for dashboard
    element: (
      <AssetManagementProvider>
        <AssetManagement />
      </AssetManagementProvider>
    ),
  },
  {
    path: "Asset-Management-UI/salary/:displayContent",  // Add explicit route for dashboard
    element: (
      <AssetManagementProvider>
        <AssetManagement />
      </AssetManagementProvider>
    ),
  },

];

export default routes;
