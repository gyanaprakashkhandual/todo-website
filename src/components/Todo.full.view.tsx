/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  updateTodo,
  deleteTodo,
} from "../lib/features/todos/todo.slice";
import { useConfirm } from "../context/Confirm.context";
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
  Hash,
  CalendarRange,
  ExternalLink,
  Hourglass,
} from "lucide-react";

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    badgeClass: string;
    accentColor: string;
    icon: React.ReactNode;
  }
> = {
  LOW: {
    label: "Low Priority",
    accentColor: "#6366f1",
    badgeClass:
      "bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/25 dark:text-indigo-400 dark:border-indigo-800/50",
    icon: <Minus className="w-3 h-3" />,
  },
  MEDIUM: {
    label: "Medium Priority",
    accentColor: "#d97706",
    badgeClass:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-800/50",
    icon: <ChevronUp className="w-3 h-3" />,
  },
  HIGH: {
    label: "High Priority",
    accentColor: "#ea580c",
    badgeClass:
      "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/25 dark:text-orange-400 dark:border-orange-800/50",
    icon: <ArrowUp className="w-3 h-3" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/25 dark:text-red-400 dark:border-red-800/50",
    icon: <Flame className="w-3 h-3" />,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Circle className="w-3.5 h-3.5" />,
    dotClass: "bg-slate-400",
    badgeClass:
      "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    dotClass: "bg-blue-500",
    badgeClass:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/25 dark:text-blue-400 dark:border-blue-800/50",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-400 dark:border-emerald-800/50",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="w-3.5 h-3.5" />,
    dotClass: "bg-gray-400",
    badgeClass:
      "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/50",
  },
};

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: easeOut },
    },
  },
};

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function formatTime(t?: string) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED")
    return false;
  return new Date(endDate) < new Date();
}

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-gray-400 dark:text-gray-600">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">
        {label}
      </p>
    </div>
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50 px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-0.75 w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex gap-2">
            <div className="h-7 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="px-6 sm:px-8 py-7 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="h-16 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TodoFullViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showConfirm } = useConfirm();

  const { todos, loading } = useAppSelector((s) => s.todos);

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen] = useState(true);

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
    const updated = todos.find((t) => t.id === editingTodo.id);
    if (updated) setActiveTodo({ ...updated, ...req } as Todo);
    setModalOpen(false);
    setEditingTodo(null);
  };

  const pc = activeTodo ? PRIORITY_CONFIG[activeTodo.priority] : null;
  const sc = activeTodo
    ? (STATUS_CONFIG[activeTodo.status] ?? STATUS_CONFIG["PENDING"])
    : null;
  const overdue = isOverdue(activeTodo?.endDate, activeTodo?.status);
  const startDate = formatDate(activeTodo?.startDate);
  const endDate = formatDate(activeTodo?.endDate);
  const startTime = formatTime(activeTodo?.startTime);
  const endTime = formatTime(activeTodo?.endTime);

  if (loading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SkeletonLoader />
      </div>
    );
  }

  if (!loading && todos.length > 0 && !activeTodo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Task not found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600 max-w-xs">
            This task may have been deleted or the link is invalid.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to board
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-58px)] bg-white dark:bg-gray-950 flex flex-col overflow-auto">
      <div className="flex flex-1 overflow-hidden relative">
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
            sidebarOpen ? "lg:ml-85" : "ml-0"
          }`}
        >
          <div className="max-w-full">
            <AnimatePresence mode="wait">
              {activeTodo && pc && sc && (
                <motion.div
                  key={activeTodo.id}
                  variants={stagger.container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  <motion.div className="bg-white dark:bg-gray-900  dark:border-gray-800 overflow-hidden">
                    <div className="px-6 sm:px-8 pt-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pc.badgeClass}`}
                        >
                          {pc.icon}
                          {pc.label}
                        </span>
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.badgeClass}`}
                        >
                          {sc.icon}
                          {sc.label}
                        </span>
                        {overdue && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        <span className="ml-auto text-[11px] font-mono text-gray-300 dark:text-gray-700">
                          #{activeTodo.id}
                        </span>
                      </div>

                      <h1
                        className={`text-2xl sm:text-[28px] font-bold leading-snug tracking-tight mb-3 ${
                          activeTodo.status === "COMPLETED"
                            ? "line-through text-gray-400 dark:text-gray-600"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {activeTodo.title}
                      </h1>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dotClass} ${
                              activeTodo.status === "IN_PROGRESS"
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                          <span className="text-[12px] text-gray-500 dark:text-gray-500 font-medium">
                            {sc.label}
                          </span>
                        </div>
                        <span className="text-gray-200 dark:text-gray-800">
                          ·
                        </span>
                        <span className="text-[12px] text-gray-400 dark:text-gray-600">
                          Updated{" "}
                          {new Date(activeTodo.updatedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 py-7 space-y-7">
                      {activeTodo.description && (
                        <motion.div variants={stagger.item}>
                          <SectionLabel
                            icon={<FileText className="w-3.5 h-3.5" />}
                            label="Description"
                          />
                          <InfoCard>
                            <p className="text-[14px] leading-[1.75] text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {activeTodo.description}
                            </p>
                          </InfoCard>
                        </motion.div>
                      )}

                      {activeTodo.notes && (
                        <motion.div variants={stagger.item}>
                          <SectionLabel
                            icon={<StickyNote className="w-3.5 h-3.5" />}
                            label="Notes"
                          />
                          <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-amber-400/60 dark:bg-amber-600/40 rounded-l-xl" />
                            <p className="text-[14px] leading-[1.75] text-gray-600 dark:text-gray-400 whitespace-pre-wrap pl-1">
                              {activeTodo.notes}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <motion.div variants={stagger.item}>
                        <SectionLabel
                          icon={<CalendarRange className="w-3.5 h-3.5" />}
                          label="Timeline"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoCard className={!startDate ? "opacity-40" : ""}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-0.5">
                                  Start
                                </p>
                                <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                                  {startDate ?? "Not set"}
                                </p>
                                {startTime && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Timer className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-500 font-medium">
                                      {startTime}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </InfoCard>

                          <InfoCard
                            className={[
                              !endDate ? "opacity-40" : "",
                              overdue
                                ? "bg-red-50/80! border-red-200! dark:bg-red-900/10! dark:border-red-900/30!"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                  overdue
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40"
                                    : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40"
                                }`}
                              >
                                {overdue ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <Hourglass className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-0.5">
                                  Due
                                </p>
                                <p
                                  className={`text-[13px] font-semibold leading-snug ${
                                    overdue
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-800 dark:text-gray-200"
                                  }`}
                                >
                                  {endDate ?? "Not set"}
                                </p>
                                {endTime && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-500 font-medium">
                                      {endTime}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </InfoCard>
                        </div>
                      </motion.div>

                      {activeTodo.tags?.length > 0 && (
                        <motion.div variants={stagger.item}>
                          <SectionLabel
                            icon={<Hash className="w-3.5 h-3.5" />}
                            label="Tags"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {activeTodo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-[12px] font-medium text-gray-600 dark:text-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                              >
                                <TagIcon className="w-2.5 h-2.5 text-gray-400" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTodo.refLink && (
                        <motion.div variants={stagger.item}>
                          <SectionLabel
                            icon={<LinkIcon className="w-3.5 h-3.5" />}
                            label="Reference Link"
                          />
                          <a
                            href={activeTodo.refLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                              <LinkIcon className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <span className="text-[13px] text-indigo-600 dark:text-indigo-400 truncate flex-1 group-hover:underline underline-offset-2">
                              {activeTodo.refLink}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                          </a>
                        </motion.div>
                      )}

                      <motion.div
                        variants={stagger.item}
                        className="pt-3 border-t border-gray-100 dark:border-gray-800"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 px-3.5 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-1">
                              Task ID
                            </p>
                            <p className="text-[13px] font-mono font-semibold text-gray-700 dark:text-gray-300">
                              #{activeTodo.id}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 px-3.5 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-1">
                              Created
                            </p>
                            <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                              {new Date(
                                activeTodo.createdAt,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 px-3.5 py-3 col-span-2 sm:col-span-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-1">
                              Last Updated
                            </p>
                            <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                              {new Date(
                                activeTodo.updatedAt,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="px-6 sm:px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-3">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

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
