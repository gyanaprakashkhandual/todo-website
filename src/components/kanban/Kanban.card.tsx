

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

// ... your existing imports and code stay exactly the same until the return

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
      // ... your entire motion.div stays 100% unchanged
      onClick={() => setSelectedTodo(todo)}   // already there — good
      className={`
        group relative bg-white dark:bg-[#1e1e1e] rounded-xl p-4 cursor-pointer
        transition-all duration-200 select-none flex flex-col gap-3
        ${isDragging ? "..." : "..."}
        ${isSyncing ? "opacity-60" : "opacity-100"}
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("todoId", String(todo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* Sync indicator - unchanged */}

      {/* Top Row: Status Badge & Actions Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">
            {formatStatus(todo.status || "Not Started")}
          </span>
        </div>

        {/* Priority Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pc.badgeClasses}`}>
          {pc.label}
        </span>

        {/* Action Menu - fixed positioning */}
        <ActionMenu>
          <ActionMenu.Anchor>
            <button 
              type="button"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionMenu.Item onClick={(e) => {
              e.stopPropagation();
              setSelectedTodo(todo); // View = open sidebar
            }}>
              View Details
            </ActionMenu.Item>
            <ActionMenu.Item onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}>
              Edit
            </ActionMenu.Item>
            <ActionMenu.Item 
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
            >
              Delete
            </ActionMenu.Item>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>

     {/* Middle: Title & Description */}
      <div>
        <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
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
        <div className="flex flex-wrap gap-1.5 mt-1 line-clamp-2">
          {todo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

    </motion.div>
  );
}