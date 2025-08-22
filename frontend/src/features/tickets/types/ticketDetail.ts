import { User } from './ticket';

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

export interface EditTicketData {
  asunto: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  asignadoA: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface PriorityOption extends StatusOption {}

export const statusOptions: StatusOption[] = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' },
];

export const priorityOptions: PriorityOption[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

export const statusColors = {
  abierto: 'primary',
  en_progreso: 'warning',
  pendiente: 'info',
  resuelto: 'success',
  cerrado: 'default'
} as const;

export const priorityColors = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
  critica: 'error'
} as const;
