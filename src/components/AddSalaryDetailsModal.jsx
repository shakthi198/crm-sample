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
    IconButton,
    Grid,
    useTheme,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import {
    Person as PersonIcon,
    Work as WorkIcon,
    Badge as BadgeIcon,
    CurrencyRupee as MoneyIcon,
    MoneyOff as DeductionIcon,
    AddCircle as AllowanceIcon,
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
            "&:hover": {
                borderColor: theme.palette.primary.main,
                boxShadow: "0 4px 12px rgba(61,82,160,0.08)"
            }
        }}
    >

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

            <Box
                sx={{
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 0.5,
                    borderRadius: "6px"
                }}
            >
                {icon}
            </Box>

            <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontFamily: "Montserrat" }}
            >
                {label}
            </Typography>

        </Box>

        {children}

    </Box>

);


/* ===============================
   MAIN MODAL
================================ */

const AddSalaryDetailsModal = ({ open, onClose, onSave }) => {

    const theme = useTheme();

    const [employees, setEmployees] = useState([]);

    const [selectedEmployeeGuid, setSelectedEmployeeGuid] = useState("");

    const [employeeDetails, setEmployeeDetails] = useState(null);

    const [basicSalary, setBasicSalary] = useState("");

    const [allowances, setAllowances] = useState("");

    const [deductions, setDeductions] = useState("");

    const [netSalary, setNetSalary] = useState(0);

const { showSnackbar } = useSnackbar();
    /* ===============================
       FETCH USERS FROM PHP
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
            const response = await axios.get(
               `${apiEndpoints.usersdropdown}`,
               {
                   headers: {
                       "Authorization": `Bearer ${token}`,
                       "Organization-Guid": organizationGuid
                   }
               }
            );

            if (response.data.success) {

                const formatted = response.data.data.map(emp => ({

                    guid: emp.user_guid,

                    employee_name: emp.name,

                    role: emp.role

                }));

                setEmployees(formatted);
                console.log("Fetched Employees:", formatted);

            }

        } catch (error) {

            console.error("User fetch error:", error);

            showSnackbar("Failed to load users", "error");

        }

    };


    /* ===============================
       RESET FORM
    =============================== */

    const resetForm = () => {

        setSelectedEmployeeGuid("");

        setEmployeeDetails(null);

        setBasicSalary("");

        setAllowances("");

        setDeductions("");

        setNetSalary(0);

    };


    /* ===============================
       NET SALARY CALCULATION
    =============================== */

    useEffect(() => {

        const basic = Number(basicSalary) || 0;

        const allow = Number(allowances) || 0;

        const deduct = Number(deductions) || 0;

        setNetSalary(basic + allow - deduct);

    }, [basicSalary, allowances, deductions]);


    /* ===============================
       EMPLOYEE SELECT
    =============================== */

    const handleEmployeeChange = (e) => {

        const guid = e.target.value;

        setSelectedEmployeeGuid(guid);

        const emp = employees.find(x => x.guid === guid);

        if (emp) {

            setEmployeeDetails(emp);

        }

        console.log("Selected Employee:", emp);

    };


    /* ===============================
       SAVE SALARY
    =============================== */

    const handleSave = async () => {

        if (!selectedEmployeeGuid) {

           showSnackbar("Please select an employee", "warning");


            return;

        }

        try {

            const payload = {

                employee_guid: selectedEmployeeGuid,

                employee_guid: selectedEmployeeGuid,

                employee_name: employeeDetails.employee_name,

                basic_salary: Number(basicSalary),

                allowances: Number(allowances),

                deductions: Number(deductions),

                net_salary: netSalary

            };


            const user = JSON.parse(localStorage.getItem('user'));
            const organizationGuid = localStorage.getItem('organization_guid');
            let token = localStorage.getItem('token');
       
            const response = await axios.post(

                `${apiEndpoints.addSalaryDetails}`,

                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Organization-Guid': organizationGuid
                    }
                }

            );


            if (response.data.status === "success") {

                showSnackbar("Salary added successfully", "success");

                onSave && onSave();

                onClose();

            }

            else {

                showSnackbar(response.data.message, "error");

            }

        }

        catch (error) {

            console.error(error);

            showSnackbar("Save failed", "error");

        }

    };


    /* ===============================
       UI
    =============================== */

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Add Salary Details
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <InputCard
                label="Select Employee"
                icon={<PersonIcon />}
                theme={theme}
              >
                <TextField
                  select
                  fullWidth
                  value={selectedEmployeeGuid}
                  onChange={handleEmployeeChange}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.guid} value={emp.guid}>
                      {emp.employee_name}
                    </MenuItem>
                  ))}
                </TextField>
              </InputCard>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <InputCard label="Role" icon={<BadgeIcon />} theme={theme}>
                <TextField
                  fullWidth
                  value={employeeDetails?.role || ""}
                  InputProps={{ readOnly: true }}
                  placeholder="Role"
                />
              </InputCard>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <InputCard
                label="Basic Salary"
                icon={<MoneyIcon />}
                theme={theme}
              >
                <TextField
                  fullWidth
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                />
              </InputCard>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <InputCard
                label="Allowances"
                icon={<AllowanceIcon />}
                theme={theme}
              >
                <TextField
                  fullWidth
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(e.target.value)}
                />
              </InputCard>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <InputCard
                label="Deductions"
                icon={<DeductionIcon />}
                theme={theme}
              >
                <TextField
                  fullWidth
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                />
              </InputCard>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              width={{ xs: "100%", sm: "48%", md: "30%" }}
            >
              <Box
                sx={{
                  bgcolor: "#3D52A0",
                  color: "white",
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  textAlign: { xs: "center", sm: "left" },
                  fontSize: { xs: "16px", sm: "18px" },
                }}
              >
                Net Salary : ₹{netSalary}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 1 },
          }}
        >
          <Button onClick={onClose} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Save Salary
          </Button>
        </DialogActions>
      </Dialog>
    );

};


export default AddSalaryDetailsModal;
