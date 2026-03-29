import { motion } from "framer-motion";
import type { Todo, Priority } from "../../types/index";
import ActionMenu from "../../ui/Action.menu.ui";
import {
  MoreHorizontal, Eye, Pencil, Trash2, Tag,
  CalendarDays, AlertCircle, ChevronUp, Minus, ArrowUp, Flame,
} from "lucide-react";

interface KanbanCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onViewDetail: (todo: Todo) => void; // ← opens full view modal
  isDragging?: boolean;
  isSyncing?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; badgeClasses: string; dotColor: string; icon: React.ReactNode }> = {
  LOW: { label: "Low", dotColor: "#6366f1", badgeClasses: "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40", icon: <Minus className="w-2.5 h-2.5" /> },
  MEDIUM: { label: "Medium", dotColor: "#d97706", badgeClasses: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40", icon: <ChevronUp className="w-2.5 h-2.5" /> },
  HIGH: { label: "High", dotColor: "#ea580c", badgeClasses: "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40", icon: <ArrowUp className="w-2.5 h-2.5" /> },
  URGENT: { label: "Urgent", dotColor: "#dc2626", badgeClasses: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40", icon: <Flame className="w-2.5 h-2.5" /> },
};

const STATUS_COLOR: Record<string, { bg: string; dot: string; text: string }> = {
  PENDING: { bg: "bg-slate-100 dark:bg-slate-800/50", dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
  IN_PROGRESS: { bg: "bg-blue-50 dark:bg-blue-900/20", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  COMPLETED: { bg: "bg-emerald-50 dark:bg-emerald-900/20", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  CANCELLED: { bg: "bg-gray-100 dark:bg-gray-800/50", dot: "bg-gray-400", text: "text-gray-500 dark:text-gray-500" },
};

function formatStatus(status: string) {
  return status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(endDate) < new Date();
}

export default function KanbanCard({ todo, onEdit, onDelete, onViewDetail, isDragging, isSyncing }: KanbanCardProps) {
  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_COLOR[todo.status] ?? STATUS_COLOR["PENDING"];
  const overdue = isOverdue(todo.endDate, todo.status);
  const dueDate = formatDate(todo.endDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: isSyncing ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={!isDragging ? { y: -1, transition: { duration: 0.12 } } : {}}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("todoId", String(todo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onViewDetail(todo)}
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer select-none flex flex-col gap-0 transition-shadow duration-200 ${
        isDragging ? "shadow-xl ring-2 ring-blue-400/40 rotate-1 scale-[1.02] z-50" : "shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
      }`}
    >
      {/* Priority accent bar */}
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ backgroundColor: pc.dotColor }} />

      {/* Syncing overlay */}
      {isSyncing && (
        <div className="absolute inset-0 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      )}

      <div className="px-4 pt-3.5 pb-3 flex flex-col gap-2.5">
        {/* Row 1: Status + Priority + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${sc.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
            <span className={`text-[10px] font-semibold tracking-wide leading-none ${sc.text}`}>{formatStatus(todo.status)}</span>
          </div>

          <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold leading-none ${pc.badgeClasses}`}>
            {pc.icon}{pc.label}
          </span>

          {/* Wrap in div with stopPropagation so card click doesn't fire when opening menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu>
              <ActionMenu.Anchor>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                  type="button"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Card actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </motion.button>
              </ActionMenu.Anchor>

              <ActionMenu.Overlay>
                {/* ✅ View Details — opens the full view modal, NO URL change */}
                <ActionMenu.Item leadingIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => onViewDetail(todo)}>
                  View Details
                </ActionMenu.Item>

                {/* ✅ Edit — opens todo form modal */}
                <ActionMenu.Item leadingIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => onEdit(todo)}>
                  Edit
                </ActionMenu.Item>

                {/* ✅ Delete — opens delete confirm */}
                <ActionMenu.Item variant="danger" leadingIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => onDelete(todo.id)}>
                  Delete
                </ActionMenu.Item>
              </ActionMenu.Overlay>
            </ActionMenu>
          </div>
        </div>

        {/* Title + Description */}
        <div>
          <h3 className="line-clamp-2 text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
            {todo.title}
          </h3>
          {todo.description && (
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {todo.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
            {todo.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-none">
                {tag}
              </span>
            ))}
            {todo.tags.length > 3 && <span className="text-[10px] text-gray-400 dark:text-gray-500">+{todo.tags.length - 3}</span>}
          </div>
        )}
      </div>

      {/* Footer: due date */}
      {dueDate && (
        <div className={`px-4 py-2 border-t flex items-center gap-1.5 rounded-b-xl ${overdue ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"}`}>
          {overdue ? <AlertCircle className="w-3 h-3 text-red-500 shrink-0" /> : <CalendarDays className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />}
          <span className={`text-[10.5px] font-medium leading-none ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
            {overdue ? "Overdue · " : "Due "}{dueDate}
          </span>
        </div>
      )}
    </motion.div>
  );
}