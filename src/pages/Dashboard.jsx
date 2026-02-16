import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Skeleton,
    useTheme,
    useMediaQuery
} from '@mui/material'
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    CurrencyRupee as RupeeIcon,
    Business as BusinessIcon,
} from '@mui/icons-material'
import {
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    BarChart,
    Bar
} from 'recharts'
import dashboardData from '../data/dashboard.json'
import leadsData from '../data/leads.json'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const Dashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const followUpsRef = useRef(null);

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    useEffect(() => {
        window.scrollTo(0, 0);
        // Simulate loading data from JSON
        const timer = setTimeout(() => {
            setData(dashboardData)
            setLoading(false)
        }, 600)
        return () => clearTimeout(timer)
    }, [])

    const scrollToFollowUps = () => {
        followUpsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleChangePage = (_, newPage) => setPage(newPage)

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10))
        setPage(0)
    }

    // Icon mapping function
    const getIcon = (iconName) => {
        const icons = {
            'People': <PeopleIcon sx={{ fontSize: 28 }} />,
            'TrendingUp': <TrendingUpIcon sx={{ fontSize: 28 }} />,
            'CurrencyRupee': <RupeeIcon sx={{ fontSize: 28 }} />,
            'Business': <BusinessIcon sx={{ fontSize: 28 }} />
        }
        return icons[iconName] || <PeopleIcon sx={{ fontSize: 28 }} />
    }

    const kpiCards = data?.kpis.map(kpi => {
        let value = kpi.value;
        if (kpi.id === 'total_leads') {
            value = leadsData.length.toString();
        }
        return {
            ...kpi,
            icon: getIcon(kpi.icon),
            value,
            onClick: kpi.link ? () => navigate(kpi.link) : (kpi.scrollTo === 'followUps' ? scrollToFollowUps : undefined)
        }
    }) || []

    const getStatusColor = (status) => {
        if (status === 'Completed') return 'success'
        if (status === 'Scheduled') return 'primary'
        if (status === 'Pending') return 'warning'
        return 'default'
    }

    return (
        <Box sx={{
            p: { xs: 2, sm: 3 },
            position: 'relative',
            minHeight: 'calc(100vh - 64px)',
            display: loading && !data ? 'flex' : 'block',
            flexDirection: 'column',
            justifyContent: loading && !data ? 'center' : 'flex-start',
            alignItems: loading && !data ? 'center' : 'stretch'
        }}>
            {loading && !data ? (
                <LoadingSpinner loading={true} mode="centered" message="Gathering insights..." />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Header */}
                    <Box>
                        <Box sx={{ mb: 1 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                    mb: 0.5,
                                    color: '#1e293b'
                                }}
                            >
                                Dashboard
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#64748b',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Welcome back! Here's what's happening with your business today.
                            </Typography>
                        </Box>
                    </Box>

                    {/* KPI CARDS */}
                    <Grid container spacing={3}>
                        {(loading ? Array.from({ length: 4 }) : kpiCards).map((card, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Card
                                    elevation={0}
                                    onClick={card?.onClick}
                                    sx={{
                                        height: 140, // Fixed height for exact uniformity
                                        cursor: card?.onClick ? 'pointer' : 'default',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 3,
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                            borderColor: card?.bgColor, // Subtle border highlight
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                        {loading ? (
                                            <>
                                                <Skeleton width="60%" height={24} />
                                                <Skeleton width="40%" height={40} sx={{ mt: 1 }} />
                                            </>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: 2.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: card.bgColor,
                                                        color: card.color,
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {card.icon}
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {card.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="h4"
                                                        sx={{
                                                            fontWeight: 800,
                                                            fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                                            color: '#1e293b',
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        {card.value}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* CHARTS SECTION */}
                    <Grid container spacing={3}>
                        {/* Leads by Status */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                                        Leads by Status
                                    </Typography>
                                    <Box sx={{ flexGrow: 1, height: 300, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {data ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={data.leads_by_status}
                                                        dataKey="count"
                                                        nameKey="status"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={isMobile ? 50 : 60}
                                                        outerRadius={isMobile ? 70 : 90}
                                                        paddingAngle={4}
                                                        cornerRadius={4}
                                                    >
                                                        {data.leads_by_status.map((_, i) => (
                                                            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={isMobile ? undefined : 36}
                                                        iconType="circle"
                                                        wrapperStyle={isMobile ? { paddingTop: '20px' } : undefined}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Skeleton variant="circular" width={200} height={200} />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Revenue Overview */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                                        Revenue Overview
                                    </Typography>
                                    <Box sx={{ flexGrow: 1, height: 300, minHeight: 300 }}>
                                        {data ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={data.revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis
                                                        dataKey="month"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    />
                                                    <Legend verticalAlign="top" align="right" height={36} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={{ r: 0 }}
                                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Skeleton variant="rectangular" height="100%" />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>



                        {/* FOLLOW-UPS TABLE */}
                    </Grid>
                    <Box ref={followUpsRef}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    Follow-ups Today
                                </Typography>
                                <Chip label={`${data?.today_followups_table.length || 0} Pending`} size="small" color="primary" sx={{ fontWeight: 600, borderRadius: '6px' }} />
                            </Box>

                            <TableContainer>
                                <Table size={isMobile ? "small" : "medium"}>
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', py: 2 }}>LEAD NAME</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', py: 2 }}>PHONE</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', py: 2 }}>STATUS</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', py: 2 }}>NEXT ACTION</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', py: 2 }}>ASSIGNED</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(loading || !data
                                            ? Array.from({ length: 5 })
                                            : data.today_followups_table.slice(
                                                page * rowsPerPage,
                                                page * rowsPerPage + rowsPerPage
                                            )
                                        ).map((row, i) => (
                                            <TableRow
                                                key={i}
                                                hover
                                                sx={{ '&:last-child td': { border: 0 }, transition: 'background-color 0.2s' }}
                                            >
                                                {loading ? (
                                                    <TableCell colSpan={5}><Skeleton /></TableCell>
                                                ) : (
                                                    <>
                                                        <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                                                            {row.lead_name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#64748b' }}>
                                                            {row.phone}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={row.call_status}
                                                                color={getStatusColor(row.call_status)}
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.75rem',
                                                                    minWidth: '85px', // Enforce consistent width
                                                                    justifyContent: 'center'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#64748b' }}>
                                                            {row.next_followup_time}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#64748b' }}>
                                                            {row.assigned_to}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={data?.today_followups_table.length || 0}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: '1px solid #e2e8f0' }}
                            />
                        </Card>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default Dashboard
