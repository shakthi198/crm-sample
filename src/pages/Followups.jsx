import { useState, useEffect } from 'react';
import {
    Box,
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
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add as AddIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import followupsData from '../data/followups.json';
import FollowupModal from '../components/FollowupModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/PageContainer';
import DataTableCard from '../components/DataTableCard';

const Followups = () => {
    // Initialize with data from JSON
    const [followups, setFollowups] = useState(followupsData);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    // Simulate loading delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const [openModal, setOpenModal] = useState(false);
    const [currentFollowup, setCurrentFollowup] = useState(null);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (followup = null) => {
        setCurrentFollowup(followup);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentFollowup(null);
    };

    const handleSaveFollowup = (followupData) => {
        if (currentFollowup) {
            // Edit existing
            setFollowups(followups.map(f => f.id === currentFollowup.id ? { ...f, ...followupData } : f));
        } else {
            // Add new
            const newFollowup = {
                ...followupData,
                id: followups.length + 1,
            };
            setFollowups([...followups, newFollowup]);
        }
        handleCloseModal();
    };

    const handleStatusChange = (id, newStatus) => {
        setFollowups(followups.map(f => f.id === id ? { ...f, status: newStatus } : f));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this follow-up?')) {
            setFollowups(followups.filter(f => f.id !== id));
        }
    };

    const theme = useTheme();

    const getStatusSx = (status) => {
        const colors = {
            'Completed': theme.palette.success.main,
            'Pending': theme.palette.warning.main,
            'Missed': theme.palette.error.main,
            'Scheduled': theme.palette.primary.main,
        };

        const color = colors[status] || theme.palette.text.secondary;

        return {
            bgcolor: alpha(color, 0.15),
            color: color,
            border: `1px solid ${alpha(color, 0.3)}`,
            '&:hover': { bgcolor: alpha(color, 0.25) }
        };
    };

    const getStatusColor = (status) => 'default';

    if (loading) {
        return <LoadingSpinner loading={true} mode="centered" message="Loading follow-ups..." />
    }

    return (
        <PageContainer
            title="Client Followups"
            subtitle="Track and manage your daily client interactions and tasks."
            action={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                >
                    New Follow-up
                </Button>
            }
        >
            <DataTableCard>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Lead Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Outcome</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {followups
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.lead_name}</TableCell>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.time}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                size="small"
                                                color={
                                                    row.status === 'Completed' ? 'success' :
                                                        row.status === 'Pending' ? 'warning' :
                                                            row.status === 'Missed' ? 'error' : 'primary'
                                                }
                                                sx={{
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    minWidth: '100px',
                                                    justifyContent: 'center'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{row.assigned_to}</TableCell>
                                        <TableCell>{row.outcome}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex' }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenModal(row)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                {row.status !== 'Completed' && (
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleStatusChange(row.id, 'Completed')}
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(row.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={followups.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </DataTableCard>

            <FollowupModal
                open={openModal}
                onClose={handleCloseModal}
                onSave={handleSaveFollowup}
                followup={currentFollowup}
            />
        </PageContainer>
    );
};

export default Followups;
