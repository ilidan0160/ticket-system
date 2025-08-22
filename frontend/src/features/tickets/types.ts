export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Message {
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
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre?: string;
  mensajes?: Message[];
  solicitante?: User;
  asignadoA?: User;
}

export interface Filters {
  status: string;
  priority: string;
  categoria: string;
  search: string;
}

export interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  socket: any; // Use a more specific type if available
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

export interface TicketFormData {
  asunto: string;
  descripcion: string;
  prioridad: string;
  categoria: string;
  asignadoAId?: number | null;
}
