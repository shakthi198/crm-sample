import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import apiEndpoints from "../apiconfig";
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TablePagination,
  useTheme,
  useMediaQuery,
  LinearProgress,
  IconButton
} from "@mui/material";
import {
  Assessment as ReportIcon,
  FileDownload as DownloadIcon,
  Search as SearchIcon,
  AttachMoney as PayrollIcon,
  AccessTime as AttendanceIcon,
  People,
  CheckCircle,
  Cancel,
  Percent,
  History,
  Visibility as ViewIcon // Ensuring ViewIcon is available
} from "@mui/icons-material";
import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- MOCK DATA ---
// --- MOCK DATA REMOVED ---

const ReportsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [payrollData, setPayrollData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0); // 0: Payroll, 1: Attendance
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    return { start, end };
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchQuery("");
  };

  // --- DATA FETCHING ---
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const type = activeTab === 0 ? 'payroll' : 'attendance';
      const token = localStorage.getItem("token");
      const organizationGuid = localStorage.getItem("organization_guid"); // Fetch org guid

      const response = await axios.get(`${apiEndpoints.reports}`, {
        params: {
          type,
          search: searchQuery,
          start: dateRange.start,
          end: dateRange.end
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Organization-Guid": organizationGuid
        }
      });

      if (response.data.success) {
        if (activeTab === 0) {
          setPayrollData(response.data.data);
        } else {
          setAttendanceData(response.data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const handleOrgChange = () => {
      fetchReports();
    };

    window.addEventListener("organizationChanged", handleOrgChange);

    return () => {
      window.removeEventListener("organizationChanged", handleOrgChange);
    };
  }, [activeTab, searchQuery, dateRange.start, dateRange.end]);

  // --- DATA FILTERING ---
  const currentData = activeTab === 0 ? payrollData : attendanceData;

  // Client-side filtering is now redundant as we filter on backend, 
  // but we can keep it for immediate feedback if needed, 
  // OR just use the backend data directly since backend handles search.
  // For now, let's just use currentData as filteredData since we are fetching based on search query.
  const filteredData = currentData;

  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    if (activeTab === 0) {
      // Payroll Metrics
      const totalEmployees = payrollData.length;
      const totalSalary = payrollData.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0);
      const paidCount = payrollData.filter(i => i.status === "Paid").length;
      const pendingCount = payrollData.filter(i => i.status === "Pending" || i.status === "Processing").length;

      // Matching the Image: Total Employees, Salary Paid, Salary Pending, Total Salary
      return [
        { label: "Total Employees", value: totalEmployees, icon: <People />, color: "#10b981", bgcolor: "#d1fae5" },
        { label: "Salary Paid", value: paidCount, icon: <CheckCircle />, color: "#3b82f6", bgcolor: "#dbeafe" },
        { label: "Salary Pending", value: pendingCount, icon: <AttendanceIcon />, color: "#f59e0b", bgcolor: "#fef3c7" },
        { label: "Total Salary", value: `₹${totalSalary.toLocaleString()}`, icon: <PayrollIcon />, color: "#6366f1", bgcolor: "#e0e7ff" },
      ];
    } else {
      // Attendance Metrics
      const totalPresent = attendanceData.filter(i => i.status === "Present").length;
      const absent = attendanceData.filter(i => i.status === "Absent").length;
      const availability = attendanceData.length > 0
        ? Math.round((totalPresent / attendanceData.length) * 100)
        : 0;

      return [
        { label: "Present Today", value: totalPresent, icon: <People />, color: "#3d52a0" },
        { label: "Absent", value: absent, icon: <Cancel />, color: "#d32f2f" },
        { label: "Availability", value: `${availability}%`, icon: <Percent />, color: "#1976d2" },
      ];
    }
  }, [activeTab, payrollData, attendanceData]);

  const attendanceTrends = useMemo(() => {
    if (activeTab !== 1 || !attendanceData.length) return [];

    const grouped = attendanceData.reduce((acc, curr) => {
      const date = curr.attendance_date;
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, late: 0 };
      }
      if (curr.status === 'Present') acc[date].present++;
      else if (curr.status === 'Absent') acc[date].absent++;
      else if (curr.status === 'Late') acc[date].late++;
      return acc;
    }, {});

    return Object.keys(grouped).sort().map(date => {
      const d = new Date(date);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date,
        ...grouped[date]
      };
    });
  }, [activeTab, attendanceData]);

  // --- EXPORT HANDLERS ---
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 0 ? "Payroll" : "Attendance");
    XLSX.writeFile(workbook, `Report_${activeTab === 0 ? "Payroll" : "Attendance"}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = activeTab === 0
      ? ["ID", "Name", "Role", "Net Pay", "Status"]
      : ["ID", "Name", "Date", "In", "Out", "Status"];

    const rows = filteredData.map(item => activeTab === 0
      ? [item.employee_id, item.name, item.role, `₹${item.net_salary}`, item.status]
      : [item.employee_id, item.name, item.attendance_date, item.check_in_time, item.check_out_time, item.status]
    );

    autoTable(doc, { head: [headers], body: rows });
    doc.save(`Report_${activeTab === 0 ? "Payroll" : "Attendance"}.pdf`);
  };

  const statusColors = (status) => {
    switch (status) {
      case "Paid":
      case "Present":
        return { bgcolor: "#dcfce7", color: "#166534" };
      case "Pending":
      case "Processing":
      case "Late":
        return { bgcolor: "#fef3c7", color: "#b45309" };
      case "Absent":
      case "Leave":
        return { bgcolor: "#fee2e2", color: "#991b1b" };
      default:
        return { bgcolor: "#f1f5f9", color: "#64748b" };
    }
  };

  return (
    <PageContainer
      title={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 30, lg: 47 },
            width: "100%",
          }}
        >
          {/* LEFT SIDE - TITLE */}
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Reports & Analytics
            </Typography>
            <Typography color="text.secondary">
              Comprehensive view of Payroll and Attendance metrics
            </Typography>
          </Box>

          {/* RIGHT SIDE - TABS */}
          <Box
            sx={{
              bgcolor: "#F1F5F9",
              borderRadius: "15px",
              p: 0.5,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                minHeight: "auto",
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "12px",
                  minHeight: 40,
                  px: { xs: 1, sm: 2, md: 3 },
                  "&.Mui-selected": {
                    bgcolor: "#fff",
                    color: "#3e2929",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                },
              }}
            >
              <Tab
                icon={<PayrollIcon sx={{ mr: 1, fontSize: 20 }} />}
                iconPosition="start"
                label="Payroll"
              />
              <Tab
                icon={<AttendanceIcon sx={{ mr: 1, fontSize: 20 }} />}
                iconPosition="start"
                label="Attendance"
              />
            </Tabs>
          </Box>
        </Box>
      }
    >
      {/* 3. FILTERS & ACTIONS */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "24px",
          p: 3,
          mb: 4,
          bgcolor: "#ffffff",
        }}
      >
        <Grid
          container
          spacing={8}
          alignItems="center"
        >
          <Grid item xs={12} md={4} sx={{ width: "100%"}}>
            <TextField
              fullWidth
              placeholder="Search by Employee "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "16px",
                  bgcolor: "#f8fafc",
                  "& fieldset": { border: "none" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="date"
                fullWidth
                label="Start Date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
              <Typography color="text.secondary">-</Typography>
              <TextField
                type="date"
                fullWidth
                label="End Date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              sx={{ borderColor: "#3e2929", color: "#3e2929" }}
            >
              Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{
                bgcolor: "#3e2929",
              }}
            >
              PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. SUMMARY CARDS */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {metrics.map((metric, idx) => (
          <Card
            key={idx}
            sx={{
              flex: 1,
              minWidth: 220,
              borderRadius: "16px",
              border: "1px solid #eef2f6",
              boxShadow: "none",
              bgcolor: "#fff",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "12px",
                  bgcolor: metric.bgcolor || `${metric.color}10`, // Use custom bgcolor if available
                  color: metric.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.cloneElement(metric.icon, { sx: { fontSize: 30 } })}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.secondary"
                  sx={{ textTransform: "none", fontSize: "0.875rem" }}
                >
                  {metric.label}
                </Typography>

                <Typography variant="h4" fontWeight={900} color="#1e293b">
                  {metric.value}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* 3. VISUAL ANALYTICS (WIDGETS) */}
      <Grid container spacing={3} mb={4}>
        {activeTab === 0 ? (
          /* PAYROLL WIDGETS */
          <>
            <Grid
              item
              xs={12}
              md={7}
              width={{ xs: "100%", sm: "100%", md: "48%", lg: "31%" }}
            >
              <ChartCard title="Payment Status">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Paid",
                          value: payrollData.filter((p) => p.status === "Paid")
                            .length,
                          fill: "#10b981",
                        },
                        {
                          name: "Pending",
                          value: payrollData.filter(
                            (p) =>
                              p.status === "Pending" ||
                              p.status === "Processing",
                          ).length,
                          fill: "#f59e0b",
                        },
                        {
                          name: "Unpaid",
                          value: payrollData.filter(
                            (p) => p.status === "Unpaid",
                          ).length,
                          fill: "#ef4444",
                        },
                      ]}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={4}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={76}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* 2. Salary Cost by Role */}
            <Grid
              item
              xs={12}
              md={6}
              width={{ xs: "100%", sm: "100%", md: "48%", lg: "32%" }}
            >
              <ChartCard title="Cost by Role">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={Object.values(
                      payrollData.reduce((acc, curr) => {
                        const r = curr.role || "Others";
                        if (!acc[r]) acc[r] = { name: r, value: 0 };
                        acc[r].value += Number(curr.net_salary || 0);
                        return acc;
                      }, {}),
                    )
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 6)}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    barSize={32}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      cursor={{ fill: "#f8fafc", opacity: 0.5 }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#818cf8"
                      radius={[0, 6, 6, 0]}
                      background={{ fill: "#f8fafc", radius: 6 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* 3. Salary Components */}
            <Grid
              item
              xs={12}
              md={6}
              width={{ xs: "100%", sm: "100%", md: "48%", lg: "32%" }}
            >
              <ChartCard title="Salary Components">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={payrollData.slice(0, 7)}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                        angle: -20,
                        textAnchor: "end",
                      }}
                      axisLine={false}
                      interval={0}
                      height={40}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="allowances"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={0.3}
                      fill="#3b82f6"
                    />
                    <Area
                      type="monotone"
                      dataKey="deductions"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fillOpacity={0.3}
                      fill="#ef4444"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </>
        ) : (
          /* ATTENDANCE WIDGETS */
          <>
            <Grid
              item
              xs={12}
              md={6}
              width={{ xs: "100%", sm: "100%", md: "32%" }}
            >
              <ChartCard title="Daily Attendance">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceTrends}
                    barGap={4}
                    margin={{ top: 10, bottom: 0, left: -10, right: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="present"
                      fill="#3d52a0"
                      radius={[4, 4, 4, 4]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="absent"
                      fill="#ef4444"
                      radius={[4, 4, 4, 4]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Weekly Overview (Donut) */}
            <Grid
              item
              xs={12}
              md={6}
              width={{ xs: "100%", sm: "100%", md: "32%" }}
            >
              <ChartCard title="Weekly Stats">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Present",
                          value: attendanceData.filter(
                            (a) => a.status === "Present",
                          ).length,
                          fill: "#3d52a0",
                        },
                        {
                          name: "Absent",
                          value: attendanceData.filter(
                            (a) => a.status === "Absent",
                          ).length,
                          fill: "#ef4444",
                        },
                      ]}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={4}
                    >
                      <Cell fill="#3d52a0" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Late Arrivals (Area with Shadow) */}
            <Grid
              item
              xs={12}
              md={6}
              width={{ xs: "100%", sm: "100%", md: "31.5%" }}
            >
              <ChartCard title="Absenteeism Trend">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={attendanceTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Absentees"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </>
        )}
      </Grid>

      {/* 4. DATA TABLE */}
      <DataTableCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {activeTab === 0 ? (
                  <>
                    <HeaderCell>Employee Name</HeaderCell>
                    <HeaderCell>Role</HeaderCell>
                    <HeaderCell align="center">Status</HeaderCell>
                    <HeaderCell>Paid Date</HeaderCell>
                  </>
                ) : (
                  <>
                    <HeaderCell>Employee</HeaderCell>
                    <HeaderCell>Date</HeaderCell>
                    <HeaderCell>Check In</HeaderCell>
                    <HeaderCell>Check Out</HeaderCell>
                    <HeaderCell>Work Hours</HeaderCell>
                    <HeaderCell align="center">Status</HeaderCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => {
                  const { bgcolor, color } = statusColors(row.status);
                  return (
                    <TableRow key={idx} hover>
                      {activeTab === 0 ? (
                        // Payroll Row
                        <>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "#e0e7ff",
                                  color: "#3d52a0",
                                  fontWeight: "bold",
                                }}
                              >
                                {row.name?.[0]}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                >
                                  {row.name}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.role || "N/A"}
                              size="small"
                              sx={{
                                bgcolor: "#f1f5f9",
                                fontWeight: 600,
                                color: "#475569",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.status}
                              size="small"
                              variant={
                                row.status === "Unpaid" ? "outlined" : "filled"
                              }
                              sx={{
                                bgcolor:
                                  row.status === "Unpaid"
                                    ? "transparent"
                                    : bgcolor,
                                color,
                                fontWeight: 800,
                                borderRadius: "20px",
                                minWidth: 80,
                                border:
                                  row.status === "Unpaid"
                                    ? `1px solid ${color}`
                                    : "none",
                              }}
                            />
                          </TableCell>
                          <TableCell>{row.payment_date}</TableCell>
                        </>
                      ) : (
                        // Attendance Row
                        <>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "#edf2ff",
                                  color: "#3d52a0",
                                  fontWeight: "bold",
                                }}
                              >
                                {row.name?.[0]}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {row.employee_id}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{row.attendance_date}</TableCell>
                          <TableCell>{row.check_in_time}</TableCell>
                          <TableCell>{row.check_out_time}</TableCell>
                          <TableCell>{row.working_hours}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                bgcolor,
                                color,
                                fontWeight: 800,
                                borderRadius: "6px",
                                minWidth: 80,
                              }}
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No records found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </TableContainer>
      </DataTableCard>

      {/* 5. ADVANCE SALARY HISTORY TABLE (Payroll Only via Tab 0) */}
      {activeTab === 0 && (
        <>{/* ADVANCE HISTORY REMOVED/HIDDEN UNTIL API SUPPORT */}</>
      )}
    </PageContainer>
  );
};

// --- HELPER COMPONENTS ---
const HeaderCell = ({ children, align = "left" }) => (
  <TableCell align={align} sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.5px' }}>
    {children}
  </TableCell>
);
const ChartCard = ({ title, children, action }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', height: 420, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0, width: '100%' }}>
      <Typography variant="h6" fontWeight={700} color="#1e293b">{title}</Typography>
      {action}
    </Box>
    <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', minHeight: 0 }}>
      {children}
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 1.5, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', backdropFilter: 'blur(8px)' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.5} display="block">
          {label || payload[0].name}
        </Typography>
        {payload.map((p, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill || p.stroke || p.color }} />
            <Typography variant="body2" fontWeight={800} color="#1e293b">
              {p.value.toLocaleString()} {p.unit || ''}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default ReportsPage;