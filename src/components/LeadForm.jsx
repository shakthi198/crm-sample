import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    MenuItem,
    FormControl,
    Select,
    useTheme,
    useMediaQuery,
    IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Label as LabelIcon,
    AssignmentInd as AssignedIcon,
    Notes as NotesIcon,
    Close as CloseIcon,
    Source as SourceIcon,
    AssignmentTurnedIn as StatusIcon
} from '@mui/icons-material';

import leadsData from '../data/leads.json';

const STATUS_OPTIONS = [...new Set(leadsData.map(lead => lead.status))];
const SOURCE_OPTIONS = [...new Set(leadsData.map(lead => lead.source))];
const ASSIGNED_TO_OPTIONS = [...new Set(leadsData.map(lead => lead.assigned_to))];

const LeadForm = ({ open, onClose, onSave, initialData, mode }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // State uses 'name' and 'assignedTo' to match the user's JSX
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: STATUS_OPTIONS[0] || 'New',
        source: SOURCE_OPTIONS[0] || 'Website',
        assignedTo: '',
        remarks: ''
    });

    const [errors, setErrors] = useState({});

    // Reset form when dialog opens or initialData changes
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                // Map back from data model to form state
                setFormData({
                    ...initialData,
                    name: initialData.client_name || '',
                    assignedTo: initialData.assigned_to || ''
                });
            } else {
                setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    status: STATUS_OPTIONS[0] || 'New',
                    source: SOURCE_OPTIONS[0] || 'Website',
                    assignedTo: '',
                    remarks: ''
                });
            }
            setErrors({});
        }
    }, [open, mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        let tempErrors = {};
        tempErrors.name = formData.name ? "" : "Client Name is required.";
        tempErrors.company = formData.company ? "" : "Company is required.";
        tempErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "" : "Valid email is required.";
        tempErrors.phone = /^[0-9+\s-]{10,15}$/.test(formData.phone) ? "" : "Valid phone number (10-15 digits) required.";
        tempErrors.status = formData.status ? "" : "Status is required.";
        tempErrors.source = formData.source ? "" : "Source is required.";
        tempErrors.assignedTo = formData.assignedTo ? "" : "Assigned To is required.";

        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleSubmit = () => {
        if (validateForm()) {
            // Map form state back to data model
            const submissionData = {
                ...formData,
                client_name: formData.name,
                assigned_to: formData.assignedTo
            };
            // Remove the temporary form keys if desired, or keep them. 
            // For safety, we keep them but ensure the required keys are present.
            onSave(submissionData);
        }
    };

    // Card wrapper for inputs
    const InputCard = ({ label, icon, children }) => (
        <Box sx={{
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
            }
        }}>
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
            <Box sx={{ flexGrow: 1 }}>
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
                    {mode === 'add' ? 'Add New Lead' : 'Edit Lead Details'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4, bgcolor: '#f8f9fc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

                    {/* Row 1 */}
                    <InputCard label="Client Name" icon={<PersonIcon />}>
                        <TextField
                            fullWidth
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            placeholder="Enter client name"
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    <InputCard label="Company" icon={<BusinessIcon />}>
                        <TextField
                            fullWidth
                            name="company"
                            value={formData.company || ''}
                            onChange={handleChange}
                            error={!!errors.company}
                            helperText={errors.company}
                            placeholder="Enter company name"
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 2 */}
                    <InputCard label="Email Address" icon={<EmailIcon />}>
                        <TextField
                            fullWidth
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            placeholder="Enter email address"
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    <InputCard label="Phone Number" icon={<PhoneIcon />}>
                        <TextField
                            fullWidth
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            placeholder="Enter phone number"
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 3 */}
                    <InputCard label="Status" icon={<StatusIcon />}>
                        <TextField
                            select
                            fullWidth
                            name="status"
                            value={formData.status || ''}
                            onChange={handleChange}
                            error={!!errors.status}
                            helperText={errors.status}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </InputCard>

                    <InputCard label="Source" icon={<SourceIcon />}>
                        <TextField
                            select
                            fullWidth
                            name="source"
                            value={formData.source || ''}
                            onChange={handleChange}
                            error={!!errors.source}
                            helperText={errors.source}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        >
                            {SOURCE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </InputCard>

                    {/* Row 4 */}
                    <InputCard label="Assign To" icon={<AssignedIcon />}>
                        <TextField
                            select
                            fullWidth
                            name="assignedTo"
                            value={formData.assignedTo || ''}
                            onChange={handleChange}
                            error={!!errors.assignedTo}
                            helperText={errors.assignedTo}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        >
                            {ASSIGNED_TO_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </InputCard>

                    {/* Remarks - Now in Row 4 Col 2 */}
                    <InputCard label="Remarks" icon={<NotesIcon />}>
                        <TextField
                            fullWidth
                            name="remarks"
                            value={formData.remarks || ''}
                            onChange={handleChange}
                            placeholder="Enter remarks"
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                </Box>
            </DialogContent>

            {/* Action Buttons */}
            <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    sx={{
                        height: 44,
                        px: 3,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'divider',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'divider'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disableElevation
                    sx={{
                        height: 44,
                        px: 4,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: theme.palette.primary.main,
                        '&:hover': {
                            bgcolor: theme.palette.primary.dark
                        }
                    }}
                >
                    {mode === 'add' ? 'Add Lead' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeadForm;
