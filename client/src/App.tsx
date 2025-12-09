import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Chat from "@/pages/chat";
import { AuthProvider, useAuth } from "@/lib/auth";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    // We can't do this directly in render easily with wouter without useEffect, 
    // but returning Login component works for a simple guard
    return <Login />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/chat">
        {() => <ProtectedRoute component={Chat} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;