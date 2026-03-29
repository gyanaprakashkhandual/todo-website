import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../lib/store';
import {
  fetchTodos, fetchStats, fetchTags,
  createTodo, updateTodo, deleteTodo, patchTodoStatus,
  setFilter, setDraggingId, optimisticStatusUpdate,
} from '../../lib/features/todos/todo.slice';
import { useAuth } from '../../context/Auth.context';
import KanbanColumn from './Kanban.coloumn';
import TodoFormModal from '../Todo.form';
import StatsBar from './Status.bar';
import FilterBar from './Filter.bar';
import type { Todo, TodoRequest, TodoStatus, KanbanColumn as KanbanColumnType } from '../../types';

const COLUMNS: KanbanColumnType[] = [
  { id: 'PENDING',     title: 'Pending',     color: '#94a3b8', accent: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#60a5fa', accent: 'bg-blue-400' },
  { id: 'COMPLETED',  title: 'Completed',   color: '#34d399', accent: 'bg-emerald-400' },
  { id: 'CANCELLED',  title: 'Cancelled',   color: '#f87171', accent: 'bg-red-400' },
];

export default function KanbanPage() {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { todos, stats, tags, filter, loading, statsLoading, error, draggingId } = useAppSelector((s) => s.todos);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TodoStatus>('PENDING');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTodos({ ...filter, size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch, filter]);

  // ── Filtered todos by column ───────────────────────────────────────────────
  const getTodosForColumn = useCallback(
    (status: TodoStatus) => todos.filter((t) => t.status === status),
    [todos]
  );

  // ── Create / Edit ──────────────────────────────────────────────────────────
  const openCreate = (status: TodoStatus = 'PENDING') => {
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

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    await dispatch(deleteTodo(id)).unwrap();
    dispatch(fetchStats());
    setDeleteConfirm(null);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = async (todoId: number, newStatus: TodoStatus) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo || todo.status === newStatus) return;

    // Optimistic update
    dispatch(optimisticStatusUpdate({ id: todoId, status: newStatus }));
    dispatch(setDraggingId(null));

    try {
      await dispatch(patchTodoStatus({ id: todoId, status: newStatus })).unwrap();
      dispatch(fetchStats());
    } catch {
      // Revert on error
      dispatch(optimisticStatusUpdate({ id: todoId, status: todo.status }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* ── Topbar ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-full px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">Kanboard</span>
          </div>

          {/* Center - Stats */}
          <StatsBar stats={stats} loading={statsLoading} />

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openCreate()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/20 hover:brightness-110 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New task
            </motion.button>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center">
                <span className="text-violet-300 text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="text-white/25 hover:text-white/60 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sub-toolbar ───────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.04] bg-[#0b0b12]/60 px-6 py-2.5">
        <FilterBar
          filter={filter}
          onChange={(f) => dispatch(setFilter(f))}
          tags={tags}
        />
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mt-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Board ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-auto px-6 py-6">
        {loading && todos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-white/30">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm">Loading tasks…</span>
            </div>
          </div>
        ) : (
          <div
            className="flex gap-4 min-w-max pb-6"
            onDragEnd={() => dispatch(setDraggingId(null))}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                accent={col.accent}
                todos={getTodosForColumn(col.id)}
                onDrop={handleDrop}
                onEdit={openEdit}
                onDelete={(id) => setDeleteConfirm(id)}
                onAddNew={openCreate}
                draggingId={draggingId}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Todo Form Modal ───────────────────────────────────────────────────── */}
      <TodoFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTodo(null); }}
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/60"
            >
              <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-center mb-1">Delete task?</h3>
              <p className="text-white/35 text-sm text-center mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/80 text-sm transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDelete(deleteConfirm!)}
                  className="flex-1 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
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