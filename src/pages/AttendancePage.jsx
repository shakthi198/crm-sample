import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Avatar,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as HoursIcon,
  Percent as AvailabilityIcon,
  CheckCircleOutline as CheckedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import apiEndpoints from "../apiconfig";

const API_URL = apiEndpoints.attendance;

const token = localStorage.getItem("token");

const AttendancePage = () => {
  // 2. INITIALIZE WITH EMPTY DATA
  const [attendanceList, setAttendanceList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [worksheetOpen, setWorksheetOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [dailySheet, setDailySheet] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [editFormData, setEditFormData] = useState({
    attendance_guid: null,
    name: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "",
  });

  // 3. GENERATE DATE OPTIONS (TODAY + PAST 3 DAYS)
  const dateOptions = useMemo(() => {
    return [0, 1, 2, 3].map((daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split("T")[0];
    });
  }, []);

  const fetchData = async () => {
    try {
      const organizationGuid = localStorage.getItem("organization_guid");
      const response = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(organizationGuid
            ? { "Organization-Guid": organizationGuid }
            : {}),
        },
      });

      const data = await response.json();

      if (data.success) {
        const normalizedAttendance = (data.attendance || []).map((a) => ({
          ...a,
          name: a.employee_name,
          checkIn: a.check_in,
          checkOut: a.check_out,
        }));
        setAttendanceList(normalizedAttendance);
        setEmployeeList(data.employees || []);
      }
    } catch (error) {
      console.warn("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Initial load
    fetchData();

    // Function to run when organization changes
    const handleOrgChange = () => {
      fetchData();
    };

    // Listen for global event
    window.addEventListener("organizationChanged", handleOrgChange);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener("organizationChanged", handleOrgChange);
    };
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = ["Employee Name,Date,Check In,Check Out,Status"].join(",");
    const rows = data
      .map(
        (row) =>
          `${row.name || row.employee_name},${row.date},${row.checkIn || row.check_in},${row.checkOut || row.check_out},${row.status}`,
      )
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateMetrics = (list) => {
    if (!list || list.length === 0)
      return {
        presentCount: 0,
        absentCount: 0,
        totalHours: "0.0",
        percentage: 0,
      };
    const presentCount = list.filter((a) => a.status === "Present").length;
    const totalHours = list.reduce((acc, curr) => {
      if (
        !curr.checkIn ||
        !curr.checkOut ||
        curr.checkIn === "-" ||
        curr.checkOut === "-"
      )
        return acc;
      const [inH, inM] = curr.checkIn.split(":").map(Number);
      const [outH, outM] = curr.checkOut.split(":").map(Number);
      const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
      return acc + (diff > 0 ? diff : 0);
    }, 0);
    return {
      presentCount,
      absentCount: list.filter((a) => a.status === "Absent").length,
      totalHours: totalHours.toFixed(1),
      percentage:
        list.length > 0 ? Math.round((presentCount / list.length) * 100) : 0,
    };
  };

  const globalAnalytics = useMemo(
    () => calculateMetrics(attendanceList),
    [attendanceList],
  );

  const handleOpenWorksheet = () => {
    const unmarkedEmployees = employeeList.filter(
      (emp) =>
        !attendanceList.some(
          (a) =>
            a.employee_guid === emp.employee_guid && a.date === selectedDate,
        ),
    );
    const initialSheet = unmarkedEmployees.map((emp) => ({
      ...emp,
      date: selectedDate,
      checkIn: "",
      checkOut: "",
      status: "",
      remarks: "",
    }));
    setDailySheet(initialSheet);
    setSelectedIds([]);
    setWorksheetOpen(true);
  };

  const updateWorksheetRow = (id, field, value) => {
    setDailySheet((prev) =>
      prev.map((row) =>
        row.employee_guid === id ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleSaveWorksheet = async () => {
    const recordsToSave = dailySheet.filter((row) =>
      selectedIds.includes(row.employee_guid),
    );

    // 1️⃣ Check if any employee selected
    if (recordsToSave.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    // 2️⃣ Validate each selected row
    for (let row of recordsToSave) {
      if (!row.status) {
        alert(`Please select status for ${row.name}`);
        return;
      }

      // If Present → check time validation
      if (row.status === "Present") {
        if (!row.checkIn || !row.checkOut) {
          alert(`Please enter check-in and check-out time for ${row.name}`);
          return;
        }

        if (row.checkOut <= row.checkIn) {
          alert(
            `Check-out time must be greater than check-in time for ${row.name}`,
          );
          return;
        }
      }

      // If Absent → enforce "-"
      if (row.status === "Absent") {
        row.checkIn = "-";
        row.checkOut = "-";
      }
    }

    // 3️⃣ If all valid → send to backend
    try {
      const token = localStorage.getItem("token");
      const organizationGuid = localStorage.getItem("organization_guid");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(organizationGuid && { "Organization-Guid": organizationGuid }),
        },
        body: JSON.stringify({
          bulk: true,
          records: recordsToSave,
        }),
      });

      const data = await res.json();

      if (data.success) {
        fetchData();
        setWorksheetOpen(false);
      } else {
        alert(data.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Network error occurred.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const organizationGuid = localStorage.getItem("organization_guid");
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(organizationGuid
            ? { "Organization-Guid": organizationGuid }
            : {}),
        },
        body: JSON.stringify(editFormData),
      });
      fetchData();
      setEditModalOpen(false);
    } catch (e) {
      setEditModalOpen(false);
    }
  };

  const handleDelete = async (guid) => {
    if (window.confirm("Delete record?")) {
      try {
        const organizationGuid = localStorage.getItem("organization_guid");
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(organizationGuid
              ? { "Organization-Guid": organizationGuid }
              : {}),
          },
          body: JSON.stringify({ attendance_guid: guid }),
        });

        const data = await res.json();
        if (data.success) {
          fetchData();
        } else {
          alert("Failed to delete: " + data.message);
        }
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <PageContainer
      title="Attendance"
      action={
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() =>
              downloadCSV(attendanceList, "Full_Attendance_Report")
            }
          >
            Full Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenWorksheet}
          >
            Mark Attendance
          </Button>
        </Stack>
      }
    >
      {/* OVERSIZED FIXED-SIZE CARDS MATCHING SCREENSHOT */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            title: "PRESENT",
            val: globalAnalytics.presentCount,
            icon: <PresentIcon />,
            color: "#2e7d32",
          },
          {
            title: "ABSENT",
            val: globalAnalytics.absentCount,
            icon: <AbsentIcon />,
            color: "#d32f2f",
          },
          {
            title: "WORK HOURS",
            val: `${globalAnalytics.totalHours}h`,
            icon: <HoursIcon />,
            color: "#3d52a0",
          },
          {
            title: "AVAILABILITY",
            val: `${globalAnalytics.percentage}%`,
            icon: <AvailabilityIcon />,
            color: "#1976d2",
          },
        ].map((card, i) => (
          <Card
            key={i}
            sx={{
              flex: 1,
              minWidth: 250,
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
                  bgcolor: `${card.color}10`,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.cloneElement(card.icon, { sx: { fontSize: 30 } })}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  {card.title}
                </Typography>

                <Typography variant="h4" fontWeight={900}>
                  {card.val}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <DataTableCard>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>In/Out</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.attendance_guid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#3d52a0", fontWeight: 800 }}>
                          {row.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {row.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      {row.checkIn} - {row.checkOut}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        variant="outlined"
                        color={row.status === "Present" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton
                          color="info"
                          onClick={() => {
                            const history = attendanceList.filter(
                              (a) => a.employee_guid === row.employee_guid,
                            );
                            setSelectedEmp({
                              ...row,
                              metrics: calculateMetrics(history),
                              history,
                            });
                            setViewModalOpen(true);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setEditFormData(row);
                            setEditModalOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(row.attendance_guid)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={attendanceList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </DataTableCard>

      {/* WORKSHEET MODAL - FIXED STICKY HEADERS */}
      <Dialog
        open={worksheetOpen}
        onClose={() => setWorksheetOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "28px" } }}
      >
        <DialogTitle
          sx={{
            p: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Worksheet
            </Typography>
            <TextField
              select
              size="small"
              value={selectedDate}
              label="Attendance Date"
              sx={{ mt: 1, minWidth: 160 }}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                const unmarkedEmployees = employeeList.filter(
                  (emp) =>
                    !attendanceList.some(
                      (a) =>
                        a.employee_guid === emp.employee_guid &&
                        a.date === newDate,
                    ),
                );
                setDailySheet(
                  unmarkedEmployees.map((r) => ({
                    ...r,
                    date: newDate,
                    checkIn: "",
                    checkOut: "",
                    status: "",
                    remarks: "",
                  })),
                );
                setSelectedIds([]);
              }}
            >
              {dateOptions.map((date) => (
                <MenuItem key={date} value={date}>
                  {date === todayDate ? `${date} (Today)` : date}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <IconButton
            onClick={() => setWorksheetOpen(false)}
            sx={{ bgcolor: "#f1f5f9" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box
          sx={{
            px: 4,
            py: 2,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2" fontWeight={800} mr="auto">
              BULK ACTIONS ({selectedIds.length})
            </Typography>

            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<PresentIcon />}
              onClick={() =>
                setDailySheet((prev) =>
                  prev.map((row) =>
                    selectedIds.includes(row.employee_guid)
                      ? {
                          ...row,
                          status: "Present",
                          checkIn: "09:00",
                          checkOut: "18:00",
                        }
                      : row,
                  ),
                )
              }
            >
              Mark Present
            </Button>

            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<AbsentIcon />}
              onClick={() =>
                setDailySheet((prev) =>
                  prev.map((row) =>
                    selectedIds.includes(row.employee_guid)
                      ? {
                          ...row,
                          status: "Absent",
                          checkIn: "-",
                          checkOut: "-",
                        }
                      : row,
                  ),
                )
              }
            >
              Mark Absent
            </Button>
          </Stack>
        </Box>
        <DialogContent
          sx={{
            px: 0,
            maxHeight: "65vh",
            overflowY: "auto",
          }}
        >
          {/* TABLE WITH STICKY HEADER */}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      pl: 4,
                      bgcolor: "#f8fafc",
                      fontWeight: 900,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <Checkbox
                      checked={
                        selectedIds.length === dailySheet.length &&
                        dailySheet.length > 0
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? dailySheet.map((d) => d.employee_guid)
                            : [],
                        )
                      }
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      fontWeight: 900,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    EMPLOYEE
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      fontWeight: 900,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    LOG HOURS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      bgcolor: "#f8fafc",
                      fontWeight: 900,
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    STATUS LABEL
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailySheet.map((row) => {
                  const isSelected = selectedIds.includes(row.employee_guid);

                  return (
                    <TableRow
                      key={row.employee_guid}
                      hover
                      selected={isSelected}
                      onClick={() =>
                        setSelectedIds((prev) =>
                          isSelected
                            ? prev.filter((i) => i !== row.employee_guid)
                            : [...prev, row.employee_guid],
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 4 }}>
                        <Checkbox checked={isSelected} />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800}>{row.name}</Typography>
                      </TableCell>

                      <TableCell>
                        {isSelected && row.status && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TextField
                              type="time"
                              size="small"
                              variant="standard"
                              value={row.checkIn}
                              onChange={(e) =>
                                updateWorksheetRow(
                                  row.employee_guid,
                                  "checkIn",
                                  e.target.value,
                                )
                              }
                              disabled={row.status === "Absent"}
                              sx={{ width: 85 }}
                            />
                            <Typography variant="caption">—</Typography>
                            <TextField
                              type="time"
                              size="small"
                              variant="standard"
                              value={row.checkOut}
                              onChange={(e) =>
                                updateWorksheetRow(
                                  row.employee_guid,
                                  "checkOut",
                                  e.target.value,
                                )
                              }
                              disabled={row.status === "Absent"}
                              sx={{ width: 85 }}
                            />
                          </Stack>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isSelected && row.status && (
                          <Chip
                            label={row.status.toUpperCase()}
                            color={
                              row.status === "Present" ? "success" : "error"
                            }
                            size="small"
                            sx={{ fontWeight: 900, minWidth: 100 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 4 }}>
          <Button
            variant="contained"
            onClick={handleSaveWorksheet}
            sx={{ borderRadius: "16px", fontWeight: 900 }}
          >
            Save records
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW MODAL WITH PERSON DOWNLOAD */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            {selectedEmp?.name}'s Summary
          </Typography>
          <IconButton onClick={() => setViewModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={2} sx={{ mb: 4 }} textAlign="center">
            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#f8fafc",
                  p: 2,
                  boxShadow: "none",
                  border: "1px solid #eef2f6",
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  HOURS
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  {selectedEmp?.metrics?.totalHours}h
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#f8fafc",
                  p: 2,
                  boxShadow: "none",
                  border: "1px solid #eef2f6",
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  PRESENT
                </Typography>
                <Typography variant="h5" fontWeight={900} color="success.main">
                  {selectedEmp?.metrics?.presentCount}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: "#f8fafc",
                  p: 2,
                  boxShadow: "none",
                  border: "1px solid #eef2f6",
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  PERCENT
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  {selectedEmp?.metrics?.percentage}%
                </Typography>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="subtitle2" fontWeight={800} gutterBottom>
            Last 3 Days Activity
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid #eef2f6", borderRadius: "12px" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedEmp?.history
                  ?.sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 3)
                  .map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>
                        {h.checkIn} - {h.checkOut}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={h.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mt: 3, borderRadius: "12px", fontWeight: 800 }}
            onClick={() =>
              downloadCSV(selectedEmp.history, `${selectedEmp.name}_Summary`)
            }
          >
            Download Person Summary
          </Button>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Attendance</DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            <TextField
              type="time"
              label="In"
              value={editFormData.checkIn}
              onChange={(e) =>
                setEditFormData({ ...editFormData, checkIn: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="time"
              label="Out"
              value={editFormData.checkOut}
              onChange={(e) =>
                setEditFormData({ ...editFormData, checkOut: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Status"
              value={editFormData.status}
              onChange={(e) =>
                setEditFormData({ ...editFormData, status: e.target.value })
              }
              fullWidth
            >
              {["Present", "Absent"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AttendancePage;
