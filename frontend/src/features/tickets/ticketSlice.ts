import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import api from '../../services/api';

// Use a more flexible type for socket to avoid immutability issues
type SocketType = any; // Using any to avoid Socket type immutability issues with Redux

// Message interface for ticket messages
interface Message {
  id: number;
  contenido: string;
  esInterno: boolean;
  ticketId: number;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
  usuario?: User;
}

// Types
type Filters = {
  status: string;
  priority: string;
  categoria: string;
  search: string;
};

type FetchTicketsParams = {
  page?: number;
  limit?: number;
  filters?: Partial<Filters>;
};

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

export interface Ticket {
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
  socket: SocketType;
  total: number;
  totalPages: number;
  currentPage: number;
  filters: Filters;
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
  socket: null as unknown as SocketType,
  total: 0,
  totalPages: 0,
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
export const fetchTickets = createAsyncThunk<
  {
    tickets: Ticket[];
    total: number;
    totalPages: number;
    currentPage: number;
  },
  FetchTicketsParams,
  { state: RootState }
>(
  'tickets/fetchAll',
  async ({ page = 1, limit = 10, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentFilters = state.tickets.filters;
      const appliedFilters = { ...currentFilters, ...filters };
      
      // Remove empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(([_, v]) => v !== '')
      );
      
      const response = await api.get<{
        tickets: Ticket[];
        total: number;
        totalPages: number;
      }>('/tickets', {
        params: {
          page,
          limit,
          ...cleanFilters,
        },
      });
      
      return {
        tickets: response.data.tickets,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: page,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching tickets') as any;
    }
  }
);

export const fetchTicketById = createAsyncThunk<Ticket, number, { state: RootState }>(
  'tickets/fetchTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<Ticket>(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching ticket') as any;
    }
  }
);

interface CreateTicketData {
  asunto: string;
  descripcion: string;
  prioridad: string;
  categoria: string;
  estado?: string; // Made optional to match form data
  solicitanteId: number;
  asignadoAId?: number | null;
}

export const createTicket = createAsyncThunk<Ticket, CreateTicketData, { state: RootState }>(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateTicketData>('/tickets', ticketData);
      return response.data as Ticket;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error creating ticket') as any;
    }
  }
);

interface UpdateTicketData {
  id: number;
  asunto?: string;
  descripcion?: string;
  prioridad?: string;
  estado?: string;
  categoria?: string;
  asignadoAId?: number | null;
}

export const updateTicket = createAsyncThunk<Ticket, UpdateTicketData, { state: RootState }>(
  'tickets/updateTicket',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const response = await api.put<UpdateTicketData>(`/tickets/${id}`, updates);
      return response.data as Ticket;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating ticket') as any;
    }
  }
);

export const deleteTicket = createAsyncThunk<number, number>(
  'tickets/deleteTicket',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tickets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting ticket');
    }
  }
);

interface AddMessagePayload {
  ticketId: number;
  message: string;
  isInternal: boolean;
}

export const addMessage = createAsyncThunk<Message, AddMessagePayload, { state: RootState }>(
  'tickets/addMessage',
  async ({ ticketId, message, isInternal }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      
      const response = await api.post<Message>('/chat/message', {
        ticketId,
        message,
        isInternal,
      });
      
      // Emit socket event
      const socket = state.tickets.socket;
      if (socket) {
        const messageData = {
          ...response.data,
          user: { 
            id: user?.id || 0, 
            username: user?.username || 'System', 
            email: user?.email || '' 
          },
        };
        socket.emit('chat:new_message', messageData);
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error sending message') as any;
    }
  }
);

export const fetchTicketStats = createAsyncThunk<
  {
    total: number;
    abierto: number;
    en_progreso: number;
    pendiente: number;
    resuelto: number;
    cerrado: number;
  }
>(
  'tickets/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tickets/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching ticket stats');
    }
  }
);

// Reducer
const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<SocketType>) => {
      state.socket = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        categoria: '',
        search: '',
      };
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
    updateCurrentTicket: (state, action: PayloadAction<Ticket>) => {
      if (state.currentTicket?.id === action.payload.id) state.currentTicket = action.payload;
    },
    removeTicket: (state, action: PayloadAction<number>) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload);
      if (state.currentTicket?.id === action.payload) state.currentTicket = null;
      state.total = Math.max(0, state.total - 1);
    },
  },
  extraReducers: (builder) => {
    // Chain all cases in a single builder chain to avoid duplicate builder declarations
    builder
      // Fetch Tickets
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
      })
      // Fetch Ticket By ID
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
      })
      // Create Ticket
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
      })
      // Update Ticket
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
      })
      // Delete Ticket
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
      })
      // Add Message
      .addCase(addMessage.pending, (state) => {
        state.updating = true;
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
      })
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
