import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, MenuItem, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, useTheme, Card, CardContent, alpha,
    Divider, Grid, Skeleton
} from '@mui/material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';
import {
    Search as SearchIcon,
    Download as DownloadIcon,
    FilterList as FilterIcon,
    TrendingUp as TrendingUpIcon,
    Group as GroupIcon,
    AccountBalanceWallet as WalletIcon,
    Assignment as ProjectIcon
} from '@mui/icons-material';

// Import Dynamic JSON Data
import reportsData from '../../data/reportsdata.json';

// Reusable components
import PageContainer from '../../components/PageContainer';
import DataTableCard from '../../components/DataTableCard';
import SummaryCards from '../../components/SummaryCards';
import LoadingSpinner from '../../components/LoadingSpinner';

const Reports = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [tempFilter, setTempFilter] = useState({ year: '2026', month: 'January' });
    const [allData, setAllData] = useState(null);
    const [activeData, setActiveData] = useState(null);

    const COLORS = ['#00C49F', '#3b82f6', '#FFBB28', '#FF8042', '#8b5cf6'];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('crm_user'));
                if (!user || !user.token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost/crm/reports_superadmin.php', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await response.json();

                if (data.success && data.reports) {
                    setAllData(data);
                    // Default to first report or filter match
                    const initial = data.reports.find(r => r.year === '2026' && r.month === 'January');
                    setActiveData(initial || data.reports[0]);
                } else {
                    console.error("No reports data found");
                    setAllData({ reports: [], availableYears: [], availableMonths: [] });
                }
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleApplyFilters = () => {
        if (!allData || !allData.reports) return;
        setLoading(true);
        // Simulate small delay for UX
        setTimeout(() => {
            const result = allData.reports.find(r => r.year === tempFilter.year && r.month === tempFilter.month);
            setActiveData(result || allData.reports[0]); // Fallback if no specific month data found
            setLoading(false);
        }, 300);
    };

    if (loading) return <LoadingSpinner loading={true} mode="centered" />;
    if (!activeData || !allData) return <Box sx={{ p: 3 }}>No report data available.</Box>;

    const summaryItems = [
        { title: 'Total Revenue', value: activeData.summary.totalRevenue, icon: <TrendingUpIcon />, color: '#f59e0b' },
        { title: 'Total Admins', value: activeData.summary.totalAdmins, icon: <GroupIcon />, color: '#3b82f6' },
        { title: 'Pending Collections', value: activeData.summary.pendingCollections, icon: <WalletIcon />, color: '#8b5cf6' },
        { title: 'Active Projects', value: activeData.summary.activeProjects || '0', icon: <ProjectIcon />, color: '#10b981' }
    ];

    return (
      <PageContainer
        title="Reports & Analytics"
        subtitle="Side-by-side performance insights and visualization."
        action={
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: "10px", backgroundColor: "#3e2929" }}
          >
            Download Report
          </Button>
        }
      >
        <SummaryCards items={summaryItems} />

        {/* Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            gap: 3,
            alignItems: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "text.secondary",
            }}
          >
            <FilterIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              FILTERS
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
            <TextField
              select
              size="small"
              label="Year"
              value={tempFilter.year}
              fullWidth
              onChange={(e) =>
                setTempFilter({ ...tempFilter, year: e.target.value })
              }
            >
              {allData.availableYears.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Month"
              value={tempFilter.month}
              fullWidth
              onChange={(e) =>
                setTempFilter({ ...tempFilter, month: e.target.value })
              }
            >
              {allData.availableMonths.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleApplyFilters}
            sx={{
              height: "40px",
              px: 4,
              borderRadius: "10px",
              bgcolor: "#3e2929",
            }}
          >
            Apply Filters
          </Button>
        </Paper>

        {/* --- CHARTS SECTION: FULL WIDTH ROW --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Leads by Status */}
          <Grid item xs={12} md={6} width={{ xs: "100%", md: "48.5%" }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}
                >
                  Revenue Distribution (By Org)
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 400,
                    minHeight: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeData.revenueDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={4}
                        cornerRadius={4}
                      >
                        {activeData.revenueDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                            stroke="none"
                          />
                        ))}
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
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Overview */}
          <Grid item xs={12} md={6} width={{ xs: "100%", md: "48.5%" }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}
                >
                  Revenue Trend (Weekly)
                </Typography>
                <Box sx={{ flexGrow: 1, height: 400, minHeight: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activeData.revenueTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 14 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 14 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fill={alpha("#3b82f6", 0.15)}
                        dot={{ r: 0 }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Table */}
        <DataTableCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Admin Performance Metric Details
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Admin Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Clients Onboarded
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Target Achievement
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeData.performance.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell>{row.clients}</TableCell>
                    <TableCell>₹{row.revenue.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 700 }}>
                      {row.target}
                    </TableCell>
                  </TableRow>
                ))}
                {activeData.performance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No performance data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DataTableCard>
      </PageContainer>
    );
};

export default Reports;