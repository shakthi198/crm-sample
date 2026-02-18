import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as FileIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Business as BusinessIcon,
  Assignment as StatusIcon,
} from "@mui/icons-material";

const ClientFormModal = ({
  open,
  onClose,
  onSave,
  leads,
  clients,
  initialData,
  mode,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    lead_guid: "",
    contract_file: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          lead_guid: initialData.lead_guid,
          contract_file: initialData.contract_file || "Financial_Report.pdf",
          start_date: initialData.start_date,
          status: initialData.status || "pending",
        });
      } else {
        setFormData({
          lead_guid: "",
          contract_file: "",
          start_date: new Date().toISOString().split("T")[0],
          status: "pending",
        });
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, contract_file: file }));
    }
  };

  const handleSubmit = () => {
    if (formData.lead_guid && formData.start_date) {
      onSave(formData);
    } else {
      alert("Please select a lead and start date.");
    }
  };

  // Helper to check if lead is taken by another client
  const isLeadTaken = (leadId) => {
    if (mode === "edit" && initialData && initialData.lead_id === leadId) {
      return false;
    }

    return clients.some((c) => String(c.lead_id) === String(leadId));
  };

  // Helper to get display name
  const getFileName = () => {
    if (!formData.contract_file) return "";
    if (formData.contract_file instanceof File)
      return formData.contract_file.name;

    return typeof formData.contract_file === "string"
      ? formData.contract_file.split("/").pop()
      : "";
  };

  const InputCard = ({ label, icon, children, onClick, sx }) => (
    <Box
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper",
        transition: "all 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: "0 4px 12px rgba(61, 82, 160, 0.08)",
        },
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            color: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            p: 0.5,
            borderRadius: "6px",
          }}
        >
          {React.cloneElement(icon, { fontSize: "small" })}
        </Box>
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "100%",
          maxWidth: "840px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ fontFamily: "Montserrat", color: "#0f172a" }}
        >
          {mode === "add" ? "Add New Client" : "Edit Client"}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ bgcolor: "action.hover" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, bgcolor: "#f8f9fc" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gridTemplateRows: { md: "auto" },
            gap: 3,
          }}
        >
          {/* Row 1 Col 1: Select Lead */}
          <InputCard label="Select Lead" icon={<PersonIcon />}>
            <TextField
              select
              fullWidth
              label={mode === "add" ? "Select Lead *" : "Selected Lead"}
              name="lead_guid"
              value={formData.lead_guid}
              onChange={handleChange}
              required
              disabled={mode === "edit"}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <Typography color="text.secondary">
                        Search by name...
                      </Typography>
                    );
                  }
                  const lead = leads.find(
                    (l) => String(l.id) === String(selected),
                  );
                  return lead ? lead.name : selected;
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            >
              {leads.length > 0 ? (
                leads.map((lead) => {
                  return (
                    <MenuItem
                      key={lead.id}
                      value={lead.id}
                      disabled={isLeadTaken(lead.id)}
                    >
                      {lead.name}
                      {isLeadTaken(lead.id) ? " (Already Client)" : ""}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled value="">
                  No available leads
                </MenuItem>
              )}
            </TextField>
          </InputCard>

          {/* Row 1 Col 2: Contract Start Date */}
          <InputCard label="Contract Start Date" icon={<CalendarIcon />}>
            <TextField
              fullWidth
              type="date"
              label="Contract Start Date *"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </InputCard>

          {/* Row 2 Col 1: Status */}
          <InputCard label="Status" icon={<StatusIcon />}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </InputCard>

          {/* Row 2 Col 1: Upload Contract */}
          <InputCard
            label="Upload Contract"
            icon={<CloudUploadIcon />}
            onClick={handleFileClick}
            sx={{
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            }}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "48px",
                px: 1,
              }}
            >
              {formData.contract_file ? (
                <>
                  <FileIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {getFileName()}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Click to replace file
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon
                    color="action"
                    sx={{ fontSize: 40, mb: 1 }}
                  />
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                    Click to upload Contract
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, PNG, or JPG (Max 5MB)
                  </Typography>
                </>
              )}
            </Box>
          </InputCard>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, px: 4, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
            height: 44,
            borderColor: "divider",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disableElevation
          sx={{
            borderRadius: "8px",
            px: 4,
            height: 44,
            bgcolor: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: theme.palette.primary.dark },
          }}
        >
          {mode === "add" ? "Add Client" : "Update Client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientFormModal;