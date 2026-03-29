import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import KanbanColumn from "./Kanban.coloumn";
import TodoFormModal from "../Todo.form";
import Navbar from "../Navbar";
import type {
  Todo,
  TodoRequest,
  TodoStatus,
  KanbanColumn as KanbanColumnType,
} from "../../types";

// ── Local storage key ─────────────────────────────────────────────────────────
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

// ── Column definitions ────────────────────────────────────────────────────────
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
  const { user, logout } = useAuth();
  const {
    todos,
    stats,
    tags,
    filter,
    loading,
    statsLoading,
    error,
    draggingId,
  } = useAppSelector((s) => s.todos);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TodoStatus>("PENDING");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Track which cards are currently syncing to the API
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  // Background sync queue ref
  const syncQueueRef = useRef<PendingMove[]>(loadPendingMoves());

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTodos({ ...filter, size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch, filter]);

  // ── Replay any pending local-storage moves on mount ───────────────────────────
  useEffect(() => {
    const pending = loadPendingMoves();
    if (pending.length === 0) return;

    // Apply optimistic updates from localStorage
    pending.forEach((move) => {
      dispatch(
        optimisticStatusUpdate({ id: move.todoId, status: move.newStatus }),
      );
    });

    // Then try to sync them
    pending.forEach((move) => {
      syncMoveToAPI(move.todoId, move.newStatus, move.prevStatus);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filtered todos by column ─────────────────────────────────────────────────
  const getTodosForColumn = useCallback(
    (status: TodoStatus) => todos.filter((t) => t.status === status),
    [todos],
  );

  // ── API sync helper ───────────────────────────────────────────────────────────
  const syncMoveToAPI = useCallback(
    async (todoId: number, newStatus: TodoStatus, prevStatus: TodoStatus) => {
      setSyncingIds((prev) => new Set(prev).add(todoId));
      try {
        await dispatch(
          patchTodoStatus({ id: todoId, status: newStatus }),
        ).unwrap();
        dispatch(fetchStats());

        // Remove from local storage after success
        const updated = loadPendingMoves().filter((m) => m.todoId !== todoId);
        savePendingMoves(updated);
        syncQueueRef.current = updated;
      } catch {
        // Revert optimistic update
        dispatch(optimisticStatusUpdate({ id: todoId, status: prevStatus }));

        // Remove failed move from localStorage too
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
    [dispatch],
  );

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const handleDrop = useCallback(
    async (todoId: number, newStatus: TodoStatus) => {
      const todo = todos.find((t) => t.id === todoId);
      if (!todo || todo.status === newStatus) return;

      const prevStatus = todo.status;

      // 1. Optimistic UI update
      dispatch(optimisticStatusUpdate({ id: todoId, status: newStatus }));
      dispatch(setDraggingId(null));

      // 2. Save to localStorage immediately
      const move: PendingMove = {
        todoId,
        newStatus,
        prevStatus,
        timestamp: Date.now(),
      };
      const existing = loadPendingMoves().filter((m) => m.todoId !== todoId);
      const updated = [...existing, move];
      savePendingMoves(updated);
      syncQueueRef.current = updated;

      // 3. Sync to API in background
      syncMoveToAPI(todoId, newStatus, prevStatus);
    },
    [todos, dispatch, syncMoveToAPI],
  );

  // ── Create / Edit ─────────────────────────────────────────────────────────────
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

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    await dispatch(deleteTodo(id)).unwrap();
    dispatch(fetchStats());
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
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

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mx-4 md:mx-6 mt-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Board ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-auto px-4 md:px-6 py-5">
        {loading && todos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="60"
                  strokeDashoffset="20"
                />
              </svg>
              <span className="text-sm font-medium">Loading tasks…</span>
            </div>
          </div>
        ) : (
          <div
            className="flex gap-4 min-w-max pb-4"
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
                onDelete={(id) => setDeleteConfirm(id)}
                onAddNew={openCreate}
                draggingId={draggingId}
                syncingIds={syncingIds}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Todo Form Modal ───────────────────────────────────────────────────── */}
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

      {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center mx-auto mb-4">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600 dark:text-red-400"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" />
                </svg>
              </div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-center text-base mb-1">
                Delete task?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-5">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(deleteConfirm!)}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
