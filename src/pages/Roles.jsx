import React, { useState, useEffect } from "react";
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
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import PageContainer from "../components/PageContainer";
import DataTableCard from "../components/DataTableCard";
import AddRoleModal from "../components/AddRoleModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import apiEndpoints from "../apiconfig";

const Roles = () => {
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

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

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
          id: r.role_guid,
          role_guid: r.role_guid,
          name: r.role_name,
          role_name: r.role_name,
          description: r.description,
          isSystem: r.is_system == 1,
          is_active: r.is_active,
          permissions: r.permissions ? r.permissions.map((p) => p.module) : [],
          rawPermissions: r.permissions,
        }));
        setRoles(mappedRoles);
      }
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      const apiData = {
        role_name: roleData.name,
        description: roleData.description,
        is_active: 1,
        permissions: roleData.permissions.map((module) => ({
          module: module,
          view: 1,
          edit: 1,
          delete: 1,
          full_access: 1,
        })),
      };

      if (editRole) {
        await fetch(apiEndpoints.roles, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ ...apiData, role_guid: editRole.role_guid }),
        });
      } else {
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
    if (role.isSystem) return;
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
          }
        );

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Malformed JSON response from server:", responseText);
          alert(
            "The server returned an invalid response. Please check the console for details."
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer
      title="Roles & Permissions"
      subtitle="Manage roles and permissions"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Role
        </Button>
      }
    >
      <DataTableCard>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 600 }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {role.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {role.permissions.slice(0, 4).map((perm, idx) => (
                          <Chip
                            key={idx}
                            label={perm}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: "6px",
                              fontSize: "0.75rem",
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
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(role)}
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
                              color="error"
                              onClick={() => handleDeleteClick(role)}
                              disabled={role.isSystem}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No roles found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={roles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DataTableCard>

      <AddRoleModal
        open={openRoleModal}
        roleToEdit={editRole}
        onClose={() => setOpenRoleModal(false)}
        onSave={handleSaveRole}
      />

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
