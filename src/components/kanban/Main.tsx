import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  createTodo,
  updateTodo,
  deleteTodo,
  patchTodoStatus,
  setFilter,
  setDraggingId,
  optimisticStatusUpdate,
} from "../../lib/features/todos/todo.slice";
import { useAuth } from "../../context/Auth.context";
import { useConfirm } from "../../context/Confirm.context";
import KanbanColumn from "./Kanban.coloumn";
import TodoFormModal from "../Todo.form";
import Navbar from "../Navbar";
import type {
  Todo,
  TodoRequest,
  TodoStatus,
  KanbanColumn as KanbanColumnType,
} from "../../types";

const LS_KEY = "kanboard_optimistic_moves";

interface PendingMove {
  todoId: number;
  newStatus: TodoStatus;
  prevStatus: TodoStatus;
  timestamp: number;
}

function loadPendingMoves(): PendingMove[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePendingMoves(moves: PendingMove[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(moves));
}

const COLUMNS: (KanbanColumnType & { headerBg: string; dotColor: string })[] = [
  {
    id: "PENDING",
    title: "Pending",
    color: "#94a3b8",
    accent: "bg-slate-400",
    headerBg: "bg-gray-100 dark:bg-gray-800",
    dotColor: "bg-gray-400",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "#3b82f6",
    accent: "bg-blue-500",
    headerBg: "bg-blue-50 dark:bg-blue-900/30",
    dotColor: "bg-blue-500",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "#22c55e",
    accent: "bg-green-500",
    headerBg: "bg-green-50 dark:bg-green-900/30",
    dotColor: "bg-green-500",
  },
  {
    id: "CANCELLED",
    title: "Cancelled",
    color: "#ef4444",
    accent: "bg-red-400",
    headerBg: "bg-red-50 dark:bg-red-900/30",
    dotColor: "bg-red-400",
  },
];

export default function KanbanPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();
  const { user, logout } = useAuth();
  const {
    todos,
    stats,
    tags,
    filter,
    loading,
    statsLoading,
    draggingId,
  } = useAppSelector((s) => s.todos);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TodoStatus>("PENDING");
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());
  const syncQueueRef = useRef<PendingMove[]>(loadPendingMoves());

  useEffect(() => {
    dispatch(fetchTodos({ ...filter, size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch, filter]);

  useEffect(() => {
    const pending = loadPendingMoves();
    if (pending.length === 0) return;
    pending.forEach((move) => {
      dispatch(optimisticStatusUpdate({ id: move.todoId, status: move.newStatus }));
    });
    pending.forEach((move) => {
      syncMoveToAPI(move.todoId, move.newStatus, move.prevStatus);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTodosForColumn = useCallback(
    (status: TodoStatus) => todos.filter((t) => t.status === status),
    [todos]
  );

  const syncMoveToAPI = useCallback(
    async (todoId: number, newStatus: TodoStatus, prevStatus: TodoStatus) => {
      setSyncingIds((prev) => new Set(prev).add(todoId));
      try {
        await dispatch(patchTodoStatus({ id: todoId, status: newStatus })).unwrap();
        dispatch(fetchStats());
        const updated = loadPendingMoves().filter((m) => m.todoId !== todoId);
        savePendingMoves(updated);
        syncQueueRef.current = updated;
      } catch {
        dispatch(optimisticStatusUpdate({ id: todoId, status: prevStatus }));
        const updated = loadPendingMoves().filter((m) => m.todoId !== todoId);
        savePendingMoves(updated);
        syncQueueRef.current = updated;
      } finally {
        setSyncingIds((prev) => {
          const next = new Set(prev);
          next.delete(todoId);
          return next;
        });
      }
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    async (todoId: number, newStatus: TodoStatus) => {
      const todo = todos.find((t) => t.id === todoId);
      if (!todo || todo.status === newStatus) return;
      const prevStatus = todo.status;
      dispatch(optimisticStatusUpdate({ id: todoId, status: newStatus }));
      dispatch(setDraggingId(null));
      const move: PendingMove = { todoId, newStatus, prevStatus, timestamp: Date.now() };
      const existing = loadPendingMoves().filter((m) => m.todoId !== todoId);
      const updated = [...existing, move];
      savePendingMoves(updated);
      syncQueueRef.current = updated;
      syncMoveToAPI(todoId, newStatus, prevStatus);
    },
    [todos, dispatch, syncMoveToAPI]
  );

  const openCreate = (status: TodoStatus = "PENDING") => {
    setEditingTodo(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setDefaultStatus(todo.status);
    setModalOpen(true);
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (editingTodo) {
      await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    } else {
      await dispatch(createTodo(req)).unwrap();
    }
    dispatch(fetchStats());
    dispatch(fetchTags());
  };

  const handleDelete = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    const confirmed = await showConfirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${todo?.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;
    await dispatch(deleteTodo(id)).unwrap();
    dispatch(fetchStats());
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar
        user={user}
        stats={stats}
        statsLoading={statsLoading}
        filter={filter}
        tags={tags}
        onFilterChange={(f) => dispatch(setFilter(f))}
        onNewTask={() => openCreate()}
        onLogout={logout}
      />

      <main className="flex-1 overflow-x-auto px-4 md:px-6 py-5 justify-center">
        {loading && todos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm font-medium">Loading tasks…</span>
            </div>
          </div>
        ) : (
          <div
            className="flex gap-4 w-full pb-4 justify-center"
            onDragEnd={() => dispatch(setDraggingId(null))}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                headerBg={col.headerBg}
                dotColor={col.dotColor}
                todos={getTodosForColumn(col.id)}
                onDrop={handleDrop}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddNew={openCreate}
                onViewDetail={(todo) => navigate(`/todo/${todo.id}`)}
                draggingId={draggingId}
                syncingIds={syncingIds}
              />
            ))}
          </div>
        )}
      </main>

      <TodoFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        initial={editingTodo}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}