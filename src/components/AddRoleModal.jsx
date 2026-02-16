import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    Checkbox,
    FormControlLabel,
    Divider,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AVAILABLE_PERMISSIONS = [
    'Organization',
    'Users',
    'Leads',
    'Followups',
    'Clients',
    'Budgets',
    'Reports',
    'Settings'
];

const AddRoleModal = ({ open, onClose, onSave, roleToEdit }) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // Populate state when opening
    React.useEffect(() => {
        if (open) {
            if (roleToEdit) {
                setRoleName(roleToEdit.name);
                setDescription(roleToEdit.description);
                setSelectedPermissions(roleToEdit.permissions || []);
            } else {
                setRoleName('');
                setDescription('');
                setSelectedPermissions([]);
            }
        }
    }, [open, roleToEdit]);

    const handlePermissionChange = (permission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSave = () => {
        if (!roleName.trim()) return; // Basic validation
        onSave({
            id: roleToEdit ? roleToEdit.id : undefined,
            name: roleName,
            description,
            permissions: selectedPermissions,
            usersCount: roleToEdit ? roleToEdit.usersCount : 0 // Preserve count if editing
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" fontWeight={600}>
                    {roleToEdit ? 'Edit Role' : 'Add New Role'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Role Name"
                            fullWidth
                            variant="outlined"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Box>

                    <Divider textAlign="left">Permissions</Divider>

                    {/* Permissions Grid */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',              // Mobile: 1 column
                            sm: 'repeat(2, 1fr)',   // Tablet: 2 columns
                            md: 'repeat(3, 1fr)'    // Desktop: 3 columns
                        },
                        gap: 2
                    }}>
                        {AVAILABLE_PERMISSIONS.map((perm) => (
                            <Box
                                key={perm}
                                onClick={() => handlePermissionChange(perm)}
                                sx={{
                                    p: 2,
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: selectedPermissions.includes(perm) ? '#3D52A0' : 'divider',
                                    bgcolor: selectedPermissions.includes(perm) ? 'rgba(61, 82, 160, 0.04)' : 'background.paper',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#3D52A0',
                                        bgcolor: 'rgba(61, 82, 160, 0.04)'
                                    },
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedPermissions.includes(perm)}
                                            onChange={() => handlePermissionChange(perm)}
                                            sx={{
                                                color: '#8697C4',
                                                '&.Mui-checked': { color: '#3D52A0' }
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body1" fontWeight={500} color={selectedPermissions.includes(perm) ? '#3D52A0' : 'text.primary'}>
                                            {perm}
                                        </Typography>
                                    }
                                    sx={{ m: 0, width: '100%', pointerEvents: 'none' }} // Pointer events handled by parent Box
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: 'text.secondary',
                        borderColor: 'divider',
                        '&:hover': { borderColor: 'text.secondary', bgcolor: 'transparent' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disableElevation
                    sx={{
                        bgcolor: '#3D52A0',
                        color: '#fff',
                        '&:hover': { bgcolor: '#2F3E80' }
                    }}
                >
                    {roleToEdit ? 'Update Role' : 'Save Role'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddRoleModal;
