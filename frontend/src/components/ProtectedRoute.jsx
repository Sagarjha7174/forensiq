import { Navigate } from 'react-router-dom';
import { getStoredUser, isAuthenticated } from '../services/authStorage';

function ProtectedRoute({ children, role }) {
  const authed = isAuthenticated();
  const user = getStoredUser();

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
