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
    useTheme,
    alpha
} from '@mui/material';
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
import apiEndpoints from '../apiconfig';

const API_URL = apiEndpoints.followup;
const LEADS_API_URL = apiEndpoints.leads;
const USERS_API_URL = apiEndpoints.users;



const Followups = () => {
    const token = localStorage.getItem("token");
    console.log("Followups component - User:", token);
    // Initialize with empty array
    const [followups, setFollowups] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);

    const fetchFollowups = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setFollowups(data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            const response = await fetch(LEADS_API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setLeads(data.data);
            }
        } catch (error) {
            console.error("Leads fetch error:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            // Using the new users_page.php endpoint
            const response = await fetch(USERS_API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Users fetch error:", error);
        }
    };

    useEffect(() => {
        fetchFollowups();
        fetchLeads();
        fetchUsers();
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

    const handleSaveFollowup = async (followupData) => {
        try {
            const method = "POST"; // Use POST for both Create and Update (PHP handles logic)

            // If editing, include id/guid
            const payload = { ...followupData };
            if (currentFollowup) {
                payload.followup_guid = currentFollowup.followup_guid;
            }

            const response = await fetch(API_URL, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                fetchFollowups(); // Refresh list
                handleCloseModal();
            } else {
                alert("Failed to save followup: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving followup");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        // Quick update via API
        try {
            const response = await fetch(API_URL, {
                method: "POST", // Using POST for update
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ followup_guid: id, status: newStatus }),
            });

            const data = await response.json();
            if (data.success) {
                fetchFollowups();
            } else {
                alert("Failed to update status");
            }

        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this follow-up?')) {
            try {
                const response = await fetch(API_URL + "?action=delete", { // Pass action=delete or handle in body
                    method: "POST", // Using POST with action or DELETE method if server supports
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ followup_guid: id, action: 'delete' }), // Explicitly sending action in body too
                });

                const data = await response.json();

                if (data.success) {
                    fetchFollowups();
                } else {
                    alert("Failed to delete: " + (data.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
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
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Time</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Outcome</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {followups
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.followup_guid} hover>
                                        <TableCell>{row.lead_name}</TableCell>
                                        <TableCell align="center">{row.type}</TableCell>
                                        <TableCell align="center">{row.date}</TableCell>
                                        <TableCell align="center">{row.time}</TableCell>
                                        <TableCell align="center">
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
                                        <TableCell align="center">{row.assigned_to}</TableCell>
                                        <TableCell align="center">{row.outcome}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                                                        onClick={() => handleStatusChange(row.followup_guid, 'Completed')}
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(row.followup_guid)}
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
                leads={leads}
                users={users}
            />
        </PageContainer>
    );
};

export default Followups;