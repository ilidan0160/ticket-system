import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// Tipos para el estado del dashboard
interface DashboardData {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  waitingTickets: number;
  recentTickets: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
  }>;
  ticketsByCategory: Array<{ name: string; value: number }>;
  ticketsByStatus: Array<{ name: string; value: number }>;
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

// Tipos exportados
export type { DashboardData, DashboardState };

// Estado inicial
const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk para obtener los datos del dashboard
export const fetchDashboardData = createAsyncThunk<DashboardData, void, { state: RootState }>(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
  try {
    // En una aplicación real, esto haría una llamada a la API
    // const response = await axios.get('/api/dashboard');
    // return response.data;
    
    // Datos de ejemplo para desarrollo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalTickets: 48,
          openTickets: 12,
          inProgressTickets: 8,
          resolvedTickets: 23,
          waitingTickets: 5,
          recentTickets: [
            { id: 1, title: 'Problema con el correo', status: 'Abierto', priority: 'Alta', category: 'Correo', createdAt: '2025-08-20' },
            { id: 2, title: 'Error en el sistema', status: 'En Progreso', priority: 'Crítica', category: 'Software', createdAt: '2025-08-20' },
            { id: 3, title: 'Impresora no funciona', status: 'En Espera', priority: 'Media', category: 'Hardware', createdAt: '2025-08-19' },
            { id: 4, title: 'Acceso denegado', status: 'Resuelto', priority: 'Baja', category: 'Cuentas', createdAt: '2025-08-19' },
            { id: 5, title: 'Conexión lenta', status: 'Resuelto', priority: 'Media', category: 'Red', createdAt: '2025-08-18' },
          ],
          ticketsByCategory: [
            { name: 'Hardware', value: 12 },
            { name: 'Software', value: 19 },
            { name: 'Red', value: 8 },
            { name: 'Correo', value: 15 },
            { name: 'Otros', value: 5 },
          ],
          ticketsByStatus: [
            { name: 'Abiertos', value: 12 },
            { name: 'En Progreso', value: 8 },
            { name: 'En Espera', value: 5 },
            { name: 'Resueltos', value: 23 },
          ],
        });
      }, 1000);
    });
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error al cargar los datos del dashboard');
  }
});

// Slice del dashboard
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Reducers síncronos pueden ir aquí
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Exportar acciones
export const { } = dashboardSlice.actions;

// Exportar selectores
export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

// Exportar el reducer
export default dashboardSlice.reducer;
