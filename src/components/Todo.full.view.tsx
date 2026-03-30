import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import TodoSidebar from "./Todo.sidebar";
import TodoFormModal from "./Todo.form";
import type { Todo, TodoRequest, Priority } from "../types/index";
import {
  ArrowLeft,
  Calendar,
  Tag as TagIcon,
  Link as LinkIcon,
  Clock,
  Pencil,
  Trash2,
  Flame,
  ArrowUp,
  ChevronUp,
  Minus,
  CheckCircle2,
  Circle,
  Ban,
  Loader2,
  AlertCircle,
  FileText,
  StickyNote,
  Timer,
  PanelRight,
} from "lucide-react";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; accentColor: string; icon: React.ReactNode }
> = {
  LOW: {
    label: "Low Priority",
    accentColor: "#6366f1",
    badgeClass: "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
    icon: <Minus className="w-3 h-3" />,
  },
  MEDIUM: {
    label: "Medium Priority",
    accentColor: "#d97706",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
    icon: <ChevronUp className="w-3 h-3" />,
  },
  HIGH: {
    label: "High Priority",
    accentColor: "#ea580c",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
    icon: <ArrowUp className="w-3 h-3" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    icon: <Flame className="w-3 h-3" />,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Circle className="w-3.5 h-3.5" />,
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="w-3.5 h-3.5" />,
    badgeClass: "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/50",
  },
};

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(endDate) < new Date();
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-600">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function TodoFullViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showConfirm } = useConfirm();
  const { user, logout } = useAuth();

  const { todos, stats, tags, filter, loading, statsLoading } = useAppSelector((s) => s.todos);

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

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!activeTodo) return;
    const confirmed = await showConfirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${activeTodo.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;
    await dispatch(deleteTodo(activeTodo.id)).unwrap();
    dispatch(fetchStats());
    navigate("/", { replace: true });
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (!editingTodo) return;
    await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    dispatch(fetchStats());
    dispatch(fetchTags());
    setModalOpen(false);
    setEditingTodo(null);
  };

  const pc = activeTodo ? PRIORITY_CONFIG[activeTodo.priority] : null;
  const sc = activeTodo ? (STATUS_CONFIG[activeTodo.status] ?? STATUS_CONFIG["PENDING"]) : null;
  const overdue = isOverdue(activeTodo?.endDate, activeTodo?.status);
  const startDate = formatDate(activeTodo?.startDate);
  const endDate = formatDate(activeTodo?.endDate);

  if (loading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
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

  if (!loading && todos.length > 0 && !activeTodo) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
       
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Task not found.</p>
          <button onClick={() => navigate("/")} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Back to board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      

      <div className="flex flex-1 overflow-hidden">
        {/* ── Main content ── */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "mr-[340px]" : "mr-0"}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to board
              </button>
              <button
                onClick={() => setSidebarOpen((p) => !p)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <PanelRight className="w-4 h-4" />
                {sidebarOpen ? "Hide" : "All tasks"}
              </button>
            </div>

            {activeTodo && pc && sc && (
              <motion.div
                key={activeTodo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                {/* Priority accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: pc.accentColor }} />

                {/* Header */}
                <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pc.badgeClass}`}>
                      {pc.icon}{pc.label}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.badgeClass}`}>
                      {sc.icon}{sc.label}
                    </span>
                    {overdue && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40">
                        <AlertCircle className="w-3 h-3" />Overdue
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
                    {activeTodo.title}
                  </h1>
                </div>

                {/* Body */}
                <div className="px-6 sm:px-8 py-7 space-y-7">

                  {activeTodo.description && (
                    <Section icon={<FileText className="w-3.5 h-3.5" />} label="Description">
                      <p className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
                        {activeTodo.description}
                      </p>
                    </Section>
                  )}

                  {activeTodo.notes && (
                    <Section icon={<StickyNote className="w-3.5 h-3.5" />} label="Notes">
                      <p className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-400 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl px-4 py-3">
                        {activeTodo.notes}
                      </p>
                    </Section>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {startDate && (
                      <Section icon={<Calendar className="w-3.5 h-3.5" />} label="Start Date">
                        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{startDate}</span>
                        </div>
                        {activeTodo.startTime && (
                          <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                            <Timer className="w-3 h-3 text-gray-400" />
                            <span className="text-[11px] text-gray-500">{activeTodo.startTime}</span>
                          </div>
                        )}
                      </Section>
                    )}
                    {endDate && (
                      <Section icon={<Calendar className="w-3.5 h-3.5" />} label="Due Date">
                        <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border ${overdue ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800"}`}>
                          {overdue
                            ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            : <Calendar className="w-4 h-4 text-gray-400 shrink-0" />}
                          <span className={`text-[13px] font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
                            {endDate}
                          </span>
                        </div>
                        {activeTodo.endTime && (
                          <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-[11px] text-gray-500">{activeTodo.endTime}</span>
                          </div>
                        )}
                      </Section>
                    )}
                  </div>

                  {activeTodo.tags?.length > 0 && (
                    <Section icon={<TagIcon className="w-3.5 h-3.5" />} label="Tags">
                      <div className="flex flex-wrap gap-1.5">
                        {activeTodo.tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg text-[12px] font-medium text-gray-600 dark:text-gray-400">
                            <TagIcon className="w-2.5 h-2.5 text-gray-400" />{tag}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {activeTodo.refLink && (
                    <Section icon={<LinkIcon className="w-3.5 h-3.5" />} label="Reference Link">
                      <a href={activeTodo.refLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                        <span className="text-[13px] text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                          {activeTodo.refLink}
                        </span>
                      </a>
                    </Section>
                  )}

                  {/* Meta */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-1">
                    <p className="text-[11px] text-gray-400 dark:text-gray-600">
                      Created <span className="font-medium text-gray-500 dark:text-gray-500">
                        {new Date(activeTodo.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600">
                      Updated <span className="font-medium text-gray-500 dark:text-gray-500">
                        {new Date(activeTodo.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 sm:px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleEdit(activeTodo)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Task
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* ── Sidebar ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="sidebar-backdrop-mobile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[98] sm:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                key="sidebar"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="fixed top-0 right-0 h-full z-[100]"
              >
                <TodoSidebar
                  open={true}
                  todos={todos}
                  onClose={() => setSidebarOpen(false)}
                  onViewDetail={handleSidebarCardClick}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Edit modal */}
      <TodoFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTodo(null); }}
        onSubmit={handleSubmit}
        initial={editingTodo}
        defaultStatus={editingTodo?.status ?? "PENDING"}
      />
    </div>
  );
}