import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Tag as TagIcon, 
  Link as LinkIcon, 
  Edit3, 
  Trash2 
} from "lucide-react";
import ActionMenu from "../ui/Action.menu.ui";
import { useTodo } from "../context/Todo.context";
import type { Todo } from "../../types";

// Reuse your helpers (copy-paste from KanbanCard.tsx)
function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(d?: string) {
  if (!d) return "No deadline";
  const [y, m, day] = d.split("-");
  const dateObj = new Date(Number(y), Number(m) - 1, Number(day));
  const monthStr = dateObj.toLocaleString("default", { month: "short" });
  return `${day} ${monthStr} ${y}`;
}

function isOverdue(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

const PRIORITY_CONFIG: Record<
  string,
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

export default function TodoFullViewPage() {
  const { id } = useParams<{ id: string }>();   // Gets the UUID from URL: /todo/:id
  const navigate = useNavigate();
  const { selectedTodo, setSelectedTodo } = useTodo();

  // For now we use the todo from context (set when clicking card)
  // In a real app you might fetch by id here if needed
  const todo = selectedTodo;

  if (!todo || todo.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        <p className="text-xl">Task not found or not loaded.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const pc = PRIORITY_CONFIG[todo.priority];
  const overdue =
    isOverdue(todo.endDate) &&
    todo.status !== "COMPLETED" &&
    todo.status !== "CANCELLED";

  const handleEdit = () => {
    // Connect your edit modal or form here
    alert("Edit mode opened - connect your onEdit logic");
  };

  const handleDelete = () => {
    if (confirm(`Delete task "${todo.title}"?`)) {
      // Call your delete function
      // onDelete(todo.id);   // if you pass it as prop
      setSelectedTodo(null);
      navigate("/kanban");   // or your board route
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-12">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedTodo(null);
              navigate(-1);
            }}
            className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Kanban Board</span>
          </button>

          <ActionMenu>
            <ActionMenu.Anchor>
              <button className="px-5 py-2.5 text-sm font-semibold rounded-2xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all">
                Actions
              </button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionMenu.Item onClick={handleEdit}>
                <Edit3 className="w-4 h-4 mr-2" /> Edit Task
              </ActionMenu.Item>
              <ActionMenu.Item variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Task
              </ActionMenu.Item>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl p-10 md:p-14 space-y-12"
        >
          {/* Priority + Status */}
          <div className="flex flex-wrap gap-4">
            <span className={`px-6 py-2.5 rounded-2xl text-sm font-semibold ${pc.badgeClasses}`}>
              {pc.label} Priority
            </span>
            <span className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {formatStatus(todo.status || "NOT_STARTED")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {todo.title}
          </h1>

          {/* Description */}
          {todo.description && (
            <div className="text-[17px] leading-relaxed text-gray-700 dark:text-gray-300">
              {todo.description}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-5">
              <Calendar className={`w-7 h-7 flex-shrink-0 mt-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`} />
              <div>
                <p className="uppercase text-xs tracking-widest text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                <p className={`text-xl font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
                  {formatDate(todo.endDate)}
                </p>
                {overdue && <p className="text-red-500 text-sm mt-2">This task is overdue</p>}
              </div>
            </div>

            {todo.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                  <p className="uppercase text-xs tracking-widest text-gray-500 dark:text-gray-400">Tags</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {todo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-5 py-2 bg-gray-100 dark:bg-neutral-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {todo.refLink && (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <p className="uppercase text-xs tracking-widest text-gray-500 dark:text-gray-400">Reference Link</p>
                </div>
                <a
                  href={todo.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline break-all block text-[15px]"
                >
                  {todo.refLink}
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}