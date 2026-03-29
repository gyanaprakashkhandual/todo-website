import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/Auth.context';
import { ThemeProvider } from './context/Theme.context';
import { useAuth } from './context/Auth.context';
import { TodoProvider } from './context/Todo.context';

import { Provider } from 'react-redux';
import { store } from './lib/store';

import AuthPage from './pages/utils/Auth.page';
import Dashboard from './pages/app/Home.page';           // ← Your Kanban Dashboard
import HeroPage from './pages/app/Hero.page';
import LoadingScreen from './ui/Loading.ui';

// Full View Todo Page
import TodoFullViewPage from './components/Full.view';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        {/* Root Path - Dashboard for authenticated users */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Dashboard /> : 
              (showAuth ? <AuthPage /> : <HeroPage onGetStarted={() => setShowAuth(true)} />)
          } 
        />

        {/* Todo Full View Page */}
        <Route 
          path="/todo/:id" 
          element={
            isAuthenticated ? 
              <TodoFullViewPage /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Auth Page (optional direct access) */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <AuthPage />
          } 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <TodoProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </TodoProvider>
    </Provider>
  );
}