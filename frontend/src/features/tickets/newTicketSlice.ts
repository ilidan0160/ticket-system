import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import api from '../../services/api';

// Interfaces
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Message {
  id: number;
  mensaje: string;
  isInternal: boolean;
  ticketId: number;
  userId: number;
  createdAt: string;
  user?: User;
}

interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  categoria: string;
  solicitanteId: number;
  asignadoAId: number | null;
  createdAt: string;
  solicitante?: User;
  asignadoA?: User | null;
  mensajes?: Message[];
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  socket: any;
  total: number;
  totalPages: number;
  currentPage: number;
  filters: {
    status: string;
    priority: string;
    categoria: string;
    search: string;
  };
  stats: {
    total: number;
    abierto: number;
    en_progreso: number;
    pendiente: number;
    resuelto: number;
    cerrado: number;
  };
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  updating: false,
  socket: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
  filters: {
    status: '',
    priority: '',
    categoria: '',
    search: '',
  },
  stats: {
    total: 0,
    abierto: 0,
    en_progreso: 0,
    pendiente: 0,
    resuelto: 0,
    cerrado: 0,
  },
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params: { page?: number; limit?: number; filters?: any }, { getState, rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, filters = {} } = params;
      const state = getState() as RootState;
      const response = await api.get('/tickets', {
        params: { page, limit, ...state.tickets.filters, ...filters },
      });
      return {
        tickets: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar tickets');
    }
  }
);

// ... other async thunks ...

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      if (state.socket) state.socket.disconnect();
      state.socket = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addMessageLocally: (state, action) => {
      if (state.currentTicket) {
        if (!state.currentTicket.mensajes) state.currentTicket.mensajes = [];
        state.currentTicket.mensajes.push(action.payload);
      }
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    resetTicketState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // ... other cases ...
  },
});

export const {
  setSocket,
  setFilters,
  resetFilters,
  addMessageLocally,
  clearCurrentTicket,
  resetTicketState,
} = ticketSlice.actions;

export const selectTickets = (state: RootState) => state.tickets.tickets;
export const selectCurrentTicket = (state: RootState) => state.tickets.currentTicket;
export const selectLoading = (state: RootState) => state.tickets.loading;
export const selectError = (state: RootState) => state.tickets.error;
export const selectFilters = (state: RootState) => state.tickets.filters;
export const selectStats = (state: RootState) => state.tickets.stats;

export default ticketSlice.reducer;
