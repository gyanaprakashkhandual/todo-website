import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Tag as TagIcon,
  Link as LinkIcon,
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
  Clock,
} from "lucide-react";
import { useTodo } from "../context/Todo.context";
import type { Priority } from "../types";

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
  { label: string; badgeClass: string; accentColor: string; icon: React.ReactNode }
> = {
  LOW: {
    label: "Low Priority",
    accentColor: "#6366f1",
    badgeClass: "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
    icon: <Minus className="w-3.5 h-3.5" />,
  },
  MEDIUM: {
    label: "Medium Priority",
    accentColor: "#d97706",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
    icon: <ChevronUp className="w-3.5 h-3.5" />,
  },
  HIGH: {
    label: "High Priority",
    accentColor: "#ea580c",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
    icon: <ArrowUp className="w-3.5 h-3.5" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    icon: <Flame className="w-3.5 h-3.5" />,
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function TodoFullViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTodo, setSelectedTodo } = useTodo();

  const todo = selectedTodo;

  // ✅ FIX: compare as same type — coerce both to string
  const idMismatch = !todo || String(todo.id) !== String(id);

  if (idMismatch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[15px] font-medium text-gray-600 dark:text-gray-400">
          Task not found or session expired
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:opacity-90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_CONFIG[todo.status] ?? STATUS_CONFIG["NOT_STARTED"];
  const overdue = isOverdue(todo.endDate, todo.status);
  const dueDate = formatDate(todo.endDate);

  const handleEdit = () => {
    // Wire to your edit modal here
    navigate(-1); // go back to board where edit modal lives
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${todo.title}"?`)) {
      setSelectedTodo(null);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-full min-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedTodo(null);
              navigate(-1);
            }}
            className="flex items-center gap-2 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Board
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          {/* Priority color bar */}
          <div className="h-1" style={{ backgroundColor: pc.accentColor }} />

          <div className="p-8 space-y-8">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold ${pc.badgeClass}`}>
                {pc.icon}
                {pc.label}
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold ${sc.badgeClass}`}>
                {sc.icon}
                {sc.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 leading-snug">
              {todo.title}
            </h1>

            {/* Description */}
            {todo.description && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
                  Description
                </p>
                <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                  {todo.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Due Date */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                  Due Date
                </p>
                <div
                  className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                    overdue
                      ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  }`}
                >
                  {overdue ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-[13px] font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
                      {dueDate ?? "No deadline set"}
                    </p>
                    {overdue && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-0.5">
                        <Clock className="w-3 h-3" /> Overdue
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {todo.tags?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {todo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[12px] font-medium text-gray-600 dark:text-gray-400"
                      >
                        <TagIcon className="w-3 h-3 text-gray-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Link */}
              {todo.refLink && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                    Reference Link
                  </p>
                  <a
                    href={todo.refLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    <span className="text-[13px] text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                      {todo.refLink}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}