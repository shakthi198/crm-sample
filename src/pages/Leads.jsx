import { useState, useEffect } from "react";

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
    Alert,
} from "@mui/material";

import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Edit as EditIcon,
} from "@mui/icons-material";

import LeadForm from "../components/LeadForm";
import LoadingSpinner from "../components/LoadingSpinner";
import apiEndpoints from "../apiconfig";

const API_URL = apiEndpoints.leads;

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("add");

    const [currentLead, setCurrentLead] = useState({
        id: null,
        client_name: "",
        phone: "",
        email: "",
        company: "",
        source: "",
        status: "",
        assigned_to: "",
        remarks: "",
    });

    /* =========================
         GET TOKEN SAFE
      ========================= */

    const getToken = () => {
        // Prioritize crm_token as it's the one set by AuthContext
        const token =localStorage.getItem("token");

        if (!token || token === "null" || token === "undefined") {
            return null;
        }

        return token;
    };

    /* =========================
         FETCH LEADS
      ========================= */

    const fetchLeads = async () => {
        const token = getToken();
        console.log("Fetching leads with token:", token);

        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL, {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                setLeads(result.data);
            } else {
                // Show more detailed error if provided by backend
                const errorMsg = result.message ? `${result.error}: ${result.message}` : (result.error || "Failed to fetch leads");
                setError(errorMsg);
            }
        } catch (err) {
            console.error(err);

            setError("Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    /* =========================
         OPEN / CLOSE DIALOG
      ========================= */

    const handleOpenDialog = (mode, lead = null) => {
        setDialogMode(mode);

        if (mode === "edit" && lead) {
            setCurrentLead(lead);
        } else {
            setCurrentLead({
                id: null,
                client_name: "",
                phone: "",
                email: "",
                company: "",
                source: "",
                status: "",
                assigned_to: "",
                remarks: "",
            });
        }

        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    /* =========================
         SAVE LEAD
      ========================= */

    const handleSave = async (formData) => {
        const token = getToken();

        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const method = dialogMode === "add" ? "POST" : "PUT";

            const bodyData =
                dialogMode === "add" ? formData : { ...formData, id: currentLead.id };

            const response = await fetch(API_URL, {
                method: method,

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify(bodyData),
            });

            const result = await response.json();

            if (result.success) {
                await fetchLeads();

                handleCloseDialog();
            } else {
                setError(result.error || "Save failed");
            }
        } catch (err) {
            console.error(err);

            setError("Save failed. Server error.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
         DELETE LEAD
      ========================= */

    const handleDelete = async (id) => {
        const token = getToken();

        if (!token) return;

        if (!window.confirm("Delete this lead?")) return;

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({ id }),
            });

            const result = await response.json();

            if (result.success) {
                fetchLeads();
            } else {
                setError(result.error || "Delete failed");
            }
        } catch (err) {
            setError("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
         STATUS COLOR
      ========================= */

    const getStatusColor = (status) => {
        const colors = {
            New: "info",
            Contacted: "primary",
            Qualified: "success",
            "Proposal Sent": "warning",
            Negotiation: "secondary",
            "Closed Won": "success",
        };

        return colors[status] || "default";
    };

    /* =========================
         PAGINATION
      ========================= */

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    /* =========================
         UI
      ========================= */

    return (
        <Box sx={{ p: 3 }}>
            {loading && <LoadingSpinner loading={true} />}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h4">Leads Management</Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog("add")}
                >
                    Add Lead
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Client Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Remarks</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {leads
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>{lead.client_name}</TableCell>
                                    <TableCell>{lead.phone}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.company}</TableCell>
                                    <TableCell>{lead.source}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={lead.status}
                                            color={getStatusColor(lead.status)}
                                        />
                                    </TableCell>

                                    <TableCell>{lead.assigned_name}</TableCell>

                                    <TableCell>{lead.remarks}</TableCell>

                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog("edit", lead)}>
                                            <EditIcon />
                                        </IconButton>

                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(lead.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 25]}
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
        </Box>
    );
};

export default Leads;

