import { RootState } from '../../app/store';
import { DashboardState } from './dashboardSlice';

// Selector para el estado de carga
export const selectDashboardLoading = (state: RootState): DashboardState['loading'] => 
  state.dashboard.loading;

// Selector para los datos del dashboard
export const selectDashboardData = (state: RootState): DashboardState['data'] => 
  state.dashboard.data;

// Selector para los errores del dashboard
export const selectDashboardError = (state: RootState): DashboardState['error'] => 
  state.dashboard.error;
