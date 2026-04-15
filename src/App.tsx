import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MenuBuilder from "./pages/MenuBuilder";
import ReportBuilder from "./pages/ReportBuilder";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/menus" element={<MenuBuilder />} />
          <Route path="/reports" element={<ReportBuilder />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/roles" element={<RolesPermissions />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
