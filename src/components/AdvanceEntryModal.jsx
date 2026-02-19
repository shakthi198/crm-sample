import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { useSnackbar } from "../context/SnackbarContext";
import apiEndpoints from "../apiconfig";

/* ===============================
   INPUT CARD
================================ */

const InputCard = ({ label, icon, children, theme }) => (
  <Box
    sx={{
      p: 2,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "12px",
      bgcolor: "background.paper",
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      "&:hover": {
        borderColor: theme.palette.primary.main,
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          p: 0.5,
          borderRadius: "6px",
        }}
      >
        {icon}
      </Box>

      <Typography variant="caption" fontWeight={600}>
        {label}
      </Typography>
    </Box>

    {children}
  </Box>
);

/* ===============================
   MAIN COMPONENT
================================ */

const AdvanceEntryModal = ({ open, onClose, onSave }) => {
  const theme = useTheme();

  const [employees, setEmployees] = useState([]);

  const [selectedGuid, setSelectedGuid] = useState("");

  const [employee, setEmployee] = useState(null);

  const [employeeRole, setEmployeeRole] = useState("");

  const [advanceAmount, setAdvanceAmount] = useState("");

  const [balance, setBalance] = useState(0);

  const [advanceTaken, setAdvanceTaken] = useState(0);

  const [totalSalary, setTotalSalary] = useState(0);

  const { showSnackbar } = useSnackbar();

  /* ===============================
       FETCH EMPLOYEES
    =============================== */

  useEffect(() => {
    if (open) {
      fetchEmployees();

      resetForm();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
        const token = localStorage.getItem("token");
        const organizationGuid = localStorage.getItem("organization_guid");
      const res = await axios.get(
        apiEndpoints.usersdropdown,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Organization-Guid": organizationGuid,
          },
        }
      );

      if (res.data.success) {
        const formatted = res.data.data.map((emp) => ({
          guid: emp.user_guid,
          name: emp.name,
        }));

        setEmployees(formatted);
      }
    } catch {
      showSnackbar("Failed to load employees", "error");
    }
  };

  /* ===============================
       FETCH SALARY INFO
    =============================== */

  const fetchSalaryInfo = async (guid) => {
    if (!guid) return;

    try {
    const token = localStorage.getItem("token");
    const organizationGuid = localStorage.getItem("organization_guid");
      const res = await axios.get(
        `${apiEndpoints.getSalaryStatus}?employee_guid=${guid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Organization-Guid": organizationGuid,
          },
        }
      );

      if (res.data.status === "success") {
        const salary = res.data.data;

        setTotalSalary(Number(salary.totalSalary) || 0);

        setAdvanceTaken(Number(salary.advanceTaken) || 0);

        setBalance(Number(salary.balance) || 0);

        setEmployeeRole(salary.role || "");
      } else {
        setTotalSalary(0);
        setAdvanceTaken(0);
        setBalance(0);
        setEmployeeRole("");
      }
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to fetch salary info", "error");
    }
  };

  /* ===============================
       RESET
    =============================== */

  const resetForm = () => {
    setSelectedGuid("");

    setEmployee(null);

    setAdvanceAmount("");

    setBalance(0);

    setAdvanceTaken(0);

    setTotalSalary(0);

    setEmployeeRole("");
  };

  /* ===============================
       HANDLE EMPLOYEE SELECT
    =============================== */

  const handleEmployeeChange = (e) => {
    const guid = e.target.value;

    setSelectedGuid(guid);

    const emp = employees.find((x) => x.guid === guid);

    setEmployee(emp);

    fetchSalaryInfo(guid);
  };

  /* ===============================
       SAVE ADVANCE
    =============================== */

  const handleSave = async () => {
    if (!selectedGuid || !advanceAmount) {
      showSnackbar("Enter advance amount", "warning");

      return;
    }

    if (advanceAmount > balance) {
      showSnackbar("Advance exceeds balance", "error");

      return;
    }

    try {
      const payload = {
        employee_guid: selectedGuid,

        advance_amount: Number(advanceAmount),

        balance_after: Number(newBalance),
      };

      const user = JSON.parse(localStorage.getItem("user"));
      const organizationGuid = localStorage.getItem("organization_guid");
      let token = localStorage.getItem("token");

      const res = await axios.post(apiEndpoints.addAdvanceEntry, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Organization-Guid": organizationGuid,
        },
      });

      if (res.data.status === "success") {
        showSnackbar("Advance saved successfully", "success");

        onSave && onSave();

        onClose();
      } else {
        showSnackbar(res.data.message, "error");
      }
    } catch (error) {
      showSnackbar("Save failed", "error");
    }
  };

  const newBalance = balance - (Number(advanceAmount) || 0);

  /* ===============================
       UI
    =============================== */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Advance Salary Entry
        <IconButton onClick={onClose} sx={{ float: "right" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <InputCard
            label="Select Employee"
            icon={<PersonIcon />}
            theme={theme}
          >
            <TextField
              select
              fullWidth
              value={selectedGuid}
              onChange={handleEmployeeChange}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.guid} value={emp.guid}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
          </InputCard>

          <InputCard label="Role" icon={<BadgeIcon />} theme={theme}>
            <TextField
              fullWidth
              value={employeeRole}
              InputProps={{ readOnly: true }}
              placeholder="Employee Role"
            />
          </InputCard>

          <InputCard label="Total Salary" icon={<WorkIcon />} theme={theme}>
            <TextField
              fullWidth
              value={`₹${totalSalary}`}
              InputProps={{ readOnly: true }}
            />
          </InputCard>

          <InputCard label="Advance Taken" icon={<WalletIcon />} theme={theme}>
            <TextField
              fullWidth
              value={`₹${advanceTaken}`}
              InputProps={{ readOnly: true }}
            />
          </InputCard>

          <InputCard label="Balance" icon={<WalletIcon />} theme={theme}>
            <TextField
              fullWidth
              value={`₹${balance}`}
              InputProps={{ readOnly: true }}
            />
          </InputCard>

          <InputCard label="Enter Advance" icon={<PaymentIcon />} theme={theme}>
            <TextField
              fullWidth
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
          </InputCard>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "#3D52A0",
            color: "white",
            borderRadius: 2,
          }}
        >
          New Balance : ₹{newBalance}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={handleSave}>
          Save Advance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvanceEntryModal;
