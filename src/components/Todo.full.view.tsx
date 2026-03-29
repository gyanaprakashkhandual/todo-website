import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  FileText,
  StickyNote,
  Timer,
} from "lucide-react";
import type { Todo, Priority } from "../types/index";

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; accentColor: string; icon: React.ReactNode }
> = {
  LOW: {
    label: "Low Priority",
    accentColor: "#6366f1",
    badgeClass:
      "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
    icon: <Minus className="w-3 h-3" />,
  },
  MEDIUM: {
    label: "Medium Priority",
    accentColor: "#d97706",
    badgeClass:
      "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
    icon: <ChevronUp className="w-3 h-3" />,
  },
  HIGH: {
    label: "High Priority",
    accentColor: "#ea580c",
    badgeClass:
      "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
    icon: <ArrowUp className="w-3 h-3" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass:
      "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
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
    badgeClass:
      "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    badgeClass:
      "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badgeClass:
      "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="w-3.5 h-3.5" />,
    badgeClass:
      "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/50",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
  );
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(endDate) < new Date();
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-600">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TodoFullViewModalProps {
  todo: Todo | null;
  open: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TodoFullViewModal({
  todo,
  open,
  onClose,
  onEdit,
  onDelete,
}: TodoFullViewModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const pc = todo ? PRIORITY_CONFIG[todo.priority] : null;
  const sc = todo
    ? STATUS_CONFIG[todo.status] ?? STATUS_CONFIG["PENDING"]
    : null;
  const overdue = isOverdue(todo?.endDate, todo?.status);
  const startDate = formatDate(todo?.startDate);
  const endDate = formatDate(todo?.endDate);

  return createPortal(
    <AnimatePresence>
      {open && todo && pc && sc && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Priority color bar */}
              <div
                className="h-1 w-full shrink-0"
                style={{ backgroundColor: pc.accentColor }}
              />

              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 pr-4">
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
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40">
                      <AlertCircle className="w-3 h-3" />
                      Overdue
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Scrollable body ─────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Title */}
                <h2 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
                  {todo.title}
                </h2>

                {/* Description */}
                {todo.description && (
                  <Section icon={<FileText className="w-3.5 h-3.5" />} label="Description">
                    <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
                      {todo.description}
                    </p>
                  </Section>
                )}

                {/* Notes */}
                {todo.notes && (
                  <Section icon={<StickyNote className="w-3.5 h-3.5" />} label="Notes">
                    <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-400 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl px-4 py-3">
                      {todo.notes}
                    </p>
                  </Section>
                )}

                {/* Date grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start date */}
                  {startDate && (
                    <Section icon={<Calendar className="w-3.5 h-3.5" />} label="Start Date">
                      <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                          {startDate}
                        </span>
                      </div>
                      {/* Time */}
                      {todo.startTime && (
                        <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                          <Timer className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-500 dark:text-gray-500">
                            {todo.startTime}
                          </span>
                        </div>
                      )}
                    </Section>
                  )}

                  {/* End date */}
                  {endDate && (
                    <Section icon={<Calendar className="w-3.5 h-3.5" />} label="Due Date">
                      <div
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border ${
                          overdue
                            ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        {overdue ? (
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={`text-[13px] font-medium ${
                            overdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {endDate}
                        </span>
                      </div>
                      {todo.endTime && (
                        <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-500 dark:text-gray-500">
                            {todo.endTime}
                          </span>
                        </div>
                      )}
                    </Section>
                  )}
                </div>

                {/* Tags */}
                {todo.tags?.length > 0 && (
                  <Section icon={<TagIcon className="w-3.5 h-3.5" />} label="Tags">
                    <div className="flex flex-wrap gap-1.5">
                      {todo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-[12px] font-medium text-gray-600 dark:text-gray-400"
                        >
                          <TagIcon className="w-2.5 h-2.5 text-gray-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Reference link */}
                {todo.refLink && (
                  <Section icon={<LinkIcon className="w-3.5 h-3.5" />} label="Reference Link">
                    <a
                      href={todo.refLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                      <span className="text-[13px] text-indigo-600 dark:text-indigo-400 group-hover:underline truncate">
                        {todo.refLink}
                      </span>
                    </a>
                  </Section>
                )}

                {/* Meta: created / updated */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-1">
                  <p className="text-[11px] text-gray-400 dark:text-gray-600">
                    Created{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-500">
                      {new Date(todo.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600">
                    Updated{" "}
                    <span className="font-medium text-gray-500 dark:text-gray-500">
                      {new Date(todo.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {/* ── Footer ─────────────────────────────────────────────── */}
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-2.5 bg-white dark:bg-gray-950">
                <button
                  onClick={() => {
                    onEdit(todo);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${todo.title}"?`)) {
                      onDelete(todo.id);
                      onClose();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}