import { Navigate } from "react-router-dom";

export function ServerSettingsPage() {
  // Redirect to administration page by default
  return <Navigate to="administration" replace />;
}
