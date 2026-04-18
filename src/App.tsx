import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MenuBuilder from "./pages/MenuBuilder";
import ReportBuilder from "./pages/ReportBuilder";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import SystemSettings from "./pages/SystemSettings";
import ReturnedCheques from "./pages/ReturnedCheques";
import ReturnedChequesCustomers from "./pages/ReturnedChequesCustomers";
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
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/menus" element={<ProtectedRoute><MenuBuilder /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportBuilder /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute><RolesPermissions /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
          <Route path="/returned-cheques" element={<ProtectedRoute><ReturnedCheques /></ProtectedRoute>} />
          <Route path="/returned-cheques/customers" element={<ProtectedRoute><ReturnedChequesCustomers /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
