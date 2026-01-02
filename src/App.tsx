import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout/AppLayout";
import { BaseUrlContext } from "./components/Contexts/BaseUrlContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const baseUrl = "Asset-Management-UI/"; // Set your base URL here
  const router = createBrowserRouter(
    createRoutesFromElements(<Route path="/*" element={<AppLayout />} />)
  );
  return (
    <QueryClientProvider client={createQueryClient()}>
      <BaseUrlContext.Provider value={baseUrl}>
        <RouterProvider router={router} />
      </BaseUrlContext.Provider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
