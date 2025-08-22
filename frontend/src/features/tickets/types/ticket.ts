export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
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
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre?: string;
  mensajes?: Message[];
  solicitante?: User;
  asignadoA?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: number;
  mensaje: string;
  isInternal: boolean;
  ticketId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  usuario?: User;
}

export interface TicketFormData {
  asunto: string;
  descripcion: string;
  prioridad: string;
  categoria: string;
  asignadoAId?: number | null;
}

export interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  socket: any; // Consider using proper WebSocket type
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
