import React, { useState, useEffect } from 'react';
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
    Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Security as SecurityIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

import PageContainer from '../components/PageContainer';
import DataTableCard from '../components/DataTableCard';
import AddRoleModal from '../components/AddRoleModal';
import ConfirmationDialog from '../components/ConfirmationDialog'; // Assuming this exists based on Users.jsx

// Default Roles Data
const DEFAULT_ROLES = [
    {
        id: 1,
        name: 'Super Admin',
        description: 'Access to all organizations and modules',
        permissions: ['Organization', 'Users', 'Leads', 'Clients', 'Budgets', 'Reports', 'Settings'],
        usersCount: 2,
        isSystem: true // Prevent deletion of system roles
    },
    {
        id: 2,
        name: 'Admin',
        description: 'Manage leads and team within own organization',
        permissions: ['Users', 'Leads', 'Clients', 'Reports'],
        usersCount: 5,
        isSystem: true
    },
    {
        id: 3,
        name: 'Manager',
        description: 'Approve budgets',
        permissions: ['Leads', 'Budgets', 'Reports'],
        usersCount: 8,
        isSystem: false
    },
    {
        id: 4,
        name: 'Telecaller',
        description: 'Manage assigned leads only',
        permissions: ['Assigned Leads', 'Followups'],
        usersCount: 12,
        isSystem: false
    },
    {
        id: 5,
        name: 'Finance',
        description: 'Approve budget finalization',
        permissions: ['Budgets', 'Reports'],
        usersCount: 3,
        isSystem: false
    }
];

const ROLES_STORAGE_KEY = 'crm_roles_data';

const Roles = () => {
    const theme = useTheme();

    // State
    const [roles, setRoles] = useState(() => {
        const saved = localStorage.getItem(ROLES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_ROLES;
    });

    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    // Persist roles
    useEffect(() => {
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
    }, [roles]);

    // Handle Add or Update Role
    const handleSaveRole = (roleData) => {
        if (roleData.id) {
            // Update existing role
            setRoles(prevRoles => prevRoles.map(role =>
                role.id === roleData.id ? { ...role, ...roleData } : role
            ));
        } else {
            // Add new role
            const newRole = {
                id: Date.now(),
                ...roleData,
                isSystem: false
            };
            setRoles([...roles, newRole]);
        }
        setOpenRoleModal(false);
        setEditRole(null);
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

    const confirmDelete = () => {
        if (roleToDelete) {
            setRoles(roles.filter(r => r.id !== roleToDelete.id));
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
                        backgroundColor: '#3D52A0',
                        color: 'white',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(61, 82, 160, 0.2)',
                        '&:hover': {
                            backgroundColor: '#2F3E80'
                        }
                    }}
                >
                    Add Role
                </Button>
            }
        >
            <DataTableCard>
                {roles.length === 0 ? (
                    // Empty State
                    <Box sx={{
                        p: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            color: theme.palette.primary.main
                        }}>
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
                            onClick={() => setOpenAddModal(true)}
                        >
                            Create First Role
                        </Button>
                    </Box>
                ) : (
                    // Roles Table
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Role Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Permissions</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2, textAlign: 'right' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        hover
                                        sx={{
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                                {role.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 2, maxWidth: 200 }}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {role.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {role.permissions.slice(0, 4).map((perm, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={perm}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha('#3D52A0', 0.1),
                                                            color: '#3D52A0',
                                                            borderRadius: '6px',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem',
                                                            height: '24px'
                                                        }}
                                                    />
                                                ))}
                                                {role.permissions.length > 4 && (
                                                    <Tooltip title={role.permissions.slice(4).join(', ')}>
                                                        <Chip
                                                            label={`+${role.permissions.length - 4}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'grey.100',
                                                                color: 'text.secondary',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                height: '24px'
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2, textAlign: 'right' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditClick(role)}
                                                    sx={{
                                                        color: 'action.active',
                                                        '&:hover': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <Tooltip title={role.isSystem ? "Cannot delete system role" : "Delete Role"}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteClick(role)}
                                                            disabled={role.isSystem}
                                                            sx={{
                                                                color: role.isSystem ? 'action.disabled' : 'error.main',
                                                                '&:hover': {
                                                                    bgcolor: role.isSystem ? 'transparent' : alpha(theme.palette.error.main, 0.1)
                                                                }
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
