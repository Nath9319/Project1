import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeProvider } from "@/contexts/mode-context";
import { LanguageProvider } from "@/contexts/language-context";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TemplateSelector from "@/pages/template-selector";
import Groups from "@/pages/groups";
import GroupDetail from "@/pages/group-detail";
import GroupPolicies from "@/pages/group-policies";
import Insights from "@/pages/insights";
import Partner from "@/pages/partner";
import { ReminderManager } from "@/components/reminder-notification";
import { ResponsivePreview } from "@/components/responsive-preview";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/templates" component={TemplateSelector} />
          <Route path="/groups" component={Groups} />
          <Route path="/groups/:id" component={GroupDetail} />
          <Route path="/groups/:id/policies" component={GroupPolicies} />
          <Route path="/insights" component={Insights} />
          <Route path="/partner" component={Partner} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <ModeProvider>
            <TooltipProvider>
              <Toaster />
              <ReminderManager />
              <ResponsivePreview />
              <Router />
            </TooltipProvider>
          </ModeProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
