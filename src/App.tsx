import { useState } from 'react';
import { AuthProvider } from './context/Auth.context';
import { ThemeProvider } from './context/Theme.context';
import { useAuth } from './context/Auth.context';
import AuthPage from './pages/utils/Auth.page';
import Dashboard from './pages/app/Home.page';
import LoadingScreen from './ui/Loading.ui';
import HeroPage from './pages/app/Hero.page';
import { Provider } from 'react-redux';
import { store } from './lib/store';
import { TodoProvider } from './context/Todo.context';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) return <Dashboard />;

  if (showAuth) return <AuthPage />;

  return <HeroPage onGetStarted={() => setShowAuth(true)} />;
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