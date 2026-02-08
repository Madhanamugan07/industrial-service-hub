import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRouteLayout, AdminRoute } from "@/components/ProtectedRoute";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CustomersPage from "@/pages/CustomersPage";
import MachinesPage from "@/pages/MachinesPage";
import WarehousePage from "@/pages/WarehousePage";
import ServicePersonsPage from "@/pages/ServicePersonsPage";
import TicketsPage from "@/pages/TicketsPage";
import TicketDetailPage from "@/pages/TicketDetailPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRouteLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />

              {/* Admin-only routes */}
              <Route path="/customers" element={<AdminRoute><CustomersPage /></AdminRoute>} />
              <Route path="/machines" element={<AdminRoute><MachinesPage /></AdminRoute>} />
              <Route path="/warehouse" element={<AdminRoute><WarehousePage /></AdminRoute>} />
              <Route path="/service-persons" element={<AdminRoute><ServicePersonsPage /></AdminRoute>} />
              <Route path="/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
