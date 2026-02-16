import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    TablePagination
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import clientsData from '../data/clients.json';
import leadsData from '../data/leads.json';
import ClientFormModal from '../components/ClientFormModal';
import ClientDetailsModal from '../components/ClientDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/PageContainer';

// --- CURRENT USER SIMULATION (CHANGE THIS TO TEST DIFFERENT ROLES) ---
const currentUser = {
    id: 2,
    name: "Admin User",
    email: "admin@crm.com",
    role: "Admin", // Change to "Super Admin", "Finance", "Manager", "Telecaller" to test
    organization_id: "ORG001"
};
// ---------------------------------------------------------------------

const Clients = () => {
    const [clients, setClients] = useState(clientsData);
    const [leads, setLeads] = useState(leadsData);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [currentClient, setCurrentClient] = useState(null);
    const [viewClient, setViewClient] = useState(null);

    // Toast State
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // --- RBAC PERMISSIONS ---
    const canViewAllOrgs = currentUser.role === 'Super Admin';
    // Add/Edit/Delete: Super Admin, Admin
    // Finance: View Only
    // Manager/Telecaller: No Access (should be blocked by RouteGuard usually)
    const canManage = ['Super Admin', 'Admin'].includes(currentUser.role);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Simulate API fetch
        const timer = setTimeout(() => {
            // LOAD FROM LOCAL STORAGE (Persistence)
            const storedClients = localStorage.getItem('crm_clients');
            const allClients = storedClients ? JSON.parse(storedClients) : clientsData;

            // Filter Clients by Organization (Strict Multi-tenancy)
            let filteredClients = allClients;
            if (!canViewAllOrgs) {
                filteredClients = allClients.filter(c => c.organization_id === currentUser.organization_id);
            }
            setClients(filteredClients);
            // Leads are global or shared in this context, used for Joining
            setLeads(leadsData);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [currentUser.role, currentUser.organization_id]); // Re-run if user changes

    // JOIN LOGIC: Clients + Leads
    const joinedClients = clients.map(client => {
        const lead = leads.find(l => l.id === parseInt(client.lead_id));
        return {
            ...client,
            client_name: lead ? lead.client_name : 'Unknown Lead',
            email: lead ? lead.email : 'N/A',
            phone: lead ? lead.phone : 'N/A',
            company: lead ? lead.company : 'N/A',
            lead_status: lead ? lead.status : 'N/A'
        };
    });

    const handleToastClose = () => {
        setToast({ ...toast, open: false });
    };

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    // Dialog Handlers
    const handleOpenDialog = (mode, client = null) => {
        setDialogMode(mode);
        setCurrentClient(client);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentClient(null);
    };

    const handleOpenView = (client) => {
        setViewClient(client);
        setOpenViewDialog(true);
    };

    const handleCloseView = () => {
        setOpenViewDialog(false);
        setViewClient(null);
    };

    const handleSave = (formData) => {
        // Load latest state from storage or default
        const storedClients = localStorage.getItem('crm_clients');
        let allClients = storedClients ? JSON.parse(storedClients) : clientsData;

        if (dialogMode === 'add') {
            // Check for duplicates
            const isDuplicate = clients.some(c => c.lead_id === formData.lead_id);
            if (isDuplicate) {
                showToast("This lead is already a client.", "error");
                return;
            }

            const newClient = {
                id: allClients.length > 0 ? Math.max(...allClients.map(c => c.id)) + 1 : 1,
                organization_id: currentUser.organization_id, // Auto-assign current user's org
                ...formData
            };

            allClients = [...allClients, newClient];
            showToast("Client added successfully!");
        } else {
            // Update existing
            allClients = allClients.map(c =>
                c.id === currentClient.id ? { ...c, ...formData } : c
            );
            showToast("Client updated successfully!");
        }

        // Persist to LocalStorage
        localStorage.setItem('crm_clients', JSON.stringify(allClients));

        // Update UI State (Re-filter)
        if (!canViewAllOrgs) {
            setClients(allClients.filter(c => c.organization_id === currentUser.organization_id));
        } else {
            setClients(allClients);
        }

        handleCloseDialog();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            // Load latest state from storage or default
            const storedClients = localStorage.getItem('crm_clients');
            let allClients = storedClients ? JSON.parse(storedClients) : clientsData;

            // Remove from global list
            const updatedClients = allClients.filter(c => c.id !== id);

            // Persist to LocalStorage
            localStorage.setItem('crm_clients', JSON.stringify(updatedClients));

            // Update UI State (Re-filter)
            if (!canViewAllOrgs) {
                setClients(updatedClients.filter(c => c.organization_id === currentUser.organization_id));
            } else {
                setClients(updatedClients);
            }
            showToast("Client deleted successfully!");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Access Denied for Telecaller (Double check, though RouteGuard handles it)
    if (['Telecaller'].includes(currentUser.role)) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Access Denied: You do not have permission to view clients.</Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
                <LoadingSpinner loading={true} mode="centered" message="Loading Clients..." />
            </Box>
        );
    }

    return (
        <>
            <PageContainer
                title="Clients Management"
                subtitle="Manage your clients, contracts, and project relationships."
                action={
                    canManage && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog('add')}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Add Client
                        </Button>
                    )
                }
            >
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Client Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Contract File</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {joinedClients
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((client) => (
                                    <TableRow key={client.id} hover>
                                        <TableCell>{client.client_name}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.company}</TableCell>
                                        <TableCell>{client.contract_file}</TableCell>
                                        <TableCell>{client.start_date}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={client.lead_status}
                                                size="small"
                                                color={client.lead_status === 'Closed Won' ? 'success' : 'default'}
                                                sx={{
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    minWidth: '100px',
                                                    justifyContent: 'center'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex' }}>
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleOpenView(client)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                                {canManage ? (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleOpenDialog('edit', client)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(client.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <Typography variant="caption" color="textSecondary">View Only</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {joinedClients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No clients found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={joinedClients.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {/* Client Form Modal */}
                <ClientFormModal
                    open={openDialog}
                    onClose={handleCloseDialog}
                    onSave={handleSave}
                    leads={leads}
                    clients={clients}
                    initialData={currentClient}
                    mode={dialogMode}
                />

                {/* Client Details Modal */}
                <ClientDetailsModal
                    open={openViewDialog}
                    onClose={handleCloseView}
                    client={viewClient}
                    onEdit={() => {
                        handleCloseView();
                        handleOpenDialog('edit', viewClient);
                    }}
                />
            </PageContainer>

            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Clients;
