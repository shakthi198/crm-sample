import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Divider,
  MenuItem,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Label as LabelIcon,
  AssignmentInd as AssignedIcon,
  Notes as NotesIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import leadsData from "../data/leads.json";

const STATUS_OPTIONS = [...new Set(leadsData.map((lead) => lead.status))];
const SOURCE_OPTIONS = [...new Set(leadsData.map((lead) => lead.source))];

const LeadForm = ({ open, onClose, onSave, initialData, mode }) => {
  const [users, setUsers] = useState([]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // State uses 'name' and 'assignedTo' to match the user's JSX
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "New",
    source: "Website",
    assignedTo: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        // Map back from data model to form state
        setFormData({
          id: initialData.id || null,
          name: initialData.client_name || "",
          company: initialData.company || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          status: initialData.status || "New",
          source: initialData.source || "Website",
          assignedTo: initialData.assigned_to || "",
          remarks: initialData.remarks || "",
        });
      } else {
        setFormData({
          id: null,
          name: "",
          company: "",
          email: "",
          phone: "",
          status: "New",
          source: "Website",
          assignedTo: "",
          remarks: "",
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "http://localhost/crm/users_dropdown.php",
        );
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = formData.name ? "" : "Client Name is required.";
    tempErrors.company = formData.company ? "" : "Company is required.";
    tempErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ? ""
      : "Valid email is required.";
    tempErrors.phone = /^[0-9+\s-]{10,15}$/.test(formData.phone)
      ? ""
      : "Valid phone number (10-15 digits) required.";
    tempErrors.status = formData.status ? "" : "Status is required.";
    tempErrors.source = formData.source ? "" : "Source is required.";
    tempErrors.assignedTo = formData.assignedTo
      ? ""
      : "Assigned To is required.";

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Map form state to PHP API format ONLY
      const submissionData = {
        client_name: formData.name,
        phone: formData.phone || "",
        email: formData.email || "",
        company: formData.company || "",
        source: formData.source || "Website",
        status: formData.status || "New",
        assigned_to: formData.assignedTo || "",
        remarks: formData.remarks || "",
      };

      // Include id for edit operations
      if (mode === "edit" && formData.id) {
        submissionData.id = formData.id;
      }

      console.log("📮 LeadForm submitting:", submissionData);
      onSave(submissionData);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid #f1f5f9",
          px: { xs: 2.5, md: 4 },
          py: 2.5,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#0f172a",
        }}
      >
        {mode === "add" ? "Add New Lead" : "Edit Lead Details"}
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Client Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Client Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Company */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company || ""}
                onChange={handleChange}
                error={!!errors.company}
                helperText={errors.company}
                required
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            {/* Phone */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  label="Status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Source */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!errors.source}>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={formData.source || ""}
                  onChange={handleChange}
                  label="Source"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assign */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!errors.assignedTo}>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={handleChange}
                  label="Assign To"
                >
                  {users.length === 0 ? (
                    <MenuItem disabled>No users found</MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.user_guid} value={user.user_guid}>
                        {user.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Remarks */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                multiline
                rows={4}
                value={formData.remarks || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Action Buttons */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          pt: 2,
          borderTop: "1px solid #e2e8f0",
          padding: "16px 24px",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            height: 44,
            px: 3,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            color: "#64748b",
            borderColor: "#cbd5e1",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              borderColor: "#94a3b8",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            height: 44,
            px: 4,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
            "&:hover": {
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)",
            },
          }}
        >
          {mode === "add" ? "Add Lead" : "Save Changes"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default LeadForm;
