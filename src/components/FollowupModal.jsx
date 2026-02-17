import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";

const FollowupModal = (props) => {
  const { leads = [], users = [] } = props;
  const { open, onClose, onSave, followup } = props;

  const [formData, setFormData] = useState({
    lead_id: "",
    type: "Call",
    date: "",
    time: "",
    status: "Pending",
    assigned_to: "",
    outcome: "",
  });

  useEffect(() => {
    if (followup) {
      setFormData({
        lead_id: followup.lead_id || "",
        lead_id: followup.lead_guid || "",
        type: followup.type || "Call",
        date: followup.date || "",
        time: followup.time || "",
        status: followup.status || "Pending",
        assigned_to: followup.user_guid || "",
        outcome: followup.outcome || "",
      });
    } else {
      setFormData({
        lead_id: "",
        type: "Call",
        date: new Date().toISOString().split("T")[0],
        time: "",
        status: "Pending",
        assigned_to: "",
        outcome: "",
      });
    }
  }, [followup, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {followup ? "Edit Follow-up" : "New Follow-up"}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box>
            <TextField
              select
              fullWidth
              label="Lead Name"
              name="lead_id"
              value={formData.lead_id}
              onChange={handleChange}
              variant="outlined"
              SelectProps={{
                MenuProps: {
                  PaperProps: { sx: { maxHeight: 300 } },
                },
              }}
            >
              {leads.map((lead) => (
                <MenuItem key={lead.lead_guid} value={lead.lead_guid}>
                  {lead.client_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              <MenuItem value="Call">Call</MenuItem>
              <MenuItem value="Email">Email</MenuItem>
              <MenuItem value="Meeting">Meeting</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Missed">Missed</MenuItem>
              <MenuItem value="Scheduled">Scheduled</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ flex: 1 }}
            />
            <TextField
              fullWidth
              type="time"
              label="Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ flex: 1 }}
            />
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Assigned To"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              variant="outlined"
              SelectProps={{
                MenuProps: {
                  PaperProps: { sx: { maxHeight: 300 } },
                },
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.user_guid} value={user.user_guid}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Outcome / Notes"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowupModal;
