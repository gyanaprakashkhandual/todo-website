/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Todo } from "../types";

interface TodoContextType {
  selectedTodo: Todo | null;
  setSelectedTodo: (todo: Todo | null) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <TodoContext.Provider value={{ selectedTodo, setSelectedTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

// Custom hook to use the Todo context anywhere
export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}
