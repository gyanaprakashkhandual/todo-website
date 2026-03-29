// ── Enums ─────────────────────────────────────────────────────────────────────
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ── Todo ──────────────────────────────────────────────────────────────────────
export interface Todo {
  id: number;
  title: string;
  description?: string;
  notes?: string;
  refLink?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  status: TodoStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoRequest {
  title: string;
  description?: string;
  notes?: string;
  refLink?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  status: TodoStatus;
  tags: string[];
}

export interface TodoFilterRequest {
  search?: string;
  status?: TodoStatus;
  priority?: Priority;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  tag?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Kanban ────────────────────────────────────────────────────────────────────
export interface KanbanColumn {
  id: TodoStatus;
  title: string;
  color: string;
  accent: string;
}