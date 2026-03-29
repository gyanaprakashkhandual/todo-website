import { motion } from "framer-motion";
import type { Todo, Priority } from "../../types";
import { useTodo } from "../../context/Todo.context";
import ActionMenu from "../../ui/Action.menu.ui";
import { MoreHorizontal } from "lucide-react";

interface KanbanCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
  isSyncing?: boolean;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClasses: string }
> = {
  LOW: {
    label: "Low",
    badgeClasses: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  MEDIUM: {
    label: "Medium",
    badgeClasses: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  HIGH: {
    label: "High",
    badgeClasses: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  URGENT: {
    label: "Urgent",
    badgeClasses: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

// Helper to format status beautifully (e.g., "NOT_STARTED" -> "Not Started")
function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  const dateObj = new Date(Number(y), Number(m) - 1, Number(day));
  const monthStr = dateObj.toLocaleString("default", { month: "short" });
  return `${day} ${monthStr} ${y}`;
}

function isOverdue(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

export default function KanbanCard({
  todo,
  onEdit,
  onDelete,
  isDragging,
  isSyncing,
}: KanbanCardProps) {
  const { setSelectedTodo } = useTodo();
  const pc = PRIORITY_CONFIG[todo.priority];
  const overdue =
    isOverdue(todo.endDate) &&
    todo.status !== "COMPLETED" &&
    todo.status !== "CANCELLED";

  return (
    <motion.div
      layout
      layoutId={`card-${todo.id}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      // Smoother spring animation
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      onClick={() => setSelectedTodo(todo)}
      className={`
        group relative bg-white dark:bg-[#1e1e1e] rounded-xl p-4 cursor-pointer
        transition-all duration-200 select-none flex flex-col gap-3
        ${
          isDragging
            ? "shadow-xl shadow-indigo-100 dark:shadow-black/40 rotate-2 scale-[1.03] z-50 border-indigo-300 dark:border-indigo-600"
            : "shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
        }
        ${isSyncing ? "opacity-60" : "opacity-100"}
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("todoId", String(todo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* Sync indicator */}
      {isSyncing && (
        <div className="absolute top-3 right-3">
          <svg className="animate-spin w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
        </div>
      )}

      {/* Top Row: Status Badge & Actions Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">
            {formatStatus(todo.status || "Not Started")}
          </span>
        </div>
          <ActionMenu>
            
            <ActionMenu.Button size="sm">
              <MoreHorizontal/>
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionMenu.Item>
                View
              </ActionMenu.Item>
              <ActionMenu.Item onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}>
          Delete
              </ActionMenu.Item>
              <ActionMenu.Item onClick={(e) => {
                e.stopPropagation();
                onEdit(todo);
              }}>
                Edit
              </ActionMenu.Item>
            </ActionMenu.Overlay>
            
          </ActionMenu>
      </div>

      {/* Middle: Title & Description */}
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
          {todo.title}
        </h3>
        {todo.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {todo.description}
          </p>
        )}
      </div>

      {/* Tags section styled beautifully */}
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {todo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: Date & Priority Flag */}
      <div className="flex items-center justify-between mt-2 pt-1">
        <div className="flex items-center gap-1.5">
          {todo.endDate ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={overdue ? "text-red-500" : "text-gray-400"}>
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span className={`text-sm font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                {formatDate(todo.endDate)}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-600 font-medium">No deadline</span>
          )}
        </div>

        {/* Priority Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pc.badgeClasses}`}>
          {pc.label}
        </span>
      </div>

      {/* Footer: Links / Metadata */}
      {todo.refLink && (
        <div className="flex items-center gap-4 pt-3 mt-1 border-t border-gray-50 dark:border-gray-800/50">
          <a
            href={todo.refLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            1 Link
          </a>
        </div>
      )}
    </motion.div>
  );
}