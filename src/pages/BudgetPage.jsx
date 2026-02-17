import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SummaryCards from "../components/SummaryCards";
import BudgetTable from "../components/BudgetTable";
import BudgetModal from "../components/BudgetModal";
import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext.jsx";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
const BudgetPage = () => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  // Removed token from useAuth as it's not provided there
  // const { token } = useAuth();
  const [summary, setSummary] = useState({
    totalBudget: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  });
  // :wrench: Get token from localStorage with fallback
  const token =
    localStorage.getItem("token") ||
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzA4MDM4NDYsIm9yZ2FuaXphdGlvbl9ndWlkIjoiNDljNGMxMjItMDcxOC0xMWYxLTljNDItZTIxYWQ4ZjAyYjA0IiwiYWRtaW5fZ3VpZCI6IjQ5YzRjMWM2LTA3MTgtMTFmMS05YzQyLWUyMWFkOGYwMmIwNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpc19hY3RpdmUiOjF9.haZqmTOMh4bBXS-3AhsCGxtfAqmTAm_pZqeA14o2izc";
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost/crm/budget.php",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        console.warn("Budget fetch failed:", res.status);
        setBudgets([]);
        return;
      }
      const data = await res.json().catch(() => null);
      console.log("Budget API Response:", data);
      if (data && data.success && Array.isArray(data.data)) {
        setBudgets(data.data);
      } else {
        setBudgets([]);
      }
    } catch (error) {
      console.error("Budget Fetch Error:", error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBudgets();
  }, []);
  // ===============================
  // :small_blue_diamond: SUMMARY CALCULATION
  // ===============================
  useEffect(() => {
    const total = budgets.reduce(
      (acc, curr) => acc + Number(curr.final_amount || 0),
      0,
    );
    const approved = budgets.filter((b) => b.status === "Approved").length;
    const pending = budgets.filter((b) => b.status === "Pending").length;
    const rejected = budgets.filter((b) => b.status === "Rejected").length;
    setSummary({
      totalBudget: total,
      approvedCount: approved,
      pendingCount: pending,
      rejectedCount: rejected,
    });
  }, [budgets]);
  // ===============================
  // :small_blue_diamond: ADD / EDIT
  // ===============================
  const handleAddClick = () => {
    setCurrentBudget(null);
    setModalOpen(true);
  };
  const handleEditClick = (budget) => {
    setCurrentBudget(budget);
    setModalOpen(true);
  };
  // :wrench: FIX: Use direct localStorage access for token
  const handleSaveBudget = async (budgetData) => {
    const method = budgetData.budget_guid ? "PUT" : "POST";
    try {
      const res = await fetch(
        "http://localhost/crm/budget.php",
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(budgetData),
        },
      );
      const contentType = res.headers.get("content-type") || "";
      const payloadText = contentType.includes("application/json")
        ? null
        : await res.text();
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;
      if (!res.ok) {
        console.error("Save failed:", res.status, payloadText || data);
        alert(payloadText || data?.error || "Failed to save budget.");
        return false;
      }
      console.log("Save Response:", data);
      if (data && data.success) {
        await fetchBudgets();
        return true;
      } else {
        console.error("Save failed:", data?.error);
        alert(data?.error || "Failed to save budget.");
        return false;
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Unable to save budget. Please try again.");
      return false;
    }
  };
  // :wrench: FIX: Use direct localStorage access for token
  const handleStatusChange = async (budget_guid, newStatus) => {
    const budget = budgets.find((b) => b.budget_guid === budget_guid);
    if (!budget) return;
    const payload = {
      budget_guid: budget.budget_guid,
      lead_guid: budget.lead_guid,
      estimated_amount: budget.estimated_amount,
      discount: budget.discount,
      status: newStatus,
    };
    try {
      const res = await fetch(
        "http://localhost/crm/budget.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const contentType = res.headers.get("content-type") || "";
      const payloadText = contentType.includes("application/json")
        ? null
        : await res.text();
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;
      if (!res.ok) {
        console.error("Status update failed:", res.status, payloadText || data);
        alert(payloadText || data?.error || "Failed to update status.");
        return false;
      }
      console.log("Status Update Response:", data);
      if (data.success) {
        await fetchBudgets();
        return true;
      } else {
        console.error("Status update failed:", data.error);
        alert(data?.error || "Failed to update status.");
        return false;
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to update status. Please try again.");
      return false;
    }
  };
  // ===============================
  // :small_blue_diamond: SUMMARY CARDS DATA
  // ===============================
  const summaryItems = [
    {
      title: "Total Budget",
      value: `₹${summary.totalBudget.toLocaleString()}`,
      icon: <MonetizationOnIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: "Approved",
      value: summary.approvedCount,
      icon: <CheckCircleIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
    },
    {
      title: "Pending",
      value: summary.pendingCount,
      icon: <PendingIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
    },
    {
      title: "Rejected",
      value: summary.rejectedCount,
      icon: <CancelIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.error.main,
    },
  ];
  if (loading) {
    return (
      <LoadingSpinner
        loading={true}
        mode="centered"
        message="Loading budgets..."
      />
    );
  }
  return (
    <PageContainer
      title="Budget Management"
      subtitle="Manage and track budget approvals for client projects."
      action={
        hasPermission("edit_budget") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Budget
          </Button>
        )
      }
    >
      <SummaryCards items={summaryItems} showChart={false} />
      <DataTableCard>
        <BudgetTable
          budgets={budgets}
          onEdit={handleEditClick}
          onStatusChange={handleStatusChange}
        />
      </DataTableCard>
      <BudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveBudget}
        budget={currentBudget}
      />
    </PageContainer>
  );
};
export default BudgetPage;
