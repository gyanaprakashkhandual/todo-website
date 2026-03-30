import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../../service/api.service";
import { API_ENDPOINTS } from "../../../configs/config";
import axios from "axios";
import type {
  Todo,
  TodoRequest,
  TodoFilterRequest,
  TodoStats,
  TodoStatus,
  PageResponse,
} from "../../../types";

interface TodoState {
  todos: Todo[];
  stats: TodoStats | null;
  tags: string[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  filter: TodoFilterRequest;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  draggingId: number | null;
}

const initialState: TodoState = {
  todos: [],
  stats: null,
  tags: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  filter: { sortBy: "createdAt", sortDir: "desc", page: 0, size: 100 },
  loading: false,
  statsLoading: false,
  error: null,
  draggingId: null,
};

export const fetchTodos = createAsyncThunk(
  "todos/fetchAll",
  async (filter: TodoFilterRequest, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<PageResponse<Todo>>(
        API_ENDPOINTS.TODOS.BASE,
        filter as Record<string, string | number | boolean | undefined>,
      );
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const fetchStats = createAsyncThunk<
  TodoStats,
  void,
  { rejectValue: string }
>("todos/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<TodoStats>(API_ENDPOINTS.TODOS.STATS);

    return res.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
    return rejectWithValue("Something went wrong");
  }
});

export const fetchTags = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("todos/fetchTags", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<string[]>(API_ENDPOINTS.TODOS.TAGS);

    return res.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
    return rejectWithValue("Something went wrong");
  }
});

export const createTodo = createAsyncThunk(
  "todos/create",
  async (req: TodoRequest, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<Todo>(API_ENDPOINTS.TODOS.BASE, req);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const updateTodo = createAsyncThunk(
  "todos/update",
  async (
    { id, req }: { id: number; req: TodoRequest },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.put<Todo>(API_ENDPOINTS.TODOS.BY_ID(id), req);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const patchTodoStatus = createAsyncThunk(
  "todos/patchStatus",
  async (
    { id, status }: { id: number; status: TodoStatus },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.patch<Todo>(
        `${API_ENDPOINTS.TODOS.STATUS(id)}?value=${status}`,
        {},
      );
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const deleteTodo = createAsyncThunk(
  "todos/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.TODOS.BY_ID(id));
      return id;
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message);
    }
  },
);

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<TodoFilterRequest>>) {
      state.filter = { ...state.filter, ...action.payload, page: 0 };
    },
    clearError(state) {
      state.error = null;
    },
    setDraggingId(state, action: PayloadAction<number | null>) {
      state.draggingId = action.payload;
    },
    optimisticStatusUpdate(
      state,
      action: PayloadAction<{ id: number; status: TodoStatus }>,
    ) {
      const todo = state.todos.find((t) => t.id === action.payload.id);
      if (todo) todo.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state) => {
        state.statsLoading = false;
      });

    builder.addCase(fetchTags.fulfilled, (state, action) => {
      state.tags = action.payload;
    });

    builder
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todos.unshift(action.payload);
        if (state.stats) state.stats.total += 1;
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateTodo.fulfilled, (state, action) => {
        const idx = state.todos.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.todos[idx] = action.payload;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(patchTodoStatus.fulfilled, (state, action) => {
        const idx = state.todos.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.todos[idx] = action.payload;
      })
      .addCase(patchTodoStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.todos = state.todos.filter((t) => t.id !== action.payload);
        if (state.stats && state.stats.total > 0) state.stats.total -= 1;
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, clearError, setDraggingId, optimisticStatusUpdate } =
  todoSlice.actions;
export default todoSlice.reducer;
