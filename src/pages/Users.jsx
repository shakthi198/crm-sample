import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import UserFormModal from "../components/UserFormModal";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useAuth } from "../context/AuthContext";
import apiEndpoints from "../apiconfig";
const BASE_URL = apiEndpoints.baseUrl;

const Users = () => {
  const theme = useTheme();
  const { user } = useAuth(); // rename to avoid conflict with users list

  const getHeaders = () => {
    let headers = { "Content-Type": "application/json" };
    if (user && user.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
      headers["Organization-Guid"] =
        localStorage.getItem("organization_guid") || "";
    }
    return headers;
  };

  // ... (rest of state initialization)
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [currentUser, setCurrentUser] = useState(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Users
  useEffect(() => {
    loadUsers();
    loadRoles();
      const handleOrgChange = () => {
        loadUsers();
        loadRoles();
      };

      window.addEventListener("organizationChanged", handleOrgChange);

      return () => {
        window.removeEventListener("organizationChanged", handleOrgChange);
      };
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch(apiEndpoints.roles, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load roles", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.users, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Map to frontend structure
        const mappedPoints = data.data.map((u) => ({
          id: u.user_guid,
          name: u.name || "Unknown",
          email: u.email || "No Email",
          role: u.role_name || "User",
          role_guid: u.role_guid,
          status: u.status || (u.is_active == 1 ? "Active" : "Inactive"),
          user_guid: u.user_guid,
          organization_guid: u.organization_guid,
        }));
        console.log("Mapped users:", mappedPoints);
        setUsers(mappedPoints);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setModalMode("add");
    setCurrentUser(null);
    setOpenModal(true);
  };

  const handleEditClick = (userToEdit) => {
    setModalMode("edit");
    setCurrentUser(userToEdit);
    setOpenModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenConfirm(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      if (modalMode === "add") {
        await fetch(apiEndpoints.create, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(apiEndpoints.users, {
          method: "POST", // Backend often uses POST for updates
          headers: getHeaders(),
          body: JSON.stringify({
            ...formData,
            user_guid: currentUser.user_guid,
          }),
        });
      }
      loadUsers();
      setOpenModal(false);
    } catch (error) {
      console.error("Failed to save user", error);
      alert("Error saving user");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await fetch(`${apiEndpoints.users}?user_guid=${deleteId}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        loadUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Error deleting user");
      }
      setOpenConfirm(false);
      setDeleteId(null);
    }
  };

  // Role-based UI logic
  const canAddUser = user?.role === "Super Admin" || user?.role === "Admin";
  const canEditDelete = user?.role === "Super Admin" || user?.role === "Admin";
  if (loading) {
    return (
      <LoadingSpinner
        loading={true}
        mode="centered"
        message="Loading users..."
      />
    );
  }

  return (
    <PageContainer
      title="Users"
      subtitle="Manage system users and their access."
      action={
        canAddUser && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              background: theme.palette.primary.main,
              "&:hover": { background: theme.palette.primary.dark },
              boxShadow: `0 4px 12px ${theme.palette.primary.light}80`,
              borderRadius: "8px",
              px: 3,
            }}
          >
            Add User
          </Button>
        )
      }
    >
      <DataTableCard>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Simple Avatar instead of styled box */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "primary.light",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {row.name ? row.name.charAt(0) : "?"}
                        </Box>
                        {row.name}
                      </Box>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.role}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          minWidth: "100px",
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === "Active" ? "success" : "default"}
                        sx={{
                          fontWeight: 600,
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          minWidth: "100px",
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {canEditDelete && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(row)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DataTableCard>

      <UserFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSaveUser}
        initialData={currentUser}
        mode={modalMode}
        roles={roles}
      />

      <ConfirmationDialog
        open={openConfirm}
        title="Delete User?"
        content="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpenConfirm(false)}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer>
  );
};

export default Users;
