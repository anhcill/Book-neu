import { Navigate } from 'react-router-dom';
import { useUserLogin } from '../index';

function AdminRoute({ children }) {
  const { userLoggedIn, userRole } = useUserLogin();

  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export { AdminRoute };
