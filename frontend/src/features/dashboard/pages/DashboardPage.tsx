import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../app/store';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress,
  Button,
  Container
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Changed import for v7.3.1
import { fetchDashboardData } from '../dashboardSlice';
import { selectDashboardLoading } from '../dashboardSelectors';

const DashboardPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    // Cargar datos del dashboard
    const loadData = async () => {
      try {
        // Usar el operador de aserción no nulo para asegurar a TypeScript que el dispatch funcionará
        await (dispatch as any)(fetchDashboardData());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadData();
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Open Tickets
            </Typography>
            <Typography component="p" variant="h4">
              12
            </Typography>
          </Paper>
        </Grid>
        
        <Grid xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              In Progress
            </Typography>
            <Typography component="p" variant="h4">
              8
            </Typography>
          </Paper>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              On Hold
            </Typography>
            <Typography component="p" variant="h4">
              5
            </Typography>
          </Paper>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Resolved (7d)
            </Typography>
            <Typography component="p" variant="h4">
              23
            </Typography>
          </Paper>
        </Grid>
        
        {/* Welcome Section */}
        <Grid xs={12}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to the Dashboard!
            </Typography>
            <Typography paragraph>
              Here you can see a summary of the system activity. Use the navigation menu to access different sections of the application.
            </Typography>
            <Button variant="contained" color="primary">
              Create New Ticket
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
