import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    InputAdornment,
    IconButton,
    Chip,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Person as PersonIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    CurrencyRupee as MoneyIcon,
    MoneyOff as DeductionIcon,
    AddCircle as AllowanceIcon,
    Close as CloseIcon,
    Calculate as CalculateIcon,
    Badge as BadgeIcon,
    Download as DownloadIcon,
    EventAvailable as AttendanceIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
// import { jsPDF } from "jspdf";

// Card wrapper for inputs - Matches UserFormModal
const InputCard = ({ label, icon, children, theme }) => (
    <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: '0 4px 12px rgba(61, 82, 160, 0.08)'
        },
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                p: 0.5,
                borderRadius: '6px'
            }}>
                {React.cloneElement(icon, { fontSize: 'small' })}
            </Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Montserrat' }}>
                {label}
            </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
            {children}
        </Box>
    </Box>
);

const ViewPayrollModal = ({ open, onClose, data }) => {
    const theme = useTheme();

    if (!data) return null;

    // const handleDownloadPayslip = () => {
    //     const doc = new jsPDF();

    //     // Company Header (Mock)
    //     doc.setFontSize(22);
    //     doc.setTextColor(40, 40, 40);
    //     doc.text("CRM Company Ltd.", 105, 20, { align: "center" });
    //     doc.setFontSize(12);
    //     doc.setTextColor(100, 100, 100);
    //     doc.text("123 Business Street, Tech City, TC 90210", 105, 28, { align: "center" });

    //     doc.setLineWidth(0.5);
    //     doc.line(20, 35, 190, 35);

    //     // Title
    //     doc.setFontSize(16);
    //     doc.setTextColor(0, 0, 0);
    //     doc.text("PAYSLIP", 105, 45, { align: "center" });
    //     doc.setFontSize(12);
    //     doc.text(`Period: ${data.month} ${data.year}`, 105, 52, { align: "center" });

    //     // Employee Details Box
    //     doc.setDrawColor(200, 200, 200);
    //     doc.setFillColor(245, 245, 245);
    //     doc.rect(20, 60, 170, 35, 'F');

    //     doc.setFontSize(10);
    //     doc.setTextColor(50, 50, 50);
    //     doc.text(`Employee Name: ${data.name}`, 30, 70);
    //     doc.text(`Employee ID: ${data.id}`, 120, 70);
    //     doc.text(`Designation: ${data.role}`, 30, 80);
    //     doc.text(`Payment Date: ${data.paymentDate || 'Pending'}`, 120, 80);
    //     doc.text(`Status: ${data.status}`, 30, 90);

    //     // Salary Breakdown Table Header
    //     let yPos = 110;
    //     doc.setFillColor(63, 81, 181); // Primary Color
    //     doc.rect(20, 105, 170, 10, 'F');
    //     doc.setTextColor(255, 255, 255);
    //     doc.setFont(undefined, 'bold');
    //     doc.text("Description", 30, 111);
    //     doc.text("Amount (INR)", 160, 111, { align: "right" });

    //     // Table Rows
    //     doc.setTextColor(0, 0, 0);
    //     doc.setFont(undefined, 'normal');

    //     const addRow = (label, value) => {
    //         yPos += 10;
    //         doc.text(label, 30, yPos);
    //         doc.text(`₹${Number(value).toLocaleString()}`, 160, yPos, { align: "right" });
    //         doc.setDrawColor(230, 230, 230);
    //         doc.line(20, yPos + 3, 190, yPos + 3);
    //     };

    //     addRow("Basic Salary", data.basicSalary);
    //     addRow("Allowances", data.allowances);
    //     addRow("Deductions", data.deductions);

    //     // Logic for Gross Salary (Basic + Allowances)
    //     // Ideally should be passed, but calculating for display consistency if needed
    //     // Assuming data.grossSalary is available as per previous logic
    //     yPos += 5;
    //     // addRow("Gross Salary", data.grossSalary); // Optional if redundant

    //     // Net Salary Box
    //     yPos += 20;
    //     doc.setFillColor(240, 248, 255); // Light Blue
    //     doc.rect(100, yPos - 8, 90, 15, 'F');
    //     doc.setFont(undefined, 'bold');
    //     doc.setFontSize(12);
    //     doc.setTextColor(0, 0, 0);
    //     doc.text("Net Salary Paid", 110, yPos + 2);
    //     doc.setTextColor(63, 81, 181);
    //     doc.text(`₹${Number(data.netSalary).toLocaleString()}`, 180, yPos + 2, { align: "right" });

    //     // Footer
    //     doc.setFontSize(8);
    //     doc.setTextColor(150, 150, 150);
    //     doc.text("This is a computer-generated document and does not require a signature.", 105, 280, { align: "center" });

    //     doc.save(`Payslip_${data.name}_${data.month}_${data.year}.pdf`);
    // };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            width: "100%",
            maxWidth: { xs: "100%", sm: "840px" },
            m: { xs: 1, sm: 2 },
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1.5, sm: 0 },
            px: { xs: 2, sm: 4 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ fontFamily: "Montserrat", color: "#0f172a" }}
            >
              Payroll Details
            </Typography>
            <Chip
              label={data.status}
              color={data.status === "Paid" ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: "action.hover" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content using Grid Layout - "View as Form" style */}
        <DialogContent
          dividers
          sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f8f9fc" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr",
              },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* Row 1: Employee & ID */}
            <InputCard
              label="Employee Name"
              icon={<PersonIcon />}
              theme={theme}
            >
              <TextField
                fullWidth
                value={data.name || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            {/* <InputCard label="Employee ID" icon={<BadgeIcon />} theme={theme}>
                        <TextField
                            fullWidth
                            value={data.id || ''}
                            InputProps={{ readOnly: true }}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px', bgcolor: 'action.hover' } }}
                        />
                    </InputCard> */}

            {/* Row 2: Period & Role */}
            <InputCard label="Period" icon={<CalendarIcon />} theme={theme}>
              <TextField
                fullWidth
                value={`${data.month} ${data.year}`}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            <InputCard label="Role" icon={<WorkIcon />} theme={theme}>
              <TextField
                fullWidth
                value={data.role || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            {/* Row 3: Attendance */}
            {/* <InputCard
              label="Attendance"
              icon={<AttendanceIcon />}
              theme={theme}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Chip
                  size="small"
                  icon={<TimeIcon />}
                  label={`${data.presentDays} Days Present`}
                  sx={{ flex: 1 }}
                />
                <Chip
                  size="small"
                  label={`${data.attendancePercentage}%`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </InputCard> */}

            <InputCard
              label="Payment Date"
              icon={<CalendarIcon />}
              theme={theme}
            >
              <TextField
                fullWidth
                value={data.paymentDate || "Pending"}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            {/* Financials Row */}
            <InputCard label="Basic Salary" icon={<MoneyIcon />} theme={theme}>
              <TextField
                fullWidth
                value={data.basicSalary}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            <InputCard
              label="Allowances"
              icon={<AllowanceIcon />}
              theme={theme}
            >
              <TextField
                fullWidth
                value={data.allowances}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            <InputCard
              label="Deductions"
              icon={<DeductionIcon />}
              theme={theme}
            >
              <TextField
                fullWidth
                value={data.deductions}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "48px",
                    bgcolor: "action.hover",
                  },
                }}
              />
            </InputCard>

            {/* Summary / Calculation Box */}
            <Box
              sx={{
                gridColumn: { xs: "1", sm: "1 / -1" },
                mt: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: { xs: 2, sm: 0 },
                  p: { xs: 2.5, sm: 3 },
                  bgcolor: theme.palette.primary.main,
                  borderRadius: "16px",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(61, 82, 160, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                    }}
                  >
                    <CalculateIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.8,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Net Salary Paid
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ fontFamily: "Montserrat" }}
                    >
                      ₹{Number(data.netSalary).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Gross Salary
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ₹{Number(data.grossSalary).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            px: { xs: 2, sm: 4 },
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 1 },
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{
                 width: { xs: '100%', sm: 'auto' },
    height: 44,
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
              px: 3,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "divider",
              },
            }}
          >
            Close
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="contained"
            // onClick={handleDownloadPayslip}
            disableElevation
            sx={{
              width: { xs: '100%', sm: 'auto' },
    height: 44,
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
              px: 4,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: theme.palette.secondary.main,
              "&:hover": { bgcolor: theme.palette.secondary.dark },
            }}
          >
            Download Payslip
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default ViewPayrollModal;
