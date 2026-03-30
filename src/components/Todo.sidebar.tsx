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
  Search,
  Inbox,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Todo, Priority, TodoStatus } from "../types/index";
import { Tooltip } from "../ui/Tooltip.ui";

const PRIORITY_CONFIG: Record<
  Priority,
  {
    accentColor: string;
    icon: React.ReactNode;
    badgeClass: string;
    label: string;
  }
> = {
  LOW: {
    label: "Low",
    accentColor: "#6366f1",
    badgeClass: "text-indigo-500 dark:text-indigo-400",
    icon: <Minus className="w-2.5 h-2.5" />,
  },
  MEDIUM: {
    label: "Medium",
    accentColor: "#d97706",
    badgeClass: "text-amber-500 dark:text-amber-400",
    icon: <ChevronUp className="w-2.5 h-2.5" />,
  },
  HIGH: {
    label: "High",
    accentColor: "#ea580c",
    badgeClass: "text-orange-500 dark:text-orange-400",
    icon: <ArrowUp className="w-2.5 h-2.5" />,
  },
  URGENT: {
    label: "Urgent",
    accentColor: "#dc2626",
    badgeClass: "text-red-500 dark:text-red-400",
    icon: <Flame className="w-2.5 h-2.5" />,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; dotClass: string; ringClass: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Circle className="w-3 h-3" />,
    dotClass: "bg-slate-400",
    ringClass: "ring-slate-200 dark:ring-slate-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    dotClass: "bg-blue-500",
    ringClass: "ring-blue-100 dark:ring-blue-900/40",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="w-3 h-3" />,
    dotClass: "bg-emerald-500",
    ringClass: "ring-emerald-100 dark:ring-emerald-900/40",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="w-3 h-3" />,
    dotClass: "bg-gray-400",
    ringClass: "ring-gray-200 dark:ring-gray-700",
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
    {
      day: "2-digit",
      month: "short",
    },
  );
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED")
    return false;
  return new Date(endDate) < new Date();
}

function SkeletonCard() {
  return (
    <div className="w-full relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-0.75 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="pl-4 pr-3 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="h-3.5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="h-2.5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGroup() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-2.5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-2.5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ml-auto" />
      </div>
      <div className="space-y-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850 flex items-center justify-center shadow-inner">
          {query ? (
            <Search className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          ) : (
            <Inbox className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="text-[10px]">{query ? "🔍" : "✨"}</span>
        </span>
      </div>
      <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {query ? "No tasks found" : "No tasks yet"}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-gray-600 leading-relaxed max-w-50">
        {query
          ? `No results for "${query}". Try a different keyword.`
          : "Your tasks will appear here once created."}
      </p>
    </motion.div>
  );
}

function SidebarCard({
  todo,
  isActive,
  onClick,
}: {
  todo: Todo;
  isActive: boolean;
  onClick: (todo: Todo) => void;
}) {
  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_CONFIG[todo.status] ?? STATUS_CONFIG["PENDING"];
  const overdue = isOverdue(todo.endDate, todo.status);
  const due = formatDateShort(todo.endDate);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: 10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -1, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.985, transition: { duration: 0.08 } }}
      onClick={() => onClick(todo)}
      className={[
        "w-full text-left relative rounded-xl border transition-all duration-150 overflow-hidden outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400",
        isActive
          ? "bg-gray-50 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 shadow-md ring-1 " +
            sc.ringClass
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700",
      ].join(" ")}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-0.75 transition-opacity duration-150"
        style={{
          backgroundColor: pc.accentColor,
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {isActive && (
        <motion.span
          layoutId="activeCard"
          className="absolute inset-0 bg-linear-to-r from-gray-50/60 to-transparent dark:from-white/3 pointer-events-none"
          transition={{ duration: 0.2 }}
        />
      )}

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
            <span
              className={`${sc.dotClass} w-1.5 h-1.5 rounded-full shrink-0 ${
                todo.status === "IN_PROGRESS" ? "animate-pulse" : ""
              }`}
            />
            <span className="text-[10px] font-medium">{sc.label}</span>
          </div>
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold ${pc.badgeClass}`}
          >
            {pc.icon}
            {pc.label}
          </span>
        </div>

        <p
          className={[
            "text-[13px] font-semibold leading-snug mb-2 line-clamp-2",
            todo.status === "COMPLETED"
              ? "line-through text-gray-400 dark:text-gray-600"
              : "text-gray-900 dark:text-gray-100",
          ].join(" ")}
        >
          {todo.title}
        </p>

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

interface TodoSidebarProps {
  open: boolean;
  todos: Todo[];
  loading?: boolean;
  error?: string | null;
  activeTodoId?: string | null;
  onClose: () => void;
  onViewDetail: (todo: Todo) => void;
}

export default function TodoSidebar({
  open,
  todos,
  loading = false,
  error = null,
  onClose,
  onViewDetail,
}: TodoSidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return todos;
    const q = query.toLowerCase();
    return todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [todos, query]);

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status]?.label ?? status,
    icon: STATUS_CONFIG[status]?.icon,
    items: filtered.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  const completedCount = todos.filter((t) => t.status === "COMPLETED").length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-99 lg:hidden"
            onClick={onClose}
          />

          <motion.aside
            key="todo-sidebar"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 34,
              mass: 0.9,
            }}
            className="mt-14 fixed top-0 left-0 h-[calc(100vh-56px)] w-full sm:w-85 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 z-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <LayoutList className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    All Tasks
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 leading-tight">
                    {loading
                      ? "Loading…"
                      : `${todos.length} total · ${completedCount} done`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content="Close">
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {todos.length > 0 && !loading && (
              <div className="px-5 pt-3 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600">
                    Progress
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="px-4 py-2.5 shrink-0 border-b border-gray-100 dark:border-gray-800/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tasks or tags…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-1 focus:ring-gray-800 focus:border-blue-300 dark:focus:border-gray-700 transition-all duration-150"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 overscroll-contain">
              {loading ? (
                <div className="space-y-5">
                  <SkeletonGroup />
                  <SkeletonGroup />
                </div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-6 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 border border-red-100 dark:border-red-800/40">
                    <AlertCircle className="w-6 h-6 text-red-400 dark:text-red-500" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Something went wrong
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              ) : grouped.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                grouped.map((group, i) => (
                  <motion.div
                    key={group.status}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                      <span className="text-gray-400 dark:text-gray-600">
                        {group.icon}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 ml-auto bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {group.items.map((todo) => (
                          <SidebarCard
                            key={todo.id}
                            todo={todo}
                            onClick={onViewDetail}
                            isActive={false}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(
                    ["IN_PROGRESS", "PENDING", "COMPLETED"] as TodoStatus[]
                  ).map((s) => {
                    const count = todos.filter((t) => t.status === s).length;
                    const sc = STATUS_CONFIG[s];
                    return (
                      <div key={s} className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`}
                        />
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-700 font-medium">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
