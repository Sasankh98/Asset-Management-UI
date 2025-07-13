import { Suspense } from "react";
import { RouteObject, Route, Routes } from "react-router-dom";

import NotFound from "../../AssetManagement/Pages/NotFound/NotFound";
import routes from "./AppLayoutRoutes";
console.log("AppLayoutRoutes:", routes);
const AppLayout = () => {
  return (
    <Routes>
        {routes.map((route: RouteObject) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppLayout;