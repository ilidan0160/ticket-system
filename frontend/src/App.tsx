import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import NotFoundPage from './components/common/NotFoundPage';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppInitializer from './components/auth/AppInitializer';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppInitializer />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            
            {/* Add more protected routes here */}
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
