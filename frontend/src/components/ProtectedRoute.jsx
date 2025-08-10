import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (decoded.exp < currentTime) {
      // Token is expired, remove it and redirect
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Check role-based access if requiredRoles are specified
    if (requiredRoles.length > 0) {
      const userRole = decoded.role; // Assuming role is stored in JWT

      if (!requiredRoles.includes(userRole)) {
        // Redirect based on their role
        return userRole === "seller" ? (
          <Navigate to="/restaurant-dashboard" replace />
        ) : (
          <Navigate to="/home" replace />
        );
      }
    }

    return children;
  } catch (error) {
    // Invalid token case
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
