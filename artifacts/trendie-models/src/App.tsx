import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, AuthPage, PublicHome, ProtectedPage } from './site';

const queryClient = new QueryClient();

function Router() {
  return (
    <AuthProvider>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={PublicHome} />
          <Route path="/sign-in">{() => <AuthPage mode="sign-in" />}</Route>
          <Route path="/sign-up">{() => <AuthPage mode="sign-up" />}</Route>
          <Route path="/forgot-password">{() => <AuthPage mode="forgot-password" />}</Route>
          {['/dashboard','/profile','/models','/applications','/tasks','/points','/leaderboard','/messages','/announcements','/daily-tracker','/notifications','/support','/audit-logs','/settings'].map(path =>
            <Route key={path} path={path}>{() => <ProtectedPage path={path} />}</Route>
          )}
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AuthProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: import('react').ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
