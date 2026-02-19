import React, { useState, useEffect } from "react";
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
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import clientsData from "../data/clients.json";
import leadsData from "../data/leads.json";
import ClientFormModal from "../components/ClientFormModal";
import ClientDetailsModal from "../components/ClientDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import PageContainer from "../components/PageContainer";
import apiEndpoints from "../apiconfig";

// --- CURRENT USER SIMULATION (CHANGE THIS TO TEST DIFFERENT ROLES) ---
const currentUser = {
  id: 2,
  name: "Admin User",
  email: "admin@crm.com",
  role: "Admin", // Change to "Super Admin", "Finance", "Manager", "Telecaller" to test
  organization_id: "ORG001",
};
// ---------------------------------------------------------------------

const Clients = () => {
  const [clients, setClients] = useState(clientsData);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [currentClient, setCurrentClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);

  // Toast State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- RBAC PERMISSIONS ---
  const canViewAllOrgs = currentUser.role === "Super Admin";
  // Add/Edit/Delete: Super Admin, Admin
  // Finance: View Only
  // Manager/Telecaller: No Access (should be blocked by RouteGuard usually)
  const canManage = ["Super Admin", "Admin"].includes(currentUser.role);
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const orgGuid = localStorage.getItem("organization_guid");

      const res = await fetch(`${apiEndpoints.clients}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Organization-Guid": orgGuid,
        },
      });

      const data = await res.json();

      if (data.success) {
        setClients(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const orgGuid = localStorage.getItem("organization_guid");
      const res = await fetch(`${apiEndpoints.dropdown}?table=leads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Organization-Guid": orgGuid,
        },
      });
      const data = await res.json();

      if (data.success) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

useEffect(() => {
  fetchClients();
  fetchLeads();

  const handleOrgChange = () => {
    fetchClients();
    fetchLeads();
  };

  window.addEventListener("organizationChanged", handleOrgChange);

  return () => {
    window.removeEventListener("organizationChanged", handleOrgChange);
  };
}, []);


  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const showToast = (message, severity = "success") => {
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

  const handleSave = async (formData) => {
    const token = localStorage.getItem("token");

    const form = new FormData();

    form.append("lead_guid", formData.lead_guid);
    form.append("start_date", formData.start_date);
    form.append("status", formData.status);

    if (formData.contract_file instanceof File) {
      form.append("contract_file", formData.contract_file);
    }

    if (dialogMode === "edit") {
      form.append("client_guid", currentClient.client_guid);
    }

    try {
      const res = await fetch(`${apiEndpoints.clients}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Organization-Guid": localStorage.getItem("organization_guid"),
        },
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        fetchClients();
        handleCloseDialog();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (client_guid) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Delete this client?")) return;

    const res = await fetch(`${apiEndpoints.clients}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Organization-Guid": localStorage.getItem("organization_guid"),
      },
      body: JSON.stringify({ client_guid }),
    });

    const data = await res.json();

    if (data.success) {
      fetchClients();
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
  if (["Telecaller"].includes(currentUser.role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied: You do not have permission to view clients.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
      >
        <LoadingSpinner
          loading={true}
          mode="centered"
          message="Loading Clients..."
        />
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
              onClick={() => handleOpenDialog("add")}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add Client
            </Button>
          )
        }
      >
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
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
              {clients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>{client.client_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      {typeof client.contract_file === "object"
                        ? client.contract_file?.name || "Uploaded File"
                        : client.contract_file || "No File"}
                    </TableCell>
                    <TableCell>{client.start_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.status || "pending"}
                        size="small"
                        color={
                          client.status === "approved"
                            ? "success"
                            : client.status === "rejected"
                              ? "error"
                              : "warning"
                        }
                        sx={{
                          fontWeight: 600,
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          minWidth: "100px",
                          justifyContent: "center",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
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
                              onClick={() => handleOpenDialog("edit", client)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(client.client_guid)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            View Only
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={clients.length}
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
            handleOpenDialog("edit", viewClient);
          }}
        />
      </PageContainer>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Clients;
