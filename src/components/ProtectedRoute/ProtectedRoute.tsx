import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/Asset-Management-UI/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
