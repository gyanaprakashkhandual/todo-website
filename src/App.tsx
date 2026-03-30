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
import { ConfirmProvider } from "./context/Confirm.context";
import { ActionMenuProvider } from "./context/Action.menu.ui.context";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
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

        <Route
          path="/todo/:id"
          element={
            isAuthenticated ? <TodoFullViewPage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ActionMenuProvider>
        <ConfirmProvider>
          <ThemeProvider>
            <AuthProvider>
              <TodoProvider>
                <AppContent />
              </TodoProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConfirmProvider>
      </ActionMenuProvider>
    </Provider>
  );
}
