import React, { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import ClientFormModal from "../components/ClientFormModal";
import ClientDetailsModal from "../components/ClientDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = "http://localhost/crm/clients_page.php";
const LEADS_API_URL = "http://localhost/crm/leads_page.php";
const BASE_URL = "http://localhost/crm/";

//  MANUAL TOKEN
const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzA4MDM4NDYsIm9yZ2FuaXphdGlvbl9ndWlkIjoiNDljNGMxMjItMDcxOC0xMWYxLTljNDItZTIxYWQ4ZjAyYjA0IiwiYWRtaW5fZ3VpZCI6IjQ5YzRjMWM2LTA3MTgtMTFmMS05YzQyLWUyMWFkOGYwMmIwNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpc19hY3RpdmUiOjF9.haZqmTOMh4bBXS-3AhsCGxtfAqmTAm_pZqeA14o2izc";

// const token = localStorage.getItem("token");

const Clients = () => {
  const [leads, setLeads] = useState([]);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [currentClient, setCurrentClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ===============================
  // FETCH CLIENTS
  // ===============================
  const fetchClients = async () => {
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
        setClients(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Failed to fetch clients", "error");
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

  useEffect(() => {
    fetchClients();
    fetchLeads();
  }, []);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };
  // ===============================
  // SAVE (ADD / EDIT)
  // ===============================
  const handleSave = async (formData) => {
    try {
      const form = new FormData();

      form.append("lead_guid", formData.lead_id);
      form.append("start_date", formData.start_date);

      // Only append file if it's a real File object
      if (formData.contract_file instanceof File) {
        form.append("contract_file", formData.contract_file);
      }

      let response;

      if (dialogMode === "add") {
        // ========================
        // CREATE CLIENT
        // ========================
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } else {
        // ========================
        // UPDATE CLIENT
        // ========================
        form.append("client_guid", currentClient.client_guid);

        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      }

      const data = await response.json();

      if (data.success) {
        showToast(
          dialogMode === "add"
            ? "Client added successfully"
            : "Client updated successfully",
        );

        fetchClients();
        setOpenDialog(false);
      } else {
        showToast(data.message || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("Something went wrong", "error");
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (client_guid) => {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ client_guid }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Client deleted successfully");
        fetchClients();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ===============================
  // DOWNLOAD FILE (Frontend Force)
  // ===============================
  const handleDownload = async (fileUrl, fileName) => {
    try {
      setLoading(true);

      // Extract filename from path
      const actualFileName = fileUrl.split("/").pop();

      const response = await fetch(
        `${API_URL}?action=download&file=${actualFileName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Force download
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      showToast("Failed to download file", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <>
      <Box sx={{ p: 3 }}>
        {loading ? (
          <LoadingSpinner loading={true} />
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                Clients Management
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogMode("add");
                  setOpenDialog(true);
                }}
              >
                Add Client
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Company Name</TableCell>
                    <TableCell align="center">Contract</TableCell>
                    <TableCell align="center">Start Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {clients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <TableRow key={client.client_guid} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {client.client_name}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {client.email}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{client.phone}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {client.company_name}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          {client.contract_file ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              {/* Preview Button (Opens in new tab) */}
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<ViewIcon />}
                                component="a"
                                href={`${BASE_URL}${client.contract_file}`}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  textTransform: "none",
                                  color: "primary.main",
                                  minWidth: "auto",
                                }}
                              >
                                Preview
                              </Button>

                              {/* Download Button (Forces download) */}
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleDownload(
                                    client.contract_file,
                                    client.contract_file.split("/").pop(),
                                  )
                                }
                                title="Download"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            "No File"
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ py: 1.5 }}>
                          {client.start_date}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Chip
                            label={client.status}
                            size="small"
                            color={
                              client.status === "Closed Won"
                                ? "success"
                                : "default"
                            }
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            {/* 👁 View */}
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => {
                                setViewClient(client);
                                setOpenViewDialog(true);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>

                            {/* ✏ Edit */}
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => {
                                setCurrentClient(client);
                                setDialogMode("edit");
                                setOpenDialog(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            {/* 🗑 Delete */}
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(client.client_guid)}
                            >
                              <DeleteIcon color="error" fontSize="small" />
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
              count={clients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Box>

      {/* ADD / EDIT CLIENT MODAL */}
      <ClientFormModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        leads={leads}
        clients={clients}
        initialData={currentClient}
        mode={dialogMode}
      />

      {/* VIEW CLIENT DETAILS MODAL */}
      <ClientDetailsModal
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        client={viewClient}
        onEdit={() => {
          setOpenViewDialog(false);
          setCurrentClient(viewClient);
          setDialogMode("edit");
          setOpenDialog(true);
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </>
  );
};

export default Clients;
