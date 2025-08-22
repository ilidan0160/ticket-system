import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from '../../features/auth/authSelectors';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  // Add admin check logic here if needed
  // const isAdmin = useSelector(selectIsAdmin);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Add admin check if needed
  // if (requireAdmin && !isAdmin) {
  //   return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
