import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  updateTodo,
  deleteTodo,
  setFilter,
} from "../lib/features/todos/todo.slice";
import { useAuth } from "../context/Auth.context";
import { useConfirm } from "../context/Confirm.context";
import Navbar from "./Navbar";
import TodoFullViewModal from "./Todo.full.view";
import TodoSidebar from "./Todo.sidebar";
import TodoFormModal from "./Todo.form";
import type { Todo, TodoRequest } from "../types/index";

export default function TodoFullViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showConfirm } = useConfirm();
  const { user, logout } = useAuth();

  const { todos, stats, tags, filter, loading, statsLoading } = useAppSelector(
    (s) => s.todos
  );

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTodos({ size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch]);

  // Sync activeTodo from URL id whenever todos list loads/changes
  useEffect(() => {
    if (!id || todos.length === 0) return;
    const found = todos.find((t) => t.id === Number(id));
    if (found) setActiveTodo(found);
  }, [id, todos]);

  const handleSidebarCardClick = (todo: Todo) => {
    setActiveTodo(todo);
    navigate(`/todo/${todo.id}`, { replace: true });
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  const handleDelete = async (todoId: number) => {
    const todo = todos.find((t) => t.id === todoId);
    const confirmed = await showConfirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${todo?.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;
    await dispatch(deleteTodo(todoId)).unwrap();
    dispatch(fetchStats());
    navigate("/", { replace: true });
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (!editingTodo) return;
    await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    dispatch(fetchStats());
    dispatch(fetchTags());
    // Refresh activeTodo with updated data
    const updated = todos.find((t) => t.id === editingTodo.id);
    if (updated) setActiveTodo({ ...updated, ...req } as Todo);
    setModalOpen(false);
    setEditingTodo(null);
  };

  // Loading state while todos haven't arrived yet
  if (loading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <Navbar
          user={user}
          stats={stats}
          statsLoading={statsLoading}
          filter={filter}
          tags={tags}
          onFilterChange={(f) => dispatch(setFilter(f))}
          onNewTask={() => navigate("/")}
          onLogout={logout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            <span className="text-sm font-medium">Loading task…</span>
          </div>
        </div>
      </div>
    );
  }

  // Todo not found after load
  if (!loading && todos.length > 0 && !activeTodo) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <Navbar
          user={user}
          stats={stats}
          statsLoading={statsLoading}
          filter={filter}
          tags={tags}
          onFilterChange={(f) => dispatch(setFilter(f))}
          onNewTask={() => navigate("/")}
          onLogout={logout}
        />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Task not found.</p>
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
      <Navbar
        user={user}
        stats={stats}
        statsLoading={statsLoading}
        filter={filter}
        tags={tags}
        onFilterChange={(f) => dispatch(setFilter(f))}
        onNewTask={() => navigate("/")}
        onLogout={logout}
      />

      {/* Sidebar backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => navigate("/", { replace: true })}
      />

      {/* Sidebar — always open on this page */}
      <TodoSidebar
        open={true}
        todos={todos}
        onClose={() => navigate("/", { replace: true })}
        onViewDetail={handleSidebarCardClick}
      />

      {/* Full view modal — always open on this page */}
      <TodoFullViewModal
        todo={activeTodo}
        open={!!activeTodo}
        onClose={() => navigate("/", { replace: true })}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit form modal */}
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