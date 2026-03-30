# Todo Web — React + Vite + Tailwind + Framer Motion + Primer UI + TypeScript

---

## Tech Stack

| Tool          | Purpose                          |
| ------------- | -------------------------------- |
| React 18      | UI framework                     |
| TypeScript    | Type safety                      |
| Vite          | Build tool and dev server        |
| Tailwind CSS  | Utility-first styling            |
| Framer Motion | Animations and transitions       |
| Primer UI     | GitHub's React component library |

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher

---

## Step 1 — Scaffold the Project

```bash
npm create vite@latest todo-web -- --template react-ts
cd todo-web
npm install
```

---

## Step 2 — Install All Dependencies

### UI and animation libraries

```bash
npm install @primer/react framer-motion react-dom
```

### Tailwind CSS

```bash
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Type definitions

```bash
npm install --save-dev @types/react @types/react-dom
```

---

## Step 3 — Final Folder Structure

```
todo-web/
├── src/
│   ├── components/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoForm.tsx
│   ├── hooks/
│   │   └── useTodos.ts
│   ├── types/
│   │   └── todo.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
└── package.json
```

---

## Step 4 — Configure Tailwind CSS

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 5 — Configure Vite

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
```

---

## Step 6 — Configure TypeScript

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 7 — Entry Point

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, BaseStyles } from "@primer/react";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <App />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
);
```

> `ThemeProvider` from Primer handles light/dark mode automatically.
> `BaseStyles` applies Primer's base CSS reset alongside Tailwind.

---

## Step 8 — Type Definitions

### `src/types/todo.ts`

```typescript
export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
}
```

---

## Step 9 — Custom Hook

### `src/hooks/useTodos.ts`

```typescript
import { useState, useCallback } from "react";
import { Todo, Priority } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback(
    (title: string, priority: Priority = "medium") => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        priority,
        createdAt: new Date(),
      };
      setTodos((prev) => [newTodo, ...prev]);
    },
    [],
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
}
```

---

## Step 10 — Components

### `src/components/TodoForm.tsx`

```tsx
import React, { useState } from "react";
import { TextInput, Button, Select } from "@primer/react";
import { Priority } from "@/types/todo";

interface TodoFormProps {
  onAdd: (title: string, priority: Priority) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), priority);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <TextInput
        placeholder="Add a new todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
        size="large"
      />
      <Select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
      >
        <Select.Option value="low">Low</Select.Option>
        <Select.Option value="medium">Medium</Select.Option>
        <Select.Option value="high">High</Select.Option>
      </Select>
      <Button type="submit" variant="primary" size="large">
        Add
      </Button>
    </form>
  );
};

export default TodoForm;
```

---

### `src/components/TodoItem.tsx`

```tsx
import React from "react";
import { motion } from "framer-motion";
import { Box, Checkbox, Text, IconButton, Label } from "@primer/react";
import { TrashIcon } from "@primer/octicons-react";
import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityVariant: Record<string, "default" | "attention" | "danger"> = {
  low: "default",
  medium: "attention",
  high: "danger",
};

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding={3}
        borderWidth={1}
        borderStyle="solid"
        borderColor="border.default"
        borderRadius={2}
        backgroundColor="canvas.subtle"
        className="hover:bg-gray-50 transition-colors duration-150"
      >
        <Box display="flex" alignItems="center" gap={3}>
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <Text
            fontSize={1}
            color={todo.completed ? "fg.muted" : "fg.default"}
            sx={{ textDecoration: todo.completed ? "line-through" : "none" }}
          >
            {todo.title}
          </Text>
          <Label variant={priorityVariant[todo.priority]}>
            {todo.priority}
          </Label>
        </Box>
        <IconButton
          icon={TrashIcon}
          aria-label="Delete todo"
          variant="invisible"
          size="small"
          onClick={() => onDelete(todo.id)}
        />
      </Box>
    </motion.div>
  );
};

export default TodoItem;
```

---

### `src/components/TodoList.tsx`

```tsx
import React from "react";
import { AnimatePresence } from "framer-motion";
import { Box, Text } from "@primer/react";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" padding={6}>
        <Text color="fg.muted" fontSize={1}>
          No todos yet. Add one above.
        </Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default TodoList;
```

---

## Step 11 — Root Component

### `src/App.tsx`

```tsx
import React from "react";
import { motion } from "framer-motion";
import { Box, Heading, Text, CounterLabel } from "@primer/react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { useTodos } from "@/hooks/useTodos";

const App: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Box
          backgroundColor="canvas.default"
          borderWidth={1}
          borderStyle="solid"
          borderColor="border.default"
          borderRadius={3}
          padding={6}
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading as="h1" sx={{ fontSize: 4 }}>
              Todo
            </Heading>
            {todos.length > 0 && (
              <Text color="fg.muted" fontSize={1}>
                <CounterLabel>{remaining}</CounterLabel> remaining
              </Text>
            )}
          </Box>

          <TodoForm onAdd={addTodo} />
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </Box>
      </motion.div>
    </div>
  );
};

export default App;
```

---

## Step 12 — Install Primer Octicons (for icons)

```bash
npm install @primer/octicons-react
```

---

## Step 13 — Run the App

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Step 14 — Build for Production

```bash
npm run build
```

Output goes to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

---

## package.json Scripts Reference

| Command           | Action                             |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start dev server at localhost:3000 |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Preview production build locally   |
| `npm run lint`    | Run ESLint                         |

---

## Architecture Summary

| File                          | Role                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `src/main.tsx`                | App entry — mounts React, wraps with Primer ThemeProvider |
| `src/App.tsx`                 | Root layout, page-level animation                         |
| `src/hooks/useTodos.ts`       | All todo state and logic                                  |
| `src/types/todo.ts`           | Shared TypeScript types                                   |
| `src/components/TodoForm.tsx` | Primer inputs, adds new todos                             |
| `src/components/TodoItem.tsx` | Framer Motion item animation + Primer UI                  |
| `src/components/TodoList.tsx` | AnimatePresence for list enter/exit                       |

---

## How Tailwind and Primer Coexist

Primer uses its own design tokens via `sx` props and Primer-specific class names.
Tailwind is used for layout and spacing at the page/container level.
Avoid applying Tailwind classes directly on Primer components — use Tailwind on
wrapper `div` elements and Primer's `sx` prop for anything inside Primer components.
