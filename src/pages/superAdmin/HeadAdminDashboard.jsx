import React, { useState, useMemo, useRef, useEffect } from "react";

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import {
  SupervisedUserCircle as UserIcon,
  PersonOff as InactiveIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  NotificationsActive as AlertIcon,
  SystemUpdateAlt as SystemIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import adminUsersData from "../../data/adminUsers.json";
import adminActivitiesData from "../../data/adminActivities.json";
import systemSummaryData from "../../data/systemSummary.json";

const HeadAdminDashboard = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("All");
  const tableRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemSummary, setSystemSummary] = useState({
    systemHealth: "100%",
    activeSessions: 0,
    totalLoginsToday: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("crm_user"));
        if (!user || !user.token) return;

        const response = await fetch(
          "http://localhost/crm/dashboard_superadmin.php",
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setAdmins(data.admins || []);
          setActivities(data.activities || []);
          setSystemSummary(
            data.systemSummary || {
              systemHealth: "100%",
              activeSessions: 0,
              totalLoginsToday: 0,
            },
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calculate Statistics
  const totalAdmins = admins.filter((a) => !a.isDeleted).length;
  const activeAdmins = admins.filter(
    (a) => a.status === "Active" && !a.isDeleted,
  ).length;
  const inactiveAdmins = admins.filter(
    (a) => a.status === "Inactive" && !a.isDeleted,
  ).length;
  const deletedAdmins = admins.filter((a) => a.isDeleted).length;

  // Filter Logic
  const filteredAdmins = admins.filter((admin) => {
    if (filterStatus === "All") return !admin.isDeleted;
    if (filterStatus === "Deleted") return admin.isDeleted;
    if (filterStatus === "Today") {
      if (!admin.lastLogin) return false;
      const today = new Date().toLocaleDateString();
      const loginDate = new Date(admin.lastLogin).toLocaleDateString();
      return today === loginDate && !admin.isDeleted;
    }
    return admin.status === filterStatus && !admin.isDeleted;
  });

  // Pagination Logic
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Chart Data Preparation
  const adminGrowthData = useMemo(() => {
    const data = {};
    admins.forEach((admin) => {
      const date = new Date(admin.createdDate).toLocaleString("default", {
        month: "short",
      });
      data[date] = (data[date] || 0) + 1;
    });
    return Object.keys(data).map((date) => ({
      name: date,
      admins: data[date],
    }));
  }, [admins]);

  const deletedAdminTrendData = useMemo(() => {
    const data = {};
    admins
      .filter((a) => a.isDeleted && a.deletedDate)
      .forEach((admin) => {
        const date = new Date(admin.deletedDate).toLocaleString("default", {
          month: "short",
        });
        data[date] = (data[date] || 0) + 1;
      });
    // Start with 0 and accumulate
    let cumulative = 0;
    return Object.keys(data).map((date) => {
      cumulative += data[date];
      return { name: date, deleted: cumulative };
    });
  }, [admins]);

  // Last Login Logic
  const lastLoginAdmin = useMemo(() => {
    const sorted = [...admins].sort(
      (a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0),
    );
    return sorted[0];
  }, [admins]);

  // Long Inactive Admins (> 1 week)
  const longInactiveAdmins = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return admins.filter(
      (a) => a.lastLogin && new Date(a.lastLogin) < oneWeekAgo && !a.isDeleted,
    );
  }, [admins]);

  // Styled Components for consistent look
  const StatCard = ({ title, value, icon, color, onClick, isSelected }) => (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isSelected ? `2px solid ${color}` : "1px solid transparent",
        boxShadow: isSelected ? `0 8px 24px ${color}40` : theme.shadows[2],
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${color}30`,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              bgcolor: `${color}15`,
              color: color,
              display: "flex",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ p: 4 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#1e293b",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Head Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of system administrators and platform health
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid
          item
          xs={12}
          sm={6}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", sm: "30%", md: "48.5%" },
          }}
        >
          <StatCard
            title="Total Admins"
            value={totalAdmins}
            icon={<UserIcon />}
            color={theme.palette.primary.main}
            onClick={() => {
              setFilterStatus("All");
              scrollToTable();
            }}
            isSelected={filterStatus === "All"}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", sm: "30%", md: "48.5%" },
          }}
        >
          <StatCard
            title="Active Admins"
            value={activeAdmins}
            icon={<TrendingUpIcon />}
            color={theme.palette.success.main}
            onClick={() => {
              setFilterStatus("Active");
              scrollToTable();
            }}
            isSelected={filterStatus === "Active"}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", sm: "30%", md: "48.5%" },
          }}
        >
          <StatCard
            title="Inactive Admins"
            value={inactiveAdmins}
            icon={<InactiveIcon />}
            color={theme.palette.warning.main}
            onClick={() => {
              setFilterStatus("Inactive");
              scrollToTable();
            }}
            isSelected={filterStatus === "Inactive"}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", sm: "30%", md: "48.5%" },
          }}
        >
          <StatCard
            title="Deleted Admins"
            value={deletedAdmins}
            icon={<DeleteIcon />}
            color={theme.palette.error.main}
            onClick={() => {
              setFilterStatus("Deleted");
              scrollToTable();
            }}
            isSelected={filterStatus === "Deleted"}
          />
        </Grid>
        {/* Last Login Card */}
        <Grid
          item
          xs={12}
          sm={6}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", sm: "30%", md: "48.5%" },
          }}
        >
          <Card
            onClick={() => {
              setFilterStatus("Today");
              scrollToTable();
            }}
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border:
                filterStatus === "Today"
                  ? `2px solid ${theme.palette.info.main}`
                  : "1px solid transparent",
              boxShadow:
                filterStatus === "Today"
                  ? `0 8px 24px ${theme.palette.info.main}40`
                  : theme.shadows[2],
              background: "transparent",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 12px 32px ${theme.palette.info.main}30`,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Last Login
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 0.5,
                      fontSize: "1.25rem",
                    }}
                  >
                    {lastLoginAdmin?.name || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastLoginAdmin?.lastLogin
                      ? new Date(lastLoginAdmin.lastLogin).toLocaleString()
                      : "Never"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: `${theme.palette.info.main}15`,
                    color: theme.palette.info.main,
                    display: "flex",
                  }}
                >
                  <AccessTimeIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Admin Growth Trend */}
        <Grid
          item
          xs={12}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", md: "48.5%" },
          }}
        >
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[2],
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Admin Growth Trend
              </Typography>
              <Box sx={{ height: 300, width: "100%" }}>
                <ResponsiveContainer>
                  <AreaChart data={adminGrowthData}>
                    <defs>
                      <linearGradient
                        id="colorAdmins"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="admins"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAdmins)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Deleted Admin Trend */}
        <Grid
          item
          xs={12}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            width: { xs: "100%", md: "48.5%" },
          }}
        >
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[2],
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Deleted Admin Trend
              </Typography>
              <Box
                sx={{
                  height: 300,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {deletedAdminTrendData.length > 0 &&
                deletedAdminTrendData.some((d) => d.deleted > 0) ? (
                  <ResponsiveContainer>
                    <LineChart data={deletedAdminTrendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b" }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="deleted"
                        stroke={theme.palette.error.main}
                        strokeWidth={3}
                        dot={{
                          stroke: theme.palette.error.main,
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ opacity: 0.7, fontWeight: 600 }}
                  >
                    NO RECORDS
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Management Section */}
      <Card
        ref={tableRef}
        sx={{
          mb: 5,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {filterStatus === "Today"
              ? "Today's Logins"
              : filterStatus === "Deleted"
                ? "Deleted Admins"
                : "Admin Directory"}
          </Typography>
          <Chip
            label={`${filteredAdmins.length} Records`}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Admin ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdmins
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((admin) => (
                  <TableRow
                    key={admin.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>
                      {admin.id}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.light,
                            fontSize: "0.875rem",
                          }}
                        >
                          {admin.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {admin.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(admin.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={admin.isDeleted ? "Deleted" : admin.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: "6px",
                          bgcolor: admin.isDeleted
                            ? `${theme.palette.error.main}15`
                            : admin.status === "Active"
                              ? `${theme.palette.success.main}15`
                              : `${theme.palette.warning.main}15`,
                          color: admin.isDeleted
                            ? theme.palette.error.dark
                            : admin.status === "Active"
                              ? theme.palette.success.dark
                              : theme.palette.warning.dark,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              {filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No admins found for current filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAdmins.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Monitoring Section */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* System Summary Card */}
        <Grid
          item
          xs={12}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            maxWidth: { md: "100%" },
          }}
        >
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[2],
              height: "100%",
              bgcolor: "#1e293b",
              color: "white",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SystemIcon sx={{ mr: 2, fontSize: 28, opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  System Summary
                </Typography>
              </Box>

              <Box sx={{ mb: 4, mt: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  System Health
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.success.light,
                    mt: 0.5,
                  }}
                >
                  {systemSummary.systemHealth}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, display: "block", mb: 0.5 }}
                    >
                      Active Sessions
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {systemSummary.activeSessions}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, display: "block", mb: 0.5 }}
                    >
                      Logins Today
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {systemSummary.totalLoginsToday}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Admin Activities */}
        <Grid
          item
          xs={12}
          md={false}
          sx={{
            flexBasis: { md: 0 },
            flexGrow: { md: 1 },
            maxWidth: { md: "100%" },
          }}
        >
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[2],
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Admin Activities
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        Admin Name
                      </TableCell>
                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        Action
                      </TableCell>
                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        Time
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {activity.adminName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.action}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: "6px", bgcolor: "grey.50" }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>
                          {activity.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inactivity Section - More than 1 Week */}
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AccessTimeIcon
              sx={{ color: theme.palette.text.secondary, mr: 1.5 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Admins Inactive for {">"} 1 Week
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {longInactiveAdmins.length > 0 ? (
                  longInactiveAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {new Date(admin.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: "6px",
                            bgcolor:
                              admin.status === "Active"
                                ? `${theme.palette.success.main}15`
                                : `${theme.palette.warning.main}15`,
                            color:
                              admin.status === "Active"
                                ? theme.palette.success.dark
                                : theme.palette.warning.dark,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No admins found with more than 1 week of inactivity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HeadAdminDashboard;
