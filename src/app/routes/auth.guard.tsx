import { type FC } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/app/store";

export const ProtectedRoute: FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

