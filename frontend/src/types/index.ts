// Tipos compartidos entre frontend y backend

export type UserRole = 'usuario' | 'tecnico' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'abierto' | 'en_progreso' | 'pendiente' | 'resuelto' | 'cerrado';
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type Department = 'IT' | 'RRHH' | 'Finanzas' | 'Operaciones';

export interface Ticket {
  id: number;
  nombreApellido: string;
  piso: number;
  oficina: string;
  departamento: Department;
  descripcion: string;
  prioridad: TicketPriority;
  estatus: TicketStatus;
  userId: number;
  assignedTo?: number | null;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  user?: User;
  assignedToUser?: User | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
}

// Tipos para filtros
export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  department?: Department;
  search?: string;
  assignedTo?: number | 'unassigned';
  page?: number;
  limit?: number;
}

// Tipos para estadísticas
export interface TicketStats {
  total: number;
  abierto: number;
  en_progreso: number;
  pendiente: number;
  resuelto: number;
  cerrado: number;
  byPriority: Record<TicketPriority, number>;
  byDepartment: Record<Department, number>;
}

// Tipos para mensajes de chat
export interface ChatMessage {
  id: number;
  mensaje: string;
  isInternal: boolean;
  ticketId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}
