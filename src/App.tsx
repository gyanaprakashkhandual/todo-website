import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/Auth.context";
import { ThemeProvider } from "./context/Theme.context";
import { useAuth } from "./context/Auth.context";
import { TodoProvider } from "./context/Todo.context";

import { Provider } from "react-redux";
import { store } from "./lib/store";

import AuthPage from "./pages/utils/Auth.page";
import Dashboard from "./pages/app/Home.page";
import HeroPage from "./pages/app/Hero.page";
import LoadingScreen from "./ui/Loading.ui";
import TodoFullViewPage from "./components/Full.view";

// ─── Inner app (has access to all contexts) ───────────────────────────────────
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        {/* Root: dashboard or landing */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : showAuth ? (
              <AuthPage />
            ) : (
              <HeroPage onGetStarted={() => setShowAuth(true)} />
            )
          }
        />

        {/* Full todo detail view — protected */}
        <Route
          path="/todo/:id"
          element={
            isAuthenticated ? (
              <TodoFullViewPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Direct auth route */}
        <Route
          path="/auth"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// ─── Root: providers wrapping in correct dependency order ─────────────────────
// Order matters:
//   1. Redux store  → global state, no deps
//   2. ThemeProvider → reads nothing from auth/todo
//   3. AuthProvider  → may read theme; needed by TodoProvider
//   4. TodoProvider  → needs auth token for API calls
//   5. AppContent    → consumes everything above
export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <TodoProvider>
            <AppContent />
          </TodoProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}