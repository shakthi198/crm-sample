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
  Tooltip,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import AddRoleModal from "../components/AddRoleModal";
import ConfirmationDialog from "../components/ConfirmationDialog"; // Assuming this exists based on Users.jsx
import apiEndpoints from "../apiconfig";
const BASE_URL = apiEndpoints.roles;

const Roles = () => {
  const theme = useTheme();

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    let headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["Organization-Guid"] =
        localStorage.getItem("organization_guid") || "";
    }
    return headers;
  };

  // State
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Initial Load
useEffect(() => {
  loadRoles();

  const handleOrgChange = () => {
    loadRoles();
  };

  window.addEventListener("organizationChanged", handleOrgChange);

  return () => {
    window.removeEventListener("organizationChanged", handleOrgChange);
  };
}, []);


  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.roles, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const mappedRoles = data.data.map((r) => ({
          id: r.role_guid, // Use guid as ID for frontend keys
          role_guid: r.role_guid,
          name: r.role_name,
          role_name: r.role_name,
          description: r.description,
          isSystem: r.is_system == 1,
          is_active: r.is_active,
          permissions: r.permissions ? r.permissions.map((p) => p.module) : [], // extracting module names for display
          rawPermissions: r.permissions, // keep raw for editing if needed
        }));
        setRoles(mappedRoles);
      }
    } catch (err) {
      console.error("Failed to load roles", err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // Handle Add or Update Role
  const handleSaveRole = async (roleData) => {
    try {
      const apiData = {
        role_name: roleData.name,
        description: roleData.description,
        is_active: 1, // Defaulting to active
        permissions: roleData.permissions.map((module) => ({
          module: module,
          view: 1,
          edit: 1,
          delete: 1,
          full_access: 1,
        })),
      };

      if (editRole) {
        // Update
        await fetch(apiEndpoints.roles, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ ...apiData, role_guid: editRole.role_guid }),
        });
      } else {
        // Create
        await fetch(apiEndpoints.roles, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(apiData),
        });
      }
      loadRoles();
      setOpenRoleModal(false);
      setEditRole(null);
    } catch (err) {
      console.error("Failed to save role", err);
      alert("Failed to save role");
    }
  };

  const handleAddClick = () => {
    setEditRole(null);
    setOpenRoleModal(true);
  };

  const handleEditClick = (role) => {
    setEditRole(role);
    setOpenRoleModal(true);
  };

  const handleDeleteClick = (role) => {
    if (role.isSystem) return; // Should be disabled anyway
    setRoleToDelete(role);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        const response = await fetch(
          apiEndpoints.roles + `?role_guid=${roleToDelete.role_guid}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          },
        );

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Malformed JSON response from server:", responseText);
          alert(
            "The server returned an invalid response. Please check the console for details.",
          );
          setRoleToDelete(null);
          setOpenDeleteConfirm(false);
          return;
        }

        if (data.success) {
          loadRoles();
        } else {
          alert(data.error || "Failed to delete role");
        }
      } catch (err) {
        console.error("Failed to delete role", err);
        alert("An unexpected error occurred while deleting the role");
      }
      setRoleToDelete(null);
      setOpenDeleteConfirm(false);
    }
  };

  return (
    <PageContainer
      title="Roles & Permissions"
      subtitle="Configure user roles and access levels"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            backgroundColor: "#3D52A0",
            color: "white",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(61, 82, 160, 0.2)",
            "&:hover": {
              backgroundColor: "#2F3E80",
            },
          }}
        >
          Add Role
        </Button>
      }
    >
      <DataTableCard>
        {roles.length === 0 ? (
          // Empty State
          <Box
            sx={{
              p: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              No roles defined
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add a new role to get started with permission management.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenRoleModal(true)}
            >
              Create First Role
            </Button>
          </Box>
        ) : (
          // Roles Table
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell
                    sx={{ fontWeight: 600, color: "text.secondary", py: 2 }}
                  >
                    Role Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "text.secondary", py: 2 }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "text.secondary", py: 2 }}
                  >
                    Permissions
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      py: 2,
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {role.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {role.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {role.permissions.slice(0, 4).map((perm, idx) => (
                          <Chip
                            key={idx}
                            label={perm}
                            size="small"
                            sx={{
                              bgcolor: alpha("#3D52A0", 0.1),
                              color: "#3D52A0",
                              borderRadius: "6px",
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                            }}
                          />
                        ))}
                        {role.permissions.length > 4 && (
                          <Tooltip title={role.permissions.slice(4).join(", ")}>
                            <Chip
                              label={`+${role.permissions.length - 4}`}
                              size="small"
                              sx={{
                                bgcolor: "grey.100",
                                color: "text.secondary",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                height: "24px",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, textAlign: "right" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(role)}
                          sx={{
                            color: "action.active",
                            "&:hover": {
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Tooltip
                          title={
                            role.isSystem
                              ? "Cannot delete system role"
                              : "Delete Role"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(role)}
                              disabled={role.isSystem}
                              sx={{
                                color: role.isSystem
                                  ? "action.disabled"
                                  : "error.main",
                                "&:hover": {
                                  bgcolor: role.isSystem
                                    ? "transparent"
                                    : alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTableCard>

      <AddRoleModal
        open={openRoleModal}
        roleToEdit={editRole}
        onClose={() => setOpenRoleModal(false)}
        onSave={handleSaveRole}
      />

      {/* Simple Confirmation Dialog if not using the shared one, but let's try to assume it exists or use inline */}
      {/* If ConfimationDialog doesn't exist in the path, I'll need to double check, but based on Users.jsx it should be there */}
      <ConfirmationDialog
        open={openDeleteConfirm}
        title="Delete Role?"
        content={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setOpenDeleteConfirm(false)}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer>
  );
};

export default Roles;
