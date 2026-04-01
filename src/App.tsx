import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import OAuth2RedirectPage from "./pages/app/Oauth.page";

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

// Meta Data Component
const MetaData = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  document.title = title;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);

  // Update Open Graph meta tags
  const ogTitle =
    document.querySelector('meta[property="og:title"]') ||
    document.createElement("meta");
  ogTitle.setAttribute("property", "og:title");
  ogTitle.setAttribute("content", title);
  if (!document.querySelector('meta[property="og:title"]'))
    document.head.appendChild(ogTitle);

  const ogDescription =
    document.querySelector('meta[property="og:description"]') ||
    document.createElement("meta");
  ogDescription.setAttribute("property", "og:description");
  ogDescription.setAttribute("content", description);
  if (!document.querySelector('meta[property="og:description"]'))
    document.head.appendChild(ogDescription);

  return null;
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <>
                <MetaData
                  title="Dashboard | TaskFlow"
                  description="Manage your tasks efficiently with TaskFlow - Stay organized and productive."
                />
                <Dashboard />
              </>
            ) : (
              <>
                <MetaData
                  title="TaskFlow - Smart Task Management"
                  description="Organize your life with powerful task management. Simple, beautiful, and effective."
                />
                <HeroPage
                  onGetStarted={function (): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </>
            )
          }
        />

        <Route
          path="/sign-in"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <>
                <MetaData
                  title="Sign In | TaskFlow"
                  description="Sign in to your TaskFlow account to manage your tasks and stay productive."
                />
                <AuthPage />
              </>
            )
          }
        />

        <Route
          path="/todo/:id"
          element={
            isAuthenticated ? (
              <>
                <MetaData
                  title="Task Details | TaskFlow"
                  description="View and manage detailed task information."
                />
                <TodoFullViewPage />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/terms-and-conditions"
          element={
            <>
              <MetaData
                title="Terms and Conditions | TaskFlow"
                description="Read our Terms and Conditions to understand how TaskFlow works."
              />
              <TermsPage />
            </>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <>
              <MetaData
                title="Privacy Policy | TaskFlow"
                description="Learn how TaskFlow collects, uses, and protects your personal information."
              />
              <PrivacyPage />
            </>
          }
        />

        <Route
          path="*"
          element={
            <>
              <MetaData
                title="Page Not Found | TaskFlow"
                description="The page you're looking for doesn't exist."
              />
              <Navigate to="/" replace />
            </>
          }
        />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage/>}/>
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
