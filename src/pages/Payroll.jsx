import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Chip,
    Tooltip,
    Stack,
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Payment as PaymentIcon,
    Update as UpdateIcon,
    Download as DownloadIcon,
    History as HistoryIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    CurrencyRupee as CurrencyRupeeIcon,
    AccountBalanceWallet as SalaryDetailsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useSnackbar } from '../context/SnackbarContext';

// Components
import PageContainer from '../components/PageContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import SummaryCards from '../components/SummaryCards';
import ViewPayrollModal from '../components/ViewPayrollModal';
import AdvanceEntryModal from '../components/AdvanceEntryModal';
import SalaryStatusModal from '../components/SalaryStatusModal';
import SalaryDetailsModal from '../components/SalaryDetailsModal';

import apiEndpoints from '../apiconfig';

const Payroll = () => {
    const theme = useTheme();

    // --- State Management ---
    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [advanceHistory, setAdvanceHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedMonth, setSelectedMonth] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });

    // Modals
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [salaryDetailsModalOpen, setSalaryDetailsModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
const {showSnackbar} = useSnackbar();
    // --- Data Fetching ---
const token = localStorage.getItem("token");
    const fetchData = async () => {
        setLoading(true);
        try {
           
            const token = localStorage.getItem("token");
            const organizationGuid = localStorage.getItem("organization_guid");// Fallback for dev

            const response = await axios.get(apiEndpoints.getSalaryStatus, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Organization-Guid': organizationGuid
                }
            });
            if (response.data.status === 'success') {
                setPayrollData(response.data.data);
            } else {
                showSnackbar(response.data.message || 'Failed to fetch payroll data', "error");
            }

            // Fetch History
            // Fetch History
            const historyResponse = await axios.get(apiEndpoints.getAdvanceHistory, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Organization-Guid': organizationGuid
                }
            });
            if (historyResponse.data.status === 'success') {
                setAdvanceHistory(historyResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Failed to load payroll data', "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      fetchData();

      const handleOrgChange = () => {
        fetchData();
      };


      window.addEventListener("organizationChanged", handleOrgChange);

      return () => {
        window.removeEventListener("organizationChanged", handleOrgChange);
      };
    }, [selectedMonth]);

    // --- Filtering ---
    const filteredPayrollData = useMemo(() => {
        return payrollData.filter(item => {
            const name = item.employee_name || item.name || '';
            const guid = item.employee_guid || item.guid || '';
            const role = item.role || '';

            return (
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [payrollData, searchTerm]);

    // --- Summary Calculation ---
    const summaryItems = useMemo(() => {
        const totalEmployees = filteredPayrollData.length;
        const totalPaid = filteredPayrollData.filter(p => p.status === 'Paid').length;
        const totalUnpaid = totalEmployees - totalPaid;
        const totalSalary = filteredPayrollData.reduce((sum, item) => sum + Number(item.totalSalary), 0);

        return [
            { title: 'Total Employees', value: totalEmployees, icon: <PeopleIcon />, color: '#10B981' },
            { title: 'Salary Paid', value: totalPaid, icon: <CheckCircleIcon />, color: '#3B82F6' },
            { title: 'Salary Pending', value: totalUnpaid, icon: <PendingIcon />, color: '#F59E0B' },
            { title: 'Total Salary', value: `₹${totalSalary.toLocaleString()}`, icon: <CurrencyRupeeIcon />, color: '#6366F1' }
        ];
    }, [filteredPayrollData]);

    // --- Handlers ---

  const handleView = (row) => {
    const normalized = {
      id: row.guid,
      name: row.employee_name,
      role: row.role,
      status: row.status,
      paymentDate: row.paymentDate || "Pending",

      // Since backend doesn't send these, map properly:
      basicSalary: row.totalSalary || 0,
      allowances: row.allowances || 0,
      deductions: row.advanceTaken || 0,
      grossSalary: row.totalSalary || 0,
      netSalary: row.balance || 0,

      // Temporary defaults (until backend provides)
      month: new Date().toLocaleString("default", { month: "long" }),
      year: new Date().getFullYear(),
      presentDays: 0,
      attendancePercentage: 0,
    };

    setSelectedPayroll(normalized);
    setViewModalOpen(true);
  };



    const handleAdvanceSave = () => {
        // AdvanceEntryModal handles the save. We just need to refresh.
        fetchData();
    };

    const handleStatusUpdate = async (guids, status) => {
        try {

            const user = JSON.parse(localStorage.getItem('user'));
            const organizationGuid = localStorage.getItem("organization_guid");
            let token = localStorage.getItem('token');

            const response = await axios.post(
                apiEndpoints.updateSalaryStatus,
                {
                    employee_guids: guids,
                    status: status
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "Organization-Guid": organizationGuid
                    }
                }
            );

            if (response.data.success) {

                // update UI after success
                setPayrollData((prev) =>
                  prev.map((p) =>
                    guids.includes(p.guid || p.employee_guid)
                      ? {
                          ...p,
                          status: status,
                          paymentDate:
                            status === "Paid"
                              ? new Date().toISOString().split("T")[0]
                              : "-",
                        }
                      : p,
                  ),
                );

                showSnackbar("Salary status updated successfully", "success");

            } else {
                showSnackbar(response.data.message, "error");
            }

        } catch (error) {
            console.error(error);
            showSnackbar("Failed to update salary status", "error");
        }
    };


    // Helper
    function getMonthName(monthIndex) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[monthIndex];
    }

    return (
        <PageContainer title="Payroll Management" subtitle="Manage salaries, advances, and payments.">

            {/* Header Controls */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, width: { xs: '100%', lg: 'auto' } }}>
                    <TextField
                        placeholder="Search employees..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
                    <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => setAdvanceModalOpen(true)}
                        fullWidth
                        sx={{ height: "auto", borderRadius: '8px', textTransform: 'none', bgcolor: theme.palette.primary.main }}
                    >
                        Advance Entry
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<UpdateIcon />}
                        onClick={() => setStatusModalOpen(true)}
                        fullWidth
                        sx={{ height: "auto", borderRadius: '8px', textTransform: 'none', bgcolor: theme.palette.primary.main }}
                    >
                        Mark Status
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SalaryDetailsIcon />}
                        onClick={() => setSalaryDetailsModalOpen(true)}
                        fullWidth
                        sx={{ height: "auto", borderRadius: '8px', textTransform: 'none', bgcolor: '#3D52A0', '&:hover': { bgcolor: '#2A3B80' } }}
                    >
                        Salary Details
                    </Button>
                </Stack>
            </Box>

            {/* Summary Cards */}
            <SummaryCards items={summaryItems} />

            {/* Main Payroll Table */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    p: 0,
                    border: '1px solid #F3F4F6',
                    mt: 3
                }}
            >
                <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIconWrapper theme={theme} icon={<PaymentIcon />} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Montserrat' }}>
                        Employee Payroll List
                    </Typography>
                </Box>

                {loading ? <LoadingSpinner /> : (
                    <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table stickyHeader sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', pl: 3 }}>Employee Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Role</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Paid Date</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', pr: 3 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayrollData.length > 0 ? (
                                    filteredPayrollData.map((row) => (
                                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#111827', fontFamily: 'Montserrat', pl: 3 }}>
                                                {row.employee_name || row.name || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#374151', fontFamily: 'Montserrat' }}>
                                                <Chip label={row.role} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 500 }} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    variant={row.status === 'Paid' ? 'filled' : 'outlined'}
                                                    color={row.status === 'Paid' ? 'success' : 'default'}
                                                    sx={{ fontWeight: 600, minWidth: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#6B7280' }}>
                                                {row.paymentDate}
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton onClick={() => handleView(row)} size="small" sx={{ color: '#3D52A0', bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' } }}>
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body1" color="text.secondary">No payroll records found for this period.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Advance History Table */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    p: 0,
                    border: '1px solid #F3F4F6',
                    mt: 4
                }}
            >
                <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIconWrapper theme={theme} icon={<HistoryIcon />} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Montserrat' }}>
                        Advance Salary History
                    </Typography>
                </Box>

                <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table stickyHeader sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', pl: 3 }}>Employee Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Advance Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat' }}>Entered By</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', pr: 3 }}>Balance After</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {advanceHistory.length > 0 ? (
                                advanceHistory.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#111827', fontFamily: 'Montserrat', pl: 3 }}>{row.employeeName}</TableCell>
                                        <TableCell>
                                            <Chip label={row.role} size="small" variant="outlined" sx={{ color: '#6B7280' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#EF4444' }}>₹{row.amount}</TableCell>
                                        <TableCell sx={{ color: '#374151' }}>{row.date}</TableCell>
                                        <TableCell sx={{ color: '#374151' }}>{row.enteredBy}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#10B981', pr: 3 }}>₹{row.remainingBalance}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">No advance entries found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modals */}
            <AdvanceEntryModal
                open={advanceModalOpen}
                onClose={() => setAdvanceModalOpen(false)}
                onSave={handleAdvanceSave}
                employees={payrollData} // Pass current data for selection
            />

            <SalaryStatusModal
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onUpdateStatus={handleStatusUpdate}
                employees={filteredPayrollData} // Pass filtered data for bulk updates
            />

            <ViewPayrollModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                data={selectedPayroll}
            />

            <SalaryDetailsModal
                open={salaryDetailsModalOpen}
                onClose={() => setSalaryDetailsModalOpen(false)}
                employees={payrollData.map(p => ({
                    guid: p.guid,
                    employee_name: p.name,
                    role: p.role
                }))}
            />

        </PageContainer>
    );
};

// Start: Helper Component for Header Icons
const PeopleIconWrapper = ({ theme, icon }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '8px',
        bgcolor: theme.palette.primary.main,
        color: 'white',
        mr: 1.5,
        boxShadow: '0 4px 6px -1px rgba(61, 82, 160, 0.2)'
    }}>
        {React.cloneElement(icon, { fontSize: 'small' })}
    </Box>
);
// End: Helper Component

export default Payroll;
