import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Flame,
  ArrowUp,
  ChevronUp,
  Minus,
  CheckCircle2,
  Circle,
  Ban,
  Loader2,
  AlertCircle,
  CalendarDays,
  Tag as TagIcon,
  LayoutList,
} from "lucide-react";
import type { Todo, Priority, TodoStatus } from "../types/index";

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { accentColor: string; icon: React.ReactNode; badgeClass: string; label: string }
> = {
  LOW: {
    label: "Low",
    accentColor: "#6366f1",
    badgeClass: "text-indigo-600 dark:text-indigo-400",
    icon: <Minus className="w-2.5 h-2.5" />,
  },
  MEDIUM: {
    label: "Medium",
    accentColor: "#d97706",
    badgeClass: "text-amber-600 dark:text-amber-400",
    icon: <ChevronUp className="w-2.5 h-2.5" />,
  },
  HIGH: {
    label: "High",
    accentColor: "#ea580c",
    badgeClass: "text-orange-600 dark:text-orange-400",
    icon: <ArrowUp className="w-2.5 h-2.5" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass: "text-red-600 dark:text-red-400",
    icon: <Flame className="w-2.5 h-2.5" />,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; dotClass: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Circle className="w-3 h-3" />,
    dotClass: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    dotClass: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3 h-3" />,
    dotClass: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="w-3 h-3" />,
    dotClass: "bg-gray-400",
  },
};

const STATUS_ORDER: TodoStatus[] = [
  "IN_PROGRESS",
  "PENDING",
  "COMPLETED",
  "CANCELLED",
];

function formatDateShort(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    { day: "2-digit", month: "short" }
  );
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(endDate) < new Date();
}

// ─── Mini card inside sidebar ─────────────────────────────────────────────────
function SidebarCard({
  todo,
  onClick,
}: {
  todo: Todo;
  onClick: (todo: Todo) => void;
}) {
  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_CONFIG[todo.status] ?? STATUS_CONFIG["PENDING"];
  const overdue = isOverdue(todo.endDate, todo.status);
  const due = formatDateShort(todo.endDate);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onClick(todo)}
      className="w-full text-left group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-150 overflow-hidden"
    >
      {/* Priority left bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: pc.accentColor }}
      />

      <div className="pl-4 pr-3 py-3">
        {/* Top row: status + priority */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
            <span className={`${sc.dotClass} w-1.5 h-1.5 rounded-full shrink-0`} />
            <span className="text-[10px] font-medium">{sc.label}</span>
          </div>
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${pc.badgeClass}`}>
            {pc.icon}
            {pc.label}
          </span>
        </div>

        {/* Title */}
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-2">
          {todo.title}
        </p>

        {/* Bottom row: tags + due date */}
        <div className="flex items-center justify-between gap-2">
          {todo.tags?.length > 0 ? (
            <div className="flex items-center gap-1 min-w-0">
              <TagIcon className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600 shrink-0" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                {todo.tags.slice(0, 2).join(", ")}
                {todo.tags.length > 2 && ` +${todo.tags.length - 2}`}
              </span>
            </div>
          ) : (
            <span />
          )}

          {due && (
            <div
              className={`flex items-center gap-1 shrink-0 ${
                overdue ? "text-red-500" : "text-gray-400 dark:text-gray-600"
              }`}
            >
              {overdue ? (
                <AlertCircle className="w-2.5 h-2.5" />
              ) : (
                <CalendarDays className="w-2.5 h-2.5" />
              )}
              <span className="text-[10px] font-medium">{due}</span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TodoSidebarProps {
  open: boolean;
  todos: Todo[];
  onClose: () => void;
  onViewDetail: (todo: Todo) => void;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function TodoSidebar({
  open,
  todos,
  onClose,
  onViewDetail,
}: TodoSidebarProps) {
  // Group todos by status in display order
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status]?.label ?? status,
    icon: STATUS_CONFIG[status]?.icon,
    items: todos.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="todo-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed top-0 right-0 h-full w-[340px] bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[100] flex flex-col overflow-hidden"
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <LayoutList className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                  All Tasks
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">
                  {todos.length} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scrollable card list ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <LayoutList className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-500">
                  No tasks yet
                </p>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.status}>
                  {/* Group label */}
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-gray-400 dark:text-gray-600">
                      {group.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 ml-auto">
                      {group.items.length}
                    </span>
                  </div>

                  {/* Cards stacked */}
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {group.items.map((todo) => (
                        <SidebarCard
                          key={todo.id}
                          todo={todo}
                          onClick={onViewDetail}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}