import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout/AppLayout";
import { BaseUrlContext } from "./components/Contexts/BaseUrlContext";

function App() {
  const baseUrl = "/"; // Set your base URL here
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/*" element={<AppLayout />} />
    ),
  
  );
  return (
    <BaseUrlContext.Provider value={baseUrl}>
      <RouterProvider router={router} />
    </BaseUrlContext.Provider>
  );
}

export default App;
