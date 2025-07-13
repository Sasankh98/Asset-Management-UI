import { RouteObject } from "react-router-dom";
import AssetManagement from "../../AssetManagement/Pages/AssetManagement";
import AssetManagementProvider from "../../AssetManagement/ContextProvider/ContextProvider";
import Login from "../../AssetManagement/Pages/Login/Login";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AssetManagementProvider>
        <Login />
      </AssetManagementProvider>
    ),
  },
  {
    path: "/:displayContent",  // Add explicit route for dashboard
    element: (
      <AssetManagementProvider>
        <AssetManagement />
      </AssetManagementProvider>
    ),
  },

];

export default routes;
