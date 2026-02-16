import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    Box,
    useTheme,
    useMediaQuery,
    Typography,
    IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Security as RoleIcon,
    ToggleOn as StatusIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const ROLES = [
    'Super Admin',
    'Admin',
    'Manager',
    'Telecaller',
    'Finance'
];

const UserFormModal = ({ open, onClose, onSave, initialData, mode }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        status: 'Active'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    name: initialData.name || '',
                    email: initialData.email || '',
                    password: '', // Password not shown on edit
                    role: initialData.role || '',
                    status: initialData.status || 'Active'
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: '',
                    status: 'Active'
                });
            }
            setErrors({});
        }
    }, [open, mode, initialData]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? (checked ? 'Active' : 'Inactive') : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (mode === 'add' && !formData.password.trim()) {
            newErrors.password = 'Password is required';
        }

        if (!formData.role) newErrors.role = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    // Card wrapper for inputs
    const InputCard = ({ label, icon, children, sx }) => (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: '0 4px 12px rgba(61, 82, 160, 0.08)'
                },
                ...sx
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 0.5,
                    borderRadius: '6px'
                }}>
                    {React.cloneElement(icon, { fontSize: 'small' })}
                </Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {children}
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '840px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 4,
                py: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Montserrat', color: '#0f172a' }}>
                    {mode === 'add' ? 'Add New User' : 'Edit User'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4, bgcolor: '#f8f9fc' }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gridTemplateRows: { md: 'repeat(3, 1fr)' }, // 3 equal rows on desktop
                    gap: 3
                }}>
                    {/* Row 1 Col 1: Full Name */}
                    <InputCard label="Full Name" icon={<PersonIcon />}>
                        <TextField
                            fullWidth
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 1 Col 2: Email Address */}
                    <InputCard label="Email Address" icon={<EmailIcon />}>
                        <TextField
                            fullWidth
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 2 Col 1: Password */}
                    <InputCard label="Password" icon={<LockIcon />}>
                        <TextField
                            fullWidth
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            disabled={mode === 'edit'}
                            placeholder={mode === 'edit' ? '(Unchanged)' : ''}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 2 Col 2: Role */}
                    <InputCard label="Role" icon={<RoleIcon />}>
                        <FormControl fullWidth error={!!errors.role}>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                sx={{ height: '48px' }}
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </InputCard>

                    {/* Row 3 Col 1: Status */}
                    <InputCard label="User Status" icon={<StatusIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '48px' }}>
                            <Switch
                                checked={formData.status === 'Active'}
                                onChange={handleChange}
                                name="status"
                                color="success"
                            />
                            <Typography variant="body1" fontWeight={500} sx={{ ml: 1 }}>
                                {formData.status}
                            </Typography>
                        </Box>
                    </InputCard>

                    {/* Row 3 Col 2: Placeholder (Empty) */}
                    <InputCard label="" icon={<Box />} sx={{ opacity: 0, pointerEvents: 'none', display: { xs: 'none', md: 'flex' } }}>
                        {/* Empty card to maintain grid alignment */}
                    </InputCard>

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit" variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', px: 3, height: 44, borderColor: 'divider' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: '8px',
                        px: 4,
                        height: 44,
                        bgcolor: theme.palette.primary.main,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                >
                    Save User
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;
