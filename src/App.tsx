/**
 * File: App.tsx
 * Purpose: Root application component with routing configuration.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HospitalSettingsProvider } from "@/contexts/HospitalSettingsContext";
import { UserProvider } from "@/contexts/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/UsersPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import SchedulePage from "@/pages/SchedulePage";
import LeavesPage from "@/pages/LeavesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HospitalSettingsProvider>
        <UserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute><AppLayout title="Dashboard" subtitle="Hospital overview" /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Doctors & Staff" subtitle="Manage hospital personnel" /></ProtectedRoute>}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Departments" subtitle="Manage hospital departments" /></ProtectedRoute>}>
                <Route path="/departments" element={<DepartmentsPage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Schedule" subtitle="Shift assignments & rosters" /></ProtectedRoute>}>
                <Route path="/schedule" element={<SchedulePage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Leave Management" subtitle="Review leave requests" /></ProtectedRoute>}>
                <Route path="/leaves" element={<LeavesPage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Notifications" subtitle="Alerts & updates" /></ProtectedRoute>}>
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Reports" subtitle="Analytics & insights" /></ProtectedRoute>}>
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
              <Route element={<ProtectedRoute><AppLayout title="Settings" subtitle="Account & preferences" /></ProtectedRoute>}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </HospitalSettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
