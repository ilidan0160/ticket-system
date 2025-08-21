import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { RootState } from '../../app/store';
import api from '../../services/api';

// Interfaces
interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Message {
  id: number;
  mensaje: string;
  isInternal: boolean;
  ticketId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
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
  updatedAt: string;
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
  socket: any | null;
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

// Initial state
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
  async (params: { page?: number; limit?: number; filters?: Partial<TicketState['filters']> }, { getState, rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, filters = {} } = params;
      const state = getState() as RootState;
      
      const response = await api.get('/tickets', {
        params: {
          page,
          limit,
          ...state.tickets.filters,
          ...filters,
        },
      });
      
      return {
        tickets: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar los tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar el ticket');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'solicitante' | 'asignadoA'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear el ticket');
    }
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, ...updates }: { id: number } & Partial<Ticket>, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tickets/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar el ticket');
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/tickets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar el ticket');
    }
  }
);

export const addMessage = createAsyncThunk(
  'tickets/addMessage',
  async ({ ticketId, message, isInternal }: { ticketId: number; message: string; isInternal: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const user = state.auth.user;
      
      const response = await api.post('/chat/message', {
        ticketId,
        message,
        isInternal,
      });
      
      // Emit socket event
      if (state.tickets.socket) {
        state.tickets.socket.emit('chat:new_message', {
          ...response.data,
          user: { id: user?.id, username: user?.username, email: user?.email },
        });
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al enviar el mensaje');
    }
  }
);

export const fetchTicketStats = createAsyncThunk(
  'tickets/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tickets/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar las estadísticas');
    }
  }
);

// Reducer
const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      // Disconnect existing socket if any
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TicketState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addMessageLocally: (state, action: PayloadAction<Message>) => {
      if (state.currentTicket) {
        if (!state.currentTicket.mensajes) {
          state.currentTicket.mensajes = [];
        }
        state.currentTicket.mensajes.push(action.payload);
      }
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    resetTicketState: () => initialState,
      if (state.currentTicket?.id === action.payload.id) state.currentTicket = action.payload;
    },
    removeTicket: (state, action: PayloadAction<number>) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload);
      if (state.currentTicket?.id === action.payload) state.currentTicket = null;
      state.total = Math.max(0, state.total - 1);
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
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ticket';
      });
  },
  extraReducers: (builder) => {
    // Fetch Tickets
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

    // Fetch Ticket By ID
    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Ticket
    builder
      .addCase(createTicket.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.updating = false;
        state.tickets.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Update Ticket
    builder
      .addCase(updateTicket.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Delete Ticket
    builder
      .addCase(deleteTicket.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.updating = false;
        state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.currentTicket?.id === action.payload) {
          state.currentTicket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Add Message
    builder
      .addCase(addMessage.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.updating = false;
        if (state.currentTicket) {
          if (!state.currentTicket.mensajes) {
            state.currentTicket.mensajes = [];
          }
          state.currentTicket.mensajes.push(action.payload);
        }
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Fetch Ticket Stats
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

// Export actions
export const { 
  setSocket, 
  setFilters, 
  resetFilters, 
  addMessageLocally, 
  clearCurrentTicket, 
  resetTicketState 
} = ticketSlice.actions;

// Export selectors
export const selectTickets = (state: RootState) => state.tickets.tickets;
export const selectCurrentTicket = (state: RootState) => state.tickets.currentTicket;
export const selectLoading = (state: RootState) => state.tickets.loading;
export const selectUpdating = (state: RootState) => state.tickets.updating;
export const selectError = (state: RootState) => state.tickets.error;
export const selectTicketStats = (state: RootState) => state.tickets.stats;
export const selectTicketFilters = (state: RootState) => state.tickets.filters;
export const selectTicketPagination = (state: RootState) => ({
  total: state.tickets.total,
  totalPages: state.tickets.totalPages,
  currentPage: state.tickets.currentPage,
});

export default ticketSlice.reducer;
