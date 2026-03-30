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
import TermsPage from "./pages/utils/Terms.page";
import PrivacyPage from "./pages/utils/Privacy.page";
import LoadingScreen from "./ui/Loading.ui";
import TodoFullViewPage from "./components/Full.view";
import { ConfirmProvider } from "./context/Confirm.context";
import { ActionMenuProvider } from "./context/Action.menu.ui.context";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <HeroPage onGetStarted={function (): void {
            throw new Error("Function not implemented.");
          } } />}
        />

        <Route
          path="/sign-in"
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
        />

        <Route
          path="/todo/:id"
          element={isAuthenticated ? <TodoFullViewPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/terms-and-conditions"
          element={<TermsPage />}
        />
        <Route
          path="/privacy-policy"
          element={<PrivacyPage />}
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
