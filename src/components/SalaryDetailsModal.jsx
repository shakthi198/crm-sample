import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

import AddSalaryDetailsModal from './AddSalaryDetailsModal';
import apiEndpoints from '../apiconfig';

const SalaryDetailsModal = ({ open, onClose, employees = [] }) => {
    const theme = useTheme();
    const [salaryDetails, setSalaryDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSalaryDetails();
        }
    }, [open]);

    const fetchSalaryDetails = async () => {
        try {
            setLoading(true);

            // In a real app, use the token from localStorage
            let token = localStorage.getItem('token');
      const organizationGuid = localStorage.getItem("organization_guid");
            const response = await axios.get(
                apiEndpoints.getAllSalaryDetails,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
"Organization-Guid": organizationGuid,
                    }
                }
            );

            if (response.data.success) {
                setSalaryDetails(response.data.data);
            } else {
                setSalaryDetails([]);
            }
        } catch (error) {
            console.error("Error fetching salary details:", error);
            setSalaryDetails([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '1200px',
                        height: '80vh',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <DialogTitle component="div" sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    px: 4,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Montserrat', color: '#0f172a' }}>
                            Salary Details
                        </Typography>
                        <Chip
                            label={`${salaryDetails.length} Records`}
                            size="small"
                            sx={{ fontWeight: 600, borderRadius: '6px', bgcolor: '#EEF2FF', color: theme.palette.primary.main }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setAddModalOpen(true)}
                            disableElevation
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '8px',
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                            }}
                        >
                            Add Salary Details
                        </Button>
                        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0, bgcolor: '#f8f9fc' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 'calc(80vh - 250px)' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb', pl: 3 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Basic Salary</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Allowances</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Deductions</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Net Salary</TableCell>
                                        {/* <TableCell align="center" sx={{ fontWeight: 600, color: '#6B7280', fontFamily: 'Montserrat', bgcolor: '#f9fafb' }}>Actions</TableCell> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salaryDetails.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary">No salary details found.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        salaryDetails.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 600, color: '#111827', pl: 3 }}>{row.employee_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Montserrat', color: '#374151' }}>
                                                    <Chip label={row.role || 'N/A'} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 500 }} />
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'Montserrat', color: '#374151' }}>₹{Number(row.basic_salary).toLocaleString()}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Montserrat', color: '#374151' }}>₹{Number(row.allowances).toLocaleString()}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Montserrat', color: '#374151' }}>₹{Number(row.deductions).toLocaleString()}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 600, color: theme.palette.success.main }}>
                                                    ₹{Number(row.net_salary).toLocaleString()}
                                                </TableCell>
                                                {/* <TableCell align="center">
                                                    <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell> */}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={onClose} color="inherit" variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', px: 3, height: 44, borderColor: 'divider' }}>Close</Button>
                </DialogActions>
            </Dialog>

            <AddSalaryDetailsModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={fetchSalaryDetails}
                employees={employees}
            />
        </>
    );
};

export default SalaryDetailsModal;
