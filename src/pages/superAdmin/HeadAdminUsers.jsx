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
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

import PageContainer from "../../components/PageContainer";
import DataTableCard from "../../components/DataTableCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import UserFormModal from "../../components/UserFormModal";
import adminUsersData from "../../data/adminUsers.json";

const ADMIN_USERS_STORAGE_KEY = "crm_admin_users_v1";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit' | 'view'
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("crm_user"));
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost/crm/users.php?role=Admin",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error("Failed to fetch users:", data.error);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setCurrentUser(user);
    setOpenModal(true);
  };

  const handleSaveUser = async (formData) => {
    const user = JSON.parse(localStorage.getItem("crm_user"));
    if (!user || !user.token) return;

    const method = modalMode === "add" ? "POST" : "PUT";
    const body = {
      ...formData,
      role_name: "Admin",
    };

    if (modalMode === "edit" && currentUser) {
      body.user_guid = currentUser.user_guid;
    }

    try {
      const response = await fetch(
        "http://localhost/crm/users.php",
        {
          method,
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();

      if (data.success) {
        fetchUsers();
        setOpenModal(false);
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (userToDelete) => {
    // Enforce Soft Delete Logic - Visual check only, backend also enforces logic if needed, but here we check status
    if (userToDelete.status === "Active") {
      alert(
        "Only Inactive Admins can be deleted. Please deactivate the Admin before deleting.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this Admin?")) {
      const user = JSON.parse(localStorage.getItem("crm_user"));
      if (!user || !user.token) return;

      try {
        const response = await fetch(
          "http://localhost/crm/users.php",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_guid: userToDelete.user_guid }),
          },
        );

        const data = await response.json();
        if (data.success) {
          fetchUsers(); // Refresh list
        } else {
          alert(data.error || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred during deletion.");
      }
    }
  };

  if (loading)
    return (
      <LoadingSpinner
        loading={true}
        mode="centered"
        message="Loading Admins..."
      />
    );

  return (
    <PageContainer
      title="Admin Management"
      subtitle="View and manage Admin credentials."
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal("add")}
          sx={{ backgroundColor: "#3e2929" }}
        >
          Add Admin
        </Button>
      }
    >
      <DataTableCard>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Admin Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.user_guid} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === "Active" ? "success" : "error"}
                          sx={{ minWidth: "80px", fontWeight: 600 }}
                        />
                        {user.status === "Inactive" && user.inactiveReason && (
                          <Tooltip
                            title={`Reason: ${user.inactiveReason}`}
                            arrow
                          >
                            <InfoIcon
                              sx={{
                                fontSize: 18,
                                color: "text.secondary",
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleOpenModal("view", user)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenModal("edit", user)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user)}
                        disabled={user.status === "Active"}
                        title={
                          user.status === "Active"
                            ? "Deactivate to delete"
                            : "Delete Admin"
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No Admins found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </DataTableCard>

      <UserFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSaveUser}
        initialData={currentUser}
        mode={modalMode}
      />
    </PageContainer>
  );
};

export default Users;
