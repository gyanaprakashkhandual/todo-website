/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  updateTodo,
  setFilter,
} from "../lib/features/todos/todo.slice";
import { useAuth } from "../context/Auth.context";
import Navbar from "./Navbar";
import TodoFullViewPage from "./Todo.full.view";
import TodoSidebar from "./Todo.sidebar";
import TodoFormModal from "./Todo.form";
import type { Todo, TodoRequest } from "../types/index";

export default function TodoFullView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();

  const { todos, stats, tags, filter, loading, statsLoading } = useAppSelector(
    (s) => s.todos,
  );

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    dispatch(fetchTodos({ size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (!id || todos.length === 0) return;
    const found = todos.find((t) => t.id === Number(id));
    if (found) setActiveTodo(found);
  }, [id, todos]);

  const handleSidebarCardClick = (todo: Todo) => {
    setActiveTodo(todo);
    navigate(`/todo/${todo.id}`, { replace: true });
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (!editingTodo) return;
    await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    dispatch(fetchStats());
    dispatch(fetchTags());
    const updated = todos.find((t) => t.id === editingTodo.id);
    if (updated) setActiveTodo({ ...updated, ...req } as Todo);
    setModalOpen(false);
    setEditingTodo(null);
  };

  const sharedNavbarProps = {
    user,
    stats,
    statsLoading,
    filter,
    tags,
    onFilterChange: (f: typeof filter) => dispatch(setFilter(f)),
    onNewTask: () => navigate("/"),
    onLogout: logout,
    sidebarOpen,
    onToggleSidebar: () => setSidebarOpen((prev) => !prev),
  };

  if (loading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <Navbar {...sharedNavbarProps} />
        <div className="flex-1 flex items-center justify-center">
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
            <span className="text-sm font-medium">Loading task…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && todos.length > 0 && !activeTodo) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <Navbar {...sharedNavbarProps} />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Task not found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar {...sharedNavbarProps} />

      <TodoSidebar
        open={sidebarOpen}
        todos={todos}
        onClose={() => setSidebarOpen(false)}
        onViewDetail={handleSidebarCardClick}
      />

      <TodoFullViewPage />

      <TodoFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        initial={editingTodo}
        defaultStatus={editingTodo?.status ?? "PENDING"}
      />
    </div>
  );
}
