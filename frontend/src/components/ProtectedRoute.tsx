// frontend/src/components/ProtectedRoute.tsx

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  // Não está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Requer admin mas usuário não é admin
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Tudo ok, renderiza os children
  return <>{children}</>;
}
