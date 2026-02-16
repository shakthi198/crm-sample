import { useState, useEffect } from 'react';
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
    TablePagination,
    Paper,
    IconButton,
    Chip,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import leadsData from '../data/leads.json';
import LeadForm from '../components/LeadForm';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/PageContainer';


const Leads = () => {
    const [leads, setLeads] = useState(leadsData);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            const storedLeads = localStorage.getItem('crm_leads');
            const allLeads = storedLeads ? JSON.parse(storedLeads) : leadsData;
            setLeads(allLeads);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [currentLead, setCurrentLead] = useState({
        id: null,
        client_name: '',
        phone: '',
        email: '',
        company: '',
        source: '',
        status: '',
        assigned_to: '',
        remarks: '',
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDialog = (mode, lead = null) => {
        setDialogMode(mode);
        if (mode === 'edit' && lead) {
            setCurrentLead(lead);
        } else {
            setCurrentLead({
                id: null,
                client_name: '',
                phone: '',
                email: '',
                company: '',
                source: '',
                status: '',
                assigned_to: '',
                remarks: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = (formData) => {
        const storedLeads = localStorage.getItem('crm_leads');
        let allLeads = storedLeads ? JSON.parse(storedLeads) : leadsData;

        if (dialogMode === 'add') {
            // Add new lead
            const newLead = {
                ...formData,
                id: allLeads.length > 0 ? Math.max(...allLeads.map(l => l.id)) + 1 : 1,
            };
            allLeads = [...allLeads, newLead];
        } else {
            // Edit existing lead
            allLeads = allLeads.map(lead =>
                lead.id === currentLead.id ? { ...lead, ...formData } : lead
            );
        }

        localStorage.setItem('crm_leads', JSON.stringify(allLeads));
        setLeads(allLeads);
        handleCloseDialog();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            const storedLeads = localStorage.getItem('crm_leads');
            const allLeads = storedLeads ? JSON.parse(storedLeads) : leadsData;
            const updatedLeads = allLeads.filter(lead => lead.id !== id);

            localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
            setLeads(updatedLeads);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'New': 'info',
            'Contacted': 'primary',
            'Qualified': 'success',
            'Proposal Sent': 'warning',
            'Negotiation': 'secondary',
            'Closed Won': 'success',
        };
        return statusColors[status] || 'default';
    };

    if (loading) {
        return <LoadingSpinner loading={true} mode="centered" message="Fetching leads..." />;
    }

    return (
        <PageContainer
            title="Leads Management"
            subtitle="Manage and track all client leads and sales pipeline activities."
            action={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('add')}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Add Lead
                </Button>
            }
        >
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 800, md: 'auto' } }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Client Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leads
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((lead) => (
                                <TableRow key={lead.id} hover>
                                    <TableCell>{lead.client_name}</TableCell>
                                    <TableCell>{lead.phone}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.company}</TableCell>
                                    <TableCell>{lead.source}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={lead.status}
                                            color={getStatusColor(lead.status)}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                minWidth: '100px', // Consistent width with Dashboard
                                                justifyContent: 'center'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{lead.assigned_to}</TableCell>
                                    <TableCell>{lead.remarks}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenDialog('edit', lead)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(lead.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={leads.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <LeadForm
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSave}
                initialData={currentLead}
                mode={dialogMode}
            />
        </PageContainer>
    );
};

export default Leads;
