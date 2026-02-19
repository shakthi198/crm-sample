import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Followups from "./pages/Followups";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Login from "./pages/Login";
import BudgetPage from "./pages/BudgetPage";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import Organization from "./pages/Organization";
import Roles from "./pages/Roles";
import AttendancePage from "./pages/AttendancePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SnackbarProvider } from "./context/SnackbarContext";
import Payroll from "./pages/Payroll";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
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
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
