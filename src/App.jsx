import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SnackbarProvider } from "./context/SnackbarContext";

import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import RoleGuard from "./components/RoleGuard";

// Normal Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Followups from "./pages/Followups";
import BudgetPage from "./pages/BudgetPage";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import Organization from "./pages/Organization";
import Roles from "./pages/Roles";
import AttendancePage from "./pages/AttendancePage";
import Payroll from "./pages/Payroll";
import ReportsPage from "./pages/ReportsPage";
// Super Admin Pages
import HeadAdminLogin from "./pages/superAdmin/HeadAdminLogin";
import HeadAdminDashboard from "./pages/superAdmin/HeadAdminDashboard";
import HeadAdminUsers from "./pages/superAdmin/HeadAdminUsers";
import Reports from "./pages/superAdmin/Reports";

function ShortcutListener() {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        window.location.href = "/super-login";
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <ShortcutListener />
          <ScrollToTop />

          <Routes>
            {/* Login Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/super-login" element={<HeadAdminLogin />} />

            {/* Protected Layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* SUPER ADMIN ROUTES */}
              <Route element={<RoleGuard allowedRoles={["Super Admin"]} />}>
                <Route
                  path="super/dashboard"
                  element={<HeadAdminDashboard />}
                />
                <Route path="super/reports" element={<Reports />} />
                <Route path="super/users" element={<HeadAdminUsers />} />
              </Route>

              {/* NORMAL USER ROUTES */}
              <Route
                element={
                  <RoleGuard
                    allowedRoles={["Admin", "Manager", "Finance", "Telecaller"]}
                  />
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="followups" element={<Followups />} />
                <Route path="budgets" element={<BudgetPage />} />
                <Route path="clients" element={<Clients />} />
                <Route path="users" element={<Users />} />
                <Route path="organization" element={<Organization />} />
                <Route path="roles" element={<Roles />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
