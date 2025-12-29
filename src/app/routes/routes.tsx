import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, RegisterPage } from "@/app/containers/auth";
import { ProtectedRoute } from "./auth.guard";
import { AppLayout } from "@/app/components";
import { DashboardPage } from "@/app/containers/dashboard";
import { EditorPage } from "@/app/containers/editor";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/diagram/:id?" element={<EditorPage />} />
        </Route>
      </Route>
      
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

