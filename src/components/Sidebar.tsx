import { AnimatePresence, motion } from "framer-motion";
import {
  X,
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
} from "lucide-react";
import { useTodo } from "../context/Todo.context";
import type { Todo, Priority } from "../types/index";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatStatus(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  const obj = new Date(Number(y), Number(m) - 1, Number(day));
  return obj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(endDate) < new Date();
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; textColor: string; badgeClass: string; icon: React.ReactNode; accentColor: string }
> = {
  LOW: {
    label: "Low Priority",
    accentColor: "#6366f1",
    textColor: "text-indigo-600 dark:text-indigo-400",
    badgeClass: "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
    icon: <Minus className="w-3 h-3" />,
  },
  MEDIUM: {
    label: "Medium Priority",
    accentColor: "#d97706",
    textColor: "text-amber-700 dark:text-amber-400",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
    icon: <ChevronUp className="w-3 h-3" />,
  },
  HIGH: {
    label: "High Priority",
    accentColor: "#ea580c",
    textColor: "text-orange-700 dark:text-orange-400",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
    icon: <ArrowUp className="w-3 h-3" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    textColor: "text-red-700 dark:text-red-400",
    badgeClass: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    icon: <Flame className="w-3 h-3" />,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
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

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
      {children}
    </p>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TodoDetailSidebarProps {
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TodoDetailSidebar({
  onEdit,
  onDelete,
}: TodoDetailSidebarProps) {
  const { selectedTodo, setSelectedTodo } = useTodo();
  const todo = selectedTodo;

  const overdue = isOverdue(todo?.endDate, todo?.status);
  const pc = todo ? PRIORITY_CONFIG[todo.priority] : null;
  const sc = todo ? (STATUS_CONFIG[todo.status] ?? STATUS_CONFIG["NOT_STARTED"]) : null;
  const dueDate = todo ? formatDate(todo.endDate) : null;

  return (
    <AnimatePresence>
      {todo && pc && sc && (
        <motion.aside
          key="todo-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[100] flex flex-col overflow-hidden"
        >
          {/* Priority accent bar at very top */}
          <div
            className="h-1 w-full shrink-0"
            style={{ backgroundColor: pc.accentColor }}
          />

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              {/* Priority badge */}
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pc.badgeClass}`}>
                {pc.icon}
                {pc.label}
              </span>
              {/* Status badge */}
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.badgeClass}`}>
                {sc.icon}
                {sc.label}
              </span>
            </div>

            <button
              onClick={() => setSelectedTodo(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 space-y-6">

              {/* Title */}
              <div>
                <h2 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
                  {todo.title}
                </h2>
              </div>

              {/* Description */}
              {todo.description && (
                <div>
                  <SectionLabel>Description</SectionLabel>
                  <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-400">
                    {todo.description}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* Due Date */}
              <div>
                <SectionLabel>Due Date</SectionLabel>
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    overdue
                      ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
                      : "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                  }`}
                >
                  {overdue ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-[13px] font-medium ${
                        overdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {dueDate ?? "No deadline set"}
                    </p>
                    {overdue && (
                      <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        This task is overdue
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {todo.tags?.length > 0 && (
                <div>
                  <SectionLabel>Tags</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 mt-1 shrink-0" />
                    {todo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-[12px] font-medium text-gray-600 dark:text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Link */}
              {todo.refLink && (
                <div>
                  <SectionLabel>Reference Link</SectionLabel>
                  <a
                    href={todo.refLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    <span className="text-[13px] text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                      {todo.refLink}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer actions ──────────────────────────────────────────── */}
          <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex gap-2.5">
            <button
              onClick={() => {
                onEdit?.(todo);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Task
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete "${todo.title}"?`)) {
                  onDelete?.(todo.id);
                  setSelectedTodo(null);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}