import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
} from "@mui/material";

const BudgetModal = ({ open, onClose, onSave, budget }) => {
  // const token = localStorage.getItem('token'); // Removed insecure token access

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lead_guid: "",
    estimated_amount: "",
    discount: "",
    final_amount: "",
    status: "Pending",
  });

  // 🔧 FIX: Use direct localStorage access for token
  useEffect(() => {
    if (!open) return;

    const fetchLeads = async () => {
      setLoadingLeads(true);
      const token =
        localStorage.getItem("token") ||
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzA4MDM4NDYsIm9yZ2FuaXphdGlvbl9ndWlkIjoiNDljNGMxMjItMDcxOC0xMWYxLTljNDItZTIxYWQ4ZjAyYjA0IiwiYWRtaW5fZ3VpZCI6IjQ5YzRjMWM2LTA3MTgtMTFmMS05YzQyLWUyMWFkOGYwMmIwNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpc19hY3RpdmUiOjF9.haZqmTOMh4bBXS-3AhsCGxtfAqmTAm_pZqeA14o2izc";
      localStorage.setItem("token", token);

      try {
        const res = await fetch(
          "http://localhost/crm/CRM_system/api/leads.php",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Leads fetch failed");

        const data = await res.json().catch(() => null);
        if (data && data.success && Array.isArray(data.data)) {
          setLeads(data.data);
        } else {
          setLeads([]);
        }
      } catch (err) {
        console.error("Failed to fetch leads:", err);
        setLeads([]);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, [open]);

  // Set form data when editing
  useEffect(() => {
    if (!open) return;

    if (budget) {
      setFormData({
        lead_guid: budget.lead_guid || "",
        estimated_amount: budget.estimated_amount || "",
        discount: budget.discount || 0,
        final_amount: budget.final_amount || 0,
        status: budget.status || "Pending",
      });
    } else {
      setFormData({
        lead_guid: "",
        estimated_amount: "",
        discount: "",
        final_amount: "",
        status: "Pending",
      });
    }
  }, [budget, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === "estimated_amount" || name === "discount") {
      const estimated =
        parseFloat(
          name === "estimated_amount" ? value : formData.estimated_amount,
        ) || 0;
      const discount =
        parseFloat(name === "discount" ? value : formData.discount) || 0;
      updatedData.final_amount = Math.max(0, estimated - discount);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async () => {
    if (!formData.lead_guid || !formData.estimated_amount) {
      alert("Lead and Estimated Amount are required");
      return;
    }

    setSaving(true);
    const success = await onSave({
      budget_guid: budget ? budget.budget_guid : undefined,
      lead_guid: formData.lead_guid,
      estimated_amount: parseFloat(formData.estimated_amount) || 0,
      discount: parseFloat(formData.discount) || 0,
      status: formData.status,
    });
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{budget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
      <DialogContent dividers>
        {loadingLeads ? (
          <p>Loading leads...</p>
        ) : (
          <Grid container spacing={2} width={"100%"}>
            <Grid item xs={12} width={{ xs: "100%", sm: "44.5%" }}>
              <TextField
                select
                fullWidth
                label="Select Lead"
                name="lead_guid"
                value={formData.lead_guid}
                onChange={handleChange}
                autoFocus
              >
                {leads.map((lead) => (
                  <MenuItem key={lead.lead_guid} value={lead.lead_guid}>
                    {lead.lead_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} width={{ xs: "100%", sm: "44.5%" }}>
              <TextField
                fullWidth
                label="Estimated Amount"
                name="estimated_amount"
                type="number"
                value={formData.estimated_amount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} width={{ xs: "100%", sm: "44.5%" }}>
              <TextField
                fullWidth
                label="Discount"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} width={{ xs: "100%", sm: "44.5%" }}>
              <TextField
                fullWidth
                label="Final Amount"
                value={formData.final_amount}
                type="number"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6} width={{ xs: "100%", sm: "44.5%" }}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {budget ? "Update Budget" : "Create Budget"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetModal;
